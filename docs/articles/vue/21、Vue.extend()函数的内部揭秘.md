---
title: Vue.extend()函数的内部揭秘
date: '2020-06-10'
type: 技术
tags: vue
note: Vue.extend()函数的内部揭秘
---

在平常工作中，我们有时候会使用到 `Vue.extend()` 函数，该函数一般是传入一个 `组件对象`，返回一个构造函数。在以该构造函数创建一个组件实例时，传入的组件对象作为  `options` 被使用。下面我们来看一下 `extend()` 函数的内部代码。
```js
  Vue.extend = function (extendOptions: Object): Function {
    extendOptions = extendOptions || {}
    //this为Vue构造函数
    const Super = this
    const name = extendOptions.name || Super.options.name
    //用于暴露到外面去的构造函数
    const Sub = function VueComponent (options) {
      this._init(options)
    }
    //继承Vue的原型
    Sub.prototype = Object.create(Super.prototype)
    //上一步的操作将其constructor修改了，这里 将constructor指向自己
    Sub.prototype.constructor = Sub
    //合并options项
    Sub.options = mergeOptions(
      Super.options,
      extendOptions
    )
    Sub['super'] = Super
    if (Sub.options.props) {
      initProps(Sub)
    }
    if (Sub.options.computed) {
      initComputed(Sub)
    }
    //给构造函数挂载属性
    Sub.extend = Super.extend
    Sub.mixin = Super.mixin
    Sub.use = Super.use

    // create asset registers, so extended classes
    // can have their private assets too.
    ASSET_TYPES.forEach(function (type) {
      Sub[type] = Super[type]
    })
    // enable recursive self-lookup
    if (name) {
      Sub.options.components[name] = Sub
    }
    //返回该构造函数
    return Sub
  }
}
```
下面是一个简单的例子。
```vue
<template>
    <div id="app">
        {{name}}-{{title}}
    </div>
</template>
<script>
     const comp={
        name:'test',
        props:{
            title:String
        }
    }
    const props={
        title:'james'
    }
    let Ctor=Vue.extend(comp)
    //想要给组件传递props，必须在实例化时，传递propsData属性。
    const instance =new Ctor({
        el:"#app",
        data:{
            name:'test'
        },
        propsData:props
    })
</script>
```