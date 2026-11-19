#!/usr/bin/env python3
"""
s13: Background Tasks — thread-based async execution + notification injection.

Run:  python s13_background_tasks/code.py
Need: pip install openai python-dotenv + .env with OPENAI_API_KEY

Changes from s12:
  - threading.Thread for background execution
  - background_tasks dict for lifecycle tracking (bg_id, command, status)
  - background_results dict + threading.Lock for thread-safe storage
  - should_run_background: model explicit request via run_in_background param
  - is_slow_operation: fallback heuristic when model doesn't specify
  - start_background_task: dispatch to daemon thread, return bg task id
  - collect_background_results: gather completed, return as notifications
  - agent_loop: slow ops → background + placeholder, inject notifications
  - Notifications use <task_notification> format, not reused call_id

Note: Teaching code keeps a basic agent loop to stay focused on background
tasks. S11's full error recovery (RecoveryState, backoff, escalation,
reactive compact, fallback model) is omitted.
"""

import os
import sys, json, time, random, threading
from pathlib import Path
from dataclasses import dataclass, asdict

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
    run_bash as _run_bash,
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


# 桥接函数：common/ 的 run_bash 只接受 command 参数，s13-s15 额外传入 run_in_background 用于判断是否后台执行
def run_bash(command: str, run_in_background: bool = False) -> str:
    """执行 bash 命令的桥接函数。run_in_background 参数由工具调用传入，在 should_run_background 中使用。"""
    return _run_bash(command)


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
    """返回任务 JSON 文件的路径。"""
    return TASKS_DIR / f"{task_id}.json"


def create_task(
    subject: str, description: str = "", blockedBy: list[str] | None = None
) -> Task:
    """创建新任务：生成唯一 id，初始状态 pending，持久化到 .tasks/ 目录。"""
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
    """将 Task 对象序列化为 JSON 写入 .tasks/<id>.json。"""
    _task_path(task.id).write_text(json.dumps(asdict(task), indent=2))


def load_task(task_id: str) -> Task:
    """从 .tasks/<id>.json 反序列化并重建 Task 对象。"""
    return Task(**json.loads(_task_path(task_id).read_text()))


def list_tasks() -> list[Task]:
    """列出所有任务（按文件名排序）。"""
    return [
        Task(**json.loads(p.read_text())) for p in sorted(TASKS_DIR.glob("task_*.json"))
    ]


def get_task(task_id: str) -> str:
    """返回单个任务的完整 JSON 详情。"""
    task = load_task(task_id)
    return json.dumps(asdict(task), indent=2)


def can_start(task_id: str) -> bool:
    """检查任务的所有 blockedBy 依赖是否已完成。依赖文件不存在也视为阻塞。"""
    task = load_task(task_id)
    for dep_id in task.blockedBy:
        if not _task_path(dep_id).exists():
            return False
        if load_task(dep_id).status != "completed":
            return False
    return True


def claim_task(task_id: str, owner: str = "agent") -> str:
    """认领任务：检查是否 pending 且依赖已满足，设置 owner 并将状态改为 in_progress。"""
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
    """完成任务：将状态改为 completed，报告哪些下游任务的依赖被解除。"""
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
    "create_task, list_tasks, get_task, claim_task, complete_task.",
    "workspace": f"Working directory: {WORKDIR}",
    "memory": "Relevant memories are injected below when available.",
}


def assemble_system_prompt(context: dict) -> str:
    """根据上下文拼接 system prompt，始终加载 identity/tools/workspace，有记忆时追加 memory 片段。"""
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
    """缓存包装：context 未变时复用上次拼装结果，用 json.dumps 做确定性序列化。"""
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
    """创建任务 tool wrapper：调用 create_task 并返回友好消息。"""
    task = create_task(subject, description, blockedBy)
    deps = f" (blockedBy: {', '.join(blockedBy)})" if blockedBy else ""
    print(f"  \033[34m[create] {task.subject}{deps}\033[0m")
    return f"Created {task.id}: {task.subject}{deps}"


def run_list_tasks() -> str:
    """列出任务 tool wrapper：格式化输出任务列表，含状态图标和依赖信息。"""
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
    """查看任务详情 tool wrapper：返回任务的完整 JSON。"""
    try:
        return get_task(task_id)
    except FileNotFoundError:
        return f"Error: Task {task_id} not found"


def run_claim_task(task_id: str) -> str:
    """认领任务 tool wrapper：以 agent 身份认领指定任务。"""
    return claim_task(task_id, owner="agent")


def run_complete_task(task_id: str) -> str:
    """完成任务 tool wrapper：调用 complete_task 并报告解除的依赖。"""
    return complete_task(task_id)


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
}


# ── Background Tasks (s13 new) ──

_bg_counter = 0
background_tasks: dict[str, dict] = {}  # bg_id → {call_id, command, status}
background_results: dict[str, str] = {}  # bg_id → output
pending_background_notifications: list[str] = []  # queued for next user turn
background_lock = threading.Lock()


