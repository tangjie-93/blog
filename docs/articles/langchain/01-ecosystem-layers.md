---
title: LangChain 生态分层
date: '2026-08-24'
type: 技术
tags: LangChain
note: 理解 langchain_core、langchain、langgraph、langsmith 与集成包的职责边界。
---

# 01. LangChain 生态分层

## 1. 这一模块解决什么问题

很多人刚接触 LangChain 时，会被一堆名字绕晕：`langchain`、`langchain_core`、`langgraph`、`langsmith`、`langchain_openai`、`langchain_community`、`langchain_text_splitters`。

这些不是同一个层级的东西。理解分层后，再看代码和文档会清楚很多。

## 2. 最核心的一句话

```text
LangChain 生态 = 核心接口 + 应用框架 + 集成包 + 编排框架 + 观测评估平台
```

## 3. 五层结构

| 层级 | 代表 | 大白话解释 |
|---|---|---|
| 核心协议层 | `langchain_core` | 定义统一接口和基础对象 |
| 应用开发层 | `langchain` | 帮你快速搭 RAG、Agent、Prompt 链路 |
| 集成层 | `langchain_openai`、`langchain_community` 等 | 对接模型、向量库、搜索、数据库、第三方工具 |
| 编排层 | `langgraph` | 用图来控制复杂流程、循环、分支、状态 |
| 平台层 | `langsmith` | 追踪、调试、评估、监控 |

## 4. 为什么要拆成这么多包

早期很多能力都放在 `langchain` 主包里。后来生态变大后，继续塞在一个包里会带来几个问题：

1. 依赖太重：只想用 OpenAI，却被迫安装很多不需要的数据库和工具依赖。
2. 升级困难：一个向量库更新，不应该影响整个主框架。
3. 维护边界模糊：官方核心能力、社区集成、第三方服务都混在一起。
4. Agent 变复杂：简单链式调用已经不够，需要状态图和可恢复流程。
5. 生产需要观测：只会调用模型不够，还要看质量、成本、延迟和错误。

## 5. 各层怎么配合

普通企业 RAG：

```text
用户问题
  -> langchain_core 定义消息、Prompt、Runnable
  -> langchain 组织基础链路
  -> langchain_text_splitters 切文档
  -> langchain_openai 生成 embedding 和回答
  -> 向量库集成包负责存取向量
  -> langsmith 记录每一步
```

复杂 Agent：

```text
用户任务
  -> langgraph 控制流程
  -> 每个节点里用 langchain 调模型、调工具、做检索
  -> 所有基础类型来自 langchain_core
  -> 外部能力来自各种集成包
  -> 全流程由 langsmith 追踪和评估
```

## 6. 学习时怎么判断该看哪个包

| 你遇到的问题 | 该看哪里 |
|---|---|
| Prompt、Message、Runnable、Tool 是什么 | `langchain_core` |
| 怎么快速搭一个 RAG 或 Agent | `langchain` |
| 怎么接 OpenAI、Claude、本地模型 | 对应模型集成包 |
| 怎么接向量库 | 对应向量库集成包 |
| 怎么让 Agent 有循环、分支、状态 | `langgraph` |
| 怎么看调用过程和评估质量 | `langsmith` |

## 7. 常见坑

1. 把所有能力都误以为在 `langchain` 里。
2. 复制旧教程代码，发现新版导入路径已经变了。
3. 不理解 `langchain_core`，导致看不懂 `Runnable` 和 Message。
4. 简单 RAG 一开始就上 LangGraph，复杂度过高。
5. 生产环境没接 LangSmith，问题发生后无法定位。

## 8. 可运行 Demo

先完成 [示例统一准备](./examples/)。单概念脚本用于离线观察各层的数据流：

```powershell
python docs/public/langchain-examples/01_ecosystem/ecosystem_layers.py
```

再运行联网综合 Demo：

~~~powershell
python docs/public/langchain-examples/01_chat_basics.py
~~~

该脚本实际调用 OpenAI ChatGPT，并把 Prompt、模型适配器和输出解析器连成最小链路。

## 9. 自测问题

1. `langchain_core` 和 `langchain` 是什么关系？
+ `langchain_core` 是基础接口，`langchain` 是应用开发框架。
+ `langchain` 依赖 `langchain_core`，定义了消息、Prompt、Runnable 等基础类型。
2. 为什么模型集成包要拆出去？
+ 模型集成包负责对接模型，每个模型都有自己的 API。
+ 模型集成包需要维护自己的依赖，不能和主框架混在一起。
+ 模型集成包需要支持不同的模型，不能和主框架绑定。
3. 什么场景必须考虑 LangGraph？
+ 复杂的 Agent 需要状态图和可恢复流程。
+ 需要循环、分支、条件判断。
+ 需要并行执行多个任务。
4. LangSmith 是写业务逻辑的，还是看运行过程的？
+ LangSmith 是看运行过程的，不是写业务逻辑。
5. 一个企业 RAG 至少会涉及哪几层？
+ 核心协议层：`langchain_core`
+ 应用开发层：`langchain`
+ 集成层：`langchain_openai`、`langchain_community` 等
+ 编排层：`langgraph`
+ 平台层：`langsmith`
