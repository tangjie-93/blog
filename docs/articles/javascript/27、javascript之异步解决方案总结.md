---
title: 28、javascript之异步解决方案总结
date: '2020-03-17'
type: 技术
tags: javascript
note: javascript之异步解决方案总结
---

### 1、回调函数（callback）
&#8195;&#8195;回调函数是把函数作为值，传递给另外一个函数，在另外一个函数执行的时候，再把传递进来的函数进行处理。
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
function query(interval) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(interval);
    }, interval);
  });
}
function* generator() {
  let value;
  value = yield query(1000);
  console.log("第一个请求", value);
  value = yield query(2000);
  console.log("第一个请求", value);
  value = yield query(3000);
  console.log("第一个请求", value);
}
let iterator = generator();
iterator.next().value.then((value) => {
    iterator.next(value).value.then(value=>{
        iterator.next(value).value.then(value=>{
            iterator.next(value);
        })
    });
});

```
### 3、Promise
**Promise的优点：**
+ 将异步操作以同步操作的流程表达出来，避免了层层嵌套的回调函数。此外，`Promise`对象提供统一的接口，使得控制异步操作更加容易。

**Promise的不足：**
+ 1、无法取消`Promise`，一旦新建它就会立即执行，无法中途取消。  
+ 2、如果不设置回调函数，`Promise`内部抛出的错误，不会反应到外部。  
+ 3、当处于`pending`状态时，无法得知目前进展到哪一个阶段（刚刚开始还是即将完成）。
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
function query(interval) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(interval);
    }, interval);
  });
}
async function test(){
    try{
      const value = await query(1000);
      return value;
    }catch(err){
        console.log(err)
    }
}
```
