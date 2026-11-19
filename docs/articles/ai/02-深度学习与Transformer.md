---
title: 深度学习与 Transformer
date: '2026-10-18'
type: 技术
tags: AI|深度学习|Transformer|注意力
note: 从张量形状和计算图出发，推导 Transformer 的每个组件为什么存在。
---

# 02. 深度学习与 `Transformer`

## 1. 从神经元到计算图

一个线性层完成 `z = xW + b`，激活函数再完成 `a = σ(z)`。线性层只能表示线性变换，多层之间没有激活时仍可合并成一层；`ReLU`、`GELU` 等非线性让网络能够逼近复杂函数。

训练时，前向计算得到输出，损失函数产生一个标量，反向传播沿计算图求每个参数的梯度。梯度不是“重要性分数”，而是损失对参数的局部变化率。

## 2. 张量形状是第一调试工具

以批量文本为例：`B` 是 batch size，`T` 是序列长度，`D` 是隐藏维度，`H` 是头数，`Dh = D/H`。

```text
token id       [B, T]
embedding      [B, T, D]
Q/K/V          [B, H, T, Dh]
attention      [B, H, T, T]
输出           [B, T, D]
```

`attention [B,H,T,T]` 的最后两个维度表示“每个位置看其他位置的权重”。`T` 变成两倍时，注意力矩阵的元素数量大约变成四倍，这就是长上下文昂贵的原因。

## 3. Self-Attention 的推导

输入 `X` 经过三个线性投影得到：

```text
Q = XWQ, K = XWK, V = XWV
S = QKᵀ / √Dh
A = softmax(S)
Y = AV
```

`Q` 表示“我正在寻找什么”，`K` 表示“我具有什么线索”，`V` 表示“被取走的内容”。`QKᵀ` 计算每个 `query` 与所有 key 的匹配分数；除以 `√Dh` 防止维度变大后分数过大，导致 softmax 梯度过小。

### 3.1 手算一个注意力

```text
Q = [[1, 0], [0, 1]]
K = [[1, 0], [0, 1]]
V = [[10, 0], [0, 20]]
```

第一行 `query` 与两个 key 的分数为 `[1, 0] / √2`，softmax 后第一列权重更大，因此输出更接近 `[10, 0]`。模型不是选择一个词，而是在所有 value 之间做加权平均。

### 3.2 Causal Mask

语言生成时，位置 `t` 不能看到 `t+1` 之后的 `token`。实现时把未来位置的分数设为负无穷：

```text
[[0, -∞, -∞],
 [0,   0, -∞],
 [0,   0,   0]]
```

如果忘了 mask，训练时模型会偷看答案，损失很低，推理时却崩溃。

## 4. Multi-Head Attention

多头注意力把 `D` 切成 `H` 个子空间，每个头独立计算注意力，再拼接并投影。不同头可以学习指代关系、局部邻近、语法结构等不同模式，但“每个头都有清晰语义”不是保证。

```python
import torch
import torch.nn.functional as F

def attention(q, k, v, causal=False):
    d = q.size(-1)
    score = q @ k.transpose(-2, -1) / d**0.5
    if causal:
        t = score.size(-1)
        mask = torch.triu(torch.ones(t, t, dtype=torch.bool), diagonal=1)
        score = score.masked_fill(mask, float("-inf"))
    return F.softmax(score, dim=-1) @ v
```

## 5. 一个完整的 `Transformer` Block

典型 Decoder block 的数据流是：

```text
x → LayerNorm → Causal Self-Attention → Residual Add
  → LayerNorm → Feed Forward → Residual Add
```

前馈网络通常是 `Linear(D, 4D) → GELU → Linear(4D, D)`。注意力负责 `token` 间通信，前馈网络负责对每个位置独立变换特征。残差连接让梯度可以沿捷径传播；LayerNorm 让不同层的数值范围更稳定。

Pre-LN 和 Post-LN 的归一化位置不同。现代大模型常用 Pre-LN 或其变体，因为深层训练更稳定，但具体结构必须以模型实现为准。

## 6. 位置编码与长上下文

注意力本身对输入顺序不敏感，因此需要位置。绝对位置编码把位置向量直接加到 `token` 表示；RoPE 通过旋转 `Q/K` 让相对距离进入点积；ALiBi 直接给远距离注意力加偏置。

长上下文不只是把窗口数字调大：需要考虑训练长度、位置外推、显存、KV Cache、检索噪声和“中间信息丢失”。测试时要把证据放在开头、中间和结尾分别测。

## 7. Encoder、Decoder 与 Encoder-Decoder

| 结构 | 注意力 | 适合任务 |
| --- | --- | --- |
| Encoder-only | 双向 | 分类、向量表示、抽取 |
| Decoder-only | 因果遮罩 | 对话、代码、文本生成 |
| Encoder-Decoder | 编码双向、解码因果 | 翻译、摘要、条件生成 |

架构不是能力的全部。数据、训练目标、指令微调和推理策略同样决定效果。

## 8. 训练目标与暴露偏差

Next-`token` prediction 让模型在每个位置预测下一个 `token`。训练时通常使用 teacher forcing，输入是真实前文；推理时输入包含模型自己生成的 `token`。错误会在长序列中累积，这叫 exposure bias。

训练损失常按所有有效 `token` 的交叉熵平均；padding 位置要用 mask 排除，否则模型会学到填充符而不是文本。

## 9. 练习与验收

1. 用 `torch` 实现单头 attention，打印 `[B,H,T,T]` 权重并验证每行和为 `1`。
2. 去掉 causal mask，比较训练损失与生成质量。
3. 把序列长度从 `128` 改成 `256`，记录注意力显存和耗时变化。
4. 实现一个最小 decoder block，逐层打印张量形状。

完成标准：能手算 `2×2` attention；能解释 `Q/K/V`、causal mask、残差和 LayerNorm；能根据任务选择 Encoder 或 Decoder；能说明为什么长上下文会带来二次方成本。

## 10. 延伸资料

- [Attention Is All You Need](https://arxiv.org/abs/1706.03762)
- [The Illustrated `Transformer`](https://jalammar.github.io/illustrated-transformer/)
- [`PyTorch` `Transformer` Tutorial](https://pytorch.org/tutorials/intermediate/transformer_building_blocks.html)
- [Hugging Face Transformers](https://github.com/huggingface/transformers)
