#!/usr/bin/env python3
"""
s07: Skill Loading — two-level on-demand knowledge injection.

  Layer 1 (cheap, always present):
    SYSTEM prompt includes skill names + one-line descriptions (~100 tokens/skill)
    "Skills available: agent-builder, code-review, mcp-builder, pdf"

  Layer 2 (expensive, on demand):
    Agent calls load_skill("code-review") → full SKILL.md content
    injected via function_call_output (~2000 tokens/skill)

  skills/
    agent-builder/SKILL.md
    code-review/SKILL.md
    mcp-builder/SKILL.md
    pdf/SKILL.md

Changes from s06:
  + build_system() — scan skills/ dir at startup, inject catalog into SYSTEM
  + load_skill(name) — return full SKILL.md content via function_call_output
  + SKILLS_DIR config
  Loop unchanged: load_skill auto-dispatches via TOOL_HANDLERS.

Run: python s07_skill_loading/code.py
Needs: pip install openai python-dotenv pyyaml + OPENAI_API_KEY in .env
"""

import os
import sys
from pathlib import Path

try:
    import yaml
except ModuleNotFoundError:
    yaml = None

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
client = OpenAI(**client_kwargs)
MODEL = os.getenv("OPENAI_MODEL", "gpt-5.5")

# OpenAI Responses API helpers


CURRENT_TODOS: list[dict] = []
tools_configure(WORKDIR, CURRENT_TODOS)


# s07: 技能目录扫描（供下方 build_system 使用）
def _parse_simple_frontmatter(raw: str) -> dict:
    """在未安装 PyYAML 时，解析简单的 key: value 形式 frontmatter。"""
    meta = {}
    lines = raw.splitlines()
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if not line or line.startswith("#") or ":" not in line:
            i += 1
            continue
        key, value = line.split(":", 1)
        key = key.strip()
        value = value.strip().strip("\"'")
        if value in ("|", ">"):
            block_lines = []
            i += 1
            while i < len(lines) and (lines[i].startswith(" ") or not lines[i].strip()):
                block_line = lines[i].strip()
                if block_line:
                    block_lines.append(block_line)
                i += 1
            meta[key] = " ".join(block_lines)
            continue
        meta[key] = value
        i += 1
    return meta


def _parse_frontmatter(text: str) -> tuple[dict, str]:
    """解析 YAML frontmatter，返回 (元数据字典, 正文)。"""
    if not text.startswith("---"):
        return {}, text  # 没有 frontmatter，全文都是正文
    parts = text.split("---", 2)  # 按前两个 --- 切分：["", "yaml内容", "正文"]
    if len(parts) < 3:
        return {}, text  # 格式不完整（只有开头 --- 没有结尾 ---）
    if yaml is None:
        meta = _parse_simple_frontmatter(parts[1])
    else:
        try:
            meta = yaml.safe_load(parts[1]) or {}  # 解析 YAML 元数据
        except yaml.YAMLError:
            meta = {}  # YAML 语法错误，忽略元数据
    return meta, parts[2].strip()


# 启动时构建技能注册表（供 load_skill 安全查找）
SKILL_REGISTRY: dict[str, dict] = {}


def _scan_skills():
    """扫描 skills/ 目录，将技能名称、描述、内容加载到 SKILL_REGISTRY 中。"""
    if not SKILLS_DIR.exists():
        return
    # 递归扫描 skills/ 目录，查找所有子目录
    # iterdir() 返回目录下所有文件和子目录的迭代器
    # sorted() 对结果进行排序，确保按字母顺序处理
    for d in sorted(SKILLS_DIR.iterdir()):
        if not d.is_dir():
            continue
        manifest = d / "SKILL.md"
        if manifest.exists():
            raw = manifest.read_text()
            meta, body = _parse_frontmatter(raw)
            name = meta.get("name", d.name)
            desc = meta.get("description") or body.split("\n")[0].lstrip("#").strip()
            SKILL_REGISTRY[name] = {"name": name, "description": desc, "content": body}


_scan_skills()


