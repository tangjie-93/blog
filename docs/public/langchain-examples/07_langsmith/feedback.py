"""默认离线预览用户反馈；只有 --write 和 --trace-id 同时提供才写入。"""

import argparse
import os

from dotenv import load_dotenv
from langsmith import Client


def main() -> None:
    """构造可进入质量闭环的反馈，并保护远端写入。"""
    parser = argparse.ArgumentParser()
    parser.add_argument("--write", action="store_true", help="确认写入 LangSmith")
    parser.add_argument("--trace-id", help="要关联的 LangSmith Trace ID")
    args = parser.parse_args()
    feedback = {
        "key": "user_satisfaction",
        "score": 0,
        "comment": "引用正确，但答案遗漏申请截止时间；应加入回归测试集。",
    }
    print("反馈预览：", feedback)
    if not args.write:
        print("预览模式：如需写入，请追加 --write --trace-id <ID>。")
        return
    if not args.trace_id:
        raise ValueError("写入反馈时必须提供 --trace-id。")

    load_dotenv()
    if not os.getenv("LANGSMITH_API_KEY"):
        raise RuntimeError("请先在 .env 中配置 LANGSMITH_API_KEY。")
    Client().create_feedback(trace_id=args.trace_id, **feedback)
    print("反馈已提交。")


if __name__ == "__main__":
    main()
