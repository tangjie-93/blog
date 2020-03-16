---
title: Set和Map用法总结
date: '2020-03-15'
type: 技术
tags: es6
note: Set和Map用法总结
---
<h3 id="a11">1、Set</h3>

<h4>&#8195;1.1、	Set</h4>

&#8195;&#8195;一种数据结构，类似于数组，**但是成员的值都是唯一的**，没有重复的值。
```js
const s = new Set();
[2, 3, 5, 4, 5, 2, 2].forEach(x => s.add(x));
for (let i of s) {
	console.log(i);
}
// 2 3 5 4
```
&#8195;&#8195;`Set`函数可以接受一个数组（或者具有 `iterable` 接口的其他数据结构）作为参数，用来初始化。
```js
// 例一
const set = new Set([1, 2, 3, 4, 4]);
console.log([...set]);
// [1, 2, 3, 4]
let arr = [3, 5, 2, 2, 5, 5];
let unique = [...new Set(arr)];
// [3, 5, 2]
// 例二
const items = new Set([1, 2, 3, 4, 5, 5, 5, 5]);
items.size // 5
// 例三
const set = new Set(document.querySelectorAll('div'));
set.size // 56
```            
**注意：** `向 Set 加入值的时候，不会发生类型转换`，所以5和"5"是两个不同的值。在 Set 内部，两个NaN是相等的。

<h4>&#8195;1.2、	Set实例的属性和方法</h4>

&#8195;&#8195;**实例属性：**

>1、Set.prototype.constructor：构造函数，默认就是Set函数。  
>2、Set.prototype.size：返回Set实例的成员总数。

&#8195;&#8195;**操作方法：**
>1、add(value)：添加某个值，返回 Set 结构本身。     
>2、delete(value)：删除某个值，返回一个布尔值，表示删除是否成功。   
>3、has(value)：返回一个布尔值，表示该值是否为Set的成员。   
>4、clear()：清除所有成员，没有返回值。    

&#8195;&#8195;**`Array.from`方法可以将 `Set` 结构转为数组。**
```js
const items = new Set([1, 2, 3, 4, 5]);
//方法1
const array = Array.from(items);
//方法2
const arr=[…items]
//或者直接
const arr=[...new Set([1, 2, 3, 4, 5])]
```        
&#8195;&#8195;`Set`可以用于去重
```js       
[...new Set('ababbc')].join('')  //abc 
```     
&#8195;&#8195;**遍历方法：**

>1、keys()：返回键名的遍历器。  
>2、values()：返回键值的遍历器。    
>3、entries()：返回键值对的遍历器。     
>4、forEach()：使用回调函数遍历每个成员。

&#8195;&#8195;由于 `Set` 结构没有键名，只有键值（或者说键名和键值是同一个值），所以`keys`方法和`values`方法的行为完全一致。   
&#8195;&#8195;`Set` 结构的实例默认可遍历，它的默认遍历器生成函数就是它的`values`方法。  
&#8195;&#8195;**这意味着，可以省略values方法，直接用for...of循环遍历 Set。**
```js
Set.prototype[Symbol.iterator] === Set.prototype.values
// true
```

```js
let set = new Set(['red', 'green', 'blue']);
for (let x of set) {
	console.log(x);
}
// red  // green  // blue
```       
&#8195;&#8195;数组的map和filter方法也可以间接用于 Set 了。
```js
let set = new Set([1, 2, 3]);
set = new Set([...set].map(x => x * 2));
// 返回Set结构：{2, 4, 6}
let set = new Set([1, 2, 3, 4, 5]);
set = new Set([...set].filter(x => (x % 2) == 0));
// 返回Set结构：{2, 4}
```
<h4>&#8195;1.3、	WeakSet</h4>

&#8195;&#8195;WeakSet 结构与 Set 类似，但是，它与 Set 有两个区别。
>首先：**WeakSet 的成员只能是对象**，而不能是其他类型的值。
```js
const ws = new WeakSet();
ws.add(1)
// TypeError: Invalid value used in weak set
ws.add(Symbol())
// TypeError: invalid value used in weak set
```       
>其次：`WeakSet` 中的对象都是弱引用，**垃圾回收机制不考虑 ` WeakSet `对该对象的引用，也就是说，如果其他对象都不再引用该对象，那么垃圾回收机制会自动回收该对象所占用的内存，不考虑该对象还存在于 `WeakSet` 之中。** 因此，`WeakSet` 适合临时存放一组对象。由于上面这个特点，`WeakSet` 的成员是不适合引用的，因为它会随时消失。`WeakSet` 不可遍历。  

