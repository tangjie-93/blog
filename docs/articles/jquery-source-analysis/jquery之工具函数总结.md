---
title: jquery之工具函数总结
date: '2020-10-22'
type: 技术
tags: jquery
note: jquery之工具函数总结
---
在看`jquery`源码时，发现有一些写的好的方法就忍不住记录下来，供自己以后在封装工具函数时参考。

#### 1、数据类型检测
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
#### 2、`jQuery.extend`扩展方法
```js
//不足，该方法只考虑Object和Array
jQuery.extend=jQuery.fn.extend=function(){
    const length = arguments.length;
    let target = arguments[0] || {};
    let i = 1;
    let deep = false;//是否深拷贝
    // 处理深拷贝的情况
    if (typeof target === "boolean") {
        deep = target;
        // 如果第一个参数为boolean类型,这第二个参数为目标对象
        target = arguments[i] || {};
        i++;
    }
    //处理target不是对象的情况
    if (typeof target !== "object" && !isFunction(target)) {
        target = {};
    }
    //当只传递一个对象时扩展jQuery本身 
    if (i === length) {
        //this表示jQuery或者jQuery.fn
        target = this;
        i--;
    }
    let options, name, src, copy, copyIsArray, clone;
    //循环遍历要被扩展的对象
    for (; i < length; i++) {
        // 处理target上不是 null/undefined 的值
        if ((options = arguments[i]) != null) {
            // 扩展target,缺点:会遍历原型上的一些属性
            for (name in options) {
                copy = options[name];
                // 避免原型对象污染和死循环
                if (name === "__proto__" || target === copy) {
                    continue;
                }
                //当deep为true 当数据类型是object或者array时，深拷贝
                if (deep && copy && (jQuery.isPlainObject(copy) ||
                    (copyIsArray = Array.isArray(copy)))) {
                    //获取目标对象上的属性值
                    src = target[name];
                     /**
                     * 分三种情况考虑
                     * 1、被扩展对象是数组,目标对象不是数组
                     * 2、被扩展对象是对象,目标对象不是对象
                     * 3、前两种之外的情况
                     *      + 被扩展对象是数组,目标对象是数组的情况
                     *      + 被扩展对象是对象,目标对象是对象的情况
                     */
                    if (copyIsArray && !Array.isArray(src)) {
                        //被扩展的是数组,那么目标对象对应的属性也必须是数组
                        clone = [];
                    } else if (!copyIsArray && !jQuery.isPlainObject(src)) {
                         //被扩展的是对象,那么目标对象对应的属性也必须是对象
                        clone = {};
                    } else {
                        //
                        clone = src;
                    }
                    copyIsArray = false;
                    // 递归
                    target[name] = jQuery.extend(deep, clone, copy);

                    // Don't bring in undefined values
                } else if (copy !== undefined) {
                    //在deep不为true的时候,直接把传递对象中的每一项替换$/$.fn的成员
                    target[name] = copy;
                }
            }
        }
    }
    return target;
}

//测试
const jQuery = {
    a: 1,
    b: 2,
    c: 3,
    d: {
        name: "james",
        age: 21
    },
    e: [1, 2, 3],
    f: []
}
const obj2 = {
    a: 12,
    b: 32,
    c: {
        name: "黎明"
    },
    d: {
        major: "student",
    },
    e: [32, 43, 45],
    f: {}
}
const obj3 = {
    a: 32,
    b:325,
    c: {
        name: "测试"
    },
    d: {
        major: "student2222",
    },
    e: [32, 43, 45,54],
    f: {a:12}
}
//深拷贝 扩展自身
jQuery.extend(true, obj2);
//扩展 obj2
jQuery.extend(obj2, obj3);
```
#### 3、`isPlainObject` 判断对象是否是纯对象
```js
//1、是否是纯对象 {}
function isPlainObject(obj){
    const getProto = Object.getPrototypeOf;//获取当前对象的原型对象
    const class2type = {};
	const toString = class2type.toString;//Object.prototype.toString
	const hasOwn = class2type.hasOwnProperty;//Object.prototype.hasOwnProperty
	const fnToString = hasOwn.toString;//Function.prototype.toString 用于转化字符串
	const ObjectFunctionString = fnToString.call(Object);
    //1、数据类型必须是object
    if (!obj || toString.call(obj) !== "[object Object]") {
        return false;
    }
    //获取对象的原型对象
    const proto = getProto(obj);
    //Object.create( null )是纯对象,
    //2、没有原型对象，那肯定是纯对象
    if (!proto) {
        return true;
    }
    //看prototype对象上是否有constructor，有的话就获取constructor
    const Ctor = hasOwn.call(proto, "constructor") && proto.constructor;
    //构造函数是函数类型,并且构造函数是Object
    return typeof Ctor === "function" && fnToString.call(Ctor) === ObjectFunctionString;
}
```
#### 4、判断对象是否是空对象
```js
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
#### 5、创建缓存
+ 缓存最大个数时固定的。
+ 当超出缓存最大个数限制时，将最早添加到缓存中的数据删除
```js
function createCache () {
    const keys = [], count = 5;
    function cache (key, value) {
        //避免跟原型上的属性冲突
        key = key + " ";
        //利用keys.push函数执行后的返回结果(数组的长度来跟缓存限制个数比价)
        if (keys.push(key) > count) {
            //在删除对象属性的同时，也从数组中删除数据
            delete cache[keys.shift()];
        }
        /**
         * 将cache看成一个普通对象使用,不再新建一个对象(开辟一个堆)，来保存缓存键值对
         */
        return cache[key] = value;
    }
    return cache;
}
//测试
const setCache = createCache();
let res = setCache("name1", 'james1');
res = setCache("name2", 'james2`');
res = setCache("name3", 'james3');
res = setCache("name4", 'james4');
res = setCache("name5", 'james');
res = setCache("name6", 'james5');
res = setCache("name7", 'james6');
res = setCache("name8", 'james7');
res = setCache("name9", 'james8');
console.log(res);//james8
console.log(setCache);
//[Function: cache] {
//     'name5 ': 'james',
//     'name6 ': 'james',
//     'name7 ': 'james',
//     'name8 ': 'james',
//     'name9 ': 'james'
//   }
```
#### 6、为不同的属性添加相同的方法
```js
function addHandle (attrs, handler) {
    const arr = attrs.split("|");
    let   i = arr.length;
    while (i--) {
        Expr.attrHandle[arr[i]] = handler;
    }
}
//测试 为"type|href|height|width"添加不同的方法
addHandle("type|href|height|width", function (elem, name, isXML) {
    if (!isXML) {
        //获取元素属性
        return elem.getAttribute(name, name.toLowerCase() === "type" ? 1 : 2);
    }
});
```
#### 7、动态创建script脚本并马上删除的方法
```js
const document = window.document;
const preservedScriptAttributes = {
    type: true,
    src: true,
    nonce: true,
    noModule: true
};
//动态创建一个script标签，然后添加到head标签下面,执行完code后立马删除
function DOMEval (code, node, doc) {
		doc = doc || document;
		let i, val,script = doc.createElement("script");
        script.text = code;
        //用于给script标签添加属性
		if (node) {
			for (i in preservedScriptAttributes) {
				val = node[i] || node.getAttribute && node.getAttribute(i);
				if (val) {
					script.setAttribute(i, val);
				}
			}
		}
		doc.head.appendChild(script).parentNode.removeChild(script);
	}
