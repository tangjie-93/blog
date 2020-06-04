---
title: Proxy和Object.defineProperty的对比
date: '2020-01-14'
type: 技术
tags: vue
note: Proxy和Object.defineProperty的对比
---

**Proxy的优势如下**

+ Proxy可以直接监听整个对象而非属性。
+ Proxy可以直接监听数组的变化。
+ Proxy有13中拦截方法，如`ownKeys、deleteProperty、has` 等是 `Object.defineProperty` 不具备的。
+ Proxy返回的是一个新对象，我们可以只操作新的对象达到目的，而`Object.defineProperty`只能遍历对象属性直接修改;
+ Proxy做为新标准将受到浏览器产商重点持续的性能优化,也就是传说中的新标准的性能红利。

**Object.defineProperty 的优势如下**

+ 兼容性好，支持 IE9，而 Proxy 的存在浏览器兼容性问题,而且无法用 polyfill 磨平。

**Object.defineProperty 不足在于**：
+ `Object.defineProperty` 只能劫持对象的属性,因此我们需要对每个对象的每个属性进行遍历。
+ `Object.defineProperty`不能监听数组。