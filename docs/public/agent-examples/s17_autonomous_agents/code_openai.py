#!/usr/bin/env python3
"""
s17: Autonomous Agents — idle poll + auto-claim + WORK/IDLE lifecycle.

Run:  python s17_autonomous_agents/code.py
Need: pip install openai python-dotenv + .env with OPENAI_API_KEY

Changes from s16:
  - scan_unclaimed_tasks: find pending, unowned tasks with deps completed
  - idle_poll: 60s polling loop (inbox + task board), dispatches shutdown in IDLE
  - claim_task: owner check + return value verification
  - Teammate lifecycle: WORK → IDLE → SHUTDOWN
  - Teammate tools: + list_tasks, claim_task, complete_task (5→8)
  - consume_lead_inbox: unified inbox consumer for protocol + context injection
  - Identity re-injection after context compression

ASCII lifecycle:
  WORK: inbox → LLM → tools → (function_call? loop) → (done? → IDLE)
  IDLE: 5s poll → inbox? → WORK / unclaimed? → claim → WORK / 60s? → SHUTDOWN
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
client = OpenAI(**client_kwargs)
MODEL = os.getenv("OPENAI_MODEL", "gpt-5.5")
EXECUTION_LOG = Path(__file__).resolve().parent / "s17_execution.log"


_trace_index = 0
_trace_lock = threading.Lock()
_log_write_failure_reported = False


def actor_label(actor: str) -> str:
    """返回用于控制台和日志文件的智能体身份标签。"""
    return "Lead/主线程" if actor.lower() == "lead" else f"Teammate/{actor}/后台线程"


def _fallback_log_path() -> Path:
    """生成未被当前日志查看器占用的备用日志路径。"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
    return EXECUTION_LOG.with_name(f"{EXECUTION_LOG.stem}_{timestamp}.log")


def _append_execution_log(content: str):
    """追加日志；当前文件被占用时自动切换到备用文件。"""
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
    """将模型非推理输出写入日志，忽略 reasoning 类型内容。"""
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
    """将工具原始返回值写入日志，控制台只保留简洁状态。"""
    payload = json.dumps(output, ensure_ascii=False, indent=2, default=str)
    write_execution_log(
        f"\n[{datetime.now():%H:%M:%S}] {actor_label(actor)} 工具结果：{name}\n"
        f"{payload}\n"
    )


def reset_execution_log():
    """创建当前进程的执行日志文件。"""
    global EXECUTION_LOG
    with _trace_lock:
        try:
            EXECUTION_LOG.write_text("", encoding="utf-8")
        except OSError:
            EXECUTION_LOG = _fallback_log_path()
            _append_execution_log("")


def format_tool_call(name: str, arguments: dict) -> str:
    """将工具名称和参数格式化为便于阅读的调用文本。"""
    values = []
    for value in arguments.values():
        rendered = json.dumps(value, ensure_ascii=False, default=str)
        values.append(rendered if len(rendered) <= 80 else f"{rendered[:77]}...")
    return f"{name}({', '.join(values)})"


def format_tool_result(name: str, output) -> str:
    """将工具执行结果压缩为一行状态，避免刷屏。"""
    text = str(output)
    if text.startswith("Error:"):
        return f"WORK: {name} 失败：{text[:120]}"
    return f"WORK: {name} 完成"


# ── Task System (from s12) ──

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


def _task_path(task_id: str) -> Path:
    """返回指定任务对应的 JSON 存储路径。"""
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
    """将任务对象序列化并写入磁盘。"""
    _task_path(task.id).write_text(json.dumps(asdict(task), indent=2))


def load_task(task_id: str) -> Task:
    """从磁盘读取指定任务并还原为任务对象。"""
    return Task(**json.loads(_task_path(task_id).read_text()))


def list_tasks() -> list[Task]:
    """读取并返回任务目录中的全部任务。"""
    return [
        Task(**json.loads(p.read_text())) for p in sorted(TASKS_DIR.glob("task_*.json"))
    ]


def get_task(task_id: str) -> str:
    """以格式化 JSON 字符串返回指定任务的详情。"""
    task = load_task(task_id)
    return json.dumps(asdict(task), indent=2)


