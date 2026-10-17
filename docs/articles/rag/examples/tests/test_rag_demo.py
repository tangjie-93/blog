import json
import tempfile
import unittest
from unittest.mock import patch
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parents[1]))
from rag_demo import Ollama, OllamaError, ask, cosine, ingest, load_index, retrieve


class FakeOllama:
    def __init__(self):
        self.calls = []

    def embed(self, model, text):
        self.calls.append(("embed", model, text))
        return [1.0, 0.0] if "午餐" in text or "补贴" in text else [0.0, 1.0]

    def chat(self, model, messages):
        self.calls.append(("chat", model, messages))
        return "依据 [E1]，午餐补贴是 30 元。"


class RagTests(unittest.TestCase):
    def test_ollama_http_boundary_and_bad_response(self):
        class Response:
            def __enter__(self): return self
            def __exit__(self, *_): return False
            def read(self): return b'{"embeddings": [[1, 2]]}'
        with patch("rag_demo.urllib.request.urlopen", return_value=Response()):
            self.assertEqual(Ollama().embed("fake", "问题"), [1.0, 2.0])
        with patch("rag_demo.urllib.request.urlopen", side_effect=TimeoutError("slow")):
            with self.assertRaises(OllamaError): Ollama(timeout=0.01).embed("fake", "问题")

    def test_cosine_and_ranking(self):
        self.assertAlmostEqual(cosine([1, 0], [2, 0]), 1)
        index = {"embedding_model": "fake", "dimension": 2, "chunks": [{"id": "C1", "text": "午餐补贴", "vector": [1, 0], "source": "a", "heading": "h"}, {"id": "C2", "text": "访客", "vector": [0, 1], "source": "b", "heading": "h"}]}
        hits = retrieve(FakeOllama(), index, "午餐", "fake", 1)
        self.assertEqual(hits[0]["id"], "C1")

    def test_empty_index_and_model_mismatch(self):
        client = FakeOllama()
        self.assertEqual(ask(client, {"embedding_model": "fake", "chunks": []}, "问题", "fake", retrieval_only=True)["evidence"], [])
        with tempfile.TemporaryDirectory() as temp:
            path = Path(temp) / "index.json"; path.write_text('{"embedding_model":"other","chunks":[]}', encoding="utf-8")
            with self.assertRaises(ValueError): load_index(path, "fake")

    def test_ingest_rebuilds_without_stale_chunks_and_atomic_json(self):
        client = FakeOllama()
        with tempfile.TemporaryDirectory() as temp:
            docs = Path(temp) / "docs"; docs.mkdir(); (docs / "a.md").write_text("# A\n午餐补贴 30 元", encoding="utf-8")
            index = Path(temp) / "index.json"
            self.assertEqual(ingest(client, docs, index, "fake"), 1)
            (docs / "a.md").unlink(); (docs / "b.md").write_text("# B\n访客登记", encoding="utf-8")
            self.assertEqual(ingest(client, docs, index, "fake"), 1)
            data = json.loads(index.read_text(encoding="utf-8")); self.assertEqual(data["chunks"][0]["source"], "b.md")

    def test_citations_and_refusal(self):
        index = {"embedding_model": "fake", "chunks": [{"id": "C1", "text": "午餐补贴 30 元", "vector": [1, 0], "source": "a", "heading": "h"}]}
        client = FakeOllama(); result = ask(client, index, "午餐", "fake")
        self.assertEqual(result["evidence"][0]["id"], "E1"); self.assertIn("E1", result["answer"])
        self.assertEqual(ask(client, index, "宠物", "fake")["answer"], "没有足够证据回答。")


if __name__ == "__main__": unittest.main()
