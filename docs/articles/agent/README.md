---
title: Agent 架构基础与设计方法
date: '2026-10-13'
type: 技术
tags: Agent
note: 从模型调用、工具使用到状态管理和评测，理解 Agent 系统如何可靠地完成任务。
---

`Agent` 不是“让模型自由发挥”，而是一个由模型负责决策、由程序负责执行和约束的循环系统。可靠的 `Agent` 必须有明确目标、可控工具和可追踪状态。

## 一、基本执行循环

```text
用户目标 → 任务拆解 → 模型决策 → 调用工具 → 观察结果 → 继续或结束
```

一次循环通常包含：

- `context`：目标、历史消息、约束和当前状态。
- `tool`：模型可以调用的函数，输入输出必须有明确结构。
- `observation`：工具执行结果，包括成功、失败和权限信息。
- `stop condition`：完成、超时、达到步数上限或需要人工确认。

## 二、常见架构

| 架构 | 适用场景 | 主要风险 |
| --- | --- | --- |
| 单 Agent + 工具 | 查询、总结、简单自动化 | 循环失控、工具误用 |
| Planner-Executor | 多步骤任务 | 计划与现实状态脱节 |
| 多 Agent 协作 | 角色分工、并行研究 | 通信成本和责任边界模糊 |
| 工作流 + Agent 节点 | 流程稳定、局部需要推理 | 灵活性与维护成本的平衡 |

优先从“工作流 + 少量 Agent 节点”开始。能用确定性代码表达的步骤，不必交给模型。

## 三、工具设计原则

1. 工具只做一件事，参数使用结构化模式校验。
2. 工具执行前检查权限、范围和用户确认要求。
3. 工具执行后返回可供模型理解的结果，同时记录原始日志。
4. 失败结果要说明原因和下一步，而不是只返回空字符串。
5. 设置超时、重试、预算和最大循环次数。

## 四、状态与评测

把短期消息、任务状态、长期记忆和外部业务数据分开管理。不要把所有内容无限追加到上下文中；应通过摘要、检索和状态快照控制成本。

评测至少覆盖任务成功率、工具调用准确率、事实正确性、延迟、成本和安全拒答。保留一组固定样例做回归测试，任何提示词或工具变更都重新运行。

`Agent` 的工程核心是边界：让模型负责选择，让代码负责约束，让日志负责解释。


## 专题阅读

按“先理解控制流，再补齐生产化能力”的顺序阅读。现有 20 篇保留原路径，新文章从 21 章开始。

### 01 基础与工具

- [01-LLM与Agent基础](./01-LLM%E4%B8%8EAgent%E5%9F%BA%E7%A1%80.md)
- [01、Agent Loop — 一个循环就够了](./01%E3%80%81Agent%20Loop%20%E2%80%94%20%E4%B8%80%E4%B8%AA%E5%BE%AA%E7%8E%AF%E5%B0%B1%E5%A4%9F%E4%BA%86.md)
- [02、Tool Use — 多加一个工具，只加一行](./02%E3%80%81Tool%20Use%20%E2%80%94%20%E5%A4%9A%E5%8A%A0%E4%B8%80%E4%B8%AA%E5%B7%A5%E5%85%B7%EF%BC%8C%E5%8F%AA%E5%8A%A0%E4%B8%80%E8%A1%8C.md)
- [21、Agent Patterns — 不同任务用不同模式](./21%E3%80%81Agent%20Patterns%20%E2%80%94%20%E4%B8%8D%E5%90%8C%E4%BB%BB%E5%8A%A1%E7%94%A8%E4%B8%8D%E5%90%8C%E6%A8%A1%E5%BC%8F.md)

### 02 安全与运行时

