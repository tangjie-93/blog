---
title: "01. LLM 与 Agent 基础"
date: "2026-07-04"
type: "技术"
tags: "Agent"
note: "理解 Token、上下文、结构化输出、工具调用与 Agent 最小执行循环。"
---

# 01. `LLM` 与 `Agent` 基础

## 1、学习目标

这一阶段要理解 `Agent` 的最小工作机制。你需要能不依赖框架，手写一个基础 `Agent Loop`。

> 原笔记配套的 `code/` 项目和 `02-LLM与Agent基础拆分学习指南.md` 未包含在本次学习资料中；本文保留概念说明与练习任务。

## 1. `Token`

`Token` 是模型处理文本的基本单位，可以理解为“文本切片”。英文里一个单词可能是一个或多个 `token`，中文里一个字或词也可能被拆成不同 `token`。

为什么重要：

- 决定上下文长度
- 决定调用成本
- 决定延迟
- 决定能放入多少历史消息、工具结果和检索资料

学习重点：

- 输入 `token` 与输出 `token` 都计费
- 工具返回内容也会占用上下文
- `RAG` 塞入太多片段会让模型注意力分散
- 长上下文不是无限记忆

练习：

- 对同一段中文、英文、代码分别统计 `token`
- 比较完整文档、摘要、结构化 `JSON` 的 `token` 差异
- 在日志里记录每次请求的输入、输出和总 `token`

## 2. `Context` Window

`Context` window 是模型一次请求能看到的最大上下文。它包括：

- system message
- developer instruction
- user message
- assistant history
- tool schema
- tool result
- `RAG` 检索片段

关键理解：

- 模型只能基于当前上下文生成，不会自动记住数据库里的内容
- 对话历史过长时需要摘要或裁剪
- 工具结果太长会挤占用户真实问题
- 上下文设计比单纯写 prompt 更重要

练习：

- 做一个对话历史裁剪器
- 实现最近 N 轮保留 + 早期对话摘要
- 比较完整历史和摘要历史对回答质量的影响

## 3. Temperature / Top P

Temperature 控制输出随机性。一般来说：

- 事实问答、工具参数生成：低 temperature
- 头脑风暴、文案生成：中高 temperature
- 结构化输出、代码生成：低 temperature

Top P 是 nucleus sampling 参数，通常不要和 temperature 一起大幅调整。

练习：

- 同一 prompt 分别用不同 temperature 运行 10 次
- 观察工具调用参数是否稳定
- 观察 `JSON` 格式是否更容易出错

## 4. Message 角色

常见角色：

- system：定义模型整体行为边界
- developer：定义应用开发者规则
- user：用户输入
- assistant：模型输出
- tool：工具执行结果

设计原则：

- 规则放 system / developer，不要混在用户输入里
- 用户输入永远不应该覆盖系统规则
- 工具结果需要清晰标记来源和含义

## 5. `Structured Output`

Structured output 是让模型按照固定 schema 输出，例如 `JSON`。

为什么重要：

- 前端可以稳定渲染
- 后端可以校验字段
- 工具参数可以自动解析
- eval 更容易做

示例结构：

```json
{
  "answer": "string",
  "citations": [
    {
      "title": "string",
      "url": "string"
    }
  ],
  "confidence": "high | medium | low"
}
```

练习：

- 让模型输出任务拆解 `JSON`
- 用 `Pydantic` 校验输出
- 校验失败时重试一次
- 前端按字段渲染，而不是直接渲染整段文本

## 6. `Tool Calling`

`Tool` calling 是 `Agent` 的核心能力之一。模型不会真的执行工具，它只是生成“想调用哪个工具”和“调用参数是什么”。真正执行工具的是你的程序。

一个工具通常包含：

- name
- description
- input schema
- handler
- permission policy
- timeout
- error handling

工具设计原则：

- 工具名要清晰，例如 `search_customer_orders`
- description 要说明什么时候用、什么时候不用
- 参数 schema 要严格
- 工具返回要短而结构化
- 高风险工具必须加入确认步骤

练习：

- 实现 `get_weather`
- 实现 `search_docs`
- 实现 `create_todo`
- 故意传错参数，观察模型如何恢复
- 给写操作加 confirmation

## 7. `Agent Loop`

最小 `Agent Loop`：

1. 接收用户输入
2. 调用模型
3. 如果模型选择工具，执行工具
4. 把工具结果加入上下文
5. 再次调用模型
6. 重复直到模型输出最终结果

伪代码：

```python
messages = [system_message, user_message]

while True:
    response = call_model(messages, tools=tools)

    if response.has_tool_call:
        result = run_tool(response.tool_call)
        messages.append(response.message)
        messages.append(tool_result_message(result))
        continue

    return response.final_answer
```

学习重点：

- 最大循环次数
- 工具调用超时
- 错误恢复
- 工具结果压缩
- 日志记录
- 用户取消

## 8. Streaming

Streaming 是前端 `Agent` 产品体验的关键。用户不应该等所有任务结束才看到结果。

`Vue` 侧重点：

- 用 `SSE` 接收 `token` 流
- 区分文本流、工具调用事件、进度事件、错误事件
- 渲染“正在调用工具”
- 支持停止生成
- 支持失败后重试

练习：

- 用 `Vue` 实现一个 Chat `UI`
- 支持流式输出
- 工具调用时显示状态
- 工具完成后展示结果卡片

## 9. `Human-in-the-loop`

`Human-in-the-loop` 指 `Agent` 执行到关键步骤时暂停，等待用户确认。

适用场景：

- 发邮件
- 创建订单
- 修改数据库
- 删除文件
- 提交代码
- 调用付费 `API`

实现要点：

- `Agent` 生成操作计划
- 系统展示 preview
- 用户确认或修改
- 系统执行真实操作
- 写入审计日志

## 10. 本阶段学习资源

- `OpenAI` `API` 文档：https://platform.openai.com/docs
- `OpenAI` `Function Calling`：https://platform.openai.com/docs/guides/function-calling
- `OpenAI` Structured Outputs：https://platform.openai.com/docs/guides/structured-outputs
- `OpenAI Agents SDK`：https://openai.github.io/openai-agents-python/
- `Vue` 3 官方文档：https://vuejs.org/
- `Pinia` 官方文档：https://pinia.vuejs.org/
