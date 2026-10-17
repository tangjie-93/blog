---
title: GitHub RAG 项目地图与训练任务
date: '2026-10-17'
type: 技术
tags: RAG|GitHub
note: 按学习路径筛选的开源 RAG 项目；星标、归档与许可信息是 2026-10-17 快照。
---

## 使用说明

本清单按“先理解、再组装、最后生产化”排序。项目价值由代码可读性、文档、社区维护和能否验证结果共同决定，不按 stars 排名。快照日期为 2026-10-17；GitHub 页面动态信息可能变化，正式商用前请重新查看 LICENSE、依赖和安全公告。

## 一、原理与最小实现

|项目|用途与入口|适合/不适合|许可与部署注意|学习任务|
|---|---|---|---|---|
|[RAG_Techniques](https://github.com/NirDiamant/RAG_Techniques)|Notebook 展示 query expansion、HyDE、重排、代理式 RAG|适合比较策略；不适合作为稳定 SDK|MIT（以仓库 LICENSE 为准，未在本次快照逐文件复核）|选同一数据集跑 naive、HyDE、rerank，记录 Recall@k 与延迟|
|[DPR](https://github.com/facebookresearch/DPR)|Dense Passage Retrieval 原始实现与训练代码|适合理解双塔；不适合直接当现代生产服务|MIT（需核实当前 LICENSE）；训练依赖 GPU、数据与 checkpoint|复现 top-k 检索，比较 BM25|
|[BEIR](https://github.com/beir-cellar/beir)|异构检索基准和数据加载器|适合评测；不适合当业务索引|Apache-2.0（以仓库为准）|固定 embedding 版本，报告 nDCG@10|
|[FiD](https://github.com/facebookresearch/FiD)|Fusion-in-Decoder 多段证据生成|适合研究生成端；不适合低资源部署|许可需复核|比较串联上下文与 FiD 的答案覆盖率|

## 二、框架

|项目|用途与入口|适合/不适合|许可与部署注意|学习任务|
|---|---|---|---|---|
|[LlamaIndex](https://github.com/run-llama/llama_index)|文档处理、索引、Query Engine；看 docs/examples 与 pyproject|适合数据连接和索引实验；不适合把默认 prompt 当安全边界|MIT；安全策略明确输入校验、鉴权由宿主负责|用本地 Markdown 建索引，给 chunk 加来源 metadata|
|[LangChain](https://github.com/langchain-ai/langchain)|Runnable、retriever、加载器；看官方 RAG 教程|适合组合和原型；不适合无审计启用任意 loader/tool|MIT；安全页列有路径遍历、反序列化公告，需固定版本|把 retriever、reranker、generator 分成可替换 Runnable|
|[Haystack](https://github.com/deepset-ai/haystack)|组件化 pipeline、Document Store、评估；看 haystack-cookbook|适合显式 pipeline；不适合忽略 Python 版本约束|Apache-2.0，pyproject 标注；当前要求 Python >=3.11|实现 BM25→embedding→rerank pipeline，输出 trace|
|[LangGraph](https://github.com/langchain-ai/langgraph)|有状态图编排，适合 agentic RAG|适合循环、人工确认；简单问答无需引入状态机|MIT（仓库为准）|增加“证据不足→改写查询→重试”节点并设最大步数|

## 三、平台与完整应用

|项目|用途与入口|适合/不适合|许可与部署注意|学习任务|
|---|---|---|---|---|
|[RAGFlow](https://github.com/infiniflow/ragflow)|可视化知识库、解析、检索和 Agent；README 有 Docker 启动|适合复杂文档试用；不适合未经压测直接多租户上线|Apache-2.0；快照约 92.3k stars，检查镜像和依赖资源|导入含表格 PDF，比较解析结果与手工基线|
|[Dify](https://github.com/langgenius/dify)|工作流、知识库、模型供应商管理|适合快速交付；不适合把默认权限当企业隔离|许可与组件条款需复核（未核实）|建立带引用的 FAQ workflow，导出 API 做回归|
|[FastGPT](https://github.com/labring/FastGPT)|中文知识库和可视化工作流|适合中文 PoC；不适合忽略商业条款|许可需部署前核实（未核实）|用 50 条中文问答测试召回和拒答|
|[Open WebUI](https://github.com/open-webui/open-webui)|自托管聊天前端，可接 Ollama/RAG 后端|适合内部体验；不适合作为后端权限系统|许可及插件风险需复核（未核实）|接只读 RAG API，确认引用可点击|

## 四、解析、Embedding 与向量库

|项目|用途与入口|适合/不适合|许可与部署注意|学习任务|
|---|---|---|---|---|
|[Docling](https://github.com/docling-project/docling)|PDF、表格、布局解析；看 docs/examples|适合结构化文档；不适合假设扫描件无需 OCR|MIT（以仓库 LICENSE 为准）|比较纯文本切分与结构化 JSON 切分|
|[MinerU](https://github.com/opendatalab/MinerU)|中文 PDF、公式、表格解析|适合中文论文；不适合未验证许可证的商业交付|许可和模型权重条款需核实（未核实）|记录公式、表格丢失率并保留页码|
|[FlagEmbedding](https://github.com/FlagOpen/FlagEmbedding)|BGE embedding 与 reranker；README 有 Tutorials/Examples|适合中文和多语检索；不适合只看 MTEB 分数|MIT；模型卡可能有单独条款|比较 bge-m3 dense/sparse 与 reranker|
|[Qdrant](https://github.com/qdrant/qdrant)|向量数据库、过滤、混合检索|适合服务化和 metadata filter；不适合把云端默认配置当生产|Apache-2.0，README 明示；规划 WAL、备份和分片|验证 tenant filter 不越权|
|[pgvector](https://github.com/pgvector/pgvector)|PostgreSQL 内向量检索|适合已有 Postgres、中等规模；不适合超大规模照搬|PostgreSQL 风格许可；索引参数随版本变化|比较 HNSW 与 IVFFlat 的召回/写入成本|
|[Milvus](https://github.com/milvus-io/milvus)|分布式向量数据库|适合大规模和多索引；本地学习无需一开始上集群|Apache-2.0（需复核当前仓库）|测过滤、分区和索引构建时间|

## 五、评估与图检索

|项目|用途与入口|适合/不适合|许可与部署注意|学习任务|
|---|---|---|---|---|
|[Ragas](https://github.com/explodinggradients/ragas)|Context precision/recall、faithfulness 等指标|适合离线回归；不适合把 LLM judge 当绝对真值|Apache-2.0（需复核）；评测模型有成本与隐私|建立 30 条带参考答案的 golden set|
|[DeepEval](https://github.com/confident-ai/deepeval)|pytest 风格 LLM 评估与 red-team|适合 CI 门禁；不适合忽略 judge 漂移|许可需复核（未核实）|为 hallucination、引用缺失设置阈值|
|[Microsoft GraphRAG](https://github.com/microsoft/graphrag)|知识图谱与 global/local search|适合跨文档关系问题；不适合所有 FAQ，索引成本较高|MIT（仓库为准）；LLM 抽取成本高|比较 local search 与普通 top-k|
|[LightRAG](https://github.com/HKUDS/LightRAG)|轻量图增强 RAG|适合研究和快速试验；不适合未做并发、权限压测的生产|MIT（需复核当前仓库）|对实体冲突和增量更新写测试|

## 六、选型路径

1. 只想学习检索：BEIR → DPR → RAG_Techniques。
2. 已有 Python 服务：LlamaIndex 或 Haystack；复杂状态再加 LangGraph。
3. 中文 PDF：Docling/MinerU → FlagEmbedding → Qdrant/pgvector。
4. 要交付内部产品：先 RAGFlow/Dify 验证流程，再拆出可观测后端。
5. 关系型问题：先做 hybrid baseline，再评估 GraphRAG/LightRAG。
6. 上线前：Ragas/DeepEval golden set、权限过滤、备份恢复、依赖和镜像扫描。

## 七、统一动手作业

- 选 20 份文档，保留版本、页码、租户字段。
- 写 30 个问题：事实、跨段、不可回答各 10 个。
- 固定 embedding、chunk、top-k、reranker、prompt 版本。
- 记录 Recall@5、nDCG@10、引用覆盖率、拒答率、P95 延迟和成本。
- 保存检索候选、最终上下文和答案，定位回归。
- 用两个租户做越权测试，把恶意文档当 prompt injection 输入。
- 备份向量库和原文，演练重建索引。
- 许可证清单包含源码、模型权重、OCR 引擎和第三方 API。

## 八、快照证据

本页检索了 GitHub 官方仓库页面与 LICENSE/pyproject。已核实：RAGFlow Apache-2.0、Qdrant Apache-2.0、LangChain MIT、LlamaIndex pyproject MIT、Haystack Apache-2.0、FlagEmbedding MIT；网页结果显示当日 stars，但 stars 不是选型依据。Dify、FastGPT、Open WebUI、MinerU、DeepEval、Milvus、GraphRAG、LightRAG 的当前许可或归档状态本次未逐文件核实，文中已标记。Verba、Cognita、ChatRTX 不纳入推荐；此前发现 archived=true，仍需逐仓库再核实后才能引用。

