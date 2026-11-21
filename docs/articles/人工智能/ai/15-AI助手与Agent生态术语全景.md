---
title: AI 助手与 Agent 生态术语全景：从 Rule、Skill、MCP 到 Harness
date: '2026-11-21'
updated: '2026-11-21'
type: 技术
tags: AI|Agent|MCP|Skills|学习资料
note: 用分层图、调用链和对照图，看清规则、技能、工具、插件与运行时怎样配合，避免把提示约定当作执行权限。
---

<script setup>
import AiVisual from '../../../.vitepress/theme/components/AiVisual.vue'
</script>

# 15. AI 助手与 Agent 生态术语全景

这些名词不是一条“越来越高级”的升级路线。先记住一句话：**Rule 定约定，Skill 给方法，Tool 做动作，MCP 管连接，Plugin 管分发，Agent 选下一步。**

## 1. 先看全景：谁思考，谁执行？

<AiVisual title="一个编程助手的四层职责" kind="layers" :nodes="[
  { label: '用户目标 · Prompt', detail: '这次检查登录模块，只出报告，不提交代码。' },
  { label: '模型 · Model / LLM', detail: '根据当前上下文生成回答，或提出工具调用。' },
  { label: '执行框架 · Harness / Runtime', detail: '组织循环、上下文、工具、授权、状态和停止条件。' },
  { label: '工具与业务系统 · Tool', detail: '读取文件、执行测试；服务端按真实身份校验权限。' }
]" caption="职责示意，不是所有产品都采用相同分层。模型提出动作 ≠ 动作已执行或已获授权。" />

- **Assistant / Copilot（助手）** 是产品或协作角色；不一定有自主行动循环。
- **Agent（智能体）** 根据观察选择行动，再根据结果继续或停止；“自主”仍受范围、预算和授权限制。
- **Harness 与 Runtime**有重叠：前者偏整个工作系统的组织，后者偏执行状态与资源生命周期。看实际实现，不只看名称。

例如：模型说“应该运行测试”只是输出；运行时真的调用测试工具并拿到结果，才发生了执行。

## 2. Prompt、Rule、Skill：要求、约定和做法

<AiVisual title="同一次代码检查，三种信息各放哪里？" kind="compare" :nodes="[
  { label: 'Prompt · 本次要求', detail: '只检查登录模块，交付问题清单，暂时不要提交。' },
  { label: 'Rule · 长期约定', detail: '沿用现有包管理器；未运行的测试不能写成通过。' },
  { label: 'Skill · 可复用方法', detail: '先读差异，再查异常与权限，最后验证并报告证据。' }
]" caption="三者可以共同进入上下文，但用途不同；都不能代替操作系统或服务端的硬权限。" />

`Rule / Instruction` 可能有全局、项目、子目录等 **Scope（作用范围）**。冲突时按宿主的 **Precedence（优先级）** 处理。`CLAUDE.md`、`AGENTS.md`、编辑器规则目录是不同宿主的载体示例，不是处处生效的通用文件。

**Skill 不是重新训练模型。**它通常把任务步骤、验收、参考资料、模板与可选脚本组织在一起；手册写着“查询数据库”，不代表数据库工具和账号自动存在。

<AiVisual title="Skill 的渐进披露：需要时再读细节" :nodes="[
  { label: '发现', detail: '先看名称和适用描述，判断是否匹配任务。' },
  { label: '加载', detail: '需要时读取核心步骤、输入要求和停止条件。' },
  { label: '深入', detail: '进入具体环节，再读参考资料或运行已审阅脚本。' }
]" caption="Progressive Disclosure 控制上下文占用，不保证零成本、准确触发或任务一定成功。" />

**复制文件可迁移知识，不一定迁移运行能力。**跨工具迁移至少核对路径、工具接口、脚本依赖、网络权限和宿主配置。

::: details 一个 Skill 的目录示意（不是通用安装指令）
```text
review-api-contract/
  SKILL.md       适用场景、步骤、输出和验收
  references/    详细检查表、接口约定
  scripts/       可选的确定性检查脚本
  assets/        可选模板
```
`Agent Skills` 有公开格式规范，宿主支持的元数据和触发方式仍需核对。含脚本的技能要按代码审查，不能因它叫“技能”就跳过安全检查。
:::

## 3. Tool、Function Calling、MCP：动作与连接

