"""联网演示用 LangSmith traceable 记录输入、输出、标签和元数据。"""

import os

from dotenv import load_dotenv
from langsmith import traceable


@traceable(name="policy-search", tags=["demo", "retrieval"], metadata={"version": "v1"})
def search_policy(question: str) -> dict[str, str]:
    """返回可被 Trace 记录的本地检索输入和输出。"""
    return {"question": question, "context": "员工每年享有 5 天年假。"}


def validate_langsmith_config() -> None:
    """确认 API Key 和 Trace 开关都已启用。"""
    load_dotenv()
    if not os.getenv("LANGSMITH_API_KEY"):
        raise RuntimeError("请先在 .env 中配置 LANGSMITH_API_KEY。")
    if os.getenv("LANGSMITH_TRACING", "").lower() != "true":
        raise RuntimeError("请先设置 LANGSMITH_TRACING=true。")


def main() -> None:
    """检查 LangSmith 配置后创建一次可查询的 Trace。"""
    validate_langsmith_config()
    print(search_policy("年假有几天？"))


if __name__ == "__main__":
    main()
