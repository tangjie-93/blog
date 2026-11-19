#!/usr/bin/env python3
"""
s08_context_compact.py - Context Compact

Four-layer compaction pipeline inserted before LLM calls:

    L1: snip_compact      — trim middle messages when count > 50
    L2: micro_compact     — replace old function_call_outputs with placeholders
    L3: function_call_output_budget — persist large results to disk
    L4: compact_history   — LLM full summary (1 API call)

    Emergency: reactive_compact — when API still returns prompt_too_long

    ┌─────────────────────────────────────────────────────────────┐
    │  messages[]                                                 │
    │    ↓                                                        │
    │  L3 budget ─→ L1 snip ─→ L2 micro ─→ [token > threshold?]  │
    │                                      ├─ No  → LLM          │
    │                                      └─ Yes → L4 summary   │
    │                                              ↓              │
    │                                          LLM call           │
    │                                    [prompt_too_long?]        │
    │                                      └─ Yes → reactive      │
    └─────────────────────────────────────────────────────────────┘

Core principle: cheap first, expensive last.
Execution order matches CC source: budget → snip → micro → auto.

Builds on s07 (skill loading). Usage:

    python s08_context_compact/code.py
    Needs: pip install openai python-dotenv + OPENAI_API_KEY in .env
"""

import json, os, time
import sys
from pathlib import Path

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
SKILLS_DIR = WORKDIR / "skills"
TRANSCRIPT_DIR = WORKDIR / ".transcripts"
TOOL_RESULTS_DIR = WORKDIR / ".task_outputs" / "tool-results"
client = OpenAI(**client_kwargs)
MODEL = os.getenv("OPENAI_MODEL", "gpt-5.5")

# OpenAI Responses API helpers


CURRENT_TODOS: list[dict] = []
tools_configure(WORKDIR, CURRENT_TODOS)


# s07: 技能目录扫描（从 s07 继承）
def _parse_frontmatter(text: str) -> tuple[dict, str]:
    """解析 SKILL.md 的 YAML frontmatter，返回 (元数据, 正文)。"""
    if not text.startswith("---"):
        return {}, text
    parts = text.split("---", 2)
    if len(parts) < 3:
        return {}, text
    meta = {}
    for line in parts[1].strip().splitlines():
        if ":" in line:
            k, v = line.split(":", 1)
            meta[k.strip()] = v.strip().strip('"').strip("'")
    return meta, parts[2].strip()


SKILL_REGISTRY: dict[str, dict] = {}


def _scan_skills():
    """扫描 skills/ 目录，将技能元数据填充到 SKILL_REGISTRY。"""
    if not SKILLS_DIR.exists():
        return
    for d in sorted(SKILLS_DIR.iterdir()):
        if not d.is_dir():
            continue
        manifest = d / "SKILL.md"
        if manifest.exists():
            raw = manifest.read_text()
            meta, body = _parse_frontmatter(raw)
            name = meta.get("name", d.name)
            desc = meta.get("description", body.split("\n")[0].lstrip("#").strip())
            SKILL_REGISTRY[name] = {"name": name, "description": desc, "content": body}


_scan_skills()


def list_skills() -> str:
    """列出所有已注册技能（名称 + 一行描述）。"""
    if not SKILL_REGISTRY:
        return "(no skills found)"
    return "\n".join(
        f"- **{s['name']}**: {s['description']}" for s in SKILL_REGISTRY.values()
    )


def load_skill(name: str) -> str:
    """按名称加载技能的完整 SKILL.md 内容。通过注册表查找，避免路径遍历。"""
    skill = SKILL_REGISTRY.get(name)
    if not skill:
        return f"Skill not found: {name}"
    return skill["content"]


# s08: SYSTEM 包含技能目录（从 s07 build_system 继承）
def build_system() -> str:
    """构建 SYSTEM 提示词，注入技能目录供 LLM 按需加载。"""
    catalog = list_skills()
    return (
        f"You are a coding agent at {WORKDIR}. "
        f"Skills available:\n{catalog}\n"
        "Use load_skill to get full details when needed."
    )


