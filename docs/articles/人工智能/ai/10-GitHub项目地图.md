---
title: AI GitHub 项目地图：按问题阅读源码
date: '2026-10-17'
updated: '2026-11-21'
type: 技术
tags: AI|GitHub|源码
note: 按学习问题选择作者实现与成熟组件，沿数据流读源码，用实验验证选型而不是比较热度。
---

<script setup>
import AiVisual from '../../../.vitepress/theme/components/AiVisual.vue'
</script>

# 10. GitHub 项目地图：按问题阅读源码

## 1. 收藏仓库不等于建立能力

<AiVisual title="带着哪个问题，应该先打开哪类项目？" kind="compare" :nodes="[
  { label: '理解模型计算', detail: 'micrograd 看梯度；nanoGPT 看 decoder；框架看统一接口' },
  { label: '找回可用证据', detail: '先用 Faiss 建精确基线，再按过滤或文档需求选组件' },
  { label: '控制工具流程', detail: '普通函数先跑通；确需状态恢复再读 LangGraph' },
  { label: '部署与验证', detail: '服务调度看 vLLM；任务计分看 lm-evaluation-harness' }
]" caption="按问题分流的学习地图，不是质量、热度或性能排名；维护状态与许可须在使用时核对。" />

- **只选一个入口**：先写问题，再开仓库，不同时追所有框架。
- **必须有产物**：一张调用链、一条可执行测试、一个有边界的结论。跑通 README 只证明环境基本可用。
- **下方表格按需展开**：保留作者/官方入口与验收方式，不列未经实时核验的 stars 或版本。

## 2. 模型原理：从小实现到框架

