---
title: react之虚拟dom
date: '2020-07-06'
type: 技术
tags: react
note: react之虚拟dom
---
## 1、什么是虚拟dom？
用`javascript`对象来表示 `Dom` 信息和结构，当状态变更的时候，重新渲染这个 `javascript` 的对象结构。

`Virtual Dom` 是一种编程概念。是一种由 `Javascript`类库基于浏览器`API`实现的概念。 `UI`以一种理想化的，或者说**虚拟化**的变现形式被保存在内存中，并通过如 `ReactDom`等；类库使之与**真实的** `Dom` 同步。这一过程称为**协调**。

这种方式 赋予了 `React` 声明式的 `API`:使得我们告诉 `React` 希望让 `UI` 是什么状态，`React` 就确保 `Dom` 匹配该状态，这使得我们可以从属性操作。事件处理和手动操作 `Dom` 更新的这些构件应用程序的操作中解放出来。 
## 2、为什么使用虚拟dom?
`Dom`操作很慢，轻微的操作都看呢过导致页面重新排版，非常耗性能。相对于 `Dom` 对象,`js` 对象处理起来更快，而且更简单。通过 `diff` 算法对比新旧 `vdom`之间的差异，可以批量的最小化的执行 `dom` 操作，从而提高性能。
## 3、在哪里用到了虚拟dom？
`React`中使用 `jsx` 语法描述视图，通过 `babel-loader` 转译后他们变成 `React.createElement(...)`形式，该函数将生成`vdom` 来描述真实 `dom`。将来如果状态变化，`vdom`将作出相应变化，再通过`diff` 算法来对比新老 `vdom` 区别从而作出最终 `dom` 操作。