def list_skills() -> str:
    """列出所有已注册技能（名称 + 一行描述）。"""
    if not SKILL_REGISTRY:
        return "(no skills found)"
    # 把所有已注册的技能拼成一个 Markdown 格式的清单，用 \n （换行）连接
    return "\n".join(
        f"- **{s['name']}**: {s['description']}" for s in SKILL_REGISTRY.values()
    )


# s07: SYSTEM prompt 中注入技能目录（轻量 — 仅名称 + 描述）
def build_system() -> str:
    """构建 SYSTEM prompt，启动时注入技能目录。"""
    catalog = list_skills()
    return (
        f"You are a coding agent at {WORKDIR}. "
        f"Skills available:\n{catalog}\n"
        "Use load_skill to get full details when needed."
    )


SYSTEM = build_system()

# s07: 子 agent 使用独立的 system prompt — 无权加载技能或派发任务
SUB_SYSTEM = (
    f"You are a coding agent at {WORKDIR}. "
    "Complete the task you were given, then return a concise summary. "
    "Do not delegate further."
)


# ═══════════════════════════════════════════════════════════
#  s02-s06 工具实现（已移至 common/）
# ═══════════════════════════════════════════════════════════


# ═══════════════════════════════════════════════════════════
#  s06 子 Agent（已移至 common/，此处保留 spawn_subagent）
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
    """在隔离上下文中运行子 agent。仅返回最终结论，不保留内部消息历史。"""
    print(f"\n\033[35m[Subagent spawned]\033[0m")
    messages = [{"role": "user", "content": description}]
    for _ in range(30):  # 安全上限：最多 30 轮
        response = client.responses.create(
            model=MODEL,
            instructions=SUB_SYSTEM,
            input=messages,
            tools=SUB_TOOLS,
            max_output_tokens=8000,
        )
        messages.extend(as_input_item(item) for item in response.output)
        if not function_calls(response):
            break  # LLM 没有请求工具调用 → 得出最终结论，退出循环
        results = []
        for block in function_calls(response):
            if block.type == "function_call":
                blocked = trigger_hooks("PreToolUse", block)
                if blocked:
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
    # 取最后一轮响应的纯文本作为结论
    result = response.output_text
    if not result:
        # 兜底：如果 output_text 为空，从消息历史中反向查找最后一条 assistant 文本
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
#  s07 新增：load_skill — 按名称运行时加载完整技能内容
# ═══════════════════════════════════════════════════════════


def load_skill(name: str) -> str:
    """按名称加载完整技能内容。通过注册表查找，无路径遍历风险。"""
    skill = SKILL_REGISTRY.get(name)
    if not skill:
        return f"Skill not found: {name}"
    return skill["content"]


# ═══════════════════════════════════════════════════════════
#  工具注册表 — s02 到 s07 的所有工具
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
    # s07: load_skill 工具（技能目录已在 SYSTEM prompt，此工具按需加载完整内容）
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


# ═══════════════════════════════════════════════════════════
#  s04 Hook 系统（不变）
# ═══════════════════════════════════════════════════════════

HOOKS = {"UserPromptSubmit": [], "PreToolUse": [], "PostToolUse": [], "Stop": []}


def register_hook(event: str, callback):
    """为生命周期事件注册回调函数（UserPromptSubmit / PreToolUse / PostToolUse / Stop）。"""
    HOOKS[event].append(callback)


def trigger_hooks(event: str, *args):
    """依次执行事件的所有回调，返回第一个非 None 结果（None 则继续执行下一个）。"""
    for callback in HOOKS[event]:
        result = callback(*args)
        if result is not None:
            return result
    return None


DENY_LIST = ["rm -rf /", "sudo", "shutdown", "reboot", "mkfs", "dd if="]


def permission_hook(block):
    """PreToolUse 钩子：拦截包含拒绝列表关键词的 bash 命令。"""
    if block.name == "bash":
        for p in DENY_LIST:
            if p in call_args(block).get("command", ""):
                print(f"\n\033[31m⛔ Blocked: '{p}'\033[0m")
                return "Permission denied"
    return None


