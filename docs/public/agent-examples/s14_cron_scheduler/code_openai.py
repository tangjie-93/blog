#!/usr/bin/env python3
"""
s14: Cron Scheduler — independent daemon thread + queue processor.

Run:  python s14_cron_scheduler/code.py
Need: pip install openai python-dotenv + .env with OPENAI_API_KEY

Changes from s13:
  - CronJob dataclass (id, cron, prompt, recurring, durable)
  - cron_matches: 5-field cron expression matching with DOM/DOW OR semantics
  - schedule_job / cancel_job: register/remove cron jobs (with validation)
  - cron_scheduler_loop: independent daemon thread, polls every 1s
  - cron_queue: thread-safe queue, scheduler writes, queue processor delivers
  - queue_processor_loop: auto-runs agent_loop when cron_queue has work
  - Durable storage: .scheduled_tasks.json (survives restart)
  - 3 new tools: schedule_cron, list_crons, cancel_cron

Four layers:
  1. Scheduler: daemon thread checks time → enqueues matching jobs
  2. Queue: cron_queue decouples scheduler from agent loop
  3. Queue processor: wakes the agent when queued work exists and it is idle
  4. Consumer: agent_loop consumes queued jobs and injects them into messages
"""

import os
import sys, json, time, random, threading
from pathlib import Path
from datetime import datetime
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
    "create_task, list_tasks, get_task, claim_task, complete_task, "
    "schedule_cron, list_crons, cancel_cron.",
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


# ── Background Tasks (from s13, synced) ──

_bg_counter = 0
background_tasks: dict[str, dict] = {}
background_results: dict[str, str] = {}
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
    threading.Thread(target=worker, daemon=True).start()
    print(f"  \033[33m[background] dispatched {bg_id}: {cmd[:40]}\033[0m")
    return bg_id


def collect_background_results() -> list[str]:
    """收集已完成的后台任务结果，格式化为 task_notification 消息。完成后从 tracking dict 中移除。"""
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
            f"  \033[32m[background done] {bg_id}: "
            f"{task['command'][:40]} ({len(output)} chars)\033[0m"
        )
    return notifications


# ── Cron Scheduler (s14 new) ──

DURABLE_PATH = WORKDIR / ".scheduled_tasks.json"


@dataclass
class CronJob:
    id: str
    cron: str  # "0 9 * * *"
    prompt: str  # message to inject when triggered
    recurring: bool  # True = recurring, False = one-shot
    durable: bool  # True = persist to disk


# ── Cron 模块全局状态 ──
# 所有已注册的 cron 任务（job_id → CronJob），内存中的主数据源
scheduled_jobs: dict[str, CronJob] = {}
# 开启后显示调度、队列、工具调用等内部轨迹
CRON_DEBUG = os.getenv("CRON_DEBUG", "").lower() in {"1", "true", "yes", "on"}
# 已匹配待投递的任务队列：调度线程 push → agent_loop 消费
cron_queue: list[CronJob] = []
# 保护 scheduled_jobs / cron_queue / _last_queued / _active_cron_ids 的线程锁
cron_lock = threading.Lock()
# 保护 agent_loop 互斥执行：用户输入和 cron 调度不能同时跑
agent_lock = threading.Lock()
# 防一分钟内重复入队：job_id → 上次入队的 "YYYY-MM-DD HH:MM"
_last_queued: dict[str, str] = {}
# 已入队或正在执行的任务，避免慢任务在下一个周期继续堆积
_active_cron_ids: set[str] = set()


def cron_debug(message: str, color: str = "35") -> None:
    """仅在 CRON_DEBUG=1 时输出内部调试轨迹。"""
    if CRON_DEBUG:
        print(f"  \033[{color}m{message}\033[0m")



def _cron_field_matches(field: str, value: int) -> bool:
    """匹配单个 cron 字段：支持 *（任意）、*/n（每 n 步）、,（枚举）、-（范围）、精确值。"""
    if field == "*":
        return True
    if field.startswith("*/"):
        step = int(field[2:])
        return step > 0 and value % step == 0
    if "," in field:
        return any(_cron_field_matches(f.strip(), value) for f in field.split(","))
    if "-" in field:
        lo, hi = field.split("-", 1)
        return int(lo) <= value <= int(hi)
    return value == int(field)


