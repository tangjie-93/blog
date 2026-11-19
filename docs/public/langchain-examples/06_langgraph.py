"""联网构建包含共享 State、模型 Node 和固定 Edge 的最小 LangGraph。"""

from typing import TypedDict

from common import get_chat_model
from langgraph.graph import END, START, StateGraph


class GraphState(TypedDict):
    """图中所有节点共享的输入与输出字段。"""

    question: str
    answer: str


def answer_question(state: GraphState) -> dict[str, str]:
    """在单一职责节点中调用 ChatGPT，并只更新 answer 字段。"""
    response = get_chat_model().invoke(f"用一句中文回答下面的问题：{state['question']}")
    return {"answer": response.content}


def main() -> None:
    """编译固定边图并从最终 State 读取回答。"""
    builder = StateGraph(GraphState)
    builder.add_node("answer_question", answer_question)
    builder.add_edge(START, "answer_question")
    builder.add_edge("answer_question", END)
    graph = builder.compile()

    result = graph.invoke({"question": "LangGraph 适合解决什么问题？"})
    print(result["answer"])


if __name__ == "__main__":
    main()
