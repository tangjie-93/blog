---
title: vue3数据代理功能的实现
date: '2020-12-7'
type: 技术
tags: vue3
note: vue3数据代理功能的实现
---
`vue2.x`是通过`Object.defineProperty`对数据进行劫持的,但是因为它的诸多不足，所以`vue3`使用了`ES6`的`Proxy`来对数据进行劫持。
接下来就是`vue3`对数据实行劫持的源码实现。

## 1、数据响应式
```js
//reactivive.js
import { mutableHandler } from './baseHandlers.js';
export function reactive(obj){
   return createReaciveObject(obj,mutableHandler)
}
//创建响应式对象
function createReaciveObject(target,baseHandler){
    if(!isObject(target)) return;
    const observerd=new Proxy(target,baseHandler);
    return observerd;
}
```
## 2、数据劫持
```js
//baseHandlers.js
import { isObject } from '../shared/utils.js';
import { reactive } from './reactive.js';

const set=createSetter();
const get=createGetter();

function createSetter(){
    //set钩子函数
    return function set(target,key,value,receiver){
       console.log("设置值",  key, value)
        //要先判断target中是否有这个key了，如果没有就是新增操作，否则就要判断key对应的值跟前面的值是否一样，一样的话，就不用执行下去了
        const haskey=hasOwn(target,key);
        const oldValue= target[key];//Reflect.get(target,key);
        let res = Reflect.set(target, key, value, receiver);
        //如果还没有，则需要添加
        if(!haskey){
            console.log("新增操作")
            //新增操作
            res = Reflect.set(target, key, value, receiver);
        }else if(hasChanged(oldValue,value)){ //值改变了
            //新增操作
            res = Reflect.set(target, key, value, receiver);
            console.log("修改操作")
        }   
        return res;
       return res;
    }
}
function createGetter(){
    //get钩子函数
    return function get(target,key,receiver){
        console.log("获取值",target,key)
        const result=Reflect.get(target,key,receiver);
        if(isObject(result)){
            //如果获取的值还是对象，则还需要对值进行代理
           return reactive(result)
        }
        return result;
    }
}
export const mutableHandler={
    get,set
}
```

&#8195;&#8195;从上面的源码中我们可以看出,在`set`钩子中对数据进行劫持时,只会对最外层的数据进行劫持。 对里面的数据而是在`get`钩子获取数据时判断，获取的值是否是对象,是对象时才会对里层数据进行劫持。这是`vue3`中的一大亮点。在数据劫持时节省了性能开销。
&#8195;&#8195;`Vue2.x`中在数据初始化时，会对数据进行递归，最开始就会对所有的数据进行劫持。在数据初始化时会增加性能开销。
&#8195;&#8195;在`set`钩子中，会先判断目标对象中是否有那个属性，没有的话，就是添加操作。如果有的话，要判断当前值和原来的值是否一样，不一样时，才需要去进行更新操作。
&#8195;&#8195;数组在进行`push`操作时，在`push`函数内部会先往数组里添加元素，然后修改数组的长度，使长度加1。但如果对数组进行了劫持，那么也会对数组的`length`属性赋值操作。但此时`length`长度已经修改了，所以就不必重新赋值了。所以需要在`set`钩子中先判断属性是否存在,存在的情况下再判断当前值和老值是否相同。 
```js
import {reactive } from "./reactivity/index.js"
const state=reactive({
    name:"james",
    age:23,
    arr:[1,2,3]
})
state.arr.push(4);//在get钩子中会对arr,push和length属性进行劫持；在get操作中会进行添加和修改length的操作。
```