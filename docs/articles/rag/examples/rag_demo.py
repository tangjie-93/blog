#!/usr/bin/env python3
"""零依赖中文 RAG 教学脚本：OpenAI 兼容 HTTP + JSON 索引。

嵌入走硅基流动（SiliconFlow），对话走 OpenAI GPT；两者都是 OpenAI 兼容接口。
API Key 只从环境变量读取，不写进代码，也不写进索引文件。
"""
from __future__ import annotations

import argparse
import json
import math
import os
import tempfile
import urllib.error
import urllib.request
from pathlib import Path

# 默认端点；可用环境变量 SILICONFLOW_BASE_URL / OPENAI_BASE_URL 覆盖
EMBED_URL = "https://api.siliconflow.cn/v1"
CHAT_URL = "https://api.openai.com/v1"


class ApiError(RuntimeError):
    """外部接口调用失败或返回结构不符合预期时，统一抛出这个异常。"""


class OpenAICompatible:
    """OpenAI 兼容协议的最小客户端：硅基流动做嵌入，OpenAI 做对话。

    两个服务只是地址和 Key 不同，请求与响应格式相同，所以共用一个类。
    """

    def __init__(self, timeout=60):
        """只读取配置，不发请求；缺 Key 也会等到真正调用时才报错。"""
        self.embed_url = os.environ.get("SILICONFLOW_BASE_URL", EMBED_URL).rstrip("/")
        self.embed_key = os.environ.get("SILICONFLOW_API_KEY", "")
        self.chat_url = os.environ.get("OPENAI_BASE_URL", CHAT_URL).rstrip("/")
        self.chat_key = os.environ.get("OPENAI_API_KEY", "")
        self.timeout = timeout

    def _post(self, base_url, api_key, key_name, path, payload):
        """向指定端点发一次 POST，返回解析后的 JSON 字典。"""
        # 没有 Key 就不发请求，否则只会收到一个 401，错误信息还不如这里清楚
        if not api_key:
            raise ApiError(f"缺少环境变量 {key_name}：请先 export {key_name}=...")

        request = urllib.request.Request(
            base_url + path,
            data=json.dumps(payload).encode(),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}",
            },
        )
        try:
            with urllib.request.urlopen(request, timeout=self.timeout) as response:
                data = json.loads(response.read())
        except urllib.error.HTTPError as exc:
            # 401（Key 无效）、429（限流）等状态码保留下来，便于排查
            detail = exc.read().decode("utf-8", "replace")[:200]
            raise ApiError(f"{base_url}{path} 返回 HTTP {exc.code}：{detail}") from exc
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
            # 网络不通、超时、响应不是合法 JSON，对上层都是“服务不可用”
            raise ApiError(f"{base_url}{path} 请求失败：{exc}") from exc
        if not isinstance(data, dict):
            raise ApiError(f"{base_url}{path} 返回格式错误：预期 JSON 对象")
        return data

    def embed(self, model, text):
        """把一段文本换成一组浮点数（向量）。"""
        result = self._post(
            self.embed_url,
            self.embed_key,
            "SILICONFLOW_API_KEY",
            "/embeddings",
            {"model": model, "input": text},
        )
        # OpenAI 兼容格式：{"data": [{"embedding": [...]}]}，即使只传一条也是批量结构
        data = result.get("data")
        if not isinstance(data, list) or not data or not isinstance(data[0], dict):
            raise ApiError("/embeddings 缺少 data[0].embedding")
        vector = data[0].get("embedding")
        if not isinstance(vector, list) or not vector:
            raise ApiError("/embeddings 缺少 data[0].embedding")
        return [float(x) for x in vector]

    def chat(self, model, messages):
        """把消息列表发给对话模型，返回完整回答文本。"""
        result = self._post(
            self.chat_url,
            self.chat_key,
            "OPENAI_API_KEY",
            "/chat/completions",
            {"model": model, "messages": messages, "stream": False},
        )
        # 非流式响应：choices[0].message.content 就是完整回答
        try:
            return str(result["choices"][0]["message"]["content"])
        except (KeyError, IndexError, TypeError) as exc:
            raise ApiError("/chat/completions 缺少 choices[0].message.content") from exc


