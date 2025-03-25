---
title: 34、javascript之this详解
date: '2020-01-14'
type: 技术
tags: javascript
note: 学习了这么久的javascript，以前一直以为this指的就是指调用该函数或方法的对象。但是这种解释在有些情况下并不合理。通过阅读相关书籍（`<<你不知道的javascript>>`）今天算是彻底弄懂了this具体指的是啥,便将此记录下来，供自己以后复习。
---
&#8195;&#8195;学习了这么久的 `javascript`，以前一直以为`this` 就是指调用该函数或方法的对象。但是这种解释在有些情况下并不合理。通过阅读相关书籍（`<<你不知道的javascript>>`）今天算是彻底弄懂了this具体指的是啥,便将此记录下来，供自己以后复习。
## 1、this的定义

&#8195;&#8195;当一个函数被调用时，会创建一个活动记录（有时候也称为执行上下文）。这个记录会包含函数在哪里被调用（调用栈）、函数的调用方法、传入的参数等信息。 **this 就是记录的其中一个属性。是函数的执行主体，和执行上下文不是一个概念**。

## 2、this指向的分类
可以按照以下规律来确定**执行主体**是谁:
+ 1、给当前元素的某个事件行为绑定方法，事件触发，执行对应的方法，方法中的`this`是当前元素本身（IE6~8 基于`attachEvent`实现的`DOM2`事件绑定，绑定的`this`是`window`）
    ```js
    document.body.onClick=funcion(){
        console.log(this) //=>body
    }
    document.body.addEventListener("click",function(){
        console.log(this) //=>body
    })
    ```
+ 2、函数执行，首先看函数名之前是否有"点"，"点"前的是谁，`this`就是谁，没有"点" `this` 就是 `window`。（在js的严格模式下，没有"点"，方法中的`this` 是 `undefined`）。
    + 1、匿名函数(自执行函数/回调函数)中的`this`一般都是 `window/undefined`(除非做了特殊处理)。
    ```js
    //匿名函数
    (function(){
        console.log(this) //window/undefined
    })()
    //回调函数
    [1,2].forEach((item,index)=>{
        console.log(this);//window
    })
    //回调函数
    setTimeout(function(){
        console.log(this);//window
    },1000)
    //回调函数做特殊处理
    [1,2].forEach(function(item,index)=>{
        console.log(this);//{name:123}
    },{name:123})
    ```
    ```javascript             
    function foo() {
        console.log( this.a );
    }
    var obj = {
        a: 2,
        foo: foo
    };
    var a = "oops, global"; // a 是全局对象的属性
    //回调函数 =>这里相当于 fn=obj.foo;setTimeout(fn, 100 );
    setTimeout( obj.foo, 100 ); // "oops, global"
    ```
    ```js          
    function foo() {
        console.log( this.a );
    }
    function doFoo(fn) {
      
        fn(); // 函数调用前没有点，所以this指向的是window
    }
    var obj = {
        a: 2,
        foo: foo
    };
    var a = "oops, global"; 
    // 本质上相当于 fn=obj.foo;doFoo(fn)
    doFoo( obj.foo ); // "oops, global"
    ```
    + 2、括号表达式中特殊的处理
    ```js
    let obj={
        fn:function(){
            console.log(this);//window
        }
    }
    //括号表达式中有多项，也只取最后一项，但是this是window
    (0,0,obj.fn)()
    ```
    ```javascript            
    function foo(){
        console.log(this.a);
    }
    var a=2;
    var obj={a:3,foo:foo};
    var b={a:4};
    obj.foo();//3
    (b.foo=obj.foo)();//2
    //b.foo=obj.foo返回的是目标函数的引用
    //上面的代码可以这样理解
    var c=b.foo=obj.foo;
    c();
    ```
+ 3、构造函数中的`this`是当前实例。
+ 4、箭头函数(基于{}形成的块级上下文)没有自己的`this`,用到的`this`都是它所在上下文中的`this`。
    ```js
    function foo(){
        console.log(this);//=>obj
        setTimeOut(()=>{
            console.log(this.a);//当前上下文中没有this，this指向上级上下文中的this
        },1000)
    }
    var obj={
        a:1
    }
    foo.call(obj);
    ```
