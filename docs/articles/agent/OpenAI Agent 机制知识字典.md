---
title: "Agent 架构全景：20 章核心机制回顾"
date: "2026-10-14"
type: "技术"
tags: "Agent|OpenAI"
note: "从 Agent Loop 到综合系统，查阅 20 个章节的核心机制与代码。"
---

<script setup>
import { withBase } from 'vitepress'
</script>

# `Agent` 架构全景：20 章核心机制回顾

本文回顾前 `20` 章的核心机制，串联从最小执行循环到完整 `Agent` 系统的学习路径。每一节包含机制简介、核心代码和查阅提示，帮助你把分散的知识点整理成完整的架构视图；代码以各章的 `OpenAI` 实现为例。

> 说明：核心代码片段保留关键结构，省略部分重复的 `schema`、异常处理和打印逻辑。完整实现请查看每章的 `code_openai.py`。

## 1、A. 快速索引

| 章节 | 知识点 | 一句话理解 | 源码 |
| --- | --- | --- | --- |
| `s01` | `Agent Loop` | 一个能调用工具并把结果喂回模型的循环，就是最小可用 `Agent`。 | <a :href="withBase('/agent-examples/s01_agent_loop/code_openai.py')" download><code>s01_agent_loop/code_openai.py</code></a> |
| `s02` | `Tool Use` | 工具能力通过 `TOOLS` 声明，通过 `call_tool()` 统一分发执行。 | <a :href="withBase('/agent-examples/s02_tool_use/code_openai.py')" download><code>s02_tool_use/code_openai.py</code></a> |
| `s03` | `Permission` | 工具执行前加权限判断，把危险动作挡在执行入口外。 | <a :href="withBase('/agent-examples/s03_permission/code_openai.py')" download><code>s03_permission/code_openai.py</code></a> |
| `s04` | `Hooks` | 横切逻辑挂到生命周期事件上，不污染主循环。 | <a :href="withBase('/agent-examples/s04_hooks/code_openai.py')" download><code>s04_hooks/code_openai.py</code></a> |
| `s05` | `TodoWrite` | 长任务需要显式计划，`todo_write` 让模型把计划变成可观察状态。 | <a :href="withBase('/agent-examples/s05_todo_write/code_openai.py')" download><code>s05_todo_write/code_openai.py</code></a> |
| `s06` | `Subagent` | 大任务拆成子任务，每个子任务拿干净上下文单独跑。 | <a :href="withBase('/agent-examples/s06_subagent/code_openai.py')" download><code>s06_subagent/code_openai.py</code></a> |
| `s07` | `Skill Loading` | 技能按需加载，避免一开始把所有知识塞进上下文。 | <a :href="withBase('/agent-examples/s07_skill_loading/code_openai.py')" download><code>s07_skill_loading/code_openai.py</code></a> |
| `s08` | `Context Compact` | 上下文快满时主动压缩历史，保留继续工作的必要信息。 | <a :href="withBase('/agent-examples/s08_context_compact/code_openai.py')" download><code>s08_context_compact/code_openai.py</code></a> |
| `s09` | `Memory` | 长期信息写入持久记忆，避免压缩时丢失关键事实。 | <a :href="withBase('/agent-examples/s09_memory/code_openai.py')" download><code>s09_memory/code_openai.py</code></a> |
| `s10` | `System Prompt` | `System Prompt` 运行时组装，来自策略、上下文和工具能力。 | <a :href="withBase('/agent-examples/s10_system_prompt/code_openai.py')" download><code>s10_system_prompt/code_openai.py</code></a> |
| `s11` | `Error Recovery` | 错误不是结束，而是分类、退避、压缩、重试的开始。 | <a :href="withBase('/agent-examples/s11_error_recovery/code_openai.py')" download><code>s11_error_recovery/code_openai.py</code></a> |
| `s12` | `Task System` | 大目标拆成持久化任务，每个任务有状态、依赖和归属。 | <a :href="withBase('/agent-examples/s12_task_system/code_openai.py')" download><code>s12_task_system/code_openai.py</code></a> |
| `s13` | `Background Tasks` | 慢工具放后台执行，主循环继续响应用户和收集结果。 | <a :href="withBase('/agent-examples/s13_background_tasks/code_openai.py')" download><code>s13_background_tasks/code_openai.py</code></a> |
| `s14` | `Cron Scheduler` | 定时规则生产任务，让周期性工作由系统触发。 | <a :href="withBase('/agent-examples/s14_cron_scheduler/code_openai.py')" download><code>s14_cron_scheduler/code_openai.py</code></a> |
| `s15` | `Agent Teams` | 多个 `Agent` 通过消息总线协作，而不是挤在一个上下文里。 | <a :href="withBase('/agent-examples/s15_agent_teams/code_openai.py')" download><code>s15_agent_teams/code_openai.py</code></a> |
| `s16` | `Team Protocols` | 团队协作需要请求、计划、审查、关闭等明确协议。 | <a :href="withBase('/agent-examples/s16_team_protocols/code_openai.py')" download><code>s16_team_protocols/code_openai.py</code></a> |
| `s17` | `Autonomous Agents` | 队友可以自己扫描任务、认领任务、推进工作。 | <a :href="withBase('/agent-examples/s17_autonomous_agents/code_openai.py')" download><code>s17_autonomous_agents/code_openai.py</code></a> |
| `s18` | `Worktree Isolation` | 并行工作需要文件系统隔离，避免多个 `Agent` 改同一份工作区。 | <a :href="withBase('/agent-examples/s18_worktree_isolation/code_openai.py')" download><code>s18_worktree_isolation/code_openai.py</code></a> |
| `s19` | `MCP Tools` | 外部服务通过标准协议暴露成可发现、可调用的工具。 | <a :href="withBase('/agent-examples/s19_mcp_plugin/code_openai.py')" download><code>s19_mcp_plugin/code_openai.py</code></a> |
| `s20` | `Comprehensive Agent` | 把前面所有机制收束回一个完整的 `Agent Loop`。 | <a :href="withBase('/agent-examples/s20_comprehensive/code_openai.py')" download><code>s20_comprehensive/code_openai.py</code></a> |

