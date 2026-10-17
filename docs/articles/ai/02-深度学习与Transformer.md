---
title: 深度学习与 Transformer
date: '2026-10-17'
type: 技术
tags: AI|深度学习|Transformer
note: 理解神经网络、注意力和 Transformer 的最小结构。
---

# 02. 深度学习与 Transformer

## 1. 神经网络

神经网络由线性层、非线性激活、归一化和残差连接组成。线性层混合特征，激活提供表达能力，归一化改善数值稳定性，残差让深层网络更容易优化。卷积适合局部空间模式，循环网络按序处理但并行性弱，Transformer 用注意力直接建立 token 间关系。

## 2. Self-Attention

给定输入表示，线性投影得到 `Q、K、V`：

```text
Attention(Q,K,V) = softmax(QKᵀ / √dₖ)V
```

`QKᵀ` 衡量 token 之间的关联，缩放避免 softmax 过早饱和，`V` 汇总被关注的信息。多头注意力让不同头学习不同关系。注意力的代价通常随序列长度平方增长，因此长上下文需要缓存、稀疏注意力或其他优化。

## 3. Transformer 组件

一个典型块包含多头注意力、前馈网络、残差连接和归一化。位置编码提供顺序信息。编码器更适合理解和分类；解码器以自回归方式预测下一个 token；编码器-解码器适合翻译和条件生成。

## 4. 训练目标

语言模型常用 next-token prediction：给定前文预测下一个 token。掩码语言模型随机遮住 token 训练双向表示。训练阶段看到完整标签，推理阶段只能使用已经生成的前文，这种差异会造成暴露偏差。Teacher forcing 加快训练，但不能保证长序列生成稳定。

## 5. 规模规律与边界

增加数据、参数和计算通常能改善平均能力，但收益受数据质量、优化和推理预算限制。上下文窗口大不代表模型能均匀使用所有内容；需要测试长文档中证据位置的影响。不要把 benchmark 排名直接当作业务质量。

## 6. 学习任务

- 用 PyTorch 实现单头 attention，打印每个 token 的权重。
- 比较 RNN 与 Transformer 在相同序列上的并行训练方式。
- 为一个分类任务选择 encoder，为文本生成任务选择 decoder，并说明原因。

验收：能手算一个 2×2 attention；解释 causal mask 的作用；指出为什么位置编码是必要的。

参考：[PyTorch](https://github.com/pytorch/pytorch)、[Hugging Face Transformers](https://github.com/huggingface/transformers)。
