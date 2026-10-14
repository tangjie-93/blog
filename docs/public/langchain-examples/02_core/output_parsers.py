"""离线演示字符串、JSON、Pydantic 输出解析以及解析失败兜底。"""

from typing import Literal

from langchain_core.output_parsers import (
    JsonOutputParser,
    PydanticOutputParser,
    StrOutputParser,
)
from pydantic import BaseModel


class PolicyRisk(BaseModel):
    """业务侧要求的结构化输出。"""

    risk_level: Literal["高", "中", "低"]
    needs_human_review: bool


def main() -> None:
    """解析三种输出，并捕获格式不合法的 JSON。"""
    print("字符串：", StrOutputParser().invoke("制度回答"))
    print("JSON：", JsonOutputParser().invoke('{"source_ids": ["policy-001"]}'))
    parser = PydanticOutputParser(pydantic_object=PolicyRisk)
    print(
        "Pydantic：", parser.invoke('{"risk_level": "高", "needs_human_review": true}')
    )

    try:
        JsonOutputParser().invoke("这不是 JSON")
    except Exception as exc:  # 教学示例只暴露异常类型，不泄露原始敏感输出。
        print("解析失败，进入降级流程：", type(exc).__name__)


if __name__ == "__main__":
    main()