>作为构造函数，**WeakSet 可以接受一个数组或类似数组的对象作为参数。注意，是数组的成员成为 WeakSet 的成员，而不是数组本身。这意味着，数组的成员只能是对象。**
```js
const a = [[1, 2], [3, 4]];
const ws = new WeakSet(a);
// WeakSet {[1, 2], [3, 4]}
const b = [3, 4];
const ws = new WeakSet(b);
// Uncaught TypeError: Invalid value used in weak set(…)
```        
&#8195;&#8195;有以下几个实例方法：`add()、delete()、has()`。

<h3 id="a12">2、Map</h3>

<h4>&#8195;2.1、Map</h4>

&#8195;&#8195;JavaScript 的对象（Object），本质上是键值对的集合（Hash 结构），但是传统上只能用字符串当作键。

&#8195;&#8195;**Map：** **一种数据结构，类似于对象，也是键值对的集合，但是“键”的范围不限于字符串，各种类型的值（包括对象）都可以当作键。**

&#8195;&#8195;作为构造函数，`Map` 也可以接受一个数组作为参数。该数组的成员是一个表示键值对的数组。**任何具有 `Iterator` 接口、且每个成员都是一个双元素的数组的数据结构都可以当作`Map`构造函数的参数。这就是说，`Set和Map`都可以用来生成新的 `Map`。**
```js
const map = new Map([
	['name', '张三'],
	['title', 'Author']
]);
map.size // 2
map.has('name') // true
map.get('name') // "张三"
map.has('title') // true
map.get('title') // "Author"
```       
&#8195;&#8195;Map构造函数接受数组作为参数，实际上执行的是下面的算法。
```js
const items = [
	['name', '张三'],
	['title', 'Author']
];
const map = new Map();
items.forEach(
	([key, value]) => map.set(key, value)
);
```
&#8195;&#8195;如果对同一个键多次赋值，后面的值将覆盖前面的值。只有对同一个对象的引用，Map 结构才将其视为同一个键
```js
const map = new Map();
map.set(1, 'aaa').set(1, 'bbb');
map.get(1) // "bbb"

const map = new Map();
map.set(['a'], 555);
map.get(['a']) // undefined //这两个[“a”]的内存地址不一样
```       
&#8195;&#8195;**注意：** 虽然NaN不严格相等于自身，但 Map 将其视为同一个键。

<h4>&#8195;2.2、实例的属性和操作方法：</h4>

&#8195;&#8195;size、set()、get()、has()、delete()、clear()

<h4>&#8195;12.3、遍历方法</h4>

>1、keys()：返回键名的遍历器。  
>2、values()：返回键值的遍历器。    
>3、entries()：返回所有成员的遍历器。   
>4、forEach()：遍历 Map 的所有成员。

&#8195;&#8195;Map 结构转为数组结构，比较快速的方法是使用扩展运算符（...）。
```js
const map = new Map([
	[1, 'one'],
	[2, 'two'],
	[3, 'three'],
]);
[...map.keys()]   // [1, 2, 3]
[...map.values()]   // ['one', 'two', 'three']
[...map.entries()]   // [[1,'one'], [2, 'two'], [3, 'three']]
[...map]   // [[1,'one'], [2, 'two'], [3, 'three']]
```       
&#8195;&#8195;结合数组的`map`方法、`filter`方法，可以实现 `Map` 的遍历和过滤。
```js
const map0 = new Map().set(1, 'a').set(2, 'b').set(3, 'c')
const map1 = new Map(
	[...map0].filter(([k, v]) => k < 3)
);
// 产生 Map 结构 {1 => 'a', 2 => 'b'}
const map2 = new Map([...map0].map(([k, v]) => [k * 2, '_' + v]));
// 产生 Map 结构 {2 => '_a', 4 => '_b', 6 => '_c'}
 ```       
<h4>&#8195;2.4、与其他数据结构的互相转换：</h4>

&#8195;&#8195;1、	Map与数组的转换：

&#8195;&#8195;`Map`转数组
```js
const myMap = new Map().set(true, 7).set({foo: 3}, ['abc']);
[...myMap] //Map转数组
// [ [ true, 7 ], [ { foo: 3 }, [ 'abc' ] ] ]
```        
&#8195;&#8195;数组转`Map`
```js
new Map([
	[true, 7],
	[{foo: 3}, ['abc']]
])
// Map {
//   true => 7,
//   Object {foo: 3} => ['abc']
// }
```
&#8195;&#8195;2、	`Map`与对象的转换

