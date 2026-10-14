---
title: LangChain Python 示例索引
date: '2026-08-24'
type: 技术
tags: LangChain|Python
note: 配套的可运行 Python 示例与环境说明。
---

# 可运行 Demo

本目录为上一级 `01-08` 专题文档提供两类示例：

- `01_chat_basics.py` 至 `08_enterprise_rag.py`：每章综合 Demo。
- `章节目录/概念.py`：一次只讲一个概念的最小 Demo。

所有脚本均包含中文说明和 `main()` 入口。标记为“离线”的脚本不会调用模型或写入远端服务，适合先理解数据结构和执行流程。

## 一次性准备

本页只展示示例索引。示例源码位于 `docs/public/langchain-examples/`，博客构建不会执行 Python；如需运行，请回到原项目安装对应依赖。

**`macOS` / `Linux`（`zsh`、`bash`）**

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -e .
cp .env.example .env
```

**`Windows`（`PowerShell`）**

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -e .
Copy-Item .env.example .env
```

在 `.env` 中填写：

> 示例会调用外部模型服务。请使用你自己的密钥，不要把密钥或生产数据提交到仓库。

```dotenv
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
OPENAI_BASE_URL=https://api.openai.com/v1
```

从项目根目录运行任一脚本，例如：

```bash
python docs/public/langchain-examples/02_core/messages.py
```

## 综合 Demo

| 脚本 | 对应主题 | 运行条件 | 验证内容 |
| --- | --- | --- | --- |
| `01_chat_basics.py` | 生态分层 | 需要 `OpenAI` | `Prompt -> Chat Model -> OutputParser` |
| `02_core_chain.py` | `langchain_core` | 需要 `OpenAI` | Message、Runnable、结构化输出 |
| `03_model_calling.py` | 模型调用 | 需要 `OpenAI` | `invoke`、`stream`、`batch`、Embedding |
| `04_rag_pipeline.py` | RAG | 需要 `OpenAI` | 文档、切分、向量检索、引用回答 |
| `05_agent_tools.py` | Agent | 需要 `OpenAI` | 模型选择并调用工具 |
| `06_langgraph.py` | LangGraph | 需要 `OpenAI` | State、Node、Edge 与模型节点 |
| `07_langsmith.py` | LangSmith | 需要 `OpenAI` 和 `LangSmith` | 包含模型调用的 Trace |
| `08_enterprise_rag.py` | 企业 RAG | 需要 `OpenAI` | 权限过滤、引用和无命中兜底 |

## 单概念 Demo

### `01` 生态分层

| 脚本 | 运行条件 | 概念 |
| --- | --- | --- |
| `01_ecosystem/ecosystem_layers.py` | 离线 | Prompt、Runnable、模型适配层和解析器之间的数据流 |

### `02` LangChain Core

| 脚本 | 运行条件 | 概念 |
| --- | --- | --- |
| `02_core/messages.py` | 离线 | System、Human、AI、Tool Message |
| `02_core/prompts.py` | 离线 | `PromptTemplate` 与 `ChatPromptTemplate` |
| `02_core/runnables.py` | 离线 | 组合、`invoke`、`batch`、`stream` |
| `02_core/tools.py` | 离线 | Tool 名称、描述、参数 Schema 和调用 |
| `02_core/output_parsers.py` | 离线 | 字符串、JSON、Pydantic 解析与失败兜底 |

### `03` 模型调用

| 脚本 | 运行条件 | 概念 |
| --- | --- | --- |
| `03_models/chat_model.py` | 需要 `OpenAI` | Chat Model 输入与 `AIMessage` 输出 |
| `03_models/stream_and_batch.py` | 需要 `OpenAI` | 流式和批量调用 |
| `03_models/embeddings.py` | 需要 `OpenAI` | 文档向量与查询向量 |
| `03_models/model_selection.py` | 离线 | 参数记录与任务模型路由 |

### `04` RAG 基础链路

