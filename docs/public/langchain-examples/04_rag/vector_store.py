"""离线使用确定性 Embedding 构建内存向量库并执行相似度搜索。"""

from langchain_core.documents import Document
from langchain_core.embeddings import Embeddings
from langchain_core.vectorstores import InMemoryVectorStore


class KeywordEmbeddings(Embeddings):
    """用关键词生成可预测向量，仅用于离线讲解相似度搜索。"""

    @staticmethod
    def _embed(text: str) -> list[float]:
        if "年假" in text:
            return [1.0, 0.0]
        if "报销" in text:
            return [0.0, 1.0]
        return [0.5, 0.5]

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        """为文档批量生成二维教学向量。"""
        return [self._embed(text) for text in texts]

    def embed_query(self, text: str) -> list[float]:
        """用与文档相同的规则生成查询向量。"""
        return self._embed(text)


def main() -> None:
    """写入两条制度并查询最相关片段。"""
    documents = [
        Document(
            page_content="员工每年享有 5 天年假。", metadata={"source": "leave.md"}
        ),
        Document(
            page_content="超过 5000 元的报销需要审批。",
            metadata={"source": "expense.md"},
        ),
    ]
    # 关键词向量保证教学结果稳定，但不代表真实 Embedding 的语义质量。
    store = InMemoryVectorStore(KeywordEmbeddings())
    ids = store.add_documents(documents)
    results = store.similarity_search("年假制度", k=1)

    print("写入 ID：", ids)
    print("最相似文档：", results[0].page_content)


if __name__ == "__main__":
    main()
