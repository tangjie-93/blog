#!/usr/bin/env python3
"""
s16: Team Protocols — request-response protocol + request_id + dispatch + state machine.

Run:  python s16_team_protocols/code.py
Need: pip install openai python-dotenv + .env with OPENAI_API_KEY

Changes from s15:
  - ProtocolState dataclass (request_id, type, sender, status, created_at)
  - pending_requests dict: tracks in-flight protocol requests
  - dispatch_message: routes incoming messages by type to handlers
  - request_shutdown: Lead sends shutdown protocol request
  - request_plan: Lead asks teammate to submit plan
  - handle_shutdown_request / handle_plan_response: teammate receives & responds
  - match_response: Lead correlates response to request via request_id (with type validation)
  - Teammate idle loop: waits for inbox messages instead of exiting after 10 rounds
  - Unified consume_lead_inbox: protocol routing + injection into history
  - 3 new Lead tools: request_shutdown, request_plan, review_plan
  - 1 new teammate tool: submit_plan

ASCII flow:
  Lead: BUS.send("shutdown_request", {request_id}) ──────→ teammate inbox
  Teammate: dispatch → handler → BUS.send("shutdown_response", {request_id}) ─→ Lead inbox
  Lead: consume_lead_inbox → match_response(request_id) → pending_requests[req_id].status = approved
"""

import os
import sys, json, time, random, threading
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
MEMORY_DIR = WORKDIR / ".memory"
MEMORY_INDEX = MEMORY_DIR / "MEMORY.md"
client = OpenAI(**client_kwargs)
MODEL = os.getenv("OPENAI_MODEL", "gpt-5.5")

# ── Task System (from s12, synced) ──

TASKS_DIR = WORKDIR / ".tasks"
TASKS_DIR.mkdir(exist_ok=True)


@dataclass
class Task:
    id: str
    subject: str
    description: str
    status: str  # pending | in_progress | completed
    owner: str | None
    blockedBy: list[str]


def _task_path(task_id: str) -> Path:
    """根据任务 ID 返回对应的 JSON 文件路径。"""
    return TASKS_DIR / f"{task_id}.json"


def create_task(
    subject: str, description: str = "", blockedBy: list[str] | None = None
) -> Task:
    """创建新任务，自动生成唯一 ID，状态初始为 pending。"""
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
    """将任务序列化为 JSON 保存到磁盘。"""
    _task_path(task.id).write_text(json.dumps(asdict(task), indent=2))


def load_task(task_id: str) -> Task:
    """从磁盘加载指定任务，反序列化为 Task 对象。"""
    return Task(**json.loads(_task_path(task_id).read_text()))


def list_tasks() -> list[Task]:
    """列出所有任务，按文件名排序后返回 Task 对象列表。"""
    return [
        Task(**json.loads(p.read_text())) for p in sorted(TASKS_DIR.glob("task_*.json"))
    ]


def get_task(task_id: str) -> str:
    """以 JSON 格式返回任务的完整详情。"""
    task = load_task(task_id)
    return json.dumps(asdict(task), indent=2)


def can_start(task_id: str) -> bool:
    """检查任务的所有 blockedBy 依赖是否都已完成。
    缺失的依赖视为阻塞。"""
    task = load_task(task_id)
    for dep_id in task.blockedBy:
        if not _task_path(dep_id).exists():
            return False
        if load_task(dep_id).status != "completed":
            return False
    return True


def claim_task(task_id: str, owner: str = "agent") -> str:
    """认领一个 pending 任务。检查依赖是否满足，设置 owner 并将状态改为 in_progress。"""
    task = load_task(task_id)
    if task.status != "pending":
        return f"Task {task_id} is {task.status}, cannot claim"
    if not can_start(task_id):
        deps = [
            d
            for d in task.blockedBy
            if not _task_path(d).exists() or load_task(d).status != "completed"
        ]
        return f"Blocked by: {deps}"
    task.owner = owner
    task.status = "in_progress"
    save_task(task)
    print(f"  \033[36m[claim] {task.subject} → in_progress (owner: {owner})\033[0m")
    return f"Claimed {task.id} ({task.subject})"


