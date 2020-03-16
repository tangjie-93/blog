---
title: ES6和ES5的继承的区别
date: '2020-01-14'
type: 技术
tags: javascript
note: ES6和ES5的继承的区别
---
### 1、`class`声明会提升，但不会初始化值,类似于`let、const`声明变量一样。
### 2、`class`声明内部会启用严格模式。
### 3、`class`的所有方法（包括静态和实例方法）都是不可枚举的。
### 4、`class`的所有方法(包括静态和实例方法)都没有原型对象`prototype`,不能用`new`来调用。
### 5、必须使用`new`来调用`class`。
### 6、`class`内部无法重写类名。
### 7、ES6子类可以直接通过`__proto__`寻址到父类。
```js
//ES6
class Super {}
class Sub extends Super {}

const sub = new Sub();
Sub.__proto__ === Super;
Sub.Prototype.__proto__=Super.Prototype

//ES5
function Super() {}
function Sub() {}

Sub.prototype = new Super();
Sub.prototype.constructor = Sub;

var sub = new Sub();

Sub.__proto__ === Function.prototype;
```
### 8、ES6和ES5子类`this`生成顺序不同。ES5的继承是先生成子类实例，再调用父类的构造函数修饰子类实例；ES6的继承是先生成父类实例，再调用子类的构造函数修饰父类实例。
### 9、ES5的继承是通过`call`或者`apply`回调方法调用父类。
