# AI、RAG 与 Agent 统一路线 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 新增一篇把 AI 基础、RAG 实战和 Agent 生产化串起来的分阶段学习路线，并接入现有索引。

**Architecture:** 以 `docs/articles/ai/` 下的新路线文档作为总入口，复用 `docs/articles/ai/13...`、`docs/articles/rag/01-11` 和 `docs/articles/agent/` 的已有文章。只更新索引和培训文档的入口说明，不修改文章 URL 或导航算法。

**Tech Stack:** Markdown、VitePress、现有 Node 测试脚本。

**Spec:** `docs/superpowers/specs/2026-10-19-ai-rag-agent-roadmap-design.md`

## Global Constraints

- 不新增依赖或代码项目。
- 每个阶段必须写知识、前置、产出、验收和替代方案。
- 保留现有文章路径和分类。
- 使用仓库现有 Markdown 表格、代码块和相对链接风格。

### Task 1: 新增统一路线正文

**Files:**
- Create: `docs/articles/ai-rag-agent/README.md`

- [ ] 写入 frontmatter、总图和阅读方式。
- [ ] 写入八阶段，每阶段给出知识点、前置条件、实践产出、验收标准和文章链接。
- [ ] 写入检索、编排和模型服务的替代方案比较表。
- [ ] 写入贯穿项目、阶段依赖和最终验收清单。

### Task 2: 接入 AI 和 RAG 入口

**Files:**
- Modify: `docs/articles/ai/README.md`
- Modify: `docs/articles/rag/09-培训计划.md`

- [ ] 在 AI 文档导航表中加入统一路线。
- [ ] 在 RAG 培训计划开头加入统一路线入口和阶段对应关系。
- [ ] 保留培训计划原有的两周日程和评分标准。

### Task 3: 验证文档链路

**Files:**
- Test: `tests/*.test.mjs`, `docs/.vitepress/theme/*.test.ts`

- [ ] 运行 `pnpm test`。
- [ ] 检查新文档中的相对链接和索引入口。
- [ ] 报告完整构建是否受仓库既有问题影响。
