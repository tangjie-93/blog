"""联网串联 Message、Prompt、Runnable 与 ChatGPT 结构化输出。"""

from typing import Literal

from common import get_chat_model
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field


class PolicyAnswer(BaseModel):
    """业务侧要求模型稳定返回的字段。"""

    answer: str = Field(description="A concise answer in Chinese.")
    confidence: Literal["high", "medium", "low"]


def main() -> None:
    """先调用消息列表，再运行结构化输出链。"""
    # 先直接调用 Message 列表，再把 Prompt、模型和结构化输出串成 Runnable。
    llm = get_chat_model()
    messages = [
        SystemMessage(content="You answer enterprise policy questions in Chinese."),
        HumanMessage(content="年假制度通常应包含哪些信息？"),
    ]
    print("=== Message ===")
    print(llm.invoke(messages).content)

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", "Only use the supplied context. Return the requested schema."),
            ("human", "Question: {question}\nContext: {context}"),
        ]
    )
    chain = prompt | llm.with_structured_output(PolicyAnswer)
    result = chain.invoke(
        {
            "question": "工作满一年有几天年假？",
            "context": "员工工作满一年后，每年享有 5 天年假。",
        }
    )
    print("\n=== Runnable + structured output ===")
    print(result.model_dump_json(indent=2))


if __name__ == "__main__":
    main()
