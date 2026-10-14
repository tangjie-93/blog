#!/usr/bin/env python3
"""
s06: Subagent — spawn sub-agents with fresh messages[] for context isolation.

  Parent Agent                           Subagent
  +------------------+                  +------------------+
  | input=[...]   |                  | input=[task]  | <-- fresh
  |                  |   dispatch       |                  |
  | tool: task       | ---------------> | own while loop   |
  |   prompt="..."   |                  |   bash/read/...  |
  |                  |   summary only   |   (max 30 turns) |
  | result = "..."   | <--------------- | return last text |
  +------------------+                  +------------------+
        ^                                      |
        |       intermediate results DISCARDED  |
        +--------------------------------------+

  Subagent tools: bash, read, write, edit, glob (NO task — no recursion)

Changes from s05:
  + task tool + spawn_subagent() with fresh messages[]
  + Safety limit: max 30 turns per subagent
  + extract_text() helper
  Subagent cannot spawn sub-subagents (no task tool in sub_tools).
  Main loop unchanged: task auto-dispatches via TOOL_HANDLERS.

Run: python s06_subagent/code.py
Needs: pip install openai python-dotenv + OPENAI_API_KEY in .env
"""

import os
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

from openai import APIStatusError, OpenAI, OpenAIError
from dotenv import load_dotenv

load_dotenv(override=True)
client_kwargs = {}
if os.getenv("OPENAI_BASE_URL"):
    client_kwargs["base_url"] = os.environ["OPENAI_BASE_URL"]

WORKDIR = Path.cwd()
client = OpenAI(**client_kwargs)
MODEL = os.getenv("OPENAI_MODEL", "gpt-5.5")

# OpenAI Responses API helpers


def create_response(*, instructions: str, input: list, tools: list):
    try:
        return client.responses.create(
            model=MODEL,
            instructions=instructions,
            input=input,
            tools=tools,
            max_output_tokens=8000,
        )
    except APIStatusError as e:
        print(
            "\nOpenAI API request failed: "
            f"HTTP {e.status_code} for {getattr(e.request, 'url', 'unknown URL')}"
        )
        print(f"Model: {MODEL}")
        print(f"Message: {e.message}")
        if e.status_code == 502:
            print(
                "Hint: this is an upstream/proxy failure. Check OPENAI_BASE_URL and whether the provider supports the Responses API."
            )
        return None
    except OpenAIError as e:
        print(f"\nOpenAI API request failed: {e}")
        return None


CURRENT_TODOS: list[dict] = []
tools_configure(WORKDIR, CURRENT_TODOS)

SYSTEM = (
    f"You are a coding agent at {WORKDIR}. "
    "For complex sub-problems, use the task tool to spawn a subagent."
)

# s06: subagent gets its own system prompt — no task, no recursion
SUB_SYSTEM = (
    f"You are a coding agent at {WORKDIR}. "
    "Complete the task you were given, then return a concise summary. "
    "Do not delegate further."
)


# ═══════════════════════════════════════════════════════════
#  FROM s02-s05 (unchanged): Tool Implementations
# ═══════════════════════════════════════════════════════════


def function_tool(
    name: str, description: str, properties: dict, required: list[str]
) -> dict:
    return {
        "type": "function",
        "name": name,
        "description": description,
        "parameters": {
            "type": "object",
            "properties": properties,
            "required": required,
        },
    }


