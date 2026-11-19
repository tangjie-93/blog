"""联网演示文档和查询使用同一个 Embedding 模型生成等维向量。"""

from common import get_embeddings


def main() -> None:
    """分别生成文档向量和查询向量，并比较维度。"""
    embeddings = get_embeddings()
    document_vectors = embeddings.embed_documents(["员工年假制度", "费用报销制度"])
    query_vector = embeddings.embed_query("年假有几天")

    print("文档数量：", len(document_vectors))
    print("文档向量维度：", len(document_vectors[0]))
    print("查询向量维度：", len(query_vector))
    print("维度一致：", len(document_vectors[0]) == len(query_vector))


if __name__ == "__main__":
    main()
