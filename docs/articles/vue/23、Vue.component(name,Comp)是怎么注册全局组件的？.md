---
title: Vue.component(name,Comp)是怎么注册全局组件的？
date: '2020-06-10'
type: 技术
tags: vue
note: Vue.component(name,Comp)是怎么注册全局组件的？
---
在平时工作中，我们有时候会通过 `Vue.component(name,comp)` 来注册全局组件。但是你了解它注册的原理吧，下面我们将深入源码来解密。
```js
const ASSET_TYPES=['component','directive','filter']
function initAssetRegisters (Vue: GlobalAPI) {
  ASSET_TYPES.forEach(type => {
    //给Vue添加静态方法component、directive、filter
    Vue[type] = function (
        id: string,
        definition: Function | Object
    ): Function | Object | void {

        if (!definition) {
            return this.options[type + 's'][id]
        } else {
            /* istanbul ignore if */
            if (process.env.NODE_ENV !== 'production' && type === 'component') {
            validateComponentName(id)
            }
            if (type === 'component' && isPlainObject(definition)) {
                definition.name = definition.name || id
                //返回一个构造函数
                definition = this.options._base.extend(definition)
            }
            if (type === 'directive' && typeof definition === 'function') {
                definition = { bind: definition, update: definition }
            }
            //将该组件挂载到Vue.options.components对象上，相当于全局注册
            this.options[type + 's'][id] = definition
            return definition
        }
    }
  })
}
```