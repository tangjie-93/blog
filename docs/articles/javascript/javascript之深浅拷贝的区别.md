---
title: javascript之深浅拷贝的区别
date: '2020-10-19'
type: 技术
tags: javascript
note: javascript之深浅拷贝的区别
---
在说拷贝之前需要说一下赋值的问题。

  >**基本类型赋值：** 赋值之后两个变量互不干扰。    
  >**引用类型赋值：** 复制的是指针，两个对象指同一个内存地址，所有互相影响。

## 1、浅拷贝
  有以下两个特点：      

>1、重新在堆中开辟内存，**拷贝前后对象的基本数据类型**互不影响。   
>2、**只拷贝一层**，不能对对象中的子对象进行拷贝,子对象还会互相影响（复制）。

 普通对象可以使用以下方法浅克隆
 ```js
 var objData={
    name:"李明",
    age:40,
    arr:[1,2,3,4]			
}
let obj={...objData}
let obj=Object.assign({},objData)
 ```
普通数组对象可以使用以下方法克隆
```js
let objData=[1,2,[3,4]];
let obj=[...objData];
let obj=Object.assign([],objData);
let obj=[].contac(objData);
let obj=objData.slice();
```
```js
//判断数据类型
function toType (obj) {
    const toString = Object.prototype.toString;
    const type = typeof obj;
    return /^(object|function)/.test(type) ? toString.call(obj).slice(8, -1).toLowerCase() : type;
}
//获取属性
function getOwnProperty (obj) {
    if (obj == null) return [];
    return [
        ...Object.keys(obj), ...Object.getOwnPropertySymbols(obj)
    ]
}
//浅拷贝
function shallowCopy (objData) {
    //类型判断
    const type = toType(objData);
    if (/^(string|number|boolean|null|undefined|symbol|bigint)$/.test(type)) return objData;
    if (/^function$/.test(type)) return () => objData.call(this,...arguments);
    if (/^(date|regexp)$/.test(type)) return new objData.constructor(objData);
    if (/^error$/.test(type)) return new objData.constructor(objData.message);
    //只处理数组、对象
    const keys = getOwnProperty(objData);
    const clone = Array.isArray(objData) ? [] : {};
    let obj = keys.reduce((cur, key) => {
        cur[key] = objData[key];
        return cur
    }, clone);
    return obj;
}
//测试
var person={
    name:"李明",
    age:40,
    arr:[1,2,3,4]			
}
var sCopyData=shallowCopy(person);
sCopyData["name"]="张三";
sCopyData["arr"][0]=23;		
console.log(sCopyData);
console.log(person);
```
输出结果如下：

<img width="300px"  src="https://user-gold-cdn.xitu.io/2019/4/9/16a02ca9220fdf5b?w=459&h=260&f=png&s=27003">

**分析：** 可以看出修改拷贝后对象的name属性，没有改变原来对象的name属性。改变拷贝后对象的arr属性后，拷贝前对象的arr属性也改变了。这是因为name属性对应的值是你基本数据类型，所以互不影响。而arr对应的属性是数组是引用类型，拷贝前后对象的arr属性指向的还是同一个内存地址。所以互相影响。

## 2、深拷贝

有以下两个特点：
>1.	在堆中开辟空间，**拷贝前后的两个对象互不影响。**
>2.	不止拷贝一层，对对象中的子对象进行递归拷贝。

```js   
function deepCopy(objData,cache=new Set()){
    const type=toType(objData);
    if(!/^(array|object)$/.test(objData)) return shallowCopy(objData);
    //避免自己调用自己出现死循环
    if(cache.has(objData)) return shallowCopy(objData);
    cache.add(objData);
     //只处理数组对象
    const keys=getOwnProperty(objData);
    const clone=Array.isArray(objData)?[]:{};
    let obj=keys.reduce((cur,key)=>{
        // if(objData===objData[key]) {
        //     cur[key]=shallowCopy(objData);
        // };
        cur[key]=deepCopy(objData[key],cache);
        return cur
    },clone);
    return obj;
}
var person={
    name:"李明",
    age:40,
    arr:[1,2,3,4]			
}
var sCopyData=deepCopy(person);
sCopyData["name"]="张三";
sCopyData["arr"][0]=23;		
console.log(sCopyData);
console.log(person);
```
输出结果如下所示。从输出结果可以看出，name属性和arr属性都改变了，但是拷贝前后对象互不影响。

<img width="300px"  src="https://user-gold-cdn.xitu.io/2019/4/10/16a02e517d94498d?w=472&h=264&f=png&s=27078" />

<img width="300px"  src="../../images/深拷贝.png">

## 3、对象合并
```js
function  isPlainObject(obj) {
	let proto, Ctor;
    const class2type = {};
	const toString = class2type.toString;
	const hasOwn = class2type.hasOwnProperty;
	const fnToString = hasOwn.toString;
	const ObjectFunctionString = fnToString.call(Object);
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
},
function merge(obj1,obj2){
    const isPlain1=isPlainObject(obj1);
    const isPlain2=isPlainObject(obj2);
    if(!isPlain1) return obj2;
    if(!isPlain2) return obj1;
    const keys=getOwnProperty(obj2);
    keys.forEach(key=>{
        obj1[key]=merge(obj1[key],obj2[key])
    });
    return obj1;
}
```