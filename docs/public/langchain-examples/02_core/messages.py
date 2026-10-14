"""离线演示 System、Human、AI 与 Tool 四种 Message 的职责。"""

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage, ToolMessage


def main() -> None:
    """构造一次完整的工具调用消息序列并打印消息类型。"""
    messages = [
        SystemMessage(content="你是企业制度助手。"),
        HumanMessage(content="年假有几天？"),
        AIMessage(
            content="",
            tool_calls=[
                {"name": "search_policy", "args": {"query": "年假"}, "id": "call-001"}
            ],
        ),
        # tool_call_id 必须对应 AIMessage 中的调用 ID。
        ToolMessage(
            content="工作满一年后，每年享有 5 天年假。", tool_call_id="call-001"
        ),
    ]

    for message in messages:
        print(f"{message.type}: {message.content}")


if __name__ == "__main__":
    main()
