---
title: vue之虚拟dom
date: '2020-01-14'
type: 技术
tags: vue
note: vue之虚拟dom
---
### 1、什么叫虚拟dom？
&#8195;&#8195;virtral Dom就是将真实Dom的数据抽象处理，以**对象的形式模拟树形结构**。虚拟DOM本质上是JavaScript对象,是对真实DOM的抽象。状态变更时，记录新树和旧树的差异（`diff算法`），最后把差异更新到真正的dom中（`patch算法`）。
```javascript
    //真实dom
    <div>
        <span>测试</span>
    </div>
    //虚拟dom 伪代码 Vnode和oldVnode都是对象
    var Vnode = {
        tag: 'div',
        children: [
            { tag: 'span', text: '测试' }
        ]
    };
```
**虚拟dom的优点**
+ 1、保证性能下限。虚拟dom通过diff找出最小差异，然后批量进行patch，这种操作比起粗暴的直接操作dom，性能要好上很多。
+ 2、无须直接操作dom，可以极大的提升开发效率。
+ 3、跨平台。如服务端渲染，移动端开发。
### 2、diff算法（差分算法）
&#8195;&#8195;采用diff算法比较新旧节点时，只会在同层级进行，不会跨层级比较。