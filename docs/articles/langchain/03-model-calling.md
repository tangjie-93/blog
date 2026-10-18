---
title: 模型调用
date: '2026-08-24'
type: 技术
tags: LangChain|LLM
note: 统一理解 Chat Model、Embedding、流式与批量调用。
---

# 03. 模型调用

## 1. 这一模块解决什么问题

模型调用是 `LLM` 应用的发动机。`LangChain` 生态通过模型集成包把不同厂商的模型接到统一接口里。

常见包：

- `langchain_openai`
- `langchain_anthropic`
- `langchain_ollama`
- 其他模型厂商集成包

## 2. Chat `Model`

Chat `Model` 是聊天模型封装：

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o-mini")
```

它负责把消息发给模型，并返回模型生成的消息。

```text
messages -> chat model -> AIMessage
```

要会什么：

1. 选择模型。
2. 设置温度。
3. 设置最大输出长度。
4. 设置超时和重试。
5. 使用流式输出。
6. 理解模型返回的消息结构。

## 3. `Embedding` `Model`

`Embedding` 模型把文本变成向量。

```text
"报销流程是什么" -> [0.12, -0.03, 0.88, ...]
```

`RAG` 的检索依赖向量相似度。`Embedding` 质量不好，检索结果就不准。

要会什么：

1. 文档入库时要生成 embedding。
2. 用户查询时也要生成 embedding。
3. 入库和查询最好使用同一个 embedding 模型。
4. 换 embedding 模型后通常需要重建索引。
5. 向量维度要和向量库配置一致。

## 4. 模型参数

| 参数 | 作用 | 常见建议 |
|---|---|---|
| `temperature` | 控制发散程度 | 企业问答通常低一些 |
| `max_tokens` | 控制最大输出长度 | 防止答案过长和成本失控 |
| timeout | 控制最长等待时间 | 生产必须设置 |
| retry | 临时失败后重试 | 不要无限重试 |
| streaming | 流式输出 | 适合聊天和长答案 |

## 5. 模型选择策略

不要所有任务都用最强模型：

| 任务 | 模型建议 |
|---|---|
| 查询改写 | 便宜、快的模型 |
| 分类判断 | 便宜、稳定的模型 |
| 最终回答 | 质量较高的模型 |
| 合同风险分析 | 更强模型 |
| 批处理摘要 | 看成本选择 |

上线系统要记录模型名称、版本、参数、`Prompt` 版本、调用时间、`token` 数和成本。

## 6. 常见坑

1. 开发环境和生产环境模型参数不一致。
2. temperature 太高导致企业问答不稳定。
3. 没有限制输出长度。
4. 没有处理限流、超时、网络错误。
5. 只关注生成模型，不关注 embedding 模型。

## 7. 可运行 Demo

完成 [示例统一准备](./examples/) 后，可以按概念分别运行：

```powershell
python docs/public/langchain-examples/03_models/chat_model.py
python docs/public/langchain-examples/03_models/stream_and_batch.py
python docs/public/langchain-examples/03_models/embeddings.py
python docs/public/langchain-examples/03_models/model_selection.py
```

章节综合 Demo：

~~~powershell
python docs/public/langchain-examples/03_model_calling.py
~~~

该脚本通过 `ChatOpenAI` 调用 `OpenAI` `ChatGPT`，并依次演示 `.invoke()`、`.stream()`、
`.batch()` 和 `OpenAIEmbeddings.embed_query()`。

## 8. 本模块自测

1. Chat `Model` 和 `Embedding` `Model` 有什么区别？
    + Chat `Model` 是聊天模型封装，`Embedding` `Model` 是文本向量模型封装。
2. 为什么 `RAG` 入库和查询最好使用同一个 embedding 模型？
    + 不同的 embedding 模型会生成不同的向量，导致检索结果不准确。
3. temperature 对回答有什么影响？
    + temperature 控制发散程度，低一些回答更确定，高一些回答更开放。
4. streaming 适合什么场景？
    + streaming 适合聊天和长答案。
5. 为什么要记录模型版本和参数？
    + 记录模型版本和参数可以方便调试和回滚。
