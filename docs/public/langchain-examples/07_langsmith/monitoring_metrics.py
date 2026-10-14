"""离线聚合企业 RAG 的成功率、P95 延迟、Token 和检索为空比例。"""

from dataclasses import dataclass


@dataclass(frozen=True)
class RequestMetric:
    """一条请求的最小生产监控记录。"""

    success: bool
    latency_ms: int
    tokens: int
    tool_calls: int
    retrieval_empty: bool


def percentile_95(values: list[int]) -> int:
    """使用 nearest-rank 方法计算小样本 P95。"""
    ordered = sorted(values)
    index = max(0, (95 * len(ordered) + 99) // 100 - 1)
    return ordered[index]


def main() -> None:
    """从三条请求记录生成一组监控摘要。"""
    metrics = [
        RequestMetric(True, 420, 380, 1, False),
        RequestMetric(True, 610, 510, 2, False),
        RequestMetric(False, 1200, 90, 0, True),
    ]
    print("成功率：", sum(item.success for item in metrics) / len(metrics))
    print("P95 延迟：", percentile_95([item.latency_ms for item in metrics]), "ms")
    print("Token 总量：", sum(item.tokens for item in metrics))
    print(
        "检索为空比例：", sum(item.retrieval_empty for item in metrics) / len(metrics)
    )


if __name__ == "__main__":
    main()