## 2、B. 能力分层索引

| 能力层 | 包含章节 | 适合查什么 |
| --- | --- | --- |
| `Tools & Execution` | `s01`、`s02`、`s03`、`s04` | 工具调用、工具分发、权限、生命周期钩子 |
| `Planning & Control` | `s05`、`s06`、`s07`、`s10`、`s11` | 计划、子代理、技能加载、提示词组装、错误恢复 |
| `Memory Management` | `s08`、`s09` | 上下文压缩、工具结果裁剪、长期记忆 |
| `Concurrency & Scheduling` | `s13`、`s14` | 后台任务、定时任务、异步结果回收 |
| `Multi-Agent Platform` | `s12`、`s15`、`s16`、`s17`、`s18`、`s19`、`s20` | 任务系统、团队协作、协议、自治、工作区隔离、`MCP`、总装 |

---

## 1. s01: `Agent Loop`

### 3.1 `1.1` 简介

`s01` 展示最小可用 `AI Coding Agent` 的 `OpenAI Responses API` 版本。它只有一个 `bash` 工具，但已经具备完整闭环：用户提问、模型返回 `function_call`、程序执行工具、把 `function_call_output` 放回消息历史，然后继续让模型推理。

### 3.2 `1.2` 核心机制

- `TOOLS` 告诉模型可以调用哪些工具。
- `agent_loop()` 负责持续调用模型。
- 当 `response.output` 中存在 `function_call` 时，程序执行工具。
- 工具结果以 `function_call_output` 形式追加为下一轮 `user` 消息。
- 当模型不再调用工具时，循环结束。

### 3.3 `1.3` 核心代码

```python
TOOLS = [{
    "type": "function",
    "name": "bash",
    "description": "Run a shell command.",
    "parameters": {
        "type": "object",
        "properties": {"command": {"type": "string"}},
        "required": ["command"],
        "additionalProperties": False,
    },
    "strict": True,
}]

def agent_loop(messages: list):
    while True:
        response = client.responses.create(
            model=MODEL,
            instructions=SYSTEM,
            input=messages,
            tools=TOOLS,
            max_output_tokens=8000,
        )

        messages.extend(as_input_item(item) for item in response.output)

        tool_calls = [
            item
            for item in response.output
            if getattr(item, "type", None) == "function_call"
        ]
        if not tool_calls:
            return response

        for call in tool_calls:
            args = parse_arguments(call.arguments)
            output = run_bash(args.get("command", ""))
            messages.append({
                "type": "function_call_output",
                "call_id": call.call_id,
                "output": output,
            })
```

### 3.4 `1.4` 查阅提示

不懂 `Agent Loop`、`function_call`、`function_call_output`、消息历史如何闭环时，先看这一章。

---

## 2. s02: `Tool` Use

### 4.1 `2.1` 简介

`s02` 从单个 `bash` 工具扩展到多个工具。`OpenAI` 版把工具声明交给 `TOOLS`，把执行逻辑收束到 `call_tool()`。主循环仍然稳定，只把“怎么执行工具”从硬编码改成统一分发函数。

### 4.2 `2.2` 核心机制

- `TOOLS` 是给模型看的工具声明。
- `function_tool()` 生成 `OpenAI Responses API` 需要的工具定义。
- `call_tool()` 是给程序用的工具执行入口。
- `agent_loop()` 从 `response.output` 找出 `function_call`，执行后追加 `function_call_output`。

### 4.3 `2.3` 核心代码

