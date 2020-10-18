---
title: let、const和var的区别
date: '2020-03-15'
type: 技术
tags: es6
note: let、const和var的区别
---
#### 1、let和const的相同点
+ 不存在变量声明提升。  

+ 暂时性死区(浏览器遗留bug)（只要一进入当前作用域，所要使用的变量就已经存在了，但是不可获取，只有等到声明变量的那一行代码出现，才可以获取和使用该变量）。 基于`typeOf` 检测一个未被声明的变量，不会报错，结果是 `undefined`。
在区块中使用`let`和`const`命令声明的变量，从一开始就形成了封闭作用域。凡是在声明之前就使用这些变量，就会报错(声明之前都是死区)。**本质：只要一进入当前作用域，所要使用的变量就已经存在了，但是不可获取，只有等到声明变量的那一行代码出现，才可以获取和使用该变量。**  
	```js
	//a未定义
	console.log(typeOf a);//undefined
	```   
+ 不允许重复声明。不允许在相同作用域内，重复声明同一个变量。(而且检测是否重复声明发生在**词法解析阶段**。词法解析=>变量提升=>代码执行，在词法解析阶段检测到重复声明，则直接报错，`js` 代码一行都不会执行)。且不论基于什么方式声明的变量，只要在当前上下文中有了，则不允许再基于`let/const`声明。 
	```js
	console.log("ok") //不会输出 在词法分析阶段就报错了
	let a=12;
	let a=13;
	console.log(a)
	```
	```js
	function func() {
        let a = 10;
        var a = 1;
	}
	funb()// // 报错 Identifier 'a' has already been declared

	function func() {
		let a = 10;
		let a = 1;
	}
	func()// 报错 Identifier 'a' has already been declared
	————————————————————————————————————————————————————————
	function bar(x = y, y = 2) {
		return [x, y];
	}
	bar(); // 报错   参数x默认值等于另一个参数y，而此时y还没有声明，属于"死区"(参数读取从左至右)。
	```
	**不能在函数内部重新声明参数。**
	```js
	function funb(arg) {
		let arg;
	}
	func() // 报错Identifier 'arg' has already been declared     形参arg跟局部变量arg在同一个{}内，所以报错
	function func(arg) {
		{
				let arg;
				console.log(arg);//undefined
		}
		console.log(arg);//34
	}
	func(34) 
	```
+ 块级作用域。

	**产生条件：** 除函数或对象的大括号之外，如果括号中出现`let/const/function` 则会产生块级私有上下文。
		```js
		if(1==1){
			//块级私有上下文
			function(){}
		}
		```
		```js   
		//块级作用域的例子
		{
			let a=12;
			var b=23;
		}
		console.log(b);//23
		console.log(a);//ReferenceError a is not defined
		for(let i=0;i<10;i++){}
		console.log(i);//ReferenceError i is not defined
		-----------------------------------------------------------------
		var a = [];
		for (let i = 0; i < 10; i++) {
			//每一个循环都会一个块级上下文,当前上下文中的变量(function(){})被外部变量（a[i]）占用。所以上下文不会被销毁，因而形成了闭包。
			a[i] = function () {
				console.log(i);
			};
		}
		a[6](); // 6
		```     
		&#8195;&#8195;`for`循环还有一个特别之处，就是设置循环变量的那部分是一个父级作用域，而循环体内部是一个单独的子作用域。`JavaScript` 引擎内部会记住上一轮循环的值，初始化本轮的变量i时，就在上一轮循环的基础上进行计算。
		```js       
		for (let i = 0; i < 3; i++) { //父作用域
			let i = 'abc';
			console.log(i);
		}
		// abc
		// abc
		// abc
		```

	**优点：**
	>1、没有块级作用域，内层变量可能会覆盖外层变量(变量声明提升)。    
	>2、用来计数的循环变量会泄露为全局变量。    

	**特点：**
	>1、允许任意嵌套。  
	2、外层作用域无法读取内层作用域的变量。    
	3、使得立即执行函数不再必要了。    
	4、允许在块级作用域中声明函数，函数声明类似于`var`，函数声明会提升到所在的块级作用域的头部。
+ `let、const`声明的全局变量不会挂在顶层对象上。

