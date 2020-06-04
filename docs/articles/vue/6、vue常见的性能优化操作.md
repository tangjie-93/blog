---
title: Vue性能优化
date: '2020-01-14'
type: 技术
tags: vue
note: Vue性能优化
---

## 1、编码阶段的优化

+ 尽量减少data中的数据，data中的数据都会增加getter和setter，会收集对应的watcher。
+ v-if和v-for不能连用，v-for 比 v-if 具有更高的优先级。如果每一次都需要遍历整个数组，将会影响速度，尤其是当只需要渲染很小一部分的时候。可以使用template包裹住对应的v-for , 也可以使用父级元素添加v-if。必要情况下应该替换成`computed`属性。
+ 如果需要使用`v-for`给每项元素绑定事件时使用事件代理。
+ `computed` 和 `watch` 区分使用场景
+ SPA 页面采用keep-alive缓存组件。
+ key保证唯一
+ 使用路由懒加载、异步组件。
+ 防抖、节流
+ 第三方模块按需导入
+ 长列表滚动到可视区域动态加载
+ 图片懒加载（`vue-lazyload,<img v-lazy="img.src" >`）
+ 预渲染
+ 服务端渲染SSR
## 2、打包优化
+ 压缩代码
+ 模板预编译
+ Tree Shaking/Scope Hoisting
+ 使用cdn加载第三方模块
+ 多线程打包happypack
+ splitChunks抽离公共文件
+ sourceMap优化
+ dllPlugin
## 3、其他
+ 客户端缓存
+ 服务器端`gzip`压缩
+ CDN的使用
+ 使用 Chrome Performance 查找性能瓶颈
