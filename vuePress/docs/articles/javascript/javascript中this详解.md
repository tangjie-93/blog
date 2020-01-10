		学习了这么久的javascript，以前一直以为this指的就是指调用该函数或方法的对象。但是这种解释在有些情况下并不合理。通过阅读相关书籍（`<<你不知道的javascript>>`）今天算是彻底弄懂了this具体指的是啥,便将此记录下来，供自己以后复习。

<ul>
    <li><a href="#a1">this的定义</a></li>
    <li><a href="#a2">this的绑定规则</a></li>
</ul>

<h3 id="a1">1、this的定义</h3>
​		当一个函数被调用时，会创建一个活动记录（有时候也称为执行上下文）。这个记录会包含函数在哪里被调用（调用栈）、函数的调用方法、传入的参数等信息。 **this 就是记录的其中一个属性。** this 实际上是在**函数被调用时发生的绑定，**它指向什么完全取决于函数在哪里被调用。 this 的绑定和函数声明的位置没有任何关系，只取决于函数的调用方式。说到这里就得说一下调用栈和调用位置了。**使用this的目的是为了很好的传递上下文对象**。  

>**调用栈：** 为了到达当前执行位置所调用的所有函数。    
>**调用位置：** 函数被调用的位置。  

下面的代码详细的说明了调用栈和调用位置。

```javascript          
function baz() {
// 当前调用栈是： baz
// 因此，当前调用位置是全局作用域
console.log( "baz" );
bar(); // <-- bar 的调用位置
}
function bar() {
// 当前调用栈是 baz -> bar
// 因此，当前调用位置在 baz 中
console.log( "bar" );
foo(); // <-- foo 的调用位置
}
function foo() {
// 当前调用栈是 baz -> bar -> foo
// 因此，当前调用位置在 bar 中
console.log( "foo" );
}
baz(); // <-- baz 的调用位置
```

<h3 id="a2">2、this的绑定方式</h3>
​		this的绑定方式主要分为以下4种。   

<h4>&#8195;2.1  默认绑定</h4>
		函数独立调用，非严格模式this 指向全局对象.严格模式下，this指向undefined。 详情请看如下代码：
```javascript     
var a=2;
function test(){
    console.log(this.a);//this指的是window 
    function foo(){
        console.log(this.a);//this指的是window
    }
    foo();//2
}
test();//2

var a=2;
function test(){
    "use strict"
    console.log(this.a);//this指的是undefined;
    function foo(){
        console.log(this.a);
    }
    foo();
}
test();
```

<h4>2.2 隐式绑定</h4>    
​		该绑定规则说的是调用位置是否有上下文对象，或者说是否被某个对象拥有或者包含。看下面的例子：
```javascript        
function foo() {
    console.log( this.a );
}
var obj = {
    a: 2,
    foo: foo
};
obj.foo(); // 2
```

​		调用obj.foo()时，调用foo()时使用的是obj的上下文对象，所以在foo()函数中的this绑定着obj。     

​		对象属性引用链中只有最顶层或者说最后一层会影响调用位置。请看下面的例子。

```javascript          
        function foo() {
            console.log( this.a );
        }
        var obj3={
            a:32，
            foo：foo
        }
        var obj2 = {
            a: 42,
            obj3: obj3
        };
        var obj1 = {
            a: 2,
            obj2: obj2
        };
        obj1.obj2.obj3.foo(); // 32
```
&#8195;&#8195;隐式绑定容易发生隐式丢失的问题，也就是被隐式绑定的函数会丢失绑定对象。也就是说它会应用默认绑定，从而把 this 绑定到全局对象或者 undefined 上（取决于是否是严格模式）。 
```javascript     
function foo() {
    console.log( this.a );
}
var obj = {
    a: 2,
    foo: foo
};
var bar = obj.foo; // 函数别名！
//就相当于var bar=foo；
var a = "oops, global"; // a 是全局对象的属性
bar(); // "oops, global
```

