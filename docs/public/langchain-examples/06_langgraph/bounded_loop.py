"""离线演示带明确结束条件和最大次数的 LangGraph 循环。"""

from typing import Literal, TypedDict

from langgraph.graph import END, START, StateGraph


class RetryState(TypedDict):
    """记录检索次数和资料是否足够。"""

    attempts: int
    enough_context: bool


def retrieve(state: RetryState) -> dict[str, int | bool]:
    """第二次检索后模拟资料充分。"""
    attempts = state["attempts"] + 1
    return {"attempts": attempts, "enough_context": attempts >= 2}


def route(state: RetryState) -> Literal["retrieve", "finish"]:
    """资料充分或达到三次上限时结束。"""
    return "finish" if state["enough_context"] or state["attempts"] >= 3 else "retrieve"


def main() -> None:
    """执行有限检索循环并输出最终次数。"""
    builder = StateGraph(RetryState)
    builder.add_node("retrieve", retrieve)
    builder.add_node("finish", lambda state: state)
    builder.add_edge(START, "retrieve")
    builder.add_conditional_edges("retrieve", route)
    builder.add_edge("finish", END)
    print(builder.compile().invoke({"attempts": 0, "enough_context": False}))


if __name__ == "__main__":
    main()
