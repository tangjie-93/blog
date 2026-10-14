"""离线演示 Document 的正文与可追溯 Metadata。"""

from langchain_core.documents import Document


def main() -> None:
    """创建带来源、章节、页码、Chunk ID 和权限的文档片段。"""
    document = Document(
        page_content="员工工作满一年后，每年享有 5 天年假。",
        metadata={
            "source": "leave-policy.md",
            "section": "第 3 条",
            "page": 2,
            "chunk_id": "leave-v2-003",
            "roles": ["employee", "hr"],
            "version": 2,
        },
    )
    print("正文：", document.page_content)
    print("来源：", document.metadata)


if __name__ == "__main__":
    main()
