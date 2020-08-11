---
title: Vue性能优化
date: '2020-01-14'
type: 技术
tags: vue
note: Vue性能优化
---

## 1、编码阶段的优化

+ 尽量减少data中的数据，`data` 中的数据都会增加 `getter` 和 `setter`，会收集对应的`watcher`。
+ `v-if` 和 `v-for` 不能连用，`v-for` 比 `v-if` 具有更高的优先级。如果每一次都需要遍历整个数组，将会影响速度，尤其是当只需要渲染很小一部分的时候。可以使用 `template` 包裹住对应的 `v-for` , 也可以使用父级元素添加 `v-if`。必要情况下应该替换成`computed`属性。
```js
<template v-if="condition">
    <div v-for="item in [1,2,3]" v-if="item>2">{{item}}</div>
</template>
```
+ 如果需要使用`v-for` 给每项元素绑定事件时使用事件代理。
+ `computed` 和 `watch` 区分使用场景
+ `SPA` 页面采用 `keep-alive` 缓存组件。
```js
<keep-alive includes="[home,'setting]">
    <router-view>
</keep-alive>
```
+ key保证唯一
+ 使用路由懒加载、异步组件。
```js
//异步组件
Toolbar:()=>import('./toolbar')
```
+ 防抖、节流
+ 第三方模块按需导入
```js
import {Button,select} from 'element-ui'
```
+ 长列表性能优化。长列表滚动到可视区域动态加载
```js
//1、冻结数据，使之不响应。
const user=Object.freeze(users)
//2、大数据长列表，采用虚拟滚动，只渲染部分区域的内容
vue-virtual-scroller、vue-virtual-scroll-list
```
+ 事件的销毁
vue组件销毁时，会自动解绑它的全部指令及事件监听器，但是仅限于组件本身的事件。
```js
created(){
    this.timer=setInterval(()=>{},1000);
    this.$once("hook:beforeDeatroy",()=>{
        clearInterval(this.timer)
    })
}
```
+ 图片懒加载（`vue-lazyload,<img v-lazy="img.src" >`）
+ 无状态的组件标记为函数组件
```js
<template functional>
    <div></div>
</template>
<script>
export default {
    propd:{value}
}
</script>
```
+ 子组件分割
将耗时的代码封装成单个子组件。
+ 变量本地化
```js
computed：{
    result(){
        const base=this.base;//不要频繁的引用this.base
        let res=this.start;
        for(let i=0;i<1000;i++){
            res+=heavy(base);
        }
        return 
    }
}
```
```js

```
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
```js
localstorage、cookie、
```
+ 服务器端`gzip`压缩
+ CDN的使用
+ 使用 Chrome Performance 查找性能瓶颈
