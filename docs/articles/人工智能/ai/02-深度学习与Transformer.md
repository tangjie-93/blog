---
title: 深度学习与 Transformer：从向量到上下文计算
date: '2026-10-18'
updated: '2026-11-21'
type: 技术
tags: AI|深度学习|Transformer|注意力
note: 用张量流、一次注意力计算和因果遮罩，理解 Transformer 的信息交换与成本。
---

<script setup>
import AiConcept from '../../../.vitepress/theme/components/AiConcept.vue'
import AiVisual from '../../../.vitepress/theme/components/AiVisual.vue'
</script>

# 02. 深度学习与 Transformer

## 1. 从相同词面到上下文表示

“我把苹果放进包里”和“苹果发布了新品”中的词面相同，语境不同。静态查表只给初始向量，Transformer 让位置之间通信，形成上下文相关表示。注意力是可学习的加权汇总，不是数据库精确查找，也不是人类式的理解证明。

<AiVisual title="一层 Transformer 在做什么？" kind="layers" :nodes="[
  { label: 'Token + 位置', detail: '把离散 ID 和顺序信息变成输入表示。' },
  { label: 'Q / K / V', detail: '为每个位置生成查询、匹配线索与待汇总内容。' },
  { label: '注意力', detail: '按匹配分数混合其他位置的 value。' },
  { label: 'MLP + 残差', detail: '逐位置做非线性变换，并保留信息与梯度路径。' },
  { label: 'Logits', detail: '把隐藏状态投影到词表分数，预测下一 token。' }
]" caption="教学版 decoder block；具体归一化布局、位置方案和 KV 头数随架构变化。" />

学习目标是追踪 `[B,T,D]` 的形状，手算一行注意力，并解释训练时为什么不能偷看未来。

## 2. 先追踪 shape，再谈“理解”

团队助手输入“住宿上限是多少”时，数据流可压缩为：

```text
token IDs          [B,T]
查表后的 X          [B,T,D]
Q、K、V（拆头）     [B,H,T,Dh]
注意力分数          [B,H,T,T]
拼头并输出投影      [B,T,D]
词表 logits         [B,T,Vocab]
```

上表限定常规多头注意力（MHA），`Dh=D/H`；教学设定 `B=2、T=4、D=8、H=2、Dh=4`。`Vocab` 与隐藏维度不是一回事；不要因两个轴恰好都是 4 就交换它们。调试时给轴命名，通常比只打印数字可靠。

## 3. Q、K、V：一次加权汇总

单头公式为：

```text
Q=XWq，K=XWk，V=XWv
S=QKᵀ/√Dh
A=softmax(S+mask)（沿被读取位置归一化）
Y=AV
```

Q 是“当前位置需要什么”的查询，K 是“怎样被找到”的匹配线索，V 是找到后汇总的内容；它们都是向量，不是自然语言问题、关键词标签和数据库值。

<AiConcept mode="transformer" />

::: details 展开缩放原因与手算
当各维近似独立、均值为零且方差相近时，点积方差随维度增长。除以 `√Dh` 帮助 softmax 保持合适数值范围，不是把结果强行压到 0–1。

令 `Q=K=[[1,0],[0,1]]，V=[[10,0],[0,20]]，Dh=2`。第一个查询的分数为 `[0.7071,0]`，softmax 权重约 `[0.6698,0.3302]`，所以输出约为 `[6.6976,6.6048]`。这不是选中第一个词，而是混合两个 value；权重也不是正确概率或完整因果解释。
:::

## 4. Causal Mask：不让模型偷看答案

序列 `[今天, 天气, 很, 好]` 中，位置“天气”预测“很”。如果它能读到未来 token，就能走捷径。因果遮罩在 softmax **之前**加入分数矩阵：

```text
       位置0  位置1  位置2
位置0    0    −∞    −∞
位置1    0     0    −∞
位置2    0     0     0
```

`exp(−∞)=0`，未来 value 不贡献。可验证不变量是：任意改变未来位置的 `V`，更早位置的输出都不变。

<AiVisual title="三个 mask 不是一回事" kind="compare" :nodes="[
  { label: 'Causal', detail: '禁止读取未来位置，服务自回归预测。' },
  { label: 'Padding', detail: '禁止读取补齐 token，避免无意义内容。' },
  { label: 'Loss', detail: '决定哪些位置计入训练损失。' }
]" caption="三种遮罩施加位置和目标不同；具体布尔值含义应核对所用 API。" />

