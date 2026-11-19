"""联网演示 Chat Model 的 invoke 输入和 AIMessage 输出。"""

from common import get_chat_model
from langchain_core.messages import HumanMessage, SystemMessage


def main() -> None:
    """调用一次 OpenAI 兼容聊天模型并打印返回消息。"""
    messages = [
        SystemMessage(content="你是简洁的企业知识库助手。"),
        HumanMessage(content="用一句中文解释 Chat Model。"),
    ]
    response = get_chat_model().invoke(messages)
    print("消息类型：", response.type)
    print("回答：", response.content)


if __name__ == "__main__":
    main()
