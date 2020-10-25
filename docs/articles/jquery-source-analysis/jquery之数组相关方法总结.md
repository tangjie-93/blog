---
title: jquery之数组循环方法总结
date: '2020-10-18'
type: 技术
tags: javascript
note: jquery之数组循环方法总结
---
#### 1、`toType` 数据类型检测
```js
//数据类型检测
function toType (obj) {
    //obj为null或者undefined
    if (obj == null) {
        return obj + "";
    }
    const { toString } = Object.prototype;
    const baseType = typeof obj;
    return /^(object|function)$/.test(baseType) ?
        toString.call(obj).toLowerCase().slice(8, -1) : baseType
}
```
#### 2、`isFunction`判断是否为函数
```js
//判断是否是函数
function isFunction (obj) {
    //typeof obj.nodeType !== "number"; 兼容ie浏览器
	return typeof obj === "function" && typeof obj.nodeType !== "number";
};
```
#### 3、`isWindow`判断是否为`window`
```js
//判断是否是window
function isWindow (obj) {
    //window等于window.window
    return obj != null && obj === obj.window;
};
```
#### 4、`isArrayLike`判断是否为类数组
```js
//判断是否是类数组
function isArrayLike (obj) {
    //1、获取length的值(false或者length的实际值)
    const length = !!obj && "length" in obj && obj.length;
    const type = toType(obj);
    //2、不能是函数或者window(他们都有length属性)
    if (isFunction(obj) || isWindow(obj)) {
        return false;
    }
    /**
     * type === "array" 表示是数组
     * length===0 表示是一个length为0的类数组
     * typeof length === "number" && length > 0  表示length必须大于0的非空的类数组
     * (length - 1) in obj 表示最大索引也存在(表示其按照索引递增)
     */
    return type === "array" || length === 0 ||
        (typeof length === "number" && length > 0 && (length - 1) in obj);
}
//测试
isArrayLike({
    length:0
});//true
isArrayLike({
    "1":1,
    length:0
});//true
isArrayLike({
    "1":1,
    length:1
});//true
isArrayLike({
    length: 1
});//false 不是类数组
```
#### 5、数组、类数组和对象的循环遍历
下方函数用到的方法都在上面
```js
//循环遍历，支持数组、类数组和对象
function each (obj, callback) {
    if (isArrayLike(obj)) {
        for (i = 0,len=obj.length; i < len; i++) {
            if (callback.call(obj[i], i, obj[i]) === false) {
                //循环终止
                break;
            }
        }
    } else {
        const keys=[
            ...Object.keys(obj), ...Object.getOwnPropertySymbols(obj)
        ];
        for(let i=0,len=keys.length;i<len;i++){
            //回调执行返回false这终止循环
            if (callback.call(obj[i], i, obj[key]) === false) {
                //循环终止
                break;
            }
        }
    }
}
//测试
each([1, 2, 3, 4], (index, item) => {
    if (item > 3) return false;
    console.log(item);//输出 1,2,3
})
```
#### 6、数组过滤方法
```js
function grep (elems, callback, invert) {
    let callbackInverse, i = 0;
    //matches接收匹配的结果
    const matches = [], length = elems.length,callbackExpect = !invert;//invert也表示取反
    // Go through the array, only saving the items
    // that pass the validator function
    for (; i < length; i++) {
        //!对回调返回结果取反
        callbackInverse = !callback(elems[i], i);
        if (callbackInverse !== callbackExpect) {
            matches.push(elems[i]);
        }
    }
    return matches;
};
//测试
const arr = [0, 1, 2, 3, 4];
const res1 = grep(arr, (item, i) => {
    return i % 2;
});//[1,3]
const res2 = grep(arr, (item, i) => {
    return i % 2;
}, true)
console.log(res2);[0,2,4]
```
#### 7、数组对象map方法
```js
//数组扁平化
function flat(arr){
    const flatArr=[].flat;
    return flatArr?[].flat.call(arr):[].concat.apply([],arr);
}
function map (elems, callback, arg) {
    const ret = [];//返回数组
    let value, length, i = 0;
    // 遍历数组和类数组
    if (isArrayLike(elems)) {
        length = elems.length;
        for (; i < length; i++) {
            //回调结果
            value = callback(elems[i], i, arg);
            //过滤掉null和undefined值
            if (value != null) {
                ret.push(value);
            }
        }
        // 遍历对象,
    } else {
        const keys = [
            ...Object.keys(elems),
            ...Object.getOwnPropertySymbols(elems)
        ]
        length = keys.length;
        for (; i < length; i++) {
            value = callback(elems[i], i, arg);
            //过滤掉null和undefined值
            if (value != null) {
                ret.push(value);
            }
        }
    }
    //数组扁平化
    return flat(ret);
};
//测试
const res = map([1, 2,3], (item, i) => {
    return {
        key: i,
        value: item
    }
})
console.log(res);[
    {key:1,value:1},{key:2,vallue:2},{key:3,value:3}
]
```
#### 8、数组排序并去重
```js
function uniqueSort (results) {
    let elem, i = 0;
    results.sort((a, b) => a - b);
    while (elem = results[i++]) {
        if (elem === results[i]) {
            results.splice(elem, 1);
            i--;
        }
    }
    return results;
}
//测试
sortOrder([3, 2, 1, 5, 2, 6, 6, 7, 8, 1, 4]);
```
#### 9、数组合并
```js
//将第二个数组/类数组合并到第一个数组/类数组
function merge(first, second) {
    const len = +second.length;
    let j = 0,i = first.length;
    //在第一个数组后面添加第二个数组
    for (; j < len; j++) {
        first[i++] = second[j];
    }
    first.length = i;
    return first;
};
//测试 合并类数组
let obj1 ={ 0: 1, 1: 2,length: 2}
let obj2 = { 0: 3,1: 4,length: 2}
merge(obj1, obj2);
console.log(obj1);//{ '0': 1, '1': 2, '2': 3, '3': 4, length: 4 }
let obj1 ={ 0: 1, 1: 2,length: 2}
let obj2 = [3,4];
merge(obj1, obj2);
console.log(obj1);//{ '0': 1, '1': 2, '2': 3, '3': 4, length: 4 }
```
#### 10、构建数组
```js
//results是数组或者类数组 默认为空数组
 function makeArray(arr, results=[]) {
    const ret = results;
    if (arr != null) {
        if (isArrayLike(Object(arr))) {
            //合并数组
            jQuery.merge(ret,
                typeof arr === "string" ?
                    [arr] : arr
            );
        } else {
            push.call(ret, arr);
        }
    }

    return ret;
};
```