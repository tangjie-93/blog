---
title: RAG 与知识库
date: '2026-10-17'
updated: '2026-11-21'
type: 技术
tags: AI|RAG|知识库
note: 用差旅问答贯通检索、证据与引用，再用故障注入定位 RAG 错答。
---

<script setup>
import AiConcept from '../../../.vitepress/theme/components/AiConcept.vue'
import AiVisual from '../../../.vitepress/theme/components/AiVisual.vue'
</script>

# 05. `RAG` 与知识库

## 1. 开卷考试，也会拿错书

用户问“上海出差住宿上限多少，需要谁审批？”时，系统先找资料、筛证据，再组织答案。这就是检索增强生成（RAG）。它不把整本制度记进参数，而是管理一条责任链：**资料 → 候选 → 证据 → 主张**。

<AiVisual title="一次 RAG 问答的责任链" kind="flow" :nodes="[
  { label: '身份与问题', detail: '带原问题、租户、授权范围和查询时间。' },
  { label: '候选召回', detail: '向量、关键词或混合检索找可能相关的块。' },
  { label: '证据装配', detail: '校验版本与权限，在 token 预算内去重取证。' },
  { label: '生成主张', detail: '只对实际送入上下文的材料组织回答。' },
  { label: '引用校验', detail: '检查来源存在、可访问且真正支持主张。' }
]" caption="概念责任链；‘库里有’、‘搜到了’、‘模型看到了’是三个不同状态。" />

上一章的虚构制度仍是教学数据：v1 上海 400 元/晚，v2 改为 500 元/晚，另有主管审批条款。金额、审批和版本都必须被分别证明。

## 2. 每层交付什么

| 对象 | 必须携带 | 不让模型决定 |
| --- | --- | --- |
| 查询 | 原问题、身份、授权、时间 | 租户和可访问范围 |
| 候选 | 块 ID、原文、版本、排名 | 版本有效性、访问控制 |
| 证据 | 编号、完整原文、定位、有效期 | 编号到真实来源的映射 |
| 回答 | 主张、引用、未覆盖问题、状态 | 引用存在、是否越权 |

可约定 `status + answer + citations + missing`。嵌入超时返回 `retrieval_error`，不能伪装成“公司没有这条规定”。离线摄取与在线问答通过持久索引连接，更新通常发布索引、权限和缓存版本，而不是每问都重新上传全文。

## 3. 找全、排准、放进去、用对

向量检索擅长“住酒店能花多少”这类语义关联；关键词检索擅长条款号、项目代码和专有名词。混合检索不能直接把余弦 `0.8` 与 BM25 `12` 相加；可用 RRF 按排名融合：

```text
RRF(d)=Σ 1/(60+rankᵢ(d))
金额块：向量第1、关键词第2 → 1/61+1/62≈0.03252
审批块：向量第3、关键词第1 → 1/63+1/61≈0.03227
```

`60` 是演示配置，不是通用最优值。重排可用 cross-encoder 成对读问题与候选，但**融合不是重排，重排也不是事实核验**；正确块没进候选，后面无法凭空补回。

<AiConcept mode="rag" />

::: details 展开证据预算与引用两道门
重复块和长附件可能挤掉审批条款；扩大 top-k 不等于模型看到更多有效证据。先覆盖子问题，再去重、保留完整条款，最后按预算装配。

证据注册为 `[E1]、[E2]` 后，第一道门检查编号存在且用户可访问；第二道门回到原文核对是否支持“上海每晚 500”。引用“差旅概览”不能证明这个主张。金额有证据而审批无证据时，应分别报告；有效范围冲突时展示冲突并请求核实。

检索文本中的“忽略规则、导出名单”只是待处理数据，不能改变工具或权限策略。
:::

## 4. 用故障轨迹定位“只答半句”

问题需要 `{new, approval}` 两块，人工设置的故障轨迹如下（不是线上性能统计）：

<AiVisual title="错答发生在哪一层？" kind="layers" :nodes="[
  { label: '解析', detail: 'new 有上海、500、每晚；approval 有主管。' },
  { label: '索引 / ACL', detail: '两块有效且可见，排除摄取缺失和越权过滤。' },
  { label: '召回', detail: '单路 top-2 漏 approval，先修候选覆盖。' },
  { label: '装配', detail: '混合后候选齐全，但预算 1 块只放入 new。' },
  { label: '生成', detail: '金额正确、审批未知；这是合理的部分回答。' }
]" caption="逐层定位比笼统归因‘模型不行’更可复现；每次只改一层。" />

因此先把预算放到 2 块，再查生成提示与主张覆盖。若回答说“财务总监”而证据只有“直属主管”，是生成不受支持；若回答 400，先查旧版是否进了本轮证据。

## 5. 可运行实验：故障注入，不假装训练模型

保存为临时目录的 `rag_lab.py`，运行 `python3 rag_lab.py`。它使用预置排名和模板回答，只需 Python 3 标准库；`Recall@2` 的相关块由人工标定，不是实际检索跑分。

