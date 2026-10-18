---
title: LangChain 生态总览
date: '2026-08-24'
type: 技术
tags: LangChain|RAG
note: 从生态分层到企业 RAG 工程化，建立完整学习地图。
---

# `LangChain` 生态总览

> 更新日期：`2026-08-24`  
> 用途：作为 `LangChain` 生态学习入口。详细知识点已经拆到 `本专题文章` 目录下。

## 1. 一句话理解

`LangChain` 生态不是一个单独的库，而是一套围绕 `LLM` 应用开发的工具体系：

```text
langchain_core 是底座
langchain 是开发框架
langgraph 是流程编排和 Agent 运行时
langsmith 是调试、评估、监控平台
各种 langchain_xxx / langchain_community 是外部工具和模型的适配器
```

## 2. 生态关系图

```text
你的业务代码
  |
  | 调用模型、Prompt、工具、检索器
  v
langchain
  |
  | 底层统一接口来自这里
  v
langchain_core

模型、向量库、工具通过集成包接进来：
  - langchain_openai
  - langchain_anthropic
  - langchain_community
  - langchain_text_splitters
  - langchain_chroma / langchain_qdrant / langchain_pinecone

复杂 Agent 流程：
  langgraph
    -> State
    -> Node
    -> Edge
    -> Conditional Edge
    -> Checkpointer
    -> Human-in-the-loop

调试、评估、监控：
  langsmith
    -> Trace
    -> Dataset
    -> Evaluation
    -> Feedback
```

## 3. 文档阅读顺序

建议按这个顺序读：

1. [生态分层](./01-ecosystem-layers.md)
2. [`langchain_core` 基础对象](./02-langchain-core.md)
3. [模型调用](./03-model-calling.md)
4. [`RAG` 基础链路](./04-rag-pipeline.md)
5. [`Agent` 和工具调用](./05-agent-and-tools.md)
6. [`LangGraph` 编排](./06-langgraph-orchestration.md)
7. [`LangSmith` 观测和评估](./07-langsmith-observability.md)
8. [企业 `RAG` 工程化](./08-enterprise-rag-engineering.md)
9. [学习和实践路径](./09-learning-path.md)
10. [自测清单](./10-self-check.md)

## 4. 先运行 Demo

不要只按顺序读理论。每篇 01-08 文档都有对应的可执行入口，统一说明见
[examples/README.md](./examples/)。所有生成类示例都用
`ChatOpenAI` 调用 `OpenAI` `ChatGPT`，需要先配置 `OPENAI_API_KEY`。

## 5. 最常见组合

### 5.1 `5.1` 基础 `RAG`

```text
langchain_core
langchain
langchain_openai 或其他模型集成包
langchain_text_splitters
向量库集成包
```

适合：企业知识库问答、文档问答、FAQ 助手、简单检索增强生成。

### 5.2 `5.2` 复杂 `RAG` `Agent`

```text
langchain_core
langchain
langgraph
langsmith
模型集成包
向量库集成包
```

适合：多轮任务、查询改写、多路检索、答案自检、人工审批、可恢复流程。

### 5.3 `5.3` 上线生产

```text
langsmith
评估数据集
trace 追踪
成本监控
Prompt 版本管理
用户反馈闭环
```

生产环境不要只看“本地问了几个问题，感觉还行”。企业 `RAG` 和 `Agent` 必须能追踪、能评估、能复盘。

## 6. 核心分工

| 问题 | 主要看谁 |
|---|---|
| 我要统一调用不同模型 | `langchain_core` + 模型集成包 |
| 我要写 `Prompt` 模板 | `langchain_core` / `langchain` |
| 我要把函数变成工具 | `langchain_core.tools` / `langchain.tools` |
| 我要快速创建 `Agent` | `langchain` |
| 我要复杂流程编排 | `langgraph` |
| 我要循环、分支、人工审批 | `langgraph` |
| 我要记录每一步调用 | `langsmith` |
| 我要做评估集和回归测试 | `langsmith` |
| 我要看线上成本和延迟 | `langsmith` |

## 7. 推荐学习路线

第一阶段：先搞懂普通 `RAG`。

```text
文档加载 -> 文本切分 -> Embedding -> 向量库 -> Retriever -> Prompt -> LLM -> Answer
```

第二阶段：搞懂 `langchain_core` 里的基础接口。

```text
Message -> PromptTemplate -> Runnable -> Tool -> OutputParser
```

第三阶段：做工具调用和简单 `Agent`。

```text
函数 -> Tool -> 模型选择工具 -> 工具结果回到模型 -> 最终回答
```

第四阶段：流程复杂后再学 `LangGraph`。

```text
State -> Node -> Edge -> Conditional Edge -> Checkpointer -> Human-in-the-loop
```

第五阶段：接入 `LangSmith`。

```text
Trace -> Dataset -> Evaluation -> Feedback -> Monitoring
```

## 8. 一句话总结

```text
先用 LangChain 跑通 RAG
再用 LangSmith 看清问题
最后在流程复杂时引入 LangGraph
```

## 9. 官方资料

- `LangChain` `Python` Overview: https://docs.langchain.com/oss/python/langchain/overview
- `LangGraph` Overview: https://docs.langchain.com/oss/python/langgraph/overview
- `LangGraph` `Agentic` `RAG`: https://docs.langchain.com/oss/python/langgraph/agentic-rag
- `LangChain` Core Reference: https://reference.langchain.com/python/langchain-core
- `LangSmith` Observability: https://docs.langchain.com/langsmith/observability
- `LangSmith` FAQ: https://docs.langchain.com/langsmith/faq