+ 5、基于`call/apply/bind` 可以强制改变`this`的指向。
    + 在调用 `call、apply、bind` 时，传入`null`或者 `undefined` 时会被忽略，`this`会指向 `window`。
        ```javascript 
        //例题 1           
        function foo(){
            console.log(this.a);
        }
        var a=3;
        foo.call(null);//3
        ```
    + 这种调用方式会修改全局对象，可能会导致不可预计的后果。所有这里提供了一种更安全的`this`方法。
    `Obect.create(null)` 是`js` 中创建一个空对象的对简单的方法。该方法返回一个{}对象，但是不会有`__proto__`属性，比`var obj={}`更空。

        ```javascript             
        function foo(a,b){
            console.log(a+","+b);
        }
        var a=3;
        var φ=Object.create(null);
        //φ可以让函数变得更安全，还可以提高代码的可读性。将this的使用限制在这个空对象中，不会对全局产生任何的影响。
        foo.apply(φ,[2,3]);//2,3
        //柯里化
        var bar=foo.bind(φ,2);
        bar(3);//2,3
        ```
下面是以下关于 `this` 指向的一些比较经典的例子。
#### 经典面试题 1
```js
var num = 10;
var obj = {
    num: 20
}
obj.fn = (function (num) {
    //自执行函数中的this指向window
    this.num = num * 3;
    num++;
    return function (n) {
        this.num += n;
        num++;
        console.log(num);
    }
})(obj.num);
// obj.fn被外界的变量引用形成闭包，所以num的值没有被释放
var fn = obj.fn;
fn(5);//22
obj.fn(10); //23
console.log(num, obj.num);//65 30
/*
*1、在函数的自执行过程中,this指向的是window,此时window.num=20*3=60，并且执行后的结果obj.fn=function(){...}形成了闭包。私有变量num的值得不到释放,此时num的值为21;
*2、执行fn(5)时，this指向window，所有此时window.num=65，此时私有变量num的值是22; 
*3、执行obj.fn(10)时，this指向obj,此时私有变量num的值是23
*/
```
#### 经典面试题2
```js
var name = 'window';
var Tom = {
    name: "james",
    show: function () {
        console.log(this.name);//window
    },
    wait: function () {
        var fun = this.show;
        //函数前面没有点 则this指向的是window
        fun();
    }
}
Tom.wait();
```
#### 经典面试题 3
```js
 (function () {
        var val = 1;
        var json = {
            val: 10,
            dbj: function () {
                //此时的val是其上级上下文中的私有变量val=1；
                val *= 2;
            }
        }
        json.dbj();
        console.log(json.val, val);//10 ,2
    })()
```
#### 经典面试题 4
```js  
function fun () {
    this.a = 0;
    this.b = function () {
        console.log(this);
        console.log(this.a);
    };
}
fun.prototype = {
    b: function () {
        this.a = 20;
        console.log(this.a);
    },
    c: function () {
        this.a = 30;
        console.log(this.a);
    }
};

var my_fun = new fun();
my_fun.b(); //私有方法,fun函数中的this指向fun构造函数的实例,即this=>my_fun,this.a=0
console.log(my_fun.a);//0
my_fun.c();//公有方法	this=>my_fun this.a = 30（私有属性a修改为30）
console.log(my_fun.a);//30
var my_fun2 = new fun();
console.log(my_fun2.a);//0,私有属性
my_fun2.__proto__.c();//this=>my_fun2.__proto__ 当前实例·通过原型链在共有属性增加了属性a并赋值为30,相当于fun.prototype.a=30
console.log(my_fun2.a);//0,私有属性
console.log(my_fun2.__proto__.a);//30,原型属性
//输出顺序为 0,0,30,30,0,30,0,30
```
#### 经典面试题 5
```javascript
var length = 1
function fn() {
    console.log(this.length)
} 

var obj = {
    length: 3,
    me:function(fn){
        fn() // 1,=>fn所在的上下文为EC(G),所以fn中的this指向的是window
        arguments[0]() // 2,fn中this指向的是arguments
    }
}
obj.me(fn, 1)

```



​
<Valine></Valine>