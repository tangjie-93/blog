"""模型调用单概念示例共用的模型与环境变量配置。"""

import os

from dotenv import load_dotenv
from langchain_openai import ChatOpenAI, OpenAIEmbeddings


def get_chat_model() -> ChatOpenAI:
    """创建聊天模型，并在缺少密钥时给出明确提示。"""
    load_dotenv()
    if not os.getenv("OPENAI_API_KEY"):
        raise RuntimeError(
            "OPENAI_API_KEY is not configured. Copy .env.example to .env and set it."
        )
    return ChatOpenAI(
        model=os.getenv("OPENAI_MODEL", "gpt-5.5"),
        temperature=0,
        base_url=os.getenv("OPENAI_BASE_URL"),
    )


def get_embeddings() -> OpenAIEmbeddings:
    """创建与聊天模型使用相同中转地址的 Embedding 客户端。"""
    load_dotenv()
    if not os.getenv("OPENAI_API_KEY"):
        raise RuntimeError(
            "OPENAI_API_KEY is not configured. Copy .env.example to .env and set it."
        )
    return OpenAIEmbeddings(
        model=os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small"),
        base_url=os.getenv("OPENAI_BASE_URL"),
    )