训练时还要把 `[A,B,C,D]` 错开为输入 `[A,B,C]`、目标 `[B,C,D]`。teacher forcing 使用真实前文，推理时前文可能含模型自己的早期错误。

## 5. Block 里的协作与位置

- 注意力让不同位置交换信息。
- MLP 在每个位置复用参数，做非线性特征变换。
- 残差提供信息与梯度的短路径。
- LayerNorm/RMSNorm 调整数值尺度，放置位置依架构而异。

常见 Pre-Norm 形式：`h=x+Attention(Norm(x))`，`y=h+MLP(Norm(h))`。无非线性时多层线性仍可合并。多头也不是“每个头必然负责语法/指代”；GQA/MQA 还会让多个 Q 头共享较少的 K/V 头。

没有位置编码时，self-attention 对排列具有置换等变性质，不能仅凭内容恢复顺序。

| 方案 | 位置怎样进入计算 | 边界 |
| --- | --- | --- |
| 绝对位置 | 把位置表示加到输入 | 超出训练范围未必可靠 |
| RoPE | 按位置旋转 Q/K | 长度外推需要策略支持 |
| ALiBi | 给注意力分数加距离偏置 | 是特定架构设计 |

## 6. 长上下文的代价要分项说

密集注意力的显式分数矩阵有 `B×H×T²` 个元素。`B=1、H=8、T=4096、FP16` 时，一份矩阵约 `256 MiB`；`T` 翻倍时变为 `1 GiB`。这是教学预算，不是总显存；权重、激活、梯度和优化器另算。

FlashAttention 通过分块和重计算避免将整份分数矩阵存入高带宽显存，不能据此说所有实际显存都按公式增长。解码使用 KV Cache 避免重算旧 K/V，但新 query 仍需读取过去缓存，长上下文会增加缓存和带宽压力。

::: details 架构、复杂度与实验边界
| 架构 | 上下文方式 | 常见用途 |
| --- | --- | --- |
| Encoder-only | 双向读取输入 | 表征、分类、检索 |
| Decoder-only | 因果读取已有序列 | 自回归文本与代码 |
| Encoder-Decoder | 编码端双向，解码端因果并读编码结果 | 条件生成、翻译 |

[标准库实验包](./examples/)可运行：

```bash
python3 docs/public/ai-examples/foundations.py
python3 docs/public/ai-examples/foundations.py --test
```

检查缩放是否除以 `√Dh`、softmax 是否按 key 位置归一化、第一行是否为 `[1,0]`，以及改变第二个 `V` 后第一行是否不变。它只覆盖单批、单头、等长 self-attention，不是生产 GPU 实现。
:::

## 7. 练习与核验

- **入门**：手算未遮罩第一行，再解释加 mask 后为什么成为 `[10,0]`。
- **进阶**：写出 `B=2、T=16、D=32、H=4` 的各 shape；说明改变 T 后哪些维度增长。
- **工程**：把同一长文证据放在开头、中间、结尾，对比任务表现；“窗口够大”不等于“证据必然被用到”。

::: details 自测答案
**两层线性层为什么还不够？** 中间没有非线性时，`(xW₁+b₁)W₂+b₂` 可合并为 `xW'+b'`。

**注意力权重 0.9 能证明原文可信吗？** 不能；它只是当前头、当前位置的 value 混合权重。

**序列翻倍所有成本都四倍吗？** 只有密集注意力分数矩阵的元素数按四倍增长；MLP 等按位置的部分通常近似线性，实际还受实现与缓存影响。
:::

::: details 资料与来源核验边界
既有检索记录日期：2026-11-20；本次整理未重新联网核验。原始注意力公式与 Hugging Face 架构介绍此前通过搜索结果核对，正文获取受限；作者实现作为扩展阅读，不声称全文复现。

- [Attention Is All You Need](https://arxiv.org/abs/1706.03762)：缩放点积注意力与原始 encoder-decoder。
- [Hugging Face：How do Transformers work?](https://huggingface.co/learn/llm-course/en/chapter1/4)：注意力与三类结构。
- [PyTorch：Transformer building blocks](https://pytorch.org/tutorials/intermediate/transformer_building_blocks.html)：框架实现扩展。
- [FlashAttention](https://github.com/Dao-AILab/flash-attention)：计算与显存访问的区别。
:::

下一章：[03 大语言模型](./03-大语言模型.md)，把隐藏状态追踪到 logits、采样和输出协议。
