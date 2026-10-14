"""离线演示 Checkpointer 按 thread_id 隔离并累积会话状态。"""

import operator
from typing import Annotated, TypedDict

from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, StateGraph


class MemoryState(TypedDict):
    """通过 reducer 把同一线程的新事件追加到历史。"""

    events: Annotated[list[str], operator.add]


def main() -> None:
    """在同一线程调用两次，并对比另一线程的隔离状态。"""
    builder = StateGraph(MemoryState)
    builder.add_node("record", lambda _: {})
    builder.add_edge(START, "record")
    builder.add_edge("record", END)
    graph = builder.compile(checkpointer=InMemorySaver())

    thread_a = {"configurable": {"thread_id": "employee-a"}}
    thread_b = {"configurable": {"thread_id": "employee-b"}}
    graph.invoke({"events": ["第一次提问"]}, config=thread_a)
    print(
        "线程 A：", graph.invoke({"events": ["第二次提问"]}, config=thread_a)["events"]
    )
    print("线程 B：", graph.invoke({"events": ["独立提问"]}, config=thread_b)["events"])


if __name__ == "__main__":
    main()
