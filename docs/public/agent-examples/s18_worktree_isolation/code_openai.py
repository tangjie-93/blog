#!/usr/bin/env python3
"""
s18: Worktree Isolation — git worktree + task-directory binding + event log.

Run:  python s18_worktree_isolation/code.py
Need: pip install openai python-dotenv + .env with OPENAI_API_KEY

Changes from s17:
  - Task dataclass gains worktree field (str | None)
  - validate_worktree_name: reject path traversal and illegal chars
  - create_worktree: validate name, git worktree add, optional task binding
  - bind_task_to_worktree: write worktree field only, keep task pending
  - remove_worktree: safety check before force, no auto-complete
  - run_git returns (ok, output), events only on success
  - Teammate tools: + complete_task, run in worktree cwd when bound
  - scan_unclaimed_tasks: uses can_start() for dependency checking
  - idle_poll: checks claim result, dispatches shutdown in IDLE
  - consume_lead_inbox: unified inbox consumer
  - 3 new Lead tools: create_worktree, remove_worktree, keep_worktree

ASCII topology:
  Main repo (/)
    ├── .worktrees/auth/  (branch: wt/auth)  ← Task #1
    ├── .worktrees/ui/    (branch: wt/ui)     ← Task #2
    ├── .tasks/task_xxx.json (worktree: "auth")
    └── .worktrees/events.jsonl
"""

import os
import sys, subprocess, json, time, random, threading, re
from pathlib import Path
from datetime import datetime
from dataclasses import dataclass, asdict, field

try:
    import readline

    readline.parse_and_bind("set bind-tty-special-chars off")
except ImportError:
    pass

# ── Shared utilities (common/) ──────────────────────────
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from common.utils import (
    as_input_item,
    call_args,
    extract_text,
    function_calls,
    parse_arguments,
    _normalize_todos,
)
from common.tools import (
    configure as tools_configure,
    run_bash,
    run_edit,
    run_glob,
    run_read,
    run_todo_write,
    run_write,
    safe_path,
)

from openai import OpenAI
from dotenv import load_dotenv

load_dotenv(override=True)
client_kwargs = {}
if os.getenv("OPENAI_BASE_URL"):
    client_kwargs["base_url"] = os.environ["OPENAI_BASE_URL"]

WORKDIR = Path.cwd()
tools_configure(WORKDIR)
client = OpenAI(**client_kwargs)
MODEL = os.getenv("OPENAI_MODEL", "gpt-5.5")
EXECUTION_LOG = Path(__file__).resolve().parent / "s18_execution.log"


_trace_index = 0
_trace_lock = threading.Lock()
_log_write_failure_reported = False


def actor_label(actor: str) -> str:
    """返回用于控制台和日志文件的角色标签。"""
    return "Lead/主线程" if actor.lower() == "lead" else f"Teammate/{actor}/后台线程"


