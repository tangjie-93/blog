#!/usr/bin/env python3
"""
s09_memory.py - Memory System

Persistent, cross-session knowledge for the coding agent.

Storage:
    .memory/
      MEMORY.md          ← index (one line per memory, ≤200 lines)
      feedback_tabs.md    ← individual memory files (Markdown + YAML frontmatter)
      user_profile.md
      project_facts.md

Flow in agent_loop:
    1. Load MEMORY.md index into SYSTEM prompt (cheap, always present)
    2. Select relevant memories by filename/description → inject content
    3. Run compression pipeline from s08
    4. After each turn ends → extract new memories from original messages
    5. Periodically consolidate (Dream)

Builds on s08 (context compact). Usage:

    python s09_memory/code.py
    Needs: pip install openai python-dotenv + OPENAI_API_KEY in .env
"""

import os
import sys, json, time, re
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
)
from common.tools import (
    configure as tools_configure,
    run_bash,
    run_edit,
    run_glob,
    run_read,
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
# ── Memory System ──────────────────────────────────
# 1.创建.memory目录
MEMORY_DIR = WORKDIR / ".memory"
MEMORY_DIR.mkdir(exist_ok=True)
MEMORY_INDEX = MEMORY_DIR / "MEMORY.md"
SKILLS_DIR = WORKDIR / "skills"
TRANSCRIPT_DIR = WORKDIR / ".transcripts"
TOOL_RESULTS_DIR = WORKDIR / ".task_outputs" / "tool-results"
client = OpenAI(**client_kwargs)
MODEL = os.getenv("OPENAI_MODEL", "gpt-5.5")

# OpenAI Responses API helpers


# ═══════════════════════════════════════════════════════════
#  NEW in s09: Memory System
# ═══════════════════════════════════════════════════════════

MEMORY_TYPES = ["user", "feedback", "project", "reference"]


def _parse_frontmatter(text: str) -> tuple[dict, str]:
    """解析 YAML frontmatter：提取元数据字典和正文内容。"""
    if not text.startswith("---"):
        return {}, text
    parts = text.split("---", 2)
    if len(parts) < 3:
        return {}, text
    meta = {}
    # splitlines() 按换行符 \n （或 \r\n ）拆分字符串，返回行列表。
    for line in parts[1].strip().splitlines():
        if ":" in line:
            k, v = line.split(":", 1)
            # 去掉键值对前后的空格，以及可能的引号
            k = k.strip().strip('"').strip("'")
            v = v.strip().strip('"').strip("'")
            meta[k] = v
    return meta, parts[2].strip()


def write_memory_file(name: str, mem_type: str, description: str, body: str):
    """写入单个记忆文件（YAML frontmatter + Markdown 正文），写完后重建索引。"""
    # 把名称转为安全的文件名
    slug = name.lower().replace(" ", "-").replace("/", "-")
    filename = f"{slug}.md"
    filepath = MEMORY_DIR / filename
    filepath.write_text(
        f"---\nname: {name}\ndescription: {description}\ntype: {mem_type}\n---\n\n{body}\n",
        encoding="utf-8",
    )
    _rebuild_index()
    return filepath


def _rebuild_index():
    """从所有记忆文件重建 MEMORY.md 索引，生成文件名+描述的行列表。"""
    lines = []
    for f in sorted(MEMORY_DIR.glob("*.md")):
        if f.name == "MEMORY.md":
            continue
        raw = f.read_text(encoding="utf-8")
        meta, body = _parse_frontmatter(raw)
        name = meta.get("name", f.stem)
        desc = meta.get("description", body.split("\n")[0][:80])
        lines.append(f"- [{name}]({f.name}) - {desc}")
    MEMORY_INDEX.write_text("\n".join(lines) + "\n" if lines else "", encoding="utf-8")


def read_memory_index() -> str:
    """读取 MEMORY.md 索引内容，每轮都会注入到 SYSTEM prompt 中。"""
    if not MEMORY_INDEX.exists():
        return ""
    text = MEMORY_INDEX.read_text(encoding="utf-8").strip()
    return text if text else ""


def read_memory_file(filename: str) -> str | None:
    """读取单个记忆文件的完整内容（含 frontmatter）。"""
    path = MEMORY_DIR / filename
    if not path.exists():
        return None
    return path.read_text(encoding="utf-8")


def list_memory_files() -> list[dict]:
    """列出所有记忆文件及其元数据（文件名、名称、描述、类型、正文）。"""
    result = []
    # 获取memory目录下所有记忆文件，排除 MEMORY.md
    for f in sorted(MEMORY_DIR.glob("*.md")):
        if f.name == "MEMORY.md":
            continue
        raw = f.read_text(encoding="utf-8")
        meta, body = _parse_frontmatter(raw)
        result.append(
            {
                "filename": f.name,
                "name": meta.get("name", f.stem),
                "description": meta.get("description", ""),
                "type": meta.get("type", "user"),
                "body": body,
            }
        )
    return result


def select_relevant_memories(messages: list, max_items: int = 5) -> list[str]:
    """选择与最近对话相关的记忆文件。优先用 LLM 匹配，失败时降级为关键词匹配。"""
    files = list_memory_files()
    if not files:
        return []

    # Collect recent user text for context
    recent_texts = []
    for msg in reversed(messages):
        if msg.get("role") == "user":
            content = msg.get("content", "")
            if isinstance(content, list):
                content = extract_text(content)
            if isinstance(content, str):
                recent_texts.append(content)
            if len(recent_texts) >= 3:
                break
    recent = " ".join(reversed(recent_texts))[:2000]

    if not recent.strip():
        return []

    # Build catalog of name + description for LLM to choose from
    catalog_lines = []
    for i, f in enumerate(files):
        catalog_lines.append(f"{i}: {f['name']} - {f['description']}")
    catalog = "\n".join(catalog_lines)

    prompt = (
        "Given the recent conversation and the memory catalog below, "
        "select the indices of memories that are clearly relevant. "
        "Return ONLY a JSON array of integers, e.g. [0, 3]. "
        "If none are relevant, return [].\n\n"
        f"Recent conversation:\n{recent}\n\n"
        f"Memory catalog:\n{catalog}"
    )

    try:
        response = client.responses.create(
            model=MODEL,
            input=[{"role": "user", "content": prompt}],
            max_output_tokens=200,
        )
        # 提取 assistant 消息内容（兼容 str 和 list 两种格式）
        text = extract_text(response.output).strip()
        # Extract JSON array from response
        match = re.search(r"\[.*?\]", text, re.DOTALL)
        if match:
            indices = json.loads(match.group())
            selected = []
            for idx in indices:
                if isinstance(idx, int) and 0 <= idx < len(files):
                    selected.append(files[idx]["filename"])
                    if len(selected) >= max_items:
                        break
            return selected
    except Exception:
        pass

    # Fallback: keyword matching on name + description、
    # 过滤掉长度小于 4 的关键词，避免匹配到无意义的词
    keywords = [w.lower() for w in recent.split() if len(w) > 3]
    selected = []
    for f in files:
        text = (f["name"] + " " + f["description"]).lower()
        if any(kw in text for kw in keywords):
            selected.append(f["filename"])
            if len(selected) >= max_items:
                break
    return selected


def load_memories(messages: list) -> str:
    """加载与当前对话相关的记忆内容，包裹在 <relevant_memories> 标签中注入上下文。"""
    selected_files = select_relevant_memories(messages)
    if not selected_files:
        return ""

    parts = ["<relevant_memories>"]
    for filename in selected_files:
        content = read_memory_file(filename)
        if content:
            parts.append(content)
    parts.append("</relevant_memories>")
    return "\n\n".join(parts)


def extract_memories(messages: list):
    """从最近对话中提取新的记忆（偏好、约束、项目事实等），写入记忆文件。每轮结束后触发。"""
    # Collect recent conversation text
    dialogue_parts = []
    # 取最近 10 条消息，避免过长的对话历史导致 LLM 内存不足
    for msg in messages[-10:]:
        role = msg.get("role", "?")
        content = msg.get("content", "")
        if isinstance(content, list):
            content = extract_text(content)
        if isinstance(content, str) and content.strip():
            dialogue_parts.append(f"{role}: {content}")
    dialogue = "\n".join(dialogue_parts)

    if not dialogue.strip():
        return

    # Check existing memories to avoid duplicates
    existing = list_memory_files()
    existing_desc = (
        "\n".join(f"- {m['name']}: {m['description']}" for m in existing)
        if existing
        else "(none)"
    )

    prompt = (
        "Extract user preferences, constraints, or project facts from this dialogue.\n"
        "Return a JSON array. Each item: {name, type, description, body}.\n"
        "- name: short kebab-case identifier (e.g. 'user-preference-tabs')\n"
        "- type: one of 'user' (user preference), 'feedback' (guidance), "
        "'project' (project fact), 'reference' (external pointer)\n"
        "- description: one-line summary for index lookup\n"
        "- body: full detail in markdown\n"
        "If nothing new or already covered by existing memories, return [].\n\n"
        f"Existing memories:\n{existing_desc}\n\n"
        f"Dialogue:\n{dialogue[:4000]}"
    )

    try:
        response = client.responses.create(
            model=MODEL,
            input=[{"role": "user", "content": prompt}],
            max_output_tokens=800,
        )
        text = extract_text(response.output).strip()
        # Extract JSON array from response
        match = re.search(r"\[.*\]", text, re.DOTALL)
        if not match:
            return
        items = json.loads(match.group())
        if not items:
            return
        count = 0
        for mem in items:
            name = mem.get("name", f"memory_{int(time.time())}")
            mem_type = mem.get("type", "user")
            desc = mem.get("description", "")
            body = mem.get("body", "")
            if desc and body:
                write_memory_file(name, mem_type, desc, body)
                count += 1
        if count:
            print(f"\n\033[33m[Memory: extracted {count} new memories]\033[0m")
    except Exception:
        pass


CONSOLIDATE_THRESHOLD = 10


def consolidate_memories():
    """合并/整理记忆：当记忆文件数 ≥ 阈值时，删重、去过期、合并到 30 条以内。"""
    files = list_memory_files()
    if len(files) < CONSOLIDATE_THRESHOLD:
        return

    catalog = "\n\n".join(
        f"## {f['filename']}\nname: {f['name']}\ndescription: {f['description']}\n{f['body']}"
        for f in files
    )

    prompt = (
        "Consolidate the following memory files. Rules:\n"
        "1. Merge duplicates into one\n"
        "2. Remove outdated/contradicted memories\n"
        "3. Keep the total under 30 memories\n"
        "4. Preserve important user preferences above all\n"
        "Return a JSON array. Each item: {name, type, description, body}.\n\n"
        f"{catalog[:16000]}"
    )

    try:
        response = client.responses.create(
            model=MODEL,
            input=[{"role": "user", "content": prompt}],
            max_output_tokens=3000,
        )
        text = extract_text(response.output).strip()
        match = re.search(r"\[.*\]", text, re.DOTALL)
        if not match:
            return
        items = json.loads(match.group())

        # Remove old memory files (keep MEMORY.md)
        for f in MEMORY_DIR.glob("*.md"):
            if f.name != "MEMORY.md":
                f.unlink()

        for mem in items:
            name = mem.get("name", f"memory_{int(time.time())}")
            mem_type = mem.get("type", "user")
            desc = mem.get("description", "")
            body = mem.get("body", "")
            if desc and body:
                write_memory_file(name, mem_type, desc, body)

        print(
            f"\n\033[33m[Memory: consolidated {len(files)} → {len(items)} memories]\033[0m"
        )
    except Exception:
        pass


# Build SYSTEM with memory index
def build_system() -> str:
    """构建 SYSTEM prompt：包含工作目录和记忆索引，提示 LLM 遵循用户偏好。"""
    index = read_memory_index()
    memories_section = f"\n\nMemories available:\n{index}" if index else ""
    return (
        f"You are a coding agent at {WORKDIR}."
        f"{memories_section}\n"
        "Relevant memories are injected below. Respect user preferences from memory.\n"
        "When the user says 'remember' or expresses a clear preference, acknowledge it briefly. "
        "The program will extract it as a memory after the turn."
    )


SUB_SYSTEM = (
    f"You are a coding agent at {WORKDIR}. "
    "Complete the task you were given, then return a concise summary. "
    "Do not delegate further."
)


# ═══════════════════════════════════════════════════════════
#  FROM s02-s08 (skeleton): Basic tools
# ═══════════════════════════════════════════════════════════


# Subagent (simplified from s06-s07)
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
]
SUB_HANDLERS = {"bash": run_bash, "read_file": run_read, "write_file": run_write}


