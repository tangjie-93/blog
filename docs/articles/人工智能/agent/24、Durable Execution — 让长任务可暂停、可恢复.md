---
title: "24、Durable Execution — 让长任务可暂停、可恢复"
date: "2026-10-17"
type: "技术"
tags: "Agent|AI Coding"
note: "用检查点、幂等步骤和人工中断让长时间 Agent 在故障后从正确位置继续。"
---

# 24、`Durable Execution` — 让长任务可暂停、可恢复

把任务写进 `JSON` 文件不等于持久化执行。可靠的长任务需要保存状态、输入、输出和下一步，并能在进程崩溃后恢复，而不是从头重跑。

## 1、检查点

每个步骤完成后保存不可变事件或版本化快照：

```json
{
  "run_id": "run_123",
  "step": "retrieve",
  "status": "completed",
  "input_hash": "...",
  "output_ref": "object://results/123",
  "attempt": 1,
  "updated_at": "2026-10-17T10:00:00Z"
}
```

恢复时只重放未完成步骤。外部副作用必须使用幂等键，例如 `run_id + step + input_hash`，避免网络重试导致重复发邮件、扣款或写入数据。

## 2、暂停与人工接管

暂停应该是显式状态：`waiting_for_input`、`waiting_for_approval` 或 `paused`。恢复请求要携带版本号，防止用户确认旧计划后覆盖新状态。取消也要可传播到模型请求、工具进程和队列。

## 3、何时需要它

短请求可以使用会话内循环；跨分钟、跨进程、需要审批或包含外部副作用的任务才需要 durable execution。`LangGraph` 将 durable execution、interrupt 和 `memory` 作为一组基础能力，适合作为进一步学习的参照。[`LangGraph` durable execution](https://docs.langchain.com/oss/python/langgraph/durable-execution)

## 4、练习

让一个三步任务在第二步中途强制退出进程，重新启动后从检查点继续；重复提交恢复请求，确认每个副作用只执行一次。
