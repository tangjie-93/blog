---
title: "22、Agent Evals — 先把轨迹看懂，再谈效果"
date: "2026-10-17"
type: "技术"
tags: "Agent|AI Coding"
note: "用任务集、轨迹断言和线上指标评估 Agent，避免只凭最终答案判断系统质量。"
---

# 22、Agent Evals — 先把轨迹看懂，再谈效果

Agent 的最终文本不是全部结果。一次运行还包括模型选择、工具参数、权限判断、重试、延迟和成本。评测应同时看最终结果和执行轨迹。

## 四层评测

1. **工具层**：工具名是否正确，参数是否符合 schema，是否越权。
2. **轨迹层**：步骤顺序、停止条件、重试次数和状态转移是否符合预期。
3. **任务层**：答案是否完成目标，引用是否真实，是否遗漏关键约束。
4. **系统层**：成功率、p95 延迟、token、费用、错误率和人工接管率。

## 最小回归集

每个任务至少保存：输入、必要上下文、允许工具、期望终态、不可接受行为和评分方式。工具结果可以固定为 fixture，避免测试被外部服务波动影响；每周再用少量真实样本做线上校准。

```python
def assert_trace(trace):
    assert trace[0].event == "task.started"
    assert all(event.duration_ms < 30_000 for event in trace)
    assert sum(event.name == "tool.call" for event in trace) <= 8
    assert trace[-1].event in {"task.completed", "task.failed", "human.required"}
```

## 评分不要只用一个总分

把“任务成功”和“过程安全”分开。一个答案很漂亮但调用了不该调用的工具，仍然应该判失败。对开放式答案使用规则、引用检查和模型评审组合，并保留人工抽样，防止评审器与被测 Agent 使用同一套错误偏好。

## 线上观测

每次运行生成 `run_id`，把模型、提示版本、工具版本、输入输出摘要、耗时、token、错误和人工操作关联起来。敏感内容脱敏后再进入日志。出现回归时，先定位是哪一个节点变差，再修改提示或代码。

## 练习

为已有的工具 Agent 写 20 条固定任务：10 条正常路径、5 条错误输入、5 条越权请求。每次改动运行同一组测试，并把失败轨迹保存下来。Anthropic 的 Claude Cookbooks 和 LangSmith 的 Agent 资料都把“轨迹可见”作为调试基础。[Claude Cookbooks](https://github.com/anthropics/claude-cookbooks)
