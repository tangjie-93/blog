---
title: egg源码实现
date: '2020-08-24'
updated: '2026-11-21'
type: 技术
tags: node
note: "通过 `Egg` 的 `MVC` 分层和启动流程分析其目录组织、模块加载与请求处理方式，帮助理解 `Node.js` `Web` 框架如何封装工程约定。"
---

## 1、`Egg` 的分层架构与项目结构

`egg`是一个比较成熟的`node`框架。采用了常见的 `mvc` 分层架构。

<img src='../../../images/node/egg项目结构.png'>