def spawn_subagent(description: str) -> str:
    """启动子代理：用简化工具集独立完成一个子任务，最多 30 轮后返回结果。"""
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
        messages.extend(as_input_item(item) for item in response.output)
        if not function_calls(response):
            break
        results = []
        for block in function_calls(response):
            if block.type == "function_call":
                handler = SUB_HANDLERS.get(block.name)
                output = (
                    handler(**call_args(block)) if handler else f"Unknown: {block.name}"
                )
                print(f"  \033[90m[sub] {block.name}: {str(output)[:100]}\033[0m")
                results.append(
                    {
                        "type": "function_call_output",
                        "call_id": block.call_id,
                        "output": output,
                    }
                )
        messages.extend(results)
    result = response.output_text
    if not result:
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
#  FROM s08 (skeleton): Compaction pipeline
# ═══════════════════════════════════════════════════════════

CONTEXT_LIMIT = 50000
KEEP_RECENT = 3
PERSIST_THRESHOLD = 30000


def _tool_output(block: dict) -> str:
    """读取 function_call_output 的文本，兼容 output（Responses API）和 content 两个字段。"""
    return str(block.get("output", block.get("content", "")))


def _set_tool_output(block: dict, value: str):
    """写回 function_call_output 的文本，保持原字段形态。"""
    key = "output" if "output" in block else "content"
    block[key] = value


