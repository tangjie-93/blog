---
title: Agent 与工具调用
date: '2026-10-17'
updated: '2026-11-20'
type: 技术
tags: AI|Agent
note: 用受限工具循环连接知识问答与业务动作，动手验证授权、人工确认、幂等和停止条件。
---

<script setup>
import AiConcept from '../../../.vitepress/theme/components/AiConcept.vue'
</script>

# 06. `Agent` 与工具调用

## 1、直觉：会提建议，不代表有执行权

前两篇的团队知识助手已经能回答“上海住宿上限 500 元/晚，报销需主管审批”，并给出制度证据。
同事进一步问：“查一下我的单据状态；如果材料不全，帮我生成一份补交申请草稿。”
现在不只需要读文档，还要在观察业务状态后决定下一步。**Agent 是带工具与反馈的受限决策循环。**

模型像提出行动建议的助理，应用程序像掌管钥匙的执行员；助理说“可以发邮件”不构成发信授权。
工具调用不是模型亲自执行代码，而是输出结构化请求，由宿主校验、执行并返回结果。

<AiConcept mode="agent" />

观察可能来自检索、数据库或前一次工具错误；停止可以是完成，也可以是预算耗尽、等待审批或不可恢复失败。
“没有继续调用工具”不自动等于业务目标完成，最后还要检查任务验收条件。

## 2、输入输出：比一问一答多了状态

| 对象 | 本案例内容 | 谁负责 |
| --- | --- | --- |
| 用户目标 | 查状态，必要时生成补交草稿 | 用户给目标，应用明确歧义 |
| 执行上下文 | 用户、租户、单据范围、预算、审批记录 | 服务端建立，不采信模型自报 |
| 工具定义 | 名称、描述、参数 schema、读写等级 | 开发者定义并维护 |
| 调用提案 | `call_id`、工具名、参数 | 模型提出，应用重新校验 |
| 观察结果 | 成功/失败、结构化数据、来源、错误码 | 工具返回，应用脱敏和限长 |
| 结束结果 | 完成/部分/待审批/超限、已发生动作 | 应用核对，模型组织说明 |

工具结果必须用对应调用 ID 回写给模型，避免把第一个工具的错误当成第二个工具的成功。
具体消息字段由 API 决定：例如 Responses API 用 `call_id` 关联 `function_call_output`，不是所有接口都长这样。
多工具并发还需要处理结果顺序与依赖；两个都写同一单据的调用不能因为“同时提出”就无条件并行。

## 3、核心机制：提案、检查、执行、观察

### 3.1 一轮不是一句“继续”

```text
读取状态 → 调模型 → 收到调用提案
                    ↓
              解析与参数校验
                    ↓
         身份/资源/预算/审批检查
                    ↓
       执行工具 → 记录真实结果 → 回写观察
                    ↓
             验收完成或进入下一轮
```

模型看到的上下文是状态的一种视图，不是业务数据库本身；余额、单据状态和授权要在执行时重新读取。
对于先查后写的操作，还应检查资源版本，避免查询后状态已经变化，却继续按旧计划修改。

### 3.2 工具契约要窄，不要直接暴露万能执行器

例如 `get_expense_status(expense_id)` 只查询已授权单据；`create_supplement_draft(expense_id, note)` 只建草稿。
不要为了省事暴露 `run_sql(sql)` 或任意 Shell，再指望提示词保证不执行危险操作。

| 契约字段 | 具体要求 |
| --- | --- |
| 参数 | 必填项、类型、枚举、长度、未知字段拒绝 |
| 资源范围 | 单据归属、租户、路径或域名白名单 |
| 副作用 | 只读、写草稿、发信、付款分开定义 |
| 结果 | 明确 `ok/error`、错误码、数据版本与结果大小 |
| 运行约束 | 超时、重试上限、幂等策略、审计与取消 |

JSON Schema 或严格结构化输出能减少参数格式错误，不能证明用户有权操作，也不能保证业务意图正确。
解析后仍需服务端校验；金额、身份与授权范围不能从模型生成的自然语言里“相信着取”。

### 3.3 手推一段轨迹，分清三种停止

| 步 | 模型提案 | 程序检查 / 观察 | 应报告的状态 |
| --- | --- | --- | --- |
| 1 | 查询单据 A | 属于当前用户，返回“缺发票” | 继续 |
| 2 | 建补交草稿 | 展示单据、草稿正文，等待确认 | `pending_approval`，不是完成 |
| 3 | 用户确认后建草稿 | 授权仍有效，返回草稿 D | 草稿完成，但没有发送 |
| 4 | 重复建同一草稿 | 同一业务操作键命中已有结果 | 返回 D，不新增副作用 |
| 其他 | 查询别人的单据 B | 资源鉴权失败 | `denied`，不能换工具绕过 |

确认必须绑定实际目标、操作、参数和有效期；“允许帮我处理报销”不是对所有未来写操作的永久授权。
执行后返回“草稿已创建，未发送”，不能把中间产物夸大成“补交申请已提交”。

