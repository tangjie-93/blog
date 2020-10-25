---
title: javascript之事件总结
date: '2020-10-24'
type: 技术
tags: javascript
note: javascript之事件总结
---
#### 1、什么是事件？
事件是浏览器赋予元素的默认行为。
#### 2、什么是事件绑定？
给元素默认的事件行为绑定方法，这样局可以在行为触发的时候，执行这个方法。
+ `DOM0`级事件绑定 绑定的方法都是在目标阶段/冒泡阶段触发的
    **语法：** [元素].on[事件]=[函数]
    `document.body.onclick=function(){}`
    **移除绑定:** 赋值为`null`或者其他非函数值皆可
    `document.body.onclick=null`
    **原理：** 给`DOM` 元素的私有属性(`onxxx`)赋值。
        + 如果没有对应的私有属性,则无法基于这种办法实现事件绑定。
        + 只能给当前元素的某个事件行为绑定一个方法
        + 执行效率块，使用起来方便
+ `DOM2`级事件绑定 
    **语法：** [元素].addEvenetListener([事件],[方法],[捕获/冒泡]) 最后一个参数默认是`false`，控制方法在冒泡阶段执行。
    document.body.addEvenListener("click",fn,false)
    **移除事件绑定：** [元素].removeEvenetListener([事件],[方法],[捕获/冒泡]) 参数需要跟绑定时的一样
    `document.body.removeEvenListener("click",fn,false)`
    **原理：** 每一个`DOM`元素都会基于`__proto__`，查找到`EventTarget.prototype`上的`addEventListener/removeEventListener`等方法，基于这些方法实现事件的移除和绑定,`DOM2`事件绑定采用事件池机制。
        + 绑定的方法一般不是匿名函数,主要目的是方便移除事件绑定的时候使用
        + 凡是浏览器提供的事件行为，都可以基于这种模式完成事件的绑定和移除。
        + 可以给当前元素的某个事件类型绑定多个不同的方法。事件触发时，从事件池中取出对应的方法依次执行。

#### 3、事件分类
+ 鼠标事件
    + `click` 点击事件(PC:频繁点击`N`次，触发`N`次点击事件) 单击事件(移动端:`300ms`内没有发生第二次点击操作，算作单击事件，所以`click`事件在移动端有`300ms`延迟。)
    + `dblclick` 双击事件
    + `contextmenu` 鼠标右键点击触发
    + `mousedown` 鼠标按下
    + `mouseup` 鼠标抬起
    + `mousemove` 鼠标在元素内移动时持续触发
    + `mouseover` 鼠标移到有事件监听的元素或者它的子元素内。
    + `mouseout` 鼠标移出元素，或者移到它的子元素上。
    + `mouseenter` 鼠标进入
    + `mouseleave` 鼠标离开(冒泡)
    ...
+ 键盘事件
    + `keydown` 
    + `keyup`
    + `keypress`
    ...
+ 手指事件
    [`Touch event`单手指事件]
    + `touchstart`
    + `touchmove`
    + `touchend`
    [`gesture event` 多手指事件]
+ 表单事件
    + `focus` 获取事件
    + `blur` 失去焦点
    + `submit` 表单提交(提交的是表单里面的元素)
    + `reset` 表单重置(重置的是表单里面的元素)
    + `select` 下拉框内容改变
    + `change` 内容改变 
    + `input` 文本框
    ...
+ 资源事件
    + `load` 资源加载完成
    + `error` 资源加载出错
    + `abort` 资源加载中止
    ...
...

#### 4、事件对象
存储当前事件操作及触发的相关信息的(浏览器本身记录的)。
+ 鼠标事件对象 `mouseEvent`
    + `clientX/clientY`:鼠标触发点距离当前窗口左上角的距离
    + `pageX/pageY`:鼠标出发点距离BODY左上角的距离
    + `type` 事件类型
    + `path`:事件传播路径
    + `target/srcElement` 获取事件源
    + `ev.preventDefault()/ev.returnValue=false` 阻止默认行为
    + `ev.stopPropagation()/ev.cancelBubble=true` 阻止冒泡
+ 键盘事件对象 `keyBoardEvent`
    + `which/code` 获取按键的键值码
        + 方向键 左上右下=>37,18,39,40
        + `Alt` 18
        ...
    + `altKey` 是否按下`alt`键
    + `ctrlKey` 是否按下`ctrl`键
    + `shiftKey` 是否按下`shift`键
+ 手指事件对象(移动端) `TouchEvent`
    + `changeTouches` 存放的是一个数组 `TouchList`。
#### 5、事件传播机制
**事件捕获阶段**=>**目标阶段**=>**冒泡阶段**
事件委托：利用事件的冒泡机制,把子元素上的事件行为触发要做的操作委托给它的祖先元素，让其去执行相应的操作，可以在方法执行的时候，基于不同的事件源做不同的处理。事件委托可以提高性能。(减少堆内存的开辟,每一个元素的操作(回调函数)都会开辟一个堆内存空间)