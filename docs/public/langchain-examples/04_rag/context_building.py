"""离线演示检索结果去重、排序以及带引用标签的 Context 拼接。"""

from langchain_core.documents import Document


def build_context(documents: list[Document]) -> str:
    """按 Chunk ID 去重，并保留来源、章节和片段编号。"""
    unique_documents = {
        document.metadata["chunk_id"]: document for document in documents
    }
    ordered = sorted(
        unique_documents.values(), key=lambda item: item.metadata["chunk_id"]
    )
    contexts = []
    for document in ordered:
        metadata = document.metadata
        tag = f"[{metadata['source']}#{metadata['section']}:{metadata['chunk_id']}]"
        contexts.append(f"{tag} {document.page_content}")
    return "\n\n".join(contexts)


def main() -> None:
    """拼接包含重复片段的模拟检索结果。"""
    metadata = {"source": "leave.md", "section": "第3条", "chunk_id": "leave-003"}
    documents = [
        Document(page_content="员工每年享有 5 天年假。", metadata=metadata),
        Document(page_content="员工每年享有 5 天年假。", metadata=metadata),
        Document(
            page_content="年假应在当年使用。",
            metadata={
                "source": "leave.md",
                "section": "第4条",
                "chunk_id": "leave-004",
            },
        ),
    ]
    print(build_context(documents))


if __name__ == "__main__":
    main()