- [03、Permission — 执行前做权限判断](./03%E3%80%81Permission%20%E2%80%94%20%E6%89%A7%E8%A1%8C%E5%89%8D%E5%81%9A%E6%9D%83%E9%99%90%E5%88%A4%E6%96%AD.md)
- [04、Hooks — 挂在循环上，不写进循环里](./04%E3%80%81Hooks%20%E2%80%94%20%E6%8C%82%E5%9C%A8%E5%BE%AA%E7%8E%AF%E4%B8%8A%EF%BC%8C%E4%B8%8D%E5%86%99%E8%BF%9B%E5%BE%AA%E7%8E%AF%E9%87%8C.md)
- [10、System Prompt — 运行时组装，不硬编码](./10%E3%80%81System%20Prompt%20%E2%80%94%20%E8%BF%90%E8%A1%8C%E6%97%B6%E7%BB%84%E8%A3%85%EF%BC%8C%E4%B8%8D%E7%A1%AC%E7%BC%96%E7%A0%81.md)
- [23、Agent Security — 从提示注入到沙箱隔离](./23%E3%80%81Agent%20Security%20%E2%80%94%20%E4%BB%8E%E6%8F%90%E7%A4%BA%E6%B3%A8%E5%85%A5%E5%88%B0%E6%B2%99%E7%AE%B1%E9%9A%94%E7%A6%BB.md)

### 03 状态、任务与可靠性

- [05、TodoWrite — 没有计划的 Agent，做着做着就偏了](./05%E3%80%81TodoWrite%20%E2%80%94%20%E6%B2%A1%E6%9C%89%E8%AE%A1%E5%88%92%E7%9A%84%20Agent%EF%BC%8C%E5%81%9A%E7%9D%80%E5%81%9A%E7%9D%80%E5%B0%B1%E5%81%8F%E4%BA%86.md)
- [08、Context Compact — 上下文总会满，要有办法腾地方](./08%E3%80%81Context%20Compact%20%E2%80%94%20%E4%B8%8A%E4%B8%8B%E6%96%87%E6%80%BB%E4%BC%9A%E6%BB%A1%EF%BC%8C%E8%A6%81%E6%9C%89%E5%8A%9E%E6%B3%95%E8%85%BE%E5%9C%B0%E6%96%B9.md)
- [09、Memory — 压缩会丢细节，要有一层不丢的](./09%E3%80%81Memory%20%E2%80%94%20%E5%8E%8B%E7%BC%A9%E4%BC%9A%E4%B8%A2%E7%BB%86%E8%8A%82%EF%BC%8C%E8%A6%81%E6%9C%89%E4%B8%80%E5%B1%82%E4%B8%8D%E4%B8%A2%E7%9A%84.md)
- [11、Error Recovery — 错误不是结束，是重试的开始](./11%E3%80%81Error%20Recovery%20%E2%80%94%20%E9%94%99%E8%AF%AF%E4%B8%8D%E6%98%AF%E7%BB%93%E6%9D%9F%EF%BC%8C%E6%98%AF%E9%87%8D%E8%AF%95%E7%9A%84%E5%BC%80%E5%A7%8B.md)
- [12、Task System — 目标太大，拆成小任务](./12%E3%80%81Task%20System%20%E2%80%94%20%E7%9B%AE%E6%A0%87%E5%A4%AA%E5%A4%A7%EF%BC%8C%E6%8B%86%E6%88%90%E5%B0%8F%E4%BB%BB%E5%8A%A1.md)
- [24、Durable Execution — 让长任务可暂停、可恢复](./24%E3%80%81Durable%20Execution%20%E2%80%94%20%E8%AE%A9%E9%95%BF%E4%BB%BB%E5%8A%A1%E5%8F%AF%E6%9A%82%E5%81%9C%E3%80%81%E5%8F%AF%E6%81%A2%E5%A4%8D.md)
- [25、Cost and Reliability — 让 Agent 跑得稳、算得清](./25%E3%80%81Cost%20and%20Reliability%20%E2%80%94%20%E8%AE%A9%20Agent%20%E8%B7%91%E5%BE%97%E7%A8%B3%E3%80%81%E7%AE%97%E5%BE%97%E6%B8%85.md)

### 04 多 Agent 与外部协作

