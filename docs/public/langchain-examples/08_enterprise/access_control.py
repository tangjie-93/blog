"""离线演示在检索前按角色过滤，而不是把敏感文档交给模型。"""

from langchain_core.documents import Document


def permitted_documents(documents: list[Document], role: str) -> list[Document]:
    """只返回 Metadata 明确允许当前角色访问的文档。"""
    return [document for document in documents if role in document.metadata["roles"]]


def main() -> None:
    """确认普通员工无法看到高管差旅制度。"""
    documents = [
        Document(
            page_content="员工每年享有 5 天年假。",
            metadata={"source": "leave.md", "roles": ["employee", "hr"]},
        ),
        Document(
            page_content="高管差旅可乘坐商务舱。",
            metadata={"source": "executive.md", "roles": ["executive"]},
        ),
    ]
    for document in permitted_documents(documents, "employee"):
        print(document.metadata["source"], document.page_content)


if __name__ == "__main__":
    main()
