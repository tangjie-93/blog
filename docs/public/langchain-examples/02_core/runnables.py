"""离线演示 Runnable 的组合、invoke、batch 与 stream。"""

from langchain_core.runnables import RunnableLambda


def main() -> None:
    """用两个单一职责步骤组成制度查询流水线。"""
    policies = {"年假": "每年 5 天", "报销": "超过 5000 元需审批"}
    retrieve = RunnableLambda(lambda query: policies.get(query, "未找到制度"))
    format_answer = RunnableLambda(lambda context: f"制度说明：{context}")
    chain = retrieve | format_answer

    print("invoke:", chain.invoke("年假"))
    print("batch:", chain.batch(["年假", "报销"]))
    print("stream:", list(chain.stream("报销")))


if __name__ == "__main__":
    main()
