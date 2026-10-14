"""联网演示 ChatGPT 自主选择本地制度工具并消费工具结果。"""

from common import get_chat_model
from langchain.agents import create_agent
from langchain_core.tools import tool


@tool
def search_policy(query: str) -> str:
    """搜索企业制度片段；仅用于年假或报销规则。"""
    if "年假" in query:
        return "员工工作满一年后，每年享有 5 天年假。"
    if "报销" in query:
        return "单笔超过 5000 元的报销，需要部门负责人审批。"
    return "No matching policy was found."


def main() -> None:
    """创建 Agent 并运行一次需要检索制度的问题。"""
    # 工具描述和 system_prompt 共同约束模型的调用边界。
    agent = create_agent(
        model=get_chat_model(),
        tools=[search_policy],
        system_prompt=(
            "Answer policy questions in Chinese. Use search_policy before answering."
        ),
    )
    result = agent.invoke(
        {"messages": [{"role": "user", "content": "工作满一年有几天年假？"}]}
    )
    print(result["messages"][-1].content)


if __name__ == "__main__":
    main()
