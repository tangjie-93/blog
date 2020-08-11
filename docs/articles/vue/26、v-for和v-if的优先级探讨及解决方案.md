---
title: v-for和v-if的优先级探讨及解决方案
date: '2020-06-20'
type: 技术
tags: vue
note: v-for和v-if的优先级探讨及解决方案
---
## 1、v-for跟v-if同级的情况。
```html
<div id='app'>
    <div v-for="item in [1,2,3]" v-if="item>2">{{item}}</div>
</div>
<script>
const vm=new Vue({
    el:"#app"
})
console.log(vm.$options.render)
//下面是输出的render函数
//这里的_c是createElement函数，_l是renderList函数，_v是createTextVNode函数，_e是createEmptyVNode函数
ƒ anonymous() {
    with(this){
        return _c('div',
            {attrs:{"id":"app"}},
            _l(([1,2,3]),function(item){
                return (item>2)?_c('div',[_v(_s(item))]):_e()
            }),
        0)
    }
}
</script>
```
**解析** 当 `v-for` 跟 `v-if` 同级时，从输出的 `render` 函数可以看出，`v-for`的优先级是高于 `v-if` 的。
+ 其中的 `_l,_e,_v` 可以在源码 `src\core\instance\render-helpers\index.js` 中找到定义。`_c`在 源码 `src\core\instance\render.js` 里面定义的。
+ `v-for`和 `v-if` 的优先级比较在源码 `src\compiler\codegen\index.js` 可以找得到答案。先判断`for`指令是否存在，然后才判断的 `if` 指令是否存在。

## 2、当v-for跟v-if不同级出现的情况

```html
<div id='app'>
<!-- 判断条件在外面 -->
<template v-if="condition">
    <div v-for="item in [1,2,3]" v-if="item>2">{{item}}</div>
</template>
<!-- 判断条件在内部的情况 -->
 <!-- <div v-for="item in filterNums" v-if="item>2">{{item}}</div>
</div> -->
<script>
const vm=new Vue({
    el:"#app",
    data:{
        nums:[1,2,3]
    },
    computed: {
        condition(){
            this.nums&&this.nums.length;
        }
        filterNums(){
            return this.nums.filter(num=>num>2)
        }
    },
})
console.log(vm.$options.render)
//输出的渲染函数如下
ƒ anonymous() {
    with(this){
        return _c('div',
            {attrs:{"id":"app"}},
            [(condition)?_l(([1,2,3]),function(item){
                //_s是toString方法
                return (item>2)?_c('div',[_v(_s(item))]):_e()
                }):_e()
            ],
        2)
    }
}
</script>
```
总结：
1. 显然 `v-for` 优先于 `v-if` 被解析（看源码） 。
2. 如果同时出现，每次渲染都会先执行循环再判断条件，无论如何循环都不可避免，浪费了性能 
3. 要避免出现这种情况，则在外层嵌套 `template` ，在这一层进行v-if判断，然后在内部进行v-for循环 
4. 如果条件出现在循环内部，可通过计算属性提前过滤掉那些不需要显示的项。
