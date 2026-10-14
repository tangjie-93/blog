"""离线演示 LangGraph 的 State、Node 和 Edge 三个基础对象。"""

from typing import TypedDict

from langgraph.graph import END, START, StateGraph


class GraphState(TypedDict):
    """节点之间共享的最小状态。"""

    question: str
    answer: str


def answer_question(state: GraphState) -> dict[str, str]:
    """从 State 读取问题，并只返回需要更新的字段。"""
    return {"answer": f"已处理问题：{state['question']}"}


def main() -> None:
    """编译并执行 START -> answer -> END。"""
    builder = StateGraph(GraphState)
    builder.add_node("answer", answer_question)
    builder.add_edge(START, "answer")
    builder.add_edge("answer", END)
    result = builder.compile().invoke({"question": "什么是 State？", "answer": ""})
    print(result)


if __name__ == "__main__":
    main()
