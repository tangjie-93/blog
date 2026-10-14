---
title: 学习和实践路径
date: '2026-08-24'
type: 技术
tags: LangChain|RAG
note: 从普通 RAG 到 Agent 和工程化上线的学习路线。
---

# 09. 学习和实践路径

## 1. 这一模块解决什么问题

这份路线帮助你从“知道名词”走到“能做一个企业 RAG 原型，并知道怎么演进到 Agent”。

### 配套可运行 Demo

完成 [示例统一准备](./examples/) 后，按下面顺序运行。所有生成步骤都通过
ChatOpenAI 调用 OpenAI ChatGPT：

~~~powershell
python docs/public/langchain-examples/01_chat_basics.py
python docs/public/langchain-examples/02_core_chain.py
python docs/public/langchain-examples/03_model_calling.py
python docs/public/langchain-examples/04_rag_pipeline.py
python docs/public/langchain-examples/05_agent_tools.py
python docs/public/langchain-examples/06_langgraph.py
python docs/public/langchain-examples/08_enterprise_rag.py
~~~

最后配置 LangSmith 环境变量，再运行 07_langsmith.py 验证 trace 是否出现。

## 2. 阶段一：先跑通普通 RAG

目标：

```text
问题 -> 检索 -> 回答 -> 引用
```

要做什么：

1. 准备 3 到 5 篇测试文档。
2. 用 Loader 加载文档。
3. 用 Text Splitter 切分文档。
4. 用 Embedding 模型生成向量。
5. 存入向量库。
6. 写 Retriever。
7. 写 Prompt。
8. 调用 Chat Model 生成答案。
9. 输出引用来源。

验收标准：

1. 能打印检索结果。
2. 能回答文档中明确存在的问题。
3. 答案带来源。
4. 至少准备 5 个测试问题。

## 3. 阶段二：理解 `langchain_core`

目标：看懂 LangChain 生态里最常见的基础对象。

要学什么：

1. Message。
2. PromptTemplate。
3. ChatPromptTemplate。
4. Runnable。
5. Tool。
6. OutputParser。

验收标准：

1. 能解释 `prompt | llm` 是什么。
2. 能写一个 ChatPromptTemplate。
3. 能把一个函数包装成 Tool。
4. 能说清 `.invoke()` 和 `.stream()` 的区别。

## 4. 阶段三：工具调用和简单 Agent

目标：让模型可以调用一个或多个工具。

要做什么：

1. 写一个知识库搜索工具。
2. 写一个业务查询工具。
3. 给工具写清楚描述。
4. 让模型根据问题选择工具。
5. 记录工具调用过程。

验收标准：

1. 模型能在需要时调用工具。
2. 工具参数正确。
3. 工具失败时有兜底。
4. 能看到中间调用步骤。

## 5. 阶段四：引入 LangGraph

目标：把复杂 Agent 流程变成可控的图。

要做什么：

1. 定义 State。
2. 拆分 Node。
3. 连接 Edge。
4. 增加 Conditional Edge。
5. 设置结束条件。
6. 必要时增加 Checkpointer。
7. 必要时增加人工审批。

验收标准：

1. 每个节点职责单一。
2. 流程图能解释给别人听。
3. 循环有最大次数。
4. 中断后能恢复。

## 6. 阶段五：接入 LangSmith

目标：让应用可观测、可评估、可复盘。

要做什么：

1. 开启 trace。
2. 建立测试 dataset。
3. 设计 evaluation 指标。
4. 收集用户 feedback。
5. 监控成本和延迟。

验收标准：

1. 能查看一次请求完整调用链。
2. 能看到检索结果和 Prompt。
3. 能跑一批测试集。
4. 能比较两版 Prompt 效果。

## 7. 最小学习计划

### 7.1 第 1 天

学 RAG 主链路，跑通文档加载、切分、入库。

交付：

- 能打印 Document。
- 能看到 chunk。
- 能查向量库。

### 7.2 第 2 天

学 Prompt、Runnable、模型调用。

交付：

- 能写 `prompt | llm`。
- 能基于检索结果生成答案。

### 7.3 第 3 天

学 Tool 和简单 Agent。

交付：

- 能写一个检索工具。
- 模型能调用工具回答问题。

### 7.4 第 4 天

学 LangGraph。

交付：

- 能把 RAG 拆成 3 到 5 个节点。
- 能加一个条件分支。

### 7.5 第 5 天

学 LangSmith。

交付：

- 能看到 trace。
- 能建立最小测试集。
- 能分析一次错误回答。

## 8. 本模块自测

1. 最小 RAG Demo 必须包含哪些步骤？
2. 为什么要先普通 RAG，再 Agentic RAG？
3. 什么情况下引入 LangGraph？
4. LangSmith 应该在什么时候接入？
5. 从 Demo 到生产还缺哪些能力？
