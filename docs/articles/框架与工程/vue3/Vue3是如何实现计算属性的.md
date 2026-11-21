---
title: 6.Vue3计算属性的实现
date: '2020-12-8'
type: 技术
tags: vue3
note: Vue3计算属性的实现
---
&#8195;&#8195;从`vue2.x`的源码中，我们知道`computed`本质上也是`Watch`类的一个实例。只是他在初始化时，传的`lazy`参数为`true`,使的它能够懒加载。从`vue3.x`的源码中我们可以看出它也是依赖`effect`来实现的。`vue3.x`里面的`effect`本质上就是`vue2.x`中的`watch`。以下是`vue3.x`中`computed`的源码分析。
## 1、set、get钩子
&#8195;&#8195;计算属性里默认有`get`钩子。用于获取修改后的响应式数据。`set`钩子可有可没有。所以要注意以下几点
+ 判断传入`computed(arg)`函数中的参数到底是以对象的形式还是以函数的形式。
    + 如果是函数，我们就得自己构造一个`set`钩子函数（空函数）。
    + 如果是对象，就将`set`和`get`钩子函数分别指向传入的对象。
+ 计算属性不会立即执行，只会在获取数据和它依赖的数据被修改后，才会执行。
+ 在`computed`函数中会调用`effect`函数，将`get`钩子函数作为`fn`传入，同时传入包括`lazy`和`comptued`属性以及一个调度器函数。该调度器函数会在计算属性中的属性发生变化时执行。
+ 在计算属性中有一个`dirty`属性，默认为`true`。在`get`钩子中会将`dirty`修改为`false`,同时将。`computed`的`value`属性进行依赖收集。
+ 在`effect`中的`trigger`函数中，通过对传入的`options`进行判断，如果有`computed`属性的就是计算属性。在执行更新操作时，判断`options`中是否`scheduler`属性，有这个属性的话,就是`computed`属性。**注意：** 计算属性的优先级高于一般`effect`。
```js
//computed.js
let getter,setter;
export function computed(getterOrOptions){
    if(isFunction(getterOrOptions)){
        getter=getterOrOptions;
        setter=()=>{};
    }else{
        getter=getterOrOptions.get;
        setter=getterOrOptions.set;
    }
    let computed;
    let value;
    let dirty=true;
    //执行effect
    const ruuner=effect(getter,{
        lazy:true,
        computed:true,
        scheduler:()=>{
            if(!dirty){
                dirty=true;
                //触发更新
                trigger(computed,TriggerOpTypes.SET,'value')
            }
        }
    })
    computed={
        get value(){
            if(dirty){
                value=ruuner();
                dirty=false;
                //在外面获取值时收集依赖
                /**
                 * const myage=computed(()=>{
                 *      return state.age*3
                 * })
                 * myage.value;//在这里触发依赖收集
                 */
                track(computed,TrackOpTypes.GET,'value');
            }
            return value;
        },
        set value(newValue){
            setter(newValue);
        }
    }

    return computed;
}
```
```js
//effect.js
//触发更新
export function trigger(target,type,key,value,oldValue){
    const depsMap=targetMap.get(target);
    if(!depsMap) return;
    //计算属性要优先于effect执行
    const efects=new Set();
    const computedRunners=new Set();
    const add=effectToAdd=>{
        if(effectToAdd){
            effectToAdd.forEach(effect=>{
                //判断是是否是计算属性
                if(effect.options.computed){
                    computedRunners.add(effect)
                }else{
                    effects.add(effect)
                }
            })
        }
    }
    //判断是否是更新操作、删除和添加的操作
    if(key!==null){
        add(depsMap.get(key));
    }
    //判断是否是新增操作，新增操作
    if(type===TriggerOpTypes.ADD){ //对数组新增属性，会触发length对应的依赖
        add(depsMap.get(Array.isArray(target)?'length':""));
    }
    const run=effect=>{
        //判断是否是计算属性
        if(effect.options.scheduler){
            effect.options.scheduler();
        }else{
            effect();
        }
    }
    computedRunners.forEach(effect=>run(effect));
    effects.forEach(effect=>run(effect));
}
```