&#8195;&#8195;虽然 bar 是 obj.foo 的一个引用，但是实际上，它引用的是 foo 函数本身，因此此时的bar() 其实是一个不带任何修饰的函数调用，因此应用了默认绑定。在看下面的例子：

```javascript          
function foo() {
    console.log( this.a );
}
function doFoo(fn) {
    // fn 其实引用的是 foo
    fn(); // <-- 调用位置！
}
var obj = {
    a: 2,
    foo: foo
};
var a = "oops, global"; // a 是全局对象的属性
doFoo( obj.foo ); // "oops, global"
```

&#8195;&#8195;参数传递其实就是一种隐式赋值，因此我们传入函数时也会被隐式赋值，所以结果和上一个例子一样。再看下面的一个例子：

```javascript             
function foo() {
    console.log( this.a );
}
var obj = {
    a: 2,
    foo: foo
};
var a = "oops, global"; // a 是全局对象的属性
setTimeout( obj.foo, 100 ); // "oops, global"
```

&#8195;&#8195;把函数传入语言内置的函数而不是传入你自己声明的函数，其结果跟上面的结果是一样的。

<h4>2.3 显示绑定</h4>
使用函数的 `call(..) `和`apply(..) `方法，来将第一个参数显示的绑定到this

```javascript        
function foo() {
    console.log( this.a );
}
var obj = {
    a:2
};
foo.call( obj ); // 2 

function foo() {
    console.log( this.a );
}
var obj2={
    a:23,
}
var obj1 = {
    a:2，
    obj2：obj2
};
foo.call( obj1.obj2 ); // 23
//这说明显式绑定仍然无法解决我们之前提出的丢失绑定问题。
```
&#8195;&#8195;**2.3.1 硬绑定**    
		显示绑定也会出现绑定丢失的问题，所以这里提出了一种叫做**硬绑定**的绑定方法。这种方法其实就是在函数内部调用`call()`或者`apply()`方法。

```javascript            
function foo() {
    console.log( this.a );
}
var obj = {
    a:2
};
var bar = function() {
    foo.call( obj );
};
bar(); // 2
setTimeout( bar, 100 ); // 2
// 硬绑定的 bar 不可能再修改它的 this
bar.call( window ); // 2
```

&#8195;&#8195;硬绑定的典型应用场景就是创建一个包裹函数，传入所有的参数并返回接收到的所有值：

```javascript     
function foo(something) {
    console.log( this.a, something );
    return this.a + something;
}
var obj = {
    a:2
};
var bar = function() {
    return foo.apply( obj, arguments );
};
var b = bar( 3 ); // 2 3
console.log( b ); // 5
```
&#8195;&#8195;ES5 中提供了内置的方法 Function.prototype.
bind，用于硬绑定。 

```javascript          
function foo(something) {
    console.log( this.a, something );
    return this.a + something;
}
var obj = {
    a:2
};
var bar = foo.bind( obj );
//这句代码其实就是将obj绑定到foo()函数中的this，并将对foo()函数的引用赋值给bar。
var b = bar( 3 ); // 2 3
console.log( b ); // 5
```
&#8195;&#8195;**2.3.2 原生API**    
&#8195;&#8195;javascript还有一些原生API的一些内置函数，都提供了一
个可选的参数，通常被称为“上下文”（context），其作用和 bind(..) 一样，确保你的回调函数使用指定的 this。 这些函数实际上就是通过 call(..) 或者 apply(..) 实现了显式绑定，

