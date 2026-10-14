#!/usr/bin/env python3
"""
s02: Tool Use with OpenAI — 在 s01 OpenAI 循环基础上新增 4 个工具。

运行: python s02_tool_use/code_openai.py
需要: pip install openai python-dotenv + .env 中配置 OPENAI_API_KEY

本文件保持 s02 的工具逻辑不变:
  + bash / read_file / write_file / edit_file / glob 五个工具
  + TOOL_HANDLERS 分发映射
  + safe_path 路径安全校验

变化只在模型接口:
  + Anthropic tool_use / tool_result
  + OpenAI function_call / function_call_output
"""

import os
import sys
from collections.abc import Callable
from pathlib import Path
from typing import Any

try:
    import readline

    readline.parse_and_bind("set bind-tty-special-chars off")
    readline.parse_and_bind("set input-meta on")
    readline.parse_and_bind("set output-meta on")
    readline.parse_and_bind("set convert-meta off")
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

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv(override=True)

WORKDIR = Path.cwd()
tools_configure(WORKDIR)
client_kwargs = {}
if os.getenv("OPENAI_BASE_URL"):
    client_kwargs["base_url"] = os.environ["OPENAI_BASE_URL"]

client = OpenAI(**client_kwargs)
MODEL = os.getenv("OPENAI_MODEL", "gpt-5.5")

SYSTEM = f"You are a coding agent at {WORKDIR}. Use tools to solve tasks. Act, don't explain."


# ═══════════════════════════════════════════════════════════
#  OpenAI function tools: same names and inputs as s02/code.py
# ═══════════════════════════════════════════════════════════


def function_tool(
    name: str, description: str, properties: dict[str, Any], required: list[str]
) -> dict[str, Any]:
    """根据名称、说明和参数 Schema，构造 OpenAI Responses API 的函数工具定义。"""
    return {
        "type": "function",
        "name": name,
        "description": description,
        "parameters": {
            "type": "object",
            "properties": properties,
            "required": required,
            "additionalProperties": False,
        },
        "strict": True,
    }


TOOLS = [
    function_tool(
        "bash",
        "Run a shell command.",
        {"command": {"type": "string"}},
        ["command"],
    ),
    function_tool(
        "read_file",
        "Read file contents.",
        {
            "path": {"type": "string"},
            "limit": {
                "type": ["integer", "null"],
                "description": "Maximum number of lines to read, or null.",
            },
        },
        ["path", "limit"],
    ),
    function_tool(
        "write_file",
        "Write content to a file.",
        {"path": {"type": "string"}, "content": {"type": "string"}},
        ["path", "content"],
    ),
    function_tool(
        "edit_file",
        "Replace exact text in a file once.",
        {
            "path": {"type": "string"},
            "old_text": {"type": "string"},
            "new_text": {"type": "string"},
        },
        ["path", "old_text", "new_text"],
    ),
    function_tool(
        "glob",
        "Find files matching a glob pattern.",
        {"pattern": {"type": "string"}},
        ["pattern"],
    ),
]

TOOL_HANDLERS: dict[str, Callable[..., str]] = {
    "bash": run_bash,
    "read_file": run_read,
    "write_file": run_write,
    "edit_file": run_edit,
    "glob": run_glob,
}


# ═══════════════════════════════════════════════════════════
#  OpenAI Responses API glue
# ═══════════════════════════════════════════════════════════


def call_tool(name: str, args: dict[str, Any]) -> str:
    """按工具名分发参数到处理函数，并将参数或调用错误转为文本结果。"""
    if "_error" in args:
        return args["_error"]

    handler = TOOL_HANDLERS.get(name)
    if not handler:
        return f"Unknown: {name}"

    try:
        return handler(**args)
    except TypeError as e:
        return f"Error: invalid arguments for {name}: {e}"


def agent_loop(messages: list[dict[str, Any]]) -> Any:
    """持续请求模型、执行其函数调用并回填结果，直到模型不再调用工具。"""
    while True:
        response = client.responses.create(
            model=MODEL,
            instructions=SYSTEM,
            input=messages,
            tools=TOOLS,
            max_output_tokens=8000,
        )

        messages.extend(as_input_item(item) for item in response.output)

        tool_calls = [
            item
            for item in response.output
            if getattr(item, "type", None) == "function_call"
        ]
        if not tool_calls:
            return response

        for call in tool_calls:
            args = parse_arguments(call.arguments)
            print(f"\033[33m> {call.name}\033[0m")
            output = call_tool(call.name, args)
            print(str(output)[:200])
            messages.append(
                {
                    "type": "function_call_output",
                    "call_id": call.call_id,
                    "output": output,
                }
            )


if __name__ == "__main__":
    print("s02: Tool Use (OpenAI) — 在 s01 基础上加了 4 个工具")
    print("输入问题，回车发送。输入 q 退出。\n")

    history: list[dict[str, Any]] = []
    while True:
        try:
            query = input("\033[36ms02-openai >> \033[0m")
        except (EOFError, KeyboardInterrupt):
            break
        if query.strip().lower() in ("q", "exit", ""):
            break
        history.append({"role": "user", "content": query})
        response = agent_loop(history)
        if getattr(response, "output_text", ""):
            print(response.output_text)
        print()
