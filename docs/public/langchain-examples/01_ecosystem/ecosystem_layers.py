"""离线观察 LangChain 核心协议层如何把 Prompt、Runnable 和解析器串起来。"""

from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableLambda


def main() -> None:
    """运行不依赖模型服务的最小生态协作链。"""
    prompt = ChatPromptTemplate.from_template("请用一句话解释：{topic}")
    # 本地 Runnable 模拟模型适配层，便于只观察不同层之间的数据流。
    local_model = RunnableLambda(
        lambda prompt_value: f"模型收到 {len(prompt_value.messages)} 条消息"
    )
    chain = prompt | local_model | StrOutputParser()

    print("=== 核心协议层 -> 集成层 -> 输出解析层 ===")
    print(chain.invoke({"topic": "RAG"}))


if __name__ == "__main__":
    main()
