---
title: "Jev 与 System One：让模型只做可执行判断"
date: "2026-10-18"
type: "技术"
tags: "Agent|Jev|AI"
note: "理解 TypeSafe Jev 的决策模型、三类问题原语、Agent 集成方式和可靠性边界。"
---

# `Jev` 与 `System One`：让模型只做可执行判断

最近受到关注的 `Jev` 不是一个聊天模型，而是 TypeSafe 提出的第一款 `System One` 模型。它接收一份状态（`state`）和开发者定义的问题，返回代码可以直接消费的结构化判断。

官方文档：[Introduction](https://docs.typesafe.ai/introduction)、[System One](https://docs.typesafe.ai/concepts/system-one)。本文按公开文档整理，版本和价格应以官方页面为准。

## 一、它解决了什么问题

传统 `LLM` 擅长生成文本。让它做“这个工单交给谁”“是否需要人工复核”时，通常要让模型输出一段 `JSON`，再解析和校验这段文本。`Jev` 把问题的答案空间提前交给开发者，直接返回限定类型的结果：

```text
应用状态 + typed questions → typed answers → 代码分支
```

因此，`Jev` 不负责写回复、写代码或解释推理过程。它负责在一个有限且明确的答案空间中做判断；业务规则、权限检查和最终动作仍由程序控制。

## 二、核心契约：一个状态，多个原子问题

一次请求包含：

- `state`：待判断的文本、对象或数组。
- `questions`：每个问题都有唯一名称、问题类型和判断标准。
- 返回值：与问题名称对应的结构化答案；部分类型还包含 `confidence` 和概率分布。

官方目前介绍三种基础原语：

| 原语 | 用来问什么 | 典型返回 |
| --- | --- | --- |
| `Choice` | 从固定选项中选一个 | `choice`、`probabilities`、`confidence` |
| `Score` | 在一个量表上评分 | `score`、`probabilities`、`confidence` |
| `Noul` | 一个陈述是否成立 | `noul`（0 到 1） |

问题应尽量原子化。例如不要直接问“这个客户值不值得挽留”，而是拆成“是否表达了解约意图”“问题是否由产品缺陷引起”“是否符合挽留政策”，再由代码组合结果。这样权重、阈值和升级策略都留在应用侧。

## 三、最小请求示例

下面的请求展示了同一条工单上的路由、情绪评分和紧急性判断。`API` 密钥只应放在服务端环境变量中。

```bash
curl --fail-with-body --silent --show-error \
  https://api.typesafe.ai/v1/systemone \
  -H "Authorization: Bearer $TYPESAFE_API_KEY" \
  -H "Content-Type: application/json" \
  --data-binary @- <<'JSON'
{
  "model": "jev-latest",
  "state": "接口持续返回 500，所有订单都无法处理。",
  "questions": {
    "team": {
      "type": "choice",
      "instructions": "应该由哪个团队处理？",
      "criteria": {
        "technical": "故障、接口或集成问题",
        "billing": "付款、账单或订阅问题"
      }
    },
    "urgent": {
      "type": "noul",
      "instructions": "这条消息是否表达了需要立即处理的紧急事项？"
    }
  }
}
JSON
```

请求端点、字段和 `SDK` 以[官方 Quick start](https://docs.typesafe.ai/introduction/quickstart)为准。示意性的业务分支可以很简单：

```text
if urgent.noul >= 0.9:
    进入人工值班队列
else if team.choice == "technical":
    创建技术工单
else:
    进入账单队列
```

## 四、放进 `Agent` 或 `RAG` 的位置

`Jev` 适合做 `Agent` 循环中的小型判断节点：

1. 先由代码收集用户消息、历史记录和业务约束，组成 `state`。
2. 用 `Choice` 做意图路由，用 `Noul` 判断是否需要检索、审批或人工介入，用 `Score` 评估风险或优先级。
3. 代码根据结果选择工具、检索范围或下一个模型。
4. 低置信度、冲突结果和高风险动作进入人工复核或更强的推理模型。

这形成一种“模型判断，代码执行”的分工。它可以减少把所有简单分流都交给大模型的成本和延迟，也让 `Agent` 的边界更容易测试。

## 五、适用与不适用

适合：工单分类、意图路由、候选排序、风险分级、内容审核、是否升级人工、是否调用某个工具。

不适合：开放式写作、长篇解释、复杂规划、需要生成代码的任务、没有预先定义答案空间的问题。`Jev` 返回了结构化结果，并不代表单次判断一定正确；置信度也不是事实证明。

## 六、上线前的检查清单

- 用真实且脱敏的样本定义每个选项和量表边界。
- 分别记录准确率、混淆情况、延迟、成本和人工升级率。
- 用固定验证集检查概率是否校准，阈值不要只凭直觉设定。
- 为超时、限流、空结果和低置信度准备回退路径。
- 高风险动作仍由权限系统和确定性业务规则拦截。
- 记录模型版本；`jev-latest` 变化时重新跑回归样本。

`Jev` 的价值不在于替代通用 `LLM`，而在于把“语义判断”变成软件可以直接使用的一个受约束节点。真正可靠的系统仍需要清晰的问题定义、代码侧的组合逻辑和可观测的回退机制。
