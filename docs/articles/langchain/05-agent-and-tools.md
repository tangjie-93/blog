---
title: Agent 和工具调用
date: '2026-08-24'
type: 技术
tags: LangChain|Agent
note: 理解 Agent 如何选择工具并在边界内完成任务。
---

# 05. Agent 和工具调用

## 1. 这一模块解决什么问题

Agent 比普通 RAG 多了一层能力：模型不只是回答，还会决定下一步要不要调用工具。

```text
普通 RAG：固定流程
Agent：模型参与决策
```

## 2. Agent 的本质

Agent 是一种应用形态：让模型根据任务目标，选择工具、观察结果、继续行动，直到完成任务。

普通聊天模型像“只会说话的人”。Agent 像“会说话，还能按规则调用工具的人”。

Agent 需要：

1. 清晰任务边界。
2. 可用工具。
3. 最大步骤限制。
4. 失败兜底。
5. 运行过程追踪。

没有这些，Agent 很容易变成不可控的黑盒。

## 3. Tool

Tool 是模型可以调用的外部能力。

例子：

- 搜索知识库
- 查询订单
- 调用审批 API
- 查询数据库
- 发送邮件
- 生成报表

工具设计原则：

| 原则 | 说明 |
|---|---|
| 名称清楚 | 模型要能从名称判断用途 |
| 描述明确 | 说明什么时候该用 |
| 参数简单 | 参数越复杂越容易填错 |
| 返回可读 | 不要直接丢一大坨原始 JSON |
| 有异常处理 | 失败时返回可理解信息 |

好的工具名：

```text
search_policy_docs
get_employee_reimbursement_rule
query_contract_clause
create_support_ticket
```

差的工具名：

```text
run
query
handle
tool1
process
```

## 4. 工具描述

模型主要靠工具名、描述、参数 schema 判断是否调用工具。

描述写不好，模型就会：

- 不该调用时乱调用。
- 该调用时不调用。
- 调错工具。
- 参数填错。

工具描述应该写清：

1. 工具能做什么。
2. 什么情况下应该使用。
3. 什么情况下不要使用。
4. 输入参数含义。
5. 返回结果含义。

## 5. Agent 循环

常见循环：

```text
接收任务
  -> 模型判断下一步
  -> 调用工具
  -> 观察工具结果
  -> 再判断
  -> 直到完成或失败
```

Agent 可能因为工具结果不清楚或目标不明确，反复调用同一个工具。

必须设置：

- 最大步骤数
- 最大工具调用次数
- 超时时间
- 失败返回策略

## 6. Agentic RAG

Agentic RAG 是让模型参与 RAG 决策。

普通 RAG：

```text
问题 -> 检索 -> 回答
```

Agentic RAG：

```text
问题
  -> 判断是否需要检索
  -> 改写查询
  -> 检索
  -> 判断资料是否足够
  -> 不够则继续检索
  -> 生成答案
  -> 自检
```

适合：

- 用户问题很复杂。
- 一次检索经常不够。
- 需要多数据源。
- 需要工具调用。
- 需要答案自检。

不适合：

- 简单 FAQ。
- 固定制度问答。
- 成本和延迟要求很严格。
- 检索策略已经足够稳定。

## 7. 常见坑

1. 以为加了 Agent 就会自动变聪明。
2. 工具太多，模型选择混乱。
3. 工具描述重叠。
4. 没有最大迭代次数。
5. 工具异常没有兜底。
6. 没有记录中间步骤。
7. Agent 多做了很多步骤，但答案没有变好。

## 8. 可运行 Demo

完成 [示例统一准备](./examples/) 后，先运行离线单概念脚本：

```powershell
python docs/public/langchain-examples/05_agents/tool_definition.py
python docs/public/langchain-examples/05_agents/tool_schema.py
python docs/public/langchain-examples/05_agents/agent_loop.py
python docs/public/langchain-examples/05_agents/agentic_rag.py
```

再观察真实模型的工具选择：

~~~powershell
python docs/public/langchain-examples/05_agent_tools.py
~~~

该脚本以 `create_agent` 创建 Agent，由 OpenAI ChatGPT 自主选择
`search_policy`，读取工具结果后生成最终回答。

## 9. 本模块自测

1. 普通 RAG 和 Agentic RAG 有什么区别？
    + 普通 RAG 只是根据检索结果回答。
    + Agentic RAG 模型会根据任务目标，选择工具、观察结果、继续行动，直到完成任务。
    + 普通 RAG：
    ```text
    问题 -> 检索 -> 回答
    ```
    + Agentic RAG：

    ```text
    问题
      -> 判断是否需要检索
      -> 改写查询
      -> 检索
      -> 判断资料是否足够
      -> 不够则继续检索
      -> 生成答案
      -> 自检
```
2. Tool 的名称和描述为什么重要？
    + 用于模型判断是否调用工具。
    + 好的工具描述可以避免模型调用错误工具。
3. 为什么 Agent 必须限制最大步骤？
    + 防止无限循环。
    + 限制工具调用次数。
4. 工具失败时应该返回什么？
    + 可以是错误信息、默认值、空字符串等。
    + 不能让模型继续调用同一个工具，否则会进入死循环。
5. 什么场景不适合使用 Agent？
    + 简单 FAQ。
    + 固定制度问答。
    + 成本和延迟要求很严格。
    + 检索策略已经足够稳定。