def can_start(task_id: str) -> bool:
    """检查任务的所有前置依赖是否已完成且存在。"""
    task = load_task(task_id)
    for dep_id in task.blockedBy:
        if not _task_path(dep_id).exists():
            return False
        if load_task(dep_id).status != "completed":
            return False
    return True


def claim_task(task_id: str, owner: str = "agent") -> str:
    """在任务可开始且未被占用时，将其分配给指定执行者。"""
    task = load_task(task_id)
    if task.status != "pending":
        return f"Task {task_id} is {task.status}, cannot claim"
    if task.owner:
        return f"Task {task_id} already owned by {task.owner}"
    if not can_start(task_id):
        # 上游未完成依赖
        deps = [
            d
            for d in task.blockedBy
            if _task_path(d).exists() and load_task(d).status != "completed"
        ]
        # 缺失的依赖
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
    actor = "Lead" if owner == "agent" else owner
    trace(actor, f"claim_task({task.subject!r}) -> WORK")
    return f"Claimed {task.id} ({task.subject})"


def complete_task(task_id: str) -> str:
    """将进行中的任务标记为已完成，并返回新解锁任务信息。"""
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
    actor = "Lead" if task.owner == "agent" else task.owner or "未知执行者"
    trace(actor, f"complete_task({task.subject!r}) -> WORK 结束")
    msg = f"Completed {task.id} ({task.subject})"
    if unblocked:
        msg += f"\nUnblocked: {', '.join(unblocked)}"
    return msg


# ── Prompt Assembly (from s10) ──

