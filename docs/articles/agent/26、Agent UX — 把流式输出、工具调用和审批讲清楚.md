---
title: "26、Agent UX — 把流式输出、工具调用和审批讲清楚"
date: "2026-10-17"
type: "技术"
tags: "Agent|AI Coding"
note: "用事件协议展示流式文本、工具进度、等待审批和失败恢复，让用户知道 Agent 正在做什么。"
---

# 26、Agent UX — 把流式输出、工具调用和审批讲清楚

Agent 产品的用户体验不是一个聊天框。用户需要知道当前阶段、正在调用什么、是否需要确认、失败后能否继续。

## 事件协议

前后端先约定事件，而不是让前端猜测模型文本：

```text
run.started → message.delta → tool.started → tool.progress
→ tool.completed → approval.required → run.completed | run.failed
```

每个事件至少带 `run_id`、顺序号和时间；客户端按顺序渲染，重复事件可以安全丢弃。SSE 适合单向流，WebSocket 适合需要双向控制的长任务。

## 关键交互

- 工具调用显示名称、目的、参数摘要和进度，不展示秘密。
- 高风险操作先展示计划和影响范围，再让用户确认。
- 用户可以暂停、取消、重试单个步骤或接管任务。
- 错误消息说明原因、是否已产生副作用和下一步选择。
- 刷新页面后通过 `run_id` 恢复任务视图，而不是丢失上下文。

## 前端状态机

把页面状态限制为 `idle`、`running`、`waiting`、`completed`、`failed`、`cancelled`，禁止任意按钮组合产生非法状态。最终答案、工具结果和审批记录分开渲染，便于审计和复制。

## 练习

为一个搜索 Agent 做最小 Chat UI：支持流式文本、工具状态卡片、审批弹窗和停止按钮；断开网络后重新连接，确认不会重复显示事件。