def complete_task(task_id: str) -> str:
    """完成一个 in_progress 任务。完成后检查是否有下游任务被解锁。"""
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
        print(f"  \033[33m[unblocked] {', '.join(unblocked)}\033[0m")
    return msg


# ── Prompt Assembly (from s10, synced) ──

PROMPT_SECTIONS = {
    "identity": "You are a coding agent. Act, don't explain.",
    "tools": "Available tools: bash, read_file, write_file, "
    "get_task, create_task, list_tasks, claim_task, complete_task, "
    "spawn_teammate, send_message, check_inbox, "
    "request_shutdown, request_plan, review_plan.",
    "workspace": f"Working directory: {WORKDIR}",
    "memory": "Relevant memories are injected below when available.",
}


def assemble_system_prompt(context: dict) -> str:
    """根据上下文字典拼接最终的 system prompt。"""
    sections = [
        PROMPT_SECTIONS["identity"],
        PROMPT_SECTIONS["tools"],
        PROMPT_SECTIONS["workspace"],
    ]
    memories = context.get("memories", "")
    if memories:
        sections.append(f"Relevant memories:\n{memories}")
    return "\n\n".join(sections)


_last_context_key, _last_prompt = None, None


def get_system_prompt(context: dict) -> str:
    """获取 system prompt，相同上下文时复用缓存避免重复拼接。"""
    global _last_context_key, _last_prompt
    key = json.dumps(context, sort_keys=True, ensure_ascii=False, default=str)
    if key == _last_context_key and _last_prompt:
        return _last_prompt
    _last_context_key = key
    _last_prompt = assemble_system_prompt(context)
    return _last_prompt


# Task tools


def run_create_task(
    subject: str, description: str = "", blockedBy: list[str] | None = None
) -> str:
    """调用 create_task 创建任务，打印日志并返回结果字符串。"""
    task = create_task(subject, description, blockedBy)
    deps = f" (blockedBy: {', '.join(blockedBy)})" if blockedBy else ""
    print(f"  \033[34m[create] {task.subject}{deps}\033[0m")
    return f"Created {task.id}: {task.subject}{deps}"


def run_list_tasks() -> str:
    """列出所有任务的格式化视图，含状态图标和依赖信息。"""
    tasks = list_tasks()
    if not tasks:
        return "No tasks. Use create_task to add some."
    lines = []
    for t in tasks:
        icon = {"pending": "○", "in_progress": "●", "completed": "✓"}.get(t.status, "?")
        deps = f" (blockedBy: {', '.join(t.blockedBy)})" if t.blockedBy else ""
        owner = f" [{t.owner}]" if t.owner else ""
        lines.append(f"  {icon} {t.id}: {t.subject} " f"[{t.status}]{owner}{deps}")
    return "\n".join(lines)


def run_get_task(task_id: str) -> str:
    """根据 ID 获取任务详情，文件不存在时返回错误信息。"""
    try:
        return get_task(task_id)
    except FileNotFoundError:
        return f"Error: Task {task_id} not found"


def run_claim_task(task_id: str) -> str:
    """认领任务，owner 固定为 agent。"""
    return claim_task(task_id, owner="agent")


def run_complete_task(task_id: str) -> str:
    """完成任务，委托给 complete_task。"""
    return complete_task(task_id)


# ── Background Tasks (from s13, synced) ──

_bg_counter = 0
background_tasks: dict[str, dict] = {}
background_results: dict[str, str] = {}
background_lock = threading.Lock()


def is_slow_operation(tool_name: str, tool_input: dict) -> bool:
    """启发式判断：包含 install/build/test 等关键词的 bash 命令视为耗时长。"""
    if tool_name != "bash":
        return False
    cmd = tool_input.get("command", "").lower()
    slow_keywords = [
        "install",
        "build",
        "test",
        "deploy",
        "compile",
        "docker build",
        "pip install",
        "npm install",
        "cargo build",
        "pytest",
        "make",
    ]
    return any(kw in cmd for kw in slow_keywords)


def should_run_background(tool_name: str, tool_input: dict) -> bool:
    """判断是否应放入后台执行：模型显式声明优先，否则回退到启发式判断。"""
    if tool_input.get("run_in_background"):
        return True
    return is_slow_operation(tool_name, tool_input)


