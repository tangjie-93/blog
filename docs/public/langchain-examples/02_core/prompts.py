"""离线比较 PromptTemplate 与 ChatPromptTemplate 的格式化结果。"""

from langchain_core.prompts import ChatPromptTemplate, PromptTemplate


def main() -> None:
    """格式化同一组业务变量，不调用模型。"""
    text_prompt = PromptTemplate.from_template("问题：{question}\n上下文：{context}")
    chat_prompt = ChatPromptTemplate.from_messages(
        [
            ("system", "你是企业知识库助手，只根据上下文回答。"),
            ("human", "问题：{question}\n上下文：{context}"),
        ]
    )
    values = {"question": "年假有几天？", "context": "工作满一年后享有 5 天年假。"}

    print("=== PromptTemplate ===")
    print(text_prompt.invoke(values).text)
    print("\n=== ChatPromptTemplate ===")
    for message in chat_prompt.invoke(values).messages:
        print(f"{message.type}: {message.content}")


if __name__ == "__main__":
    main()
