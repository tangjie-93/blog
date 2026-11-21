---
title: AI GitHub 项目地图：按问题阅读源码
date: '2026-10-17'
updated: '2026-11-20'
type: 技术
tags: AI|GitHub|源码
note: 按学习问题选择作者实现与成熟组件，沿数据流读源码，用实验验证选型而不是比较热度。
---

# 10. GitHub 项目地图：按问题阅读源码

## 1. 收藏仓库不等于建立能力

先写出要回答的问题，再选择代码。下面是学习入口，不是最新维护状态、质量或性能排名；不提供未经实时核验的 stars 与版本。

源码阅读要有产物：一张调用链、一条能执行的测试、一个有边界的结论。只跑通 README，通常只能证明环境基本可用。

## 2. 模型原理：从小实现到框架

| 你的问题 | 项目 | 阅读顺序 | 验收产物 |
| --- | --- | --- | --- |
| 反向传播怎样工作？ | [micrograd](https://github.com/karpathy/micrograd) | 标量节点 → 运算 → backward → 小网络 | 手绘一个计算图并用有限差分验梯度 |
| decoder 怎样训练和生成？ | [nanoGPT](https://github.com/karpathy/nanoGPT) | 数据 → block → loss → 训练循环 → generate | 追踪输入/标签错位与 mask |
| 模型结构怎样被统一调用？ | [Transformers](https://github.com/huggingface/transformers) | tokenizer → config → model → generation | 固定小模型，打印 shape 与停止原因 |
| 张量和自动微分怎样配合？ | [PyTorch](https://github.com/pytorch/pytorch) | 官方教程 → autograd → 模块与优化器 | 重写一轮训练并隔离验证集 |
| 完整 LLM 教学代码怎样组织？ | [LLMs from scratch](https://github.com/rasbt/LLMs-from-scratch) | 按章节从分词到训练 | 每章保留一个可解释测试 |

不要一上来阅读多机训练调度。先能解释几十行 attention，再研究 fused kernel，才能区分算法与实现优化。

## 3. 检索与证据：用同一份数据比组件

| 问题 | 项目 | 先看什么 | 刻意制造的失败 |
| --- | --- | --- | --- |
| 如何编码和重排？ | [Sentence Transformers](https://github.com/huggingface/sentence-transformers) | 编码配置、归一化、双编码器与交叉编码器 | 查询前缀不一致、截断 |
| ANN 为什么会漏结果？ | [Faiss](https://github.com/facebookresearch/faiss) | 精确检索基线 → 索引训练与搜索参数 | 降搜索预算后和精确结果比较 |
| 向量数据库如何过滤？ | [Qdrant](https://github.com/qdrant/qdrant) | payload、过滤、更新与删除 | 跨租户、撤权、旧向量残留 |
| 数据连接如何进入问答？ | [LlamaIndex](https://github.com/run-llama/llama_index) | reader → node → index → retriever | 元数据丢失、引用错位 |
| 文档解析怎样影响结果？ | [RAGFlow](https://github.com/infiniflow/ragflow) | 导入状态 → 解析产物 → 检索与引用 | 合并单元格、跨页表格 |
| 图检索是否必要？ | [GraphRAG](https://github.com/microsoft/graphrag) | 图构建成本、索引、查询类型 | 与普通 chunk RAG 做同题对照 |

比较检索系统时固定文档、切分、编码模型与相关性标注；否则不知道差异来自数据库还是数据处理。GraphRAG 不是默认升级路径，先证明问题需要跨实体与全局汇总。

## 4. 工具与编排：先有普通函数基线

| 问题 | 项目 | 阅读重点 | 验收 |
| --- | --- | --- | --- |
| 状态怎样暂停与恢复？ | [LangGraph](https://github.com/langchain-ai/langgraph) | 节点、边、状态、checkpoint、中断 | 恢复后不重复已完成副作用 |
| 模型工具循环怎样封装？ | [OpenAI Agents SDK](https://github.com/openai/openai-agents-python) | runner、工具请求、错误与 handoff | 未知工具和参数错误被拒绝 |
| 如何统一检索/模型组件？ | [LangChain](https://github.com/langchain-ai/langchain) | 消息与 runnable 的输入输出契约 | 与普通函数实现做同题对照 |
| 外部服务如何接入？ | [MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk) | 连接生命周期、能力发现、调用与错误 | 断线、超时、授权范围测试 |

框架可以管理流程，但它不会知道“某员工是否有权查看某报销单”。业务授权必须由你自己的服务实现。

## 5. 推理与评测：拒绝脱离条件的跑分

| 项目 | 学习重点 | 实验必须固定 |
| --- | --- | --- |
| [vLLM](https://github.com/vllm-project/vllm) | KV 管理、批处理、服务调度 | 权重、精度、硬件、输入输出长度、负载 |
| [SGLang](https://github.com/sgl-project/sglang) | 推理调度与结构化生成 | 同上，另记 schema 与缓存命中 |
| [llama.cpp](https://github.com/ggml-org/llama.cpp) | 本地推理、量化格式与硬件路径 | 模型来源、量化类型、线程与加速后端 |
| [lm-evaluation-harness](https://github.com/EleutherAI/lm-evaluation-harness) | 任务定义、提示与计分 | 数据版本、few-shot 设置、tokenizer |
| [Ragas](https://github.com/explodinggradients/ragas) | 检索与回答评审 | 指标定义、评委模型、人工校准集 |
| [Diffusers](https://github.com/huggingface/diffusers) | pipeline、scheduler、采样循环 | 权重、分辨率、种子、采样器与步数 |

模型公开分数不能直接变成你的系统质量结论。评测工具名字相同，不代表不同版本的默认指标和提示一样。

## 6. 一次阅读任务的具体做法

以“知识助手漏引用”为例：

1. 写最小复现：一段制度、一个问题、期望 citation ID。
2. 从调用入口追踪数据，记录 chunk ID 在哪层创建、变换和丢失。
3. 先读接口与测试，确认是框架契约还是你的适配层假设错误。
4. 用固定假模型响应隔离生成随机性。
5. 加测试后只改一层，再运行原有回归。
6. 保存结论及复现代码，不写泛泛的“学习了某框架”。

如果一小时后仍不知道哪段代码接收输入，先缩小仓库范围，不要同时打开更多项目。

## 7. 安装、许可证与版本检查清单

- 从项目官方组织或作者页面确认仓库身份，检查许可证及其适用范围。
- 代码许可证、模型权重许可证和数据许可分别核对，不能相互替代。
- 看最近发布、安全公告、依赖与实际支持的硬件；不要只看提交频率。
- 在隔离环境按锁定版本安装，不直接执行搜索结果中的未知一键脚本。
- 模型和 pickle 等产物可能包含可执行内容，不把“权重文件”默认视为无害。
- 记录 commit/tag、环境和配置；升级先跑小样本，再做完整回归。

## 8. 自测与下一步

::: details 自测：两个向量库比较，A 比 B 召回更高，能直接选 A 吗？
先核对是否使用相同的文档、切分、Embedding、距离函数、过滤、搜索预算与标注。还要看延迟、资源、更新删除、授权与运维成本；不是单指标选型。
:::

::: details 自测：如何证明一个框架值得引入？
给出普通函数基线，再证明它解决了真实需求，如可恢复状态、复杂编排或可观测性；同时测新增依赖、调试和升级成本。
:::

本页于 2026-11-20 重整为源码学习地图，仓库作为作者/官方代码入口，未对所有项目逐一做最新维护状态审计。具体原理出处见 01–09 各章；当前版本与许可请在接入时重新核对。

开始做项目：[11 实战里程碑](./11-学习路线与实战任务.md)。