```
#### 8、正则表达式方式的字符串分割
该正则表达式可以用来分割字符串，比`split`的功能更强大。可以同时按照不同分隔符来分割字符串。
```js
//在中括号中的^表示非的意思,\X20表示空格,/g表示全局搜索,使用match方法时将返回匹配数组
const rnothtmlwhite=/[^\x20\r\n\t\f]+/
//测试
"test".match(rnothtmlwhite);//=>["test"]
"test\rceshi".match(rnothtmlwhite);//["test","ceshi"]
"once memory\r334".match(/[^\x20\t\n\f\r]+/g);//=>["once","memory","334"]
```
下面是该正则表达式在源码中的使用。
```js
/*1、先将字符串转换成数组,
* 2、然后再将数组转换成key数组元素，value为true的对象
*/
function createOptions(options){
    const option={};
    //options.match(rnothtmlwhite)//将字符串转换成数组
    jQuery.each(options.match(rnothtmlwhite)||[],function(_,flag){
        option[flag]=true;
    });
    return option;
}
createOptions("once\tmemory");//{ "once":true,"memory":true }
createOptions("once memory");//{"once":true,"memory":true}
```
#### 9、唯一值的设置
```js
let expando = "sizzle" + 1 * new Date(),
```
#### 10、使用正则表达式快速改变大小写
```js
const rmsPrefix = /^-ms-/,
		rdashAlpha = /-([a-z])/g;
//首字母大写
function camelCase (string) {
	return string.replace(rmsPrefix, "ms-").replace(rdashAlpha, fcamelCase);
}
//将字符串中符合条件的都转换成大写
function fcamelCase (_all, letter) {
    return letter.toUpperCase();
}
//测试
console.log(camelCase("-asx123"));//=>msAsx123
```
#### 11、如何在不改变字符串的情况下将字符串改变成数字
```js
function getData (data) {
    if (data === "true") {
        return true;
    }
    if (data === "false") {
        return false;
    }

    if (data === "null") {
        return null;
    }
    // Only convert to a number if it doesn't change the string
    if (data === +data + "") {
        return +data;
    }

    if (rbrace.test(data)) {
        return JSON.parse(data);
    }
    return data;
}
```
#### 12、`ownerDocument`和 `documentElement`的区别
+ `ownerDocument`是`Node`对象的一个属性，返回的是某个元素的**根节点文档对象**：即`document`对象
+ `documentElement`是 `Document`对象的属性，返回的是**文档根节点**。
+ 对于`HTML`文档来说，`documentElement`是`<html>`标签对应的`Element`对象，`ownerDocument`是`document`对象。
```js
document.getElementsByTagName("body")[0].ownerDocument===document;//true
document.documentElement;//=><html>...</html>
```
#### 13、使用正则表达式去除前后空格
```js
//表示以空格开头或者空格结尾的正则表达式
const rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
```
#### 14、使用正则表达式将特定位置字符转换为大写
```js
'background-image'.replace(/-([\da-z])/gi, fcamelCase = function( all, letter ) {
       return letter.toUpperCase();
})
```
