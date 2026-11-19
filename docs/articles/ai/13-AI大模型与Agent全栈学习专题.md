---
title: AI 大模型与 Agent 全栈学习专题（GitHub 路线版）
date: '2026-10-18'
type: 技术
tags: AI|LLM|Agent|学习路线|GitHub
note: 综合 GitHub 上成熟课程与路线，按基础、模型、应用、Agent、扩展生态和生产系统组织一条可执行的学习主线。
---

# `AI` 大模型与 `Agent` 全栈学习专题

这不是资源收藏夹，而是一条有产出物的学习路线。每个阶段都要完成一个小项目，再进入下一阶段。不会 `Python` 的读者先补 `Python`、`Git`、`Linux` 和 `HTTP`；已经能写 `API` 的读者从第 3 阶段开始。

## 一、先看懂 `GitHub` 上的三种路线

| 路线 | 代表项目 | 强项 | 适合谁 |
| --- | --- | --- | --- |
| 模型科学家 | [`mlabonne/llm-course`](https://github.com/mlabonne/llm-course) | 数学、`Transformer`、预训练、微调、量化、评测 | 想理解模型内部机制的人 |
| `AI` 工程师 | [`rohitg00/ai-engineering-from-scratch`](https://github.com/rohitg00/ai-engineering-from-scratch) | 从数学到 `LLM`、`Agent`、`MCP`、部署和安全，按 phase 配套代码 | 想系统做出可运行系统的人 |
| `Agent` 工程师 | [`WenyuChiou/awesome-agentic-ai-zh`](https://github.com/WenyuChiou/awesome-agentic-ai-zh) | 中文路线、Track `A/B`、`CLI` `Agent`、`Skill`、Plugin、`MCP`、Eval | 想使用或构建 `Agent` 的工程师 |

三条路线不是互相替代：模型路线回答“模型为什么这样工作”，工程路线回答“系统怎样上线”，`Agent` 路线回答“模型怎样持续完成任务”。本专题把三者合并成一条主线。

## 二、总图：从数据到可靠 `Agent`

```text
数学/编程 → 机器学习 → 深度学习 → Transformer → LLM 训练与推理
                                                        ↓
                       Prompt / Structured Output / Embedding
                                                        ↓
                             RAG / Workflow / Tool Calling
                                                        ↓
              Agent Loop → Memory → Multi-Agent → MCP / Skill / Plugin
                                                        ↓
               Eval → Security → Observability → Deployment → Cost
```

## 三、12 个阶段和完成标准

### 0. 工具与编程基础

学习 `Python`、虚拟环境、`Git`、`Linux`、`HTTP`、`JSON`、异步、测试和日志。完成一个命令行程序：请求公开 `API`、保存 `JSON`、处理超时和错误，并测试空输入。

### 1. 数学与机器学习

学习向量与矩阵、概率、梯度、损失函数、优化器、过拟合和数据集切分。用纯 `Python` 实现线性回归和二分类器，画出损失曲线。

### 2. 深度学习与 `Transformer`

学习反向传播、MLP、注意力、Multi-Head Attention、位置编码、LayerNorm、残差连接和 Decoder-only `Transformer`。不能跳过 `Tokenizer/BPE`、logits、softmax、`temperature`、`top-k/top-p`、causal mask、RoPE、KV `cache`。用 `PyTorch` 写一个最小 `Transformer` 并生成文本。

### 3. `LLM` 训练、对齐与推理

学习预训练、SFT、RLHF、DPO、PPO、RLVR、数据配比、checkpoint、混合精度、量化、并行和上下文扩展。对同一个小模型做一次 `LoRA/SFT`，比较基础、微调和量化版本的输出与延迟。

### 4. 模型调用与 `Prompt` 工程

学习消息角色、上下文窗口、结构化输出、`JSON` `Schema`、函数调用、重试、流式响应、模型路由和成本核算。做一个结构化信息抽取服务，输出经过 `Schema` 校验的 `JSON`，并记录 `token` 成本。

### 5. `Embedding`、搜索与 `RAG`

学习 `Embedding`、分块、元数据、向量检索、`BM25`、混合检索、reranker、`query` rewriting、`HyDE`、引用和 `RAG` 评测。做一个带引用的文档问答系统，记录 `Recall`@k、`MRR`、引用覆盖率和拒答率。

### 6. Workflow 与 `Agent` Loop

学习状态、观察、工具 `Schema`、规划、`ReAct`、最大步数、超时、幂等、人工审批和失败恢复。做一个只允许搜索、读取、汇总三个工具的研究 `Agent`，每次调用都有参数校验、权限判断和轨迹日志。

### 7. `Agent` 框架与图编排

学习 `LangGraph`、`OpenAI` `Agents` `SDK`、CrewAI、AutoGen 的共同抽象：节点、边、状态、handoff、并行和中断。把第 6 阶段改成可暂停、可恢复的状态图。

### 8. `Memory`、`Context` Engineering 与多 `Agent`

学习短期消息、摘要、长期记忆、检索记忆、任务状态、上下文压缩、子 `Agent`、角色分工和消息协议。做一个规划、检索、审稿、汇总四角色的研究团队，并保存每个角色的证据。

### 9. `Skill`、Rule、Plugin 与 `MCP`

- `Rule`：项目或组织约束，例如 `AGENTS.md`、`.mdc`。
- `Skill`：按需加载的任务方法和参考资料，常见入口是 `SKILL.md`。
- `Plugin`：把 Skills、Commands、`Hooks`、`Agents` 或 `MCP` 配置打包、安装、升级和卸载。
- `MCP`：`Host/Client/``Server` 之间发现和调用工具、资源、提示的协议。

写一个最小 `SKILL.md`、一个带 manifest 的 Plugin，以及一个真实 stdio `MCP` `Server`；为只读和写入工具分别配置权限和审批。参考 [awesome-agent-skills](https://github.com/philipbankier/awesome-agent-skills)、[`MCP` Specification](https://github.com/modelcontextprotocol/specification) 和 [`MCP` `Python` `SDK`](https://github.com/modelcontextprotocol/python-sdk)。

### 10. 评测、可观测性与安全

学习离线数据集、轨迹评测、`LLM`-as-Judge、回归测试、幻觉、`Prompt` Injection、数据外泄、工具投毒、沙箱、最小权限和审计。为 `Agent` 建立 30 条固定用例，统计成功率、工具选择准确率、引用正确率、延迟、成本和安全拒答率。

### 11. 部署、性能与成本

学习模型服务、`GPU`/CPU、批处理、KV Cache、量化、缓存、队列、限流、熔断、追踪、灰度、数据保留和成本预算。把 `RAG` 或 `Agent` 部署成服务，加入健康检查、超时、重试、指标和预算上限，并压测 `p50/p95` 延迟。

## 四、6 个完整项目

| 项目 | 覆盖阶段 | 验收结果 |
| --- | --- | --- |
| Tokenizer + Mini `Transformer` | 1–3 | 能解释并复现一次训练和生成 |
| 结构化抽取 `API` | 4 | `Schema` 校验、重试、成本日志齐全 |
| 带引用的企业 `RAG` | 5 | 检索指标和引用覆盖率可复现 |
| 受限工具 `Agent` | 6–7 | 权限、超时、最大步数和轨迹完整 |
| `Skill`/Plugin/`MCP` 工作台 | 8–9 | 可安装、发现、授权、调用和卸载 |
| 生产级 `Agent` 服务 | 10–11 | 有评测集、监控、预算和恢复机制 |

## 五、`GitHub` 学习入口

- [`mlabonne/llm-course`](https://github.com/mlabonne/llm-course)：模型科学家路线。
- [`rohitg00/ai-engineering-from-scratch`](https://github.com/rohitg00/ai-engineering-from-scratch)：20 个 phase、可运行代码和 capstone。
- [`WenyuChiou/awesome-agentic-ai-zh`](https://github.com/WenyuChiou/awesome-agentic-ai-zh)：中文 `Agent` 学习地图。
- [`datawhalechina/hello-agents`](https://github.com/datawhalechina/hello-agents)：中文 `Agent` 深度教程。
- [`karpathy/micrograd`](https://github.com/karpathy/micrograd)：从零理解自动微分。
- [`karpathy/nanoGPT`](https://github.com/karpathy/nanoGPT)：从零训练小型 GPT。
- [`huggingface/course`](https://github.com/huggingface/course)：`Transformer`、数据集、微调和部署。
- [`langchain-ai/langgraph`](https://github.com/langchain-ai/langgraph)：有状态 `Agent` 图编排。
- [`modelcontextprotocol/servers`](https://github.com/modelcontextprotocol/servers)：`MCP` 参考 `Server`。

只读文章不算完成：BPE 合并、Attention 数值、采样分布、KV Cache、`RAG` 指标、工具 `Schema`、`MCP` `JSON`-`RPC`、权限策略和失败恢复都必须跑代码验证。仓库星数和协议版本会变化，接入前重新检查提交、许可证和安全模型。
