---
title: 对BFC的理解
date: '2020-03-14'
type: 技术
tags: css
note: 对BFC的理解
---
&#8195;&#8195;`BFC（Block Formatting Context）`:块级格式化上下文，一个创建了新的 `BFC` 的盒子是独立布局的，盒子里面的子元素的样式不会影响到外面的元素。在同一个BFC中的两个毗邻的块级盒在**垂直方向**（和布局方向有关系）的 `margin` 会发生折叠。W3C CSS 2.1 规范中的一个概念,它决定了元素如何对其内容进行定位,以及与其他元素的关系和相互作用。**它的作用**是在一块独立的区域，让处于 `BFC` 内部的元素与外部的元素互相隔离.

**如何形成？**
+ 根元素或者其他包含它的元素
+ 绝对定位元素 (`position: fixed/absolute`)
+ 浮动元素 (`float` 不为`none`)
+ `overflow`不为`visible`的块元素
+ 行内块级元素（`display:inline-block`）
+ 表格单元格（`display:table-cell`）
+ 表格标题 （`display:table-caption`）
+ 弹性盒 （`flex或inlne-flex`）
+ `display:flow-root`
+ `column-span:all`

**BFC的约束规则**
+ 内部的盒会在垂直方向上一个接一个排列
+ 处于同一个`BFC`中的元素，在垂直方向外边距（`margin`）会发生重叠
+ 计算`BFC`的高度时，考虑`BFC` 所包含的所有元素，连浮动元素也参与计算。
+ 浮动盒区域不叠加到`BFC`上。
+ `BFC`就是页面上的一个独立的容器，容器里面的子元素不会影响到外面的元素。
+ 每个元素的`margin-box`的左边，与容器边的`border box`的左边相接触，即使浮动元素也是如此。

**作用**
+ **解决垂直外边距重叠问题**。属于同一个`BFC` 的两个相邻块级子元素的上下`margin`会发生重叠，可以使得它们两分属不同的`BFC`防止`margin`发生重叠
```js
<div id="test1"></div>
<div id="test2"></div>
```
```css
#test1 {
    width: 300px;
    height: 300px;
    margin: 30px;
    background: red;
    display: inline-block;//形成BFC
}

#test2 {
    width: 300px;
    height: 300px;
    margin: 30px;
    background: blue;
    display: inline-block;////形成BFC
}
```
+ 自适应两列布局（`float`+ `overflow`）。两栏布局，防止文字环绕，组织元素被浮动元素覆盖
```html
<div class="div1"></div>
<div class="div2"></div>
```
```css
.div1 {
  float: left;// 使得#div1成为为BFC
  width: 300px;
  background-color: pink;
  height: 100vh;
}

.div2 {
  background-color: black;
  height: 100vh;
  overflow: hidden; // 使得#div2成为BFC
}
```
+ 3、 (去除浮动) 防止元素塌陷,可以包含浮动元素
```html
<div class="show-body" id="sb">
    <div class="float">左浮动的测试文字</div>      
</div>
```
```css
.float{
  float: left;
  background-color: rgba(0,255,0,0.6);
  width: 150px
}
.show-body {
    border: 1px solid black;
    border-radius: 5%;
    padding: 5%;
    background: pink;
    position: absolute;//成为BFC
}
```

