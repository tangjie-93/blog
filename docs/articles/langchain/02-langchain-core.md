---
title: langchain_core 基础对象
date: '2026-08-24'
type: 技术
tags: LangChain|Python
note: 掌握 Message、Prompt、Runnable、Tool 与 OutputParser 等核心对象。
---

# 02. `langchain_core` 基础对象

## 1. 这一模块解决什么问题

`langchain_core` 是 `LangChain` 生态的底座。它不是拿来直接“做完整业务系统”的大框架，而是定义统一接口和通用数据结构。

大白话：

```text
langchain_core 规定大家怎么说话、怎么拼接、怎么执行。
```

## 2. Message

Message 是聊天模型的消息格式，常见有 `SystemMessage`、`HumanMessage`、`AIMessage`、`ToolMessage`。

```text
SystemMessage：规则和身份
HumanMessage：用户输入
AIMessage：模型输出
ToolMessage：工具结果
```

常见坑：

1. 把系统规则和用户问题混在一个字符串里。
2. 多轮对话不保存历史消息。
3. 工具执行后没有把结果作为 `ToolMessage` 交回模型。

## 3. PromptTemplate 和 ChatPromptTemplate

PromptTemplate 用来管理提示词模板。ChatPromptTemplate 更适合聊天模型。

```python
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_messages([
    ("system", "你是企业知识库助手，只根据上下文回答。"),
    ("human", "问题：{question}\n\n上下文：{context}"),
])
```

要会什么：

1. 用 `{question}` 放用户问题。
2. 用 `{context}` 放检索上下文。
3. 用 system message 放固定规则。
4. 用 human message 放动态输入。
5. 确认变量名和调用参数一致。

## 4. Runnable

Runnable 是 `LangChain` 里的统一执行接口。很多对象都支持 `.invoke()`、`.stream()`、`.batch()`。

```python
chain = prompt | llm
```

大白话：

```text
Runnable 就像流水线里的一个机器：输入进去，处理一下，输出出来。
```

常见坑：

1. 前一步输出字符串，后一步需要字典。
2. 链太长，出错不知道错在哪一步。
3. 没有单独测试每个 Runnable。

## 5. Tool

Tool 是把普通函数包装成模型可以调用的工具。

```python
from langchain_core.tools import tool

@tool
def search_policy(query: str) -> str:
    """搜索企业制度文档。"""
    return "检索结果"
```

工具设计原则：

1. 名称明确，比如 `search_policy_docs`。
2. 描述写清楚什么时候用。
3. 参数尽量少而明确。
4. 返回结果要让模型看得懂。
5. 工具内部要处理异常。

## 6. OutputParser

OutputParser 用来把模型输出解析成结构化数据。

业务系统通常需要的是字段，而不是一整段自然语言：

```text
风险等级：高 / 中 / 低
是否需要人工复核：true / false
引用来源：文档 ID 列表
```

常见坑：

1. 只在 `Prompt` 里要求 `JSON`，没有解析和兜底。
2. 模型多输出一句话，`JSON` 解析失败。
3. 字段没有默认值。
4. 解析失败后没有重试或降级。

## 7. 可运行 Demo

下面代码用于离线理解基础对象；要运行实际调用 `OpenAI` ChatGPT 的完整版本，请使用本节末尾链接的 `02_core_chain.py`。先安装依赖：

```bash
pip install langchain-core
```

将下面代码保存为 `langchain_core_demo.py` 后执行 `python langchain_core_demo.py`。它覆盖 Message、`Prompt`、Runnable、Tool 和 OutputParser 五个核心对象。

