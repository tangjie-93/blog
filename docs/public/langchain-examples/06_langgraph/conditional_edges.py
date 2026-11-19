"""离线演示 Conditional Edge 根据显式状态选择下一节点。"""

from typing import Literal, TypedDict

from langgraph.graph import END, START, StateGraph


class RiskState(TypedDict):
    """保存问题、风险等级和最终处理结果。"""

    question: str
    risk: Literal["low", "high"]
    result: str


def classify(state: RiskState) -> dict[str, str]:
    """用确定性业务词表分类，避免分支依赖自由文本。"""
    return {"risk": "high" if "合同" in state["question"] else "low"}


def route(state: RiskState) -> Literal["answer", "review"]:
    """把有限枚举映射到节点名。"""
    return "review" if state["risk"] == "high" else "answer"


def main() -> None:
    """运行高风险问题，确认它进入人工复核分支。"""
    builder = StateGraph(RiskState)
    builder.add_node("classify", classify)
    builder.add_node("answer", lambda _: {"result": "自动回答"})
    builder.add_node("review", lambda _: {"result": "转人工复核"})
    builder.add_edge(START, "classify")
    builder.add_conditional_edges("classify", route)
    builder.add_edge("answer", END)
    builder.add_edge("review", END)
    print(
        builder.compile().invoke(
            {"question": "合同风险是什么？", "risk": "low", "result": ""}
        )
    )


if __name__ == "__main__":
    main()
