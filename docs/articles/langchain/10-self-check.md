---
title: LangChain 生态自测清单
date: '2026-08-24'
type: 技术
tags: LangChain|RAG
note: 用问题和动手验收检查 LangChain 生态知识掌握情况。
---

# 10. 自测清单

## 1. 使用方式

这份清单用来检查你是否真的理解 `LangChain` 生态。

建议做法：

1. 先不看答案，自己口头回答。
2. 每个问题尽量用大白话解释。
3. 能写最小代码例子的，就写一个。
4. 答不上来的问题，回到对应专题文档复习。

### 1.1 动手验收

完成 [示例统一准备](./examples/)，然后逐一运行 examples/01 至
examples/08 的脚本。验收时至少确认：

1. 01_chat_basics.py 输出一段 `ChatGPT` 中文回答。
2. 04_rag_pipeline.py 先打印检索到的来源文本，再打印带 [source] 的回答。
3. 05_agent_tools.py 能得到基于工具返回的年假答案。
4. 06_langgraph.py 能从 `LangGraph` 的最终 `State` 取到模型回答。
5. 设置 `LangSmith` 配置后，07_langsmith.py 的调用可在 `LangSmith` 项目中查询到。

## 2. 生态分层

1. `langchain_core` 和 `langchain` 有什么区别？
2. 为什么现在很多模型集成要用独立包？
3. `langchain_community` 适合放什么？
4. `langgraph` 和 `langchain` 是竞争关系吗？
5. `langsmith` 是写业务流程的，还是做观测评估的？

## 3. `langchain_core`

1. Message 里的 system、human、ai、tool 分别代表什么？
2. `PromptTemplate` 和 `ChatPromptTemplate` 有什么区别？
3. `Runnable` 解决什么问题？
4. `.invoke()`、`.stream()`、`.batch()` 有什么区别？
5. `Tool` 的名称和描述为什么重要？
6. `OutputParser` 失败时应该怎么处理？

## 4. 模型调用

1. Chat `Model` 和 `Embedding` `Model` 有什么区别？
2. 为什么 `RAG` 入库和查询最好使用同一个 embedding 模型？
3. 换 embedding 模型后为什么通常要重建索引？
4. temperature 对回答有什么影响？
5. streaming 适合什么场景？
6. 为什么要记录模型版本和参数？

## 5. `RAG`

1. `RAG` 的最小链路包含哪些步骤？
2. `Document.page_content` 和 `Document.metadata` 分别放什么？
3. chunk size 和 chunk overlap 会影响什么？
4. Loader 阶段最容易出什么问题？
5. `Retriever` 和 Vector Store 是什么关系？
6. top_k 太大或太小分别有什么问题？
7. 为什么答案必须带引用来源？
8. 检索不到资料时系统应该怎么回答？

## 6. `Agent` 和工具

1. 普通 `RAG` 和 `Agentic` `RAG` 的区别是什么？
2. `Agent` 为什么不是越自由越好？
3. 什么样的工具描述更容易让模型正确调用？
4. 为什么 `Agent` 必须限制最大步骤？
5. 工具调用失败时应该给模型返回什么？
6. 什么场景不适合使用 `Agent`？

## 7. `LangGraph`

1. `State`、`Node`、`Edge` 分别是什么？
2. Conditional `Edge` 解决什么问题？
3. 什么情况下需要循环？
4. 为什么循环必须有结束条件？
5. 什么场景需要 Checkpointer？
6. `Human-in-the-loop` 解决什么问题？
7. 一个好的 `Node` 应该满足什么标准？

## 8. `LangSmith`

1. Trace 能看到哪些信息？
2. 为什么只看最终答案不够？
3. Dataset 应该包含哪些样本？
4. Evaluation 可以评估哪些指标？
5. 用户 feedback 应该如何进入改进流程？
6. 企业 `RAG` 上线后至少要监控哪些指标？

## 9. 企业 `RAG` 工程化

1. 为什么权限过滤不能只靠前端？
2. 为什么不能先检索全部文档，再让模型不要说敏感内容？
3. 文档更新时为什么要处理旧 chunk？
4. 什么样的引用才算可追溯？
5. `RAG` 成本主要来自哪些地方？
6. 如何判断一次 `Prompt` 修改真的提升了效果？
7. 从 Demo 到生产还缺哪些能力？

## 10. 最终验收

如果你能完成下面 5 件事，说明你已经具备 `LangChain` 生态的基础实战理解：

1. 画出 `LangChain`、`LangGraph`、`LangSmith`、langchain_core 的关系图。
2. 写出一个最小 `RAG` 链路。
3. 把一个函数封装成 `Tool`。
4. 用 `LangGraph` 设计一个带条件分支的流程。
5. 用 `LangSmith` 分析一次错误回答的原因。
