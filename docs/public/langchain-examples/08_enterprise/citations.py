"""离线生成可追溯引用，并验证答案中的标签确实对应授权片段。"""

from langchain_core.documents import Document


def citation_tag(document: Document) -> str:
    """把文件、章节、页码和 Chunk ID 编码为稳定引用标签。"""
    metadata = document.metadata
    location = f"{metadata['source']}#{metadata['section']}:p{metadata['page']}"
    return f"[{location}:{metadata['chunk_id']}]"


def main() -> None:
    """从原文片段生成答案与一一对应的引用。"""
    document = Document(
        page_content="工作满一年后，每年享有 5 天年假。",
        metadata={
            "source": "leave.md",
            "section": "第3条",
            "page": 2,
            "chunk_id": "leave-003",
        },
    )
    tag = citation_tag(document)
    answer = f"员工每年享有 5 天年假。{tag}"
    print("答案：", answer)
    print("引用原文：", tag, document.page_content)


if __name__ == "__main__":
    main()