```python
def function_tool(name: str, description: str,
                  properties: dict, required: list[str]) -> dict:
    return {
        "type": "function",
        "name": name,
        "description": description,
        "parameters": {
            "type": "object",
            "properties": properties,
            "required": required,
            "additionalProperties": False,
        },
        "strict": True,
    }

def call_tool(name: str, args: dict) -> str:
    if name == "bash":
        return run_bash(args.get("command", ""))
    if name == "read_file":
        return run_read(args.get("path", ""), args.get("limit"))
    if name == "write_file":
        return run_write(args.get("path", ""), args.get("content", ""))
    if name == "edit_file":
        return run_edit(args.get("path", ""), args.get("old_text", ""),
                        args.get("new_text", ""))
    if name == "glob":
        return run_glob(args.get("pattern", ""))
    return f"Unknown tool: {name}"

for call in tool_calls:
    args = parse_arguments(call.arguments)
    output = call_tool(call.name, args)
    messages.append({
        "type": "function_call_output",
        "call_id": call.call_id,
        "output": output,
    })
```

### 4.4 `2.4` 查阅提示

想理解“加一个新工具要改哪里”时，看 `TOOLS`、`TOOL_HANDLERS` 和 `agent_loop()` 里的分发逻辑。

---

## 3. s03: Permission

### 5.1 `3.1` 简介

`s03` 在工具执行前增加权限判断。工具能力越强，误操作风险越大，所以工具执行入口必须有一个统一的权限闸门。

### 5.2 `3.2` 核心机制

- `check_deny_list()` 先拦截明确危险命令。
- `check_rules()` 根据工具名和输入判断是否需要用户确认。
- `ask_user()` 把决策权交给人。
- `check_permission()` 是工具执行前的统一入口。

### 5.3 `3.3` 核心代码

```python
def check_permission(block) -> bool:
    if block.name == "bash":
        reason = check_deny_list(call_args(block).get("command", ""))
        if reason:
            return False

    reason = check_rules(block.name, call_args(block))
    if reason:
        decision = ask_user(block.name, call_args(block), reason)
        if decision == "deny":
            return False

    return True

for block in function_calls(response):
    if not check_permission(block):
        output = "Permission denied"
    else:
        output = TOOL_HANDLERS[block.name](**call_args(block))
    messages.append({
        "type": "function_call_output",
        "call_id": block.call_id,
        "output": output,
    })
```

### 5.4 `3.4` 查阅提示

不懂为什么 `Agent` 不能直接执行所有命令时，看这一章。重点看“执行前统一拦截”。

---

## 4. s04: Hooks

### 6.1 `4.1` 简介

`s04` 引入 `Hooks`。权限检查、日志、输出裁剪、上下文注入都属于横切逻辑，如果全部写进 `agent_loop()`，主循环会很快变乱。`Hooks` 的作用是把这些逻辑挂在生命周期事件上。

### 6.2 `4.2` 核心机制

- `HOOKS` 是事件到回调列表的注册表。
- `register_hook()` 添加回调。
- `trigger_hooks()` 在关键时刻触发回调。
- 主循环只保留关键调用点，不关心每个钩子的内部实现。

### 6.3 `4.3` 核心代码

```python
HOOKS = {
    "UserPromptSubmit": [],
    "PreToolUse": [],
    "PostToolUse": [],
    "Stop": [],
}

def register_hook(event: str, callback):
    HOOKS[event].append(callback)

def trigger_hooks(event: str, context: dict):
    for callback in HOOKS[event]:
        callback(context)

trigger_hooks("PreToolUse", {"block": block})
output = TOOL_HANDLERS[block.name](**call_args(block))
trigger_hooks("PostToolUse", {"block": block, "output": output})
```

### 6.4 `4.4` 查阅提示

如果某个功能“每次工具调用前后都要做”，但不属于工具本身，就应该想到 `Hooks`。

---

## 5. s05: `TodoWrite`

### 7.1 `5.1` 简介

`s05` 增加 `todo_write` 工具，让模型把计划写成结构化状态。这样用户可以看到当前任务列表，`Agent` 也能减少长任务中途跑偏的概率。

### 7.2 `5.2` 核心机制

- `CURRENT_TODOS` 保存当前计划。
- `_normalize_todos()` 规范化模型传入的待办项。
- `run_todo_write()` 更新计划并返回可读摘要。
- `todo_write` 是一个普通工具，但它改变的是 `Agent` 的工作状态。

### 7.3 `5.3` 核心代码

```python
CURRENT_TODOS: list[dict] = []

def _normalize_todos(todos: list[dict]) -> list[dict]:
    normalized = []
    for item in todos:
        normalized.append({
            "content": item.get("content", ""),
            "status": item.get("status", "pending"),
        })
    return normalized

def run_todo_write(todos: list[dict]) -> str:
    global CURRENT_TODOS
    CURRENT_TODOS = _normalize_todos(todos)
    return "\n".join(
        f"- [{todo['status']}] {todo['content']}"
        for todo in CURRENT_TODOS
    )
```

### 7.4 `5.4` 查阅提示

当你想让 `Agent` 做复杂任务时先列计划、执行中更新状态，查这一章。

---

## 6. s06: Subagent

### 8.1 `6.1` 简介