def read_markdown(path: Path):
    """读取一个 Markdown 文件，返回 [(当前标题, 正文行), ...]。"""
    text = path.read_text(encoding="utf-8")
    heading = path.stem  # 没有 # 标题时，用文件名兜底
    chunks = []
    for line in text.splitlines():
        if line.startswith("#"):
            heading = line.lstrip("#").strip() or heading
        elif line.strip():
            chunks.append((heading, line.strip()))
    return chunks


def make_chunks(root: Path, max_chars=500):
    """递归读取目录下的 .md，按行切成不超过 max_chars 的块并编号。"""
    result = []
    for path in sorted(root.rglob("*.md")):
        for heading, line in read_markdown(path):
            if len(line) <= max_chars:
                pieces = [line]
            else:
                # 超长行直接硬切，没有重叠窗口
                pieces = [
                    line[i : i + max_chars]
                    for i in range(0, len(line), max_chars)
                ]
            for piece in pieces:
                result.append(
                    {
                        "source": str(path.relative_to(root)),
                        "heading": heading,
                        "text": piece,
                    }
                )
    # 统一编号 C0001、C0002……，方便日志和排查引用
    for i, item in enumerate(result, 1):
        item["id"] = f"C{i:04d}"
    return result


def cosine(a, b):
    """计算两个等长向量的余弦相似度；任一为零向量时返回 0。"""
    if len(a) != len(b):
        raise ValueError("向量维度不一致，请用同一 embedding 模型重建索引")
    denom = math.sqrt(sum(x * x for x in a)) * math.sqrt(sum(x * x for x in b))
    return sum(x * y for x, y in zip(a, b)) / denom if denom else 0.0


def atomic_write(path: Path, value):
    """先写同目录临时文件，再原子替换目标，避免留下半个 JSON。"""
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, temp = tempfile.mkstemp(prefix=path.name + ".", dir=path.parent)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as handle:
            json.dump(value, handle, ensure_ascii=False, indent=2)
            handle.write("\n")
        os.replace(temp, path)
    finally:
        if os.path.exists(temp):
            os.unlink(temp)


def ingest(client, docs_dir, index_path, embed_model):
    """全量重建索引：切块 → 逐块嵌入 → 校验维度 → 原子写入。"""
    chunks = make_chunks(Path(docs_dir))
    vectors = [client.embed(embed_model, item["text"]) for item in chunks]

    # 所有向量必须来自同一模型且维度一致，否则索引不可用
    dimension = len(vectors[0]) if vectors else 0
    if any(len(vector) != dimension for vector in vectors):
        raise ValueError("embedding 返回了不同维度")

    atomic_write(
        Path(index_path),
        {
            "version": 1,
            "embedding_model": embed_model,
            "dimension": dimension,
            "chunks": [
                {**item, "vector": vector}
                for item, vector in zip(chunks, vectors)
            ],
        },
    )
    return len(chunks)


def load_index(path, embed_model):
    """读取索引，并确认它是用当前嵌入模型建的。"""
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    if data.get("embedding_model") != embed_model:
        raise ValueError(
            f"索引模型是 {data.get('embedding_model')}，"
            f"当前是 {embed_model}；请重新 ingest"
        )
    return data


def retrieve(client, index, question, embed_model, top_k=3):
    """用问题向量给所有块打分，返回分数最高的 top_k 条。"""
    query = client.embed(embed_model, question)  # 只有问题需要新算向量
    ranked = sorted(
        ((cosine(query, item["vector"]), item) for item in index["chunks"]),
        reverse=True,
        key=lambda pair: pair[0],
    )
    return [{**item, "score": score} for score, item in ranked[:top_k]]


