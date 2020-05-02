---
title: 数据类型Symbo及其常见用法
date: '2020-03-15'
type: 技术
tags: es6
note: 数据类型Symbo及其常见用法
---
&#8195;&#8195;新的原始数据类型Symbol，表示独一无二的值，是javascript的第七种数据类型。前六种是：Undefined、Null、布尔值（Boolean）、字符串（String）、数值（Number）、对象（Object）。

**注意事项：**

>1、Symbol函数前不能使用new命令，否则会报错。由于 Symbol 值不是对象，所以不能添加属性。**基本上，它是一种类似于字符串的数据类型。** Symbol函数可以接受一个字符串作为参数，表示对 Symbol 实例的描述。
```js
let s1 = Symbol('foo');
let s2 = Symbol('bar');
console.log(s1) // Symbol(foo)
console.log(s1.toString()) //  Symbol(foo)
```
> 2、如果 Symbol 的参数是一个对象，就会调用该对象的toString方法，将其转为字符串，然后才生成一个 Symbol 值。
```js
const obj = {
	toString() {
		return 'abc';
	}
};
const sym = Symbol(obj);
console.log(sym)   // Symbol(abc)
```
> 3、Symbol函数的参数只是表示对当前`Symbol`值的描述，因此**相同参数的Symbol函数的返回值是不相等的。**
```js
// 没有参数的情况
let s1 = Symbol();
let s2 = Symbol();
s1 === s2 // false
// 有参数的情况
let s1 = Symbol('foo');
let s2 = Symbol('foo');
s1 === s2 // false
```
> 4、Symbol 值不能与其他类型的值进行运算，会报错。
```js
let sym = Symbol('My symbol');
"your symbol is " + sym
// TypeError: can't convert symbol to string
`your symbol is ${sym}`
// TypeError: can't convert symbol to string
```
> 5、Symbol 值可以显式转为字符串。也可以转为布尔值，但是不能转为数值。
```js
let sym = Symbol('My symbol');
String(sym) // 'Symbol(My symbol)'
sym.toString() // 'Symbol(My symbol)'
let sym = Symbol();
Boolean(sym) // true
!sym  // false
if (sym) {}
Number(sym) // TypeError
Console.log(sym + 2) // TypeError
```
### Symbol的常见用法
<h4>&#8195;1、	作为属性名</h4>

&#8195;&#8195;Symbol 值作为对象属性名时，不能用点运算符。一般使用方括号。
```js
const mySymbol = Symbol();
const a = {};
a.mySymbol = 'Hello!';//此处的mySymbol只能看成是字符串，而不能看成是一个Symbol值
console.log(a[mySymbol])  // undefined
consoe.log(a['mySymbol']) // "Hello!"
```
&#8195;&#8195;**在对象的内部，使用 `Symbol` 值定义属性时，`Symbol` 值必须放在方括号之中。**
```js
let s = Symbol();
let obj = {
	[s]: function (arg) { ... }
};
obj[s](123);
```
&#8195;&#8195;`Symbol` 类型还可以用于定义一组常量，保证这组常量的值都是不相等的。`Symbol` 值作为属性名时，该属性还是公开属性，不是私有属性。
魔术字符串：在代码之中多次出现、与代码形成强耦合的某一个具体的字符串或者数值。利用`Symbol`来消除。
```js
const shapeType = {
	triangle: Symbol('Triangle')
};

function getArea(shape, options) {
	let area = 0;
	switch (shape) {
	case shapeType.triangle:
		area = 5 * options.width * options.height;
		break;
	}
	return area;
}
getArea(shapeType.triangle, { width: 100, height: 100 });
```
<h4>&#8195;2、	属性名的遍历</h4>

&#8195;&#8195;Symbol 作为属性名，该属性不会出现在`for...in、for...of`循环中，也不会被`Object.keys()、Object.getOwnPropertyNames()、JSON.stringify()`返回。但是，它也不是私有属性，有一个`Object.getOwnPropertySymbols`方法，可以获取指定对象的所有 `Symbol` 属性名。可以利用这个特性，为对象定义一些非私有的、但又希望只用于内部的方法。
<h4>&#8195;3、	Symbol.for()、Symbol.keyFor()</h4>

&#8195;&#8195;**Symbol.for("foo"):** 接受一个字符串作为参数，然后搜索有没有以该参数作为名称的 `Symbol` 值。如果有，就返回这个 `Symbol` 值，否则就新建并返回一个以该字符串为名称的 `Symbol` 值。
```js
let s1 = Symbol.for('foo');
let s2 = Symbol.for('foo');
console.log(s1 === s2)   // true
```       
**&#8195;&#8195;Symbol.keyFor:** 返回一个已登记的 `Symbol` 类型值的`key`。返回一个使用`Symbol.for()`方法定义的key。
```js
let s1 = Symbol.for("foo");
Symbol.keyFor(s1) // "foo"
let s2 = Symbol("foo");
Symbol.keyFor(s2) // undefined
```       
&#8195;&#8195;**注意：`Symbol.for`为 `Symbol` 值登记的名字，是全局环境的，可以在不同的 `iframe` 或 `service worker` 中取到同一个值。**

<h4>&#8195;4、	内置的Symbol值</h4>

&#8195;&#8195;**Symbol.hasInstance：** 对象的`Symbol.hasInstance`属性，指向一个内部方法。当其他对象使用`instanceof`运算符，判断是否为该对象的实例时，会调用这个方法。比如，`foo instanceof Foo`在语言内部，实际调用的是`Foo[Symbol.hasInstance](foo)`。
```js
class MyClass {
	[Symbol.hasInstance](foo) {
		return foo instanceof Array;
	}
}
console.log([1, 2, 3] instanceof new MyClass()) // true 
```
&#8195;&#8195;**Symbol.isConcatSpreadable:** 等于一个布尔值，表示该对象用于`Array.prototype.concat()`时，是否可以展开。
```js
let arr1 = ['c', 'd'];
['a', 'b'].concat(arr1, 'e') // ['a', 'b', 'c', 'd', 'e']
arr1[Symbol.isConcatSpreadable] // undefined
let arr2 = ['c', 'd'];
arr2[Symbol.isConcatSpreadable] = false;
['a', 'b'].concat(arr2, 'e') // ['a', 'b', ['c','d'], 'e']
```
&#8195;&#8195;类似数组的对象正好相反，默认不展开。它的`Symbol.isConcatSpreadable`属性设为true，才可以展开。
```js       
let obj = {length: 2, 0: 'c', 1: 'd'};
['a', 'b'].concat(obj, 'e') // ['a', 'b', obj, 'e']
obj[Symbol.isConcatSpreadable] = true;
['a', 'b'].concat(obj, 'e') // ['a', 'b', 'c', 'd', 'e']
```       
&#8195;&#8195;**Symbol.species:** 指向一个构造函数。创建衍生对象时，会使用该属性。下面例子中b、c是a的衍生对象。
```js
class MyArray extends Array {
	static get [Symbol.species]() { return Array; }
}
const a = new MyArray(1, 2, 3);
const b = a.map(x => x);
const c = a.filter(x => x > 1);
b instanceof MyArray // false
b instanceof Array //true
c instanceof MyArray // false
```
&#8195;&#8195;**主要的用途:** 有些类库是在基类的基础上修改的，那么子类使用继承的方法时，作者可能希望返回基类的实例，而不是子类的实例。  
&#8195;&#8195;还有其他属性就不一一例举了：`Symbol.match、Symbol.replace、Symbol.search、Symbol.split、Symbol.iterator、Symbol.toPrimitive、Symbol.toStringTag（toString（））、Symbol.unscopables（with）`