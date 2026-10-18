---
title: RAG 与知识库
date: '2026-10-17'
type: 技术
tags: AI|RAG|知识库
note: 让模型在可追溯证据上回答，而不是凭参数记忆猜测。
---

# 05. `RAG` 与知识库

## 1. 最小链路

```text
文档 → 解析 → 清洗 → 结构化切分 → embedding/关键词索引
问题 → 过滤/改写 → 召回 → 重排 → 上下文 → 回答+引用
```

chunk 要保留标题路径、来源、页码、版本、生效时间和权限。只保存正文会让引用和更新变得困难。

## 2. 检索策略

Dense 检索适合语义相似；`BM25` 适合名称、编号和精确词；Hybrid 将两者融合；reranker 用更强模型重新判断少量候选。先过滤租户和权限，再排序。候选多不等于答案好，重复和无关片段会挤占上下文。

## 3. 生成策略

提示词应明确：只依据证据、引用对应片段、证据不足时拒答、冲突时报告版本。引用必须来自实际检索结果，服务端保存引用对象，不能允许模型任意编造 `URL`。

## 4. 评估

检索看 Recall@k、MRR 和空结果率；生成看事实支持、完整性、相关性、引用覆盖和拒答质量；系统看延迟、成本、新鲜度和越权率。固定问题集和索引版本，每次只改一个变量。

## 5、学习任务

使用本项目 [`RAG` 培训材料](../rag/) 跑通本地 Demo，然后增加一条无答案题、一条过期版本题和一条权限隔离题。

参考：[RAGFlow](https://github.com/infiniflow/ragflow)、[Microsoft GraphRAG](https://github.com/microsoft/graphrag)、[Ragas](https://github.com/explodinggradients/ragas)。
