"""离线采集 RAG 各阶段耗时、调用次数、Token 和估算成本。"""

from dataclasses import dataclass
from time import perf_counter


@dataclass
class RequestStats:
    """保存单次请求需要进入监控平台的指标。"""

    retrieval_ms: float = 0
    model_ms: float = 0
    model_calls: int = 0
    prompt_tokens: int = 0
    completion_tokens: int = 0

    @property
    def estimated_cost(self) -> float:
        """按示例单价估算成本，生产环境应读取真实价格表。"""
        return self.prompt_tokens * 0.0000002 + self.completion_tokens * 0.0000008


def main() -> None:
    """模拟一次请求并输出可观测指标。"""
    stats = RequestStats()
    started = perf_counter()
    _ = ["leave-policy.md"]
    stats.retrieval_ms = (perf_counter() - started) * 1000
    started = perf_counter()
    _ = "员工每年享有 5 天年假。"
    stats.model_ms = (perf_counter() - started) * 1000
    stats.model_calls = 1
    stats.prompt_tokens = 120
    stats.completion_tokens = 30
    print(stats)
    print("估算成本：", stats.estimated_cost)


if __name__ == "__main__":
    main()
