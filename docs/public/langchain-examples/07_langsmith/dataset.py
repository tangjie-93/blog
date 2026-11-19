"""默认离线预览 LangSmith Dataset；只有传入 --write 才写入远端。"""

import argparse
import json
import os

from dotenv import load_dotenv
from langsmith import Client

EXAMPLES = [
    {
        "inputs": {"question": "年假有几天？"},
        "outputs": {"answer": "工作满一年后，每年享有 5 天年假。"},
        "metadata": {"category": "高频问题", "source": "leave-policy.md"},
    },
    {
        "inputs": {"question": "高管差旅规则是什么？"},
        "outputs": {"answer": "无权限时应拒绝回答。"},
        "metadata": {"category": "权限边界", "source": "access-control"},
    },
]


def main() -> None:
    """预览样本，或在显式授权后批量创建 Dataset 和 Examples。"""
    parser = argparse.ArgumentParser()
    parser.add_argument("--write", action="store_true", help="确认写入 LangSmith")
    parser.add_argument("--name", default="enterprise-rag-learning-demo")
    args = parser.parse_args()
    if not args.write:
        print(json.dumps(EXAMPLES, ensure_ascii=False, indent=2))
        print("预览模式：如需写入，请追加 --write。")
        return

    load_dotenv()
    if not os.getenv("LANGSMITH_API_KEY"):
        raise RuntimeError("请先在 .env 中配置 LANGSMITH_API_KEY。")
    client = Client()
    dataset = client.create_dataset(
        dataset_name=args.name, description="企业 RAG 学习评估集"
    )
    client.create_examples(dataset_id=dataset.id, examples=EXAMPLES)
    print("已创建 Dataset：", dataset.name)


if __name__ == "__main__":
    main()