def log_hook(block):
    """PreToolUse 钩子：在控制台记录每次工具调用。"""
    print(f"\033[90m[HOOK] {block.name}\033[0m")
    return None


def context_inject_hook(query: str):
    """UserPromptSubmit 钩子：每次用户输入前打印当前工作目录。"""
    print(f"\033[90m[HOOK] UserPromptSubmit: working in {WORKDIR}\033[0m")
    return None


def summary_hook(messages: list):
    """Stop 钩子：会话结束时统计并输出工具调用总次数。"""
    tool_count = 0
    for item in messages:
        if isinstance(item, dict) and item.get("type") == "function_call_output":
            tool_count += 1
            continue
        content = item.get("content") if isinstance(item, dict) else None
        if isinstance(content, list):
            tool_count += sum(
                1
                for block in content
                if isinstance(block, dict)
                and block.get("type") == "function_call_output"
            )
    print(f"\033[90m[HOOK] Stop: session used {tool_count} tool calls\033[0m")
    return None


register_hook("UserPromptSubmit", context_inject_hook)
register_hook("PreToolUse", permission_hook)
register_hook("PreToolUse", log_hook)
register_hook("Stop", summary_hook)


# ═══════════════════════════════════════════════════════════
#  agent_loop — s05-s06 相同 + 催办提醒
# ═══════════════════════════════════════════════════════════

rounds_since_todo = 0


def agent_loop(messages: list):
    """主循环：反复调用 LLM → 执行工具 → 注入结果，每 3 轮提醒更新 todo。"""
    global rounds_since_todo
    while True:
        # 催办机制：连续 3 轮未更新 todo → 注入提醒消息
        if rounds_since_todo >= 3 and messages:
            messages.append(
                {"role": "user", "content": "<reminder>Update your todos.</reminder>"}
            )
            rounds_since_todo = 0

        # 调用 LLM
        response = client.responses.create(
            model=MODEL,
            instructions=SYSTEM,
            input=messages,
            tools=TOOLS,
            max_output_tokens=8000,
        )
        resdict = [as_input_item(item) for item in response.output]
        # 将 LLM 输出追加到消息历史（转为 dict 避免下次请求序列化报错）
        messages.extend(resdict)

        # 没有 function_call → LLM 认为任务完成，尝试触发 Stop hook
        if not function_calls(response):
            force = trigger_hooks("Stop", messages)
            if force:
                messages.append({"role": "user", "content": force})
                continue
            return response

        rounds_since_todo += 1
        results = []
        for block in function_calls(response):
            if block.type != "function_call":
                continue

            # PreToolUse 钩子：权限检查等
            blocked = trigger_hooks("PreToolUse", block)
            if blocked:
                results.append(
                    {
                        "type": "function_call_output",
                        "call_id": block.call_id,
                        "output": str(blocked),
                    }
                )
                continue

            # 根据工具名从 TOOL_HANDLERS 查找并执行
            handler = TOOL_HANDLERS.get(block.name)
            output = (
                handler(**call_args(block)) if handler else f"Unknown: {block.name}"
            )

            trigger_hooks("PostToolUse", block, output)

            # todo_write 是任务状态更新，调用后清零催办计数器
            if block.name == "todo_write":
                rounds_since_todo = 0

            results.append(
                {
                    "type": "function_call_output",
                    "call_id": block.call_id,
                    "output": output,
                }
            )

        messages.extend(results)


if __name__ == "__main__":
    print("s07: Skill Loading — catalog in SYSTEM, content on demand")
    print("Type a question, press Enter. Type q to quit. OpenAI version.\n")

    history = []
    while True:
        try:
            query = input("\033[36ms07 >> \033[0m")
        except (EOFError, KeyboardInterrupt):
            break
        if query.strip().lower() in ("q", "exit", ""):
            break
        trigger_hooks("UserPromptSubmit", query)
        history.append({"role": "user", "content": query})
        response = agent_loop(history)
        if response and response.output_text:
            print(response.output_text)
        print()
