---
title: vue对数组实现监听的代码实现
date: '2020-06-06'
type: 技术
tags: vue
note: vue对数组实现监听的代码实现
---
实现数组响应式主要有以下三个步骤。
+ 找到数据原型
+ 覆盖那些能够修改数组的更新方法`[push,pop,shift,unshift,splice,sort,reverse]`，使其可以通知更新
+ 将得到的新的原型设置到数据实例原型上

```js
//第一步，找到数据原型
const originalProto=Array.prototype
//备份,进行修改,不能直接修改原型
const arrayProto=Object.create(originalProto)
//第二步 覆盖那些能够修改数组的更新方法
const arrayMethods=['push','pop','shift','unshift','splice','sort','reverse'];
arrayMethods.forEach(method=>{
  const original = arrayProto[method];
  def(arrayMethods, method, function() {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];
    var result = original.apply(this, args);
    var ob = this.__ob__;
    var inserted;
    console.log(method)
    switch (method) {
     
      case 'push':
      case 'unshift':
        inserted = args;
        break
      case 'splice':
        inserted = args.slice(2);
        break
    }
    if (inserted) { ob.observeArray(inserted); }
    // notify change 使其可以通知更新
    ob.dep.notify();
    return result
  });
})
//第三步 将得到的新的原型设置到数据实例原型上
 // 辨别类型
if (Array.isArray(value)) {
    var hasProto = '__proto__' in {};
    if(hasProto){
    value.__proto__=arrayMethods;
    }else{
      const arrayKeys = Object.getOwnPropertyNames(arrayMethods);
      copyAugment(value, arrayMethods, arrayKeys);
    }
    this.observeArray(value);
    // todo
} else {
    this.walk(value)
}
```
具体实现代码在 `github` 上有详细代码。[github地址](https://github.com/tangjie-93/vue/tree/master/array-reacttive)