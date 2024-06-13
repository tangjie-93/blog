---
title: 绝对定位absolute和浮动定位float的区别
date: '2020-01-14'
type: 技术
tags: css
note: 绝对定位absolute和浮动定位float的区别
---
<ul>
    <li><a href="#a1">元素定位的方式</a></li>
    <li><a href="#a2">absoute和float的异同</a></li>
</ul>

<h3 id="a1">1、元素定位的方式主要有以下几种：</h3>

>1)	`absolute`:生成绝对定位的元素， 相对于最近一级的定位不是 `static` 的父元素来进行定位。        
>2)	`fixed`（老IE不支持）：生成绝对定位的元素，通常相对于浏览器窗口或 `frame` 进行定位。
>3)	`relative`：生成相对定位的元素，相对于其在普通流中的位置进行定位。
>4)	`static`：默认值。没有定位，元素出现在正常的流中
>5)	`sticky`：生成粘性定位的元素，容器的位置根据正常文档流计算得出

<h3 id="a2">2、absoute和float的异同：</h3>

absolue定位效果如下
```css        
#test1{
    position: absolute;
    top: 50px;
    left: 50px;
    width: 200px;
    height: 200px;
    background: red;
}
#test2{
    position: absolute;
    height: 100px;
    width: 100px;
    background: #0062CC;
}
#test4,#test5{
    width: 100px;
    height: 200px;
    background: navy;
    color:white
}
#test6{
    position: absolute;
    top: 0;
    left: 0;
    width: 200px;
    height: 200px;
    background: aqua;
}
```
```html
<span id="test1">我是test1-span标签</span>
<div id="test2">我是test2-div标签</div>
<span id="test3">我是普通行内标签-test3</span>
<div id="test4">我是普通块级标签1-test4</div>
<div id="test5">我是普通块级标签2-test5</div>
<span>我是普通行内标签</span>
<span id="test6">我是普通行内标签-test6</span>
```
<img src="../../images/css/position-absolute.png" alt="暂无图片">

float定位效果如下

```css     
#test1 {
    float: left;
    top: 50px;
    left: 50px;
    width: 200px;
    height: 200px;
    background: red;
}
#test2 {
    float: left;
    height: 100px;
    width: 100px;
    background: #0062CC;
}
#test4 {
    width: 100px;
    height: 100px;
    background: navy;
}
#test5 {
    width: 100px;
    height: 200px;
    background: mediumaquamarine;
}
```
```html
<span id="test1">我是span-test1标签</span>
<div id="test2">我是div-test2标签</div>
<span id="test3">我是普通行内标签-test3</span>
<div id="test4">我是普通块级标签1-test4</div>
<div id="test5">我是普通块级标签2-test5</div>
<span>我是普通行内标签</span>
```
<img src="../../images/css/position-float.png" alt="暂无图片">

結果分析：

| 定位方式 |   行內元素  |   块级元素                           |
| :------: | :--------------: | :----------: |
| `absolue`  | 可以让元素脱离文档流，**表现的跟块级元素一样**，可以设置宽和高，也可以设置`top、left、bottom和right` |         脱离文档流，可以设置`top、left、bottom和right`         |
|  float   | 表现的 **跟行內块级元素一样，仍会占据位置。** `float` 为 `left`时，位于浮动元素的左边行内元素会出现在右边、`float` 为 `right` 时，位于浮动元素的右边行内元素会出现在左边。 | 元素是浮动的，会浮动在块级元素之上。 并且定位为`float`的元素如果完全覆盖住块级元素或覆盖部分时，块级元素中的文字部分将会显示在浮动元素的正下方（正常的块级元素文字是出现在块级元素内部的顶部位置） |

**共同点：**   
>对元素（无论块级元素、行内元素）设置 `float` 和 `absolute` 属性，可以让元素脱离文档流，并且可以设置其宽高。 

**不同点：**   
>1、对**行内元素**来说，定位为 `float` 的元素就相对为**行内块级元素，仍会占据位置。** `float` 为 `left` 时，位于浮动元素的左边行内元素会出现在右边、`float` 为 `right` 时，位于浮动元素的右边行内元素会出现在左边；

>2、对**块级元素**来说，定位为`float`的元素是浮动的，会浮动在块级元素之上。并且定位为`float`的元素如果完全覆盖住块级元素或覆盖部分时，块级元素中的文字部分将会显示在浮动元素的正下方(正常的块级元素文字是出现在块级元素内部的顶部位置)。

>3、`position` 为 `absolute` 的元素会覆盖文档流中的其他元素（无论行内元素和块级元素）。并且按照dom元素在文档中的位置，位置低的会覆盖位置高的。就如同位置越低的元素z-index值越大一样。  
 
>4、浮动的元素会漂浮在文档普通流的块级元素上。但是会漂浮在绝对定位的元素之下。
