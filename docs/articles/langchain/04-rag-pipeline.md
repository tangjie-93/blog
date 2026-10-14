---
title: RAG 基础链路
date: '2026-08-24'
type: 技术
tags: LangChain|RAG
note: 从文档加载、切分、向量检索到回答引用，跑通 RAG 链路。
---

# 04. RAG 基础链路

## 1. 这一模块解决什么问题

RAG 的核心目标是：让模型回答时参考你的私有知识，而不是只靠模型自己的记忆。

最小链路：

```text
文档加载 -> 文本切分 -> Embedding -> 向量库 -> Retriever -> Prompt -> LLM -> Answer
```

## 2. Document

Document 是 LangChain 里表示文档片段的对象，通常包含：

- `page_content`：正文
- `metadata`：来源信息

metadata 建议包含：

- 文件名
- 文档 ID
- 页码
- 章节标题
- chunk ID
- 权限信息
- 版本号

常见坑：

1. 只存正文，不存来源。
2. 文档更新后找不到旧 chunk。
3. metadata 字段不统一。
4. 回答时无法展示引用。

## 3. Loader

Loader 负责把 PDF、Word、Markdown、网页、数据库记录等加载成 Document。

重点检查：

1. 正文是否完整。
2. 页码是否保留。
3. 表格是否乱序。
4. 标题层级是否还在。
5. 扫描版 PDF 是否需要 OCR。

常见坑：

1. PDF 解析顺序错乱。
2. 页眉页脚重复进入知识库。
3. 表格内容被拆散。
4. 图片里的文字没有 OCR。

## 4. Text Splitter

Text Splitter 把长文档切成小块，方便向量化和检索。

| 参数 | 大白话解释 |
|---|---|
| chunk size | 每块多大 |
| chunk overlap | 相邻块重复多少内容 |
| separator | 按什么符号切 |
| token length | 按 token 而不是字符计算长度 |

切分建议：

1. 结构化文档优先按标题切。
2. 普通文本可以按段落切。
3. 长段落再递归切小。
4. 法务、制度类文档要保留章节编号。
5. 表格最好特殊处理，不要强行按字符切。

常见坑：

1. chunk 太大：检索不精准。
2. chunk 太小：语义不完整。
3. overlap 太小：上下文断裂。
4. overlap 太大：重复内容过多。
5. 没保留标题路径：检索到片段后不知道属于哪章。

## 5. Embedding 和向量库

Embedding 把文本变成向量，让机器能计算“语义相似”。

向量库保存向量，并支持相似度搜索。

常见能力：

- 插入向量
- 查询相似向量
- metadata 过滤
- 删除旧向量
- 更新索引

常见坑：

1. 换 embedding 模型但不重建索引。
2. 文档删除后向量没删。
3. 没有按权限过滤。
4. top_k 设置不合理。

## 6. Retriever

Retriever 是“根据问题找资料”的接口。

常见检索方式：

| 方式 | 说明 |
|---|---|
| similarity search | 按向量相似度找 |
| MMR | 兼顾相关性和多样性 |
| metadata filter | 按权限、部门、文档类型过滤 |
| hybrid search | 结合关键词和向量 |
| rerank | 先召回，再重排序 |

常见坑：

1. 只看最终答案，不看检索结果。
2. 用户问题太短，直接检索效果差。
3. top_k 太小召回不足。
4. top_k 太大塞进太多无关内容。

## 7. Context 拼接

Context 拼接是把检索到的文档片段整理后放进 Prompt。

好的上下文应该包含：

1. 片段正文。
2. 文档来源。
3. 页码或章节。
4. 片段编号。
5. 必要时包含检索分数。

常见坑：

1. 把所有检索结果原样塞进 Prompt。
2. 没有来源编号，模型无法引用。
3. 上下文太长，关键信息被淹没。
4. 没有去重。

## 8. 最小 RAG 验收标准

1. 能加载 3 到 5 篇测试文档。
2. 能切分并入库。
3. 能打印检索结果。
4. 能生成答案。
5. 答案带引用来源。
6. 至少准备 5 个测试问题。

## 9. 可运行 Demo

完成 [示例统一准备](./examples/) 后，先运行离线单概念脚本：

```powershell
python docs/public/langchain-examples/04_rag/documents.py
python docs/public/langchain-examples/04_rag/loaders.py
python docs/public/langchain-examples/04_rag/text_splitters.py
python docs/public/langchain-examples/04_rag/vector_store.py
python docs/public/langchain-examples/04_rag/retrievers.py
python docs/public/langchain-examples/04_rag/context_building.py
```

再运行联网完整 RAG：

~~~powershell
python docs/public/langchain-examples/04_rag_pipeline.py
~~~

该脚本会用 OpenAI Embeddings 构建内存向量库、检索制度片段，再由
`ChatOpenAI` 调用 ChatGPT 基于上下文生成带来源标记的答案。

## 10. 本模块自测

1. RAG 的完整链路是什么？
    + 文档加载 -> 文本切分 -> Embedding -> 向量库 -> Retriever -> Prompt -> LLM -> Answer
2. `Document.metadata` 为什么重要？
    + 用于权限过滤、文档类型分类、检索结果排序。
    + 没有 metadata 会导致检索结果不准确。
3. chunk size 和 chunk overlap 会影响什么？
    + chunk size 太大：检索不精准。
    + chunk size 太小：语义不完整。
    + overlap 太小：上下文断裂。
    + overlap 太大：重复内容过多。
4. Retriever 和 Vector Store 是什么关系？
    + Retriever 从 Vector Store 读取向量。
    + Vector Store 存储向量，支持相似度搜索。
    + 没有 Retriever 无法检索。
5. 检索为空时系统应该怎么回答？
    + 可以返回“没有相关文档”或“无法回答”。
    + 也可以根据上下文生成默认答案。