def estimate_size(msgs):
    """估算消息列表的字符数（≈ token 数量）。"""
    return len(str(msgs))


def _block_type(block):
    """获取 block 的 type 字段（兼容 dict 和对象两种形式）。"""
    return (
        block.get("type") if isinstance(block, dict) else getattr(block, "type", None)
    )


def _message_has_function_call(msg):
    """判断 assistant 消息中是否包含 function_call。"""
    if msg.get("role") != "assistant":
        return False
    content = msg.get("content")
    if not isinstance(content, list):
        return False
    return any(_block_type(block) == "function_call" for block in content)


def _is_function_call_output_message(msg):
    """判断 user 消息中是否包含 function_call_output。"""
    if msg.get("role") != "user":
        return False
    content = msg.get("content")
    if not isinstance(content, list):
        return False
    return any(
        isinstance(block, dict) and block.get("type") == "function_call_output"
        for block in content
    )


def snip_compact(msgs, mx=50):
    """L1 裁剪压缩：保留首尾，裁掉中间消息，防止 function_call/output 撕裂。"""
    if len(msgs) <= mx:
        return msgs
    head_end, tail_start = 3, len(msgs) - (mx - 3)
    if head_end > 0 and _message_has_function_call(msgs[head_end - 1]):
        while head_end < len(msgs) and _is_function_call_output_message(msgs[head_end]):
            head_end += 1
    if (
        tail_start > 0
        and tail_start < len(msgs)
        and _is_function_call_output_message(msgs[tail_start])
        and _message_has_function_call(msgs[tail_start - 1])
    ):
        tail_start -= 1
    if head_end >= tail_start:
        return msgs
    return (
        msgs[:head_end]
        + [{"role": "user", "content": f"[snipped {tail_start - head_end} msgs]"}]
        + msgs[tail_start:]
    )


