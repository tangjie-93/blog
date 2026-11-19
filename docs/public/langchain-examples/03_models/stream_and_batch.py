"""联网比较 Chat Model 的 stream 与 batch 调用方式。"""

from common import get_chat_model


def main() -> None:
    """先流式输出一个回答，再批量处理两个独立问题。"""
    model = get_chat_model()
    print("=== stream ===")
    for chunk in model.stream("用一句中文解释流式输出。"):
        print(chunk.content, end="", flush=True)
    print("\n\n=== batch ===")
    for response in model.batch(["检索负责什么？", "生成负责什么？"]):
        print(response.content)


if __name__ == "__main__":
    main()