```javascript            
function foo(el) {
    console.log( el, this.id );
}
var obj = {
    id: "awesome"
};
// 调用 foo(..) 时把 this 绑定到 obj
[1, 2, 3].forEach( foo, obj );//将obj绑定到foo()函数的this
// 1 awesome 2 awesome 3 awesome
```
<h4>2.4 new绑定</h4>
<font size=2>&#8195;&#8195;使用 new 初始化类
调用类中的构造函数。具体详情可以参考这片文章
[javascript中初始化构造函数时new所起的作用。](https://juejin.im/post/5ca72eef6fb9a05e233c937e)</font>

<font size=2/>这四种绑定方式的优先级如下：
>1、默认绑定肯定是这四种绑定方式中优先级最低的；     
>**2、显式绑定比隐式绑定优先级高** 

```javascript       
function foo(){
    console.log(this.a);
}
var obj1={
    a:2
};
var obj2={
    a:3
}
var a=1;
obj1.foo();//2
obj2.foo();//3
obj1.foo.call(obj2);//3;
obj2.foo.call(obj1);//2
```
>**3、new绑定比隐式绑定优先级高**

```javascript            
function foo(arg){
    this.a=arg;
}
var obj1={
    foo:foo
};
var obj2={};
obj1.foo(2);
console.log(obj1.a);//2
obj1.foo.call(obj3,3);//3；

var bar=new obj.foo(4);
console.log(obj1.a);//2
console.log(bar.a);//4
```
>**4、new绑定比显式绑定中的（硬绑定）优先级高。**

```javascript     
function foo(arg){
    this.a=arg;
}
var obj1={};
var bar=foo.bind(obj1);
bar(2);
console.log(obj1.a);

var baz=new bar(3);
console.log(obj1.a);//2
console.log(baz.a);//3
```
<h4>2.5 绑定例外</h4>
&#8195;&#8195;除了上面介绍的4中绑定方法外，还有一些其他的绑定方式。    

**1、被忽略的this**

```javascript           
function foo(){
    console.log(this.a);
}
var a=3;
foo.call(null);//3
```
在调用call、apply、bind时，传入null或者undefined时会被忽略，this会指向window。这种调用方式会修改全局对象，可能会导致不可预计的后果。所有这里提供了一种更安全的this方法。

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
  Obect.create(null)是js中创建一个空对象的对简单的方法。该方法返回一个{}对象，但是不会有__proto__属性，比var obj={}更空。

  **2、间接引用**

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
上面的代码可以这样理解
var c=b.foo=obj.foo;
c();
```
  注意：对于默认绑定来说，决定this绑定对象的并不是调用位置是否处于严格模式，而是函数体是否处于严格模式。

   **3、软绑定**

   &#8195;&#8195;硬绑定是把this强制绑定到指定的对象（除了new时），防止函数调用默认绑定规则。但是硬绑定会降低函数的灵活性，使用硬绑定之后就无法使用隐式绑定或者显示绑定来修改this。如下面代码所示，不管对foo函数使用隐式绑定还是显示绑定时，调用foo()都不会改变bar()中的this值。

```javascript            
function bar(){
    console.log(this.a)
}
var obj={
    a:2
}
function foo(){
    bar.call(obj)
}
```
​		**软绑定**：给默认绑定指定一个全局对象和undefined以外的值，同时保留隐式绑定或者显示绑定修改this的能力。

```javascript     
Function.prototype.softBind=function(obj){
    let fn=this;
    //获取参数
    let args=[].slice.call(arguments,1);
    let bound = function(){
        return fn.apply(!this||this===(window||global)?obj:this,args.concat([...arguments]));
    }
    bound.prototype=Object.create(fn.prototype);
    return bound;
}
function foo(){
    console.log("a:"+this.a);
}
let obj={
    a:1
}
let obj2={
    a:2
}
let obj3={
    a:3
}
let fooObj=foo.softBind(obj);
fooObj();//a:1
obj2.foo=foo.softBind(obj);
obj2.foo();//a:2;//隐式绑定
fooObj.call(obj3);//a:3 显示绑定
```
   **4、箭头函数**

   &#8195; &#8195;箭头函数会继承外层函数调用的this绑定。

```javascript           
function foo(){
    setTimeOut(()=>{
        console.log(this.a);//2
    },1000)
}
var obj={
    a:1
}
foo.call(obj);
```