def collect_function_call_outputs(msgs):
    """收集所有消息中的 function_call_output 块，返回 (消息索引, 块索引, 块) 列表。"""
    blocks = []
    for mi, msg in enumerate(msgs):
        if msg.get("role") != "user" or not isinstance(msg.get("content"), list):
            continue
        for bi, block in enumerate(msg["content"]):
            if isinstance(block, dict) and block.get("type") == "function_call_output":
                blocks.append((mi, bi, block))
    return blocks


def micro_compact(msgs):
    """L2 微压缩：保留最后 KEEP_RECENT 个工具结果，其余替换为占位文本。"""
    tr = collect_function_call_outputs(msgs)
    if len(tr) <= KEEP_RECENT:
        return msgs
    for _, _, b in tr[:-KEEP_RECENT]:
        if len(_tool_output(b)) > 120:
            _set_tool_output(b, "[Earlier tool result compacted.]")
    return msgs


def persist_large(tid, out):
    """将超大的工具输出持久化到磁盘文件，返回文件引用文本。"""
    if len(out) <= PERSIST_THRESHOLD:
        return out
    TOOL_RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    p = TOOL_RESULTS_DIR / f"{tid}.txt"
    if not p.exists():
        p.write_text(out, encoding="utf-8")
    return f"<persisted-output>\nFull: {p}\nPreview:\n{out[:2000]}\n</persisted-output>"


