---
title: 2.Vue3 reactive文件常用方法解读
date: '2020-12-10'
type: 技术
tags: vue3
note: Vue3 reactive文件常用方法解读
---
&#8195;&#8195;`reactive.ts`文件`vue3`中实现数据响应式的一个核心库。下面我将对它里面封装的一些方法进行解读。
## 1、toRaw
&#8195;&#8195;该方法返回响应式对象原来的对象。在`toRaw`方法中获取`observed["__v_raw"]`属性触发`observed`对象的`setter`钩子函数，然后返回`observed`的被代理对象。
```js
//本质上是一个递归函数，通过查找响应式对象上额"__v_raw"属性来返回目标对象
function toRaw(observed) {
    return ((observed && toRaw(observed["__v_raw" /* RAW */])) || observed);
}
//proxy中的getter钩子函数
function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key, receiver) {
        if (key === "__v_isReactive" /* IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "__v_isReadonly" /* IS_READONLY */) {
            return isReadonly;
        }
        else if (key === "__v_raw" /* RAW */ &&
            receiver === (isReadonly ? readonlyMap : reactiveMap).get(target)) {
            return target;
        }
        ...
    };
}
```
```js
//demo
const target={
    name: "james",
    age: 23,
    arr: [1, 2, 3]
}
const state = reactive(target)
const foo=ref({
    name:"james"
})
console.log(toRaw(state)===target);//true
```