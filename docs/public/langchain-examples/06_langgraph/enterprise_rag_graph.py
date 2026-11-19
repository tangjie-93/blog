"""离线构建包含改写、检索、评分、分支和回答的企业 RAG Graph。"""

from typing import Literal, TypedDict

from langgraph.graph import END, START, StateGraph


class RagState(TypedDict):
    """只保存各节点之间明确共享的 RAG 字段。"""

    question: str
    query: str
    context: str
    enough_context: bool
    answer: str


def route(state: RagState) -> Literal["generate", "fallback"]:
    """根据布尔字段路由，避免解析自由文本。"""
    return "generate" if state["enough_context"] else "fallback"


def main() -> None:
    """运行一个五节点企业 RAG 流程。"""
    policies = {"年假 额度": "员工每年享有 5 天年假。"}
    builder = StateGraph(RagState)
    builder.add_node(
        "rewrite",
        lambda state: {
            "query": "年假 额度" if "年假" in state["question"] else state["question"]
        },
    )
    builder.add_node(
        "retrieve", lambda state: {"context": policies.get(state["query"], "")}
    )
    builder.add_node("grade", lambda state: {"enough_context": bool(state["context"])})
    builder.add_node(
        "generate", lambda state: {"answer": f"根据制度，{state['context']}"}
    )
    builder.add_node("fallback", lambda _: {"answer": "当前知识库没有找到依据。"})
    builder.add_edge(START, "rewrite")
    builder.add_edge("rewrite", "retrieve")
    builder.add_edge("retrieve", "grade")
    builder.add_conditional_edges("grade", route)
    builder.add_edge("generate", END)
    builder.add_edge("fallback", END)
    initial = {
        "question": "年假有几天？",
        "query": "",
        "context": "",
        "enough_context": False,
        "answer": "",
    }
    print(builder.compile().invoke(initial))


if __name__ == "__main__":
    main()
