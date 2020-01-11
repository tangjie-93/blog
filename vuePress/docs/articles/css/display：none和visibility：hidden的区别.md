> **display:none** 隐藏对应的元素，在文档布局中不再给它分配空间，它各边的元素会合拢，就当他从来不存在。  
> **visibility:hidden**  隐藏对应的元素，但是在文档布局中仍保留原来的空间。

```css
#test1{
    width: 100px;
    height: 100px;
    background: red;
    display: none;
}
#test2{
    width: 100px;
    height: 100px;
    background: red;
    visibility: hidden;
}
<div id="test1"></div>
<span>我是span元素1</span>
<div id="test2"></div>
<span>我是span元素2</span>
```

**效果如下所示：**
![](https://user-gold-cdn.xitu.io/2019/4/7/169f845df6a6bed9?w=1916&h=642&f=png&s=83680)