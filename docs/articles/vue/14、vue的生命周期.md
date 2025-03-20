---
title: 15.vue的生命周期
date: '2020-05-18'
type: 技术
tags: vue
note: vue的生命周期
---
          
## `1、beforeCreate()`      
是`new Vue()`之后触发的第一个钩子，在当前阶段`data、methods、computed` 以及 `watch`上的数据和方法都不能被访问。  

## `2、created()`
在实例创建完成后发生，当前阶段已经完成了数据的初始化，可以获取到`data/$ref`等属性，但是在这里更改数据`不会触发updated函数`。在当前阶段无法与 `Dom` 进行交互(获取不到`$el`)，如果非要想，可以通过 `vm.$nextTick` 来访问 `Dom`。
在`beforeCreate()`和`created()`钩子函数之前的数据初始化顺序是：
+ initInjections(vm) 
+ initState(vm)
在这里按照 `props`,`methods`,`data`,`computed`,`watch`的顺序初始化数据。
+ initProvide(vm)

## `3、beforeMounted()`
 发生在挂载之前，在这之前 `template` 模板已导入渲染函数编译。而当前阶段**虚拟Dom已经创建完成**，即将开始渲染。在此时也可以对数据进行更改，`不会触发updated`。

## `4、mounted()`
 在挂载完成后发生，在当前阶段，真实的 `Dom` 挂载完毕(数据编译完成)，数据完成双向绑定，可以访问到`Dom`节点，使用`$ref`属性对`Dom`进行操作。

## `5、beforeUpdate()`
 发生在更新之前，也就是响应式数据发生更新，虚拟 `dom` 重新渲染之前被触发，你可以`在当前阶段进行更改数据，不会造成重渲染`。该钩子函数时在实例化`Watch`类时通过`AOP` 作为参数传入的。
```js
new Watcher(vm, updateComponent, noop, {
    before () {
      if (vm._isMounted && !vm._isDestroyed) {
        callHook(vm, 'beforeUpdate')
      }
    }
  }, true /* isRenderWatcher */)
```

## `6、updated()`
发生在更新完成之后，当前阶段组件 `Dom` 已完成更新。要注意的是避免在此期间更改数据，因为这可能会导致无限循环的更新。

## `7、beforeDestroy()`
 发生在实例销毁之前，在当前阶段实例完全可以被使用，我们可以在这时进行善后收尾工作，比如清除计时器、删除事件监听。
```js
 beforeDestroy(){
     window.addEventListener('resize',this.resize);
     setINterval(this.timer)
 }
 //或者通过第二种方式

 this.$once("hook:beforeDestroy",()=>{
       window.addEventListener('resize',this.resize);
     setINterval(this.timer)
 }) 
 ```

## `8、destroyed()`
发生在实例销毁之后，这个时候只剩下了`dom`空壳。组件已被拆解，数据绑定被卸除，监听被移出，子实例也统统被销毁。

**几种不常用的钩子**    

## `9、activated()`
 在 `keep-alive` 组件激活时调用，该钩子在服务器端渲染期间不被调用。

## `10、deactivated()`
 在 `keep-alive` 组件停用时调用，该钩子在服务器端渲染期间不被调用。

## `11、errorCaptured()`
 当捕获一个来自子孙组件的错误时被调用。此钩子会收到三个参数：错误对象、发生错误的组件实例以及一个包含错误来源信息的字符串。此钩子可以返回 `false` 以阻止该错误继续向上传播。