def start_background_task(block) -> str:
    """在守护线程中执行工具调用。返回后台任务 ID。"""
    global _bg_counter
    _bg_counter += 1
    bg_id = f"bg_{_bg_counter:04d}"
    cmd = call_args(block).get("command", block.name)

    def worker():
        result = execute_tool(block)
        with background_lock:
            background_tasks[bg_id]["status"] = "completed"
            background_results[bg_id] = result
        print(f"  \033[33m[lead][background {bg_id}] {str(result)[:300]}\033[0m")

    with background_lock:
        background_tasks[bg_id] = {
            "call_id": block.call_id,
            "command": cmd,
            "status": "running",
        }
    threading.Thread(target=worker, daemon=True).start()
    print(f"  \033[33m[lead][background] dispatched {bg_id}: {cmd[:40]}\033[0m")
    return bg_id


def collect_background_results() -> list[str]:
    """收集已完成的后台任务结果，格式化为 task_notification 消息。"""
    with background_lock:
        ready_ids = [
            bid
            for bid, task in background_tasks.items()
            if task["status"] == "completed"
        ]
    notifications = []
    for bg_id in ready_ids:
        with background_lock:
            task = background_tasks.pop(bg_id)
            output = background_results.pop(bg_id, "")
        summary = output[:200] if len(output) > 200 else output
        notifications.append(
            f"<task_notification>\n"
            f"  <task_id>{bg_id}</task_id>\n"
            f"  <status>completed</status>\n"
            f"  <command>{task['command']}</command>\n"
            f"  <summary>{summary}</summary>\n"
            f"</task_notification>"
        )
        print(
            f"  \033[32m[lead][background done] {bg_id}: "
            f"{task['command'][:40]} ({len(output)} chars)\033[0m"
        )
    return notifications


# ── MessageBus (from s15) ──

MAILBOX_DIR = WORKDIR / ".mailboxes"
MAILBOX_DIR.mkdir(exist_ok=True)


class MessageBus:
    """File-based message bus. Each agent has a .jsonl inbox.
    Read is destructive: read_text + unlink (consumes messages).
    Teaching version: no file locking; real CC uses proper-lockfile."""

    def send(
        self,
        from_agent: str,
        to_agent: str,
        content: str,
        msg_type: str = "message",
        metadata: dict = None,
    ):
        """向指定 agent 的 .jsonl 收件箱追加一条消息。"""
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
        """读取并清空 agent 的收件箱（破坏性消费）。"""
        inbox = MAILBOX_DIR / f"{agent}.jsonl"
        if not inbox.exists():
            return []
        msgs = [
            json.loads(line) for line in inbox.read_text().splitlines() if line.strip()
        ]
        inbox.unlink()  # consume: read + delete
        return msgs


BUS = MessageBus()
active_teammates: dict[str, bool] = {}

# ── Protocol State (s16 new) ──


@dataclass
class ProtocolState:
    request_id: str
    type: str  # "shutdown" | "plan_approval"
    sender: str
    target: str
    status: str  # pending | approved | rejected
    payload: str  # plan text or shutdown reason
    created_at: float = field(default_factory=time.time)


pending_requests: dict[str, ProtocolState] = {}


def new_request_id() -> str:
    """生成随机的 request_id，格式为 req_XXXXXX。"""
    return f"req_{random.randint(0, 999999):06d}"


def match_response(response_type: str, request_id: str, approve: bool):
    """通过 request_id 将响应关联到原始请求。
    校验 response_type 与请求类型匹配，更新 pending_requests 状态。"""
    state = pending_requests.get(request_id)
    if not state:
        print(f"  \033[31m[protocol] unknown request_id: {request_id}\033[0m")
        return
    # Validate response type matches request type
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
    if state.status != "pending":
        print(
            f"  \033[33m[protocol] {request_id} already {state.status}, "
            f"ignoring duplicate\033[0m"
        )
        return
    state.status = "approved" if approve else "rejected"
    icon = "✓" if approve else "✗"
    color = "32" if approve else "31"
    print(
        f"  \033[{color}m[protocol] {state.type} {icon} "
        f"({request_id}: {state.status})\033[0m"
    )


