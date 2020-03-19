---
title: javascript之异步解决方案总结
date: '2020-03-17'
type: 技术
tags: javascript
note: javascript之异步解决方案总结
---

### 1、回调函数（callback）

**缺点：** 
+ 回调地狱。
+ 缺乏顺序性，导致调试困难。
+ 嵌套函数存在耦合性，一旦有所改动，就会牵一发而动全身。
+ 嵌套函数过多的话，很难处理错误。

```js
function test(a,callback){
    callback&&callback();
}
```
### 2、生成器（generator）
**特点：** 可以控制函数的执行。
```js
```
### 3、promise
**缺点：** 无法取消`Promise`,错误需要通过回调函数来捕获。
```js
const promise=new Promise((resolve,reject)=>{
    resolve(10);
})
promise.then(res=>{
    console.log(res);
})
```
### 4、async/await

**优点:** 代码清晰。将异步变成了同步。
```js
async function test(){
    try{

    }catch(err){
        console
    }
}
```
