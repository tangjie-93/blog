"""离线演示如何把普通函数包装为带参数 Schema 的 LangChain Tool。"""

from langchain_core.tools import tool


@tool
def search_policy_docs(query: str) -> str:
    """按关键词搜索企业制度；仅用于年假或报销问题。"""
    policies = {
        "年假": "工作满一年后，每年享有 5 天年假。",
        "报销": "超过 5000 元需审批。",
    }
    return policies.get(query, "未找到相关制度。")


def main() -> None:
    """展示模型可见的工具元数据并执行一次工具调用。"""
    print("名称：", search_policy_docs.name)
    print("描述：", search_policy_docs.description)
    print("参数：", search_policy_docs.args_schema.model_json_schema()["properties"])
    print("结果：", search_policy_docs.invoke({"query": "年假"}))


if __name__ == "__main__":
    main()