`Tool` 是实际程序能力；`Function Calling / Tool Calling` 是模型按约定结构提出操作请求。**格式正确不等于业务上有权限。**

<AiVisual title="查询工单：一次工具调用经过什么？" :nodes="[
  { label: '定义', detail: '告诉模型工具名、用途和参数结构。' },
  { label: '请求', detail: '模型提出 get_ticket_status，参数为 T-1001。' },
  { label: '校验与执行', detail: '运行时和服务检查结构、身份、资源权限及必要审批。' },
  { label: '返回与判断', detail: '把成功或错误交回模型；不能把请求当成完成。' }
]" caption="JSON Schema 约束参数形状；一个合法工单编号仍可能不属于当前用户。" />

`MCP（Model Context Protocol）` 标准化宿主和能力服务之间的通信。不是模型、插件市场，也不替业务服务决定授权。

<AiVisual title="MCP 的连接关系：Host 内的 Client 连接 Server" :nodes="[
  { label: 'Host · 助手宿主', detail: '提供用户交互与模型环境，协调连接、上下文与授权体验。' },
  { label: 'Client · 协议客户端', detail: '在宿主侧建立、维护与目标服务器的协议连接。' },
  { label: 'Server · 能力服务', detail: '暴露能力，并适配文件、搜索或业务 API。' }
]" caption="简化连接方向，不是完整双向消息时序。连接成功不代表支持或自动使用所有能力。" />

| 服务可提供的能力 | 用途 | 例子 |
| --- | --- | --- |
| Tools | 可调用操作 | 查询工单状态 |
| Resources | 可读取内容或数据引用 | 接口文档 |
| Prompts | 参数化提示模板 | 指定服务的排障模板 |

**别混淆：**API 是广义程序接口；MCP Server 可以调用业务 API；RAG 是“检索证据再生成”的方法，可以使用 MCP，也可以完全不用。Skill 则描述如何使用这些能力完成任务。

本地 `stdio` 与远程 `Streamable HTTP` 都有信任边界：前者注意文件、环境变量与进程权限，后者注意认证、授权、网络与 token。具体传输与能力支持按当前版本核对。

## 4. Plugin、Command、Hook：装什么、怎么启动、何时触发

<AiVisual title="一个审查扩展包，可能同时装着这些东西" kind="layers" :nodes="[
  { label: 'Plugin / Extension · 分发', detail: '宿主定义的安装单元，可包含技能、连接配置、命令或钩子。' },
  { label: 'Command · 用户入口', detail: '用户输入 /review；背后可以是技能、内置功能或工作流。' },
  { label: 'Skill · 任务方法', detail: '规定本次检查顺序、证据要求与验收方式。' },
  { label: 'Hook · 事件处理', detail: '在宿主定义的工具前后等事件点运行检查或记录逻辑。' }
]" caption="这里表示可能的包装与职责关系，不是所有插件都有这些内容，也不是四个同义词。" />

- 安装和升级是**信任决定**：检查实际代码、启动命令、依赖、网络目标及新增权限，不只看市场描述。
- “每次都检查”写进提示只是约定；可靠事件触发应配置宿主支持的 Hook 或中间件，并测试失败、超时和异常退出路径。
- Hook 能否阻断动作由宿主决定；无论模型怎么做都必须禁止的操作，应放到服务端或系统权限层。

## 5. Agent、Workflow、Subagent：谁选下一步？

<AiVisual title="按控制流区分，而不是按角色名字区分" kind="compare" :nodes="[
  { label: 'Workflow · 预设流程', detail: '程序安排读取、检查、测试、报告，可以在步骤中调用模型。' },
  { label: 'Agent · 反馈决策', detail: '模型根据观察选择下一步；运行时限制预算、工具和停止条件。' },
  { label: 'Subagent · 子任务代理', detail: '接收明确范围与交付要求，独立处理后返回结果供核对。' }
]" caption="工作流可以包含 Agent；子代理也可以串行运行，且不天然更专业或更可靠。" />

`Multi-agent` 是多个代理参与；`Handoff` 是交接任务或处理权；`Orchestration` 负责依赖、并发、路由、重试与汇总。只有任务可独立拆分、交接契约明确时，才值得增加协作层。

**反例：**三个角色都读同一份材料、互相重复总结，不等于三倍质量。应与单代理基线比较成功率、证据丢失、耗时和总成本。

