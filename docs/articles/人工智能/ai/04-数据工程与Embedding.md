---
title: AI 数据工程与 Embedding
date: '2026-10-17'
updated: '2026-11-21'
type: 技术
tags: AI|数据|Embedding
note: 从一段制度到可追溯向量，用余弦、版本和删除实验理解相似度不是权限。
---

<script setup>
import AiConcept from '../../../.vitepress/theme/components/AiConcept.vue'
import AiVisual from '../../../.vitepress/theme/components/AiVisual.vue'
</script>

# 04. 数据工程与 `Embedding`

## 1. 先修书，再做目录

共享盘里有扫描件、旧制度和不同部门附件。更大的模型不会自动知道哪份有效、哪列是上海、谁有权限。**数据工程把资料变成可信资产，Embedding 让不同说法有机会在检索时相遇。**

向量是语义坐标，不是主键、压缩包或真相分数；相似的旧制度仍可能是错误证据。

<AiVisual title="一份制度怎样成为可检索资产？" kind="flow" :nodes="[
  { label: '采集', detail: '保留原文、来源身份、授权和 document_id。' },
  { label: '解析', detail: '恢复正文、标题树、表格与原文位置。' },
  { label: '切分', detail: '让条件、数值、单位和标题保持可引用。' },
  { label: '编码', detail: '固定模型、维度、前缀、池化和归一化契约。' },
  { label: '发布', detail: '绑定索引版本、权限、生效期和删除状态。' }
]" caption="概念流水线；授权应参与检索，结果送入模型前仍需复核。" />

<AiConcept mode="embedding" />

本文使用虚构教学数据：2026-11-01 生效的《差旅制度》，上海住宿上限 500 元/晚，不代表任何真实制度。

## 2. 交付的不是“一个向量”

| 环节 | 关键输出 |
| --- | --- |
| 采集 | `document_id`、原始文件、来源与使用范围 |
| 解析 | 正文、标题树、表格结构、原文位置 |
| 切分 | `chunk_id`、标题路径、页码/偏移 |
| 编码 | 向量、模型修订号、维度、预处理版本 |
| 发布 | 索引版本、权限、生效区间、删除状态 |

块里不能只有“500”，应保留“差旅制度 / 上海 / 住宿 / 500 元每晚 / 生效日期”。标题可作为编码输入，但引用必须指回真实原文。训练数据更新参数，检索数据为每轮问答提供证据；二者都要记录来源、授权、清洗版本与质检结果。

## 3. 编码器学的是相对关系

训练通常让匹配的查询—文档向量靠近，不匹配样本远离。难负例可以是“同样谈住宿、但城市不同或已失效”的条款，专门暴露“主题对、条件错”。双编码器可预先计算文档向量；模型、查询/文档前缀、池化、截断和归一化都是编码契约。

<AiVisual title="相似度为什么还不够？" kind="compare" :nodes="[
  { label: '语义相近', detail: '向量方向相似，说明表达可能相关。' },
  { label: '版本有效', detail: '生效期和当前发布状态决定能否使用。' },
  { label: '有权访问', detail: '服务端身份与 ACL 决定能否进入候选。' },
  { label: '支持主张', detail: '回到原文核对金额、单位和例外。' }
]" caption="相似度只是候选排序信号；它不替代时效、权限与原文核验。" />

### 手算一次余弦

设教学坐标为“住宿、报销、休假”：`q=(1,1,0)`，制度 A=`(2,1,0)`，休假 B=`(0,0,2)`，扩写 A′=`(20,10,0)`。

```text
cos(q,A)=3/√10≈0.949，cos(q,B)=0
cos(q,A′)=30/(√2×√500)≈0.949
```

余弦比较方向，不因 A′ 放大十倍变高；单位归一化后点积等于余弦。`0.949` 不是 94.9% 正确率，也不存在到处通用的“0.8 安全阈值”。

::: details 展开向量边界与切分策略
向量每一维通常没有人工可读的固定含义；上面的命名只是手算。零向量没有定义的余弦方向。换距离度量时，要连同归一化和索引配置一起验证。

| 切法 | 常见后果 | 检查方式 |
| --- | --- | --- |
| 每 50 字硬切 | 城市和金额分开 | 命中块能否完整回答 |
| 整份制度一块 | 多主题稀释、输入昂贵 | 是否只是主题相关 |
| 标题/条款/完整表格 | 条件与数值更可能同块 | 抽查单位、例外、表头 |
| 过量重叠 | 前几名同源，挤掉其他证据 | 统计去重后覆盖 |

先按结构切，再用 token 上限控制；表格不要拆掉表头、单位和脚注。重叠应由真实问题集验证，不是越多越好。
:::

## 4. 版本更新：正文与权限分开追踪

1. v1：上海 400 元/晚，有内容哈希和有效期。
2. v2：上海 500 元/晚，保留城市列与“每晚”单位。
3. 只重算内容变化块；权限变化即使正文不变也更新元数据。
4. 新索引验证后原子切换查询别名，并使旧缓存失效。

同文被两个部门引用时可复用编码，但不能合并授权关系。`document_id + source_revision + chunk_id` 跟踪逻辑对象，内容哈希检测正文变化；哈希不是匿名化，短文本和手机号仍可能被枚举。