```python
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage, ToolMessage
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableLambda
from langchain_core.tools import tool


@tool
def search_policy(query: str) -> str:
    """按关键词搜索企业制度，并返回最相关的制度摘要。"""
    policies = {
        "年假": "《员工休假制度》第 3 条：工作满一年后，每年享有 5 天年假。",
        "报销": "《费用报销制度》第 8 条：单笔超过 5000 元需要部门负责人审批。",
    }
    return policies.get(query, "未找到相关制度。")


def main() -> None:
    # 1. Message：ToolMessage 的 tool_call_id 对应 AIMessage 的工具调用 ID。
    messages = [
        SystemMessage(content="你是企业知识库助手。"),
        HumanMessage(content="年假有几天？"),
        AIMessage(
            content="",
            tool_calls=[
                {"name": "search_policy", "args": {"query": "年假"}, "id": "call_001"}
            ],
        ),
        ToolMessage(
            content=search_policy.invoke({"query": "年假"}),
            tool_call_id="call_001",
        ),
    ]
    print("=== Message ===")
    for message in messages:
        print(f"{message.type}: {message.content}")

    # 2. Prompt：invoke 只格式化消息，不会调用模型。
    prompt = ChatPromptTemplate.from_messages([
        ("system", "你是企业知识库助手，只根据上下文回答。"),
        ("human", "问题：{question}\n\n上下文：{context}"),
    ])
    prompt_value = prompt.invoke({
        "question": "年假有几天？",
        "context": search_policy.invoke({"query": "年假"}),
    })
    print("\n=== Prompt ===")
    for message in prompt_value.to_messages():
        print(f"[{message.type}] {message.content}")

    # 3. Runnable：管道将前一步的输出作为后一步的输入。
    retrieve = RunnableLambda(lambda query: search_policy.invoke({"query": query}))
    answer = RunnableLambda(lambda context: f"制度说明：{context}")
    chain = retrieve | answer
    print("\n=== Runnable ===")
    print(chain.invoke("年假"))
    print(chain.batch(["年假", "报销"]))
    print(list(chain.stream("报销")))

    # 4. Tool：名称、说明和参数 schema 供模型决定怎样调用工具。
    print("\n=== Tool ===")
    print(search_policy.name)
    print(search_policy.args_schema.model_json_schema()["properties"])

    # 5. OutputParser：把模型返回的 JSON 文本转成 Python 字典。
    parser = JsonOutputParser()
    result = parser.invoke(
        '{"risk_level": "高", "needs_human_review": true, '
        '"source_ids": ["policy-expense-008"]}'
    )
    print("\n=== OutputParser ===")
    print(result)


if __name__ == "__main__":
    main()
```

关键输出如下（不同版本中参数 schema 的字段顺序可能不同）：

```text
=== Message ===
system: 你是企业知识库助手。
human: 年假有几天？
ai:
tool: 《员工休假制度》第 3 条：工作满一年后，每年享有 5 天年假。

=== Runnable ===
制度说明：《员工休假制度》第 3 条：工作满一年后，每年享有 5 天年假。
['制度说明：《员工休假制度》第 3 条：工作满一年后，每年享有 5 天年假。', '制度说明：《费用报销制度》第 8 条：单笔超过 5000 元需要部门负责人审批。']
['制度说明：《费用报销制度》第 8 条：单笔超过 5000 元需要部门负责人审批。']

=== OutputParser ===
{'risk_level': '高', 'needs_human_review': True, 'source_ids': ['policy-expense-008']}
```

### 7.1 配套单概念与 `OpenAI` 综合 Demo

完整示例索引见 [示例统一准备](./examples/)。基础对象可分别离线运行：

```powershell
python docs/public/langchain-examples/02_core/messages.py
python docs/public/langchain-examples/02_core/prompts.py
python docs/public/langchain-examples/02_core/runnables.py
python docs/public/langchain-examples/02_core/tools.py
python docs/public/langchain-examples/02_core/output_parsers.py
```

随后运行联网综合 Demo：

~~~powershell
python docs/public/langchain-examples/02_core_chain.py
~~~

该脚本以 `ChatOpenAI` 调用 ChatGPT，展示 `SystemMessage`、`HumanMessage`、
`ChatPromptTemplate | ChatOpenAI` 管道，以及 Pydantic 结构化输出。

接入真实模型的最小写法如下：

```python
# from langchain_openai import ChatOpenAI
# llm = ChatOpenAI(model="gpt-4o-mini")
# rag_chain = prompt | llm | JsonOutputParser()
# result = rag_chain.invoke({"question": "年假有几天？", "context": "..."})
```

## 8. 本模块自测

1. Message 里的 system、human、ai、tool 分别代表什么？
    + system：系统消息，用于设置上下文。
    + human：用户消息，用于输入用户问题。
    + ai：模型消息，用于输出模型回答。
    + tool：工具调用消息，用于调用外部工具。
2. PromptTemplate 解决什么问题？
    + 格式化消息，将变量插入到模板中。
    + 不调用模型，只格式化消息。
3. Runnable 的 `.invoke()`、`.stream()`、`.batch()` 有什么区别？
    + `.invoke()`：同步调用，返回一个结果。
    + `.stream()`：异步调用，返回一个可迭代对象，每次迭代返回一个结果。
    + `.batch()`：批量调用，返回一个列表，每个元素对应一个输入。
4. Tool 的描述为什么重要？
    + 用于模型决定怎样调用工具。
    + 说明了工具的功能、参数和返回值。
5. OutputParser 失败时应该怎么处理？
    + 可以捕获异常，记录日志，或者返回默认值。
