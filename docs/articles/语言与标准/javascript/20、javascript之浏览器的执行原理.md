---
title: 21、浏览器的执行原理
date: '2020-01-14'
type: 技术
tags: javascript
note: 从解析、编译、执行到事件循环梳理浏览器运行 `JavaScript` 的过程，解释任务队列和渲染协作。
---

## 1、浏览器执行原理图解

<img src="../../../images/js/browserExePrinciple.png" alt="暂无数据">
<!-- ![](https://user-gold-cdn.xitu.io/2019/7/7/16bccf9312d40cf2?w=2627&h=916&f=png&s=110988) -->
浏览器是多线程的。