`s06` 引入 `Subagent`。主 `Agent` 可以把一个子问题交给子代理，子代理拿到干净的消息历史和有限工具集，完成后只把结果返回主线程。

### 8.2 `6.2` 核心机制

- `BASE_TOOLS` 是主代理可用的基础工具。
- `SUB_TOOLS` 是子代理可用的工具子集。
- `spawn_subagent()` 创建独立消息历史。
- 子代理内部仍然跑同样的 `Agent Loop` 思想。

### 8.3 `6.3` 核心代码

```python
def spawn_subagent(description: str) -> str:
    sub_messages = [{
        "role": "user",
        "content": description,
    }]

    while True:
        response = create_response(
            instructions=SUBAGENT_SYSTEM,
            input=sub_messages,
            tools=SUB_TOOLS,
        )
        sub_messages.extend(as_input_item(item) for item in response.output)

        fcs = function_calls(response)
        if not fcs:
            return extract_text(response.output)

        results = []
        for block in fcs:
            if block.type == "function_call":
                output = TOOL_HANDLERS[block.name](**call_args(block))
                results.append({
                    "type": "function_call_output",
                    "call_id": block.call_id,
                    "output": output,
                })
        sub_messages.extend(results)
```

### 8.4 `6.4` 查阅提示

不懂“为什么子任务不直接塞进主上下文”时，看这一章。核心是上下文隔离。

---

## 7. s07: `Skill` Loading

### 9.1 `7.1` 简介

`s07` 让 `Agent` 可以按需加载技能。技能不是一开始全塞进 `System Prompt`，而是先扫描元信息，等模型需要某个技能时再通过 `load_skill` 读取完整内容。

### 9.2 `7.2` 核心机制

- `_parse_frontmatter()` 读取技能文件头部元数据。
- `_scan_skills()` 扫描本地 `skills` 目录。
- `list_skills()` 给模型提供可用技能摘要。
- `load_skill()` 把指定技能全文加载进上下文。
- `build_system()` 把技能列表加入系统提示词。

### 9.3 `7.3` 核心代码

```python
def _parse_frontmatter(text: str) -> tuple[dict, str]:
    if not text.startswith("---"):
        return {}, text
    _, fm, body = text.split("---", 2)
    meta = yaml.safe_load(fm) or {}
    return meta, body.strip()

def list_skills() -> str:
    skills = _scan_skills()
    return "\n".join(
        f"- {skill['name']}: {skill['description']}"
        for skill in skills
    )

def load_skill(name: str) -> str:
    skill = SKILL_INDEX.get(name)
    if not skill:
        return f"Skill not found: {name}"
    return skill["path"].read_text()
```

### 9.4 `7.4` 查阅提示

想理解 `Codex` 或 `Claude Code` 这类系统为什么会“按需加载能力说明”，看这一章。

---

## 8. s08: `Context Compact`

### 10.1 `8.1` 简介

`s08` 处理上下文过长的问题。工具结果、长对话和重复历史会撑爆上下文窗口，所以系统要能裁剪、持久化、总结和替换历史。

### 10.2 `8.2` 核心机制

- `estimate_size()` 粗略估算消息大小。
- `snip_compact()` 对大块内容做局部裁剪。
- `persist_large_output()` 把超大工具结果写到文件，只在上下文中保留引用。
- `summarize_history()` 调模型总结历史。
- `compact_history()` 用摘要替换旧消息。
- `reactive_compact()` 在超限错误后触发压缩。

### 10.3 `8.3` 核心代码

```python
def compact_history(messages):
    if estimate_size(messages) < CONTEXT_LIMIT:
        return messages

    keep = messages[-KEEP_RECENT_MESSAGES:]
    older = messages[:-KEEP_RECENT_MESSAGES]
    summary = summarize_history(older)

    return [{
        "role": "user",
        "content": f"Conversation summary so far:\n{summary}",
    }, *keep]

def reactive_compact(messages):
    compacted = compact_history(messages)
    write_transcript(messages)
    return compacted
```

### 10.4 `8.4` 查阅提示

遇到 `prompt too long`、工具输出太长、历史太多时，看这一章。

---

## 9. s09: `Memory`

### 11.1 `9.1` 简介

`s09` 解决“压缩会丢细节”的问题。上下文压缩适合保存当前任务状态，但用户偏好、长期事实、项目约定等应该进入独立的持久记忆层。

### 11.2 `9.2` 核心机制

- `write_memory_file()` 写入持久记忆文件。
- `_rebuild_index()` 维护记忆索引。
- `select_relevant_memories()` 根据当前任务选择相关记忆。
- `load_memories()` 把相关记忆注入系统提示词。
- `extract_memories()` 从对话中提取值得长期保存的信息。
- `consolidate_memories()` 合并重复或过期记忆。

### 11.3 `9.3` 核心代码