## 4、连贯案例：RAG 是工具，不是整个 Agent

制度问题走上一章的 `search_policy`；个人单据状态走业务查询；写草稿走受控写工具。
检索给出的“主管审批”只解释规则，不能让助手冒充主管批准报销。
若流程总是“查状态 → 按固定条件建草稿”，普通确定性工作流可能比 Agent 更简单可靠。
当用户会追加条件、需要不同资料源、失败后选择其他只读查询时，才值得让模型动态选路。

记忆也要分层：对话历史用于理解“那一张”，任务状态保存已查单据与待审批动作，长期偏好另设授权与删除策略。
压缩历史可以丢掉重复措辞，不能丢掉“未发送”、审批绑定参数和工具真实错误。
状态快照与业务动作记录要可恢复；不能只靠模型的一句“我记得已经完成”。

## 5、零依赖实验：把危险边界跑出来

保存为临时目录的 `agent_lab.py`，执行 `python3 agent_lab.py`，不需要 API key。
下面用预置提案代替模型，用内存列表代替草稿服务；只验证执行边界，不证明模型会自主规划或抵抗注入。
为了突出授权、审批、幂等与步数，演示把状态查询简化为制度检索，草稿不关联真实单据。

```python
from hashlib import sha256
import json

CTX = {"user": "u1", "tenant": "team", "request": "req-001",
       "can_write": True}  # 服务端上下文，不由模型参数提供。
DRAFTS, CACHE = [], {}
APPROVED = set()

def operation_key(title, ctx):
    payload = [ctx["tenant"], ctx["user"], ctx["request"], "draft", title]
    return sha256(json.dumps(payload, ensure_ascii=False).encode()).hexdigest()

def dispatch(name, args, ctx):
    fields = {"search_policy": "query", "create_draft": "title"}
    if name not in fields:
        return {"status": "denied", "reason": "unknown_tool"}
    field = fields[name]
    if (not isinstance(args, dict) or set(args) != {field}
            or not isinstance(args[field], str)
            or not 1 <= len(args[field].strip()) <= 80):
        return {"status": "invalid_arguments"}
    if ctx["tenant"] != "team":
        return {"status": "denied", "reason": "resource_scope"}
    if name == "search_policy":
        return {"status": "ok", "data": "上海住宿500元/晚；需主管审批"}
    if not ctx["can_write"]:
        return {"status": "denied", "reason": "write_not_allowed"}
    title = args[field]
    key = operation_key(title, ctx)
    if key not in APPROVED:
        return {"status": "pending_approval", "preview": title, "key": key}
    if key in CACHE:
        return CACHE[key]
    # 单进程教学实现；生产需原子幂等记录与业务写入的协调机制。
    draft = {"id": f"D{len(DRAFTS)+1}", "title": title, "sent": False}
    DRAFTS.append(draft)
    CACHE[key] = {"status": "ok", "draft": draft}
    return CACHE[key]

def run(proposals, ctx, max_steps=4):
    trace = []
    for step, (name, args) in enumerate(proposals, 1):
        if step > max_steps:
            return "budget_exhausted", trace
        result = dispatch(name, args, ctx)
        trace.append({"step": step, "tool": name, "result": result})
        if result["status"] != "ok":
            return result["status"], trace
    done = any("draft" in event["result"] for event in trace)
    return ("draft_created" if done else "partial"), trace

plan = [("search_policy", {"query": "上海住宿制度"}),
        ("create_draft", {"title": "补交发票草稿"}),
        ("create_draft", {"title": "补交发票草稿"})]
status, trace = run(plan, CTX)
print("首次：", status)
assert status == "pending_approval" and not DRAFTS
# 模拟用户在独立确认界面接受这份预览；不是模型给自己授权。
APPROVED.add(trace[-1]["result"]["key"])
status, trace = run(plan, CTX)
print("确认后：", status, "草稿数：", len(DRAFTS), DRAFTS)
assert status == "draft_created" and len(DRAFTS) == 1
assert run(plan, {**CTX, "can_write": False})[0] == "denied"
assert run(plan, {**CTX, "tenant": "other"})[0] == "denied"
assert run(plan, CTX, max_steps=1)[0] == "budget_exhausted"
assert dispatch("create_draft", {"title": "x", "admin": True}, CTX)["status"] == "invalid_arguments"
assert dispatch("send_email", {}, CTX)["status"] == "denied"
assert dispatch("create_draft", {"title": "另一份草稿"}, CTX)["status"] == "pending_approval"
print("全部边界断言通过")
```

预期先输出 `pending_approval`，确认后为 `draft_created`，草稿数始终为 1，且 `sent=False`。
改变标题会改变操作键，需要重新确认；撤销写权限后，即便过去批过，也先被权限检查拦住。
这里重新跑完整计划是演示重放，不是持久化恢复实现；重启进程会丢失审批、缓存和草稿。

