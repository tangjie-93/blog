"""离线演示递归文本切分中的 Chunk 大小、重叠和 Metadata 继承。"""

from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter


def main() -> None:
    """切分制度文本并为每个片段补充稳定 Chunk ID。"""
    document = Document(
        page_content=(
            "第一章 总则。年假用于保障员工休息。\n\n"
            "第二章 额度。工作满一年后，每年享有五天年假。\n\n"
            "第三章 申请。员工应提前在系统中提交申请。"
        ),
        metadata={"source": "leave-policy.md", "version": 2},
    )
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=35,
        chunk_overlap=8,
        separators=["\n\n", "。", ""],
    )
    chunks = splitter.split_documents([document])

    for index, chunk in enumerate(chunks, start=1):
        chunk.metadata["chunk_id"] = f"leave-v2-{index:03d}"
        print(chunk.metadata, chunk.page_content)


if __name__ == "__main__":
    main()