def cron_matches(cron_expr: str, dt: datetime) -> bool:
    """检查 5 字段 cron 表达式是否匹配指定时间。DOM 和 DOW 都受约束时使用 OR 语义。"""
    fields = cron_expr.strip().split()
    if len(fields) != 5:
        return False
    minute, hour, dom, month, dow = fields
    dow_val = (dt.weekday() + 1) % 7  # Python Monday=0 → cron Sunday=0

    m = _cron_field_matches(minute, dt.minute)
    h = _cron_field_matches(hour, dt.hour)
    dom_ok = _cron_field_matches(dom, dt.day)
    month_ok = _cron_field_matches(month, dt.month)
    dow_ok = _cron_field_matches(dow, dow_val)

    # Minute, hour, month must all match
    if not (m and h and month_ok):
        return False
    # DOM and DOW: if both constrained, either matching is enough (OR)
    dom_unconstrained = dom == "*"
    dow_unconstrained = dow == "*"
    if dom_unconstrained and dow_unconstrained:
        return True
    if dom_unconstrained:
        return dow_ok
    if dow_unconstrained:
        return dom_ok
    return dom_ok or dow_ok


def _validate_cron_field(field: str, lo: int, hi: int) -> str | None:
    """校验单个 cron 字段值是否在 [lo, hi] 范围内。合法返回 None，非法返回错误消息。"""
    if field == "*":
        return None
    if field.startswith("*/"):
        step_str = field[2:]
        # str.isdigit() 判断字符串是否 全部由数字字符组成 。
        if not step_str.isdigit():
            return f"Invalid step: {field}"
        step = int(step_str)
        if step <= 0:
            return f"Step must be > 0: {field}"
        return None
    if "," in field:
        for part in field.split(","):
            err = _validate_cron_field(part.strip(), lo, hi)
            if err:
                return err
        return None
    if "-" in field:
        parts = field.split("-", 1)
        if not parts[0].isdigit() or not parts[1].isdigit():
            return f"Invalid range: {field}"
        a, b = int(parts[0]), int(parts[1])
        if a < lo or a > hi or b < lo or b > hi:
            return f"Range {field} out of bounds [{lo}-{hi}]"
        if a > b:
            return f"Range start > end: {field}"
        return None
    if not field.isdigit():
        return f"Invalid field: {field}"
    val = int(field)
    if val < lo or val > hi:
        return f"Value {val} out of bounds [{lo}-{hi}]"
    return None


def validate_cron(cron_expr: str) -> str | None:
    """校验完整 cron 表达式（5 字段）。合法返回 None，非法返回错误消息。"""
    fields = cron_expr.strip().split()
    if len(fields) != 5:
        return f"Expected 5 fields, got {len(fields)}"
    bounds = [(0, 59), (0, 23), (1, 31), (1, 12), (0, 6)]
    names = ["minute", "hour", "day-of-month", "month", "day-of-week"]
    for i, (field, (lo, hi), name) in enumerate(zip(fields, bounds, names)):
        err = _validate_cron_field(field, lo, hi)
        if err:
            return f"{name}: {err}"
    return None


def should_enqueue(
    task_id: str,
    cron: str,
    now: datetime,
    last_queued: dict[str, str],
) -> bool:
    """判断任务是否匹配当前时间，并记录本分钟已入队。调用方须持有对应的锁。"""
    if not cron_matches(cron, now):
        return False

    minute_marker = now.strftime("%Y-%m-%d %H:%M")
    if last_queued.get(task_id) == minute_marker:
        return False  # 本分钟已入队，不重复
    last_queued[task_id] = minute_marker
    return True


def save_durable_jobs():
    """将 durable 任务持久化到 .scheduled_tasks.json。"""
    durable = [asdict(j) for j in scheduled_jobs.values() if j.durable]
    DURABLE_PATH.write_text(json.dumps(durable, indent=2))


def load_durable_jobs():
    """启动时从磁盘加载持久化任务，跳过 cron 表达式无效的条目。"""
    if not DURABLE_PATH.exists():
        return
    try:
        jobs = json.loads(DURABLE_PATH.read_text())
        for j in jobs:
            job = CronJob(**j)
            err = validate_cron(job.cron)
            if err:
                print(f"  \033[31m[cron] skipping invalid job {job.id}: {err}\033[0m")
                continue
            scheduled_jobs[job.id] = job
        valid = [j for j in jobs if j["id"] in scheduled_jobs]
        if valid:
            cron_debug(f"[cron] loaded {len(valid)} durable job(s)")
    except Exception:
        pass


def schedule_job(
    cron: str, prompt: str, recurring: bool = True, durable: bool = True
) -> CronJob | str:
    """注册新的 cron 任务：先校验表达式 → 创建 CronJob → 加锁存入 scheduled_jobs → 持久化。返回 CronJob 或错误字符串。"""
    err = validate_cron(cron)
    if err:
        return err
    job = CronJob(
        id=f"cron_{random.randint(0, 999999):06d}",
        cron=cron,
        prompt=prompt,
        recurring=recurring,
        durable=durable,
    )
    with cron_lock:
        scheduled_jobs[job.id] = job
    if durable:
        save_durable_jobs()
    cron_debug(f"[cron register] {job.id} '{cron}' → {prompt[:40]}")
    return job


