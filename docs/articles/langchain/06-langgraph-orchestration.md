---
title: LangGraph 编排
date: '2026-08-24'
type: 技术
tags: LangChain|LangGraph
note: 用 State、Node、Edge 和 Checkpointer 编排复杂流程。
---

# 06. `LangGraph` 编排

## 1. 这一模块解决什么问题

`LangGraph` 用来控制复杂 `Agent` 流程。

它适合处理：

- 多步骤任务
- 条件分支
- 循环
- 状态持久化
- 人工审批
- 多 `Agent` 协作

## 2. 核心思想

```text
把复杂任务拆成多个节点。
每个节点做一件事。
节点之间用边连接。
所有节点共享一个状态。
```

## 3. `State`

`State` 是整个图的共享数据包。

大白话：

```text
State 就是这次任务的工作单。
```

`State` 里常放：

- 用户问题
- 对话历史
- 检索 `query`
- 检索结果
- 工具调用结果
- 中间判断结果
- 最终答案
- 错误信息

常见坑：

1. `State` 变成大杂烩。
2. 字段命名不清楚。
3. 节点之间隐式依赖太多。
4. 敏感信息没有控制。

## 4. `Node`

`Node` 是图里的一个处理步骤。

例子：

- `rewrite_query`
- `retrieve_docs`
- `grade_documents`
- `generate_answer`
- `human_review`

好 `Node` 的标准：

1. 一个 `Node` 做一件事。
2. 输入来自 `State`。
3. 输出更新 `State`。
4. 可以单独测试。
5. 出错时能暴露清楚原因。

## 5. `Edge`

`Edge` 决定节点之间怎么走。

```text
retrieve_docs -> generate_answer
```

Conditional `Edge` 根据状态决定下一步。

例子：

```text
检索结果足够 -> 生成答案
检索结果不足 -> 改写问题再检索
问题高风险 -> 人工审批
```

常见坑：

1. 没有明确 END 条件。
2. 分支条件太依赖模型自由输出。
3. 多个分支优先级不清楚。
4. 循环没有最大次数。

## 6. Checkpointer

Checkpointer 用来保存执行状态。

这些场景需要状态恢复：

- 多轮对话
- 长任务
- 人工审批
- 工具调用中断
- 服务重启后继续任务

常见坑：

1. 没有会话隔离。
2. 用户之间状态串了。
3. 保存敏感信息没有脱敏。
4. `State` 结构升级后旧数据不兼容。

## 7. `Human-in-the-loop`

`Human-in-the-loop` 是流程中途暂停，等人确认、审批或修改后再继续。

适合场景：

- 合同风险确认
- 财务审批
- 人事制度解释
- 高风险操作
- 对外发送邮件
- 修改生产数据

设计要点：

1. 展示模型判断依据。
2. 展示引用来源。
3. 允许人工修改。
4. 审批结果写回 `State`。
5. 通过和拒绝走不同分支。

## 8. 一个企业 `RAG` Graph 示例

```text
START
  -> classify_question
  -> rewrite_query
  -> retrieve_docs
  -> grade_docs
  -> enough_docs?
      -> yes: generate_answer
      -> no: rewrite_query
  -> check_answer
  -> high_risk?
      -> yes: human_review
      -> no: END
  -> END
```

## 9. 可运行 Demo

完成 [示例统一准备](./examples/) 后，分别运行以下离线图：

```powershell
python docs/public/langchain-examples/06_langgraph/state_node_edge.py
python docs/public/langchain-examples/06_langgraph/conditional_edges.py
python docs/public/langchain-examples/06_langgraph/bounded_loop.py
python docs/public/langchain-examples/06_langgraph/checkpointer.py
python docs/public/langchain-examples/06_langgraph/human_in_the_loop.py
python docs/public/langchain-examples/06_langgraph/enterprise_rag_graph.py
```

联网模型节点综合 Demo：

```powershell
python docs/public/langchain-examples/06_langgraph.py
```

该脚本定义 `State`、模型 `Node` 和 `START -> Node -> END` 边，并在 `Node` 内由
`ChatOpenAI` 调用 `OpenAI` `ChatGPT`。

## 10. 本模块自测

1. `State`、`Node`、`Edge` 分别是什么？
  + `State` 是图的共享数据包。
  + `Node` 是图里的一个处理步骤。
  + `Edge` 决定节点之间怎么走。
2. Conditional `Edge` 解决什么问题？
  + 根据状态决定下一步。
  + 可以处理分支、循环、条件判断。
  + 人工审批、工具调用中断等场景。
3. 什么场景需要 Checkpointer？
  + 多轮对话
  + 长任务
  + 人工审批
  + 工具调用中断
  + 服务重启后继续任务
4. `Human-in-the-loop` 适合哪些场景？
  + 合同风险确认
  + 财务审批
  + 人事制度解释
  + 高风险操作
  + 对外发送邮件
  + 修改生产数据
5. 为什么 `LangGraph` 比普通链更适合复杂 `Agent`？
  + `LangGraph` 可以处理多步骤任务、条件分支、循环、状态持久化、人工审批等场景。
  + 普通链只能处理线性流程，不能处理复杂场景。