```python
def write_memory_file(name: str, content: str) -> str:
    path = MEMORY_DIR / name
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content)
    _rebuild_index()
    return f"Wrote memory: {name}"

def load_memories(query: str) -> str:
    selected = select_relevant_memories(query)
    chunks = []
    for memory in selected:
        chunks.append(read_memory_file(memory))
    return "\n\n".join(chunks)

def build_system(user_prompt: str) -> str:
    memories = load_memories(user_prompt)
    return f"{BASE_SYSTEM}\n\nRelevant memories:\n{memories}"
```

### 11.4 `9.4` 查阅提示

需要区分“当前上下文”和“长期记忆”时，看这一章。

---

## 10. s10: `System Prompt`

### 12.1 `10.1` 简介

`s10` 把 `System Prompt` 从硬编码字符串升级为运行时组装。真实 `Agent` 的提示词通常来自工作目录、策略、上下文、记忆、工具说明和当前任务状态。

### 12.2 `10.2` 核心机制

- `assemble_system_prompt()` 根据 `context` 组装系统提示词。
- `get_system_prompt()` 对外提供当前提示词。
- `update_context()` 更新运行时上下文。
- 主循环每次调用模型时使用动态 `System Prompt`。

### 12.3 `10.3` 核心代码

```python
def assemble_system_prompt(context: dict) -> str:
    parts = [
        f"You are a coding agent at {WORKDIR}.",
        "Use tools to solve tasks. Act, don't explain.",
    ]

    if context.get("current_task"):
        parts.append(f"Current task: {context['current_task']}")

    if context.get("memories"):
        parts.append(f"Relevant memories:\n{context['memories']}")

    return "\n\n".join(parts)

def get_system_prompt(context: dict) -> str:
    return assemble_system_prompt(context)
```

### 12.4 `10.4` 查阅提示

如果你不理解“为什么系统提示词不是一个固定字符串”，看这一章。

---

## 11. s11: Error Recovery

### 13.1 `11.1` 简介

`s11` 增加错误恢复。模型调用、工具调用、网络请求和上下文长度都可能失败，系统需要根据错误类型决定是否重试、延迟多久、是否换模型、是否先压缩上下文。

### 13.2 `11.2` 核心机制

- `RecoveryState` 记录连续失败次数、重试次数和恢复状态。
- `retry_delay()` 做指数退避。
- `with_retry()` 包装容易失败的调用。
- `is_prompt_too_long_error()` 判断是否需要压缩。
- `reactive_compact()` 在上下文错误后压缩再试。

### 13.3 `11.3` 核心代码

```python
@dataclass
class RecoveryState:
    retries: int = 0
    consecutive_529: int = 0
    using_fallback: bool = False

def with_retry(operation):
    state = RecoveryState()
    while state.retries < MAX_RETRIES:
        try:
            return operation()
        except Exception as e:
            state.retries += 1
            if is_prompt_too_long_error(e):
                raise
            time.sleep(retry_delay(state.retries))
    raise RuntimeError("Operation failed after retries")
```

### 13.4 `11.4` 查阅提示

遇到“模型报错后应该怎么办”时，看这一章。重点是错误分类和恢复策略。

---

## 12. s12: `Task` `System`

### 14.1 `12.1` 简介

`s12` 把大目标拆成持久化任务。任务有 `status`、`owner`、`blockedBy`，可以创建、列出、认领和完成。这样 `Agent` 的工作不只存在于聊天上下文里。

### 14.2 `12.2` 核心机制

- `Task` 是任务数据结构。
- `.tasks/` 是本地持久化目录。
- `create_task()` 创建任务。
- `claim_task()` 认领任务并检查依赖。
- `complete_task()` 完成任务并提示被解锁的任务。
- 任务操作被暴露成工具给模型调用。

### 14.3 `12.3` 核心代码

```python
@dataclass
class Task:
    id: str
    subject: str
    description: str
    status: str
    owner: str | None
    blockedBy: list[str]

def create_task(subject: str, description: str = "",
                blockedBy: list[str] | None = None) -> Task:
    task = Task(
        id=f"task_{int(time.time())}_{random.randint(0, 9999):04d}",
        subject=subject,
        description=description,
        status="pending",
        owner=None,
        blockedBy=blockedBy or [],
    )
    save_task(task)
    return task

def claim_task(task_id: str, owner: str = "agent") -> str:
    task = load_task(task_id)
    if task.status != "pending":
        return f"Task {task_id} is {task.status}, cannot claim"
    if not can_start(task_id):
        return "Cannot start: blocked"
    task.owner = owner
    task.status = "in_progress"
    save_task(task)
    return f"Claimed {task.id}"
```

### 14.4 `12.4` 查阅提示

当一个目标已经大到需要拆分、排依赖、分配状态时，看这一章。

---

## 13. s13: `Background Tasks`

### 15.1 `13.1` 简介

`s13` 处理慢操作。不是所有工具都应该阻塞主循环，例如长时间 `bash` 命令、构建、测试、扫描。后台任务让主循环继续响应，并在后续轮次收集结果。

### 15.2 `13.2` 核心机制

