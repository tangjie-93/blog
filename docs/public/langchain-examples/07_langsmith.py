"""联网创建包含一次 ChatGPT 调用的 LangSmith Trace。"""

import os

from common import get_chat_model
from dotenv import load_dotenv
from langsmith import traceable


@traceable(name="ecosystem-demo-answer")
def answer(question: str) -> str:
    """把问题、模型调用和回答记录在同一条 Trace 中。"""
    return get_chat_model().invoke(question).content


def main() -> None:
    """检查观测配置后创建包含模型调用的 Trace。"""
    load_dotenv()
    if not os.getenv("LANGSMITH_API_KEY"):
        raise RuntimeError(
            "LANGSMITH_API_KEY is not configured. "
            "Add it to .env before running this demo."
        )
    if os.getenv("LANGSMITH_TRACING", "").lower() != "true":
        raise RuntimeError("LANGSMITH_TRACING must be true before running this demo.")
    print(answer("用一句中文解释 LangSmith 的作用。"))


if __name__ == "__main__":
    main()
