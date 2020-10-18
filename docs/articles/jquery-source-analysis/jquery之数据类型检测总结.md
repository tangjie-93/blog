---
title: jquery之数据类型检测
date: '2020-10-18'
type: 技术
tags: javascript
note: 看着jquery的数据类型检测源码，自己看着修改了并总结了一下
---
```js
//下面的函数是源码中的数据类型检测方法
function toType (obj) {
    const dataTypes = ["Boolean", "Number", "String", "Function", "Array", "Date", "RegExp", "Object", "Error", "Symbol"]
    const class2type = dataTypes.reduce((obj, name) => {
        obj["[object " + name + "]"] = name.toLowerCase();
        return obj;
    }, {});
    const { toString } = Object.prototype;
    //obj为null或者undefined
    if (obj == null) {
        return obj + "";
    }
    const type = typeof obj
    // Support: Android <=2.3 only (functionish RegExp)
    return /^(object|function)$/.test(type) ?
        class2type[toString.call(obj)] || "object" : type
}
//这是我自己总结的数据类型检测方法
function toType2 (obj) {
    //obj为null或者undefined
    if (obj == null) {
        return obj + "";
    }
    const { toString } = Object.prototype;
    const baseType = typeof obj;
    return /^(object|function)$/.test(baseType) ?
        toString.call(obj).toLowerCase().slice(8, -1) : baseType
}
//测试
console.log(toType2(12));
console.log(toType2(12n));
console.log(toType2('123'));
console.log(toType2(true))
console.log(toType2(Symbol(123)));
console.log(toType2(function () { }));
console.log(toType2({}))
console.log(toType2(/\d+/))
console.log(toType2(new Error()))
console.log(toType2(new Date()))
console.log("_____________________")
console.log(toType(11));
console.log(toType(11n));
console.log(toType('3'));
console.log(toType(true))
console.log(toType(Symbol(3)));
console.log(toType(function () { }));
console.log(toType({}))
console.log(toType(/\d+/))
console.log(toType(new Error()))
console.log(toType(new Date()))
//toType2和toType都能准确的测试出数据类型
```