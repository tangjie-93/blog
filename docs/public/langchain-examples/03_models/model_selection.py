"""离线演示根据任务风险和成本选择模型配置。"""

from dataclasses import dataclass


@dataclass(frozen=True)
class ModelProfile:
    """记录可审计的模型名称与关键参数。"""

    model: str
    temperature: float
    timeout_seconds: int
    max_retries: int


def select_model(task: str) -> ModelProfile:
    """高风险任务使用更强模型，普通任务使用低成本模型。"""
    if task == "合同风险分析":
        return ModelProfile("gpt-5.5", 0, 60, 2)
    return ModelProfile("gpt-4o-mini", 0, 20, 2)


def main() -> None:
    """打印两类任务的模型路由结果。"""
    for task in ["查询改写", "合同风险分析"]:
        print(task, "->", select_model(task))


if __name__ == "__main__":
    main()
