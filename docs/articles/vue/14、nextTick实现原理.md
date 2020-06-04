---
title:nextTick实现原理
date: '2020-05-18'
type: 技术
tags: vue
note: nextTick实现原理.
---


在下次`DOM`更新循环结束之后执行的延迟回调。`nextTick` 主要使用了宏任务和微任务。根据执行环境分别尝试采用

+ `Promise`
+ `MutationObserver`
+ `setImmediate`
+ 如果以上都不行则采用 `setTimeout`
