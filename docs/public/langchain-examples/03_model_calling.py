"""联网演示 ChatGPT 的单次、流式、批量调用和 OpenAI Embedding。"""

from common import get_chat_model, get_embeddings


def main() -> None:
    """依次执行单次、流式、批量和 Embedding 调用。"""
    llm = get_chat_model()

    # 四种调用会产生真实 API 请求，请先配置 .env。
    print("=== invoke ===")
    print(llm.invoke("用一句中文解释什么是向量检索。").content)

    print("\n=== stream ===")
    for chunk in llm.stream("用一句中文解释什么是 PromptTemplate。"):
        print(chunk.content, end="", flush=True)
    print()

    print("\n=== batch ===")
    answers = llm.batch(["RAG 中的检索负责什么？", "RAG 中的生成负责什么？"])
    for answer in answers:
        print(answer.content)

    print("\n=== embedding ===")
    embedding = get_embeddings().embed_query("员工年假制度")
    print(f"dimension={len(embedding)}")


if __name__ == "__main__":
    main()
