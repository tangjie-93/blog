#!/usr/bin/env python3
"""
s04: Hooks — move extension logic out of the loop, onto hooks.

  User types query
       │
       ▼
  ┌──────────────────┐
  │ UserPromptSubmit │ ── trigger_hooks() before LLM
  └────────┬─────────┘
           ▼
  ┌────────────┐     ┌─────────────────────────────┐
  │  messages  │────▶│  LLM (stop_reason=function_call?)│
  └────────────┘     │   No ──▶ Stop hooks ──▶ exit │
                     │   Yes ──▶ function_call block ──┐ │
                     └────────────────────────────┘ │
                                                    ▼
                                          ┌──────────────────┐
                                          │ trigger_hooks()   │
                                          │  PreToolUse:      │
                                          │   permission_hook │
                                          │   log_hook        │
                                          └───────┬──────────┘
                                                  │ (not blocked)
                                          ┌───────▼──────────┐
                                          │ TOOL_HANDLERS[x]  │
                                          └───────┬──────────┘
                                                  │
                                          ┌───────▼──────────┐
                                          │ trigger_hooks()   │
                                          │  PostToolUse:     │
                                          │   large_output    │
                                          └───────┬──────────┘
                                                  │
                                          results ──▶ back to messages

Changes from s03:
  + HOOKS registry (event -> list of callbacks)
  + register_hook() / trigger_hooks()
  + context_inject_hook (UserPromptSubmit)
  + permission_hook, log_hook (PreToolUse)
  + large_output_hook (PostToolUse)
  + summary_hook (Stop)
  - check_permission() removed from loop body
    (logic moved into permission_hook, triggered via PreToolUse)

Run: python s04_hooks/code.py
Needs: pip install openai python-dotenv + OPENAI_API_KEY in .env
"""

import os
import sys
from pathlib import Path

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

from common.utils import as_input_item, call_args, extract_text, function_calls, parse_arguments
from common.tools import configure as tools_configure, run_bash, run_edit, run_glob, run_read, run_write, safe_path

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

SYSTEM = f"You are a coding agent at {WORKDIR}. Use tools to solve tasks. Act, don't explain."


# ═══════════════════════════════════════════════════════════
#  Tool Definitions & Dispatch
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
]

TOOL_HANDLERS = {
    "bash": run_bash,
    "read_file": run_read,
    "write_file": run_write,
    "edit_file": run_edit,
    "glob": run_glob,
}


# ═══════════════════════════════════════════════════════════
#  NEW in s04: Hook System (s03 permission logic now via hooks)
# ═══════════════════════════════════════════════════════════

HOOKS = {"UserPromptSubmit": [], "PreToolUse": [], "PostToolUse": [], "Stop": []}


def register_hook(event: str, callback):
    """为指定 Hook 事件注册一个回调函数，按注册顺序保存。"""
    HOOKS[event].append(callback)


def trigger_hooks(event: str, *args):
    """依次触发事件回调；任一回调返回非 None 时立即返回该阻止结果。"""
    for callback in HOOKS[event]:
        result = callback(*args)
        if result is not None:  # teaching shortcut: block this tool call
            return result
    return None


# s03 permission check logic, now wrapped as a hook
DENY_LIST = ["rm -rf /", "sudo", "shutdown", "reboot", "mkfs", "dd if="]
DESTRUCTIVE = ["rm ", "> /etc/", "chmod 777"]


def permission_hook(block):
    """在工具执行前检查拒绝列表和高风险操作，必要时要求用户确认或阻止调用。"""
    if block.name == "bash":
        for pattern in DENY_LIST:
            if pattern in call_args(block).get("command", ""):
                print(f"\n\033[31m⛔ Blocked: '{pattern}'\033[0m")
                return "Permission denied by deny list"
        for kw in DESTRUCTIVE:
            if kw in call_args(block).get("command", ""):
                print(f"\n\033[33m⚠  Potentially destructive command\033[0m")
                print(f"   Tool: {block.name}({call_args(block)})")
                choice = input("   Allow? [y/N] ").strip().lower()
                if choice not in ("y", "yes"):
                    return "Permission denied by user"
    if block.name in ("write_file", "edit_file"):
        path = call_args(block).get("path", "")
        if not (WORKDIR / path).resolve().is_relative_to(WORKDIR):
            print(f"\n\033[33m⚠  Writing outside workspace\033[0m")
            print(f"   Tool: {block.name}({call_args(block)})")
            choice = input("   Allow? [y/N] ").strip().lower()
            if choice not in ("y", "yes"):
                return "Permission denied by user"
    return None


def log_hook(block):
    """在工具执行前打印工具名和简短参数预览，便于观察调用过程。"""
    args_preview = str(list(call_args(block).values())[:2])[:60]
    print(f"\033[90m[HOOK] {block.name}({args_preview})\033[0m")
    return None


