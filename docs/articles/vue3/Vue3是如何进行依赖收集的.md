---
title: Vue3是如何进行依赖收集的
date: '2020-12-7'
type: 技术
tags: vue3
note: Vue3是如何进行依赖收集的
---
`vuex`源码中是在`get`钩子函数中进行依赖收集的。在`set`钩子函数中触发更新的。在收集依赖时要注意：只会收集`effect`中的依赖。
## 1、依赖收集过程
&#8195;&#8195;每次获取值的时候就是依赖收集的时候。依赖收集函数`track`
```js
//baseHandlers.js
//get钩子函数
function createGetter () {
    return function get (target, key, receiver) {
        const res = Reflect.get(target, key,receiver);
        //收集依赖
        track(target,TrackOpTypes.GET,key);
        if (isObject(res)) {
            return reactive(res);
        }
        return res;
    }
}
//effect.js
//依赖收集函数
let targetMap=new WeakMap();//{ {name:'james}:{name:[effect,effect]} }
//依赖收集
export function track(target,type,key){
    //如果不是在effect中，不收集依赖
    if(activeEffect===undefined) return;
    //根据target进行取值
    let depsMap=targetMap.get(target);
    if(!depsMap){
        targetMap.set(target,(depsMap=new Map()));
    }
    let deps=depsMap.get(key);
    if(!deps){
        depsMap.set(key,(deps=new Set()))
    }
    //判断effect中是否已经存在，避免在一个effect中多次获取同一个key的情况
    /**
     * effect(()=>{
     *      state.name;
     *      state.name;//像这种情况就只需要添加一次就行
     * })
     */
    if(!deps.has(activeEffect)){
        deps.add(activeEffect);
        activeEffect.deps.push(deps);
    }
}
```

## 2、触发更新操作
&#8195;&#8195;在`set`钩子函数中，监听数据变化，当添加数据或者修改数据时,触发更新操作。执行`effect`中被监听的属性。依赖更新时，触发更新函数`trigger`。
```js
//baseHandlers.js
//set钩子函数
function createSetter () {
    //set钩子函数
    return function set (target, key, value, receiver) {
        // console.log("设置值",  key, value)
        //要先判断target中是否有这个key了，如果没有就是新增操作，否则就要判断key对应的值跟前面的值是否一样，一样的话，就不用执行下去了
        const haskey=hasOwn(target,key);
        const oldValue= target[key];//Reflect.get(target,key);
        let res=true;
        //如果还没有，则需要添加
        if(!haskey){
            console.log("新增操作")
            //新增操作
            res = Reflect.set(target, key, value, receiver);
            //触发更新
            trigger(target,TriggerOpTypes.ADD,key,value);
        }else if(hasChanged(oldValue,value)){ //值改变了
            //新增操作
            res = Reflect.set(target, key, value, receiver);
            console.log("修改操作")
            //触发更新
            trigger(target,TriggerOpTypes.SET,key,value,oldValue);
        }   
        return res;
    }
}
//effect.js
//触发更新
export function trigger(target,type,key,value,oldValue){
    const depsMap=targetMap.get(target);
    if(!depsMap) return;
    //触发更新
    const run=(effects)=>{
        if(effects){
            effects.forEach(effect=>effect())
        }
    }
    if(key!==null){
        run(depsMap.get(key));
    }
    if(type===TriggerOpTypes.ADD){ 
        //对数组新增属性，会触发length对应的依赖 因为添加操作时，还没有对响应的key添加依赖
        (depsMap.get(Array.isArray(target)?'length':""));
    }
}
```