def cancel_job(job_id: str) -> str:
    """取消指定 cron 任务：从 scheduled_jobs 移除，如果是 durable 则更新持久化文件。"""
    with cron_lock:
        job = scheduled_jobs.pop(job_id, None)
    if not job:
        return f"Job {job_id} not found"
    if job.durable:
        save_durable_jobs()
    cron_debug(f"[cron cancel] {job_id}", "31")
    return f"Cancelled {job_id}"


def cron_scheduler_loop():
    """独立 daemon 线程：每 1 秒轮询，匹配当前时间的 cron 任务推入队列。
    单个任务异常不影响调度线程；one-shot 任务入队后自动删除。"""
    while True:
        time.sleep(1)
        now = datetime.now()
        with cron_lock:
            for job in list(scheduled_jobs.values()):
                try:
                    if should_enqueue(job.id, job.cron, now, _last_queued):
                        if job.id in _active_cron_ids:
                            cron_debug(f"[cron skipped] {job.id} is already active")
                            continue
                        # 将匹配的任务推入队列
                        cron_queue.append(job)
                        _active_cron_ids.add(job.id)
                        cron_debug(
                            f"[cron queued] {job.id} → {job.prompt[:40]}"
                        )
                        # 从 scheduled_jobs 中移除已入队的任务
                        if not job.recurring:
                            scheduled_jobs.pop(job.id, None)
                            if job.durable:
                                save_durable_jobs()
                except Exception as e:
                    print(f"  \033[31m[cron error] {job.id}: {e}\033[0m")


def consume_cron_queue() -> list[CronJob]:
    """消费 cron_queue 中已入队的任务（由 agent_loop 调用），取出后清空队列。"""
    with cron_lock:
        queued = list(cron_queue)
        cron_queue.clear()
    return queued


def has_cron_queue() -> bool:
    """检查 cron_queue 中是否有待投递的任务。"""
    with cron_lock:
        return bool(cron_queue)


# Load durable jobs on startup, then start scheduler thread
load_durable_jobs()
threading.Thread(target=cron_scheduler_loop, daemon=True).start()
cron_debug("[cron] scheduler thread started")


# ── Cron Tools ──


def run_schedule_cron(
    cron: str, prompt: str, recurring: bool = True, durable: bool = True
) -> str:
    """创建 cron 任务 tool wrapper：调用 schedule_job 并返回友好消息。"""
    result = schedule_job(cron, prompt, recurring, durable)
    if isinstance(result, str):
        return f"Error: {result}"
    return f"Scheduled {result.id}: '{cron}' → {prompt}"


def run_list_crons() -> str:
    """列出 cron 任务 tool wrapper：格式化输出，含类型标签。"""
    with cron_lock:
        jobs = list(scheduled_jobs.values())
    if not jobs:
        return "No cron jobs. Use schedule_cron to add one."
    lines = []
    for j in jobs:
        tag = "recurring" if j.recurring else "one-shot"
        dur = "durable" if j.durable else "session"
        lines.append(f"  {j.id}: '{j.cron}' → {j.prompt[:40]} " f"[{tag}, {dur}]")
    return "\n".join(lines)


def run_cancel_cron(job_id: str) -> str:
    """取消 cron 任务 tool wrapper：调用 cancel_job 删除指定任务。"""
    return cancel_job(job_id)


TOOL_HANDLERS = {
    "bash": run_bash,
    "read_file": run_read,
    "write_file": run_write,
    "create_task": run_create_task,
    "list_tasks": run_list_tasks,
    "get_task": run_get_task,
    "claim_task": run_claim_task,
    "complete_task": run_complete_task,
    "schedule_cron": run_schedule_cron,
    "list_crons": run_list_crons,
    "cancel_cron": run_cancel_cron,
}


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
        "name": "schedule_cron",
        "description": "Schedule a cron job. cron is 5-field: min hour dom month dow.",
        "parameters": {
            "type": "object",
            "properties": {
                "cron": {"type": "string", "description": "5-field cron expression"},
                "prompt": {
                    "type": "string",
                    "description": "Message to inject when triggered",
                },
                "recurring": {
                    "type": "boolean",
                    "description": "True=recurring, False=one-shot",
                },
                "durable": {"type": "boolean", "description": "True=persist to disk"},
            },
            "required": ["cron", "prompt"],
        },
    },
    {
        "type": "function",
        "name": "list_crons",
        "description": "List all registered cron jobs.",
        "parameters": {"type": "object", "properties": {}, "required": []},
    },
    {
        "type": "function",
        "name": "cancel_cron",
        "description": "Cancel a cron job by ID.",
        "parameters": {
            "type": "object",
            "properties": {"job_id": {"type": "string"}},
            "required": ["job_id"],
        },
    },
]


# ── Context ──