SYSTEM = build_system()

# s08: subagent gets its own system prompt — no compact, no skill loading
SUB_SYSTEM = (
    f"You are a coding agent at {WORKDIR}. "
    "Complete the task you were given, then return a concise summary. "
    "Do not delegate further."
)


# ═══════════════════════════════════════════════════════════
#  从 s02-s07 继承：基础工具函数（已提取到 common/）
# ═══════════════════════════════════════════════════════════


# ═══════════════════════════════════════════════════════════
#  从 s06-s07 继承：子 Agent
# ═══════════════════════════════════════════════════════════

SUB_TOOLS = [
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
            "properties": {"path": {"type": "string"}},
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
        "name": "edit_file",
        "description": "Replace exact text in a file once.",
        "parameters": {
            "type": "object",
            "properties": {
                "path": {"type": "string"},
                "old_text": {"type": "string"},
                "new_text": {"type": "string"},
            },
            "required": ["path", "old_text", "new_text"],
        },
    },
    {
        "type": "function",
        "name": "glob",
        "description": "Find files matching a glob pattern.",
        "parameters": {
            "type": "object",
            "properties": {"pattern": {"type": "string"}},
            "required": ["pattern"],
        },
    },
]
SUB_HANDLERS = {
    "bash": run_bash,
    "read_file": run_read,
    "write_file": run_write,
    "edit_file": run_edit,
    "glob": run_glob,
}


def spawn_subagent(description: str) -> str:
    """在隔离上下文中运行子 agent，只返回最终结论。"""
    print(f"\n\033[35m[Subagent spawned]\033[0m")
    messages = [{"role": "user", "content": description}]
    for _ in range(30):
        response = client.responses.create(
            model=MODEL,
            instructions=SUB_SYSTEM,
            input=messages,
            tools=SUB_TOOLS,
            max_output_tokens=8000,
        )
        # 将 LLM 输出追加到消息历史，转成普通 dict 供后续压缩逻辑处理
        messages.extend(as_input_item(item) for item in response.output)
        if not function_calls(response):
            break  # LLM 没有请求工具调用 → 得出最终结论
        results = []
        for block in function_calls(response):
            if block.type == "function_call":
                blocked = trigger_hooks("PreToolUse", block)
                if blocked:
                    # 被 hook 拦截，仍然回填结果
                    results.append(
                        {
                            "type": "function_call_output",
                            "call_id": block.call_id,
                            "output": str(blocked),
                        }
                    )
                    continue
                handler = SUB_HANDLERS.get(block.name)
                output = (
                    handler(**call_args(block)) if handler else f"Unknown: {block.name}"
                )
                trigger_hooks("PostToolUse", block, output)
                print(f"  \033[90m[sub] {block.name}: {str(output)[:100]}\033[0m")
                results.append(
                    {
                        "type": "function_call_output",
                        "call_id": block.call_id,
                        "output": output,
                    }
                )
        messages.extend(results)
    # 循环结束：取最后一轮的纯文本作为最终结论
    result = response.output_text
    if not result:
        # 兜底：从历史消息中逆序查找 assistant 的文本回复
        for msg in reversed(messages):
            if msg["role"] == "assistant":
                result = extract_text(msg["content"])
                if result:
                    break
        if not result:
            result = "Subagent stopped after 30 turns without final answer."
    print(f"\033[35m[Subagent done]\033[0m")
    return result


# ═══════════════════════════════════════════════════════════
#  s08 新增：四层压缩管线
# ═══════════════════════════════════════════════════════════

CONTEXT_LIMIT = 50000  # 自动触发 L4 LLM 摘要的 token 阈值
KEEP_RECENT = 2  # micro compact 保留的最近工具结果数；读 3 个文件时可观察到压缩
PERSIST_THRESHOLD = 30000  # 工具输出持久化到磁盘的字符阈值


def estimate_size(msgs):
    """估算消息列表的近似字符数（用于判断是否需要压缩上下文）。"""
    return len(str(msgs))


