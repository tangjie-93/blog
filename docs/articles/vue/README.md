---
title: ​vue通信方法EventBus的实现
date: '2020-01-14'
type: 技术
tags: vue
note: ​vue通信方法EventBus的实现
---
vue通信方式有很多，项目中用的比较多的的有`props、vuex、$emit/$on`这3种，还有`provide/inject`(适合高阶组件)、`$attrs和$listeners`(适合高阶组件)以及`$parent/$child/ref、eventBus`等这3种方式。很多时候我们都是只会使用 `api`，而懂得原理以及实现，但我就觉得懂得原理以及实现跟一个只会调用api的开发人员时不在同一层次的。所以这里就像把跨组件通信的`eventBus`通信的原理给大家展示一下。这也是自己学到大佬的的东西后并在此记录（转载）一下。

```javascript            
class EventBus{
    constructor(){
        this.event=Object.create(null);
    };
    //注册事件
    on(name,fn){
        if(!this.event[name]){
            //一个事件可能有多个监听者
            this.event[name]=[];
        };
        this.event[name].push(fn);
    };
    //触发事件
    emit(name,...args){
        //给回调函数传参
        this.event[name]&&this.event[name].forEach(fn => {
            fn(...args)
        });
    };
    //只被触发一次的事件
    once(name,fn){
        //在这里同时完成了对该事件的注册、对该事件的触发，并在最后取消该事件。
        const cb=(...args)=>{
            //触发
            fn(...args);
            //取消
            this.off(name,fn);
        };
        //监听
        this.on(name,cb);
    };
    //取消事件
    off(name,offcb){
        if(this.event[name]){
            let index=this.event[name].findIndex((fn)=>{
                return offcb===fn;
            })
            this.event[name].splice(index,1);
            if(!this.event[name].length){
                delete this.event[name];
            }
        }
    }
}
```
以上代码用的是发布订阅模式。

参考链接： <br>
1、[面试官系列(2): Event Bus的实现](https://juejin.im/post/5ac2fb886fb9a028b86e328c)<br>     
2、[一个合格的中级前端工程师必须要掌握的 28 个 JavaScript 技巧](https://juejin.im/post/5cef46226fb9a07eaf2b7516#heading-28)<br>