def update_context(context: dict, messages: list) -> dict:
    """从真实状态派生上下文：启用的工具列表、工作目录、记忆文件内容。"""
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


# ── Agent Loop (simplified, focused on cron scheduler) ──
# Teaching code keeps a basic agent loop. S11's full error recovery is omitted.
# cron_scheduler_loop produces work; queue_processor_loop wakes this loop when
# queued work exists and no other agent turn is running.


def agent_loop(
    messages: list, context: dict, scheduled_runs: list[CronJob] | None = None
) -> dict:
    """主循环：消费 cron 注入 → LLM 调用 → 工具执行（后台/同步） → 后台通知收集 → 返回 context。
    简化版，不含 s11 的错误恢复。cron_scheduler_loop 生产任务，queue_processor_loop 在空闲时唤醒此循环。"""
    system = get_system_prompt(context)
    scheduled_runs = scheduled_runs if scheduled_runs is not None else []
    while True:
        # Layer 4: consume queued cron jobs → inject as messages
        queued = consume_cron_queue()
        for job in queued:
            scheduled_runs.append(job)
            messages.append({"role": "user", "content": f"[Scheduled] {job.prompt}"})
            started_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            print(f"\n\033[35m[scheduled task] {job.id} @ {started_at}\033[0m")
            print(f"  {job.prompt}")
            cron_debug(f"[inject cron] {job.prompt[:50]}")

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
            return context

        messages.extend(as_input_item(item) for item in response.output)
        if not function_calls(response):
            return context

        results = []
        for block in function_calls(response):
            if block.type != "function_call":
                continue
            cron_debug(f"> {block.name}", "36")

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
                cron_debug(str(output)[:300], "36")
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

        # 后台通知不是工具结果，不复用 call_id；单独作为普通用户文本注入。
        bg_notifications = collect_background_results()
        if bg_notifications:
            messages.append({"role": "user", "content": "\n\n".join(bg_notifications)})
        context = update_context(context, messages)
        system = get_system_prompt(context)


session_history: list = []
session_context = update_context({}, [])


def print_latest_assistant_text(messages: list):
    """打印 messages 中最后一条 assistant 消息的文本内容。"""
    if not messages:
        return
    msg = messages[-1]
    if not isinstance(msg, dict) or msg.get("role") != "assistant":
        return
    text = extract_text(msg)
    if text:
        print(text)


def run_agent_turn_locked(user_query: str | None = None):
    """执行一轮 agent 交互。调用者须持有 agent_lock。可传入用户查询或直接消费 cron 队列。"""
    global session_context
    scheduled_runs: list[CronJob] = []
    if user_query is not None:
        session_history.append({"role": "user", "content": user_query})
    try:
        session_context = agent_loop(session_history, session_context, scheduled_runs)
        session_context = update_context(session_context, session_history)
        if scheduled_runs:
            print("\033[35m[scheduled result]\033[0m")
        print_latest_assistant_text(session_history)
        print()
    finally:
        if scheduled_runs:
            with cron_lock:
                _active_cron_ids.difference_update(job.id for job in scheduled_runs)


def queue_processor_loop():
    """自动投递 daemon 线程：当 agent 空闲且 cron_queue 有任务时，自动运行 agent_loop 处理。"""
    global session_context  # run_agent_turn_locked 会修改 session_context，需要跨循环共享
    while True:
        time.sleep(0.2)  # 200ms 轮询间隔，平衡 CPU 开销和响应速度
        # 第 1 次检查（无锁快速路径）：队列为空直接跳过，大多数时候走到这就 continue 了
        if not has_cron_queue():
            continue
        # 尝试拿 agent 锁；blocking=False 表示用户正在交互时不抢锁，乖乖等下一轮
        if not agent_lock.acquire(blocking=False):
            continue
        try:
            # 第 2 次检查（有锁）：抢到锁了，但队列可能已被 agent_loop 消费光
            if not has_cron_queue():
                continue
            cron_debug("[queue processor] delivering scheduled work")
            run_agent_turn_locked()  # 持有锁运行 agent，消费 cron_queue + 调用 LLM
        finally:
            agent_lock.release()  # 即使 run_agent_turn_locked 抛异常也必须释放锁，否则用户永远无法输入


if __name__ == "__main__":
    print("s14: cron scheduler")
    print("Enter a question, press Enter to send. Type q to quit. OpenAI version.\n")
    # 启动自动投递线程
    threading.Thread(target=queue_processor_loop, daemon=True).start()
    cron_debug("[queue processor] started")
    while True:
        try:
            query = input("\033[36ms14 >> \033[0m")
        except (EOFError, KeyboardInterrupt):
            break
        if query.strip().lower() in ("q", "exit", ""):
            break
        with agent_lock:
            run_agent_turn_locked(query)
