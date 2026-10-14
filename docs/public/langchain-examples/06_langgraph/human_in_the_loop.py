"""离线演示 LangGraph 人工审批的暂停、检查和恢复。"""

from typing import Literal, TypedDict

from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, StateGraph
from langgraph.types import Command, interrupt


class ApprovalState(TypedDict):
    """保存高风险动作和最终审批状态。"""

    action: str
    status: Literal["pending", "approved", "rejected"]


def review(state: ApprovalState) -> dict[str, str]:
    """暂停并把操作依据交给人工，恢复值决定审批结果。"""
    approved = interrupt({"question": "是否批准？", "action": state["action"]})
    return {"status": "approved" if approved else "rejected"}


def main() -> None:
    """先触发中断，再模拟人工批准并恢复执行。"""
    builder = StateGraph(ApprovalState)
    builder.add_node("review", review)
    builder.add_edge(START, "review")
    builder.add_edge("review", END)
    graph = builder.compile(checkpointer=InMemorySaver())
    config = {"configurable": {"thread_id": "approval-001"}}

    paused = graph.invoke({"action": "发送合同", "status": "pending"}, config=config)
    print("待审批：", paused["__interrupt__"][0].value)
    print("审批结果：", graph.invoke(Command(resume=True), config=config)["status"])


if __name__ == "__main__":
    main()
