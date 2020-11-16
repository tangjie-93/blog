---
title: dom常用操作元素的属性和方法
date: '2020-11-16'
type: 技术
tags: docker
note: dom常用操作元素的属性和方法
---

`DOM(Document Object Model)` 文档对象模型。提供系列的属性和方法，让我们可以在`js`中操作页面中的元素。

#### 1、获取dom元素的属性和方法
+ `document.getElementById(id)`
+ `[context].getElementByTagName(tagname)`
+ `[context].getElementByClassName(classname)` 在`IE6-8`下不兼容。
+ `document.getElementByName(name)` 在`IE`浏览器中只对表单元素的`name`有作用
+ `[context].querySelector(selector)` 在`IE6-8`下不兼容
+ `[context].querySelectorAll(selector)`在`IE6-8`下不兼容

+ `document.documentElement` =>`html`元素
+ `document.head`
+ `document.body`
+ `childNodes` 获取所有子节点
+ `children` 获取所欲元素子节点 =>`IE6-8`中会把注释节点当做元素节点获取
+ `parentNode`
+ `firstChild`/`firstElementChild`
+ `lastChild`/`lastElemntChild`
+ `previousSibling`/`previousElementSibling`
 `nextSibling`/`nextElementSibling`
//=>所有带`Element`的在`IE6-8`下都不兼容
#### 2、DOM的增删改查
```js
document.createElement(tagname)
document.createTextNode(text content)
innerHTML/innerText 
[parent].appendChild(newELe)
[parent].insertBefore(newEle,ele)
[ele].cloneNode(true/false);
[parent].removeChild(ele)
//设置自定义属性(property)
[ele].xx=xxx;
//删除自定义属性
delete [ele].xx
//设置元素属性
[ele].setAttribute("xxx","xxx");
[ele].getAttribute("xxx");
[ele].removeAttribute("xxx")
```
#### 3、获取元素样式和操作样式
```js
//=>修改元素样式
[ele].style.xxx=xxx;//修改或者设置行内样式
[ele].className=xxx;
//=>获取元素的样式
[ele].style.xxx
```