---
title: Emit装饰器的内部实现解密
date: '2020-06-16'
type: 技术
tags: typescript
note: Emit装饰器的内部实现解密
---
## 1、@Emit的实现原理
`@Emit` 装饰器是一个函数装饰器。
函数装饰器表达式会在运行时当作函数被调用，传入下列3个参数:
```ts
(target: any, propertyKey: string, descriptor: PropertyDescriptor)
```
+ **`target`**——对于静态成员来说是类的构造函数，对于实例成员是类的原型对象。
+ **`propertyKey`**——成员的名字（被修饰的方法的名字）。
+ **`descriptor`**——成员的属性描述符。

`@Emit` 装饰器的实现代码如下，主要分为以下几步：
+ 将事件名有小驼峰改为由 `-` 拼接。
+ 重写 由 `@Emit` 装饰器装饰的方法。
+ 在重写方法中调用 `this.$emit()`,同时将被装饰的函数的返回值作为参数传给 `this.$emit()`。
```js
export function emit(event: string){
    return function(target: Vue,propertyName: string,descriptor: PropertyDescriptor){
        //将changeName改为change-name
        const eventName=propertyName.replace(/\B([A-Z])/g, '-$1').toLowerCase();
        //触发的函数
        const originalFn=descriptor.value;
        //重写触发函数
        descriptor.value=function(this: Vue,...args: any[]){
          const emitFn=(returnValue: any)=>{
            //防止没有在@emit()中传递事件名称
            const emitName=event||eventName;
            returnValue?this.$emit.apply(this,[emitName,returnValue,...args]): this.$emit.apply(this,[emitName,...args])
          }
          //获取添加了@emit装饰器的返回值
          const returnValue=originalFn.apply(this,args)
          //触发this.$emit()
          emitFn(returnValue)
          // return returnValue;
        }
    }
}
```
## 2、@Emit在Vue中的使用
```js
import { Component, Prop, Vue} from 'vue-property-decorator';
import {emit} from "@/decorators/emit"
@Component
export default class HelloWorld extends Vue {
  @Prop() private msg!: string;
  name='test';
  @emit('change')
  changeName(){
    this.name='james';
    return this.name;
  }
  
}
```