def _block_type(block):
    """获取消息块（dict 或 Pydantic 对象）的 type 字段。"""
    return (
        block.get("type") if isinstance(block, dict) else getattr(block, "type", None)
    )


def _message_has_function_call(msg):
    """判断一条 assistant 消息是否包含 function_call 块。"""
    if msg.get("role") != "assistant":
        return False
    content = msg.get("content")
    if not isinstance(content, list):
        return False
    return any(_block_type(block) == "function_call" for block in content)


def _is_function_call_output_message(msg):
    """判断一条 user 消息是否包含 function_call_output 块。"""
    if msg.get("role") != "user":
        return False
    content = msg.get("content")
    if not isinstance(content, list):
        return False
    return any(
        isinstance(block, dict) and block.get("type") == "function_call_output"
        for block in content
    )


# L1: snipCompact — 裁剪中间消息（0 次 API 调用，最便宜）


def snip_compact(messages, max_messages=50):
    """L1 压缩(裁剪压缩)：当消息数超过阈值时，保留首尾，裁剪中间消息并插入占位标记。"""
    if len(messages) <= max_messages:
        return messages

    # 保留策略：3 条头部消息 + (max_messages - 3) 条尾部消息
    # 例如 max_messages=50, 共 60 条 → 保留 [0:3] + [13:60]，中间 10 条被裁
    head_end = 3  # 头部截止位置（含前 3 条）
    tail_start = len(messages) - (max_messages - 3)  # 尾部起始位置

    # 防止 function_call 和它的返回结果被"拦腰切断"
    # 例如: [..., assistant(function_call), user(function_call_output), ...]
    #       ↑ head_end-1    ← 如果这是 function_call
    #            ↑ head_end ← 且这是它的 output，需要一起保留，否则 LLM 看到不配对的消息
    if head_end > 0 and _message_has_function_call(messages[head_end - 1]):
        while head_end < len(messages) and _is_function_call_output_message(
            messages[head_end]
        ):
            head_end += 1

    # 同理：防止 function_call 和它的 output 在尾部被"拦腰切断"
    # 例如: [..., assistant(function_call), user(function_call_output), ...]
    #             ← tail_start-1 是 function_call
    #                      ← tail_start 是 function_call_output
    # 把 function_call 也纳入保留范围，保证配对完整
    has_tail = tail_start > 0 and tail_start < len(messages)
    if (
        has_tail
        and _is_function_call_output_message(messages[tail_start])
        and _message_has_function_call(messages[tail_start - 1])
    ):
        tail_start -= 1

    # 首尾保留区间重叠 → 消息不够裁，原样返回
    if head_end >= tail_start:
        return messages

    # 拼接：头部保留部分 + 占位标记 + 尾部保留部分
    snipped = tail_start - head_end  # 被裁剪掉的消息数
    return (
        messages[:head_end]
        + [{"role": "user", "content": f"[snipped {snipped} messages]"}]
        + messages[tail_start:]
    )


# L2: microCompact — 旧结果替换为占位符（0 次 API 调用）


def collect_function_call_outputs(messages):
    """收集消息列表中所有的 function_call_output 块，返回 (消息索引, 块索引, 块)。"""
    blocks = []
    for mi, msg in enumerate(messages):
        if isinstance(msg, dict) and msg.get("type") == "function_call_output":
            blocks.append((mi, None, msg))
            continue
        if not isinstance(msg, dict):
            continue
        if msg.get("role") != "user" or not isinstance(msg.get("content"), list):
            continue
        for bi, block in enumerate(msg["content"]):
            if isinstance(block, dict) and block.get("type") == "function_call_output":
                blocks.append((mi, bi, block))
    return blocks


def _tool_output(block: dict) -> str:
    """读取 function_call_output 的文本，兼容 Responses API 的 output 和旧版 content 字段。"""
    return str(block.get("output", block.get("content", "")))


def _set_tool_output(block: dict, value: str):
    """写回 function_call_output 的文本，保持原字段形态。"""
    key = "output" if "output" in block else "content"
    block[key] = value