BASE_TOOLS = [
    function_tool(
        "bash", "Run a shell command.", {"command": {"type": "string"}}, ["command"]
    ),
    function_tool(
        "read_file",
        "Read file contents.",
        {"path": {"type": "string"}, "limit": {"type": "integer"}},
        ["path"],
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

TODO_TOOL = function_tool(
    "todo_write",
    "Create and manage a task list for your current coding session.",
    {
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
    ["todos"],
)

TOOLS = [*BASE_TOOLS, TODO_TOOL]

BASE_HANDLERS = {
    "bash": run_bash,
    "read_file": run_read,
    "write_file": run_write,
    "edit_file": run_edit,
    "glob": run_glob,
}

TOOL_HANDLERS = {**BASE_HANDLERS, "todo_write": run_todo_write}


# ═══════════════════════════════════════════════════════════
#  NEW in s06: Subagent — fresh messages[], summary only
# ═══════════════════════════════════════════════════════════

SUB_TOOLS = list(BASE_TOOLS)
# NO "task" tool — prevent recursive spawning

SUB_HANDLERS = BASE_HANDLERS


def spawn_subagent(description: str) -> str:
    """用隔离上下文运行子代理，并只返回它的最终总结。"""
    print(f"\n\033[35m[Subagent spawned]\033[0m")
    messages = [{"role": "user", "content": description}]  # fresh context
    """
        Python 的作用域只有 函数级 + 模块级 ， if / for / while / with 这些块都不会创建新作用域。
        只要 for 循环至少执行过一次， response 在循环外就是可用的。
    """
    for _ in range(30):  # safety limit
        response = create_response(
            instructions=SUB_SYSTEM,
            input=messages,
            tools=SUB_TOOLS,
        )
        if response is None:
            return "Subagent stopped because the OpenAI API request failed."
        messages.extend(as_input_item(item) for item in response.output)
        fcs = function_calls(response)
        if not fcs:
            break
        results = []
        for block in fcs:
            if block.type == "function_call":
                # Issue 1: subagent also runs hooks (permissions apply)
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

    # Issue 5: fallback if safety limit hit during function_call
    print(f"大模型返回: {response.output}")
    # 从大模型返回中提取文本 最后一次的assistant消息
    result = response.output_text
    if not result:
        # last message is function_call_output, look backwards for assistant text
        for msg in reversed(messages):
            if msg["role"] == "assistant":
                result = extract_text(msg["content"])
                if result:
                    break
        if not result:
            result = "Subagent stopped after 30 turns without final answer."
    print(f"\033[35m[Subagent done]\033[0m")
    return result  # only summary, entire message history discarded


# Add task tool to parent's tools
TOOLS.append(
    function_tool(
        "task",
        "Launch a subagent to handle a complex subtask. Returns only the final conclusion.",
        {"description": {"type": "string"}},
        ["description"],
    )
)
TOOL_HANDLERS["task"] = spawn_subagent


# ═══════════════════════════════════════════════════════════
#  FROM s04 (unchanged): Hook System
# ═══════════════════════════════════════════════════════════

HOOKS = {"UserPromptSubmit": [], "PreToolUse": [], "PostToolUse": [], "Stop": []}


def register_hook(event: str, callback):
    """为指定 hook 事件注册一个回调函数。"""
    HOOKS[event].append(callback)


def trigger_hooks(event: str, *args):
    """按顺序执行 hook 回调，并返回第一个非 None 结果。"""
    for callback in HOOKS[event]:
        result = callback(*args)
        if result is not None:
            return result
    return None


DENY_LIST = ["rm -rf /", "sudo", "shutdown", "reboot", "mkfs", "dd if="]


def permission_hook(block):
    """工具执行前（PreToolUse）：检查 bash 命令是否命中拒绝列表。"""
    if block.name == "bash":
        for p in DENY_LIST:
            if p in call_args(block).get("command", ""):
                print(f"\n\033[31m⛔ Blocked: '{p}'\033[0m")
                return "Permission denied"
    return None


def log_hook(block):
    """工具执行前（PreToolUse）：记录即将执行的工具调用。"""
    print(f"\033[90m[HOOK] {block.name}\033[0m")
    return None


def context_inject_hook(query: str):
    """用户提交提示后（UserPromptSubmit）：打印当前工作目录。"""
    print(f"\033[90m[HOOK] UserPromptSubmit: working in {WORKDIR}\033[0m")
    return None


def summary_hook(messages: list):
    """停止前（Stop）：打印本轮会话的工具调用次数。"""
    tool_count = sum(
        1
        for m in messages
        for b in (m.get("content") if isinstance(m.get("content"), list) else [])
        if isinstance(b, dict) and b.get("type") == "function_call_output"
    )
    print(f"\033[90m[HOOK] Stop: session used {tool_count} tool calls\033[0m")
    return None


register_hook("UserPromptSubmit", context_inject_hook)
register_hook("PreToolUse", permission_hook)
register_hook("PreToolUse", log_hook)
register_hook("Stop", summary_hook)


# ═══════════════════════════════════════════════════════════
#  agent_loop — same as s05 + nag reminder, task auto-dispatches
# ═══════════════════════════════════════════════════════════

rounds_since_todo = 0


def agent_loop(messages: list):
    """驱动父代理循环，分发工具调用，并提醒模型及时更新 todo。"""
    global rounds_since_todo
    while True:
        # s05: nag reminder
        if rounds_since_todo >= 3 and messages:
            messages.append(
                {"role": "user", "content": "<reminder>Update your todos.</reminder>"}
            )
            rounds_since_todo = 0

        response = create_response(
            instructions=SYSTEM,
            input=messages,
            tools=TOOLS,
        )
        if response is None:
            return None
        resdict = [as_input_item(item) for item in response.output]
        print(f"大模型返回: {resdict}")
        messages.extend(resdict)

        fcs = function_calls(response)
        if not fcs:
            force = trigger_hooks("Stop", messages)
            if force:
                messages.append({"role": "user", "content": force})
                continue
            # 从大模型返回中提取文本 最后一次的assistant消息
            return response

        rounds_since_todo += 1
        results = []
        for block in fcs:
            if block.type != "function_call":
                continue

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

            handler = TOOL_HANDLERS.get(block.name)
            output = (
                handler(**call_args(block)) if handler else f"Unknown: {block.name}"
            )

            trigger_hooks("PostToolUse", block, output)

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
    print("s06: Subagent — spawn sub-agents with fresh context, summary only")
    print("Type a question, press Enter. Type q to quit. OpenAI version.\n")

    history = []
    while True:
        try:
            query = input("\033[36ms06 >> \033[0m")
        except (EOFError, KeyboardInterrupt):
            break
        if query.strip().lower() in ("q", "exit", ""):
            break
        trigger_hooks("UserPromptSubmit", query)
        history.append({"role": "user", "content": query})
        response = agent_loop(history)
        if response and response.output_text:
            # 从大模型返回中提取文本 最后一次的assistant消息
            print(response.output_text)
        print()
