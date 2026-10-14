"""联网运行最小 LangChain 链，观察 Prompt、模型与解析器如何协作。"""

from common import get_chat_model
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate


def main() -> None:
    """调用一次最小链并打印中文回答。"""
    # Prompt 负责组织角色消息，模型负责生成，解析器把 AIMessage 转成字符串。
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", "You are a concise enterprise knowledge assistant."),
            ("human", "Answer this question in Chinese: {question}"),
        ]
    )
    chain = prompt | get_chat_model() | StrOutputParser()
    print(chain.invoke({"question": "什么是 RAG？"}))


if __name__ == "__main__":
    main()