def large_output_hook(block, output):
    """在工具执行后检查输出长度；超过阈值时给出终端警告。"""
    if len(str(output)) > 100000:
        print(
            f"\033[33m[HOOK] ⚠ Large output from {block.name}: {len(str(output))} chars\033[0m"
        )
    return None


# UserPromptSubmit hook: log user input before it reaches the LLM
def context_inject_hook(query: str):
    """在用户输入提交后记录当前工作目录，作为演示用的上下文 Hook。"""
    print(f"\033[90m[HOOK] UserPromptSubmit: working in {WORKDIR}\033[0m")
    return None


# Stop hook: print summary when loop is about to exit
def summary_hook(messages: list):
    """
    在 Agent 循环结束前统计并打印本次会话产生的工具结果数量。
    在多轮对话的历史里，找每一条消息的 content 字段，如果它是列表，
    就进到列表里找所有 type 为 "function_call_output" 的 block，数一数有多少个。
    """
    # 同一个生成器表达式里的顺序子句，按顺序执行
    tool_count = sum(
        1  # 每匹配到一个，就计 1
        for m in messages  # 遍历每条消息
        for b in (  # 遍历每条消息的 content 列表
            m.get("content")  # 如果 content 是列表 → 遍历里面的每个 block
            if isinstance(m.get("content"), list)
            else []  # 不是列表 → 跳过（空列表，啥也不遍历）
        )
        if isinstance(b, dict)  # 每个 block 必须是 dict
        and b.get("type") == "function_call_output"  # 且 type 是工具调用结果
    )
    print(f"\033[90m[HOOK] Stop: session used {tool_count} tool calls\033[0m")
    return None


# 注册 Hook 函数
# 顺序：UserPromptSubmit -> PreToolUse -> PostToolUse -> Stop
register_hook("UserPromptSubmit", context_inject_hook)
register_hook("PreToolUse", permission_hook)
register_hook("PreToolUse", log_hook)
register_hook("PostToolUse", large_output_hook)
register_hook("Stop", summary_hook)


# ═══════════════════════════════════════════════════════════
#  agent_loop — same structure as s03, but no hard-coded check
#  s03: if not check_permission(block): ...
#  s04: if trigger_hooks("PreToolUse", block): ...
# ═══════════════════════════════════════════════════════════


def agent_loop(messages: list):
    """循环调用模型、通过 Hook 管理工具执行，并回填工具结果直到模型停止调用。"""
    while True:
        response = client.responses.create(
            model=MODEL,
            instructions=SYSTEM,
            input=messages,
            tools=TOOLS,
            max_output_tokens=8000,
        )
        messages.extend(as_input_item(item) for item in response.output)
        if not function_calls(response):  # 1. 模型只回了文字，没调工具 → 任务可能完成了
            force = trigger_hooks(
                "Stop", messages
            )  # 2. 触发 Stop 钩子（如 summary_hook）
            if force:  # 3. 钩子可以返回"强制继续"的文字
                messages.append({"role": "user", "content": force})  # 注入新的用户消息
                continue  # 回到循环开头，再跑一轮
            return  # 4. 钩子没拦截 → 真的结束

        results = []
        for block in function_calls(response):
            if block.type != "function_call":
                continue

            # ---------- PreToolUse 钩子：执行工具之前 ----------
            # 例如：权限校验、记录日志。钩子返回字符串 = 拦截，返回 None = 放行
            blocked = trigger_hooks("PreToolUse", block)
            if blocked:
                # 被拦截：构造一个假的工具结果，告诉模型"为什么不让做"
                results.append(
                    {
                        "type": "function_call_output",
                        "call_id": block.call_id,
                        "output": str(blocked),
                    }
                )
                continue  # 跳过实际执行，处理下一个工具调用

            # ---------- 执行工具 ----------
            handler = TOOL_HANDLERS.get(block.name)
            output = (
                handler(**call_args(block)) if handler else f"Unknown: {block.name}"
            )

            # ---------- PostToolUse 钩子：执行工具之后 ----------
            # 例如：大输出截断、结果记录、副作用处理
            trigger_hooks("PostToolUse", block, output)

            results.append(
                {
                    "type": "function_call_output",
                    "call_id": block.call_id,
                    "output": output,
                }
            )

        messages.extend(results)


if __name__ == "__main__":
    print("s04: Hooks — extension logic on hooks, loop stays clean")
    print("Type a question, press Enter. Type q to quit. OpenAI version.\n")

    history = []
    while True:
        try:
            query = input("\033[36ms04 >> \033[0m")
        except (EOFError, KeyboardInterrupt):
            break
        if query.strip().lower() in ("q", "exit", ""):
            break
        trigger_hooks("UserPromptSubmit", query)
        history.append({"role": "user", "content": query})
        response = agent_loop(history)
        if response and response.output_text:
            print(response.output_text)
        print()  # 为了分隔不同轮对话
