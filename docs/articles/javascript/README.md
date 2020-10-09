---
title: js变量声明提升
date: '2020-01-14'
type: 技术
tags: javascript
note: 变量提升是将变量声明提升到它所在作用域的最开始的部分。
---
## 什么叫变量提升?
把当前上下文中带有`var`(提升声明)/`function`(提升声明+定义)进行提升的声明或者定义。变量提升是将变量声明提升到它所在作用域的最开始的部分。
    + 全局上下文中:基于`var/function`声明的变量，也相当于给`window`设置了对应的属性。
&#8195;&#8195;
#### 实例 1
```js
var t = 1; 
function a(){
    console.log(t);
    var t=2;
}
a();//undefined;
```
&#8195;这是因为函数里的变量t声明提升到函数最开始的部分了。上面的代码1相当于代码2：

```js
//代码2
var t = 1; 
function a(){
    var t;
    console.log(t);
    t=2;
}
a();//undefined;
```
&#8195;&#8195;在函数内部，如果没有用var进行申明，则创建的变量是**全局变量，而不是局部变量**了。所以，建议变量声明加上var关键字。

```js   
//代码3
var t = 1; 
function a(){
    console.log(t)//undefined
    t=4;
    console.log(t);//4
    var t=2;
    console.log(t);//2
}
a();
```

function声明会比var声明优先级更高一点。

```js
//代码4
console.log(foo);
var foo=10;
console.log(foo);
function foo(){
    console.log(10);
}
console.log(foo);
```

相当于下面的代码：

```js
function foo(){
    console.log(10);
}
var foo；
console.log(foo);
foo=10;
console.log(foo);
console.log(foo);
```

