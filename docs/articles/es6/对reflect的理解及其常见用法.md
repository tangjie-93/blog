---
title: 对reflect的理解及其常见用法
date: '2020-01-14'
type: 技术
tags: es6
note: 对reflect的理解及其常见用法
---
&#8195;&#8195;与Proxy对象一样，也是 ES6 为了操作对象而提供的新 API。Reflect对象的设计目的有这样几个。

&#8195;&#8195;1.	将Object对象的一些明显属于语言内部的方法（比如Object.defineProperty），放到Reflect对象上。

&#8195;&#8195;2.	修改某些Object方法的返回结果，让其变得更合理。

&#8195;&#8195;3.	让Object操作都变成函数行为。
```js
// 老写法
'assign' in Object // true
// 新写法
Reflect.has(Object, 'assign') // true
```       
&#8195;&#8195;4.	Reflect对象的方法与Proxy对象的方法一一对应，只要是Proxy对象的方法，就能在Reflect对象上找到对应的方法。

&#8195;&#8195;5.	Reflect对象的静态方法有13个，跟Proxy的静态方法时一一对应的。

&#8195;&#8195;1）Reflect.get（target, name, receiver）：查找并返回target对象的name属性，如果没有该属性，则返回undefined。
```js
var myObject = {
    foo: 1,
    bar: 2,
    get baz() {
    return this.foo + this.bar;
    },
}
console.log(Reflect.get(myObject, 'foo') )// 1
console.log(Reflect.get(myObject, 'baz') )// 3
var myReceiverObject = {
    foo: 4,
    bar: 4,
};
console.log((Reflect.get(myObject, 'baz', myReceiverObject)) // 8
```       
&#8195;&#8195;如果name属性部署了读取函数（getter），则读取函数的this绑定receiver。

&#8195;&#8195;2）Reflect.set(target, name, value, receiver): Reflect.set方法设置target对象的name属性等于value。如果name属性设置了赋值函数，则赋值函数的this绑定receiver。如果第一个参数不是对象，Reflect.set会报错。
```js        
var myObject = {
	foo: 1,
	set bar(value) {
	return this.foo = value;
	},
}

myObject.foo // 1

Reflect.set(myObject, 'foo', 2);
myObject.foo // 2

Reflect.set(myObject, 'bar', 3)
myObject.foo // 3
```
&#8195;&#8195;3）Reflect.has(obj,name):对应name in obj里面的in运算符。如果第一个参数不是对象，Reflect.has和in运算符都会报错。
```js        
var myObject = {
	foo: 1,
};
// 旧写法
'foo' in myObject // true
// 新写法
Reflect.has(myObject, 'foo') // true
```

&#8195;&#8195;实例：利用proxy实现观察者模式
```js
const queuedObservers = new Set();//观察者队列
const observe = fn => queuedObservers.add(fn);//添加观察者
const observable = obj => new Proxy(obj, {set});//添加代理
function set(target, key, value, receiver) {
	const result = Reflect.set(target, key, value, receiver);
	queuedObservers.forEach(observer => observer());
	return result;
}
//观察目标
const person = observable({
	name: '张三',
	age: 20
});
//观察者
function print() {
	console.log(`${person.name}, ${person.age}`)
}
observe(print);
person.name = '李四';
```