- `is_slow_operation()` 判断工具调用是否可能很慢。
- `should_run_background()` 决定是否放后台。
- `start_background_task()` 在线程中执行工具。
- `collect_background_results()` 回收已完成任务结果。
- 主循环每轮都检查后台结果。

### 15.3 `13.3` 核心代码

```python
BACKGROUND_TASKS: dict[str, dict] = {}

def start_background_task(name: str, args: dict) -> str:
    task_id = f"bg_{int(time.time())}_{random.randint(0, 9999):04d}"

    def worker():
        output = execute_tool(name, args)
        BACKGROUND_TASKS[task_id]["status"] = "completed"
        BACKGROUND_TASKS[task_id]["output"] = output

    BACKGROUND_TASKS[task_id] = {"status": "running", "output": None}
    threading.Thread(target=worker, daemon=True).start()
    return f"Started background task {task_id}"

def collect_background_results() -> list[str]:
    return [
        task["output"]
        for task in BACKGROUND_TASKS.values()
        if task["status"] == "completed" and task["output"]
    ]
```

### 15.4 `13.4` 查阅提示

不懂“为什么有些命令需要后台跑”时，看这一章。重点是避免主循环被慢工具卡死。

---

## 14. s14: Cron Scheduler

### 16.1 `14.1` 简介

`s14` 增加定时任务。`Agent` 不应该靠记忆提醒自己每天做某件事，而应该由调度器按时间表达式生产任务。

### 16.2 `14.2` 核心机制

- `CronJob` 保存定时任务定义。
- `validate_cron()` 校验时间表达式。
- `cron_matches()` 判断当前时间是否命中规则。
- `schedule_cron` 创建定时任务。
- `list_crons` 和 `cancel_cron` 管理定时任务。
- 命中定时规则时进入 `cron_queue`，再由主循环注入为一条计划消息。

### 16.3 `14.3` 核心代码

```python
@dataclass
class CronJob:
    id: str
    cron: str
    prompt: str
    recurring: bool
    durable: bool

def cron_matches(schedule: str, now: datetime) -> bool:
    minute, hour, day, month, weekday = schedule.split()
    dow_value = (now.weekday() + 1) % 7
    return (
        _cron_field_matches(minute, now.minute)
        and _cron_field_matches(hour, now.hour)
        and _cron_field_matches(day, now.day)
        and _cron_field_matches(month, now.month)
        and _cron_field_matches(weekday, dow_value)
    )

def schedule_job(cron: str, prompt: str, recurring: bool = True,
                 durable: bool = True) -> CronJob | str:
    err = validate_cron(cron)
    if err:
        return err
    job = CronJob(
        id=f"cron_{random.randint(0, 999999):06d}",
        cron=cron,
        prompt=prompt,
        recurring=recurring,
        durable=durable,
    )
    scheduled_jobs[job.id] = job
    return job

def consume_cron_queue() -> list[CronJob]:
    fired = list(cron_queue)
    cron_queue.clear()
    return fired
```

### 16.4 `14.4` 查阅提示

需要做“每天检查一次”“每周生成报告”这类周期任务时，看这一章。

---

## 15. s15: `Agent Teams`

### 17.1 `15.1` 简介

`s15` 引入团队。多个 `Agent` 不共享同一个巨大上下文，而是通过消息总线发送消息、检查收件箱、创建队友、分配任务。

### 17.2 `15.2` 核心机制

- `MessageBus` 保存队友之间的消息。
- `send_message` 发消息。
- `check_inbox` 查收件箱。
- `spawn_teammate` 创建队友线程。
- 队友可以有自己的上下文和角色。

### 17.3 `15.3` 核心代码

```python
class MessageBus:
    def __init__(self):
        self.messages: dict[str, list[dict]] = {}

    def send(self, sender: str, recipient: str, content: str):
        self.messages.setdefault(recipient, []).append({
            "from": sender,
            "content": content,
            "read": False,
        })

    def inbox(self, recipient: str) -> list[dict]:
        return self.messages.get(recipient, [])

def run_send_message(to: str, content: str) -> str:
    MESSAGE_BUS.send("lead", to, content)
    return f"Sent message to {to}"
```

### 17.4 `15.4` 查阅提示

当你想让多个 `Agent` 分工，而不是让一个模型扛所有上下文时，看这一章。

---

## 16. s16: `Team Protocols`

### 18.1 `16.1` 简介

`s16` 让团队协作从“能发消息”升级为“有协议”。队友之间不只是聊天，而是按照请求计划、提交计划、审查计划、请求关闭等协议推进工作。

### 18.2 `16.2` 核心机制

- `ProtocolState` 跟踪请求和响应。
- `new_request_id()` 生成请求编号。
- `request_plan` 要求队友提交计划。
- `submit_plan` 提交计划。
- `review_plan` 审查计划。
- `request_shutdown` 请求队友结束。

### 18.3 `16.3` 核心代码