def function_call_output_budget(msgs, mx=200_000):
    """L3 输出预算控制：最后一条消息中工具输出超限时，将最大的结果持久化到磁盘。"""
    last = msgs[-1] if msgs else None
    if (
        not last
        or last.get("role") != "user"
        or not isinstance(last.get("content"), list)
    ):
        return msgs
    blocks = [
        (i, b)
        for i, b in enumerate(last["content"])
        if isinstance(b, dict) and b.get("type") == "function_call_output"
    ]
    total = sum(len(_tool_output(b)) for _, b in blocks)
    if total <= mx:
        return msgs
    for _, block in sorted(blocks, key=lambda p: len(_tool_output(p[1])), reverse=True):
        if total <= mx:
            break
        c = _tool_output(block)
        if len(c) <= PERSIST_THRESHOLD:
            continue
        _set_tool_output(block, persist_large(block.get("call_id", "?"), c))
        total = sum(len(_tool_output(b)) for _, b in blocks)
    return msgs


def write_transcript(msgs):
    """将完整对话历史存档到 .transcripts/ 目录（JSONL 格式），用于备份回溯。"""
    TRANSCRIPT_DIR.mkdir(parents=True, exist_ok=True)
    p = TRANSCRIPT_DIR / f"transcript_{int(time.time())}.jsonl"
    with p.open("w") as f:
        for m in msgs:
            f.write(json.dumps(m, default=str) + "\n")
    return p


def summarize_history(msgs):
    """调用 LLM 将对话历史总结为精简摘要，保留目标、决策、文件变更等关键信息。"""
    conv = json.dumps(msgs, default=str)[:80000]
    r = client.responses.create(
        model=MODEL,
        input=[
            {
                "role": "user",
                "content": "Summarize this coding-agent conversation so work can continue.\n"
                "Preserve: 1. current goal, 2. key findings, 3. files changed, 4. remaining work, 5. user constraints.\n\n"
                + conv,
            }
        ],
        max_output_tokens=2000,
    )
    return extract_text(r).strip()


def compact_history(msgs):
    """压缩历史：先写入完整 transcript，再返回一条摘要消息作为新的上下文。"""
    write_transcript(msgs)
    summary = summarize_history(msgs)
    return [{"role": "user", "content": f"[Compacted]\n\n{summary}"}]


def reactive_compact(msgs):
    """应急压缩：API 报 prompt_too_long 时触发，存档旧上下文、只保留尾部 5 条。"""
    write_transcript(msgs)
    tail_start = max(0, len(msgs) - 5)
    if (
        tail_start > 0
        and tail_start < len(msgs)
        and _is_function_call_output_message(msgs[tail_start])
        and _message_has_function_call(msgs[tail_start - 1])
    ):
        tail_start -= 1
    # 调用大模型总结对话历史
    summary = summarize_history(msgs[:tail_start])
    return [
        {"role": "user", "content": f"[Reactive compact]\n\n{summary}"},
        *msgs[tail_start:],
    ]


# ═══════════════════════════════════════════════════════════
#  Tool Definitions (skeleton — fewer tools to focus on memory)
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
    {
        "type": "function",
        "name": "task",
        "description": "Launch a subagent to handle a subtask.",
        "parameters": {
            "type": "object",
            "properties": {"description": {"type": "string"}},
            "required": ["description"],
        },
    },
]

