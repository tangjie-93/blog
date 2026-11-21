---
title: "25、Cost and Reliability — 让 Agent 跑得稳、算得清"
date: "2026-10-17"
type: "技术"
tags: "Agent|AI Coding"
note: "把 token、延迟、并发、限流和失败预算纳入 Agent 运行时，控制质量与成本的交换。"
---

# 25、`Cost and Reliability` — 让 `Agent` 跑得稳、算得清

`Agent` 的费用不是一次模型调用，而是模型轮次、工具结果、重试、并行分支和人工等待的总和。每次运行都应有预算和终止条件。

## 1、运行预算

为 `run` 设置总 `token`、最大模型轮次、工具调用次数、墙钟时间和金额上限。预算应该在调用前预估，在调用后扣减；任何一个维度耗尽都进入安全终态。

```python
if budget.tokens_left < estimate_tokens(request):
    return ask_user("预算不足，是否压缩上下文或切换模型？")
```

## 2、可靠性策略

- 只对可重试的瞬时错误做指数退避，并设置抖动和上限。
- 429 根据 `Retry-After` 排队，别让并发重试形成惊群。
- 超时要区分模型超时、工具超时和用户取消。
- Fallback 模型必须记录质量差异，不能静默切换。
- 并行任务设置总并发和单租户并发上限。

## 3、优化顺序

先减少无效工具结果和重复上下文，再做缓存、模型路由和并行。不要用更便宜的模型掩盖错误的循环；一次错误重试的成本可能高于一次高质量调用。

## 4、练习

为一次运行记录 `input_tokens`、`output_tokens`、`tool_ms`、`retry_count`、`estimated_cost` 和 `outcome`。按任务类型统计 `p50`/`p95` 延迟和成功率，再决定是否需要模型路由。
