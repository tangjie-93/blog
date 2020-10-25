---
title: Iterator详解
date: '2020-03-16'
type: 技术
tags: es6
note: Iterator详解
---
<h3>Iterator</h3>

&#8195;&#8195;`Iterator`是一种接口，为各种不同的数据结构提供统一的访问机制。任何数据结构只要部署 `Iterator`接口，就可以完成遍历操作（即依次处理该数据结构的所有成员）。
Iterator 的作用有三个：

>1)	为各种数据结构，提供一个统一的、简便的访问接口；    
>2)	使得数据结构的成员能够按某种次序排列；
>3)	ES6 创造了一种新的遍历命令`for...of`循环，**Iterator 接口主要供for...of消费。**

&#8195;&#8195;ES6 规定，默认的 `Iterator`接口部署在数据结构的`Symbol.iterator`属性上，或者说，一个数据结构只要具有`Symbol.iterator`属性，就可以认为是“可遍历”的。
```js
const obj = {
	[Symbol.iterator] : function () {
		return {
			next: function () {
				return {
					value: 1,
					done: true
				};
			}
		};
	}
};
```        
&#8195;&#8195;原生具备 Iterator 接口的数据结构如下。

&#8195;&#8195;1、Array  
&#8195;&#8195;2、Map    
&#8195;&#8195;3、Set    
&#8195;&#8195;4、String     
&#8195;&#8195;5、TypedArray     
&#8195;&#8195;6、函数的 arguments 对象  
&#8195;&#8195;7、NodeList 对象

&#8195;&#8195;下面是两个通过调用[Symbol.iterator]()方法来Iterator接口的例子。
```js
//数组的遍历 部署 Iterator 接口 let iter = arr[Symbol.iterator]();
let arr = ['a', 'b', 'c'];
let iter = arr[Symbol.iterator]();
console.log(iter.next()) // { value: 'a', done: false }
console.log (iter.next()) // { value: 'b', done: false }
console.log (iter.next()) // { value: 'c', done: false }
console.log (iter.next()) // { value: undefined, done: true }
//字符串的遍历 部署 Iterator 接口 someString[Symbol.iterator]();
var someString = "hi";
typeof someString[Symbol.iterator]
// "function"
var iterator = someString[Symbol.iterator]();
iterator.next()  // { value: "h", done: false }
iterator.next()  // { value: "i", done: false }
iterator.next()
```       
&#8195;&#8195;对于类似数组的对象（存在数值键名和length属性），部署 `Iterator` 接口，有一个简便方法，就是`Symbol.iterator`方法直接引用数组的 `Iterator` 接口。
```js
NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
// 或者
NodeList.prototype[Symbol.iterator] = [][Symbol.iterator];
[...document.querySelectorAll('div')] // 可以执行了
```       
<h4>1、	调用iterator接口的场合</h4>

>（1）	解构赋值  
```js
var set=[1,2,3]
let [first, ...rest] = set;
```       
>（2）	扩展运算符  
```js       
var str = 'hello';
console.log([...str]) //  ['h','e','l','l','o']
```       
>（3）	yield*  
```js       
let generator = function* () {
	yield 1;
	yield* [2,3,4];
	yield 5;
};

var iterator = generator();

iterator.next() // { value: 1, done: false }
iterator.next() // { value: 2, done: false }
iterator.next() // { value: 3, done: false }
iterator.next() // { value: 4, done: false }
iterator.next() // { value: 5, done: false }
iterator.next() // { value: undefined, done: true }
```
>（4）	其他一些场合（for…of、Array.form()）

&#8195;&#8195;JavaScript 原有的**for...in循环，只能获得对象的键名**，不能直接获取键值。ES6 提供**for...of循环，允许遍历获得键值**。数组的遍历器接口只返回具有数字索引的属性。
```js
var arr = ['a', 'b', 'c', 'd'];
arr.foo = 'hello';
//获取的是键名
for (let a in arr) {
	console.log(a); // 0 1 2 3
}
//获取的是键值
for (let a of arr) {
	console.log(a); // a b c d
}
```       
&#8195;&#8195;Set 结构遍历时，返回的是一个值，而 Map 结构遍历时，返回的是一个数组，该数组的两个成员分别为当前 Map 成员的键名和键值。
```js
let map = new Map().set('a', 1).set('b', 2);
for (let pair of map) {
	console.log(pair); // ['a', 1]   // ['b', 2]
}
for (let [key, value] of map) {
	console.log(key + ' : ' + value); // a : 1   // b : 2
}
```       
&#8195;&#8195;并不是所有类似数组的对象都具有 Iterator 接口，一个简便的解决方法，就是使用`Array.from`方法将其转为数组。
```js
let arrayLike = { length: 2, 0: 'a', 1: 'b' };
// 报错
for (let x of arrayLike) {
	console.log(x);
}
// 正确
for (let x of Array.from(arrayLike)) {
	console.log(x);
}
```       
&#8195;&#8195;**for...in循环有几个缺点。**

&#8195;&#8195;1、数组的键名是数字，但是`for...in`循环是以字符串作为键名“0”、“1”、“2”等等。  
&#8195;&#8195;2、`for...in`循环不仅遍历数字键名，还会遍历手动添加的其他键，甚至包括**原型链上的键。**          
&#8195;&#8195;3、某些情况下，`for...in`循环会**以任意顺序遍历键名。**

&#8195;&#8195;**总之，for...in循环主要是为遍历对象而设计的，不适用于遍历数组。**

&#8195;&#8195;**for...of循环相比上面几种做法，有一些显著的优点:**

&#8195;&#8195;1、有着同`for...in`一样的简洁语法，但是没有`for...in`那些缺点。   
&#8195;&#8195;2、不同于`forEach`方法，它可以与`break、continue`和`return`配合使用。    
&#8195;&#8195;3、提供了遍历所有数据结构的统一操作接口(`具有[Symbol.iterator]`属性)。
&#8195;&#8195;4、`for...in`循环，只能获得对象的键名，不能直接获取键值。ES6 提供`for...of`循环，允许遍历获得键值。