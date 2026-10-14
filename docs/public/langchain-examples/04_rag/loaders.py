"""离线实现一个最小 Markdown Loader，并用临时文件验证加载结果。"""

from collections.abc import Iterator
from pathlib import Path
from tempfile import TemporaryDirectory

from langchain_core.document_loaders import BaseLoader
from langchain_core.documents import Document


class MarkdownLoader(BaseLoader):
    """把单个 Markdown 文件加载为保留来源信息的 Document。"""

    def __init__(self, path: Path) -> None:
        """记录待加载的 Markdown 文件路径。"""
        self.path = path

    def lazy_load(self) -> Iterator[Document]:
        """延迟读取文件，避免一次性占用大量内存。"""
        yield Document(
            page_content=self.path.read_text(encoding="utf-8"),
            metadata={"source": self.path.name, "format": "markdown"},
        )


def main() -> None:
    """创建临时制度文件并展示 Loader 输出。"""
    with TemporaryDirectory() as directory:
        path = Path(directory) / "leave-policy.md"
        path.write_text("# 年假制度\n\n工作满一年后享有 5 天年假。", encoding="utf-8")
        for document in MarkdownLoader(path).load():
            print(document.metadata)
            print(document.page_content)


if __name__ == "__main__":
    main()
