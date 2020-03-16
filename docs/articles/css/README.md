---
title: css之盒模型
date: '2020-01-14'
type: 技术
tags: css
note: css之盒模型
---

&#8195;&#8195;共分为2种类型：W3C标准盒模型（默认） 和 IE标准盒模型（怪异盒模型）。CSS盒子模式包括如下属性：外边距（margin）、边框（border）、内边距（padding）、内容（content） 
**css3中有一个新属性对应着盒模型。box-sizing: content-box|border-box|inherit;**

> css3属性box-sizing的content-box属性对应着W3C标准盒模型；  
> css3属性box-sizing的border-box(宽、高包括border)属性对应着IE标准盒模型；

> **1、W3C标准盒模型-content-box:** （默认）
在W3C标准下,我们定义的元素的`width`值即为盒模型中的`content`的宽度值，`height`即为盒模型中的`content`的高度值。
<img src="../../images/w3c标准盒模型.png">
<!-- ![](https://user-gold-cdn.xitu.io/2019/4/7/169f7d2f1a0610ec?w=1905&h=974&f=png&s=111613) -->
        
```css
元素的宽 = width(content的宽) + padding-left + padding-right + border-left + border-right
元素的高 = height(content的高) + padding-top + padding-bottom + border-top + border-bottom
```

> **2、IE标准盒模型-border-box**

<img src="../../images/ie标准盒模型.png" alt="暂无数据">
<!-- ![](https://user-gold-cdn.xitu.io/2019/4/7/169f7d442ca565ab?w=1901&h=978&f=png&s=112557) -->
        
```css
元素的宽 = width(padding-left + padding-right + border-left + border-right+content的宽)
元素的高 = height(padding-top + padding-bottom + border-top + border-bottom+content的高)
```

