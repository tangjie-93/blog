---
title: undefined和null的区别
date: '2020-01-14'
type: 技术
tags: javascript
note: Undefined 类型只有一个值，即特殊的undefined。实际上，undefined值是继承自null值得。undefined==null 为true。null值表示一个空对象指针，要意在保存对象的变量还没有真正保存对象。而这也正是使用 typeof 操作符检测 null值时会返回"object"的原因。null===null为true。
---
#  undefined和null的区别

<ul>
    <li><a href="#a1">Undefined</a></li>
    <li><a href="#a2">Null</a></li>
</ul>

<h4><span id="a1">1、Undefined</span></h4>
​		Undefined 类型只有一个值，即特殊的undefined。实际上，undefined值是继承自null值得。undefined==null 为true。
根据工作中总结，只要有这几种情况下会出现undefined。并且undefined===undefined为true 

>1.定义变量，但是没有初始化时,如var a；     
>2.调用某个函数时，实参个数小于形参个数时，未实参化的形参在函数调用过程中的值是undefined；     
>3.调用某个对象还没有添加的属性时，也会返回undefined； 

```js
var obj={}   
console.log(obj.name);//undefined
```
>4.调用某个没有返回值的函数，也会返回undefined；

```js
function Person(name,age){
    this.name=name;
    this.age=age;
}
var p=Person("李四",23);//此时的p=undefined；
```
>5.对<strong>未初始化的变量</strong>执行 typeof 操作符会返回 undefined 值;   
>6.对<strong>未声明的变量</strong>执行 typeof 操作符同样也会返回 undefined 值。

```js
var message; // 这个变量声明之后默认取得了 undefined 值   
//未初始化的变量
alert(typeof message);     // "undefined"  
//未申明的变量
alert(typeof age);         // "undefined"   
```

<h4><span id="a2">2、Null 类型</span></h4>  
​		是第二个只有一个值的数据类型，这个特殊的值是 null。从逻辑角度来看，null值表示一个空对象指针，要意在保存对象的变量还没有真正保存对象。而这也正是使用 typeof 操作符检测 null值时会返回"object"的原因。null===null为true。这几种情况下会出现null的情况

>1、手动设置变量的值或者对象某一个属性值为null（在初始化对象时，手动设置对象为null。在作用域中不再需要使用某个对象时，把null赋值给那个变量解除引用，以释放内存）    
>2、在javascript的DOM元素获取中，如果没有获取到指定的元素对象，结果一般是null。    

```js
var d=document.getElementById("d");
console.log(d);//当没有id为"d"的标签时返回null
```
>3、Object.prototype._proto_的值也是null。（每一个对象都有__proto__属性，指向对应的构造函数的prototype属性,但是因为Object是所有类的基类,其没有对应的构造函数，所有Object.prototype._proto_值为空）；

```js
console.log("a".__proto__);
//指向的是String的prototype属性
//String {"", length: 0, constructor: ƒ, anchor: ƒ, big: ƒ, blink: ƒ, …}
```

>4、在正则捕获的时候，如果没有捕获到结果，默认也是null。

<Valine></Valine>