::: details 项目清单：梯度、decoder、模型接口与训练循环
| 你的问题 | 项目 | 阅读顺序 | 验收产物 |
| --- | --- | --- | --- |
| 反向传播怎样工作？ | [micrograd](https://github.com/karpathy/micrograd) | 标量节点 → 运算 → backward → 小网络 | 手绘一个计算图并用有限差分验梯度 |
| decoder 怎样训练和生成？ | [nanoGPT](https://github.com/karpathy/nanoGPT) | 数据 → block → loss → 训练循环 → generate | 追踪输入/标签错位与 mask |
| 模型结构怎样被统一调用？ | [Transformers](https://github.com/huggingface/transformers) | tokenizer → config → model → generation | 固定小模型，打印 shape 与停止原因 |
| 张量和自动微分怎样配合？ | [PyTorch](https://github.com/pytorch/pytorch) | 官方教程 → autograd → 模块与优化器 | 重写一轮训练并隔离验证集 |
| 完整 LLM 教学代码怎样组织？ | [LLMs from scratch](https://github.com/rasbt/LLMs-from-scratch) | 按章节从分词到训练 | 每章保留一个可解释测试 |

:::

**阅读边界**：先能解释几十行 attention，再研究 fused kernel 与多机调度，区分算法和实现优化。

## 3. 检索与证据：用同一份数据比组件

::: details 项目清单：编码、索引、过滤、解析与图检索
| 问题 | 项目 | 先看什么 | 刻意制造的失败 |
| --- | --- | --- | --- |
| 如何编码和重排？ | [Sentence Transformers](https://github.com/huggingface/sentence-transformers) | 编码配置、归一化、双编码器与交叉编码器 | 查询前缀不一致、截断 |
| ANN 为什么会漏结果？ | [Faiss](https://github.com/facebookresearch/faiss) | 精确检索基线 → 索引训练与搜索参数 | 降搜索预算后和精确结果比较 |
| 向量数据库如何过滤？ | [Qdrant](https://github.com/qdrant/qdrant) | payload、过滤、更新与删除 | 跨租户、撤权、旧向量残留 |
| 数据连接如何进入问答？ | [LlamaIndex](https://github.com/run-llama/llama_index) | reader → node → index → retriever | 元数据丢失、引用错位 |
| 文档解析怎样影响结果？ | [RAGFlow](https://github.com/infiniflow/ragflow) | 导入状态 → 解析产物 → 检索与引用 | 合并单元格、跨页表格 |
| 图检索是否必要？ | [GraphRAG](https://github.com/microsoft/graphrag) | 图构建成本、索引、查询类型 | 与普通 chunk RAG 做同题对照 |

:::

**比较边界**：固定文档、切分、编码模型与相关性标注，才能归因组件差异。GraphRAG 不是默认升级，先证明需要跨实体与全局汇总。

## 4. 工具与编排：先有普通函数基线

::: details 项目清单：状态恢复、工具循环、组件契约与 MCP
| 问题 | 项目 | 阅读重点 | 验收 |
| --- | --- | --- | --- |
| 状态怎样暂停与恢复？ | [LangGraph](https://github.com/langchain-ai/langgraph) | 节点、边、状态、checkpoint、中断 | 恢复后不重复已完成副作用 |
| 模型工具循环怎样封装？ | [OpenAI Agents SDK](https://github.com/openai/openai-agents-python) | runner、工具请求、错误与 handoff | 未知工具和参数错误被拒绝 |
| 如何统一检索/模型组件？ | [LangChain](https://github.com/langchain-ai/langchain) | 消息与 runnable 的输入输出契约 | 与普通函数实现做同题对照 |
| 外部服务如何接入？ | [MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk) | 连接生命周期、能力发现、调用与错误 | 断线、超时、授权范围测试 |

:::

**责任边界**：框架管理流程，不负责“某员工能否查看某报销单”；业务授权仍由自己的服务实现。

## 5. 推理与评测：拒绝脱离条件的跑分

::: details 项目清单：推理调度、本地运行、评审与生成采样
| 项目 | 学习重点 | 实验必须固定 |
| --- | --- | --- |
| [vLLM](https://github.com/vllm-project/vllm) | KV 管理、批处理、服务调度 | 权重、精度、硬件、输入输出长度、负载 |
| [SGLang](https://github.com/sgl-project/sglang) | 推理调度与结构化生成 | 同上，另记 schema 与缓存命中 |
| [llama.cpp](https://github.com/ggml-org/llama.cpp) | 本地推理、量化格式与硬件路径 | 模型来源、量化类型、线程与加速后端 |
| [lm-evaluation-harness](https://github.com/EleutherAI/lm-evaluation-harness) | 任务定义、提示与计分 | 数据版本、few-shot 设置、tokenizer |
| [Ragas](https://github.com/explodinggradients/ragas) | 检索与回答评审 | 指标定义、评委模型、人工校准集 |
| [Diffusers](https://github.com/huggingface/diffusers) | pipeline、scheduler、采样循环 | 权重、分辨率、种子、采样器与步数 |

:::

**口径边界**：公开分数不是系统质量结论；同名评测工具的不同版本也可能更改默认指标和提示。

## 6. 一次阅读任务的具体做法

<AiVisual title="漏引用时，沿哪条调用链找出 ID 丢失的位置？" kind="flow" :nodes="[
  { label: '请求入口', detail: '固定一个问题、用户身份与期望 citation ID' },
  { label: '解析 / 切分', detail: '记录 document_id 与 chunk_id 在哪里创建' },
  { label: '检索 / 适配', detail: '检查候选 ID 是否随元数据和上下文一起传递' },
  { label: '生成 / 引用校验', detail: '用固定假响应隔离随机性，检查允许引用集合' },
  { label: '返回 / 回归', detail: '找到首次丢失点，只改一层并运行原有测试' }
]" caption="知识助手漏引用的阅读路径示意，非性能数据；这是逻辑数据流，不承诺各仓库使用相同文件名或函数。" />

**本次阅读任务只交三样**：一段制度的最小复现；标出 ID 首次丢失点的调用链；一条修复前失败、修复后通过的测试。

**误区**：没找到入口就继续开仓库。应先读接口与测试、缩小范围；保存复现代码和结论，而不是“学习了某框架”。

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

本页于 2026-11-21 增补教学图解与按需阅读路径；仓库作为作者/官方代码入口，本轮未联网，也未对所有项目逐一做最新维护状态审计。具体原理出处见 01–09 各章；当前版本与许可请在接入时重新核对。

开始做项目：[11 实战里程碑](./11-学习路线与实战任务.md)。
