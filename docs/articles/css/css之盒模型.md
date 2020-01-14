​		共分为2种类型：W3C标准盒模型（默认） 和 IE标准盒模型（怪异盒模型）。CSS盒子模式包括如下属性：外边距（margin）、边框（border）、内边距（padding）、内容（content） 
**css3中有一个新属性对应着盒模型。box-sizing: content-box|border-box|inherit;**

> css3属性box-sizing的content-box属性对应着W3C标准盒模型；  
> css3属性box-sizing的border-box属性对应着IE标准盒模型；

> **1、：W3C标准盒模型-border-box:** （默认）

![](https://user-gold-cdn.xitu.io/2019/4/7/169f7d2f1a0610ec?w=1905&h=974&f=png&s=111613)
        

```css
元素的宽 = width + padding-left + padding-right + border-left + border-right
元素的高 = height + padding-top + padding-bottom + border-top + border-bottom
```

> **2、IE标准盒模型-border-box**

![](https://user-gold-cdn.xitu.io/2019/4/7/169f7d442ca565ab?w=1901&h=978&f=png&s=112557)
        

```css
元素的宽 = width(包含padding-left + padding-right + border-left + border-right)
元素的高 = height(包含padding-top + padding-bottom + border-top + border-bottom)
```

<Valine></Valine>