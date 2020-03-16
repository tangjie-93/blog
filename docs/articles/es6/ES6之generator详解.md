---
title: ES6之generator详解
date: '2020-03-15'
type: 技术
tags: es6
note: ES6之generator详解
---

&#8195;&#8195;是 ES6 提供的**一种异步编程解决方案。** 语法上是一个**状态机，封装了多个内部状态** 。执行 Generator 函数会**返回一个遍历器对象**。这一点跟promise很像，promise是一个容器，里面保存着某个未来才会结束的事件（通常是一个异步操作）的结果。  
&#8195;&#8195;Generator 函数是一个普通函数，但是有两个特征。
>1、function关键字与函数名之间有一个星号（位置不固定）；    

>2、函数体内部使用yield表达式，定义不同的内部状态（yield在英语里的意思就是“产出”）。
```js
function* helloWorldGenerator() {
    yield 'hello';
    yield 'world';
    return 'ending';
}
var hw = helloWorldGenerator();
hw.next()  // { value: 'hello', done: false }
hw.next()// { value: 'world', done: false }
hw.next()// { value: 'ending', done: true }
hw.next() // { value: undefined, done: true }
```        
&#8195;&#8195;该函数有三个状态：hello，world 和 return 语句（结束执行）。调用 Generator 函数后，该函数并不执行，返回的也不是函数运行结果，而是一个**指向内部状态的指针对象**，也就是上一章介绍的遍历器对象（Iterator Object）。下一步，必须调用遍历器对象的next方法，使得指针移向下一个状态（**执行yield后面的语句，直到遇到yield或者return语句**）。

<h4>1、	yield表达式</h4>

&#8195;&#8195;`yield`表达式就是暂停标志。**并将紧跟在`yield`后面的那个表达式的值，作为返回的对象的`value`属性值。**`yield`表达式后面的表达式，只有当调用`next`方法、内部指针指向该语句时才会执行。

&#8195;&#8195;`yield`表达式与`return`语句既有相似之处，也有区别。相似之处在于，都能返回紧跟在语句后面的那个表达式的值。区别在于每次遇到`yield`，函数暂停执行，下一次再从该位置继续向后执行，而`return`语句不具备**位置记忆**的功能。

&#8195;&#8195;**注意：**

>1、	yield表达式只能用在 Generator 函数里面，用在其他地方都会报错。  
>2、	yield表达式如果用在另一个表达式之中，必须放在圆括号里面。
```js
function* demo() {
    console.log('Hello' + yield); // SyntaxError
    console.log('Hello' + yield 123); // SyntaxError
    console.log('Hello' + (yield)); // OK
    console.log('Hello' + (yield 123)); // OK
}
```       
>3、	yield表达式用作函数参数或放在赋值表达式的右边，可以不加括号。
```js
function* demo() {
    foo(yield 'a', yield 'b'); // OK
    let input = yield; // OK
}
```       
&#8195;&#8195;任意一个对象的Symbol.iterator方法，等于该对象的遍历器生成函数，调用该函数会返回该对象的一个遍历器对象。    
&#8195;&#8195;Generator 函数就是遍历器生成函数，因此可以把 Generator 赋值给对象的Symbol.iterator属性，从而使得该对象具有 Iterator 接口。
```js       
var myIterable = {};
myIterable[Symbol.iterator] = function* () {
    yield 1;
    yield 2;
    yield 3;
};
[...myIterable] // [1, 2, 3]
```       
&#8195;&#8195;Generator 函数执行后，返回一个遍历器对象。该对象本身也具有Symbol.iterator属性，执行后返回自身。
```js
function* gen(){
    // some code
}
var g = gen();
g[Symbol.iterator]() === g   // true
```       
<h4>2、	next方法的参数</h4>