```python
@dataclass
class ProtocolState:
    pending_requests: dict[str, dict] = field(default_factory=dict)

def new_request_id() -> str:
    return f"req_{int(time.time())}_{random.randint(0, 9999):04d}"

def match_response(request_id: str, response: dict) -> str:
    if request_id not in PROTOCOL.pending_requests:
        return f"Unknown request: {request_id}"
    PROTOCOL.pending_requests[request_id]["response"] = response
    return f"Matched response for {request_id}"
```

### 18.4 `16.4` 查阅提示

不懂“多代理协作为什么需要协议而不是只靠自然语言”时，看这一章。

---

## 17. s17: Autonomous Agents

### 19.1 `17.1` 简介

`s17` 让队友具备自治能力。队友不再完全等待主代理分配任务，而是可以扫描未认领任务、判断自己能做什么、主动认领并推进。

### 19.2 `17.2` 核心机制

- `scan_unclaimed_tasks()` 找到可开始且无人认领的任务。
- `idle_poll()` 在空闲时定期检查任务和消息。
- 队友线程内部调用任务系统。
- 自治并不等于无控制，仍然受任务状态和协议约束。

### 19.3 `17.3` 核心代码

```python
def scan_unclaimed_tasks(owner: str) -> list[Task]:
    candidates = []
    for task in list_tasks():
        if task.status == "pending" and not task.owner and can_start(task.id):
            candidates.append(task)
    return candidates

def idle_poll(owner: str):
    tasks = scan_unclaimed_tasks(owner)
    if not tasks:
        return "No available tasks"

    task = tasks[0]
    return claim_task(task.id, owner)
```

### 19.4 `17.4` 查阅提示

想理解“队友自己看板、自己认领”的机制时，看这一章。

---

## 18. s18: `Worktree Isolation`

### 20.1 `18.1` 简介

`s18` 解决多代理并行改文件时的冲突问题。每个任务可以绑定一个独立 `git worktree`，让不同队友在不同目录工作。

### 20.2 `18.2` 核心机制

- `validate_worktree_name()` 限制工作区名称。
- `run_git()` 封装 `git` 命令。
- `create_worktree()` 创建隔离目录。
- `bind_task_to_worktree()` 把任务和工作区关联。
- `remove_worktree()` 清理工作区。
- `keep_worktree()` 保留工作区供人工检查。

### 20.3 `18.3` 核心代码

```python
VALID_WT_NAME = re.compile(r"^[A-Za-z0-9._-]{1,64}$")

def validate_worktree_name(name: str) -> bool:
    return bool(VALID_WT_NAME.match(name))

def create_worktree(name: str, branch: str) -> str:
    if not validate_worktree_name(name):
        return f"Invalid worktree name: {name}"

    path = WORKTREES_DIR / name
    run_git(["worktree", "add", str(path), "-b", branch])
    return f"Created worktree {path}"

def bind_task_to_worktree(task_id: str, worktree: str) -> str:
    task = load_task(task_id)
    task.worktree = worktree
    save_task(task)
    return f"Bound {task_id} to {worktree}"
```

### 20.4 `18.4` 查阅提示

只要出现“多个代理并行改同一个仓库”的场景，就应该想到这一章。

---

## 19. s19: `MCP` Tools

### 21.1 `19.1` 简介

`s19` 引入 `MCP`。外部系统不再需要被硬编码成内置工具，而是通过标准协议暴露能力。`Agent` 可以连接外部服务、发现工具、调用工具。

### 21.2 `19.2` 核心机制

- `MCPClient` 管理外部连接。
- `connect_mcp` 连接外部服务。
- `get_version`、`status` 查询服务状态。
- `search`、`trigger` 是示例外部工具。
- 内置工具和 `MCP` 工具共同进入工具列表。

### 21.3 `19.3` 核心代码

```python
class MCPClient:
    def __init__(self, name: str):
        self.name = name
        self.tools: list[dict] = []
        self._handlers: dict[str, callable] = {}

    def register(self, tool_defs: list[dict],
                 handlers: dict[str, callable]):
        self.tools = tool_defs
        self._handlers = handlers

    def call_tool(self, tool_name: str, args: dict) -> str:
        handler = self._handlers.get(tool_name)
        if not handler:
            return f"MCP error: unknown tool '{tool_name}'"
        return handler(**args)

def assemble_tool_pool() -> tuple[list[dict], dict]:
    tools = list(BUILTIN_TOOLS)
    handlers = dict(BUILTIN_HANDLERS)

    def make_handler(client: MCPClient, tool_name: str):
        return lambda **kw: client.call_tool(tool_name, kw)

    for server_name, mcp_client in mcp_clients.items():
        for tool_def in mcp_client.tools:
            prefixed = f"mcp__{server_name}__{tool_def['name']}"
            tools.append({
                "name": prefixed,
                "description": tool_def.get("description", ""),
                "input_schema": tool_def.get("inputSchema", {}),
            })
            handlers[prefixed] = make_handler(mcp_client, tool_def["name"])
    return tools, handlers
```

### 21.4 `19.4` 查阅提示

