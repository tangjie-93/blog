"""离线评估 RAG 的检索召回、答案正确性和引用准确性。"""

from dataclasses import dataclass


@dataclass(frozen=True)
class EvaluationCase:
    """一条可重复运行的 RAG 评估样本。"""

    expected_source: str
    expected_phrase: str
    retrieved_sources: list[str]
    answer: str


def evaluate(case: EvaluationCase) -> dict[str, float]:
    """用确定性规则计算三个基础指标。"""
    source_tag = f"[{case.expected_source}]"
    return {
        "retrieval_recall": float(case.expected_source in case.retrieved_sources),
        "answer_correctness": float(case.expected_phrase in case.answer),
        "citation_accuracy": float(source_tag in case.answer),
    }


def main() -> None:
    """评估一条包含正确答案和引用的样本。"""
    case = EvaluationCase(
        expected_source="leave-policy.md",
        expected_phrase="5 天",
        retrieved_sources=["leave-policy.md", "expense-policy.md"],
        answer="员工每年享有 5 天年假。[leave-policy.md]",
    )
    print(evaluate(case))


if __name__ == "__main__":
    main()
