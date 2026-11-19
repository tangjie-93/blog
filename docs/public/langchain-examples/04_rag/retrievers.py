"""离线比较 Retriever 的 top_k、MMR 和 Metadata 权限过滤。"""

from langchain_core.documents import Document
from langchain_core.embeddings import DeterministicFakeEmbedding
from langchain_core.vectorstores import InMemoryVectorStore


def main() -> None:
    """把 Vector Store 转为 Retriever，并在检索阶段应用权限过滤。"""
    documents = [
        Document(page_content="普通员工年假为 5 天。", metadata={"role": "employee"}),
        Document(page_content="高管差旅可乘坐商务舱。", metadata={"role": "executive"}),
        Document(
            page_content="报销超过 5000 元需要审批。", metadata={"role": "employee"}
        ),
    ]
    store = InMemoryVectorStore(DeterministicFakeEmbedding(size=32))
    store.add_documents(documents)
    retriever = store.as_retriever(
        search_type="mmr",
        search_kwargs={
            "k": 2,
            "filter": lambda doc: doc.metadata["role"] == "employee",
        },
    )

    for document in retriever.invoke("员工制度"):
        print(document.metadata, document.page_content)


if __name__ == "__main__":
    main()
