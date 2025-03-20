---
title: 39.js四种数据类型检测的底层机制总结
date: '2020-09-13'
type: 技术
tags: javascript
note: js中的四种检测数据类型的方式分别是typeof、instanceof、constructor、Objec.prototype.toString.call(val)。
---
## 1、typeof
&#8195;&#8195;用于检测数据类型的运算符。`typeof`的原理是按照计算机底层存储的二进制结果进行检测的，对象都是以`000...`开始的。
+ 返回结果是一个字符串，字符串包含了对应的数据类型 `number/string/boolean/undefined/symbol/bigint/object/function`
+ `typeof null` 为 `object`。 
+ 所有对象都是以 `000`开始的，所以基于 `typeof` 检测的结果都是`object`。

## 2、instanceof
&#8195;&#8195;并不是用于检测数据类型的，是用来检测当前实例是否属于这个类。一般用来检测"普通对象、数组对象、正则对象、日期对象等"。无法应用到原始值类型数值的检测上。
+ 一旦 **类的`prototype`** 发生了改变，那么这个检测就不准了。
+ 基于 "实例 `instanceof` 类" 检测的时候，浏览器地层是这样处理的 "类[`Symbol.hasinstance`]()"
+ `Function.prototype[Symbol.hasinstance]=function [Symbol.hasinstance](){ [native code ]}`
+ `Symbol.hasInstance` 方法执行的原理,是判断 **类的prototype是否在实例的原型链上。**
```js
let arr = [];
console.log(arr instanceof Array);//true
console.log(Array[Symbol.hasInstance](arr));//true
console.log(arr instanceof Object);//true
```
`instanceof`的检测原理：
```js
function instance_of (obj, constructor) {
    if (obj === null || !['object', 'function'].includes(typeof obj)) return false;
    if (typeof constructor !== "function") throw new TypeError("Right-hand side of 'instanceof' is not callable");
    let proto = Object.getPrototypeOf(obj), prototype = constructor.prototype;
    while (true) {
        if (proto === null) return false;
        if (proto === prototype) return true;
        proto = Object.getPrototypeOf(proto);
    }
}
console.log(instance_of(10, Number));//false
console.log(instance_of([], {}));//TypeError: Right-hand side of 'instanceof' is not callable
```
## 3、constructor
用于获取实例的构造函数，基于这些特点可以充当类型检测。但是可以手动修改实例的`constructor`属性。
```js
let arr=[];
console.log(arr.constructor===Array) //true
console.log(arr.constructor===Object)//false 

let n=10;
let m=NUmber(10);
console.log(m.constructor===Number) //true 
console.log(n.constructor===Number) //true 在调用n.constructor时，实际上对n做了一层包装=> Number(n)
```
## 4、Object.prottype.toString.call(value)
+ 专门用于检测数据类型的。
+ `Number/String/Boolean/Date/Symbol/BigInt/Function/Array/RegExp/Object...`的原型上都有`toString`,除了`Object.protortpe.toString`不是转换字符串的，其余都是。`Object.protortpe.toString`是用来检测数据类型的。
+ 返回结果 "[object 对象[Symbol.toStrigTag]||对象的构造函数(不受自己更改的影响，对内置类有效)|Object]"
```js
class Person{
    get [Symbol.toStringTag](){
        return "Person"
    }
}
const p1=new Person();
const toString={}.toString();
console.log(toString.call(p1));// [object Person]
```
检测类型的函数封装
```js
function isType (typing) {
    return (val) => {
        return Object.prototype.toString.call(val) == `[object ${typing}]`;
    }
}
let utils = {};
['String', "Number", "Boolean", 'Object', "Date", "Function"].forEach(method => {
    utils['is' + method] = isType(method);
})
//测试
console.log(utils.isString('123'));//true
console.log(utils.isNumber(123));//true
```