当你想把数据库、浏览器、搜索、内部平台等外部能力接入 `Agent` 时，看这一章。

---

## 20. s20: Comprehensive `Agent`

### 22.1 `20.1` 简介

`s20` 是总装版本。它把前面所有教学机制放回同一个完整 `Agent` 中：工具、权限、钩子、待办、子代理、技能、压缩、记忆、提示词、错误恢复、任务系统、后台任务、定时任务、团队、协议、自治、工作区隔离和 `MCP`。

### 22.2 `20.2` 核心机制

- `Task` 管任务状态。
- `MessageBus` 管队友消息。
- `ProtocolState` 管协作协议。
- `RecoveryState` 管错误恢复。
- `CronJob` 管定时任务。
- `MCPClient` 管外部工具。
- `BUILTIN_TOOLS` 和外部工具共同组成工具层。
- `agent_loop()` 仍然是中心。

### 22.3 `20.3` 核心代码

```python
def call_tool_handler(handler, args: dict, name: str) -> str:
    try:
        return handler(**args)
    except TypeError as e:
        return f"Error calling {name}: {e}"
    except Exception as e:
        return f"Error: {e}"

def agent_loop(messages: list, context: dict):
    state = RecoveryState()
    max_tokens = DEFAULT_MAX_TOKENS

    while True:
        for job in consume_cron_queue():
            messages.append({
                "role": "user",
                "content": f"[Scheduled] {job.prompt}",
            })

        inject_background_notifications(messages)
        prepare_context(messages)
        context = update_context(context, messages)
        tools, handlers = assemble_tool_pool()

        try:
            response = call_llm(messages, context, tools, state, max_tokens)
        except Exception as e:
            if is_prompt_too_long_error(e):
                messages[:] = reactive_compact(messages)
                continue
            return

        messages.extend(as_input_item(item) for item in response.output)
        if not has_function_call(response.output):
            return

        results = []
        for block in function_calls(response):
            if block.type != "function_call":
                continue

            blocked = trigger_hooks("PreToolUse", block)
            if blocked:
                output = str(blocked)
            elif should_run_background(block.name, call_args(block)):
                output = start_background_task(block, handlers)
            else:
                handler = handlers.get(block.name)
                output = call_tool_handler(handler, call_args(block), block.name)
                trigger_hooks("PostToolUse", block, output)

            results.append({
                "type": "function_call_output",
                "call_id": block.call_id,
                "output": output,
            })

        messages.append({"role": "user", "output": build_user_content(results)})
```

### 22.4 `20.4` 查阅提示

想看“真实一点的 `Agent` 最终长什么样”时，看这一章。重点不是每个细节，而是所有机制如何围绕同一个主循环协作。

---

## 23、附录 1. 常见问题速查

| 问题 | 优先查看 |
| --- | --- |
| `Agent` 最小核心是什么？ | `s01` |
| 怎么新增工具？ | `s02` |
| 怎么防止危险命令？ | `s03` |
| 日志、权限、裁剪这类横切逻辑放哪里？ | `s04` |
| 长任务如何保持计划？ | `s05` |
| 大任务怎么拆给子代理？ | `s06` |
| 技能为什么要按需加载？ | `s07` |
| 上下文太长怎么办？ | `s08` |
| 压缩会丢掉的重要信息放哪里？ | `s09` |
| `System Prompt` 为什么要运行时组装？ | `s10` |
| 模型或工具失败后怎么恢复？ | `s11` |
| 怎么把大目标拆成任务系统？ | `s12` |
| 慢命令怎么不阻塞主循环？ | `s13` |
| 周期性任务怎么做？ | `s14` |
| 多个 `Agent` 怎么协作？ | `s15` |
| 多代理协作怎么避免混乱？ | `s16` |
| 队友如何自治认领任务？ | `s17` |
| 并行改代码怎么隔离？ | `s18` |
| 怎么接外部工具和服务？ | `s19` |
| 所有机制如何组合？ | `s20` |

## 24、附录 2. 阅读路线建议

如果你是第一次系统学习，建议按顺序读：

```text
s01 -> s02 -> s03 -> s04 -> s05 -> s06 -> s07 -> s08 -> s09 -> s10
    -> s11 -> s12 -> s13 -> s14 -> s15 -> s16 -> s17 -> s18 -> s19 -> s20
```

如果你是按问题查阅：

- 工具相关：先看 `s01` 到 `s04`。
- 计划和控制：先看 `s05`、`s06`、`s07`、`s10`、`s11`。
- 上下文和记忆：先看 `s08`、`s09`。
- 并发和调度：先看 `s13`、`s14`。
- 多代理平台：先看 `s12`、`s15` 到 `s20`。

## 25、附录 3. 维护说明

如果后续新增章节，例如 `s21_xxx`，建议同步更新：

- 本文档的 `快速索引`
- `能力分层索引`
- 新增一个独立词条
- `常见问题速查`
- `阅读路线建议`

每个新词条保持同样结构：

```text
简介
核心机制
核心代码
查阅提示
```
