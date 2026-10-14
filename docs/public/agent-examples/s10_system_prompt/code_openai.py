#!/usr/bin/env python3
"""
s10: System Prompt — Runtime prompt assembly with caching.

Run:  python s10_system_prompt/code.py
Need: pip install openai python-dotenv + .env with OPENAI_API_KEY

Changes from s09:
  - PROMPT_SECTIONS: topic-keyed dict of prompt fragments
  - assemble_system_prompt(context): select + join sections by real state
  - get_system_prompt(context): deterministic cache via json.dumps
  - agent_loop uses get_system_prompt(context) instead of hardcoded SYSTEM

Memory section loads when .memory/MEMORY.md exists (real state, not keywords).
"""

import os
import sys, json
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

from common.utils import as_input_item, call_args, function_calls, parse_arguments
from common.tools import (
    configure as tools_configure,
    run_bash,
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
MEMORY_DIR = WORKDIR / ".memory"
MEMORY_INDEX = MEMORY_DIR / "MEMORY.md"
client = OpenAI(**client_kwargs)
MODEL = os.getenv("OPENAI_MODEL", "gpt-5.5")

# OpenAI Responses API helpers


# ── Prompt Sections ──

PROMPT_SECTIONS = {
    "identity": "You are a coding agent. Act, don't explain.",
    "tools": "Available tools: bash, read_file, write_file.",
    "workspace": f"Working directory: {WORKDIR}",
    "memory": "Relevant memories are injected below when available.",
}


def assemble_system_prompt(context: dict) -> str:
    """根据当前上下文选择并拼接 prompt 片段。始终加载 identity/tools/workspace，有记忆时追加 memory。"""
    sections = []

    # Always loaded — identity, tools, workspace
    sections.append(PROMPT_SECTIONS["identity"])
    sections.append(PROMPT_SECTIONS["tools"])
    sections.append(PROMPT_SECTIONS["workspace"])

    # Conditional — memory loaded when MEMORY.md exists and has content
    memories = context.get("memories", "")
    if memories:
        sections.append(f"Relevant memories:\n{memories}")

    return "\n\n".join(sections)


_last_context_key = None
_last_prompt = None


def get_system_prompt(context: dict) -> str:
    """缓存包装：context 未变时复用上次拼装结果，避免重复字符串拼接。

    用 json.dumps 做确定性序列化（Python hash() 有进程随机性，且不支持嵌套 dict/list）。
    """
    global _last_context_key, _last_prompt
    # sort_keys=True   → 按 key 排序输出，保证相同 dict 始终生成相同字符串
    # ensure_ascii=False → 中文等非 ASCII 字符原样保留，不转义为 \uXXXX
    # default=str       → 遇到无法序列化的类型（如 Path、set）时调用 str() 兜底
    key = json.dumps(context, sort_keys=True, ensure_ascii=False, default=str)
    if key == _last_context_key and _last_prompt:
        print("  \033[90m[cache hit] system prompt unchanged\033[0m")
        return _last_prompt
    _last_context_key = key
    _last_prompt = assemble_system_prompt(context)

    loaded = ["identity", "tools", "workspace"]
    if context.get("memories"):
        loaded.append("memory")
    print(f"  \033[32m[assembled] sections: {', '.join(loaded)}\033[0m")
    return _last_prompt


# ── Tools ──


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
]

TOOL_HANDLERS = {"bash": run_bash, "read_file": run_read, "write_file": run_write}


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


# ── Agent Loop ──


def agent_loop(messages: list, context: dict):
    """主循环：用拼装的 system prompt 替代硬编码的 SYSTEM，每次工具调用后重新评估 context。"""
    system = get_system_prompt(context)
    while True:
        response = client.responses.create(
            model=MODEL,
            instructions=system,
            input=messages,
            tools=TOOLS,
            max_output_tokens=8000,
        )
        messages.extend(as_input_item(item) for item in response.output)
        if not function_calls(response):
            return response

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

        # Re-evaluate context and prompt after each tool round
        context = update_context(context, messages)
        system = get_system_prompt(context)


if __name__ == "__main__":
    print("s10: system prompt — runtime assembly")
    print("Enter a question, press Enter to send. Type q to quit. OpenAI version.\n")
    history = []
    context = update_context({}, [])
    while True:
        try:
            query = input("\033[36ms10 >> \033[0m")
        except (EOFError, KeyboardInterrupt):
            break
        if query.strip().lower() in ("q", "exit", ""):
            break
        history.append({"role": "user", "content": query})
        agent_loop(history, context)
        for block in history[-1]["content"]:
            # model_dump 后 block 是普通 dict，不能用 getattr
            if isinstance(block, dict) and block.get("type") == "output_text":
                print(block.get("text", ""))
        print()
