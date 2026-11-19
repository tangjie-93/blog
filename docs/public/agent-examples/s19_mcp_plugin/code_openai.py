#!/usr/bin/env python3
"""
s19: MCP Tools — MCPClient + tool discovery + assemble_tool_pool.

Run:  python s19_mcp_plugin/code.py
Need: pip install openai python-dotenv + .env with OPENAI_API_KEY

Changes from s18:
  - MCPClient class: discovers tools, calls tools via mock handler
  - normalize_mcp_name: normalize tool/server names
  - assemble_tool_pool: assembles builtin + MCP tools into one pool
  - connect_mcp: connect to an MCP server, discover tools
  - Tool naming: mcp__{server}__{tool} with normalization
  - MCP tools have readOnly/destructive annotations
  - agent_loop uses dynamic tool pool (builtin + MCP), no prompt cache
  - Teammate tools: complete_task, worktree cwd (from s17/s18 fixes)

ASCII flow:
  connect_mcp("docs") → MCPClient discovers tools →
  assemble_tool_pool → [builtin... , mcp__docs__search, mcp__docs__get_version]
  agent_loop uses assembled pool
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

# ── Task System ──

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
    worktree: str | None = None


def _task_path(task_id: str) -> Path:
    """返回指定任务对应的 JSON 存储路径。"""
    return TASKS_DIR / f"{task_id}.json"


def create_task(
    subject: str, description: str = "", blockedBy: list[str] | None = None
) -> Task:
    """创建待处理任务，保存后返回任务对象。"""
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
    """将任务对象序列化并写入任务目录。"""
    _task_path(task.id).write_text(json.dumps(asdict(task), indent=2))


def load_task(task_id: str) -> Task:
    """从磁盘加载指定任务。"""
    return Task(**json.loads(_task_path(task_id).read_text()))


def list_tasks() -> list[Task]:
    """按文件名顺序读取所有任务。"""
    return [
        Task(**json.loads(p.read_text())) for p in sorted(TASKS_DIR.glob("task_*.json"))
    ]


def get_task_json(task_id: str) -> str:
    """以格式化 JSON 字符串返回任务详情。"""
    return json.dumps(asdict(load_task(task_id)), indent=2)


def can_start(task_id: str) -> bool:
    """判断任务的所有依赖是否存在且已完成。"""
    task = load_task(task_id)
    for dep_id in task.blockedBy:
        if not _task_path(dep_id).exists():
            return False
        if load_task(dep_id).status != "completed":
            return False
    return True


def claim_task(task_id: str, owner: str = "agent") -> str:
    """认领可执行的待处理任务，并更新其状态。"""
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
    """完成执行中的任务，并报告被解除依赖的任务。"""
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


# ── Worktree System ──

WORKTREES_DIR = WORKDIR / ".worktrees"
WORKTREES_DIR.mkdir(exist_ok=True)

VALID_WT_NAME = re.compile(r"^[A-Za-z0-9._-]{1,64}$")


def validate_worktree_name(name: str) -> str | None:
    """校验 worktree 名称是否符合安全命名规则。"""
    if not name:
        return "Worktree name cannot be empty"
    if name in (".", ".."):
        return f"'{name}' is not a valid worktree name"
    if not VALID_WT_NAME.match(name):
        return (
            f"Invalid worktree name '{name}': "
            "only letters, digits, dots, underscores, dashes (1-64 chars)"
        )
    return None


def run_git(args: list[str]) -> tuple[bool, str]:
    """在主工作目录执行 Git 命令并返回状态和输出。"""
    try:
        r = subprocess.run(
            ["git"] + args, cwd=WORKDIR, capture_output=True, text=True, timeout=30
        )
        out = (r.stdout + r.stderr).strip()
        return r.returncode == 0, out[:5000] if out else "(no output)"
    except subprocess.TimeoutExpired:
        return False, "Error: git timeout"


def log_event(event_type: str, worktree_name: str, task_id: str = ""):
    """将 worktree 事件追加记录到 JSONL 日志。"""
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
    """创建独立 Git worktree，并可选绑定到任务。"""
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
    """将任务关联到指定的 worktree。"""
    task = load_task(task_id)
    task.worktree = worktree_name
    save_task(task)


def _count_worktree_changes(path: Path) -> tuple[int, int]:
    """统计 worktree 中未提交文件数和未推送提交数。"""
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
    """删除 worktree；默认在检测到变更时拒绝删除。"""
    err = validate_worktree_name(name)
    if err:
        return err
    path = WORKTREES_DIR / name
    if not path.exists():
        return f"Worktree '{name}' not found"
    if not discard_changes:
        files, commits = _count_worktree_changes(path)
        if files < 0:
            return "Cannot verify status. Use discard_changes=true to force."
        if files > 0 or commits > 0:
            return (
                f"Worktree '{name}' has {files} file(s), {commits} commit(s). "
                "Use discard_changes=true or keep_worktree."
            )
    ok1, _ = run_git(["worktree", "remove", str(path), "--force"])
    if not ok1:
        return f"Failed to remove worktree '{name}'"
    run_git(["branch", "-D", f"wt/{name}"])
    log_event("remove", name)
    print(f"  \033[33m[worktree] removed: {name}\033[0m")
    return f"Worktree '{name}' removed"


def keep_worktree(name: str) -> str:
    """记录保留 worktree 的事件，供人工后续审查。"""
    err = validate_worktree_name(name)
    if err:
        return err
    log_event("keep", name)
    return f"Worktree '{name}' kept for review (branch: wt/{name})"


# ── Prompt Assembly ──

PROMPT_SECTIONS = {
    "identity": "You are a coding agent. Act, don't explain.",
    "tools": "Available tools: bash, read_file, write_file, "
    "create_task, list_tasks, get_task, claim_task, complete_task, "
    "spawn_teammate, send_message, check_inbox, "
    "request_shutdown, request_plan, review_plan, "
    "create_worktree, remove_worktree, keep_worktree, "
    "connect_mcp. MCP tools are prefixed mcp__{server}__{tool}.",
    "workspace": f"Working directory: {WORKDIR}",
    "memory": "Relevant memories are injected below when available.",
}


def assemble_system_prompt(context: dict) -> str:
    """根据上下文和已连接的 MCP 服务构建系统提示词。"""
    sections = [
        PROMPT_SECTIONS["identity"],
        PROMPT_SECTIONS["tools"],
        PROMPT_SECTIONS["workspace"],
    ]
    if context.get("memories"):
        sections.append(f"Relevant memories:\n{context['memories']}")
    mcp_names = list(mcp_clients.keys())
    if mcp_names:
        sections.append(f"Connected MCP servers: {', '.join(mcp_names)}")
    return "\n\n".join(sections)


# ── MessageBus ──

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
        """向目标代理的收件箱追加一条消息。"""
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
        """读取并清空指定代理的收件箱。"""
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

# ── Protocol State ──


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
    """生成用于协议消息匹配的随机请求 ID。"""
    return f"req_{random.randint(0, 999999):06d}"


def match_response(response_type: str, request_id: str, approve: bool):
    """校验响应类型后，更新对应协议请求的审批状态。"""
    state = pending_requests.get(request_id)
    if not state:
        return
    if state.type == "shutdown" and response_type != "shutdown_response":
        return
    if state.type == "plan_approval" and response_type != "plan_approval_response":
        return
    state.status = "approved" if approve else "rejected"


def consume_lead_inbox(route_protocol=True) -> list[dict]:
    """读取 Lead 收件箱，并按需分发协议响应。"""
    msgs = BUS.read_inbox("lead")
    if route_protocol:
        for msg in msgs:
            meta = msg.get("metadata", {})
            req_id = meta.get("request_id", "")
            msg_type = msg.get("type", "")
            if req_id and msg_type.endswith("_response"):
                match_response(msg_type, req_id, meta.get("approve", False))
    return msgs


# ── Autonomous Agent ──

IDLE_POLL_INTERVAL = 5
IDLE_TIMEOUT = 60


def scan_unclaimed_tasks() -> list[dict]:
    """找出没有归属且依赖已满足的待处理任务。"""
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
    """在代理空闲时轮询消息和可认领任务。"""
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
                        "Shutting down.",
                        "shutdown_response",
                        {"request_id": req_id, "approve": True},
                    )
                    return "shutdown"
            messages.append(
                {"role": "user", "content": "<inbox>" + json.dumps(inbox) + "</inbox>"}
            )
            return "work"
        unclaimed = scan_unclaimed_tasks()
        if unclaimed:
            # 自动认领第一个任务
            task_data = unclaimed[0]
            result = claim_task(task_data["id"], agent_name)
            if "Claimed" in result:
                wt_info = ""
                if task_data.get("worktree"):
                    wt_info = (
                        f"\nWork directory: {WORKTREES_DIR / task_data['worktree']}"
                    )
                messages.append(
                    {
                        "role": "user",
                        "content": f"<auto-claimed>Task {task_data['id']}: "
                        f"{task_data['subject']}{wt_info}</auto-claimed>",
                    }
                )
                return "work"
    return "timeout"


# ── Teammate Thread ──


def spawn_teammate_thread(name: str, role: str, prompt: str) -> str:
    """启动后台队友线程，供其自主处理任务。"""
    if name in active_teammates:
        return f"Teammate '{name}' already exists"

    system = (
        f"You are '{name}', a {role}. "
        f"Use tools to complete tasks. "
        f"If a task has a worktree, work in that directory."
    )

    def handle_inbox_message(name: str, msg: dict, messages: list):
        """处理队友收到的停机和计划审批协议消息。"""
        msg_type = msg.get("type", "message")
        meta = msg.get("metadata", {})
        req_id = meta.get("request_id", "")
        if msg_type == "shutdown_request":
            BUS.send(
                name,
                "lead",
                "Shutting down.",
                "shutdown_response",
                {"request_id": req_id, "approve": True},
            )
            return True
        if msg_type == "plan_approval_response":
            approve = meta.get("approve", False)
            messages.append(
                {
                    "role": "user",
                    "content": (
                        "[Plan approved]"
                        if approve
                        else f"[Plan rejected] {msg['content']}"
                    ),
                }
            )
        return False

    def run():
        """执行队友的模型调用、工具调度和空闲轮询循环。"""
        wt_ctx = {"path": None}

        def _wt_cwd():
            """返回当前任务 worktree 的工作目录。"""
            p = wt_ctx["path"]
            return Path(p) if p else None

        def _run_bash(command: str) -> str:
            """在当前 worktree 中执行 Shell 命令。"""
            return run_bash(command, cwd=_wt_cwd())

        def _run_read(path: str) -> str:
            """在当前 worktree 中读取文件。"""
            return run_read(path, cwd=_wt_cwd())

        def _run_write(path: str, content: str) -> str:
            """在当前 worktree 中写入文件。"""
            return run_write(path, content, cwd=_wt_cwd())

        def _run_list_tasks():
            """返回队友可见的任务摘要列表。"""
            tasks = list_tasks()
            if not tasks:
                return "No tasks."
            return "\n".join(
                f"  {t.id}: {t.subject} [{t.status}]"
                + (f" (wt:{t.worktree})" if t.worktree else "")
                for t in tasks
            )

        def _run_claim_task(task_id: str):
            """认领任务并切换到其绑定的 worktree。"""
            result = claim_task(task_id, owner=name)
            if "Claimed" in result:
                task = load_task(task_id)
                wt_ctx["path"] = (
                    str(WORKTREES_DIR / task.worktree) if task.worktree else None
                )
            return result

        def _run_complete_task(task_id: str):
            """完成任务并清除当前 worktree 上下文。"""
            result = complete_task(task_id)
            wt_ctx["path"] = None
            return result

        messages = [{"role": "user", "content": prompt}]
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
                "description": "List all tasks.",
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
                    response = client.responses.create(
                        model=MODEL,
                        instructions=system,
                        input=messages[-20:],
                        tools=sub_tools,
                        max_output_tokens=8000,
                    )
                except Exception:
                    break
                messages.extend(as_input_item(item) for item in response.output)
                if not function_calls(response):
                    break
                results = []
                for block in function_calls(response):
                    if block.type == "function_call":
                        handler = sub_handlers.get(block.name)
                        output = handler(**call_args(block)) if handler else "Unknown"
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
            idle_result = idle_poll(name, messages, name, role)
            if idle_result in ("shutdown", "timeout"):
                break

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

    active_teammates[name] = True
    threading.Thread(target=run, daemon=True).start()
    return f"Teammate '{name}' spawned as {role}"


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
    return f"Plan submitted ({req_id})"


# ── Lead Protocol Tools ──


def run_request_shutdown(teammate: str) -> str:
    """向指定队友发送停机请求。"""
    req_id = new_request_id()
    pending_requests[req_id] = ProtocolState(
        request_id=req_id,
        type="shutdown",
        sender="lead",
        target=teammate,
        status="pending",
        payload="",
    )
    BUS.send("lead", teammate, "Shut down.", "shutdown_request", {"request_id": req_id})
    return f"Shutdown request sent to {teammate}"


def run_request_plan(teammate: str, task: str) -> str:
    """要求指定队友提交任务执行计划。"""
    BUS.send("lead", teammate, f"Submit plan for: {task}", "message")
    return f"Asked {teammate} to submit a plan"


def run_review_plan(request_id: str, approve: bool, feedback: str = "") -> str:
    """审批或驳回队友提交的计划，并发送结果。"""
    state = pending_requests.get(request_id)
    if not state:
        return f"Request {request_id} not found"
    state.status = "approved" if approve else "rejected"
    BUS.send(
        "lead",
        state.sender,
        feedback or ("Approved" if approve else "Rejected"),
        "plan_approval_response",
        {"request_id": request_id, "approve": approve},
    )
    return f"Plan {'approved' if approve else 'rejected'}"


# ── MCP System (s19 new) ──


class MCPClient:
    """Discovers and calls tools on an MCP server (mock for teaching)."""

    def __init__(self, name: str):
        """初始化 MCP 服务名称、工具定义和处理器映射。"""
        self.name = name
        self.tools: list[dict] = []
        self._handlers: dict[str, callable] = {}

    def register(self, tool_defs: list[dict], handlers: dict[str, callable]):
        """注册 MCP 服务公开的工具定义及其本地模拟处理器。"""
        self.tools = tool_defs
        self._handlers = handlers

    def call_tool(self, tool_name: str, args: dict) -> str:
        """调用指定 MCP 工具，并将异常转换为错误字符串。"""
        handler = self._handlers.get(tool_name)
        if not handler:
            return f"MCP error: unknown tool '{tool_name}'"
        try:
            return handler(**args)
        except Exception as e:
            return f"MCP error: {e}"


mcp_clients: dict[str, MCPClient] = {}

_DISALLOWED_CHARS = re.compile(r"[^a-zA-Z0-9_-]")


def normalize_mcp_name(name: str) -> str:
    """将 MCP 服务或工具名称中的非法字符替换为下划线。"""
    return _DISALLOWED_CHARS.sub("_", name)


def _mock_server_docs():
    """创建提供文档查询工具的模拟 MCP 服务。"""
    client = MCPClient("docs")
    client.register(
        tool_defs=[
            {
                "type": "function",
                "name": "search",
                "description": "Search documentation. (readOnly)",
                "inputSchema": {
                    "type": "object",
                    "properties": {"query": {"type": "string"}},
                    "required": ["query"],
                },
            },
            {
                "type": "function",
                "name": "get_version",
                "description": "Get API version. (readOnly)",
                "inputSchema": {"type": "object", "properties": {}, "required": []},
            },
        ],
        handlers={
            "search": lambda query: f"[docs] Found 3 results for '{query}'",
            "get_version": lambda: "[docs] API v2.1.0",
        },
    )
    return client


def _mock_server_deploy():
    """创建提供部署操作工具的模拟 MCP 服务。"""
    client = MCPClient("deploy")
    client.register(
        tool_defs=[
            {
                "type": "function",
                "name": "trigger",
                "description": "Trigger a deployment. (destructive — requires approval in real CC)",
                "inputSchema": {
                    "type": "object",
                    "properties": {"service": {"type": "string"}},
                    "required": ["service"],
                },
            },
            {
                "type": "function",
                "name": "status",
                "description": "Check deployment status. (readOnly)",
                "inputSchema": {
                    "type": "object",
                    "properties": {"service": {"type": "string"}},
                    "required": ["service"],
                },
            },
        ],
        handlers={
            "trigger": lambda service: f"[deploy] Triggered: {service}",
            "status": lambda service: f"[deploy] {service}: running (v1.4.2)",
        },
    )
    return client


MOCK_SERVERS = {
    "docs": _mock_server_docs,
    "deploy": _mock_server_deploy,
}


def connect_mcp(name: str) -> str:
    """连接模拟 MCP 服务并发现其可用工具。"""
    if name in mcp_clients:
        return f"MCP server '{name}' already connected"
    factory = MOCK_SERVERS.get(name)
    if not factory:
        available = ", ".join(MOCK_SERVERS.keys())
        return f"Unknown server '{name}'. Available: {available}"
    mcp_client = factory()
    mcp_clients[name] = mcp_client
    tool_names = [t["name"] for t in mcp_client.tools]
    print(f"  \033[31m[mcp] connected: {name} → {tool_names}\033[0m")
    return (
        f"Connected to MCP server '{name}'. "
        f"Discovered {len(mcp_client.tools)} tools: {', '.join(tool_names)}"
    )


def assemble_tool_pool() -> tuple[list[dict], dict]:
    """汇总内置工具和已连接 MCP 服务的工具及其处理器。

    返回值:
      tools    -- list[dict]: 所有可用工具的定义列表，供 LLM function calling 使用。
                   每个工具定义包含 name、description、parameters (JSON Schema)。
      handlers -- dict[str, callable]: 工具名 -> 处理函数的映射。
                   内置工具用预先定义好的 handler；MCP 工具用闭包调用远程 MCP 服务。

    命名规则:
      内置工具: bash, read, write, ...（原名，不加前缀）
      MCP 工具:  mcp__{server_name}__{tool_name}（双下划线前缀 + server + tool）
      所有名称经过 normalize_mcp_name() 清洗：转小写、仅保留 [a-z0-9_-]。
    """
    # 从内置工具起步（BUILTIN_TOOLS 和 BUILTIN_HANDLERS 在文件末尾定义，
    # 但 Python 在定义时不执行函数体，调用时这两个全局变量早已就绪）
    tools = list(BUILTIN_TOOLS)
    handlers = dict(BUILTIN_HANDLERS)

    # 遍历每个已连接的 MCP 服务，将其工具注册到工具池
    for server_name, mcp_client in mcp_clients.items():
        safe_server = normalize_mcp_name(server_name)  # e.g. "MyServer" -> "myserver"

        for tool_def in mcp_client.tools:
            safe_tool = normalize_mcp_name(
                tool_def["name"]
            )  # e.g. "GetVersion" -> "getversion"
            # 双下划线前缀 mcp__ 区分 MCP 远程工具和内置本地工具
            prefixed = f"mcp__{safe_server}__{safe_tool}"

            # 向 LLM 暴露工具定义（name + description + JSON Schema 参数）
            tools.append(
                {
                    "name": prefixed,
                    "description": tool_def.get("description", ""),
                    "parameters": tool_def.get("inputSchema", {}),
                }
            )

            # 为每个 MCP 工具创建处理函数（闭包）
            #
            # lambda *, c=mcp_client, t=tool_def["name"], **kw: c.call_tool(t, kw)
            #
            # 语法解析:
            #   *                -- 强制所有后续参数必须关键字传入，禁止位置参数
            #   c=mcp_client     -- 默认参数（定义时立即求值），捕获当前循环的 MCP 客户端对象
            #   t=tool_def["name"]  -- 默认参数（定义时立即求值），捕获当前循环的工具名称
            #   **kw             -- 收拢 LLM 传入的所有 function_call 参数（字典）
            #   c.call_tool(t, kw)  -- 调用 MCP 客户端的 call_tool 方法，远程执行工具
            #
            # 为什么必须用默认参数捕获（c=mcp_client, t=tool_def["name"]）？
            #   Python 闭包是"延迟绑定"（late binding）：循环变量 mcp_client / tool_def
            #   在 lambda 调用时才查找引用，届时循环已结束，所有 lambda 会共享最后一次循环的值。
            #   默认参数在 lambda 定义时立即求值，每个 lambda 捕获各自循环迭代的快照，
            #   从而避免了"所有 MCP 工具都调用最后一个 server 的最后一个 tool"的 bug。
            handlers[prefixed] = lambda *, c=mcp_client, t=tool_def[
                "name"
            ], **kw: c.call_tool(t, kw)

    return tools, handlers


# ── Lead Worktree Tools ──


def run_create_worktree(name: str, task_id: str = "") -> str:
    """提供给模型调用的创建 worktree 包装函数。"""
    return create_worktree(name, task_id)


def run_remove_worktree(name: str, discard_changes: bool = False) -> str:
    """提供给模型调用的删除 worktree 包装函数。"""
    return remove_worktree(name, discard_changes)


def run_keep_worktree(name: str) -> str:
    """提供给模型调用的保留 worktree 包装函数。"""
    return keep_worktree(name)


# ── Basic tool handlers ──


def run_create_task(
    subject: str, description: str = "", blockedBy: list[str] | None = None
) -> str:
    """创建任务，并返回适合工具调用展示的结果。"""
    task = create_task(subject, description, blockedBy)
    deps = f" (blockedBy: {', '.join(blockedBy)})" if blockedBy else ""
    print(f"  \033[34m[create] {task.subject}{deps}\033[0m")
    return f"Created {task.id}: {task.subject}{deps}"


def run_list_tasks() -> str:
    """返回所有任务的简明状态列表。"""
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
    """以默认代理身份认领任务。"""
    return claim_task(task_id, owner="agent")


def run_complete_task(task_id: str) -> str:
    """将指定任务标记为完成。"""
    return complete_task(task_id)


def run_spawn_teammate(name: str, role: str, prompt: str) -> str:
    """启动新的自主队友线程。"""
    return spawn_teammate_thread(name, role, prompt)


def run_send_message(to: str, content: str) -> str:
    """以 Lead 身份向指定队友发送普通消息。"""
    BUS.send("lead", to, content)
    return f"Sent to {to}"


def run_check_inbox() -> str:
    """读取 Lead 收件箱并格式化其中的消息。"""
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


def run_connect_mcp(name: str) -> str:
    """提供给模型调用的 MCP 连接包装函数。"""
    return connect_mcp(name)


# ── Tool Definitions ──

BUILTIN_TOOLS = [
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
        "description": "Get full task details.",
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
        "description": "Spawn an autonomous teammate.",
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
        "description": "Request a teammate to shut down.",
        "parameters": {
            "type": "object",
            "properties": {"teammate": {"type": "string"}},
            "required": ["teammate"],
        },
    },
    {
        "type": "function",
        "name": "request_plan",
        "description": "Ask a teammate to submit a plan.",
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
    {
        "type": "function",
        "name": "create_worktree",
        "description": "Create an isolated git worktree.",
        "parameters": {
            "type": "object",
            "properties": {"name": {"type": "string"}, "task_id": {"type": "string"}},
            "required": ["name"],
        },
    },
    {
        "type": "function",
        "name": "remove_worktree",
        "description": "Remove a worktree. Refuses if changes exist.",
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
    {
        "type": "function",
        "name": "connect_mcp",
        "description": "Connect to an MCP server (docs, deploy) and discover tools.",
        "parameters": {
            "type": "object",
            "properties": {"name": {"type": "string"}},
            "required": ["name"],
        },
    },
]

BUILTIN_HANDLERS = {
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
    "connect_mcp": run_connect_mcp,
}


# ── Context ──

MEMORY_DIR = WORKDIR / ".memory"
MEMORY_INDEX = MEMORY_DIR / "MEMORY.md"


def update_context(context: dict, messages: list) -> dict:
    """从本地记忆文件读取内容，生成下一轮上下文。"""
    memories = ""
    if MEMORY_INDEX.exists():
        memories = MEMORY_INDEX.read_text()[:2000]
    return {"memories": memories}


# ── Agent Loop (s19: dynamic tool pool, no prompt cache) ──


def agent_loop(messages: list, context: dict):
    """运行主代理循环，调度内置与动态发现的 MCP 工具。"""
    tools, handlers = assemble_tool_pool()
    system = assemble_system_prompt(context)
    while True:
        try:
            response = client.responses.create(
                model=MODEL,
                instructions=system,
                input=messages,
                tools=tools,
                max_output_tokens=8000,
            )
        except Exception as e:
            messages.append(
                {
                    "role": "assistant",
                    "content": [
                        {"type": "text", "text": f"[Error] {type(e).__name__}: {e}"}
                    ],
                }
            )
            return

        messages.extend(as_input_item(item) for item in response.output)
        if not function_calls(response):
            return response

        results = []
        for block in function_calls(response):
            if block.type != "function_call":
                continue
            print(f"\033[36m> {block.name}\033[0m")
            handler = handlers.get(block.name)
            output = handler(**call_args(block)) if handler else "Unknown"
            print(str(output)[:300])
            results.append(
                {
                    "type": "function_call_output",
                    "call_id": block.call_id,
                    "output": output,
                }
            )
        messages.extend(results)

        if any(
            b.name == "connect_mcp"
            for b in response.output
            if b.type == "function_call"
        ):
            tools, handlers = assemble_tool_pool()
            context = update_context(context, messages)
            system = assemble_system_prompt(context)


if __name__ == "__main__":
    print("s19: mcp tools")
    print("Enter a question, press Enter to send. Type q to quit. OpenAI version.\n")
    history = []
    context = {"memories": ""}
    while True:
        try:
            query = input("\033[36ms19 >> \033[0m")
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

        inbox = consume_lead_inbox(route_protocol=True)
        if inbox:
            inbox_text = "\n".join(
                f"From {m['from']} [{m.get('type', 'message')}]: "
                f"{m['content'][:200]}"
                for m in inbox
            )
            history.append({"role": "user", "content": f"[Inbox]\n{inbox_text}"})
        print()
