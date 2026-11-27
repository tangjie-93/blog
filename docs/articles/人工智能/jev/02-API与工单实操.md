---
title: "02 Jev API 与工单实操：一道选择题如何变成一个队列"
date: "2026-11-27"
updated: "2026-11-27"
type: 技术
tags: Jev|API|Agent
note: 按官方 HTTP 契约写一组 Choice、Score、Noul 请求，再用离线测试验证低分、缺字段和人工回退。
---

# 02 Jev API 与工单实操：一道选择题如何变成一个队列

[返回专题](./) · [上一篇：白话 Jev](./01-白话Jev.md) · [下一篇：Agent 与 RAG 分流](./03-Agent与RAG分流.md)

## 问：请求里要放什么？

只解决一件事：把「付款成功了，但订单一直没生成」送到合适的处理队列。[官方 Quick start](https://docs.typesafe.ai/introduction/quickstart) 使用 `POST https://api.typesafe.ai/v1/systemone`；`state` 提供材料，`questions` 的键由你命名，每道题都对同一份 `state` 独立作答，不会读到同批其他题的答案。`model` 用官方示例的 `jev-latest`，它指向稳定版本但会变化；回归对比保留响应中的具体 `model`，需要固定时查[模型版本文档](https://docs.typesafe.ai/models)。

有密钥时可以在 Bash 中运行下面的示例。先在本机设置 `TYPESAFE_API_KEY`，不要贴进文章、提交到 Git 或放在网页前端。以下只发送虚构工单，调用可能计费；不想联网时直接跳到文末的本地练习。

```bash
curl --fail-with-body --silent --show-error --max-time 20 \
  https://api.typesafe.ai/v1/systemone \
  -H "Authorization: Bearer ${TYPESAFE_API_KEY:?请先设置密钥}" \
  -H 'Content-Type: application/json' \
  --data-binary @- <<'JSON'
{
  "model": "jev-latest",
  "state": {"message": "付款成功了，但订单一直没生成。"},
  "questions": {
    "team": {
      "type": "choice",
      "instructions": "根据消息中主要诉求，为工单选择接手队列。",
      "criteria": {
        "orders": "订单未生成、订单状态或订单履约；付款后订单没生成也归这里",
        "billing": "扣款金额、重复扣款、发票或退款本身的问题",
        "other": "非订单或账单问题，或者信息不足以区分"
      }
    },
    "impact": {
      "type": "score",
      "instructions": "只按明确描述的业务影响评分，不因语气激烈而上调。",
      "criteria": [
        "一般咨询，没有交易受阻的描述",
        "明确有单笔交易受阻，无广泛影响证据",
        "明确描述多笔交易或整项服务都受影响"
      ]
    },
    "duplicate_charge": {
      "type": "noul",
      "instructions": "这条消息是否明确声称同一笔交易被扣了两次或更多次？只判断消息表达，不核实真实交易。"
    }
  }
}
JSON
```

Python 的官方 SDK 是 `typesafe-sdk`（`TypeSafeClient.system_one`），JavaScript/TypeScript 的是 `@typesafe-ai/sdk`（`TypeSafeClient.systemOne`）。HTTP 与 SDK 的完整字段以[接口参考](https://docs.typesafe.ai/api/system-one)和[客户端文档](https://docs.typesafe.ai/sdk)为准。

## 问：响应里为什么有好几种数字？

下方只保留用于讲解的 `answers` 部分，**是按官方契约构造的响应，不是实际调用结果**。实际 HTTP 响应还可看到 `model`、`usage` 等字段：

```json
{
  "answers": {
    "team": {
      "type": "choice", "choice": "orders", "confidence": 0.805,
      "probabilities": {"orders": 0.87, "billing": 0.10, "other": 0.03}
    },
    "impact": {
      "type": "score", "score": 0.98, "confidence": 0.79,
      "legend": {"0": "一般咨询", "1": "单笔交易受阻", "2": "广泛影响"},
      "probabilities": {"0": 0.08, "1": 0.86, "2": 0.06}
    },
    "duplicate_charge": {"type": "noul", "noul": 0.08}
  }
}
```

| 字段 | 应该怎样读 |
| --- | --- |
| `team.choice` / `team.probabilities.orders` | 首选是 `orders`；该选项的预测概率为 `0.87`。`confidence` 从分布中计算，和 `0.87` 不是同一个量。 |
| `impact.score` | 三档从 `0` 开始编号。`0 × 0.08 + 1 × 0.86 + 2 × 0.06 = 0.98`；不需要四舍五入成档位才可参与规则。真实响应中的 `legend` 对应题目里提交的分档描述，这里缩写了文案。 |
| `duplicate_charge.noul` | `0.08` 是对「消息明确声称重复扣款」的“是”预测，不表示有 8% 的交易真的扣了两次。这个题型没有独立的 `confidence` 字段。 |

`Choice` 的 `other` 仍是一个候选标签，不会自动保证未知输入都被识别。选项确实可能一个都不合适时，还可以并发问一题「是否有任何一个队列匹配？」再由程序组合两题的答案。见 [TypeSafe：Companion Noul](https://docs.typesafe.ai/patterns/companion-noul)。

## 问：没密钥，能把分流练一遍吗？

可以。在克隆的博客仓库根目录运行以下命令（Node.js 22+）。示例用固定响应，只测试业务逻辑，不判断自然语言、不发送请求、也不创建工单：

```bash
node --test docs/articles/人工智能/jev/examples/route-ticket.mjs
```

它验证五类情况：正常进订单、正常进账单、重复扣款或拿不准转人工、影响大优先复核、无响应或字段不合法转人工。规则顺序如下：

1. **先验结果**：检查题型、队列白名单、实际使用字段的数值范围；异常一律转人工。
2. **再收住风险**：重复扣款分数高于 `0.30`（含“不明确”区间）、选了 `other` 或首选概率低于 `0.80`，转人工复核。
3. **最后分流**：影响值至少 `1.70` 则进优先复核，否则进入选中的常规队列；都不直接退款。

**练习：** 把重复扣款值分别改成 `0.30` 和 `0.31`，为什么分支不同？再试首选概率恰好 `0.80`。写下你期待的边界，比只测“很明显的正例”更能防止以后改错规则。**这些阈值是教学设定**；生产环境怎么选，见[评估、校准与上线](./04-评估校准与上线.md)。