运行结果如下:
![](https://user-gold-cdn.xitu.io/2019/4/10/16a07e5f751f4e06?w=1914&h=146&f=png&s=20751)


```js
//代码5
function foo(){
	console.log(a);//2
}
function bar(){
	var a=3;
	foo();
}
var a=2;
bar();
```

​		上面的代码的运行过程是 `bar()-->foo()`,此时的a由于在调用 `bar()`之前已经初始化了，所以相当于给在 `foo()` 函数的所在作用域中的`this` 对象添加了a属性，并赋值为2，所以调用 `foo()` 函数的a时，实际上调用的 `foo()` 所在作用域的 `this` 的a属性。

#### 实例 2
```javascript
function Foo(){
    //未定义，所以是属于this的一个属性，这里的this是window
    getName = function () {
      console.log(1);
    }
    return this;
}
Foo.getName = function() {
  console.log(2);
};
Foo.prototype.getName = function(){
  console.log(3);
};
//变量声明提升，将getName变量提升(只提升定义)
var getName = function(){
  console.log(4);
};
//变量声明提升到作用域的顶部 (声明+定义一起提升)
function getName(){
  console.log(5)
};

Foo.getName(); // 2,直接调用
getName(); // 4,变量声明提升
Foo().getName(); // 1,将getName()方法添加到window对象上
getName(); // 1
new Foo.getName(); // 2，直接调用
new Foo().getName(); // 3 相当于 var f = new Foo（）  f.getName()     
new new Foo().getName(); // 3
```
#### 实例 3
```javascript
var a = 0
function b(){
  console.log(a) // fun a 函数声明提升到作用域的顶部
  a = 10 //a是局部变量，赋值为10
  console.log(a) // 10
  return;
  function a(){}
}
b()
console.log(a) // 0，此时的a还是外部作用域的a
```
#### 实例 4
函数执行，函数的作用域`[scope]`跟它在哪执行无关，只跟它在哪定义有关。
```js
var i = 0;
function A () {
    /**
     * EC(A)
     * 作用域链:<EC(A),EC(G)>
     */
    var i = 10;
    function x () {
        /**
         * EC(X)
         * 作用域链:<EC(x),EC(A)>
         */
        console.log(i);
    }
    return x;
}
var y = A();
y();//10
function B () {
    var i = 20;
    /**
     *函数的作用域跟它在哪执行无关，只跟它在哪定义有关。
     *y的作用域[[scope]]是 EC(A)
     */
    y();//10
}
B();
```

#### 实例 5
```js
var a = 1;
/**
 * EC(G)
 *  a
 *  fn=0x000000 [[scope]]:EC(G)
 */
function fn (a) {
    /**
     * 私有上下文 EC(FN)
     *  私有变量赋值
     *  a=1
     *   =0x000001 [[scope]]:EC(FN)
     *   =2
     *  作用域链:<EC(FN),EC(G)>
     *  形参赋值：a=1
     *  变量提升：
     *      var a;
     *      function a(){};不需要重新声明，但是需要重新赋值
     */
    console.log(a); //[Function：a]
    var a = 2; //在这里知识重新赋值
    function a () { } //在变量提升阶段都处理完了
    console.log(a);//2
}
fn(a);
console.log(a);//1
```
#### 例题 6
获取一个变量的值，首先看是否是自己的私有变量，不是话则会根据作用域链向上级上下文查找...一直到全局上下文(`window`)。找到则返回，没找到则报错:`x is not undefined`,并且他下面的代码也不会执行了。
```js
//首先看是否是全局变量，不是，则再看是否为window的一个属性，如果还不是，报错：ReferenceError: a is not defined(这行代码一旦报错，下面的代码都不会处理了)
console.log(a);//ReferenceError: a is not defined
a = 12;
function fn () {
    console.log(a);
    a = 13;
}
fn();
console.log(a);//13
```
#### 实例 7
```js
var foo = "james";
(function (foo) {
    /**
     * EC(ANY)
     *  foo:jmaes
     *  作用域链:<EC(ANY),EC(G)>
     *  形参赋值：foo="james"
     *  变量提升: var foo
     */
    console.log(foo);//james
    var foo = foo || 'world';
    console.log(foo) //jamaes
})(foo)
console.log(foo);//james
```
#### 实例 8
在新版本浏览器中 `function(){}`
+ 函数如果没有出现在 `{}`中，则变量提升阶段是"声明+定义"(老版本浏览器不论是否出现在`{}`中都是"声明+定义")
+ 函数如果出现在`{}`中（除函数、对象的大括号外）则只声明。

**形式1**
```js
{
	//把这一行代码之前对于foo的操作都映射给去全局一份
	//之后的操作都认为是私有的
    function foo () { }
    foo = 1
}
console.log(foo) //[Function :foo]
```
**形式2**
```js
/**
 * EC(G)
 *  foo
 *  变量提升：function foo
 */
{
    /**
     * EC(BLOCK)
     *  foo=ex000000
     *     =ex000001
     *  变量提升
     *     function foo(n){}
     *     function foo(m){}
     */
    //把之前对foo的操作"映射"给全局
    function foo () { }
    foo = 1
    //把之前对foo的操作"映射"给全局
    function foo () { }
    console.log(foo); //1
}
console.log(foo) //1
```
**形式3**
```js
/**
 * EC(G)
 *  foo
 *  变量提升：function foo只声明不定义
 */
 console.log(foo);//undefined
{
    /**
     * EC(BLOCK)
     *  foo=ex000000
     *     =ex000001
     *  变量提升
     *     function foo(n){}
     *     function foo(m){}
     */
    //把之前对foo的操作"映射"给全局
    function foo () { }
    foo = 1
    //把之前对foo的操作"映射"给全局
    function foo () { }
	foo=2;//私有的操作，跟全局无关
	console.log(foo); //2
}
console.log(foo) //1
```
#### 实例 9
**形式1**
```js
var x = 1;
function func (x, y = function any () { x = 2 }) {
    //执行func(5)
    /**
     * AO(FUNC)
     *  x=5
     *  y=oxooooo1
     * 作用域链:<EC(FUNC,EC(G))>
     * 形参赋值
     *  x=5;
     *  y=function any(){...}
     * 变量提升：——
     * 代码执行
     *  x=3;
     *  y();
     * conosle.log(x)
     */
    //执行y()
    /**
     * AO(Y)
     * 作用域链:<EC(Y),EC(FUNC)>
     * 形参赋值:——
     * 变量提升:——
     * 代码执行：
     *  x=2
     */
    x = 3;
    y();
    console.log(x);//2
}
func(5);
console.log(x);//1
```
**注意：** 在函数执行时。
+ 条件1:有形参赋值默认值(不论是否传递实参，也不论默认值的类型)
+ 条件2：函数体中有变量声明（
    + 必须是基于`let/const/var`,注意`let/const`不允许重复声明，不能和形参变量名一致）。
    + 函数体中用`function`声明的变量必须和形参中的某一个变量名字一致，才会有下述的机制。
这两个条件存在的情况下，除了默认形成的**函数私有上下文**，还会多创建一个**块级私有上下文**(函数体到括号包起来的)。

**块级私有上下文**
+ 在其中声明的变量是块级上下文中私有的，和函数私有上下文没啥关系了。
+ 它的上级上下文是函数私有上下文。
+ 并且会把函数私有上下文"形参赋值"结束后的结果，映射给私有块级上下文中的同名字段。

**形式2**
```js
var x = 1;
//条件1 形参赋值
function func (x, y = function any () { x = 2 }) {
    //条件 2声明变量
    var x = 3;
	y();//y()是在函数私有上下文中执行的
	//x是私有块级上下文中的x,不是函数私有上下文中的x
    console.log(x);//3
}
func(5);
console.log(x);//1
```
**形式3**
```js
var x = 1;
function func (x, y = function anouy () { x = 2 }) {


    var x = 3;
    var y = function any () { x = 4 }
    y();
    console.log(x)//4
}
func(5);
console.log(x);//1
```

#### 实例 10
```js
var a = 1;
function fn (a) {
    /**
     * EC(FN)
     *  作用域链:<EC(FN),EC(G)>
     *  形参赋值:a=1
     *  变量提升：(会进行赋值覆盖)
     *      var a;这一步浏览器回忽略，因为a私有变量已经存在AO(FN)中了
     *      a=0x001;[[scope]]:EC(FN),不会重复声明，但是会重新赋值
     *  代码执行:
     */
    console.log(a)// Function a
    var a = 2;//赋值
    console.log(a);//2
    function a () { };//代码执行到这里，不会重新赋值，在变量提升阶段已经赋值了
    console.log(a);//2    
}
fn(a);
```