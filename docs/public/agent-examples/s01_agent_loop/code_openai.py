#!/usr/bin/env python3
"""
s01_agent_loop_openai.py - The Agent Loop with OpenAI

Same harness shape as code.py, but using OpenAI's Responses API:

    while tool_calls:
        response = LLM(messages, tools)
        execute tools
        append function_call_output

Usage:
    pip install openai python-dotenv
    OPENAI_API_KEY=... OPENAI_MODEL=gpt-5.5 python s01_agent_loop/code_openai.py
"""

import os
import sys
from pathlib import Path

try:
    import readline

    # macOS 的 libedit 在处理中文输入时有退格问题，这四行修复它
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

#  override=True ： .env 文件里的值 会强制覆盖 系统中已有的同名环境变量。即 .env 文件的优先级更高。
load_dotenv(override=True)

client_kwargs = {}
if os.getenv("OPENAI_BASE_URL"):
    client_kwargs["base_url"] = os.environ["OPENAI_BASE_URL"]

client = OpenAI(**client_kwargs)
MODEL = os.getenv("OPENAI_MODEL", "gpt-5.5")

WORKDIR = Path.cwd()
tools_configure(WORKDIR)

SYSTEM = (
    f"You are a coding agent at {WORKDIR}. Use bash to solve tasks. Act, don't explain."
)

# -- Tool（工具）定义 -----------------------------------------------------------
# 告诉 OpenAI："你可以调用这个工具来做事"，就像给模型一本说明书。
# 格式是 OpenAI Function Calling API 规定的，字段名不能随便改。
#
# 【Schema 参数详解】
# ┌─────────────┬─────────────────────────────────────────────────────────────────┐
# │ type        │ 固定值 "function"，表示定义一个函数工具。                         │
# │             │ 目前 OpenAI 只支持 "function" 这一种类型。                         │
# ├─────────────┼─────────────────────────────────────────────────────────────────┤
# │ name        │ 工具的唯一标识名。模型在返回 function_call 时用这个名字            │
# │             │ 告诉你想调哪个工具。命名规则：只能包含 a-z A-Z 0-9 _ -            │
# ├─────────────┼─────────────────────────────────────────────────────────────────┤
# │ description │ 用自然语言描述工具的功能、使用场景和注意事项。                     │
# │             │ 这是模型判断「什么时候该用这个工具」的核心依据。                   │
# │             │ 描述越清晰，模型越不容易误用。                                    │
# ├─────────────┼─────────────────────────────────────────────────────────────────┤
# │ parameters  │ 工具的参数定义，格式是 JSON Schema。包含：                        │
# │             │   type:       固定 "object"，表示参数是一个 JSON 对象              │
# │             │   properties: 参数列表，每个参数定义 name + type + description    │
# │             │   required:   必填参数名列表，模型必须提供这些参数                  │
# │             │   additionalProperties: False 阻止模型自由发挥传额外参数           │
# ├─────────────┼─────────────────────────────────────────────────────────────────┤
# │ strict      │ True 时模型必须严格按 parameters 的 schema 生成参数。             │
# │             │ False 时模型允许返回 schema 里没定义的额外字段。                   │
# │             │ 生产环境建议始终设为 True。                                       │
# └─────────────┴─────────────────────────────────────────────────────────────────┘
# 整个 TOOLS 是一个列表，可以一次定义多个工具（如 bash + read + write）。
TOOLS = [
    {
        "type": "function",  # 固定值：函数工具
        "name": "bash",  # 工具名，模型调用时用来指定工具
        "description": "Run a shell command.",  # 模型据此判断何时使用
        "parameters": {  # 参数的 JSON Schema
            "type": "object",  # 参数总是一个 JSON 对象
            "properties": {  # 参数列表
                "command": {"type": "string"}  # 参数名 command，类型 string
            },
            "required": ["command"],  # command 必须提供
            "additionalProperties": False,  # 不允许传未定义的参数
        },
        "strict": True,  # 严格按 schema 生成参数
    }
]


# -- The core pattern: call tools until the model stops ----------------------
def agent_loop(messages: list):
    """核心 Agent 循环：调用模型、执行工具、回填结果，直到模型停止调用工具。"""
    while True:
        # 把当前历史消息、系统提示词和工具列表一起发给 OpenAI。
        # 模型会决定：直接回答，还是调用我们提供的 bash 工具。
        response = client.responses.create(
            model=MODEL,
            instructions=SYSTEM,
            input=messages,
            tools=TOOLS,
            max_output_tokens=8000,
        )

        # Append assistant turn
        # 把模型这一轮输出追加到历史里。
        # 这样下一轮请求时，模型能看到自己刚才说了什么、调用了什么工具。
        messages.extend(as_input_item(item) for item in response.output)

        # If the model didn't call a tool, we're done
        # 找出模型这一轮里所有的工具调用。
        # 在 OpenAI Responses API 中，工具调用的类型是 "function_call"。
        tool_calls = [
            item
            for item in response.output
            # 只取类型为 "function_call" 的项。
            if getattr(item, "type", None) == "function_call"
        ]
        if not tool_calls:
            # 没有工具调用，说明模型已经给出最终回答，循环结束。
            return response

        # Execute each tool call, collect results
        # 模型一次可能请求多个工具调用，这里逐个执行。
        for call in tool_calls:
            # call.arguments 是 JSON 字符串，先解析成 Python 字典。
            args = parse_arguments(call.arguments)
            if call.name != "bash":
                # 目前我们只注册了 bash 工具，其他工具名都视为未知工具。
                output = f"Error: Unknown tool {call.name}"
            elif "_error" in args:
                # 参数 JSON 解析失败，把错误直接作为工具输出返回给模型。
                output = args["_error"]
            else:
                # 取出模型想执行的 shell 命令。
                command = args.get("command", "")
                #  黄色打印命令
                print(f"\033[33m$ {command}\033[0m")
                # 真正执行命令，并拿到命令输出。
                output = run_bash(command)
                # 为了命令行界面不刷屏，只预览前 200 个字符。
                print(output[:200])

            # 把工具执行结果追加到消息历史里。
            # call_id 必须和模型刚才的工具调用对应上，模型才知道这是哪次调用的结果。
            messages.append(
                {
                    "type": "function_call_output",
                    "call_id": call.call_id,
                    "output": output,
                }
            )


# -- Entry point -------------------------------------------------------------
if __name__ == "__main__":
    print("s01: Agent Loop (OpenAI)")
    print("输入问题，回车发送。输入 q 退出。\n")

    history = []
    while True:
        try:
            query = input(
                "\033[36ms01-openai >> \033[0m"
            )  # 显示青色提示符，等待用户输入，返回输入的字符串
        except (EOFError, KeyboardInterrupt):
            break
        if query.strip().lower() in ("q", "exit", ""):
            break
        history.append({"role": "user", "content": query})
        response = agent_loop(history)
        if getattr(response, "output_text", ""):
            print(response.output_text)
        # 换行，方便下一次输入
        print()