# ── Unified Lead Inbox Consumer (s16 fix) ──
# Both check_inbox tool and main loop call this function.
# Protocol responses are routed via match_response before returning.


def consume_lead_inbox(route_protocol: bool = True) -> list[dict]:
    """读取 Lead 收件箱。先路由协议响应，再返回所有消息。
    同时被 run_check_inbox() 和主循环调用，避免消息被消费后未经协议路由。"""
    msgs = BUS.read_inbox("lead")
    if not msgs:
        return []
    if route_protocol:
        for msg in msgs:
            meta = msg.get("metadata", {})
            req_id = meta.get("request_id", "")
            msg_type = msg.get("type", "")
            if req_id and msg_type.endswith("_response"):
                approve = meta.get("approve", False)
                match_response(msg_type, req_id, approve)
    return msgs


# ── Teammate Thread (s16: idle loop + dispatch) ──


def spawn_teammate_thread(name: str, role: str, prompt: str) -> str:
    """在后台线程中 spawn 一个队友 agent。
    使用 idle loop：LLM 每轮结束后等待收件箱消息（如 shutdown_request），而非直接退出。"""
    if name in active_teammates:
        return f"Teammate '{name}' already exists"

    system = (
        f"You are '{name}', a {role}. "
        f"Use tools to complete tasks. "
        f"Check inbox for protocol messages (shutdown_request, etc)."
    )

    def handle_inbox_message(name: str, msg: dict, messages: list) -> bool:
        """按消息类型分发收到的协议消息。
        返回 True 表示队友应停止运行。"""
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
            return True  # stop the loop

        if msg_type == "plan_approval_response":
            approve = meta.get("approve", False)
            if approve:
                messages.append(
                    {
                        "role": "user",
                        "content": f"[Plan approved] Proceed with the task.",
                    }
                )
            else:
                messages.append(
                    {
                        "role": "user",
                        "content": f"[Plan rejected] Feedback: {msg['content']}",
                    }
                )

        return False  # continue

    def run():
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
        ]
        sub_handlers = {
            "bash": run_bash,
            "read_file": run_read,
            "write_file": run_write,
            "send_message": lambda to, content: (BUS.send(name, to, content), "Sent")[
                1
            ],
            "submit_plan": lambda plan: _teammate_submit_plan(name, plan),
        }

        shutdown_requested = False

        def _process_inbox(name: str, messages: list) -> tuple[bool, bool]:
            """处理收件箱消息。返回 (should_shutdown, has_new_messages)。

            协议消息（shutdown_request/plan_approval_response）→ handle_inbox_message 分发；
            非协议消息 → 注入 messages 供 LLM 读取。
            """
            inbox = BUS.read_inbox(name)
            if not inbox:
                return False, False
            non_protocol = []
            for msg in inbox:
                if msg.get("type") in ("shutdown_request", "plan_approval_response"):
                    should_stop = handle_inbox_message(name, msg, messages)
                    if should_stop:
                        return True, False  # shutdown 请求，停止运行
                else:
                    non_protocol.append(msg)
            if non_protocol:
                inbox_json = json.dumps(non_protocol)
                messages.append(
                    {"role": "user", "content": "<inbox>" + inbox_json + "</inbox>"}
                )
                return False, True  # 有新消息，需要 LLM 处理
            return False, False  # 无协议消息也无新消息

        # ============================================================
        # 外层 while：队友的主工作循环，每轮 = 收件 + LLM + 执行工具
        # ============================================================
        while not shutdown_requested:
            # ── 步骤 1：检查收件箱，处理协议消息 ──
            should_stop, _ = _process_inbox(name, messages)
            if should_stop:
                shutdown_requested = True
                break

            # ── 步骤 2：LLM 推理 ──
            # 传入最近 20 条消息（上下文窗口控制），获取模型的下一步决策
            try:
                response = client.responses.create(
                    model=MODEL,
                    instructions=system,
                    input=messages[-20:],
                    tools=sub_tools,
                    max_output_tokens=8000,
                )
            except Exception:
                break  # API 异常 → 退出

            messages.extend(as_input_item(item) for item in response.output)
            # ── 步骤 3：无工具调用 → 进入空闲等待循环 ──
            if not function_calls(response):
                while not shutdown_requested:
                    time.sleep(1)  # 每秒轮询一次，避免忙等
                    should_stop, has_new = _process_inbox(name, messages)
                    if should_stop:
                        shutdown_requested = True
                        break
                    if has_new:
                        break  # 有新消息 → 跳出 idle，回到外层 LLM 轮

            # ── 步骤 4：执行工具调用 ──
            # 将 LLM 返回的 function_call 通过 sub_handlers 分发执行
            results = []
            for block in function_calls(response):
                if block.type == "function_call":
                    print(f"\033[35m[{name}] > {block.name}\033[0m")
                    handler = sub_handlers.get(block.name)
                    output = handler(**call_args(block)) if handler else "Unknown"
                    print(f"  \033[35m[{name}] {str(output)[:300]}\033[0m")
                    results.append(
                        {
                            "type": "function_call_output",
                            "call_id": block.call_id,
                            "output": str(output),
                        }
                    )
            messages.extend(results)  # 工具结果追加到 messages，外层循环下一轮

        # ── 循环结束后：发送最终结果给 Lead ──
        summary = "Done."
        for msg in reversed(messages):
            if (
                isinstance(msg, dict)
                and msg.get("role") == "assistant"
                and isinstance(msg.get("content"), list)
            ):
                text = extract_text(msg["content"])
                if not text:
                    continue
                summary = text
                break
        BUS.send(name, "lead", summary, "result")
        active_teammates.pop(name, None)
        print(f"  \033[32m[teammate] {name} finished\033[0m")

    active_teammates[name] = True
    threading.Thread(target=run, daemon=True).start()
    print(f"  \033[36m[teammate] {name} spawned as {role}\033[0m")
    return f"Teammate '{name}' spawned as {role}"


