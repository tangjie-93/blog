---
title: 企业 RAG 工程化
date: '2026-08-24'
type: 技术
tags: LangChain|RAG
note: 补齐企业 RAG 的权限、更新、引用、成本与失败兜底。
---

# 08. 企业 `RAG` 工程化

## 1. 这一模块解决什么问题

Demo 能跑，不代表企业 `RAG` 能上线。

企业场景必须补齐：

- 权限
- 更新
- 溯源
- 评估
- 监控
- 成本
- 失败兜底

## 2. 权限过滤

权限过滤是保证用户只能检索到自己有权查看的文档。

企业知识库最怕越权回答。

错误做法：

```text
先检索所有文档，再让模型不要回答敏感内容。
```

正确做法：

```text
检索阶段就按权限过滤。
```

要会什么：

1. 文档入库时写入权限 `metadata`。
2. 检索时按用户、部门、角色过滤。
3. 引用来源也要做权限检查。
4. trace 和日志也要处理敏感数据。

## 3. 知识库更新

知识库更新指文档新增、修改、删除后，同步更新向量库和索引。

企业制度和业务文档经常变化。旧知识会导致错误回答。

要会什么：

1. 文档版本号。
2. `chunk` `ID`。
3. 增量入库。
4. 删除旧 `chunk`。
5. 重建索引。
6. 更新后跑评估集。

常见坑：

1. 新文档入库了，旧版本没删。
2. 文档删除了，向量库里还在。
3. 没有记录 `chunk` 和源文档版本关系。
4. 更新后没有回归测试。

## 4. 引用和溯源

引用和溯源是告诉用户答案来自哪里。

制度、合同、财务、人事等场景不能只给结论，还要能查证。

好引用应该包含：

1. 文档名。
2. 章节。
3. 页码或片段 `ID`。
4. 原文片段。
5. 答案和引用的对应关系。

常见坑：

1. 答案看起来对，但引用对不上。
2. 只给文件名，不给具体位置。
3. 模型编造引用。
4. 引用来源暴露无权限文档。

## 5. 成本和延迟

`Agent` 和 `RAG` 很容易因为多次检索、多次模型调用导致成本和响应时间上升。

需要统计：

- 每次请求 `token`
- 模型调用次数
- 工具调用次数
- 检索耗时
- 模型耗时
- 单次请求成本
- P95 延迟

优化方向：

1. 小任务用便宜模型。
2. 大任务才用强模型。
3. 缓存稳定结果。
4. 控制 `top_k`。
5. 控制上下文长度。
6. 限制 `Agent` 最大步骤。

## 6. 失败兜底

常见失败：

- 检索为空
- 模型超时
- 工具报错
- `JSON` 解析失败
- 权限不足
- 文档解析失败

正确处理：

1. 检索为空：明确说“当前知识库没有找到依据”。
2. 模型超时：提示稍后重试或降级模型。
3. 工具报错：返回可理解错误，不暴露堆栈。
4. 解析失败：重试或走降级解析。
5. 权限不足：明确拒绝，不把内容给模型。

## 7. 可运行 Demo

完成 [示例统一准备](./examples/) 后，先分别运行工程能力示例：

```powershell
python docs/public/langchain-examples/08_enterprise/access_control.py
python docs/public/langchain-examples/08_enterprise/knowledge_updates.py
python docs/public/langchain-examples/08_enterprise/citations.py
python docs/public/langchain-examples/08_enterprise/cost_and_latency.py
python docs/public/langchain-examples/08_enterprise/fallbacks.py
```

再运行联网综合 `RAG`：

~~~powershell
python `docs/public/langchain-examples/08_enterprise_rag.py`
~~~

该脚本先按角色过滤可访问文档，再使用 `OpenAI` `Embeddings` 检索，最后由
`ChatOpenAI` 调用 `ChatGPT` 回答，并保留文档来源标签。

## 8. 本模块自测

1. 为什么权限过滤不能只靠前端？
2. 文档更新时为什么要删除旧 `chunk`？
3. 什么样的引用才算可追溯？
4. `RAG` 成本主要来自哪些地方？
5. 检索不到资料时系统应该怎么回答？
