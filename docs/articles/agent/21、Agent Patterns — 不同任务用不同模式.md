---
title: "21、Agent Patterns — 不同任务用不同模式"
date: "2026-10-17"
type: "技术"
tags: "Agent|AI Coding"
note: "用路由、串行、并行、反思和评审器模式组织 Agent，避免把所有任务都塞进一个循环。"
---

# 21、Agent Patterns — 不同任务用不同模式

Agent 架构首先是控制流问题。模型可以负责局部判断，但任务的整体结构应该由程序明确表达。常见模式如下：

| 模式 | 结构 | 适合 | 主要风险 |
| --- | --- | --- | --- |
| Router | 先分类，再交给专门 Agent | 意图差异明显的请求 | 分类错误 |
| Sequential | A 的输出交给 B | 固定步骤的分析、生成、校验 | 中间结果污染后续步骤 |
| Parallel | 多个分支同时执行，再汇总 | 独立检索、投票、对比 | 成本和结果合并 |
| Evaluator-Optimizer | 生成器与评审器循环 | 文案、代码、答案改进 | 评审标准不稳定 |
| Hierarchical | 管理 Agent 拆解并分派子任务 | 大型研究或执行任务 | 层级过深、责任不清 |

## 选择顺序

先问三个问题：步骤是否固定、分支是否独立、结果是否需要反复评审。固定步骤用工作流；独立分支才并行；质量标准能被写成检查表时再加入评审器。

```python
def run_request(request):
    route = classify(request)
    if route == "lookup":
        return lookup_workflow(request)
    if route == "write":
        draft = writer(request)
        return editor(draft)
    return human_review(request)
```

## 可靠性边界

- 每个节点只接受结构化输入，并校验输出。
- 每个分支都有超时、预算和取消信号。
- 汇总节点保留来源，不能把多个不确定结果拼成确定事实。
- 反思不是“再问模型一次”，而是明确检查项、失败条件和最大轮次。

LangGraph 将 Agent 建模为可持久化的状态图，Google ADK 也把 LLM Agent 与工作流 Agent 分开；这两种实践都说明“模型节点”和“确定性流程”应该分层。[LangGraph](https://github.com/langchain-ai/langgraph) · [Google ADK](https://github.com/google/adk-docs)

## 练习

为同一个“研究一家公司并给出结论”的需求分别实现 Router、Parallel 和 Evaluator-Optimizer，记录成功率、耗时、token 和错误类型，再比较哪种模式最适合真实约束。