def _teammate_submit_plan(from_name: str, plan: str) -> str:
    """队友向 Lead 提交计划审批。

    注意：这是协议层请求，不是代码级关卡。提交后队友线程继续运行——它仍可调用
    bash/write 等工具。真正的执行约束依赖于模型在收到审批响应前等待。代码级工具
    关卡需要阻塞队友的工具分发，直到审批到达。
    """
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


# ── Lead Protocol Tools (s16 new) ──


def run_request_shutdown(teammate: str) -> str:
    """Lead 向队友发送 shutdown 协议请求，创建 pending_requests 记录。"""
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
    """Lead 要求队友就指定任务提交计划。"""
    BUS.send("lead", teammate, f"Please submit a plan for: {task}", "message")
    return f"Asked {teammate} to submit a plan"


def run_review_plan(request_id: str, approve: bool, feedback: str = "") -> str:
    """Lead 审批队友提交的计划，通过 MessageBus 发送 plan_approval_response。"""
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


# ── Other Lead Tool Handlers ──


def run_spawn_teammate(name: str, role: str, prompt: str) -> str:
    """创建队友线程的入口函数，委托给 spawn_teammate_thread。"""
    return spawn_teammate_thread(name, role, prompt)


def run_send_message(to: str, content: str) -> str:
    """lead 通过 MessageBus 向指定目标发送消息。"""
    BUS.send("lead", to, content)
    return f"Sent to {to}"


def run_check_inbox() -> str:
    """检查 Lead 收件箱，通过 match_response 路由协议响应。"""
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


# ── Tool Dispatch ──


def execute_tool(block) -> str:
    """执行工具调用 block，根据 block.name 分发到对应 handler。"""
    handler = {
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
    }.get(block.name)
    if handler:
        tool_input = call_args(block)
        tool_input.pop("run_in_background", None)
        return handler(**tool_input)
    return f"Unknown tool: {block.name}"


# ── Tool Definitions ──

