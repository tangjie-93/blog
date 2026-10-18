---
title: AI GitHub 项目地图
date: '2026-10-17'
type: 技术
tags: AI|GitHub
note: 基于 2026-10-17 GitHub 检索快照，按学习目标选择开源项目。
---

# 10. `AI` `GitHub` 项目地图

以下项目来自 `GitHub` 检索和项目主页核对。stars、活跃度和默认分支会变化；许可证以仓库当前声明为准，部署前必须重新核查。

## 1、基础与模型

| 项目 | 用途 | 学习入口 |
|---|---|---|
| [PyTorch](https://github.com/pytorch/pytorch) | 张量、自动微分、训练 | 从官方 tutorials 写训练循环 |
| [Transformers](https://github.com/huggingface/transformers) | 预训练模型、tokenizer、pipeline | 先跑 text classification，再读 model class |
| [JAX](https://github.com/jax-ml/jax) | 函数式数组计算、加速训练 | 比较 jit/vmap 与 PyTorch |
| [nanoGPT](https://github.com/karpathy/nanoGPT) | 小型 GPT 训练教学 | 读数据、模型和训练脚本 |

## 2、推理与部署

| 项目 | 适合 | 注意 |
|---|---|---|
| [vLLM](https://github.com/vllm-project/vllm) | 高吞吐 `LLM` 服务 | 显存、模型许可和 `API` 兼容性 |
| [SGLang](https://github.com/sgl-project/sglang) | 结构化生成、推理优化 | 关注硬件和版本支持 |
| [llama.cpp](https://github.com/ggml-org/llama.cpp) | 本地 `CPU`/`GPU`、量化模型 | GGUF 模型来源要可信 |
| [Ollama](https://github.com/ollama/ollama) | 本地模型快速试验 | 教学方便，生产能力需单独评估 |
| [TensorRT-`LLM`](https://github.com/NVIDIA/TensorRT-LLM) | NVIDIA `GPU` 推理 | CUDA 和硬件耦合明显 |

## 3、`RAG`、数据和向量

| 项目 | 用途 | 练习 |
|---|---|---|
| [RAGFlow](https://github.com/infiniflow/ragflow) | 文档解析与企业 `RAG` | 追踪解析、切分和引用链 |
| [`LlamaIndex`](https://github.com/run-llama/llama_index) | 数据连接和 `RAG` 编排 | 写一个自定义 retriever |
| [`LangChain`](https://github.com/langchain-ai/langchain) | 模型、工具、检索组件 | 对比 LCEL 与普通 `Python` |
| [Qdrant](https://github.com/qdrant/qdrant) | 向量搜索与过滤 | 测试 payload ACL 和删除 |
| [Milvus](https://github.com/milvus-io/milvus) | 大规模向量数据库 | 观察分片和索引类型 |
| [FAISS](https://github.com/facebookresearch/faiss) | 本地向量检索库 | 手写 Recall@k |
| [GraphRAG](https://github.com/microsoft/graphrag) | 图结构 `RAG` | 比较图检索与 chunk 检索 |

## 4、`Agent`、评估和多模态

| 项目 | 用途 | 边界 |
|---|---|---|
| [`OpenAI Agents SDK`](https://github.com/openai/openai-agents-python) | `Agent`、工具、handoff | 工具权限必须服务端校验 |
| [`LangGraph`](https://github.com/langchain-ai/langgraph) | 有状态 `Agent` 图 | 限制循环和持久化状态 |
| [Ragas](https://github.com/explodinggradients/ragas) | `RAG` 评估 | `LLM` judge 需人工校准 |
| [lm-evaluation-harness](https://github.com/EleutherAI/lm-evaluation-harness) | 模型基准评估 | 公开分数不等于业务质量 |
| [Diffusers](https://github.com/huggingface/diffusers) | 扩散与图像生成 | 内容安全、许可和版权 |
| [MMagic](https://github.com/open-mmlab/mmagic) | 多模态和生成视觉 | 关注项目活跃度与模型许可 |

## 5、选型顺序

1. 先选最小可运行项目，确认问题存在。
2. 看许可证、维护者、发布节奏、issue 和安全公告。
3. 用真实数据测延迟、成本、质量和失败恢复。
4. 只引入解决当前瓶颈的组件，记录替代方案。

不要用 stars 排名替代技术评估；热门项目也可能不适合你的语言、硬件、数据边界或许可证要求。