- [06、Subagent — 大任务拆小，每个拿到的都是干净上下文](./06%E3%80%81Subagent%20%E2%80%94%20%E5%A4%A7%E4%BB%BB%E5%8A%A1%E6%8B%86%E5%B0%8F%EF%BC%8C%E6%AF%8F%E4%B8%AA%E6%8B%BF%E5%88%B0%E7%9A%84%E9%83%BD%E6%98%AF%E5%B9%B2%E5%87%80%E4%B8%8A%E4%B8%8B%E6%96%87.md)
- [15、Agent Teams — 一个搞不定，组队来](./15%E3%80%81Agent%20Teams%20%E2%80%94%20%E4%B8%80%E4%B8%AA%E6%90%9E%E4%B8%8D%E5%AE%9A%EF%BC%8C%E7%BB%84%E9%98%9F%E6%9D%A5.md)
- [16、Team Protocols — 队友之间要有约定](./16%E3%80%81Team%20Protocols%20%E2%80%94%20%E9%98%9F%E5%8F%8B%E4%B9%8B%E9%97%B4%E8%A6%81%E6%9C%89%E7%BA%A6%E5%AE%9A.md)
- [17、Autonomous Agents — 自己看板，自己认领](./17%E3%80%81Autonomous%20Agents%20%E2%80%94%20%E8%87%AA%E5%B7%B1%E7%9C%8B%E6%9D%BF%EF%BC%8C%E8%87%AA%E5%B7%B1%E8%AE%A4%E9%A2%86.md)
- [18、Worktree Isolation — 各干各的，互不干扰](./18%E3%80%81Worktree%20Isolation%20%E2%80%94%20%E5%90%84%E5%B9%B2%E5%90%84%E7%9A%84%EF%BC%8C%E4%BA%92%E4%B8%8D%E5%B9%B2%E6%89%B0.md)
- [19、MCP Tools — 外接工具，标准协议](./19%E3%80%81MCP%20Tools%20%E2%80%94%20%E5%A4%96%E6%8E%A5%E5%B7%A5%E5%85%B7%EF%BC%8C%E6%A0%87%E5%87%86%E5%8D%8F%E8%AE%AE.md)

### 05 评测与产品交互

- [22、Agent Evals — 先把轨迹看懂，再谈效果](./22%E3%80%81Agent%20Evals%20%E2%80%94%20%E5%85%88%E6%8A%8A%E8%BD%A8%E8%BF%B9%E7%9C%8B%E6%87%82%EF%BC%8C%E5%86%8D%E8%B0%88%E6%95%88%E6%9E%9C.md)
- [26、Agent UX — 把流式输出、工具调用和审批讲清楚](./26%E3%80%81Agent%20UX%20%E2%80%94%20%E6%8A%8A%E6%B5%81%E5%BC%8F%E8%BE%93%E5%87%BA%E3%80%81%E5%B7%A5%E5%85%B7%E8%B0%83%E7%94%A8%E5%92%8C%E5%AE%A1%E6%89%B9%E8%AE%B2%E6%B8%85%E6%A5%9A.md)

### 06 调度与综合

- [07、Skill Loading — 用到的时候才加载](./07%E3%80%81Skill%20Loading%20%E2%80%94%20%E7%94%A8%E5%88%B0%E7%9A%84%E6%97%B6%E5%80%99%E6%89%8D%E5%8A%A0%E8%BD%BD.md)
- [13、Background Tasks — 慢操作放后台](./13%E3%80%81Background%20Tasks%20%E2%80%94%20%E6%85%A2%E6%93%8D%E4%BD%9C%E6%94%BE%E5%90%8E%E5%8F%B0.md)
- [14、Cron Scheduler — 按时间表生产工作](./14%E3%80%81Cron%20Scheduler%20%E2%80%94%20%E6%8C%89%E6%97%B6%E9%97%B4%E8%A1%A8%E7%94%9F%E4%BA%A7%E5%B7%A5%E4%BD%9C.md)
- [20、Comprehensive Agent — 全部机制归到一个循环](./20%E3%80%81Comprehensive%20Agent%20%E2%80%94%20%E5%85%A8%E9%83%A8%E6%9C%BA%E5%88%B6%E5%BD%92%E5%88%B0%E4%B8%80%E4%B8%AA%E5%BE%AA%E7%8E%AF.md)

### 导航与总览

- [Agent 架构全景：20 章核心机制回顾](./OpenAI%20Agent%20%E6%9C%BA%E5%88%B6%E7%9F%A5%E8%AF%86%E5%AD%97%E5%85%B8.md)
- [AI Agent Learning Map](./AI%20Agent%20Learning%20Map.md)
- [AI Agent 学习系列](./AI%20Agent%20%E5%AD%A6%E4%B9%A0%E7%B3%BB%E5%88%97.md)
