---
title: 对BFC的理解
date: '2020-03-14'
type: 技术
tags: css
note: 对BFC的理解
---
&#8195;&#8195;`BFC（Block Formatting Context）`:块级格式化上下文，一个创建了新的BFC的盒子是独立布局的，盒子里面的子元素的样式不会影响到外面的元素。在同一个BFC中的两个毗邻的块级盒在垂直方向（和布局方向有关系）的margin会发生折叠。W3C CSS 2.1 规范中的一个概念,它决定了元素如何对其内容进行定位,以及与其他元素的关系和相互作用。**它的作用**是在一块独立的区域，让处于BFC内部的元素与外部的元素互相隔离.

**如何形成？**
+ 根元素，即HTML元素
+ position: fixed/absolute
+ float 不为none
+ overflow不为visible
+ display的值为inline-block、table-cell、table-caption

**作用**
+ 1、属于同一个BFC的两个相邻块级子元素的上下margin会发生重叠，可以使得它们两分属不同的BFC防止margin发生重叠
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
+ 2、两栏布局，防止文字环绕，组织元素被浮动元素覆盖
```html
<div class="div1"></div>
<div class="div2"></div>
```
```css
.div1 {
  float: left;
  width: 300px;
  background-color: pink;
  height: calc(100vh - 100px);
}

.div2 {
  background-color: black;
  height: 100vh;
  overflow: hidden; // 使得#div2称为BFC
}
```
+ 3、防止元素塌陷,可以包含浮动元素
```html
<div class="show-body" id="sb">
    <div style="float: left;background-color: rgba(0,255,0,0.6);width: 150px">左浮动的测试文字</div>      
</div>
```
```css
show-body {
    border: 1px solid black;
    border-radius: 5%;
    padding: 5%;
    background: pink;
    position: absolute;//成为BFC
}
```