## 6. Context、Memory、RAG：信息怎么进入当前推理？

<AiVisual title="存在磁盘上 ≠ 当前模型已经看见" kind="compare" :nodes="[
  { label: 'Context · 当前上下文', detail: '本次推理实际可见的指令、历史、工具说明和证据。' },
  { label: 'Memory · 持久记忆', detail: '会话外保存的信息；以后需要被选择并读入才可能起作用。' },
  { label: 'RAG · 按问题取证', detail: '检索相关资料再生成；仍需检查权限、版本和引用支持。' }
]" caption="记忆不是修改权重，检索不是事实保证，账目与审批状态应存入权威业务系统。" />

`Context Window` 是输入容量，不是理解保证；`Context Engineering` 是选择、排序、检索与更新信息；`Compaction` 是压缩较早历史，可能丢失细节，不能替代完整审计记录。

## 7. 其他常见词：查到就知道在检查什么

| 术语 | 一句话解释与边界 |
| --- | --- |
| SDK / Framework | 前者提供编程接口，后者提供应用抽象；API SDK 不自动附送完整代理环境。 |
| Sandbox | 限制文件、网络、进程、凭据与资源等实际执行范围。 |
| Guardrail | 输入、输出或执行检查；一个模型判断器不是完整权限系统。 |
| Permission / Approval | 可执行范围 / 本次动作确认；允许查资料不等于允许外发。 |
| Eval / Trace | 系统评测 / 执行轨迹；评测需独立样本，日志避免记录密钥与隐私。 |
| Checkpoint / Resume | 保存状态并恢复；恢复不能重复产生已完成的业务副作用。 |
| Human-in-the-loop | 关键步骤由人工审阅或批准；要明确阻塞、拒绝与超时行为。 |
| Structured Output | 约束输出结构；结构正确不等于事实正确。 |
| A2A | Agent2Agent 等代理间通信协议；与 MCP 工具接入用途不同，不应画等号。 |

## 8. 串起来：检查登录模块，但不要提交

**Prompt 定范围 → Rule 提供项目约定 → Skill 给检查方法 → Harness 组织执行 → Tool 读差异、跑测试 → Trace 留证 → 报告结果。**

如需读已授权工单，可以经 MCP；有独立复核任务才考虑 Subagent；团队统一安装可用 Plugin；`/review` 是 Command 入口。**所有这些都不改变“不提交”的边界。**

::: details 自测：接好 MCP 就有 Agent？Skill 要求测试就保证测试？
都不是。MCP 提供连接能力，Agent 仍需要目标、循环与停止条件。Skill 是任务指导，测试是否完成要看实际执行与结果，不能只看手册要求或代理自述。
:::

::: details 自测：规则文件就是 Memory？子代理说通过就能直接照写？
规则描述约定，记忆保存信息；即便都是文件，加载范围与优先级也不同。子代理总结还需核对任务、记录和覆盖范围；未运行、失败、未返回必须分别说明。
:::

**练习：**画出自己的助手：规则在哪里、方法怎么加载、工具在哪里执行、谁授权、何时停止。不确定的节点写“未知”，不要按别的产品猜测。

## 9. 官方资料与时效说明

整理日期：`2026-11-21`。本次访问下列官方网页受到网络限制，**未成功获取正文**；这些是进一步核对入口，不是已逐页验证的版本依据。具体格式、传输与能力按目标宿主当前文档核对。

::: details 官方入口：实现或安装前再查
- [MCP 架构](https://modelcontextprotocol.io/docs/learn/architecture)与[规范](https://modelcontextprotocol.io/specification/)：角色、传输、生命周期和授权。
- [Agent Skills 概念](https://agentskills.io/what-are-skills)与[格式规范](https://agentskills.io/specification)：目录与渐进披露。
- [Claude Code 扩展概览](https://code.claude.com/docs/en/features-overview)：一个具体宿主的技能、子代理、钩子与插件。
- [Codex AGENTS.md](https://developers.openai.com/codex/guides/agents-md)：该宿主的指令发现与作用范围，不可套用到所有产品。
- [Agent2Agent 官方项目](https://github.com/a2aproject/A2A)：代理间通信的目标与支持状态。
:::

继续阅读：[06 执行循环](./06-Agent与工具调用.md) · [12 接入与信任边界](./12-Agent扩展生态知识图谱.md) · [09 评估安全](./09-评估安全与治理.md)。