def micro_compact(messages):
    """L2 压缩(微压缩)：将较早的工具输出替换为占位文本，只保留最近的 KEEP_RECENT 个。"""
    function_call_outputs = collect_function_call_outputs(messages)
    if len(function_call_outputs) <= KEEP_RECENT:
        return messages
    compacted = 0
    for _, _, block in function_call_outputs[:-KEEP_RECENT]:
        if len(_tool_output(block)) > 120:
            _set_tool_output(
                block, "[Earlier tool result compacted. Re-run if needed.]"
            )
            compacted += 1
    if compacted:
        print(f"[micro compact] compacted {compacted} earlier tool result(s)")
    return messages


# L3: toolResultBudget — 将大型工具输出持久化到磁盘（0 次 API 调用）
def persist_large_output(call_id, output):
    """将超过阈值的大型工具输出写入磁盘文件，返回 <persisted-output> 标签。"""
    if len(output) <= PERSIST_THRESHOLD:
        return output
    TOOL_RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    path = TOOL_RESULTS_DIR / f"{call_id}.txt"
    if not path.exists():
        path.write_text(output)
    return f"<persisted-output>\nFull output: {path}\nPreview:\n{output[:2000]}\n</persisted-output>"


def function_call_output_budget(messages, max_bytes=200_000):
    """L3 压缩：当最新消息中工具输出总大小超过限制时，将最大的结果持久化到磁盘。"""
    blocks = [(mi, block) for mi, _, block in collect_function_call_outputs(messages)]
    # 计算所有块的内容总大小（字节）
    total = sum(len(_tool_output(b)) for _, b in blocks)
    if total <= max_bytes:
        return messages
    # 按内容大小降序排列，优先持久化最大的结果
    ranked = sorted(blocks, key=lambda p: len(_tool_output(p[1])), reverse=True)
    persisted = 0
    for _, block in ranked:
        if total <= max_bytes:
            break
        content = _tool_output(block)
        if len(content) <= PERSIST_THRESHOLD:
            continue
        tid = block.get("call_id", "unknown")
        _set_tool_output(block, persist_large_output(tid, content))
        persisted += 1
        total = sum(len(_tool_output(b)) for _, b in blocks)
    if persisted:
        print(f"[tool result budget] persisted {persisted} large tool result(s)")
    return messages


# L4: autoCompact — LLM 全文摘要（1 次 API 调用，最昂贵）


def write_transcript(messages):
    """将完整对话历史以 JSONL 格式写入 .transcripts/ 目录，用于存档回溯。"""
    TRANSCRIPT_DIR.mkdir(parents=True, exist_ok=True)
    path = TRANSCRIPT_DIR / f"transcript_{int(time.time())}.jsonl"
    with path.open("w") as f:
        for msg in messages:
            f.write(json.dumps(msg, default=str) + "\n")
    return path


def summarize_history(messages):
    """调用 LLM 将对话历史总结为精简摘要，保留目标、决策、文件变更等关键信息。"""
    conversation = json.dumps(messages, default=str)[:80000]
    prompt = (
        "Summarize this coding-agent conversation so work can continue.\n"
        "Preserve: 1. current goal, 2. key findings/decisions, 3. files read/changed, "
        "4. remaining work, 5. user constraints.\nBe compact but concrete.\n\n"
        + conversation
    )
    response = client.responses.create(
        model=MODEL, input=[{"role": "user", "content": prompt}], max_output_tokens=2000
    )
    return (
        "\n".join(
            getattr(block, "text", "")
            for block in response.output
            if getattr(block, "type", None) == "output_text"
        ).strip()
        or "(empty summary)"
    )


def compact_history(messages):
    """L4 压缩：存档对话 → LLM 摘要 → 返回压缩后的新消息列表。"""
    transcript_path = write_transcript(messages)
    print(f"[transcript saved: {transcript_path}]")
    summary = summarize_history(messages)
    return [{"role": "user", "content": f"[Compacted]\n\n{summary}"}]


# Emergency: reactiveCompact — API 返回 prompt_too_long 时应急压缩


