---
title: float引起的问题和解决方案
date: '2020-01-14'
type: 技术
tags: css
note: float引起的问题和解决方案
---

**float**:定义元素在哪个方向浮动。浮动元素会生成一个块级框，而不论它本身是何种元素。浮动的元素可以向左或向右移动，直到他的**外边缘碰到包含框或另一个浮动框的边框**为止。由于浮动框不在文档的普通流中，所以文档普通流的块级元素表现得就像浮动元素不存在一样。**但是块级元素中的文本内容会漂浮到移动元素的正下面。**    
**引起的问题：**

>1、父元素的高度无法被撑开，影响与父元素同级的元素。     
>2、与浮动元素同级的非浮动元素（行内元素）会跟随其后。   
>3、若非第一个元素浮动，则该元素之前的元素也需要浮动，否则会影响页面显示的结构。

**解决方案：**    

>1、额外标签法。（使元素两边都没有浮动元素）可以解决问题2、3。（缺点：不过这个办法会增加额外的标签使HTML结构看起来不够简洁。）

```css
#test1{
    float: left;
    width: 100px;
    height: 100px;
    background: red;
}
<div id="test1"></div>
<div style="clear:both;"></div>
<span>我是span元素</span>
```

效果如下所示：（span）行内标签将另起一行

![](https://user-gold-cdn.xitu.io/2019/4/7/169f82fa30f92e5d?w=1886&h=728&f=png&s=92615)

> 2、使用after伪类,**该方法只适用于非IE浏览器**，可以解决问题1。该方法中必须为需要清除浮动元素的伪对象中设置height:0，否则该元素会比实际高出若干像素；

```css
#test1{
    float: left;
    width: 100px;
    height: 100px;
    background: red;
}
#parent:after {
    content: ".";
    height: 0;
    visibility: hidden;
    display: block;
    clear: both;
}
#test2{
    width: 100px;
    height: 100px;
    background: blue;
}
<div id="parent">
<div id="test1"></div>
</div>	
<span>我是span标签</span>
<div id="test2">我是块级元素</div>
```

**不给父元素添加after伪类时的效果如下所示：行内元素（span）紧挨着浮动元素、块级元素位于浮动元素之下。**


![](https://user-gold-cdn.xitu.io/2019/4/7/169f837603d405e5?w=1916&h=727&f=png&s=96304)

**效果如下所示：父元素同级的元素（span div#test2）将都另起一行。**

![](https://user-gold-cdn.xitu.io/2019/4/7/169f83160d7eb2b5?w=1889&h=726&f=png&s=96500)

> 3、浮动外部元素。     
> 4、给包含浮动元素的父标签添加css属性 overflow:auto/hidden; zoom:1; zoom:1用于兼容IE6。

```css
#test1{
    float: left;
    width: 100px;
    height: 100px;
    background: red;
}
#parent {
    overflow: hidden;
    zoom: 1;
}
#test2{
    width: 100px;
    height: 100px;
    background: blue;
}
<div id="parent">
<div id="test1"></div>
</div>	
<span>我是span标签</span>
<div id="test2">我是块级元素</div>
```

**效果如下所示：父元素同级的元素（span div#test2）将都另起一行。**

![](https://user-gold-cdn.xitu.io/2019/4/7/169f839ef647d6dd?w=1912&h=672&f=png&s=93624)