接入真实模型时，把 `plan` 替换为“模型响应 → 提取调用 → dispatch → 按调用 ID 回写 → 再请求”的循环。
审批记录需可信持久化、可撤销、有期限；幂等键需绑定业务操作，不可仅用每次都变化的模型调用 ID。

## 6、工程取舍与失败诊断

工具超时有两种情况：“没有执行”与“已执行但响应丢了”。写操作遇到第二种时盲目重试可能重复发信或付款。
生产应查询操作状态或使用服务端幂等机制；内存字典无法解决并发、进程崩溃和跨系统事务。
对可重试的短暂错误采用有上限的退避与抖动，并把重试计入整次任务时间/成本预算。

| 故障现象 | 查什么 | 应对而非掩盖 |
| --- | --- | --- |
| 一直查同一问题 | 工具名、规范化参数、结果是否变化 | 检测无进展；设步数与总时限 |
| “已发送”但工具超时 | 外部操作 ID、实际业务状态 | 标为未知，查状态后再报告 |
| 有效 JSON 却越权 | 服务端身份与资源鉴权 | 执行前拒绝，不靠提示词 |
| 审批后参数变了 | 审批摘要与待执行载荷 | 失效并重新确认 |
| 两次调用建了两份草稿 | 幂等记录与写入是否原子协调 | 持久幂等与唯一约束 |
| 模型说完成，实际只有草稿 | 业务验收条件与工具返回 | 返回部分完成，不伪造提交 |

网页、PDF 和工具结果都可能带间接提示注入。隔离数据与指令能减少混淆，但不是可靠的唯一安全边界。
工具白名单、网络出口限制、路径约束、最小权限与高风险人工确认要在执行层落实。
测试注入时应观察实际提案和拒绝记录；“模拟模型没选危险工具”不能作为抗注入证据。

`MCP` 统一工具发现、描述与调用协议，不会自动替你完成业务授权、服务信任或用户审批。
外部服务自称“只读”也不能无条件信任；工具描述和注解需要验证来源与真实行为。
多 Agent 进一步增加上下文交接、并发写冲突和成本；先把单循环测清楚，再判断是否需要拆分。

## 7、评估、练习与带答案自测

评估不能只看最后一句话。每条样例保存目标、期望操作、禁止操作、工具轨迹、实际副作用和停止原因。
分别统计任务完成、参数正确、越权拦截、重复副作用、错误报告、延迟与成本；不要让安全失败被平均分掩盖。
日志保留 `run_id`、调用 ID、策略版本、审批和业务操作 ID；敏感参数脱敏，不必索取或记录模型隐藏思维链。

- **入门**：把“查制度、查单据、建草稿、发送申请”分成读写等级，写出每步验收条件。
- **实践**：运行脚本，增加工具异常与重复只读调用；要求明确错误状态，并在预算结束时停止。
- **工程**：用测试业务服务模拟“写成功但响应丢失”，恢复后不得重复写；再做审批过期和资源版本变化测试。

**问 1：`strict` 参数校验能代替权限吗？** 答：不能；结构正确与是否有权是不同维度。

**问 2：为什么先查权限，再查过去的幂等结果？** 答：旧审批或旧结果不应绕过当前授权，权限撤销仍要生效。

**问 3：所有超时都可以重试吗？** 答：不能；副作用可能已发生，应查询状态或依赖幂等保证，且有总预算。

**问 4：草稿建好等于任务完成吗？** 答：只满足“建草稿”；若目标是发送或提交，还欠独立确认、执行与成功证据。

继续深入可读 [Agent 专题](../agent/)、[权限与确认](../agent/03、Permission%20—%20执行前做权限判断.md)、[安全边界](../agent/23、Agent%20Security%20—%20从提示注入到沙箱隔离.md)。

## 8、一手资料与核对边界

检索/核对日期：**2026-11-20**。已在线搜索并尝试 WebFetch，但安全校验失败，直接 HTTP 也未完整取回下列正文。
以下仅按官方页面或原论文的**搜索摘要核对**，未全文核验；不援引性能数字，不承诺协议或 SDK 的未来行为。

1. [OpenAI 官方 Function calling](https://developers.openai.com/api/docs/guides/function-calling)：核对应用执行工具、回写结果、`call_id` 和严格 schema 的职责；本文实验不依赖此 API。
2. [MCP 官方 Tools 规范，2025-06-18 固定版](https://modelcontextprotocol.io/specification/2025-06-18/server/tools)：核对 `inputSchema`、输入校验与敏感操作确认建议；搜索命中来自官方仓库对应规范。
3. [ReAct 原论文](https://arxiv.org/abs/2210.03629)：核对推理与行动交替的研究背景；生产中的授权、幂等和恢复并非该思想自动提供的功能。

到这里，知识助手的三层责任清楚了：数据工程保证资产可追溯，RAG 组织可验证证据，Agent 在授权边界内选择并执行行动。