def reactive_compact(messages):
    """应急压缩：当 L1-L4 仍不够、API 报 prompt_too_long 时触发，保存旧上下文、只保留尾部。"""
    write_transcript(messages)  # 先把完整对话存档到磁盘，防止信息永久丢失
    tail_start = max(0, len(messages) - 5)  # 只保留最后 5 条消息，其余全部摘要
    if (
        tail_start > 0
        and tail_start < len(messages)
        and _is_function_call_output_message(
            messages[tail_start]
        )  # 尾部第一条是 function_call_output
        and _message_has_function_call(
            messages[tail_start - 1]
        )  # 前一条是 function_call
    ):
        tail_start -= 1  # 配对保护：把 function_call 也拉进尾部，避免 output 孤岛
    summary = summarize_history(messages[:tail_start])  # 把被裁掉的旧消息全文摘要
    return [
        {
            "role": "user",
            "content": f"[Reactive compact]\n\n{summary}",
        },  # 摘要作为第一条消息
        *messages[tail_start:],  # 展开最后 5 条原文，跟在摘要后面
    ]


# ═══════════════════════════════════════════════════════════
#  FROM s07: Tool Definitions
# ═══════════════════════════════════════════════════════════

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
        "name": "edit_file",
        "description": "Replace exact text in a file once.",
        "parameters": {
            "type": "object",
            "properties": {
                "path": {"type": "string"},
                "old_text": {"type": "string"},
                "new_text": {"type": "string"},
            },
            "required": ["path", "old_text", "new_text"],
        },
    },
    {
        "type": "function",
        "name": "glob",
        "description": "Find files matching a glob pattern.",
        "parameters": {
            "type": "object",
            "properties": {"pattern": {"type": "string"}},
            "required": ["pattern"],
        },
    },
    {
        "type": "function",
        "name": "todo_write",
        "description": "Create and manage a task list for your current coding session.",
        "parameters": {
            "type": "object",
            "properties": {
                "todos": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "content": {"type": "string"},
                            "status": {
                                "type": "string",
                                "enum": ["pending", "in_progress", "completed"],
                            },
                        },
                        "required": ["content", "status"],
                    },
                }
            },
            "required": ["todos"],
        },
    },
    {
        "type": "function",
        "name": "task",
        "description": "Launch a subagent to handle a complex subtask. Returns only the final conclusion.",
        "parameters": {
            "type": "object",
            "properties": {"description": {"type": "string"}},
            "required": ["description"],
        },
    },
    {
        "type": "function",
        "name": "load_skill",
        "description": "Load the full content of a skill by name.",
        "parameters": {
            "type": "object",
            "properties": {"name": {"type": "string"}},
            "required": ["name"],
        },
    },
    # s08 change: new compact tool — triggers compact_history, not a no-op
    {
        "type": "function",
        "name": "compact",
        "description": "Summarize earlier conversation to free context space.",
        "parameters": {"type": "object", "properties": {"focus": {"type": "string"}}},
    },
]

TOOL_HANDLERS = {
    "bash": run_bash,
    "read_file": run_read,
    "write_file": run_write,
    "edit_file": run_edit,
    "glob": run_glob,
    "todo_write": run_todo_write,
    "task": spawn_subagent,
    "load_skill": load_skill,
}

# FROM s04（保留）：Hook 系统
HOOKS = {"PreToolUse": [], "PostToolUse": []}


def trigger_hooks(event, *args):
    """依次触发指定事件的所有回调，返回第一个非 None 结果。"""
    for cb in HOOKS[event]:
        r = cb(*args)
        if r is not None:
            return r
    return None


DENY_LIST = ["rm -rf /", "sudo", "shutdown"]


def permission_hook(block):
    """PreToolUse：拦截拒绝列表中的危险 bash 命令。"""
    if block.name == "bash":
        for p in DENY_LIST:
            if p in call_args(block).get("command", ""):
                return "Permission denied"
    return None


def log_hook(block):
    """PreToolUse：在终端打印每条工具调用日志。"""
    print(f"\033[90m[HOOK] {block.name}\033[0m")
    return None