## 5. 零依赖实验：相似度、过滤和版本拒绝

把下面实验保存为临时目录的 `embedding_lab.py`，运行 `python3 embedding_lab.py`。它是词典特征编码器，不是训练好的语义模型；不联网、不需要 API key、不读写项目数据。

::: details 实验代码（完整）
```python
from hashlib import sha256
from math import sqrt
import unicodedata

GROUPS = (("住宿", "酒店"), ("报销", "限额"), ("休假", "请假"))
SPEC = ("toy-v1", len(GROUPS), "NFKC-v1")

def clean(text):
    return unicodedata.normalize("NFKC", text).strip()

def encode(text):
    text = clean(text)
    return tuple(sum(text.count(w) for w in words) for words in GROUPS)

def cosine(a, b):
    if len(a) != len(b):
        raise ValueError("dimension mismatch")
    norm = sqrt(sum(x*x for x in a) * sum(y*y for y in b))
    # 零向量约定为无匹配，不是数学上的余弦值。
    return sum(x*y for x, y in zip(a, b)) / norm if norm else 0.0

raw = [("old", "住宿报销限额400元", "team", False),
       ("new", "住宿报销限额500元", "team", True),
       ("private", "酒店报销限额900元", "finance", True),
       ("leave", "请假休假流程", "team", True)]
records = []
for doc_id, text, scope, current in raw:
    records.append(dict(id=doc_id, text=text, scope=scope, current=current,
                        hash=sha256(clean(text).encode()).hexdigest(),
                        vector=encode(text), spec=SPEC))

def search(query, scopes, spec=SPEC):
    if any(r["spec"] != spec for r in records):
        raise ValueError("encoding contract mismatch; rebuild index")
    q = encode(query)
    # scopes 模拟服务端已认证身份的授权结果，不能由用户任意传入。
    visible = [r for r in records if r["scope"] in scopes and r["current"]]
    ranked = sorted(((cosine(q, r["vector"]), r["id"]) for r in visible),
                    key=lambda item: (-item[0], item[1]))
    return [(doc_id, round(score, 3)) for score, doc_id in ranked if score > 0]

print("未过滤：", [(r["id"], round(cosine(encode("酒店限额"), r["vector"]), 3)) for r in records])
print("可用结果：", search("酒店限额", {"team"}))
assert search("酒店限额", {"team"}) == [("new", 0.949)]
assert search("火星基地", {"team"}) == []
assert records[0]["hash"] != records[1]["hash"]
try:
    search("酒店限额", {"team"}, ("toy-v2", 3, "NFKC-v1"))
except ValueError as exc:
    print("拒绝查询：", exc)
else:
    raise AssertionError("incompatible contract must be rejected")
```

预期：过滤后只剩 `new`，换模型版本被拒绝。这证明高相似度不能替代权限和时效，不证明编码器理解自然语言；把查询换成同义问法会暴露词典实验的局限。
:::

## 6. 工程取舍、排错与练习

小库先精确遍历，规模增长再比较近似索引的召回、内存和延迟；更高维度、量化和批量摄取都要在同一问题集验证。删除先让数据不可访问，再清理原文、块、缓存、评测副本和备份；训练进模型的数据不能靠删向量解决。

::: details 常见故障与分层练习
| 现象 | 先查什么 |
| --- | --- |
| 上传但搜不到 | 解析文本、入库状态、索引别名 |
| 无关结果暴增 | 查询/文档模型、前缀、维度 |
| 查“500”只有“上海” | 块边界、原文与表格结构 |
| 旧版总排第一 | 有效期过滤和旧缓存 |
| 别人搜得到我搜不到 | 服务端 ACL 与权限快照 |

- **入门**：手算 `q=(1,0)` 与 `(2,0)`、`(0,2)` 的余弦，答案为 `1、0`。
- **实践**：增加第二租户，断言未授权条款不进入返回列表；只改权限不改正文。
- **工程**：设计 v1→v2 发布、回滚和删除演练，交付派生数据清单。

**维度相同的模型可以混用吗？** 不能仅凭维度判断，坐标含义可能不同，应按契约拒绝。

**“400”和“500”为什么相似度一样？** 教学编码没有数字特征；真实模型也不保证数值区分，事实必须回原文。
:::

::: details 继续实现：数据摄取与索引
- [数据摄取](../rag/04-数据摄取.md)：解析、清洗与块结构。
- [向量化与索引](../rag/05-向量化与索引.md)：编码契约与索引落地。
:::

::: details 一手资料与核对边界
既有检索/核对日期：2026-11-20；本次整理未重新联网核验。Sentence Transformers 正文此前通过直接 HTTP 读取，Faiss 与 SBERT 原论文部分仅按搜索结果/摘要核对；不据此承诺业务收益。

- [Sentence Transformers：Semantic Search](https://sbert.net/examples/sentence_transformer/applications/semantic-search/README.html)：查询/文档编码与非对称检索。
- [Faiss MetricType](https://github.com/facebookresearch/faiss/wiki/MetricType-and-distances)：归一化、内积与平方 L2。
- [Sentence-BERT](https://arxiv.org/abs/1908.10084)：句向量与余弦比较背景。
:::

下一篇：[05 RAG 与知识库](./05-RAG与知识库.md)，追踪“找到相似块”到“回答有依据”的差距。