&#8195;&#8195;`Map`转对象
```js
function strMapToObj(strMap) {
    let obj = Object.create(null);
    for (let [k,v] of strMap) {
    obj[k] = v;
    }
    return obj;
}
const myMap = new Map().set('yes', true).set('no', false);
strMapToObj(myMap)   // { yes: true, no: false }
```        
&#8195;&#8195;对象转Map
```js
function objToStrMap(obj) {
    let strMap = new Map();
    for (let k of Object.keys(obj)) {
    strMap.set(k, obj[k]);
    }
    return strMap;
}
objToStrMap({yes: true, no: false})   // Map {"yes" => true, "no" => false}
```       
&#8195;&#8195;3、	`Map`与`Json`的转换
	Map 的键名都是字符串，这时可以选择转为对象 JSON。
```js		
function strMapToJson(strMap) {
    return JSON.stringify(strMapToObj(strMap));
}
let myMap = new Map().set('yes', true).set('no', false);
strMapToJson(myMap)
// '{"yes":true,"no":false}'
```
&#8195;&#8195;`Map` 的键名有非字符串，这时可以选择转为数组 `JSON`。
```js
function mapToArrayJson(map) {
    return JSON.stringify([...map]);
}
let myMap = new Map().set(true, 7).set({foo: 3}, ['abc']);
mapToArrayJson(myMap)
// '[[true,7],[{"foo":3},["abc"]]]'
```       
&#8195;&#8195;`Json`转`Map`，所有键名都是字符串。
```js
function jsonToStrMap(jsonStr) {
    return objToStrMap(JSON.parse(jsonStr));
}
jsonToStrMap('{"yes": true, "no": false}')
// Map {'yes' => true, 'no' => false}
```
&#8195;&#8195;`Json` 转 `Map`，整个 `Json` 就是一个数组，且每个数组成员本身，又是一个有两个成员的数组。
```js
function jsonToMap(jsonStr) {
    return new Map(JSON.parse(jsonStr));
}
jsonToMap('[[true,7],[{"foo":3},["abc"]]]')
// Map {true => 7, Object {foo: 3} => ['abc']}
```
<h4>&#8195;2.5、WeakMap：</h4>	
&#8195;&#8195;WeakMap与Map的区别有两点。

>首先，WeakMap**只接受对象作为键名**（null除外），不接受其他类型的值作为键名。  

>其次，WeakMap的键名所指向的对象，不计入垃圾回收机制。
WeakMap的专用场合就是，它的键所对应的对象，可能会在将来消失。WeakMap结构有助于防止内存泄漏。

&#8195;&#8195;**注意** ，WeakMap 弱引用的只是键名，而不是键值。键值依然是正常引用。
```js
const wm = new WeakMap();
let key = {};
let obj = {foo: 1};
wm.set(key, obj);
obj = null;//解除引用，相当于切断联系，但是{foo：1}所占内存空间依然存在。
console.log(wm.get(key))
// Object {foo: 1}
```       
&#8195;&#8195;WeakMap 与 Map 在 API 上的区别主要是两个，**一是没有遍历操作（即没有keys()、values()和entries()方法），也没有size属性**。WeakMap只有四个方法可用：get()、set()、has()、delete()。

&#8195;&#8195;**weakMap的用途：**

&#8195;&#8195;1、	就是 DOM 节点作为键名
```js
let myElement = document.getElementById('logo');
let myWeakmap = new WeakMap();
myWeakmap.set(myElement, {timesClicked: 0});
myElement.addEventListener('click', function() {
    let logoData = myWeakmap.get(myElement);
    logoData.timesClicked++;
}, false);
```       
&#8195;&#8195;2、	部署私有属性
```js
const _counter = new WeakMap();
const _action = new WeakMap();
class Countdown {
    constructor(counter, action) {
    _counter.set(this, counter);
    _action.set(this, action);
    }
    dec() {
    let counter = _counter.get(this);
    if (counter < 1) {
        return;
    }
    _counter.set(this, --counter);
    if (counter === 0) {
        _action.get(this)();
    }
    }
}
const c = new Countdown(2, () => console.log('DONE'));
c.dec()
c.dec()
// DONE
```