HOOKS["PreToolUse"].append(permission_hook)
HOOKS["PreToolUse"].append(log_hook)


# ═══════════════════════════════════════════════════════════
#  agent_loop — s08 核心：调用 LLM 前运行四层压缩管线
# ═══════════════════════════════════════════════════════════

MAX_REACTIVE_RETRIES = 1  # reactive compact 最大重试次数


def agent_loop(messages: list):
    """主循环：L3→L1→L2→L4 管线压缩上下文 → 调用 LLM → 执行工具。"""
    reactive_retries = 0
    while True:
        # s08 核心变更：三层预处理器（0 API 调用，便宜优先）
        # 执行顺序：budget → snip → micro
        messages[:] = function_call_output_budget(
            messages
        )  # L3: 先持久化大型输出到磁盘
        messages[:] = snip_compact(messages)  # L1: 裁剪中间消息
        messages[:] = micro_compact(messages)  # L2: 旧结果替换为占位符

        # s08 核心变更：token 数仍超阈值 → LLM 全文摘要（1 次 API 调用）
        if estimate_size(messages) > CONTEXT_LIMIT:
            print("[auto compact]")
            messages[:] = compact_history(messages)

        try:
            response = client.responses.create(
                model=MODEL,
                instructions=SYSTEM,
                input=messages,
                tools=TOOLS,
                max_output_tokens=8000,
            )
            reactive_retries = 0  # API 调用成功，重置重试计数
        except Exception as e:
            if (
                "prompt_too_long" in str(e).lower()
                or "too many tokens" in str(e).lower()
            ) and reactive_retries < MAX_REACTIVE_RETRIES:
                print("[reactive compact]")
                messages[:] = reactive_compact(messages)
                reactive_retries += 1
                continue
            raise

        # 将 LLM 输出追加到消息历史，转成普通 dict 供后续压缩逻辑处理
        messages.extend(as_input_item(item) for item in response.output)
        if not function_calls(response):
            return  # LLM 没有请求工具调用 → 任务完成

        results = []
        for block in function_calls(response):
            if block.type != "function_call":
                continue
            print(f"\033[36m> {block.name}\033[0m")

            # s08 变更：compact 工具触发 compact_history 真正压缩上下文
            if block.name == "compact":
                messages[:] = compact_history(messages)
                results.append(
                    {
                        "type": "function_call_output",
                        "call_id": block.call_id,
                        "output": "[Compacted. Conversation history has been summarized.]",
                    }
                )
                messages.extend(results)
                break  # 结束当前轮，用压缩后的上下文重新开始

            blocked = trigger_hooks("PreToolUse", block)
            if blocked:
                # 被 hook 拦截，回填拒绝信息
                results.append(
                    {
                        "type": "function_call_output",
                        "call_id": block.call_id,
                        "output": str(blocked),
                    }
                )
                continue
            handler = TOOL_HANDLERS.get(block.name)
            output = (
                handler(**call_args(block)) if handler else f"Unknown: {block.name}"
            )
            trigger_hooks("PostToolUse", block, output)
            print(str(output)[:200])
            results.append(
                {
                    "type": "function_call_output",
                    "call_id": block.call_id,
                    "output": str(output),
                }
            )
        else:
            # 正常路径：没有调用 compact，追加所有工具结果
            messages.extend(results)
            continue
        # compact 被调用：结果已在上方追加，跳过后续处理
        continue


if __name__ == "__main__":
    print("s08: Context Compact — four-layer compaction pipeline")
    print("输入问题，回车发送。输入 q 退出。OpenAI 版本。\n")
    history = []
    while True:
        try:
            query = input("\033[36ms08 >> \033[0m")
        except (EOFError, KeyboardInterrupt):
            break
        if query.strip().lower() in ("q", "exit", ""):
            break
        history.append({"role": "user", "content": query})
        agent_loop(history)
        for block in history[-1]["content"]:
            # model_dump 后 block 是普通 dict，不能用 getattr
            if isinstance(block, dict) and block.get("type") == "output_text":
                print(block.get("text", ""))
        print()