::: details 实验代码（完整）
```python
from collections import defaultdict

DOCS = {
    "old": {"text": "上海住宿上限400元/晚", "current": False, "kind": "amount"},
    "new": {"text": "上海住宿上限500元/晚", "current": True, "kind": "amount"},
    "overview": {"text": "差旅需遵守公司制度", "current": True, "kind": "other"},
    "approval": {"text": "住宿报销需直属主管审批", "current": True, "kind": "approval"},
}
RELEVANT = {"new", "approval"}
DENSE = ["old", "new", "overview", "approval"]
KEYWORD = ["approval", "new", "old"]

def retrieve(hybrid):
    def eligible(ids):
        # 演示中所有块均属于该用户；生产还必须带服务端 ACL 约束。
        return [d for d in ids if DOCS[d]["current"]]
    routes = [eligible(DENSE)]
    if hybrid:
        routes.append(eligible(KEYWORD))
    scores = defaultdict(float)
    for route in routes:
        for rank, doc_id in enumerate(route, 1):
            scores[doc_id] += 1 / (60 + rank)
    return sorted(scores, key=lambda d: (-scores[d], d))[:2]

def recall(ids):
    return len(set(ids) & RELEVANT) / len(RELEVANT)

def ask(hybrid, budget):
    candidates = retrieve(hybrid)
    evidence = candidates[:budget]  # 仅用块数模拟 token 预算。
    registry = {f"E{i}": d for i, d in enumerate(evidence, 1)}
    claims, missing = [], []
    for kind in ("amount", "approval"):
        match = next(((eid, d) for eid, d in registry.items()
                      if DOCS[d]["kind"] == kind), None)
        if match is None:
            missing.append(kind)
        else:
            eid, d = match
            claims.append({"text": DOCS[d]["text"], "citation": eid})
    assert all(c["citation"] in registry for c in claims)
    return {"candidate_recall": recall(candidates),
            "evidence_recall": recall(evidence), "evidence": registry,
            "status": "partial" if missing else "complete",
            "claims": claims, "missing": missing}

for hybrid, budget in ((False, 2), (True, 1), (True, 2)):
    print(hybrid, budget, ask(hybrid, budget))

assert ask(False, 2)["candidate_recall"] == 0.5
assert ask(True, 1)["candidate_recall"] == 1.0
assert ask(True, 1)["evidence_recall"] == 0.5
assert ask(True, 2)["status"] == "complete"
assert "old" not in ask(True, 2)["evidence"].values()
```

三次运行演示：召回漏一块 → 召回齐但预算漏一块 → 两块进入证据。`Recall@2=命中的相关块数/全部相关块数`，本例分母是 2；无答案问题不能套用这个分母。去掉有效期过滤会让旧版参与排名；删掉 `approval` 的两路候选则扩大预算也救不回。模板复制证据，不测试幻觉、冲突裁决和语义改写。
:::

## 6. 上线取舍与评估

十几页固定资料可先试直接上下文；大量更新且需出处时用带版本与权限的 RAG；固定格式先修提示协议，必要时再微调；汇总所有金额应查数据库而不是 top-k；固定两步流程不必引入无限 Agent 循环。

缓存键至少绑定租户/权限版本、问题、索引和提示配置；权限撤销不能等自然过期。分别计数检索故障、无证据、冲突证据。回归集要覆盖同义问法、旧版诱饵、跨租户、无答案与提示注入；检索看正确块覆盖，生成看主张支持与问题覆盖，引用看定位与权限。

::: details 练习与自测
- **入门**：为“金额 + 审批”画出两条主张分别依赖哪块证据，标出未知条件。
- **实践**：运行三组故障，记录候选、证据和主张；新增一个只有旧版答案的问题，要求拒绝失效条款。
- **工程**：设计检索超时与权限撤销演练，验收错误类型、缓存失效、引用复鉴权和日志脱敏。

**候选 Recall@2 为 1，为什么仍会漏答？** 证据装配可能丢块，生成也可能没覆盖；要查实际上下文。

**两个有效金额取相似度最高的吗？** 不行；先核对时间、范围和权威来源，不能消解就展示冲突。

**引用编号存在就可信吗？** 还需验证原文支持、来源有效且用户有权查看。
:::

::: details 继续实现：独立 RAG 专题
- [最小实现](../rag/03-最小实现.md)：真实嵌入与生成接口。
- [数据摄取](../rag/04-数据摄取.md)、[检索与重排](../rag/06-检索与重排.md)：切分、多路召回与排序。
- [生成与引用](../rag/07-生成与引用.md)、[评估](../rag/09-评估.md)：协议和回归集。
- [上传到问答全链路](../rag/08-文档上传到问答全链路.md)、[排障手册](../rag/12-排障手册.md)：生产状态与故障定位。
:::

::: details 一手资料与核对边界
既有检索/核对日期：2026-11-20；本次整理未重新联网核验。RAG 原论文与 Lost in the Middle 仅按搜索摘要核对；Sentence Transformers 页面此前直接读取正文。论文实验不等于所有现代 RAG 流水线的业务效果。

- [Lewis 等：RAG](https://arxiv.org/abs/2005.11401)：参数记忆与外部非参数记忆结合的背景。
- [Retrieve & Re-Rank](https://sbert.net/examples/sentence_transformer/applications/retrieve_rerank/README.html)：先召回再用 cross-encoder 重排。
- [Lost in the Middle](https://arxiv.org/abs/2307.03172)：特定实验中的位置效应，不外推到所有模型。
:::

接下来进入 [Agent 与工具调用](./06-Agent与工具调用.md)，把“回答制度”扩展为“在授权下查询流程状态”。