def _fallback_log_path() -> Path:
    """生成当前进程的备用日志路径。"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
    return EXECUTION_LOG.with_name(f"{EXECUTION_LOG.stem}_{timestamp}.log")


def _append_execution_log(content: str):
    """追加日志；当当前文件被占用时自动切换到备用文件。"""
    global EXECUTION_LOG, _log_write_failure_reported
    try:
        with EXECUTION_LOG.open("a", encoding="utf-8") as log_file:
            log_file.write(content)
        return
    except OSError:
        EXECUTION_LOG = _fallback_log_path()

    try:
        with EXECUTION_LOG.open("a", encoding="utf-8") as log_file:
            log_file.write(content)
        print(f"日志文件被占用，已切换到：{EXECUTION_LOG}")
    except OSError as error:
        if not _log_write_failure_reported:
            print(f"日志写入失败，后续仅输出到控制台：{error}")
            _log_write_failure_reported = True


def write_execution_log(content: str):
    """以线程安全方式追加完整执行日志。"""
    with _trace_lock:
        _append_execution_log(content)


def trace(actor: str, event: str):
    """按发生顺序输出智能体生命周期事件。"""
    global _trace_index
    with _trace_lock:
        _trace_index += 1
        message = f"{_trace_index}. {actor_label(actor)} {event}"
        print(message)
        _append_execution_log(f"[{datetime.now():%H:%M:%S}] {message}\n")


def record_model_response(actor: str, response):
    """把模型非推理输出写入日志。"""
    outputs = []
    for item in response.output:
        data = item if isinstance(item, dict) else item.model_dump()
        if data.get("type") in {"reasoning", "rerasong"}:
            continue
        outputs.append(data)
    if outputs:
        payload = json.dumps(outputs, ensure_ascii=False, indent=2, default=str)
        write_execution_log(
            f"\n[{datetime.now():%H:%M:%S}] {actor_label(actor)} 模型返回\n"
            f"{payload}\n"
        )


def record_tool_result(actor: str, name: str, output):
    """把工具原始结果写入日志。"""
    payload = json.dumps(output, ensure_ascii=False, indent=2, default=str)
    write_execution_log(
        f"\n[{datetime.now():%H:%M:%S}] {actor_label(actor)} 工具结果：{name}\n"
        f"{payload}\n"
    )


def reset_execution_log():
    """清空当前进程的执行日志文件。"""
    global EXECUTION_LOG
    with _trace_lock:
        try:
            EXECUTION_LOG.write_text("", encoding="utf-8")
        except OSError:
            EXECUTION_LOG = _fallback_log_path()
            _append_execution_log("")


def format_tool_call(name: str, arguments: dict) -> str:
    """把工具名和参数压缩成单行。"""
    values = []
    for value in arguments.values():
        rendered = json.dumps(value, ensure_ascii=False, default=str)
        values.append(rendered if len(rendered) <= 80 else f"{rendered[:77]}...")
    return f"{name}({', '.join(values)})"


def format_tool_result(name: str, output) -> str:
    """把工具返回值压缩成适合控制台的状态行。"""
    text = str(output)
    if text.startswith("Error:"):
        return f"WORK: {name} 失败：{text[:120]}"
    return f"WORK: {name} 完成"

# ── Task System (from s12 + s18 worktree field) ──

TASKS_DIR = WORKDIR / ".tasks"
TASKS_DIR.mkdir(exist_ok=True)


@dataclass
class Task:
    id: str
    subject: str
    description: str
    status: str
    owner: str | None
    blockedBy: list[str]
    worktree: str | None = None  # s18: bound worktree name


def _task_path(task_id: str) -> Path:
    """返回指定任务对应的 JSON 文件路径。"""
    return TASKS_DIR / f"{task_id}.json"


def create_task(
    subject: str, description: str = "", blockedBy: list[str] | None = None
) -> Task:
    """创建待处理任务并持久化到任务目录。"""
    task = Task(
        id=f"task_{int(time.time())}_{random.randint(0, 9999):04d}",
        subject=subject,
        description=description,
        status="pending",
        owner=None,
        blockedBy=blockedBy or [],
    )
    save_task(task)
    return task


def save_task(task: Task):
    """将任务对象序列化并写入对应的 JSON 文件。"""
    _task_path(task.id).write_text(json.dumps(asdict(task), indent=2))


def load_task(task_id: str) -> Task:
    """从磁盘读取指定任务。"""
    return Task(**json.loads(_task_path(task_id).read_text()))


def list_tasks() -> list[Task]:
    """读取并返回当前任务目录中的全部任务。"""
    return [
        Task(**json.loads(p.read_text())) for p in sorted(TASKS_DIR.glob("task_*.json"))
    ]


def get_task_json(task_id: str) -> str:
    """以格式化 JSON 字符串返回任务详情。"""
    task = load_task(task_id)
    return json.dumps(asdict(task), indent=2)


def can_start(task_id: str) -> bool:
    """检查任务的全部前置依赖是否已完成。"""
    task = load_task(task_id)
    for dep_id in task.blockedBy:
        if not _task_path(dep_id).exists():
            return False
        if load_task(dep_id).status != "completed":
            return False
    return True


def claim_task(task_id: str, owner: str = "agent") -> str:
    """认领可开始的待处理任务，并将其状态改为进行中。"""
    task = load_task(task_id)
    if task.status != "pending":
        return f"Task {task_id} is {task.status}, cannot claim"
    if task.owner:
        return f"Task {task_id} already owned by {task.owner}"
    if not can_start(task_id):
        deps = [
            d
            for d in task.blockedBy
            if _task_path(d).exists() and load_task(d).status != "completed"
        ]
        missing = [d for d in task.blockedBy if not _task_path(d).exists()]
        parts = []
        if deps:
            parts.append(f"blocked by: {deps}")
        if missing:
            parts.append(f"missing deps: {missing}")
        return "Cannot start — " + ", ".join(parts)
    task.owner = owner
    task.status = "in_progress"
    save_task(task)
    print(f"  \033[36m[claim] {task.subject} → in_progress\033[0m")
    return f"Claimed {task.id} ({task.subject})"


def complete_task(task_id: str) -> str:
    """完成进行中的任务，并返回因此解除阻塞的任务信息。"""
    task = load_task(task_id)
    if task.status != "in_progress":
        return f"Task {task_id} is {task.status}, cannot complete"
    task.status = "completed"
    save_task(task)
    unblocked = [
        t.subject
        for t in list_tasks()
        if t.status == "pending" and t.blockedBy and can_start(t.id)
    ]
    print(f"  \033[32m[complete] {task.subject} ✓\033[0m")
    msg = f"Completed {task.id} ({task.subject})"
    if unblocked:
        msg += f"\nUnblocked: {', '.join(unblocked)}"
    return msg


# ── Worktree System (s18 new) ──

WORKTREES_DIR = WORKDIR / ".worktrees"
WORKTREES_DIR.mkdir(exist_ok=True)

VALID_WT_NAME = re.compile(r"^[A-Za-z0-9._-]{1,64}$")


def validate_worktree_name(name: str) -> str | None:
    """校验工作树名称；合法时返回 None，否则返回错误信息。"""
    if not name:
        return "Worktree name cannot be empty"
    if name == "." or name == "..":
        return f"'{name}' is not a valid worktree name"
    if not VALID_WT_NAME.match(name):
        return (
            f"Invalid worktree name '{name}': "
            "only letters, digits, dots, underscores, dashes (1-64 chars)"
        )
    return None


def run_git(args: list[str]) -> tuple[bool, str]:
    """在主工作目录执行 Git 命令，返回是否成功及命令输出。"""
    try:
        # ["git"] + args 是 Python 列表拼接，会生成一个新列表。
        r = subprocess.run(
            ["git"] + args, cwd=WORKDIR, capture_output=True, text=True, timeout=30
        )
        out = (r.stdout + r.stderr).strip()
        out = out[:5000] if out else "(no output)"
        return r.returncode == 0, out
    except subprocess.TimeoutExpired:
        return False, "Error: git timeout"


def log_event(event_type: str, worktree_name: str, task_id: str = ""):
    """将工作树生命周期事件追加写入 events.jsonl。"""
    event = {
        "type": event_type,
        "worktree": worktree_name,
        "task_id": task_id,
        "ts": time.time(),
    }
    events_file = WORKTREES_DIR / "events.jsonl"
    with open(events_file, "a") as f:
        f.write(json.dumps(event) + "\n")


def create_worktree(name: str, task_id: str = "") -> str:
    """创建独立分支的 Git 工作树，并可选地绑定到任务。"""
    err = validate_worktree_name(name)
    if err:
        return f"Error: {err}"
    path = WORKTREES_DIR / name
    if path.exists():
        return f"Worktree '{name}' already exists at {path}"
    ok, result = run_git(["worktree", "add", str(path), "-b", f"wt/{name}", "HEAD"])
    if not ok:
        return f"Git error: {result}"
    if task_id:
        bind_task_to_worktree(task_id, name)
    log_event("create", name, task_id)
    print(f"  \033[33m[worktree] created: {name} at {path}\033[0m")
    return f"Worktree '{name}' created at {path}"


def bind_task_to_worktree(task_id: str, worktree_name: str):
    """记录任务绑定的工作树名称，保持任务为待认领状态。"""
    task = load_task(task_id)
    task.worktree = worktree_name
    save_task(task)
    print(f"  \033[33m[bind] {task.subject} → worktree:{worktree_name}\033[0m")


def _count_worktree_changes(path: Path) -> tuple[int, int]:
    """统计工作树中的未提交文件数和未推送提交数。"""
    try:
        r1 = subprocess.run(
            ["git", "status", "--porcelain"],
            cwd=path,
            capture_output=True,
            text=True,
            timeout=10,
        )
        files = len([l for l in r1.stdout.strip().splitlines() if l.strip()])
        r2 = subprocess.run(
            ["git", "log", "@{push}..HEAD", "--oneline"],
            cwd=path,
            capture_output=True,
            text=True,
            timeout=10,
        )
        commits = len([l for l in r2.stdout.strip().splitlines() if l.strip()])
        return files, commits
    except Exception:
        return -1, -1


def remove_worktree(name: str, discard_changes: bool = False) -> str:
    """删除工作树；存在变更时需显式允许丢弃才能继续。"""
    err = validate_worktree_name(name)
    if err:
        return err
    path = WORKTREES_DIR / name
    if not path.exists():
        return f"Worktree '{name}' not found"
    if not discard_changes:
        files, commits = _count_worktree_changes(path)
        if files < 0:
            return (
                f"Cannot verify worktree '{name}' status. "
                "Use discard_changes=true to force removal."
            )
        if files > 0 or commits > 0:
            return (
                f"Worktree '{name}' has {files} uncommitted file(s) "
                f"and {commits} unpushed commit(s). "
                "Use discard_changes=true to force removal, "
                "or keep_worktree to preserve for review."
            )
    ok1, _ = run_git(["worktree", "remove", str(path), "--force"])
    if not ok1:
        return f"Failed to remove worktree directory for '{name}'"
    run_git(["branch", "-D", f"wt/{name}"])
    log_event("remove", name)
    print(f"  \033[33m[worktree] removed: {name}\033[0m")
    return f"Worktree '{name}' removed"


def keep_worktree(name: str) -> str:
    """保留工作树及其分支，供人工审查。"""
    err = validate_worktree_name(name)
    if err:
        return err
    log_event("keep", name)
    print(f"  \033[36m[worktree] kept: {name}\033[0m")
    return f"Worktree '{name}' kept for review (branch: wt/{name})"


# ── Prompt Assembly (from s10) ──

PROMPT_SECTIONS = {
    "identity": "You are a coding agent. Act, don't explain.",
    "tools": "Available tools: bash, read_file, write_file, "
    "create_task, list_tasks, get_task, claim_task, complete_task, "
    "spawn_teammate, send_message, check_inbox, "
    "request_shutdown, request_plan, review_plan, "
    "create_worktree, remove_worktree, keep_worktree.",
    "workspace": f"Working directory: {WORKDIR}",
    "memory": "Relevant memories are injected below when available.",
}


def assemble_system_prompt(context: dict) -> str:
    """根据当前上下文拼装系统提示词。"""
    sections = [
        PROMPT_SECTIONS["identity"],
        PROMPT_SECTIONS["tools"],
        PROMPT_SECTIONS["workspace"],
    ]
    if context.get("memories"):
        sections.append(f"Relevant memories:\n{context['memories']}")
    return "\n\n".join(sections)


_last_context_hash, _last_prompt = None, None


def get_system_prompt(context: dict) -> str:
    """获取系统提示词，并在上下文未变化时复用缓存。"""
    global _last_context_hash, _last_prompt
    h = json.dumps(context, sort_keys=True)
    if h == _last_context_hash and _last_prompt:
        return _last_prompt
    _last_context_hash, _last_prompt = h, assemble_system_prompt(context)
    return _last_prompt


# ── MessageBus (from s15) ──

MAILBOX_DIR = WORKDIR / ".mailboxes"
MAILBOX_DIR.mkdir(exist_ok=True)


class MessageBus:
    def send(
        self,
        from_agent: str,
        to_agent: str,
        content: str,
        msg_type: str = "message",
        metadata: dict = None,
    ):
        """向指定智能体的收件箱追加一条消息。"""
        msg = {
            "from": from_agent,
            "to": to_agent,
            "content": content,
            "type": msg_type,
            "ts": time.time(),
            "metadata": metadata or {},
        }
        inbox = MAILBOX_DIR / f"{to_agent}.jsonl"
        with open(inbox, "a") as f:
            f.write(json.dumps(msg) + "\n")
        print(
            f"  \033[33m[bus] {from_agent} → {to_agent}: "
            f"({msg_type}) {content[:50]}\033[0m"
        )

    def read_inbox(self, agent: str) -> list[dict]:
        """读取并清空指定智能体的收件箱。"""
        inbox = MAILBOX_DIR / f"{agent}.jsonl"
        if not inbox.exists():
            return []
        msgs = [
            json.loads(line) for line in inbox.read_text().splitlines() if line.strip()
        ]
        inbox.unlink()
        return msgs


BUS = MessageBus()
active_teammates: dict[str, bool] = {}

# ── Protocol State (from s16) ──


@dataclass
class ProtocolState:
    request_id: str
    type: str
    sender: str
    target: str
    status: str
    payload: str
    created_at: float = field(default_factory=time.time)


pending_requests: dict[str, ProtocolState] = {}


def new_request_id() -> str:
    """生成协议请求的随机标识符。"""
    return f"req_{random.randint(0, 999999):06d}"


def match_response(response_type: str, request_id: str, approve: bool):
    """校验并更新待处理协议请求的审批结果。"""
    state = pending_requests.get(request_id)
    if not state:
        print(f"  \033[31m[protocol] unknown request_id: {request_id}\033[0m")
        return
    if state.type == "shutdown" and response_type != "shutdown_response":
        print(
            f"  \033[31m[protocol] type mismatch: expected shutdown_response, "
            f"got {response_type}\033[0m"
        )
        return
    if state.type == "plan_approval" and response_type != "plan_approval_response":
        print(
            f"  \033[31m[protocol] type mismatch: expected plan_approval_response, "
            f"got {response_type}\033[0m"
        )
        return
    state.status = "approved" if approve else "rejected"
    icon = "✓" if approve else "✗"
    color = "32" if approve else "31"
    print(
        f"  \033[{color}m[protocol] {state.type} {icon} "
        f"({request_id}: {state.status})\033[0m"
    )


def consume_lead_inbox(route_protocol=True) -> list[dict]:
    """读取 Lead 收件箱，并可选地分发协议响应。"""
    msgs = BUS.read_inbox("lead")
    if route_protocol:
        for msg in msgs:
            meta = msg.get("metadata", {})
            req_id = meta.get("request_id", "")
            msg_type = msg.get("type", "")
            if req_id and msg_type.endswith("_response"):
                match_response(msg_type, req_id, meta.get("approve", False))
    return msgs


# ── Autonomous Agent (from s17, + worktree cwd) ──

IDLE_POLL_INTERVAL = 5
IDLE_TIMEOUT = 60


def scan_unclaimed_tasks() -> list[dict]:
    """查找未被认领且已满足依赖条件的待处理任务。"""
    unclaimed = []
    for f in sorted(TASKS_DIR.glob("task_*.json")):
        task = json.loads(f.read_text())
        if (
            task.get("status") == "pending"
            and not task.get("owner")
            and can_start(task["id"])
        ):
            unclaimed.append(task)
    return unclaimed


def idle_poll(agent_name: str, messages: list, name: str, role: str) -> str:
    """在空闲期轮询消息和任务，返回下一步动作状态。"""
    for _ in range(IDLE_TIMEOUT // IDLE_POLL_INTERVAL):
        time.sleep(IDLE_POLL_INTERVAL)

        inbox = BUS.read_inbox(agent_name)
        if inbox:
            for msg in inbox:
                if msg.get("type") == "shutdown_request":
                    req_id = msg.get("metadata", {}).get("request_id", "")
                    BUS.send(
                        name,
                        "lead",
                        "Shutting down gracefully.",
                        "shutdown_response",
                        {"request_id": req_id, "approve": True},
                    )
                    print(
                        f"  \033[35m[protocol] {name} approved shutdown "
                        f"in idle ({req_id})\033[0m"
                    )
                    trace(name, f"IDLE 收到 shutdown 请求 ({req_id})")
                    return "shutdown"

            messages.append(
                {"role": "user", "content": "<inbox>" + json.dumps(inbox) + "</inbox>"}
            )
            print(f"  \033[36m[idle] {name} found inbox messages\033[0m")
            trace(name, f"IDLE 收到 {len(inbox)} 条收件箱消息")
            return "work"

        unclaimed = scan_unclaimed_tasks()
        if unclaimed:
            task_data = unclaimed[0]
            result = claim_task(task_data["id"], agent_name)
            if "Claimed" in result:
                wt_info = ""
                if task_data.get("worktree"):
                    wt_path = WORKTREES_DIR / task_data["worktree"]
                    wt_info = f"\nWork directory: {wt_path}"
                messages.append(
                    {
                        "role": "user",
                        "content": f"<auto-claimed>Task {task_data['id']}: "
                        f"{task_data['subject']}{wt_info}</auto-claimed>",
                    }
                )
                print(
                    f"  \033[32m[idle] {name} auto-claimed: "
                    f"{task_data['subject']}\033[0m"
                )
                trace(name, f"IDLE 自动认领任务：{task_data['subject']}")
                return "work"
            print(f"  \033[33m[idle] {name} claim failed: " f"{result}\033[0m")
            trace(name, f"IDLE 认领失败：{result}")

    print(f"  \033[31m[idle] {name} timeout ({IDLE_TIMEOUT}s)\033[0m")
    trace(name, f"IDLE 超时：{IDLE_TIMEOUT}s")
    return "timeout"


# ── Teammate Thread (from s15 + s16 + s17 + s18) ──


def spawn_teammate_thread(name: str, role: str, prompt: str) -> str:
    """启动自治队友线程，并返回启动结果。"""
    if name in active_teammates:
        return f"Teammate '{name}' already exists"

    system = (
        f"You are '{name}', a {role}. "
        f"Use tools to complete tasks. "
        f"You can list and claim tasks from the board. "
        f"If a task has a worktree, work in that directory."
    )

    def handle_inbox_message(name: str, msg: dict, messages: list):
        """处理队友收到的协议消息，并决定是否停止运行。"""
        msg_type = msg.get("type", "message")
        meta = msg.get("metadata", {})
        req_id = meta.get("request_id", "")

        if msg_type == "shutdown_request":
            BUS.send(
                name,
                "lead",
                "Shutting down gracefully.",
                "shutdown_response",
                {"request_id": req_id, "approve": True},
            )
            print(
                f"  \033[35m[protocol] {name} approved shutdown " f"({req_id})\033[0m"
            )
            return True

        if msg_type == "plan_approval_response":
            approve = meta.get("approve", False)
            if approve:
                messages.append(
                    {
                        "role": "user",
                        "content": "[Plan approved] Proceed with the task.",
                    }
                )
            else:
                messages.append(
                    {
                        "role": "user",
                        "content": f"[Plan rejected] Feedback: {msg['content']}",
                    }
                )
        return False

    def run():
        """执行队友的工作、空闲轮询和结果汇报循环。"""
        # Track current worktree for this teammate's cwd
        wt_ctx = {"path": None}

        def _wt_cwd() -> Path | None:
            """返回队友当前绑定工作树的路径。"""
            p = wt_ctx["path"]
            return Path(p) if p else None

        def _run_bash(command: str) -> str:
            """在当前工作树中执行 Shell 命令。"""
            return run_bash(command, cwd=_wt_cwd())

        def _run_read(path: str) -> str:
            """在当前工作树上下文中读取文件。"""
            return run_read(path, cwd=_wt_cwd())

        def _run_write(path: str, content: str) -> str:
            """在当前工作树上下文中写入文件。"""
            return run_write(path, content, cwd=_wt_cwd())

        def _run_list_tasks():
            """列出任务及其关联的工作树。"""
            tasks = list_tasks()
            if not tasks:
                return "No tasks."
            return "\n".join(
                f"  {t.id}: {t.subject} [{t.status}]"
                + (f" (wt:{t.worktree})" if t.worktree else "")
                for t in tasks
            )

        def _run_claim_task(task_id: str):
            """认领任务，并在需要时切换队友的工作目录。"""
            result = claim_task(task_id, owner=name)
            if "Claimed" in result:
                # Set worktree cwd if task has one
                task = load_task(task_id)
                if task.worktree:
                    wt_ctx["path"] = str(WORKTREES_DIR / task.worktree)
                else:
                    wt_ctx["path"] = None
            return result

        def _run_complete_task(task_id: str):
            """完成任务并清除队友当前的工作树上下文。"""
            task = load_task(task_id)
            result = complete_task(task_id)
            if "Completed" in result and task.worktree:
                BUS.send(
                    name,
                    "lead",
                    (
                        f"Task {task.id} is complete. "
                        f"Please remove worktree '{task.worktree}'."
                    ),
                    "message",
                    {
                        "task_id": task.id,
                        "worktree": task.worktree,
                        "action": "remove_worktree",
                    },
                )
            wt_ctx["path"] = None
            return result

        messages = [{"role": "user", "content": prompt}]
        trace(name, f"线程启动（角色：{role}）")
        sub_tools = [
            {
                "type": "function",
                "name": "bash",
                "description": "Run a shell command.",
                "parameters": {
                    "type": "object",
                    "properties": {"command": {"type": "string"}},
                    "required": ["command"],
                },
            },
            {
                "type": "function",
                "name": "read_file",
                "description": "Read file.",
                "parameters": {
                    "type": "object",
                    "properties": {"path": {"type": "string"}},
                    "required": ["path"],
                },
            },
            {
                "type": "function",
                "name": "write_file",
                "description": "Write file.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "path": {"type": "string"},
                        "content": {"type": "string"},
                    },
                    "required": ["path", "content"],
                },
            },
            {
                "type": "function",
                "name": "send_message",
                "description": "Send message to another agent.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "to": {"type": "string"},
                        "content": {"type": "string"},
                    },
                    "required": ["to", "content"],
                },
            },
            {
                "type": "function",
                "name": "submit_plan",
                "description": "Submit a plan for Lead approval.",
                "parameters": {
                    "type": "object",
                    "properties": {"plan": {"type": "string"}},
                    "required": ["plan"],
                },
            },
            {
                "type": "function",
                "name": "list_tasks",
                "description": "List all tasks on the board.",
                "parameters": {"type": "object", "properties": {}, "required": []},
            },
            {
                "type": "function",
                "name": "claim_task",
                "description": "Claim a pending task.",
                "parameters": {
                    "type": "object",
                    "properties": {"task_id": {"type": "string"}},
                    "required": ["task_id"],
                },
            },
            {
                "type": "function",
                "name": "complete_task",
                "description": "Mark an in-progress task as completed.",
                "parameters": {
                    "type": "object",
                    "properties": {"task_id": {"type": "string"}},
                    "required": ["task_id"],
                },
            },
        ]

        sub_handlers = {
            "bash": _run_bash,
            "read_file": _run_read,
            "write_file": _run_write,
            "send_message": lambda to, content: (BUS.send(name, to, content), "Sent")[
                1
            ],
            "submit_plan": lambda plan: _teammate_submit_plan(name, plan),
            "list_tasks": _run_list_tasks,
            "claim_task": _run_claim_task,
            "complete_task": _run_complete_task,
        }

        # Outer loop: WORK → IDLE cycle
        while True:
            if len(messages) <= 3:
                messages.insert(
                    0,
                    {
                        "role": "user",
                        "content": f"<identity>You are '{name}', role: {role}. "
                        f"Continue your work.</identity>",
                    },
                )

            # WORK phase
            should_shutdown = False
            for _ in range(10):
                inbox = BUS.read_inbox(name)
                for msg in inbox:
                    stopped = handle_inbox_message(name, msg, messages)
                    if stopped:
                        should_shutdown = True
                        break
                if should_shutdown:
                    break
                if inbox and not should_shutdown:
                    non_protocol = [m for m in inbox if m.get("type") == "message"]
                    if non_protocol:
                        messages.append(
                            {
                                "role": "user",
                                "content": "<inbox>"
                                + json.dumps(non_protocol)
                                + "</inbox>",
                            }
                        )

                try:
                    trace(name, "WORK: 调用大模型")
                    response = client.responses.create(
                        model=MODEL,
                        instructions=system,
                        input=messages[-20:],
                        tools=sub_tools,
                        max_output_tokens=8000,
                    )
                except Exception:
                    trace(name, "WORK: 模型请求失败")
                    break
                record_model_response(name, response)
                messages.extend(as_input_item(item) for item in response.output)
                if not function_calls(response):
                    trace(name, "WORK: 没有新的工具调用，进入 IDLE")
                    break
                results = []
                for block in function_calls(response):
                    if block.type == "function_call":
                        arguments = call_args(block)
                        trace(name, f"WORK: {format_tool_call(block.name, arguments)}")
                        handler = sub_handlers.get(block.name)
                        output = handler(**arguments) if handler else "Unknown"
                        trace(name, format_tool_result(block.name, output))
                        record_tool_result(name, block.name, output)
                        results.append(
                            {
                                "type": "function_call_output",
                                "call_id": block.call_id,
                                "output": str(output),
                            }
                        )
                messages.extend(results)

            if should_shutdown:
                break

            # IDLE phase
            idle_result = idle_poll(name, messages, name, role)
            if idle_result == "shutdown":
                break
            if idle_result == "timeout":
                break

        # Summary
        summary = "Done."
        for msg in reversed(messages):
            if msg["role"] == "assistant" and isinstance(msg["content"], list):
                for b in msg["content"]:
                    if getattr(b, "type", None) == "output_text":
                        summary = b.text
                        break
                else:
                    continue
                break
        BUS.send(name, "lead", summary, "result")
        active_teammates.pop(name, None)
        trace(name, "线程结束")
        print(f"  \033[32m[teammate] {name} finished\033[0m")

    active_teammates[name] = True
    threading.Thread(target=run, daemon=True).start()
    print(f"  \033[36m[teammate] {name} spawned as {role}\033[0m")
    return f"Teammate '{name}' spawned as {role} (autonomous)"


def _teammate_submit_plan(from_name: str, plan: str) -> str:
    """创建计划审批请求并发送给 Lead。"""
    req_id = new_request_id()
    pending_requests[req_id] = ProtocolState(
        request_id=req_id,
        type="plan_approval",
        sender=from_name,
        target="lead",
        status="pending",
        payload=plan,
    )
    BUS.send(from_name, "lead", plan, "plan_approval_request", {"request_id": req_id})
    return f"Plan submitted ({req_id}). Waiting for approval..."


# ── Lead Protocol Tools (from s16) ──


def run_request_shutdown(teammate: str) -> str:
    """请求指定队友优雅退出。"""
    req_id = new_request_id()
    pending_requests[req_id] = ProtocolState(
        request_id=req_id,
        type="shutdown",
        sender="lead",
        target=teammate,
        status="pending",
        payload="",
    )
    BUS.send(
        "lead",
        teammate,
        "Please shut down gracefully.",
        "shutdown_request",
        {"request_id": req_id},
    )
    print(f"  \033[35m[protocol] shutdown_request → {teammate} " f"({req_id})\033[0m")
    return f"Shutdown request sent to {teammate} (req: {req_id})"


def run_request_plan(teammate: str, task: str) -> str:
    """通知队友针对指定任务提交执行计划。"""
    BUS.send("lead", teammate, f"Please submit a plan for: {task}", "message")
    return f"Asked {teammate} to submit a plan"


def run_review_plan(request_id: str, approve: bool, feedback: str = "") -> str:
    """审批或驳回队友提交的计划。"""
    state = pending_requests.get(request_id)
    if not state:
        return f"Request {request_id} not found"
    if state.status != "pending":
        return f"Request {request_id} already {state.status}"
    state.status = "approved" if approve else "rejected"
    BUS.send(
        "lead",
        state.sender,
        feedback or ("Approved" if approve else "Rejected"),
        "plan_approval_response",
        {"request_id": request_id, "approve": approve},
    )
    icon = "✓" if approve else "✗"
    print(f"  \033[32m[protocol] plan {icon} ({request_id})\033[0m")
    return f"Plan {'approved' if approve else 'rejected'} ({request_id})"


# ── Lead Worktree Tools (s18 new) ──


def run_create_worktree(name: str, task_id: str = "") -> str:
    """为工具调用转发创建工作树请求。"""
    return create_worktree(name, task_id)


def run_remove_worktree(name: str, discard_changes: bool = False) -> str:
    """为工具调用转发删除工作树请求。"""
    return remove_worktree(name, discard_changes)


def run_keep_worktree(name: str) -> str:
    """为工具调用转发保留工作树请求。"""
    return keep_worktree(name)


# ── Basic tool handlers ──


def run_create_task(
    subject: str, description: str = "", blockedBy: list[str] | None = None
) -> str:
    """创建任务并返回面向工具调用的结果文本。"""
    task = create_task(subject, description, blockedBy)
    deps = f" (blockedBy: {', '.join(blockedBy)})" if blockedBy else ""
    print(f"  \033[34m[create] {task.subject}{deps}\033[0m")
    return f"Created {task.id}: {task.subject}{deps}"


def run_list_tasks() -> str:
    """返回任务列表的可读文本。"""
    tasks = list_tasks()
    if not tasks:
        return "No tasks."
    return "\n".join(
        f"  {t.id}: {t.subject} [{t.status}]"
        + (f" (wt:{t.worktree})" if t.worktree else "")
        for t in tasks
    )


def run_get_task(task_id: str) -> str:
    """返回指定任务的 JSON 详情。"""
    return get_task_json(task_id)


def run_claim_task(task_id: str) -> str:
    """以 Lead 智能体身份认领任务。"""
    return claim_task(task_id, owner="agent")


def run_complete_task(task_id: str) -> str:
    """完成指定任务。"""
    return complete_task(task_id)


def run_spawn_teammate(name: str, role: str, prompt: str) -> str:
    """创建新的自治队友。"""
    return spawn_teammate_thread(name, role, prompt)


def run_send_message(to: str, content: str) -> str:
    """由 Lead 向指定队友发送普通消息。"""
    BUS.send("lead", to, content)
    return f"Sent to {to}"


def run_check_inbox() -> str:
    """读取 Lead 收件箱并格式化返回消息内容。"""
    msgs = consume_lead_inbox(route_protocol=True)
    if not msgs:
        return "(inbox empty)"
    lines = []
    for m in msgs:
        meta = m.get("metadata", {})
        req_id = meta.get("request_id", "")
        tag = f" [{m['type']} req:{req_id}]" if req_id else f" [{m['type']}]"
        lines.append(f"  [{m['from']}]{tag} {m['content'][:200]}")
    return "\n".join(lines)


# ── Tool Definitions ──

TOOLS = [
    {
        "type": "function",
        "name": "bash",
        "description": "Run a shell command.",
        "parameters": {
            "type": "object",
            "properties": {"command": {"type": "string"}},
            "required": ["command"],
        },
    },
    {
        "type": "function",
        "name": "read_file",
        "description": "Read file contents.",
        "parameters": {
            "type": "object",
            "properties": {"path": {"type": "string"}, "limit": {"type": "integer"}},
            "required": ["path"],
        },
    },
    {
        "type": "function",
        "name": "write_file",
        "description": "Write content to a file.",
        "parameters": {
            "type": "object",
            "properties": {"path": {"type": "string"}, "content": {"type": "string"}},
            "required": ["path", "content"],
        },
    },
    {
        "type": "function",
        "name": "create_task",
        "description": "Create a task.",
        "parameters": {
            "type": "object",
            "properties": {
                "subject": {"type": "string"},
                "description": {"type": "string"},
                "blockedBy": {"type": "array", "items": {"type": "string"}},
            },
            "required": ["subject"],
        },
    },
    {
        "type": "function",
        "name": "list_tasks",
        "description": "List all tasks.",
        "parameters": {"type": "object", "properties": {}, "required": []},
    },
    {
        "type": "function",
        "name": "get_task",
        "description": "Get full details of a specific task.",
        "parameters": {
            "type": "object",
            "properties": {"task_id": {"type": "string"}},
            "required": ["task_id"],
        },
    },
    {
        "type": "function",
        "name": "claim_task",
        "description": "Claim a pending task.",
        "parameters": {
            "type": "object",
            "properties": {"task_id": {"type": "string"}},
            "required": ["task_id"],
        },
    },
    {
        "type": "function",
        "name": "complete_task",
        "description": "Complete an in-progress task.",
        "parameters": {
            "type": "object",
            "properties": {"task_id": {"type": "string"}},
            "required": ["task_id"],
        },
    },
    {
        "type": "function",
        "name": "spawn_teammate",
        "description": "Spawn an autonomous teammate agent.",
        "parameters": {
            "type": "object",
            "properties": {
                "name": {"type": "string"},
                "role": {"type": "string"},
                "prompt": {"type": "string"},
            },
            "required": ["name", "role", "prompt"],
        },
    },
    {
        "type": "function",
        "name": "send_message",
        "description": "Send message to a teammate.",
        "parameters": {
            "type": "object",
            "properties": {"to": {"type": "string"}, "content": {"type": "string"}},
            "required": ["to", "content"],
        },
    },
    {
        "type": "function",
        "name": "check_inbox",
        "description": "Check inbox for messages and protocol responses.",
        "parameters": {"type": "object", "properties": {}, "required": []},
    },
    {
        "type": "function",
        "name": "request_shutdown",
        "description": "Request a teammate to shut down gracefully.",
        "parameters": {
            "type": "object",
            "properties": {"teammate": {"type": "string"}},
            "required": ["teammate"],
        },
    },
    {
        "type": "function",
        "name": "request_plan",
        "description": "Ask a teammate to submit a plan for review.",
        "parameters": {
            "type": "object",
            "properties": {"teammate": {"type": "string"}, "task": {"type": "string"}},
            "required": ["teammate", "task"],
        },
    },
    {
        "type": "function",
        "name": "review_plan",
        "description": "Approve or reject a submitted plan.",
        "parameters": {
            "type": "object",
            "properties": {
                "request_id": {"type": "string"},
                "approve": {"type": "boolean"},
                "feedback": {"type": "string"},
            },
            "required": ["request_id", "approve"],
        },
    },
    # s18 new: worktree tools
    {
        "type": "function",
        "name": "create_worktree",
        "description": "Create an isolated git worktree with its own branch.",
        "parameters": {
            "type": "object",
            "properties": {"name": {"type": "string"}, "task_id": {"type": "string"}},
            "required": ["name"],
        },
    },
    {
        "type": "function",
        "name": "remove_worktree",
        "description": "Remove a worktree. Refuses if uncommitted changes unless discard_changes=true.",
        "parameters": {
            "type": "object",
            "properties": {
                "name": {"type": "string"},
                "discard_changes": {"type": "boolean"},
            },
            "required": ["name"],
        },
    },
    {
        "type": "function",
        "name": "keep_worktree",
        "description": "Keep a worktree for manual review.",
        "parameters": {
            "type": "object",
            "properties": {"name": {"type": "string"}},
            "required": ["name"],
        },
    },
]

TOOL_HANDLERS = {
    "bash": run_bash,
    "read_file": run_read,
    "write_file": run_write,
    "create_task": run_create_task,
    "list_tasks": run_list_tasks,
    "get_task": run_get_task,
    "claim_task": run_claim_task,
    "complete_task": run_complete_task,
    "spawn_teammate": run_spawn_teammate,
    "send_message": run_send_message,
    "check_inbox": run_check_inbox,
    "request_shutdown": run_request_shutdown,
    "request_plan": run_request_plan,
    "review_plan": run_review_plan,
    "create_worktree": run_create_worktree,
    "remove_worktree": run_remove_worktree,
    "keep_worktree": run_keep_worktree,
}


# ── Context ──

MEMORY_DIR = WORKDIR / ".memory"
MEMORY_INDEX = MEMORY_DIR / "MEMORY.md"


def update_context(context: dict, messages: list) -> dict:
    """从记忆文件刷新提示词所需的上下文。"""
    memories = ""
    if MEMORY_INDEX.exists():
        memories = MEMORY_INDEX.read_text()[:2000]
    return {"memories": memories}


# ── Agent Loop ──


def agent_loop(messages: list, context: dict):
    """驱动主智能体的模型调用与工具调用循环。"""
    system = get_system_prompt(context)
    while True:
        try:
            trace("Lead", "调用大模型")
            response = client.responses.create(
                model=MODEL,
                instructions=system,
                input=messages,
                tools=TOOLS,
                max_output_tokens=8000,
            )
        except Exception as e:
            trace("Lead", f"模型请求失败：{type(e).__name__}: {e}")
            messages.append(
                {
                    "role": "assistant",
                    "content": [
                        {"type": "text", "text": f"[Error] {type(e).__name__}: {e}"}
                    ],
                }
            )
            return

        record_model_response("Lead", response)
        messages.extend(as_input_item(item) for item in response.output)
        if not function_calls(response):
            text = extract_text(response)
            if text:
                trace("Lead", f"回复：{text[:200]!r}")
            return response

        results = []
        for block in function_calls(response):
            if block.type != "function_call":
                continue
            arguments = call_args(block)
            trace("Lead", f"工具调用：{format_tool_call(block.name, arguments)}")
            handler = TOOL_HANDLERS.get(block.name)
            output = handler(**arguments) if handler else "Unknown"
            trace("Lead", format_tool_result(block.name, output))
            record_tool_result("Lead", block.name, output)
            results.append(
                {
                    "type": "function_call_output",
                    "call_id": block.call_id,
                    "output": output,
                }
            )
        messages.extend(results)
        context = update_context(context, messages)
        system = get_system_prompt(context)


if __name__ == "__main__":
    reset_execution_log()
    print(f"执行日志文件：{EXECUTION_LOG}")
    print("s18: worktree isolation")
    print("Enter a question, press Enter to send. Type q to quit. OpenAI version.\n")
    history = []
    context = {"memories": ""}
    while True:
        try:
            query = input("\033[36ms18 >> \033[0m")
        except (EOFError, KeyboardInterrupt):
            break
        if query.strip().lower() in ("q", "exit", ""):
            break
        history.append({"role": "user", "content": query})
        agent_loop(history, context)
        context = update_context(context, history)
        for block in history[-1]["content"]:
            # model_dump 后 block 是普通 dict，不能用 getattr
            if isinstance(block, dict) and block.get("type") == "output_text":
                print(block.get("text", ""))

        # Consume lead inbox: route protocol + inject into history
        inbox = consume_lead_inbox(route_protocol=True)
        if inbox:
            inbox_text = "\n".join(
                f"From {m['from']} [{m.get('type', 'message')}]: "
                f"{m['content'][:200]}"
                for m in inbox
            )
            history.append({"role": "user", "content": f"[Inbox]\n{inbox_text}"})
        print()
