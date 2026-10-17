---
title: "AI Agent Learning Map"
date: "2026-07-06"
type: "技术"
tags: "Agent"
note: "按基础概念、核心机制、工程化、前端结合与项目实践组织学习地图。"
---

# AI Agent Learning Map

## 阶段 1：基础概念

- [x] `LLM` 基本能力与限制
- [ ] `Prompt Engineering`
- [ ] `Tool Calling`
- [ ] `Structured Output`
- [ ] `Function Calling`
- [ ] `Embeddings`
- [ ] `RAG`

## 阶段 2：Agent 核心机制

- [x] `Agent Loop`
- [x] 任务规划与分解
- [x] 工具选择
- [x] 短期记忆与长期记忆
- [ ] 反思与自我修正（见 Agent Patterns 的 Evaluator-Optimizer）
- [x] `Human-in-the-loop`

## 阶段 3：工程化

- [x] 状态管理
- [x] 错误恢复
- [x] 评测与回归测试
- [x] 成本控制
- [x] 日志与可观测性
- [x] 权限与安全边界
- [ ] 持久化执行与跨进程恢复
- [ ] Prompt Injection 与沙箱防护

## 阶段 4：前端结合点

- [x] `Chat UI` 设计
- [x] 多步任务进度展示
- [x] 可解释的工具调用过程
- [x] 人机协作交互
- [ ] 浏览器自动化界面
- [ ] 知识库检索体验

## 阶段 5：项目实践

- [ ] 个人 `AI` 情报助手
- [ ] `Obsidian` 知识库助手
- [ ] 前端代码审查 `Agent`
- [ ] 网页信息采集与摘要 `Agent`
- [ ] 个人每日规划和复盘 `Agent`

对应文章：[Agent Patterns](./21%E3%80%81Agent%20Patterns%20%E2%80%94%20%E4%B8%8D%E5%90%8C%E4%BB%BB%E5%8A%A1%E7%94%A8%E4%B8%8D%E5%90%8C%E6%A8%A1%E5%BC%8F.md)、[Agent Evals](./22%E3%80%81Agent%20Evals%20%E2%80%94%20先把轨迹看懂，再谈效果.md)、[Agent Security](./23%E3%80%81Agent%20Security%20%E2%80%94%20从提示注入到沙箱隔离.md)、[Durable Execution](./24%E3%80%81Durable%20Execution%20—%20让长任务可暂停、可恢复.md)、[Cost and Reliability](./25%E3%80%81Cost%20and%20Reliability%20—%20让%20Agent%20跑得稳、算得清.md)、[Agent UX](./26%E3%80%81Agent%20UX%20—%20把流式输出、工具调用和审批讲清楚.md)
