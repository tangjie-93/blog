---
title: ES6语法的性能优化
date: '2020-03-15'
type: 技术
tags: es6
note: ES6语法的性能优化
---
>1、建议不再使用var命令，而是使用let命令取代。

>2、在let和const之间，建议优先使用const，尤其是在全局环境，不应该设置变量，只应设置常量。
原因：一个是const可以提醒阅读程序的人，这个变量不应该改变；另一个是const比较符合函数式编程思想，运算不改变值，只是新建值，而且这样也有利于将来的分布式运算；最后一个原因是 JavaScript 编译器会对const进行优化，所以多使用const，有利于提高程序的运行效率，也就是说let和const的本质区别，其实是编译器内部的处理不同。

>3、静态字符串一律使用单引号或反引号，不使用双引号。动态字符串使用反引号。
```js
// bad
const a = "foobar";
const b = 'foo' + a + 'bar';
// good
const a = 'foobar';
const b = `foo${a}bar`;
```       
>4、解构赋值
使用数组成员对变量赋值时，优先使用解构赋值。
```js
const arr = [1, 2, 3, 4];
// bad
const first = arr[0];
const second = arr[1];
// good
const [first, second] = arr;
```
&#8195;&#8195;函数的参数如果是对象的成员，优先使用解构赋值。
```js
// bad
function getFullName(user) {
    const firstName = user.firstName;
    const lastName = user.lastName;
}
// good
function getFullName(obj) {
    const { firstName, lastName } = obj;
}
// best
function getFullName({ firstName, lastName }) {
}
```
>5、**对象**

&#8195;&#8195;单行定义的对象，最后一个成员不以逗号结尾。多行定义的对象，最后一个成员以逗号结尾。
```js
// bad
const a = { k1: v1, k2: v2, };
const b = {
    k1: v1,
    k2: v2
};
// good
const a = { k1: v1, k2: v2 };
const b = {
    k1: v1,
    k2: v2,
};
```
&#8195;&#8195;对象尽量静态化，一旦定义，就不得随意添加新的属性。如果添加属性不可避免，要使用Object.assign方法。
```js
// bad
const a = {};
a.x = 3;
// if reshape unavoidable
const a = {};
Object.assign(a, { x: 3 });
// good
const a = { x: null };
a.x = 3;
```
>6、使用扩展运算符（...）拷贝数组。使用 Array.from 方法，将类似数组的对象转为数组。
```js
const itemsCopy = [...items];
const foo = document.querySelectorAll('.foo');
const nodes = Array.from(foo);
```   
>7、简单的、单行的、不会复用的函数，建议采用箭头函数。如果函数体较为复杂，行数较多，还是应该采用传统的函数写法。   

>8、不要在函数体内使用 arguments 变量，使用 rest 运算符（...）代替。
```js
// bad
function concatenateAll() {
    const args = Array.prototype.slice.call(arguments);
    return args.join('');
}
// good
function concatenateAll(...args) {
    return args.join('');
}
```
>9、使用默认值语法设置函数参数的默认值。
```js
// bad
function handleThings(opts) {
    opts = opts || {};
}
// good
function handleThings(opts = {}) {
    // ...
}
```
>10、注意区分 `Object` 和 `Map`，只有模拟现实世界的实体对象时，才使用 `Object`。如果只是需要`key: value`的数据结构，使用 Map 结构。因为 `Map` 有内建的遍历机制。

>11、总是用 `Class`，取代需要 `prototype` 的操作。因为 `Class` 的写法更简洁，更易于理解。
```js
// bad
function Queue(contents = []) {
    this._queue = [...contents];
}
Queue.prototype.pop = function() {
    const value = this._queue[0];
    this._queue.splice(0, 1);
    return value;
}
// good
class Queue {
    constructor(contents = []) {
        this._queue = [...contents];
    }
    pop() {
        const value = this._queue[0];
        this._queue.splice(0, 1);
        return value;
    }
}
```
>12、使用extends实现继承，因为这样更简单，不会有破坏instanceof运算的危险。

>13、如果模块只有一个输出值，就使用export default，如果模块有多个输出值，就不使用export default。export default与普通的export不要同时使用。

>14、不要在模块输入中使用通配符。因为这样可以确保你的模块之中，有一个默认输出（export default）。
```js
// bad
import * as myObject from './importModule';
// good
import myObject from './importModule';
```
>15、如果模块默认输出一个函数，函数名的首字母应该小写。如果模块默认输出一个对象，对象名的首字母应该大写。
```js
function makeStyleGuide() {}
export default makeStyleGuide;//函数
const StyleGuide = {
    es6: {
    }
};
export default StyleGuide;//对象
```