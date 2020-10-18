---
title: jquery之对象检测方法总结
date: '2020-10-18'
type: 技术
tags: javascript
note: jquery之对象检测方法总结
---
```js
function isPlainObject(obj){
    var proto, Ctor;
    var getProto = Object.getPrototypeOf;
    var class2type = {};
	var toString = class2type.toString;
	var hasOwn = class2type.hasOwnProperty;
	var fnToString = hasOwn.toString;
	var ObjectFunctionString = fnToString.call(Object);
    // Detect obvious negatives
    // Use toString instead of jQuery.type to catch host objects
    if (!obj || toString.call(obj) !== "[object Object]") {
        return false;
    }

    proto = getProto(obj);

    // Objects with no prototype (e.g., `Object.create( null )`) are plain
    if (!proto) {
        return true;
    }

    // Objects with prototype are plain iff they were constructed by a global Object function
    Ctor = hasOwn.call(proto, "constructor") && proto.constructor;
    return typeof Ctor === "function" && fnToString.call(Ctor) === ObjectFunctionString;
}
//判断是否是空对象
function isEmptyObject(obj){
    //源码,没有考虑key为Symbol的情况
    // var name;
    // for (name in obj) {
    //     return false;
    // }
    // return true;
    //Object.keys(obj) 获取对象自身可枚举的属性
    const keys=[
        ...Object.keys(obj), ...Object.getOwnPropertySymbols(obj)
    ]
    return keys.length===0;
}
```