PROMPT_SECTIONS = {
    "identity": "You are a coding agent. Act, don't explain.",
    "tools": "Available tools: bash, read_file, write_file, "
    "create_task, list_tasks, get_task, claim_task, complete_task, "
    "spawn_teammate, send_message, check_inbox, "
    "request_shutdown, request_plan, review_plan.",
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
        """向目标智能体的收件箱追加一条消息。"""
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
        trace(from_agent, f"发送 {msg_type} 给 {to_agent}: {content[:50]!r}")

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
    """按请求标识关联响应，并更新对应协议请求的状态。"""
    state = pending_requests.get(request_id)
    if not state:
        trace("Lead", f"协议响应未匹配到请求：{request_id}")
        return
    if state.type == "shutdown" and response_type != "shutdown_response":
        trace(
            "Lead", f"协议响应类型不匹配：期望 shutdown_response，收到 {response_type}"
        )
        return
    if state.type == "plan_approval" and response_type != "plan_approval_response":
        trace(
            "Lead",
            f"协议响应类型不匹配：期望 plan_approval_response，收到 {response_type}",
        )
        return
    state.status = "approved" if approve else "rejected"
    trace("Lead", f"协议 {state.type}（{request_id}）已{state.status}")


# ── Autonomous Agent (s17 new) ──

IDLE_POLL_INTERVAL = 5  # seconds
IDLE_TIMEOUT = 60  # seconds

# ── Teammate tool definitions (extracted from spawn_teammate_thread) ──

TEAMMATE_TOOLS = [
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
            "properties": {"path": {"type": "string"}, "content": {"type": "string"}},
            "required": ["path", "content"],
        },
    },
    {
        "type": "function",
        "name": "send_message",
        "description": "Send message to another agent.",
        "parameters": {
            "type": "object",
            "properties": {"to": {"type": "string"}, "content": {"type": "string"}},
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


def scan_unclaimed_tasks() -> list[dict]:
    """查找未分配且所有依赖均已完成的待处理任务。"""
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


def idle_poll(name: str, messages: list, role: str) -> str:
    """Agent 空闲时的自主轮询循环。每 5 秒检查一次收件箱和任务板，持续最多 60 秒。

    这是 s17 "自主 agent" 的核心创新——agent 完成任务后不退出，也不被动等消息，
    而是主动扫描任务板上是否有未分配的任务，有就自动认领并恢复工作。

    返回值控制 agent 的生命周期：
      'shutdown' — 收到 shutdown 协议请求，agent 应停止运行并被销毁
      'work'     — 发现了新工作（收件箱消息或可认领任务），agent 应恢复 agent_loop
      'timeout'  — 60 秒内无事可做，agent 应自行终止
    """

    def finish_idle(result: str, reason: str) -> str:
        """记录空闲阶段的结束原因并返回下一生命周期状态。"""
        trace(name, f"IDLE 结束：{reason} -> {result.upper()}")
        return result

    # 最多循环 IDLE_TIMEOUT/IDLE_POLL_INTERVAL = 60/5 = 12 次
    for poll_count in range(1, IDLE_TIMEOUT // IDLE_POLL_INTERVAL + 1):
        time.sleep(IDLE_POLL_INTERVAL)  # 每 5 秒醒来一次
        trace(name, f"IDLE 第 {poll_count} 次轮询：检查收件箱和待认领任务")

        # ── 第一步：检查收件箱 ──
        inbox = BUS.read_inbox(name)
        if inbox:
            # 协议消息优先 — shutdown_request 必须最先处理
            for msg in inbox:
                if msg.get("type") == "shutdown_request":
                    # 回复 shutdown_response，Leader 收到后 match_response 关联
                    req_id = msg.get("metadata", {}).get("request_id", "")
                    BUS.send(
                        name,
                        "lead",
                        "Shutting down gracefully.",
                        "shutdown_response",
                        {"request_id": req_id, "approve": True},
                    )
                    trace(name, f"IDLE 收到 shutdown 请求 ({req_id})，进入 SHUTDOWN")
                    return finish_idle("shutdown", "收到 shutdown 请求")

            # 收件箱消息打包成 <inbox> JSON 注入 messages，恢复工作
            # 注：此处未做协议过滤（如 plan_approval_response），所有消息原样交给
            # LLM 理解。s16 的 _process_inbox 显式分类处理，s17 简化处理。
            messages.append(
                {"role": "user", "content": "<inbox>" + json.dumps(inbox) + "</inbox>"}
            )
            trace(name, "IDLE 发现收件箱消息，返回 WORK")
            return finish_idle("work", "收到收件箱消息")

        # ── 第二步：主动扫描任务板 ──
        # 这是 "autonomous" 的关键：agent 自己找活干，不需要 Leader 时刻分配
        unclaimed = scan_unclaimed_tasks()  # 查找所有 pending 且无 owner 的任务
        if unclaimed:
            task = unclaimed[0]  # 认领第一个未分配任务
            trace(name, f"scan_unclaimed_tasks()：发现 {task['subject']!r}")
            result = claim_task(task["id"], name)
            if "Claimed" in result:
                # 将认领的任务注入 messages，让 LLM 感知到新任务
                messages.append(
                    {
                        "role": "user",
                        "content": f"<auto-claimed>Task {task['id']}: "
                        f"{task['subject']}</auto-claimed>",
                    }
                )
                return finish_idle("work", f"已认领 {task['subject']!r}")
            # 认领失败（如被其他 agent 抢先），继续下一轮轮询
            trace(name, f"claim_task({task['subject']!r}) 失败：{result}")

    # 60 秒内既没收到消息也没找到任务 → agent 认为无事可做，自愿终止
    trace(name, f"IDLE {IDLE_TIMEOUT}s 内没有新任务，进入 SHUTDOWN")
    return finish_idle("timeout", f"{IDLE_TIMEOUT}s 内无新任务")


# ── Teammate Thread (from s15 + s16 + s17) ──


def _format_task_board() -> str:
    """将任务看板格式化为文本，供队友 LLM 读取。"""
    tasks = list_tasks()
    if not tasks:
        return "No tasks."
    return "\n".join(f"  {t.id}: {t.subject} [{t.status}]" for t in tasks)


def _make_teammate_handlers(name: str) -> dict:
    """为指定名称的队友创建工具处理函数映射。
    从 spawn_teammate_thread 内部提取到模块层，避免每次 spawn 都重新定义。"""
    return {
        "bash": run_bash,
        "read_file": run_read,
        "write_file": run_write,
        "send_message": lambda to, content: (BUS.send(name, to, content), "Sent")[1],
        "submit_plan": lambda plan: _teammate_submit_plan(name, plan),
        "list_tasks": _format_task_board,
        "claim_task": lambda task_id: claim_task(task_id, owner=name),
        "complete_task": lambda task_id: complete_task(task_id),
    }


def spawn_teammate_thread(name: str, role: str, prompt: str) -> str:
    """创建后台线程，启动具备自主轮询能力的队友智能体。"""
    if name in active_teammates:
        return f"Teammate '{name}' already exists"

    system = (
        f"You are '{name}', a {role}. "
        f"Use tools to complete tasks. "
        f"You can list and claim tasks from the board. "
        f"Check inbox for protocol messages."
    )

    def handle_inbox_message(name: str, msg: dict, messages: list):
        """按消息类型处理队友收到的协议消息。"""
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
            trace(name, f"WORK 收到 shutdown 请求 ({req_id})，进入 SHUTDOWN")
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
        """执行队友的工作、空闲轮询和退出生命周期。"""
        messages = [{"role": "user", "content": prompt}]
        sub_handlers = _make_teammate_handlers(name)
        trace(name, f"线程启动（角色：{role}），进入 WORK")

        # ═══════════════════════════════════════════════════════════
        # WORK → IDLE 循环（s17 自主 agent 的核心生命周期）
        # ═══════════════════════════════════════════════════════════
        # 每轮外层迭代 = 一次 WORK 阶段（最多 10 轮 LLM）→ 一次 IDLE 阶段（60s 轮询）
        # 循环不设次数上限，直到 shutdown 或 timeout 才退出
        while True:
            # ── WORK 阶段：最多 10 轮 LLM 推理+工具执行 ──
            # 每轮 = 收件 → LLM → 执行工具。无工具调用或 shutdown 时退出 WORK。
            should_shutdown = False
            for _ in range(10):
                # 步骤 1：处理收件箱协议消息
                inbox = BUS.read_inbox(name)  # 破坏性消费
                for msg in inbox:
                    stopped = handle_inbox_message(name, msg, messages)
                    if stopped:  # shutdown_request → 标记退出
                        should_shutdown = True
                        break
                if should_shutdown:
                    break  # 退出 for _ in range(10)

                # 步骤 2：非协议的普通消息 → 注入 messages（仅注入 type=="message"）
                if inbox and not should_shutdown:
                    non_protocol = [m for m in inbox if m.get("type") == "message"]
                    if non_protocol:
                        messages.append(
                            {
                                "role": "user",
                                "content": f"<inbox>{json.dumps(non_protocol)}</inbox>",
                            }
                        )

                # 步骤 3：LLM 推理（传入最近 20 条消息做上下文窗口控制）
                try:
                    trace(name, "WORK：调用大模型")
                    response = client.responses.create(
                        model=MODEL,
                        instructions=system,
                        input=messages[-10:],
                        tools=TEAMMATE_TOOLS,
                        max_output_tokens=8000,
                    )
                except Exception as error:
                    trace(name, f"WORK：模型请求失败：{type(error).__name__}: {error}")
                    break  # API 异常 → 退出 WORK，进入 IDLE

                record_model_response(name, response)
                messages.extend(as_input_item(item) for item in response.output)

                # 步骤 4：无工具调用 → LLM 认为任务完成，退出 WORK，进入 IDLE
                if not function_calls(response):
                    trace(name, "WORK 没有新的工具调用，进入 IDLE")
                    break

                # 步骤 5：执行工具调用
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

            # shutdown 信号传播：从内层 for 到外层 while
            if should_shutdown:
                break

            # ── IDLE 阶段（s17 新增）──
            # 完成当前工作后进入空闲轮询，主动寻找新任务或等待新消息。
            # idle_poll 返回 "work" 时循环继续（回到 WORK），"shutdown"/"timeout" 时退出。
            idle_result = idle_poll(name, messages, role)
            if idle_result in ("shutdown", "timeout"):
                break

        # Summary
        summary = "Done."
        for msg in reversed(messages):
            if msg.get("role") == "assistant" and isinstance(msg.get("content"), list):
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

    active_teammates[name] = True
    threading.Thread(target=run, daemon=True).start()
    return f"Teammate '{name}' spawned as {role} (autonomous)"


def _teammate_submit_plan(from_name: str, plan: str) -> str:
    """将队友计划作为审批请求发送给主智能体。"""
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
    """向指定队友发送优雅退出请求。"""
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
    trace("Lead", f"已请求 {teammate} 优雅退出（{req_id}）")
    return f"Shutdown request sent to {teammate} (req: {req_id})"


def run_request_plan(teammate: str, task: str) -> str:
    """请求指定队友为给定任务提交执行计划。"""
    BUS.send("lead", teammate, f"Please submit a plan for: {task}", "message")
    return f"Asked {teammate} to submit a plan"


def run_review_plan(request_id: str, approve: bool, feedback: str = "") -> str:
    """审批或驳回指定计划请求，并将结果通知提交者。"""
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
    trace("Lead", f"计划请求 {request_id} 已{'批准' if approve else '驳回'}")
    return f"Plan {'approved' if approve else 'rejected'} ({request_id})"


# ── Basic tool handlers ──


def run_create_task(
    subject: str, description: str = "", blockedBy: list[str] | None = None
) -> str:
    """创建任务并返回面向工具调用的结果文本。"""
    task = create_task(subject, description, blockedBy)
    deps = f" (blockedBy: {', '.join(blockedBy)})" if blockedBy else ""
    return f"Created {task.id}: {task.subject}{deps}"


def run_list_tasks() -> str:
    """以文本形式返回任务看板中的全部任务。"""
    tasks = list_tasks()
    if not tasks:
        return "No tasks."
    return "\n".join(f"  {t.id}: {t.subject} [{t.status}]" for t in tasks)


def run_get_task(task_id: str) -> str:
    """返回指定任务的完整详情。"""
    return get_task(task_id)


def run_claim_task(task_id: str) -> str:
    """以主智能体身份领取指定任务。"""
    return claim_task(task_id, owner="agent")


def run_complete_task(task_id: str) -> str:
    """完成指定任务并返回执行结果。"""
    return complete_task(task_id)


def run_spawn_teammate(name: str, role: str, prompt: str) -> str:
    """启动指定名称和角色的自主队友。"""
    return spawn_teammate_thread(name, role, prompt)


def run_send_message(to: str, content: str) -> str:
    """以主智能体身份向指定队友发送消息。"""
    BUS.send("lead", to, content)
    return f"Sent to {to}"


def consume_lead_inbox(route_protocol=True) -> list[dict]:
    """读取主智能体收件箱，可选地处理其中的协议响应。"""
    msgs = BUS.read_inbox("lead")
    for msg in msgs:
        trace(
            "Lead",
            f"consume_lead_inbox()：收到 {msg['from']} 的 {msg['type']}: {msg['content'][:120]!r}",
        )
    if route_protocol:
        for msg in msgs:
            meta = msg.get("metadata", {})
            req_id = meta.get("request_id", "")
            msg_type = msg.get("type", "")
            if req_id and msg_type.endswith("_response"):
                match_response(msg_type, req_id, meta.get("approve", False))
    return msgs


def run_check_inbox() -> str:
    """读取主智能体收件箱并格式化为工具调用结果。"""
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
}


# ── Context ──

MEMORY_DIR = WORKDIR / ".memory"
MEMORY_INDEX = MEMORY_DIR / "MEMORY.md"


def update_context(context: dict, messages: list) -> dict:
    """从记忆索引读取内容，构造下一轮提示词上下文。"""
    memories = ""
    if MEMORY_INDEX.exists():
        memories = MEMORY_INDEX.read_text()[:2000]
    return {"memories": memories}


# ── Agent Loop ──


def agent_loop(messages: list, context: dict):
    """持续调用模型和工具，直到模型结束回复或发生调用异常。"""
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
            trace("Lead", format_tool_call(block.name, arguments))
            handler = TOOL_HANDLERS.get(block.name)
            output = handler(**arguments) if handler else "Unknown"
            result = "失败" if str(output).startswith("Error:") else "完成"
            trace("Lead", f"{block.name} {result}")
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
    log_path_message = f"执行日志文件：{EXECUTION_LOG}"
    print(log_path_message)
    print("s17: autonomous agents")
    print("Enter a question, press Enter to send. Type q to quit. OpenAI version.\n")
    history = []
    context = {"memories": ""}
    while True:
        try:
            query = input("\033[36ms17 >> \033[0m")
        except (EOFError, KeyboardInterrupt):
            break
        if query.strip().lower() in ("q", "exit", ""):
            break
        trace("Lead", f"收到用户指令：{query!r}")
        history.append({"role": "user", "content": query})
        agent_loop(history, context)
        context = update_context(context, history)
        for block in history[-1]["content"]:
            # model_dump 后 block 是普通 dict，不能用 getattr
            if isinstance(block, dict) and block.get("type") == "output_text":
                trace("Lead", f"回复：{block.get('text', '')[:200]!r}")

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
