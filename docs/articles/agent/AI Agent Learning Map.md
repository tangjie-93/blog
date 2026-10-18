---
title: "AI Agent Learning Map"
date: "2026-07-06"
type: "技术"
tags: "Agent"
note: "按基础概念、核心机制、工程化、前端结合与项目实践组织学习地图。"
---

# `AI Agent` Learning Map

## 1、阶段 1：基础概念

- [x] `LLM` 基本能力与限制
- [x] `Prompt Engineering`（见 [`LLM` 与 `Agent` 基础](./01-LLM%E4%B8%8EAgent%E5%9F%BA%E7%A1%80.md)）
- [x] `Tool Calling` / `Function Calling`（见 [`Tool` Use](./02%E3%80%81Tool%20Use%20%E2%80%94%20%E5%A4%9A%E5%8A%A0%E4%B8%80%E4%B8%AA%E5%B7%A5%E5%85%B7%EF%BC%8C%E5%8F%AA%E5%8A%A0%E4%B8%80%E8%A1%8C.md)）
- [x] `Structured Output`（见 [`LLM` 与 `Agent` 基础](./01-LLM%E4%B8%8EAgent%E5%9F%BA%E7%A1%80.md)）
- [x] `Embeddings` / `RAG`（见 [`AI` 知识图谱](/articles/ai/)）

## 2、阶段 2：`Agent` 核心机制

- [x] `Agent Loop`
- [x] 任务规划与分解
- [x] 工具选择
- [x] 短期记忆与长期记忆
- [ ] 反思与自我修正（见 `Agent` Patterns 的 `Evaluator-Optimizer`）
- [x] `Human-in-the-loop`

## 3、阶段 3：工程化

- [x] 状态管理
- [x] 错误恢复
- [x] 评测与回归测试
- [x] 成本控制
- [x] 日志与可观测性
- [x] 权限与安全边界
- [x] 持久化执行与跨进程恢复（见 [`Durable Execution`](./24%E3%80%81Durable%20Execution%20%E2%80%94%20%E8%AE%A9%E9%95%BF%E4%BB%BB%E5%8A%A1%E5%8F%AF%E6%9A%82%E5%81%9C%E3%80%81%E5%8F%AF%E6%81%A2%E5%A4%8D.md)）
- [x] `Prompt Injection` 与沙箱防护（见 [`Agent` Security](./23%E3%80%81Agent%20Security%20%E2%80%94%20%E4%BB%8E%E6%8F%90%E7%A4%BA%E6%B3%A8%E5%85%A5%E5%88%B0%E6%B2%99%E7%AE%B1%E9%9A%94%E7%A6%BB.md)）

## 4、阶段 4：前端结合点

- [x] `Chat UI` 设计
- [x] 多步任务进度展示
- [x] 可解释的工具调用过程
- [x] 人机协作交互
- [ ] 浏览器自动化界面
- [ ] 知识库检索体验

## 5、阶段 5：项目实践

- [ ] 个人 `AI` 情报助手
- [ ] `Obsidian` 知识库助手
- [ ] 前端代码审查 `Agent`
- [ ] 网页信息采集与摘要 `Agent`
- [ ] 个人每日规划和复盘 `Agent`

## 6、扩展生态

`Skill`、Rule、Plugin 和 `MCP` 的边界、生命周期与学习入口见：[`Agent` 扩展生态知识图谱](../ai/12-Agent%E6%89%A9%E5%B1%95%E7%94%9F%E6%80%81%E7%9F%A5%E8%AF%86%E5%9B%BE%E8%B0%B1.md)。

对应文章：[`Agent` Patterns](./21%E3%80%81Agent%20Patterns%20%E2%80%94%20%E4%B8%8D%E5%90%8C%E4%BB%BB%E5%8A%A1%E7%94%A8%E4%B8%8D%E5%90%8C%E6%A8%A1%E5%BC%8F.md)、[`Agent` Evals](./22%E3%80%81Agent%20Evals%20%E2%80%94%20先把轨迹看懂，再谈效果.md)、[`Agent` Security](./23%E3%80%81Agent%20Security%20%E2%80%94%20从提示注入到沙箱隔离.md)、[`Durable Execution`](./24%E3%80%81Durable%20Execution%20—%20让长任务可暂停、可恢复.md)、[Cost and Reliability](./25%E3%80%81Cost%20and%20Reliability%20—%20让%20Agent%20跑得稳、算得清.md)、[`Agent` UX](./26%E3%80%81Agent%20UX%20—%20把流式输出、工具调用和审批讲清楚.md)