TOOLS = [
    {
        "type": "function",
        "name": "bash",
        "description": "Run a shell command.",
        "parameters": {
            "type": "object",
            "properties": {
                "command": {"type": "string"},
                "run_in_background": {"type": "boolean"},
            },
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
        "description": "Create a new task with optional blockedBy dependencies.",
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
        "description": "List all tasks with status, owner, and dependencies.",
        "parameters": {"type": "object", "properties": {}, "required": []},
    },
    {
        "type": "function",
        "name": "get_task",
        "description": "Get full details of a specific task by ID.",
        "parameters": {
            "type": "object",
            "properties": {"task_id": {"type": "string"}},
            "required": ["task_id"],
        },
    },
    {
        "type": "function",
        "name": "claim_task",
        "description": "Claim a pending task. Sets owner, changes status to in_progress.",
        "parameters": {
            "type": "object",
            "properties": {"task_id": {"type": "string"}},
            "required": ["task_id"],
        },
    },
    {
        "type": "function",
        "name": "complete_task",
        "description": "Complete an in-progress task. Reports unblocked downstream tasks.",
        "parameters": {
            "type": "object",
            "properties": {"task_id": {"type": "string"}},
            "required": ["task_id"],
        },
    },
    {
        "type": "function",
        "name": "spawn_teammate",
        "description": "Spawn a teammate agent in a background thread.",
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
        "description": "Send message to a teammate via MessageBus.",
        "parameters": {
            "type": "object",
            "properties": {"to": {"type": "string"}, "content": {"type": "string"}},
            "required": ["to", "content"],
        },
    },
    {
        "type": "function",
        "name": "check_inbox",
        "description": "Check Lead's inbox. Routes protocol responses automatically.",
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
        "description": "Approve or reject a submitted plan by request_id.",
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
]


# ── Context ──


def update_context(context: dict, messages: list) -> dict:
    """从当前状态派生上下文信息（工具列表、工作目录、记忆内容）。"""
    memories = ""
    if MEMORY_INDEX.exists():
        content = MEMORY_INDEX.read_text().strip()
        if content:
            memories = content
    return {
        "enabled_tools": [t["name"] for t in TOOLS],
        "workspace": str(WORKDIR),
        "memories": memories,
    }


# ── Agent Loop ──


def agent_loop(messages: list, context: dict):
    """核心 agent 循环：调用 LLM → 执行工具 → 合并后台结果 → 循环直到无 function_call。
    支持后台任务、协议路由和上下文热更新。"""
    system = get_system_prompt(context)
    while True:
        try:
            response = client.responses.create(
                model=MODEL,
                instructions=system,
                input=messages,
                tools=TOOLS,
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
            print(f"\033[36m[lead] > {block.name}\033[0m")

            if should_run_background(block.name, call_args(block)):
                bg_id = start_background_task(block)
                results.append(
                    {
                        "type": "function_call_output",
                        "call_id": block.call_id,
                        "output": f"[Background task {bg_id} started] "
                        f"Result will be available when complete.",
                    }
                )
            else:
                output = execute_tool(block)
                print(f"  \033[36m[lead] {str(output)[:300]}\033[0m")
                results.append(
                    {
                        "type": "function_call_output",
                        "call_id": block.call_id,
                        "output": output,
                    }
                )

        # Responses API requires function_call_output items at the top level.
        messages.extend(results)
        bg_notifications = collect_background_results()
        if bg_notifications:
            messages.append({"role": "user", "content": "\n".join(bg_notifications)})
        context = update_context(context, messages)
        system = get_system_prompt(context)


if __name__ == "__main__":
    print("s16: team protocols")
    print("Enter a question, press Enter to send. Type q to quit. OpenAI version.\n")
    history = []
    context = update_context({}, [])
    while True:
        try:
            query = input("\033[36ms16 >> \033[0m")
        except (EOFError, KeyboardInterrupt):
            break
        if query.strip().lower() in ("q", "exit", "quit"):
            break
        history.append({"role": "user", "content": query})
        agent_loop(history, context)
        context = update_context(context, history)
        for block in history[-1]["content"]:
            # model_dump 后 block 是普通 dict，不能用 getattr
            if isinstance(block, dict) and block.get("type") == "output_text":
                print(block.get("text", ""))

        # Check inbox → route protocol + inject into history
        inbox_msgs = consume_lead_inbox(route_protocol=True)
        if inbox_msgs:
            inbox_text = "\n".join(
                f"From {m['from']}: {m['content'][:200]}" for m in inbox_msgs
            )
            history.append({"role": "user", "content": f"[Inbox]\n{inbox_text}"})
            print(f"\n\033[33m[Inbox: {len(inbox_msgs)} messages injected]\033[0m")
        print()
