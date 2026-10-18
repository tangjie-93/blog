---
title: Agent 扩展生态知识图谱
date: '2026-10-18'
type: 技术
tags: AI|Agent|Skill|MCP|Plugin
note: 把 Skill、Rule、Plugin 和 MCP 放进同一张 Agent 扩展地图，理解它们的边界、生命周期和安全责任。
---

# `Agent` 扩展生态知识图谱

这四个词经常一起出现，但解决的问题不同：

```text
Rule ───────────────► 约束 Agent 应该如何工作
Skill ──────────────► 教 Agent 如何完成一类任务
Plugin ─────────────► 打包、安装和分发一组能力
MCP ────────────────► 用协议把工具、资源和提示接入 Host
                         │
                         ▼
                  Agent 运行时统一发现、授权、调用、审计
```

## 1、四个概念的边界

| 概念 | 主要内容 | 是否直接执行外部副作用 | 典型文件或接口 |
| --- | --- | --- | --- |
| `Rule` | 永久或项目级约束、编码规范、权限边界 | 否，通常影响决策 | `AGENTS.md`、`.cursorrules`、`.mdc` |
| `Skill` | 可按需加载的任务方法、步骤、参考资料 | 间接，通常通过工具完成 | `SKILL.md` + `scripts/`、`references/` |
| `Plugin` | 安装单元、版本、依赖、入口和打包元数据 | 取决于所包含能力 | manifest、commands、hooks、skills、`MCP` 配置 |
| `MCP` | Host、Client、`Server` 间的发现与调用协议 | 是，`Server` 可能读写外部系统 | `tools/list`、`tools/call`、resources、prompts |

## 2、一次调用的生命周期

```text
发现扩展 → 读取元数据 → 解析规则与 Skill → 建立 MCP 能力池
       → 模型选择能力 → 权限/参数校验 → 执行工具
       → 返回结果 → 记录轨迹、成本、审批和错误
```

责任边界要放在代码里：Rule 和 `Skill` 是模型可见的指导，不能替代服务端授权；Plugin 的安装来源、版本和依赖需要校验；`MCP` `Server` 必须限制文件、网络、凭据和写操作范围。

## 3、学习顺序

1. 先读 [`Skill` Loading](../agent/07%E3%80%81Skill%20Loading%20%E2%80%94%20%E7%94%A8%E5%88%B0%E7%9A%84%E6%97%B6%E5%80%99%E6%89%8D%E5%8A%A0%E8%BD%BD.md)，理解元数据、按需加载和上下文预算。
2. 再读 [Permission](../agent/03%E3%80%81Permission%20%E2%80%94%20%E6%89%A7%E8%A1%8C%E5%89%8D%E5%81%9A%E6%9D%83%E9%99%90%E5%88%A4%E6%96%AD.md) 与 [`Agent` Security](../agent/23%E3%80%81Agent%20Security%20%E2%80%94%20从提示注入到沙箱隔离.md)，明确规则不能替代权限检查。
3. 然后读 [`MCP` Tools](../agent/19%E3%80%81MCP%20Tools%20—%20外接工具，标准协议.md)，掌握工具发现、命名空间和调用循环。
4. 最后用真实 `SDK` 做一个最小 stdio `Server`/Client，并为每个工具写只读、破坏性和超时测试。

## 4、`GitHub` 参考地图

- [`Agent` Skills 汇总](https://github.com/philipbankier/awesome-agent-skills)：同时收录 `SKILL.md`、`MCP` `Server`、Cursor/Windsurf Rules、插件和各平台扩展，适合查生态边界。
- [`MCP` `Server` 汇总](https://github.com/punkpeye/awesome-mcp-servers)：按浏览器、数据库、文件、搜索等场景整理 `Server`，适合选型，不应替代安全审查。
- [中文 `MCP` 资源](https://github.com/yzfly/Awesome-MCP-ZH)：包含客户端、`Server`、开发教程和中文实践入口。
- [`MCP` 规范](https://github.com/modelcontextprotocol/specification)：协议、`Schema` 与官方文档的源头。
- [`MCP` `Python` `SDK`](https://github.com/modelcontextprotocol/python-sdk) / [`TypeScript` `SDK`](https://github.com/modelcontextprotocol/typescript-sdk)：实现真实 `Server`/Client 的起点。
- [Superpowers](https://github.com/obra/superpowers)：观察 `Skill`、规则和 `Agent` 工作流如何组合的工程案例。

`GitHub` 项目数量、Stars 和协议版本会变化；本页链接用于学习入口，实际接入前应重新检查维护状态、许可证、权限模型和最近发布记录。