&#8195;&#8195;**`yield`表达式本身没有返回值，或者说总是返回`undefined`。`next`方法可以带一个参数，该参数就会被当作上一个`yield`表达式的返回值。** 从语义上讲，第一个`next`方法用来启动遍历器对象，所以不用带有参数。
```js
function* f() {
    for(var i = 0; true; i++) {
        var reset = yield i;
        if(reset) { i = -1; }
    }
}
var g = f();
console.log(g.next()) // { value: 0, done: false }
console.log (g.next()) // { value: 1, done: false }
console.log (g.next(true) )// { value: 0, done: false } 执行i=-1，然后i++变成了0
```        
&#8195;&#8195;再看下面的一个例子
```js
function* foo(x) {
    var y = 2 * (yield (x + 1));
    var z = yield (y / 3);
    return (x + y + z);
}
var a = foo(5);
console.log(a.next()) // Object{value:6, done:false}
console.log(a.next()) // Object{value:NaN, done:false}，此时的y等于undefined
console.log(a.next()) // Object{value:NaN, done:true}
var b = foo(5);
console.log(b.next()) // { value:6, done:false }
console.log(b.next(12)) // { value:8, done:false } 此时的y=2*12 
console.log(b.next(13)) // { value:42, done:true } 5+24+13
```        
&#8195;&#8195;通过next方法的参数，向 Generator 函数内部输入值的例子。
```js
//例子1
function* dataConsumer() {
    console.log('Started');
    console.log(`1. ${yield}`);
    console.log(`2. ${yield}`);
    return 'result';
}
let genObj = dataConsumer();
genObj.next();// Started。执行了 console.log('Started');和`1. ${yield}`这两句
genObj.next('a') // 1. a。执行了 console.log(`1. ${yield}`);和`2. ${yield}`这两句
console.log(genObj.next('b') )   //2.b    {value: "result", done: true}。执行了console.log(`2. ${yield}`);和return 'result';这两句
```        
&#8195;&#8195;上面的console.log(`1. ${yield}`);分两步执行，首先执行yield，等到执行next()时再执行console.log();
```js        
//例子2
function* dataConsumer() {
    console.log('Started');
    yield 1;
    yield;
    var a=yield;
    console.log("1. "+a);
    var b=yield;
    console.log("2. "+b);
    return 'result';
}
let genObj = dataConsumer();
console.log( genObj.next())
console.log(genObj.next());
console.log(genObj.next('a'))
console.log( genObj.next('b'));
```       
&#8195;&#8195;输出结果如下：四次输出结果如红线框中所示

