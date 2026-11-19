"""离线演示 Agentic RAG 的查询改写、检索充分性判断和有限重试。"""

POLICIES = {"年假 额度": "员工工作满一年后，每年享有 5 天年假。"}


def run_agentic_rag(question: str, max_attempts: int = 2) -> tuple[str, list[str]]:
    """资料不足时改写一次查询，超过上限后明确降级。"""
    query = question
    trace: list[str] = []
    for attempt in range(1, max_attempts + 1):
        trace.append(f"第 {attempt} 次检索：{query}")
        context = POLICIES.get(query)
        if context:
            return f"根据制度，{context}", trace
        # 确定性改写便于离线观察循环，不依赖模型自由输出。
        query = "年假 额度" if "年假" in question else f"{question} 制度"
    return "当前知识库没有找到足够依据。", trace


def main() -> None:
    """运行一次需要改写后才能命中的查询。"""
    answer, trace = run_agentic_rag("年假有几天？")
    print(*trace, sep="\n")
    print("回答：", answer)


if __name__ == "__main__":
    main()
