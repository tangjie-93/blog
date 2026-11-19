---
title: LangSmith 观测和评估
date: '2026-08-24'
type: 技术
tags: LangChain|LangSmith
note: 用 LangSmith 追踪、评估和监控 LLM 应用。
---

# 07. `LangSmith` 观测和评估

## 1. 这一模块解决什么问题

`LLM` 应用最难的是：出问题时你不知道是哪一步错了。

`LangSmith` 用来回答这些问题：

- `Prompt` 最终长什么样？
- 模型看到了哪些上下文？
- 检索到了哪些文档？
- 调用了哪个工具？
- 哪一步最慢？
- 哪一步最贵？
- 答案质量有没有变好？

## 2. Trace

Trace 是一次完整请求的执行记录。

它能记录：

- 用户输入
- `Prompt`
- 模型输入输出
- `Retriever` 结果
- `Tool` 调用
- `LangGraph` 节点
- 耗时
- `token`
- 成本
- 错误

没有 trace，你只能看到：

```text
用户问了什么
系统答了什么
```

有 trace，你能看到：

```text
系统为什么这么答
```

常见坑：

1. 生产环境没开 trace。
2. trace 里记录敏感数据但没有治理。
3. 只看最终 answer，不看中间 run。

## 3. Dataset

Dataset 是一批固定测试样本。

样本可以包含：

- 用户问题
- 期望答案
- 期望引用
- 评分标准
- 标签
- 来源业务场景

Dataset 应该覆盖：

1. 高频问题。
2. 边界问题。
3. 历史错误问题。
4. 高风险问题。
5. 权限相关问题。
6. 检索困难问题。

## 4. Evaluation

Evaluation 是评估 `LLM` 应用质量。

企业 `RAG` 至少评估：

| 评估项 | 说明 |
|---|---|
| 检索召回 | 是否找到了正确文档 |
| 上下文质量 | 塞给模型的资料是否有用 |
| 忠实性 | 答案是否忠于原文 |
| 正确性 | 答案是否解决问题 |
| 引用准确性 | 引用是否真的支持答案 |
| 延迟 | 响应是否太慢 |
| 成本 | `token` 和调用次数是否可控 |

常见坑：

1. 只评估最终答案。
2. 不评估检索结果。
3. 评分标准太模糊。
4. 完全依赖模型裁判，没有人工抽检。

## 5. Feedback

Feedback 是用户或人工评审对回答的反馈。

好的反馈应该记录：

1. 用户是否满意。
2. 哪里错了。
3. 是答案错、引用错、检索错，还是权限错。
4. 是否需要加入测试集。
5. 业务正确答案是什么。

## 6. 生产监控

上线后建议关注：

- 请求量
- 成功率
- 错误率
- 平均延迟
- P95 延迟
- `token` 消耗
- 单次请求成本
- 工具失败率
- 检索为空比例
- 用户负反馈比例

## 7. 可运行 Demo

完成 [示例统一准备](./examples/)。评估与监控概念默认可离线运行，Dataset 和 Feedback 只有传入 `--write` 才写入远端：

```powershell
python docs/public/langchain-examples/07_langsmith/dataset.py
python docs/public/langchain-examples/07_langsmith/evaluation.py
python docs/public/langchain-examples/07_langsmith/feedback.py
python docs/public/langchain-examples/07_langsmith/monitoring_metrics.py
```

配置 `LANGSMITH_TRACING=true`、`LANGSMITH_API_KEY` 后运行 Trace 示例：

~~~powershell
python `docs/public/langchain-examples/07_langsmith/trace.py`
python `docs/public/langchain-examples/07_langsmith.py`
~~~

该脚本用 `@traceable` 包裹一次 `ChatOpenAI` 调用；运行结束后可在 `LangSmith`
项目中查看这次 `ChatGPT` 调用的 trace。

## 8. 本模块自测

1. Trace 能看到哪些信息？
   + 用户输入
   + `Prompt`
   + 模型输入输出
   + `Retriever` 结果
   + `Tool` 调用
   + `LangGraph` 节点
   + 耗时
   + `token`
   + 成本
   + 错误
   + 其他元数据
  2. 为什么只看最终答案不够？
   + 模型看到了哪些上下文？
   + 检索到了哪些文档？
   + 调用了哪个工具？
   + 哪一步最慢？
   + 哪一步最贵？
   + 答案质量有没有变好？
   + 其他问题
3. Dataset 应该包含哪些样本？
   + 用户问题
   + 期望答案
   + 期望引用
   + 评分标准
   + 标签
   + 来源业务场景
4. Evaluation 可以评估哪些指标？
   + 检索召回
   + 上下文质量
   + 忠实性
   + 正确性
   + 引用准确性
   + 延迟
   + 成本
5. 用户 feedback 应该如何进入改进流程？
   + 收集用户反馈
   + 分析反馈
   + 评估反馈影响
   + 优化模型
   + 重复以上步骤