![](https://user-gold-cdn.xitu.io/2019/4/14/16a1bd728468770c?w=1918&h=196&f=png&s=44019)
&#8195;&#8195;结果分析：第一次调用next(),执行到yield 1结束；第二次调用next()执行到yield结束；第三次调用next("a")执行 var a=yield中的yield；第四次调用next("b")方法调用var a=yield语句和var b=yield中的yield；

<h4>3、	for…of</h4>

&#8195;&#8195;`for...of`循环可以自动遍历 Generator 函数运行时生成的Iterator对象，且此时不再需要调用next方法。
```js
function* foo() {
    yield 1;
    yield 2;
    yield 3;
    yield 4;
    yield 5;
    return 6;
}
for (let v of foo()) {
    console.log(v);
}
// 1 2 3 4 5
```       
&#8195;&#8195;**一旦next方法的返回对象的`done`属性为`true`，`for...of`循环就会中止，且不包含该返回对象**，所以上面代码的return语句返回的6，不包括在`for...of`循环之中。    
&#8195;&#8195;除了`for...of`循环以外，扩展运算符（...）、解构赋值和`Array.from`方法内部调用的，都是遍历器接口。这意味着，它们都可以将 `Generator` 函数返回的 `Iterator` 对象，作为参数，并且遇到`Generator` 函数中的`return`语句结束。
```js
function* numbers () {
    yield 1
    yield 2
    return 3
    yield 4
}
// 扩展运算符
[...numbers()] // [1, 2]
// Array.from 方法
Array.from(numbers()) // [1, 2]
// 解构赋值
let [x, y] = numbers();
x // 1
y // 2
// for...of 循环
for (let n of numbers()) {
    console.log(n)
}
// 1,2
```       
<h4>4、	Generator.prototype.throw()</h4>

&#8195;&#8195;在函数体外抛出错误，然后在 Generator 函数体内捕获。**如果是全局throw()命令，只能被函数体外的catch语句捕获。**
```js
var g = function* () {
    try {
        yield;
    } catch (e) {
        console.log('内部捕获', e);
    }
};
var i = g();
i.next();
try {
    i.throw('a');//被内部捕获，所以下面的代码还能正常运行
    i.throw('b');//被外部捕获
} catch (e) {
    console.log('外部捕获', e);
}
// 内部捕获 a
// 外部捕获 b
```
&#8195;&#8195;如果 Generator 函数内部没有部署try...catch代码块，那么throw方法抛出的错误，将被外部try...catch代码块捕获。
```js
var g = function* () {
    while (true) {
        yield;
        console.log('内部捕获', e);
    }
};
var i = g();
i.next();
try {
    i.throw('a');//被外部捕获，所以下面的代码不运行了
    i.throw('b');
} catch (e) {
    console.log('外部捕获', e);
}
// 外部捕获 a
```        
&#8195;&#8195;如果 Generator 函数内部和外部，都没有部署try...catch代码块，那么程序将报错，直接中断执行。
**throw方法抛出的错误要被内部捕获，前提是必须至少执行过一次next方法。**
```js
function* gen() {
    try {
        yield 1;
    } catch (e) {
        console.log('内部捕获');
    }
}

var g = gen();
g.throw(1);
// Uncaught 1
```       
**&#8195;&#8195;throw方法被捕获以后，会附带执行下一条yield表达式。也就是说，会附带执行一次next方法。**
```js
var gen = function* gen(){
    try {
    yield console.log('a');
    } catch (e) {
    // ...
    }
    yield console.log('b');
    yield console.log('c');
}
var g = gen();
g.next() // a
g.throw() // b
g.next() // c
```       
&#8195;&#8195;另外，throw命令与g.throw方法是无关的，两者互不影响。
```js       
var gen = function* gen(){
    yield console.log('hello');
    yield console.log('world');
}

var g = gen();
g.next();

try {
    throw new Error();
} catch (e) {
    g.next();
}
// hello
// world
```       
&#8195;&#8195;一旦 Generator 执行过程中抛出错误，且没有被内部捕获，就不会再执行下去了。如果此后还调用next方法，将返回一个value属性等于undefined、done属性等于true的对象，即 JavaScript 引擎认为这个 Generator 已经运行结束了。
```js
function* g() {
    yield 1;
    console.log('throwing an exception');
    throw new Error('generator broke!');//中断函数的运行
    yield 2;
    yield 3;
}

function log(generator) {
    var v;
    console.log('starting generator');
    try {
        v = generator.next();
        console.log('第一次运行next方法', v);
    } catch (err) {
        console.log('捕捉错误', v);
    }
    try {
    v = generator.next();
        console.log('第二次运行next方法', v);//因为上面代码调用时报错了，所以不会执行该语句
    } catch (err) {
        console.log('捕捉错误', v);
    }
    try {
    v = generator.next();
        console.log('第三次运行next方法', v);
    } catch (err) {
        console.log('捕捉错误', v);
    }
    console.log('caller done');
}
log(g());
// starting generator
// 第一次运行next方法 { value: 1, done: false }
// throwing an exception
// 捕捉错误 { value: 1, done: false }
// 第三次运行next方法 { value: undefined, done: true }
// caller done
```       
<h4>5、	Generator.prototype.return()</h4>

&#8195;&#8195;返回给定的值，并且终结遍历 Generator 函数。
```js
function* gen() {
    yield 1;
    yield 2;
    yield 3;
}
var g = gen();
g.next()        // { value: 1, done: false }
g.return('foo') // { value: "foo", done: true } //
g.next()        // { value: undefined, done: true }
```       
&#8195;&#8195;如果 Generator 函数内部有try...finally代码块，且正在执行try代码块，那么return方法会推迟到finally代码块执行完再执行。
```js
function* numbers () {
    yield 1;
    try {
        yield 2;
        yield 3;
    } finally {
        yield 4;
        yield 5;
    }
    yield 6;
}
var g = numbers();
g.next() // { value: 1, done: false }
g.next() // { value: 2, done: false }
g.return(7) // { value: 4, done: false }
g.next() // { value: 5, done: false }
g.next() // { value: 7, done: true }
g.next() // { value: undefined, done: true }
```       
<h4>6、	next()、throw()、return()的共同点及区别</h4>

&#8195;&#8195;它们的作用都是让 Generator 函数恢复执行，并且使用不同的语句替换yield表达式。

>next()是将yield表达式替换成一个值。    
>throw()是将yield表达式替换成一个throw语句。    
>return()是将yield表达式替换成一个return语句。 

<h4>17.7、	yield* 表达式</h4>

&#8195;&#8195;用到yield*表达式，用来在一个 Generator 函数里面执行另一个 Generator 函数。
```js       
function* foo() {
    yield 'a';
    yield 'b';
}
function* bar() {
    yield 'x';
    yield* foo(); //
    yield 'y';
}
// 等同于
function* bar() {
    yield 'x';
    yield 'a';
    yield 'b';
    yield 'y';
}
// 等同于
function* bar() {
    yield 'x';
    for (let v of foo()) {
    yield v;
    }
    yield 'y';
}
for (let v of bar()){
    console.log(v);
}
// "x"   // "a"   // "b"   // "y"
function* inner() {
    yield 'hello!';
    return "test"
}
function* outer1() {
    yield 'open';
    yield inner();
    yield 'close';
}
var gen = outer1()
console.log(gen.next().value) // "open"
var test=gen.next().value // 返回一个遍历器对象
console.log(test.next().value) //"hello"
console.log(test.next().value)// "test"
console.log(gen.next().value) // "close"
```       
&#8195;&#8195;yield*后面的 Generator 函数（没有return语句时），等同于在 Generator 函数内部，部署一个for...of循环。
```js
function* concat(iter1, iter2) {
    yield* iter1;
    yield* iter2;
}
// 等同于
function* concat(iter1, iter2) {
    for (var value of iter1) {
        yield value;
    }
    for (var value of iter2) {
        yield value;
    }
}
```       
&#8195;&#8195;如果yield*后面跟着一个数组，由于数组原生支持遍历器，因此就会遍历数组成员。
```js
function* gen(){
    yield* ["a", "b", "c"];
}
console.log(gen().next()) // { value:"a", done:false }
```        
&#8195;&#8195;实际上，任何数据结构只要有 Iterator 接口，就可以被yield*遍历。
**如果被代理的 Generator 函数有return语句，那么就可以向代理它的 Generator 函数返回数据。**
```js
function* foo() {
    yield 2;
    yield 3;
    return "foo";
}

function* bar() {
    yield 1;
    var v = yield* foo();
    console.log("v: " + v);
    yield 4;
}
var it = bar();
it.next()
// {value: 1, done: false}
it.next()
// {value: 2, done: false}
it.next()
// {value: 3, done: false}
it.next();
// "v: foo"
// {value: 4, done: false}
it.next()
// {value: undefined, done: true}

function* iterTree(tree) {
    if (Array.isArray(tree)) {
    for(let i=0; i < tree.length; i++) {
        yield* iterTree(tree[i]);
    }
    } else {
    yield tree;
    }
}
const tree = [ 'a', ['b', 'c'], ['d', 'e'] ];
for(let x of iterTree(tree)) {
    console.log(x);
}
// a  // b   // c   // d   // e
```       
<h4>&#8195;17.8、	作为对象的属性的Generator函数</h4>
```js
let obj = {
    * myGeneratorMethod() {
    •••
    }
};
```        
<h4>&#8195;17.9、	Generator函数的this</h4>

&#8195;&#8195;**Generator 函数总是返回一个遍历器，ES6 规定这个遍历器是 Generator 函数的实例，也继承了 Generator 函数的prototype对象上的方法**。
```js
function* g() {}
g.prototype.hello = function () {
    return 'hi!';
};
let obj = g();
obj instanceof g // true
obj.hello() // 'hi!'
```        
&#8195;&#8195;通过生成一个空对象，使用call方法绑定 Generator 函数内部的this。
```js
function* F() {
    this.a = 1;
    yield this.b = 2;
    yield this.c = 3;
}
var obj = {};
var f = F.call(obj);//调动F()并且把obj作为this传进去，这样给obj添加a、b、c属性
console.log(f.next());  // Object {value: 2, done: false}
console.log(f.next());  // Object {value: 3, done: false}
console.log(f.next());  // Object {value: undefined, done: true}
console.log(obj.a) // 1
console.log(obj.b) // 2
console.log(obj.c) // 3
```       
&#8195;&#8195;将obj换成F.prototype。将这两个对象统一起来。再将F改成构造函数，就可以对它执行new命令了。
```js
function* gen() {
    this.a = 1;
    yield this.b = 2;
    yield this.c = 3;
}
function F() {
    return gen.call(gen.prototype);
}
var f = new F();
f.next();  // Object {value: 2, done: false}
f.next();  // Object {value: 3, done: false}
f.next();  // Object {value: undefined, done: true}
f.a // 1
f.b // 2
f.c // 3
```       
&#8195;&#8195;多个线程（单线程情况下，即多个函数）可以并行执行，但是只有一个线程（或函数）处于正在运行的状态，其他线程（或函数）都处于暂停态（suspended），线程（或函数）之间可以交换执行权。并行执行、交换执行权的线程（或函数），就称为协程。

<h4>&#8195;17.10、	应用</h4>

&#8195;&#8195;1、	异步操作的同步表达。
通过 Generator 函数部署 Ajax 操作，可以用同步的方式表达。
```js        
function makeAjaxCall(url,callBack){
    var xhr;
    if (window.XMLHttpRequest)
    {
        //IE7+, Firefox, Chrome, Opera, Safari 浏览器执行代码
        xhr=new XMLHttpRequest();
    }else{
        // IE6, IE5 浏览器执行代码
        xhr=new ActiveXObject("Microsoft.XMLHTTP");
    }
    xhr.open("GET",makeAjaxCall,true);//确保浏览器兼容性。
    xhr.onreadystatechange=function(){
        if (xhr.readyState==4 && xhr.status==200)
        {   
            if(xhr.status>=200&&xhr.status<300||xhr.status==304){
                callBack(xhr.responseText;); 
            } 
        }
    }
    xmlhttp.send();
}

function* main() {
    var result = yield request("https://juejin.im/editor/posts/5cb209e36fb9a068b52fb360");
    var resp = JSON.parse(result);
    console.log(resp.value);
}
function request(url) {
        makeAjaxCall(url, function(response){
        it.next(response);//将response作为上一次yield的返回值
        });
}
var it = main();
it.next();
```     
&#8195;&#8195;使用yield表达式可以手动逐行读取文件。
```js
function* numbers() {
    let file = new FileReader("numbers.txt");
    try {
    while(!file.eof) {
        yield parseInt(file.readLine(), 10);
    }
    } finally {
        file.close();
    }
}
```       
&#8195;&#8195;2、	控制流管理
```js
step1(function (value1) {
    step2(value1, function(value2) {
    step3(value2, function(value3) {
        step4(value3, function(value4) {
        // Do something with value4
        });
    });
    });
});
```       
&#8195;&#8195;使用Promise
```js
Promise.resolve(step1)
    .then(step2)
    .then(step3)
    .then(step4)
    .then(function (value4) {
    // Do something with value4
    }, function (error) {
    // Handle any error from step1 through step4
    })
    .done();
```          
&#8195;&#8195;使用Generator
```js
function* longRunningTask(value1) {
    try {
    var value2 = yield step1(value1);
    var value3 = yield step2(value2);
    var value4 = yield step3(value3);
    var value5 = yield step4(value4);
    // Do something with value4
    } catch (e) {
    // Handle any error from step1 through step4
    }
}
scheduler(longRunningTask(initialValue));
function scheduler(task) {
    var taskObj = task.next(task.value);
    // 如果Generator函数未结束，就继续调用
    if (!taskObj.done) {
    task.value = taskObj.value
    scheduler(task);
    }
}
function step1(value){
    return value*2;
}
function step2(value){
    return value*2;
}
function step3(value){
    return value*2;
}
function step4(value){
    return value*2;
}
```       
&#8195;&#8195;**注意，上面这种做法，只适合同步操作，即所有的task都必须是同步的，不能有异步操作。**
&#8195;&#8195;3、	部署iterator接口
```js
function* iterEntries(obj) {
    let keys = Object.keys(obj);
    for (let i=0; i < keys.length; i++) {
    let key = keys[i];
    yield [key, obj[key]];
    }
}
let myObj = { foo: 3, bar: 7 };
for (let [key, value] of iterEntries(myObj)) {
    console.log(key, value);
}
// foo 3
// bar 7
```       
&#8195;&#8195;4、	作为数据结构
```js
function* doStuff() {
    yield fs.readFile.bind(null, 'hello.txt');
    yield fs.readFile.bind(null, 'world.txt');
    yield fs.readFile.bind(null, 'and-such.txt');
}
for (task of doStuff()) {}
    // task是一个函数，可以像回调函数那样使用它
```         
<h4>17.11、	Generator函数的异步调用（**需要好好理解弄懂**）</h4>
&#8195;&#8195;异步编程的方法主要有这几种：

>1、回调函数(耦合性太强)    
>2、事件监听    
>3、发布/订阅   
>4、Promise 对象    
>5、generator   
&#8195;&#8195;1.	使用Generator来封装异步函数
```js
var fetch = require('node-fetch');
function* gen(){
    var url = 'https://api.github.com/users/github';
    var result = yield fetch(url);
    console.log(result.bio);
}
var g = gen();
var result = g.next();
result.value.then(function(data){
    return data.json();
}).then(function(data){
    g.next(data);
});
```       
&#8195;&#8195;首先执行 Generator 函数，获取遍历器对象，然后使用next方法（第二行），执行异步任务的第一阶段。由于Fetch模块返回的是一个 Promise 对象，因此要用then方法调用下一个next方法。
&#8195;&#8195;2.	Thunk函数   
&#8195;&#8195;编译器的“传名调用”实现，往往是将参数放到一个临时函数之中，再将这个临时函数传入函数体。这个临时函数就叫做 Thunk 函数。
```js
function f(m) {
    return m * 2;
}
f(x + 5);
// 等同于
var thunk = function () {
    return x + 5;
};
function f(thunk) {
    return thunk() * 2;
}
f(thunk)
// 正常版本的readFile（多参数版本）
fs.readFile(fileName, callback);
// Thunk版本的readFile（单参数版本）
var Thunk = function (fileName) {
    return function (callback) {
    return fs.readFile(fileName, callback);
    };
};
var readFileThunk = Thunk(fileName);
readFileThunk(callback);
```       
&#8195;&#8195;3.	基于 Promise 对象的自动执行
```js
var fs = require('fs');
var readFile = function (fileName){
    return new Promise(function (resolve, reject){
    fs.readFile(fileName, function(error, data){
        if (error) return reject(error);
        resolve(data);
    });
    });
};
var gen = function* (){
    var f1 = yield readFile('/etc/fstab');
    var f2 = yield readFile('/etc/shells');
    console.log(f1.toString());
    console.log(f2.toString());
};
```        
&#8195;&#8195;然后，手动执行上面的 Generator 函数。
```js
var g = gen();
g.next().value.then(function(data){
    g.next(data).value.then(function(data){
    g.next(data);
    });
});
```       
&#8195;&#8195;自动执行器写法：
```js
function run(gen){
    var g = gen();
    function next(data){
    var result = g.next(data);
    if (result.done) return result.value;
    result.value.then(function(data){
        next(data);
    });
    }
    next();
}
run(gen);
```