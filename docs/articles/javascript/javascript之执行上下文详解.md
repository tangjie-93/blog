---
title: 29.javascript之执行上下文详解
date: '2020-10-22'
type: 技术
tags: javascript
note: javascript之执行上下文详解
---
`javascript`标准把一段代码(包括函数)，执行所需的所有信息定义为:"执行上下文"。它是代码执行的基础设施。
**执行上下文在`ES3`中**，包含三个部分
+ `scope`:作用域，也常常被叫做作用域链。
+ `variable object`:变量对象，用于存储变量的对象。
+ `this value`:`this`值。
**在`ES5`中**，把`ES30`中执行上下文中的三个部分改名为：
+ `lexical environment`:词法环境，当获取变量时使用。
+ `variable environment`:变量环境，当声明变量时使用。
+ `this value`:`this`值。
**在ES2018中**,执行上下文变成了下面的样子。
+ `lexical environment`：词法环境，当获取变量或者 `this` 值时使用。
+ `variable environment`：变量环境，当声明变量时使用。
+ `code evaluation state`:用于恢复代码执行位置。
+ `Function`：执行的任务是函数时使用，表示正在被执行的函数。
+ `ScriptOrModule`：执行的任务是脚本或者模块时使用，表示正在被执行的代码。
+ `Realm`：使用的基础库和内置对象实例。对不同 `Realm` 中的对象操作，会有一些需要格外注意的问题，比如 `instanceOf` 几乎是失效的。
+ `Generator`：仅生成器上下文有这个属性，表示当前生成器。