| 脚本 | 运行条件 | 概念 |
| --- | --- | --- |
| `04_rag/documents.py` | 离线 | 正文与可追溯 Metadata |
| `04_rag/loaders.py` | 离线 | 自定义 Markdown Loader |
| `04_rag/text_splitters.py` | 离线 | Chunk 大小、重叠和 Metadata 继承 |
| `04_rag/vector_store.py` | 离线 | 确定性 Embedding 与内存向量库 |
| `04_rag/retrievers.py` | 离线 | `top_k`、MMR 与 Metadata 过滤 |
| `04_rag/context_building.py` | 离线 | 去重、排序和引用标签拼接 |

完整联网链路继续运行 `04_rag_pipeline.py`。

### `05` Agent 与工具

| 脚本 | 运行条件 | 概念 |
| --- | --- | --- |
| `05_agents/tool_definition.py` | 离线 | Tool 输入、返回和异常兜底 |
| `05_agents/tool_schema.py` | 离线 | 工具描述与参数 Schema |
| `05_agents/agent_loop.py` | 离线 | 判断、调用、观察、结束和最大步骤 |
| `05_agents/agentic_rag.py` | 离线 | 查询改写、充分性判断和有限重试 |

需要观察真实模型工具调用时运行 `05_agent_tools.py`。

### `06` LangGraph

| 脚本 | 运行条件 | 概念 |
| --- | --- | --- |
| `06_langgraph/state_node_edge.py` | 离线 | State、Node、Edge |
| `06_langgraph/conditional_edges.py` | 离线 | 显式条件分支 |
| `06_langgraph/bounded_loop.py` | 离线 | 带结束条件的有限循环 |
| `06_langgraph/checkpointer.py` | 离线 | Checkpointer 与 `thread_id` 隔离 |
| `06_langgraph/human_in_the_loop.py` | 离线 | `interrupt()` 与 `Command(resume=...)` |
| `06_langgraph/enterprise_rag_graph.py` | 离线 | 多节点企业 RAG Graph |

### `07` LangSmith

| 脚本 | 运行条件 | 概念 |
| --- | --- | --- |
| `07_langsmith/trace.py` | 需要 `LangSmith` | Trace 输入、输出、标签和元数据 |
| `07_langsmith/dataset.py` | 默认离线；`--write` 写远端 | Dataset 与批量 Examples |
| `07_langsmith/evaluation.py` | 离线 | 检索、答案和引用指标 |
| `07_langsmith/feedback.py` | 默认离线；`--write` 写远端 | 用户反馈闭环 |
| `07_langsmith/monitoring_metrics.py` | 离线 | 成功率、P95、Token 与空检索比例 |

运行 `07_langsmith/trace.py` 前，需要配置 `LANGSMITH_API_KEY` 和 `LANGSMITH_TRACING=true`。远端写入示例必须显式追加参数：

```bash
python docs/public/langchain-examples/07_langsmith/dataset.py --write --name enterprise-rag-eval
python docs/public/langchain-examples/07_langsmith/feedback.py --write --trace-id <TRACE_ID>
```

### `08` 企业 RAG 工程化

| 脚本 | 运行条件 | 概念 |
| --- | --- | --- |
| `08_enterprise/access_control.py` | 离线 | 检索前权限过滤 |
| `08_enterprise/knowledge_updates.py` | 离线 | 版本、Chunk ID、删除旧 Chunk 和增量更新 |
| `08_enterprise/citations.py` | 离线 | 文件、章节、页码与 Chunk 引用 |
| `08_enterprise/cost_and_latency.py` | 离线 | 调用次数、Token、耗时和成本 |
| `08_enterprise/fallbacks.py` | 离线 | 权限、超时、工具、解析和空检索兜底 |

## 推荐运行顺序

先按章节运行离线单概念脚本，再运行同章综合脚本。这样可以先确认每个对象的输入输出，再观察真实模型链路，出现问题时也更容易定位到具体步骤。
