"""离线演示用稳定 Chunk ID 和版本号执行知识库增量更新。"""

from dataclasses import dataclass


@dataclass(frozen=True)
class Chunk:
    """关联源文档、版本和正文的可更新片段。"""

    chunk_id: str
    document_id: str
    version: int
    content: str


def replace_document(index: dict[str, Chunk], new_chunks: list[Chunk]) -> None:
    """先删除同源旧 Chunk，再写入新版本，避免新旧知识并存。"""
    document_id = new_chunks[0].document_id
    stale_ids = [
        key for key, chunk in index.items() if chunk.document_id == document_id
    ]
    for chunk_id in stale_ids:
        del index[chunk_id]
    index.update({chunk.chunk_id: chunk for chunk in new_chunks})


def main() -> None:
    """把年假制度从版本一更新到版本二。"""
    index = {"leave-v1-001": Chunk("leave-v1-001", "leave", 1, "年假 3 天")}
    replace_document(index, [Chunk("leave-v2-001", "leave", 2, "年假 5 天")])
    print(index)


if __name__ == "__main__":
    main()