def ask(client, index, question, embed_model, top_k=3, retrieval_only=False,
        min_score=0.2, chat_model="gpt-6.1-terra"):
    """检索、过滤、编号证据，再决定只检索、拒答还是调用对话模型。"""
    # 1. 召回候选，丢掉分数低于阈值的，并把 id 换成本轮引用编号 E1、E2……
    hits = retrieve(client, index, question, embed_model, top_k)
    hits = [hit for hit in hits if hit["score"] >= min_score]
    evidence = [{**hit, "id": f"E{i}"} for i, hit in enumerate(hits, 1)]

    # 2. 只检索模式：不调用对话模型，直接返回证据
    if retrieval_only:
        return {"answer": None, "evidence": evidence}

    # 3. 没有证据：固定拒答，避免模型脱离资料自由发挥
    if not evidence:
        return {"answer": "没有足够证据回答。", "evidence": []}

    # 4. 有证据：把来源、标题、正文装进 Prompt，要求按编号引用
    context = "\n".join(
        f"[{item['id']}] {item['source']} / {item['heading']}: {item['text']}"
        for item in evidence
    )
    prompt = (
        "只依据下列证据回答；若证据不足请明确说不知道，并在结论中引用证据编号。\n"
        + context
        + "\n问题："
        + question
    )
    answer = client.chat(chat_model, [{"role": "user", "content": prompt}])
    return {"answer": answer, "evidence": evidence}


def main():
    """解析命令行参数，按子命令执行 ingest 或 ask。"""
    parser = argparse.ArgumentParser(
        description="最小中文 RAG（硅基流动嵌入 + OpenAI GPT 对话）"
    )
    # 全局参数放在子命令之前，例如：
    # python3 rag_demo.py --timeout 90 ask index.json "午餐补贴是多少"
    parser.add_argument(
        "--timeout", type=float, default=60, help="单次 HTTP 请求超时（秒）"
    )

    sub = parser.add_subparsers(dest="command", required=True)

    # ingest：从文档目录重建索引，只用到嵌入 Key
    ingest_parser = sub.add_parser("ingest", help="切块、嵌入并写入索引")
    ingest_parser.add_argument("docs", help="Markdown 文档目录")
    ingest_parser.add_argument("index", help="输出的索引 JSON 路径")
    ingest_parser.add_argument(
        "--embed-model", default="BAAI/bge-m3", help="嵌入模型名"
    )

    # ask：读取已有索引回答问题，需要嵌入 Key；完整问答还需要对话 Key
    ask_parser = sub.add_parser("ask", help="检索索引并回答问题")
    ask_parser.add_argument("index", help="已建好的索引 JSON 路径")
    ask_parser.add_argument("question", help="用户问题")
    ask_parser.add_argument(
        "--embed-model",
        default="BAAI/bge-m3",
        help="嵌入模型名，必须与建索引时一致",
    )
    ask_parser.add_argument(
        "--chat-model", default="gpt-6.1-terra", help="对话模型名"
    )
    ask_parser.add_argument(
        "--top-k", type=int, default=3, help="先取分数最高的几条候选"
    )
    ask_parser.add_argument(
        "--min-score",
        type=float,
        default=0.2,
        help="低于该分数的候选不进入证据",
    )
    ask_parser.add_argument(
        "--retrieval-only",
        action="store_true",
        help="只返回证据，不调用对话模型",
    )

    args = parser.parse_args()
    # 构造客户端只读取两个端点与 Key，不会发请求
    client = OpenAICompatible(args.timeout)

    if args.command == "ingest":
        count = ingest(client, args.docs, args.index, args.embed_model)
        print(f"已写入 {count} 个片段")
        return

    # ask 分支：先加载并检查索引，再检索、组装证据并可选地调用对话模型
    index = load_index(args.index, args.embed_model)
    result = ask(
        client,
        index,
        args.question,
        args.embed_model,
        top_k=args.top_k,
        retrieval_only=args.retrieval_only,
        min_score=args.min_score,
        chat_model=args.chat_model,
    )
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