def is_slow_operation(tool_name: str, tool_input: dict) -> bool:
    """启发式判断是否为耗时操作（可能 > 30s），基于关键词匹配。"""
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
    """判断命令是否应在后台执行。模型显式指定（run_in_background）优先，否则用启发式判断。"""
    if tool_input.get("run_in_background"):
        return True
    return is_slow_operation(tool_name, tool_input)


def execute_tool(block) -> str:
    """执行工具调用并返回输出。"""
    handler = TOOL_HANDLERS.get(block.name)
    if handler:
        # ** 把 dict 拆成 key=value 的形式传进去。
        return handler(**call_args(block))
    return f"Unknown tool: {block.name}"


def start_background_task(block) -> str:
    """在 daemon 线程中执行工具。返回后台任务 ID（bg_0001 格式）。"""
    global _bg_counter
    _bg_counter += 1
    bg_id = f"bg_{_bg_counter:04d}"
    cmd = call_args(block).get("command", block.name)

    def worker():
        result = execute_tool(block)
        with background_lock:
            background_tasks[bg_id]["status"] = "completed"
            background_results[bg_id] = result

    with background_lock:
        background_tasks[bg_id] = {
            "call_id": block.call_id,
            "command": cmd,
            "status": "running",
        }
    thread = threading.Thread(target=worker, daemon=True)
    thread.start()
    print(f"  \033[33m[background] dispatched {bg_id}: {cmd[:40]}\033[0m")
    print("  \033[33m[background] result will be shown before the next prompt\033[0m")
    return bg_id


def collect_background_results() -> list[str]:
    """收集已完成的后台任务结果，格式化为 task_notification 消息。完成后从 tracking dict 中移除。"""
    with background_lock:
        # 只收集已完成的任务。
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
            f"  \033[32m[background done] {bg_id}: "
            f"{task['command'][:40]} ({len(output)} chars)\033[0m"
        )
    return notifications


def inject_pending_background_notifications(messages: list):
    """把已完成后台任务通知注入到下一轮用户输入之前。

    后台任务可能在 agent_loop 返回后才完成，因此不能只在工具循环末尾收集。
    每次用户输入新问题前都主动收集一次，保证下一轮 LLM 能看到完成通知。
    """
    bg_notifications = collect_background_results()
    if bg_notifications:
        pending_background_notifications.extend(bg_notifications)

    if not pending_background_notifications:
        return

    notification_text = "\n\n".join(pending_background_notifications)
    messages.append({"role": "user", "content": notification_text})
    print(
        f"  \033[32m[inject] {len(pending_background_notifications)} "
        f"background notification(s)\033[0m"
    )
    pending_background_notifications.clear()


# ── Context ──


def update_context(context: dict, messages: list) -> dict:
    """从真实状态派生上下文：当前启用的工具列表、工作目录、是否加载了记忆文件。"""
    memories = ""
    if MEMORY_INDEX.exists():
        content = MEMORY_INDEX.read_text().strip()
        if content:
            memories = content
    return {
        "enabled_tools": list(TOOL_HANDLERS.keys()),
        "workspace": str(WORKDIR),
        "memories": memories,
    }


# ── Agent Loop (simplified, focused on background tasks) ──


def agent_loop(messages: list, context: dict):
    """主循环：调用 LLM → 处理工具调用 → 耗时操作放进后台线程 → 注入后台任务完成通知 → 循环。
    简化版，不含 s11 的错误恢复。"""
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
            print(f"\033[36m> {block.name}\033[0m")

            if should_run_background(block.name, call_args(block)):
                bg_id = start_background_task(block)
                results.append(
                    {
                        "type": "function_call_output",
                        "call_id": block.call_id,
                        "output": f"[Background task {bg_id} started] "
                        f"Command: {call_args(block).get('command', '')}. "
                        f"Result will be available when complete.",
                    }
                )
            else:
                output = execute_tool(block)
                results.append(
                    {
                        "type": "function_call_output",
                        "call_id": block.call_id,
                        "output": output,
                    }
                )

        # 先把工具结果按 Responses API 约定作为顶层输入项追加。
        # 这样模型下一轮能正确把 function_call_output 和原始 function_call 对上。
        messages.extend(results)

        # 已完成的后台任务立即注入当前请求；仍在运行的任务由下一轮用户输入前补发。
        bg_notifications = collect_background_results()
        if bg_notifications:
            messages.extend(
                {"role": "user", "content": notification}
                for notification in bg_notifications
            )
            print(
                f"  \033[32m[inject] {len(bg_notifications)} background "
                f"notification(s)\033[0m"
            )
        context = update_context(context, messages)
        system = get_system_prompt(context)


if __name__ == "__main__":
    print("s13: background tasks")
    print("Enter a question, press Enter to send. Type q to quit. OpenAI version.\n")
    history = []
    context = update_context({}, [])
    while True:
        try:
            query = input("\033[36ms13 >> \033[0m")
        except (EOFError, KeyboardInterrupt):
            break
        if query.strip().lower() in ("q", "exit", ""):
            break
        inject_pending_background_notifications(history)
        history.append({"role": "user", "content": query})
        response = agent_loop(history, context)
        context = update_context(context, history)
        # Print only the current response to avoid repeating prior history.
        text = extract_text(response)
        if text:
            print(text)
        print()