#### 2、let 跟 const 的区别
+ `let`可以先声明稍后再赋值,而`const`在 声明之后必须马上赋值，否则会报错.
+ `const` 简单类型一旦声明就不能再更改，复杂类型(数组、对象等)指针指向的地址不能更改，内部数据可以更改。**本质：并不是变量的值不得改动，而是变量指向的那个内存地址所不得改动。**   
	+ 1、变量指向的是对象时，可以改变该对象的属性。但是不可将该变量指向另一个对象。
		```js 
		const obj = {}
		// 为 foo 添加一个属性，可以成功
		obj.prop = 123;
		// 将 obj 指向另一个对象，就会报错，此时已经改变了obj所指向的内存地址了
		obj = {}; // TypeError: "foo" is read-only
		```  
	+ 2、变量指向的是数组时，可以改变该数组中的元素及数组的属性。但是不可将该变量指向另一个数组。
		```js
		const a = [];
		a.push('Hello'); // 可执行
		a.length = 0;    // 可执行
		a = ['Dave'];    // 报错，指向了另一个数组
	``` 
+ `let`的常见使用场景是`声明变量`。 `const`的常见使用场景是`声明常量、匿名函数和箭头函数` 

#### 3 let VS var
+ `var`存在变量声明提升,`let`不存在。
```js      
// var 的情况
console.log(foo); // 输出undefined，变量声明提升，相当于在输出之前就var  foo；
var foo = 2;
// let 的情况
console.log(bar); // 报错ReferenceError，没有变量声明提升
let bar = 2;
```
+ "全局上下文"中,基于`var`声明的变量，相当于给`GO`(全局对象 `window`)新增一个属性，并且任何一个发生值的改变，另外一个特惠跟着变化(映射机制);但是基于`let`声明的变量，就是全局变量，跟`GO`没有关系。
	```js
	let a=12;
	console.log(a);//12
	console.log(window.a);//undefined
	------------------------------
	var b=13;
	console.log(b);//13
	console.log(window.b);//13
	window.b=14;
	console.log(b);//14
	-----------------------------
	//没有基于任何关键词声明的，则相当于给window设置一个属性
	n=13；//=>window.n=13;
	console.log(m);//报错 m is not defined
	```
+ 在相同上下文中，`let`不允许重复声明(无论之前基于何种方式声明);`var`可以重复声明，多次声明也只会按声明一次处理。
	```js
	//下面的的代码一行代码都不会执行，因为在"词法分析阶段"，就会报语法错误。(词法分析=>变量提升=>代码执行)
	console.log("test");
	var n=12;
	var n=14;
	let n=15;
	```
+ 暂时性死区[浏览器暂存的BUG]。
	```js
	console.log(n);//报错n is not defined
	console.log(typeOf n);//undefined 基于typeOf检测一个未被声明的变量，不会报错
	——————————————————————
	console.log("ok");//ok
	console.log(typeOf m);//报错，不能在初始化之前适应(发生在代码执行阶段)
	let m=14;
	——————————————————————
	console.log("ok");//ok 
	console.log(n);//Cannot access 'n' before initialization(在执行阶段报错)
	let n=12
	```
+ `let、const、function`会产生块级私有上下文,`var`不会。
**上下文&作用域**
    + 全局上下文
	+ 函数执行形成的"私有上下文"
	+ 块级私有上下文
		+ 除了对象、函数等的大括号外(例如：判断题、循环体、代码块...)都可能产生块级上下文。
		```js
		//这里的n是全局上下文的，代码块不会对他有任何影响
		//m是块级上下文私有的
		{
			var n=12;
			console.log(n);//12
			let m=13;
			console.log(m);//13
		}
		console.log(n);//12
		console.log(m);//m is not defined
		```
		```js
		for(var i=0;i<5;i++){
			console.log(i);//0,1,2,3,4
		}
		console.log(i);//5
		for(let i=0;i<5;i++){
			console.log(i);//0,1,2,3,4
		}
		console.log(i);//i is not defined
		```
#### 4、ES6声明变量的6种方式

&#8195;&#8195;`var、function、let、const、class、import`。`es5`只有`var`和`function`两种。  
&#8195;&#8195;**顶层对象的差异：** 在浏览器环境指的是 `window` 对象，在 `Node` 中 指的是 `global` 对象，在 `Web Worker` 里面，`self`也指向顶层对象。   
&#8195;&#8195;ES5 之中，顶层对象的属性与全局变量是等价的。`ES6`中的`var`命令和`function`命令声明的全局变量，依旧是顶层对象的属性；`let`命令、`const`命令、`class`命令声明的全局变量，不属于顶层对象的属性。
```js       
var a = 1;
window.a // 1

let b = 1;
window.b // undefined
```
&#8195;&#8195;**新版本浏览器变量提升**
```js
//在node环境下运行
console.log(fn)//undefined ，只是声明function fn，并没有定义;
if (1 == 1) {
	//在此大括号中fn形成一个全新的私有的块级上下文
    console.log(fn) //[Function:fn]
    function fn () { //全局提升一次，块级上下文提升一次
        console.log("ok")
	}
	//把私有的fn=12
    fn = 12
    console.log(fn) //12
}
console.log(fn);//[Function:fn]
```