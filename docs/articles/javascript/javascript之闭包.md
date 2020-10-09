---
title: 闭包
date: '2020-08-05'
type: 技术
tags: javascript
note: 浏览器加载页面会把代码放到栈内存中执行，函数进栈执行会产生一个私有的上下文（EC），此上下文能保存里面的私有变量（也就是AO）不会被外界干扰，并且如果当前上下文中的某些内容，被上下文以外的内容所占用，当前上下文是不会出栈释放的，形成不销毁的执行上下文，这样可以保存和保护里面的变量和变量值，闭包是一种保存和保护内部私有变量的机制.
---
## 1、什么是闭包？
&#8195;&#8195;浏览器加载页面会把代码放到栈内存中执行，函数进栈执行会产生一个私有的上下文（EC），此上下文能保存里面的私有变量（也就是AO）不会被外界干扰，我们把函数的这种 "保护机制" 称为 **闭包**。 并且如果**当前上下文中的某些内容，被上下文以外的内容所占用，当前上下文是不会出栈释放的，形成不销毁的执行上下文**，这样可以保存和保护里面的变量和变量值，闭包是一种**保存和保护**内部私有变量的机制。
**闭包的特点**
+ 上下文中的信息保留下来(包含私有变量和值)
+ 导致栈内存空间变大
+ 闭包的作用：保存和保护

## 2、闭包的常见应用 
#### 1、点击事件
```js
function btnClick(){
    let a=0;
    const btn=document.querySelector(".btn");
    //可以将btn.onClick看成是当前上下文中的一个外部变量
    btn.onClick=function(){
        console.log(a++);
    }
}
btnClick();
```

下面是一些比较经典的关于闭包的面试题,可以让我们很好的理解闭包的概念及闭包的使用。
**经典面试题1**
```js
let x = 5;
function fn (x) {
    return function (y) {
        console.log(y + (++x))
    }
}
//被上下文以外的f占用，所以fn的私有上下文不会出栈释放，形成闭包。
let f = fn(6);
f(7);//14 (7+(++6))
fn(8)(9); //18
f(10); //18 (10+(++7))
console.log(x)//5
```
**经典面试题2**
```js
let x = 5;
function fn () {
    return function (y) {
        console.log(y + (++x))

    }
}
let f = fn(6);
f(7);//13 (7+(++5))
fn(8)(9); //16 (9+(++6))
f(10); //18 (10+(++7))
console.log(x)//8
```
##### 经典面试题3
```js
let a = 0, b = 0;
function A (a) {
    //function (b)被它上下文之外的变量(A)引用，形成了闭包
    A = function (b) {
        console.log(a + b++);
    }
    console.log(a++);
}
A(1) //1
A(2) //4
```
##### 经典面试题 4
```js
const btnList=document.querySelectorAll("button");
for(var  i=0;i<btnList.length;i++){
    //当前块级私有上下文中的变量(function(){})被btnList[i].onClick引用了
    btnList[i].onClick=function(){
        console.log(i);//5个5 闭包
    }
}
```
+ **方案1 利用闭包的保存机制**
```js
//方法1 let形成块级上下文
//循环一次形成1个私有块级上下文，i是每一个块级上下文中的私有变量
for( let i=0;i<btnList.length;i++){
    //当前块级私有上下文中的变量(function(){})被btnList[i].onClick引用了
    //btnList[i].onClick是全局对象
    btnList[i].onClick=function(){
        console.log(i);// 0~4
    }
}
//方法2 
for( var i=0;i<btnList.length;i++){
    //自执行函数每执行一次都会形成自己的块级上下文
    (function(n){
        //n是每一次函数执行后形成的私有变量
         btnList[n].onClick=function(){
            console.log(n);// 0~4
        }
    })(i)
}
//方法3 
for( var i=0;i<btnList.length;i++){
    //自执行函数每执行一次都会形成自己的块级上下文
    btnList[n].onClick=(function(n){
        //n是每一轮形成的闭包中的私有变量
        return function(){
            console.log(n);// 0~4
        }
    })(i)
}
```
+ **方案2：自定义属性**
```js
for(var i=0;i<btnList.length;i++){
    //将当前按钮的索引存储在它的自定义属性上
    btnList[n].index=i;
    btnList[n].onClick=function(n){
        console.log(this.index);
    }
}
```
+ **方案3 利用事件代理机制（性能提升）**
```js
document.body.onClick=function(event){
    const target=event.target;
    if(target.tagName==="BUTTON"){
        const index=target.getAttribute('index');
        console.log(index)
    }
}
```
##### **经典面试题5 闭包的嵌套问题**
```js
function fun (n, o) {
    console.log(o);
    return {
        fun: function (m) {
            return fun(m, n)
        }
    }
}
/**
 * 执行fun(0) 输出undefined，返回一个对象(形成闭包，n和o的值一直保存着)
 * 执行fun(0).fun(1),再次调用fun(1,0) 输出 0,返回一个对象(c)
 * 执行c.fun(2) 再次调用fun(2,1),输出 1。
 * 执行c.fun(3) 再次调用fun(3,1),输出 1。
 */
var c = fun(0).fun(1);
c.fun(2);
c.fun(3);
```
## 2、自执行函数
**匿名函数具名化(设置了名字)的特点**
+ 设置的名字只能在函数内部使用，外部无法访问。
+ 基于这种模式代替严格模式不兼容的`arguments.callee`,并以此实现递归。
+ 在函数内部去修改这个值，默认是不能修改的，代表的依然是函数本身。
+ 除非这个函数名字在函数体中被重新声明过，重新声明后，一切都按照重新声明的为主。
```js
//情况 1
(function fn(){
    fn=10;
    console.log(fn);//f fn(){...}
})()
//情况 2
(function fn(){
    var fn;
    console.log(fn);//undefined
})()
//情况 3
(function fn(){
    fn=10;
    var fn;
    console.log(fn);//10
})()
```

