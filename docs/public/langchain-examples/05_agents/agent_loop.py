"""离线拆解 Agent 的判断、工具调用、观察和结束循环。"""

from dataclasses import dataclass, field


@dataclass
class AgentState:
    """保存循环次数和可观测的中间步骤。"""

    question: str
    steps: list[str] = field(default_factory=list)
    answer: str = ""


def run_agent(question: str, max_steps: int = 3) -> AgentState:
    """用确定性规则模拟模型决策，并强制限制最大步骤。"""
    state = AgentState(question=question)
    for _ in range(max_steps):
        if not state.steps:
            state.steps.append("判断：需要调用 search_policy")
            continue
        if len(state.steps) == 1:
            result = "工作满一年后，每年享有 5 天年假。"
            state.steps.append(f"观察：{result}")
            continue
        state.answer = f"根据工具结果，{state.steps[-1].removeprefix('观察：')}"
        state.steps.append("结束：已生成有依据的回答")
        break
    else:
        state.answer = "达到最大步骤数，转人工处理。"
    return state


def main() -> None:
    """输出中间步骤和最终回答，便于定位 Agent 决策。"""
    state = run_agent("工作满一年有几天年假？")
    print(*state.steps, sep="\n")
    print("回答：", state.answer)


if __name__ == "__main__":
    main()
