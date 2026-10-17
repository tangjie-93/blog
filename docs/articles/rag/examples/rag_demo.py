#!/usr/bin/env python3
"""零依赖中文 RAG 教学脚本：Ollama HTTP + JSON 索引。"""
from __future__ import annotations

import argparse
import json
import math
import os
import tempfile
import urllib.error
import urllib.request
from pathlib import Path


class OllamaError(RuntimeError):
    pass


class Ollama:
    def __init__(self, base_url="http://localhost:11434", timeout=30):
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout

    def _post(self, path, payload):
        request = urllib.request.Request(
            self.base_url + path,
            data=json.dumps(payload).encode(),
            headers={"Content-Type": "application/json"},
        )
        try:
            with urllib.request.urlopen(request, timeout=self.timeout) as response:
                data = json.loads(response.read())
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
            raise OllamaError(f"Ollama 请求失败（请确认本机服务和模型）：{exc}") from exc
        if not isinstance(data, dict):
            raise OllamaError("Ollama 返回格式错误")
        return data

    def embed(self, model, text):
        result = self._post("/api/embed", {"model": model, "input": text})
        vectors = result.get("embeddings")
        if not isinstance(vectors, list) or not vectors or not isinstance(vectors[0], list):
            raise OllamaError("/api/embed 缺少 embeddings")
        return [float(x) for x in vectors[0]]

    def chat(self, model, messages):
        result = self._post("/api/chat", {"model": model, "messages": messages, "stream": False})
        try:
            return str(result["message"]["content"])
        except (KeyError, TypeError) as exc:
            raise OllamaError("/api/chat 缺少 message.content") from exc


def read_markdown(path: Path):
    text = path.read_text(encoding="utf-8")
    heading = path.stem
    chunks = []
    for line in text.splitlines():
        if line.startswith("#"):
            heading = line.lstrip("#").strip() or heading
        elif line.strip():
            chunks.append((heading, line.strip()))
    return chunks


def make_chunks(root: Path, max_chars=500):
    result = []
    for path in sorted(root.rglob("*.md")):
        for heading, line in read_markdown(path):
            if len(line) <= max_chars:
                pieces = [line]
            else:
                pieces = [line[i : i + max_chars] for i in range(0, len(line), max_chars)]
            for piece in pieces:
                result.append({"source": str(path.relative_to(root)), "heading": heading, "text": piece})
    for i, item in enumerate(result, 1):
        item["id"] = f"C{i:04d}"
    return result


def cosine(a, b):
    if len(a) != len(b):
        raise ValueError("向量维度不一致，请用同一 embedding 模型重建索引")
    denom = math.sqrt(sum(x * x for x in a)) * math.sqrt(sum(x * x for x in b))
    return sum(x * y for x, y in zip(a, b)) / denom if denom else 0.0


def atomic_write(path: Path, value):
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
    chunks = make_chunks(Path(docs_dir))
    vectors = [client.embed(embed_model, item["text"]) for item in chunks]
    dimension = len(vectors[0]) if vectors else 0
    if any(len(vector) != dimension for vector in vectors):
        raise ValueError("embedding 返回了不同维度")
    atomic_write(Path(index_path), {"version": 1, "embedding_model": embed_model, "dimension": dimension,
                                   "chunks": [{**item, "vector": vector} for item, vector in zip(chunks, vectors)]})
    return len(chunks)


def load_index(path, embed_model):
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    if data.get("embedding_model") != embed_model:
        raise ValueError(f"索引模型是 {data.get('embedding_model')}，当前是 {embed_model}；请重新 ingest")
    return data


def retrieve(client, index, question, embed_model, top_k=3):
    query = client.embed(embed_model, question)
    ranked = sorted(((cosine(query, item["vector"]), item) for item in index["chunks"]), reverse=True, key=lambda x: x[0])
    return [{**item, "score": score} for score, item in ranked[:top_k]]


def ask(client, index, question, embed_model, top_k=3, retrieval_only=False, min_score=0.2, chat_model="qwen3:4b"):
    hits = retrieve(client, index, question, embed_model, top_k)
    hits = [hit for hit in hits if hit["score"] >= min_score]
    evidence = [{**hit, "id": f"E{i}"} for i, hit in enumerate(hits, 1)]
    if retrieval_only:
        return {"answer": None, "evidence": evidence}
    if not evidence:
        return {"answer": "没有足够证据回答。", "evidence": []}
    context = "\n".join(f"[{item['id']}] {item['source']} / {item['heading']}: {item['text']}" for item in evidence)
    prompt = "只依据下列证据回答；若证据不足请明确说不知道，并在结论中引用证据编号。\n" + context + "\n问题：" + question
    answer = client.chat(chat_model, [{"role": "user", "content": prompt}])
    return {"answer": answer, "evidence": evidence}


def main():
    parser = argparse.ArgumentParser(description="最小中文 RAG（Ollama 本机 HTTP）")
    parser.add_argument("--url", default="http://localhost:11434")
    parser.add_argument("--timeout", type=float, default=30)
    sub = parser.add_subparsers(dest="command", required=True)
    p = sub.add_parser("ingest"); p.add_argument("docs"); p.add_argument("index"); p.add_argument("--embed-model", default="embeddinggemma")
    p = sub.add_parser("ask"); p.add_argument("index"); p.add_argument("question"); p.add_argument("--embed-model", default="embeddinggemma"); p.add_argument("--chat-model", default="qwen3:4b"); p.add_argument("--top-k", type=int, default=3); p.add_argument("--min-score", type=float, default=0.2); p.add_argument("--retrieval-only", action="store_true")
    args = parser.parse_args(); client = Ollama(args.url, args.timeout)
    if args.command == "ingest": print(f"已写入 {ingest(client, args.docs, args.index, args.embed_model)} 个片段")
    else: print(json.dumps(ask(client, load_index(args.index, args.embed_model), args.question, args.embed_model, args.top_k, args.retrieval_only, args.min_score, args.chat_model), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
