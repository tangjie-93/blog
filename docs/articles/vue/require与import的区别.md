---
title: require与import的区别
date: '2020-01-14'
type: 技术
tags: vue
note: require与import的区别
---
### 1、common.js(node环境)
&#8195;&#8195;commonjs是**运行时加载**，在运行时才能得到这个对象。CommonJS 模块输出的是值的缓存，或者说是值的拷贝。
```javascript
    //表示整体加载fs模块，生成一个对象
    let _fs=require("fs");
    //加载fs模块，生成一个对象，然后从这个对象上读取这三个方法。
    let {stat, exists, readFile }=require("fs");
```
### 2、import(ES6模块化)
&#8195;&#8195;import称为**编译时加载**或者是**静态加载**,即在模块编译时就完成模块加载，所以也就导致了没法引用ES6模块本身，因为此时的ES6模块还不是对象。通过export输出的是值的引用。import命令具有提升的效果，会提升到整个模块的头部，首先执行。import是静态执行，所以不能使用表达式和变量。并且多次执行import语句加载同一个模块，该模块也只会被加载一次。
ES6模块的优点：
+ 1、编译时加载，使得静态分析变得可能，在编译时引入"宏"（micro）和"类型检查"(type system)。
+ 2、目前浏览器和服务器都支持ES6模块格式。
```javascript
    //加载fs模块里的3个方法
    import { stat, exists, readFile } from 'fs';
```