TOOL_HANDLERS = {
    "bash": run_bash,
    "read_file": run_read,
    "write_file": run_write,
    "edit_file": run_edit,
    "glob": run_glob,
    "task": spawn_subagent,
}


# ═══════════════════════════════════════════════════════════
#  agent_loop — s09: inject memories + extract after each turn
# ═══════════════════════════════════════════════════════════

MAX_REACTIVE_RETRIES = 1


def agent_loop(messages: list):
    """s09 主循环：注入记忆 → 压缩管线 → 调用 LLM → 执行工具 → 提取新记忆。"""
    reactive_retries = 0
    # 注入与当前对话相关的记忆内容 只注入到当前这轮的最后一条消息（纯文本的 user message），因为那是 LLM 处理本轮任务时的"入口"。
    memories_content = load_memories(messages)
    # 记录最近一次注入记忆的轮次，避免重复注入
    memory_turn = (
        len(messages) - 1
        if messages and isinstance(messages[-1].get("content"), str)
        else None
    )
    # 每轮构建一次 system prompt，记忆在循环返回后更新  构建系统提示词
    system = build_system()

    while True:
        # 保存压缩前的快照，用于准确提取记忆
        pre_compress = [
            (
                m
                if isinstance(m, dict)
                else {"role": m.get("role", ""), "content": str(m.get("content", ""))}
            )
            for m in messages
        ]

        # 四层压缩管线（L3 → L1 → L2，必要时 L4）
        messages[:] = function_call_output_budget(messages)
        messages[:] = snip_compact(messages)
        messages[:] = micro_compact(messages)

        if estimate_size(messages) > CONTEXT_LIMIT:
            print("[auto compact]")
            # L4: 最后一次压缩，确保对话历史在上下文限制内 通过调用大模型来总结摘要
            messages[:] = compact_history(messages)

        try:
            request_messages = messages
            """
                memories_content：有记忆内容（非空）
                memory_turn is not None：找到了可注入的消息
                memory_turn < len(messages)：那条消息还没被 snip 裁掉
            """
            if (
                memories_content
                and memory_turn is not None
                and memory_turn < len(messages)
            ):
                # 注入记忆内容到当前这轮的最后一条消息（纯文本的 user message），因为那是 LLM 处理本轮任务时的"入口"。
                request_messages = messages.copy()
                request_messages[memory_turn] = {
                    **messages[memory_turn],
                    "content": memories_content
                    + "\n\n"
                    + messages[memory_turn]["content"],
                }
            response = client.responses.create(
                model=MODEL,
                instructions=system,
                input=request_messages,
                tools=TOOLS,
                max_output_tokens=8000,
            )
            reactive_retries = 0
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

        messages.extend(as_input_item(item) for item in response.output)
        if not function_calls(response):
            # 从压缩前快照提取记忆，保证信息完整性
            # 在这里创建记忆文件和更新记忆索引
            extract_memories(pre_compress)
            consolidate_memories()
            return extract_text(response.output)

        results = []
        for block in function_calls(response):
            if block.type != "function_call":
                continue
            print(f"\033[36m> {block.name}\033[0m")
            handler = TOOL_HANDLERS.get(block.name)
            output = (
                handler(**call_args(block)) if handler else f"Unknown: {block.name}"
            )
            print(str(output)[:200])
            results.append(
                {
                    "type": "function_call_output",
                    "call_id": block.call_id,
                    "output": output,
                }
            )
        messages.extend(results)


if __name__ == "__main__":
    print("s09: Memory — persistent cross-session knowledge")
    print("输入问题，回车发送。输入 q 退出。OpenAI 版本。\n")
    history = []
    while True:
        try:
            query = input("\033[36ms09 >> \033[0m")
        except (EOFError, KeyboardInterrupt):
            break
        if query.strip().lower() in ("q", "exit", ""):
            break
        history.append({"role": "user", "content": query})
        answer = agent_loop(history)
        print((answer or "").strip())
        print()
