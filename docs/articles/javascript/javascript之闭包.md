---
title: 14.javascript之闭包
date: '2020-08-05'
type: 技术
tags: javascript
note: 浏览器加载页面会把代码放到栈内存中执行，函数进栈执行会产生一个私有的上下文（EC），此上下文能保存里面的私有变量（也就是AO）不会被外界干扰，并且如果当前上下文中的某些内容，被上下文以外的内容所占用，当前上下文是不会出栈释放的，形成不销毁的执行上下文，这样可以保存和保护里面的变量和变量值，闭包是一种保存和保护内部私有变量的机制.
---
## 1、什么是闭包？
&#8195;&#8195;浏览器加载页面会把代码放到栈内存中执行，函数进栈执行会产生一个私有的上下文（EC），此上下文能保存里面的私有变量（也就是AO）不会被外界干扰，我们把函数的这种 "保护机制" 称为 **闭包**。 并且如果**当前上下文中的某些内容，被上下文以外的内容所占用，由于浏览器的垃圾回收机制导致当前上下文是不会出栈释放的，形成不销毁的执行上下文**，这样可以保存和保护里面的变量和变量值，闭包是一种**保存和保护**内部私有变量的机制。
**闭包的特点**
+ 上下文中的信息保留下来(包含私有变量和值)
+ 导致栈内存空间变大
+ 闭包的作用
    + 保护:保护私有上下文内部变量不被外界干扰。
    + 保存:形成不被释放的私有上下文，保存栈内存空间长存，保存里面的变量供函数下一次调用时使用。

## 2、闭包的应用

#### 2.1 函数嵌套
+ 函数嵌套例题1
```js
//形式1
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
```js
//形式2
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
+ 函数嵌套例题2
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
#### 2.2 变量重新赋值
```js
let a = 0, b = 0;
function A (a) {
    //function (b)被它上下文之外的变量(A)引用，形成了闭包,EC(A)的上下文不会被释放，a的值会被保存在内存中
    A = function (b) {
        console.log(a + b++);
    }
    console.log(a++);
}
A(1) //1 执行后A被重新赋值了
A(2) //4
```
#### 2.3 事件循环调用或循环操作
**1、闭包在事件循环调用的应用**
```js

const btnList=document.querySelectorAll("button");
for(var  i=0;i<btnList.length;i++){
    //当前块级私有上下文中的变量(function(){})被外部变量btnList[i].onClick引用了,会形成闭包
    btnList[i].onClick=function(){
        console.log(i);//5个5 闭包
    }
}
```
+ 方案1 利用闭包的保存机制
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
  //自执行函数每次执行，都会产生一个私有上下文，将全局变量i的值作为实参，传递给私有上下文中的形参i;每一个形成的私有上下文中，都会创建一个"箭头函数推",并且把其赋值给window.setTimeout,这样当前上下文的某些内容,就被上下文以外的内容占用了，形成闭包。
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
+ 方案2：自定义属性
```js
for(var i=0;i<btnList.length;i++){
    //将当前按钮的索引存储在它的自定义属性上
    btnList[n].index=i;
    btnList[n].onClick=function(n){
        console.log(this.index);
    }
}
```
+ 方案3 利用事件代理机制（性能提升）
```js
document.body.onClick=function(event){
    const target=event.target;
    if(target.tagName==="BUTTON"){
        const index=target.getAttribute('index');
        console.log(index)
    }
}
```
**2、闭包在循环操作的应用**
```js
for(var i=0;i<3;i++){
    setTimeout(()=>{
        console.log(i);//每隔一秒输出一个3
    },(i+1)*1000)
}
```
+ 方法1 给setTimeout传第三个参数，作为函数的形参
```javascript
for (var i = 0; i< 10; i++){
    setTimeout((i) => {
        console.log(i);
    }, 1000,i)
}
```

+ 方法2 利用立即执行函数，将i作为函数的形参

```js
//方式1
for (var i = 0; i< 10; i++){
    ((i)=>{
        //自执行函数执行后，会形成一个私有块级上下文,并形成一个箭头函数堆(内部堆)，并赋值给window.setTimeout(外部变量)，所以会形成闭包,因此i的值不会被释放
        setTimeout(() => {
            console.log(i);
        }, 1000)
    })(i)
}
//方式2
for (var i = 0; i < 10; i++) {
    setTimeout(((i) => {
        console.log(i);
    })(i), 1000)
}
```
+ 方法3 利用let,构建块级作用域
```javascript
for (let i = 0; i< 10; i++){
    setTimeout(() => {
        console.log(i);
    }, 1000,)
}
```
#### 2.4 惰性函数
核心思想：能够干一次的绝不干两次。惰性函数能够提升性能。
```js
//没有优化之前的
 function getStyle(ele, attr) {
    //函数每一次执行都会验证浏览器的兼容性
    if ('getComputedStyle' in window) {
        return window.getComputedStyle(ele)[attr];
    }
    return ele.currentStyle[attr];
}
————————————————————————————————————
//利用闭包优化
function getStyle(ele, attr) {
     //只会函数第一次执行验证浏览器的兼容性
    if ('getComputedStyle' in window) {
        //当前上下文中的内部变量 function (ele, attr){}被外部变量getStyle占用，会形成闭包
        getStyle = function (ele, attr) {
            return window.getComputedStyle(ele)[attr];
        }

    } else {
        getStyle = function (ele, attr) {
            return ele.currentStyle[attr];
        }
    }
}
```
## 3、自执行函数具名化

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
    var fn;//重新声明了
    console.log(fn);//undefined
})()
//情况 3
(function fn(){
    fn=10;
    var fn;
    console.log(fn);//10
})()
```

