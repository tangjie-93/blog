---
title: async函数详解
date: '2020-03-16'
type: 技术
tags: es6
note: async函数详解
---

&#8195;&#8195;**async函数是Generator 函数的语法糖。async函数就是将 Generator 函数的星号（*）替换成async，将yield替换成await**，仅此而已。
`async`函数对 `Generator` 函数的改进，体现在以下四点。

>1)	**内置执行器。**
调用了asyncReadFile函数，然后它就会自动执行，输出最后结果。也就是说，async函数的执行，与普通函数一模一样，只要一行。
>2)	**更好的语义。**
async表示函数里有异步操作，await表示紧跟在后面的表达式需要等待结果。
>3)	**更广的适用性。**
await命令后面，可以是 Promise 对象和原始类型的值（数值、字符串和布尔值，但这时会自动转成立即 resolved 的 Promise 对象）。
>4)	**返回值是 Promise。**
async函数的返回值是 Promise 对象，进一步说，**async函数完全可以看作多个异步操作，包装成的一个 Promise 对象，而await命令就是内部then命令的语法糖**。

#### 1、Async的语法

>1、async函数返回一个 Promise 对象。

&#8195;&#8195;async函数内部return语句返回的值，会成为then方法回调函数的参数。async函数内部抛出错误，会导致返回的 Promise 对象变为reject状态。抛出的错误对象会被catch方法回调函数接收到。
```js
async function f() {
    return 'hello world';
}
f().then(v => console.log(v))
// "hello world"
async function f() {
    throw new Error('出错了');
}
f().then(
    v => console.log(v),
    e => console.log(e)
)
```
>2、Promise对象的状态变化。 

&#8195;&#8195;`async`函数返回的 `Promise` 对象，必须等到内部所有`await`命令后面的 `Promise` 对象执行完，才会发生状态改变，除非遇到`return`语句或者抛出错误。也就是说，只有`async`函数内部的异步操作执行完，才会执行`then`方法指定的回调函数。

#### 2、Await命令

&#8195;&#8195;正常情况下，`await`命令后面是一个 `Promise` 对象，返回该对象的结果。如果不是 `Promise` 对象，就直接返回对应的值。
```js
async function f() {
    // 等同于
    // return 123;
    return await 123;
}
f().then(v => console.log(v))
// 123
```       
&#8195;&#8195;另一种情况是，await命令后面是一个thenable对象（即定义then方法的对象），那么await会将其等同于 Promise 对象。

#### 3、错误处理

&#8195;&#8195;如果await后面的异步操作出错，那么等同于async函数返回的 Promise 对象被reject。
```js
async function f() {
    await new Promise(function (resolve, reject) {
        throw new Error('出错了');
    });
}
f()
.then(v => console.log(v))
.catch(e => console.log(e))
// Error：出错了
```
#### 4、使用注意点

&#8195;&#8195;1)	await命令后面的Promise对象，运行结果可能是rejected，所以最好把await命令放在try...catch代码块中。	
```js
async function myFunction() {
    try {
        await somethingThatReturnsAPromise();
    } catch (err) {
        console.log(err);
    }
}
// 另一种写法
async function myFunction() {
    await somethingThatReturnsAPromise()
    .catch(function (err) {
        console.log(err);
    });
}
```
&#8195;&#8195;2)	多个await命令后面的异步操作，如果不存在继发关系，最好让它们同时触发。
```js
// 写法一
let [foo, bar] = await Promise.all([getFoo(), getBar()]);
// 写法二
let fooPromise = getFoo();
let barPromise = getBar();
let foo = await fooPromise;//直接返回
let bar = await barPromise;
```
&#8195;&#8195;3)	await命令只能用在async函数之中，如果用在普通函数，就会报错。
```js
async function dbFuc(db) {
    let docs = [{}, {}, {}];
    // 报错
    docs.forEach(function (doc) {
        await db.post(doc);
    });
}
```
&#8195;&#8195;如果确实希望多个请求并发执行，可以使用Promise.all方法。
```js
async function dbFuc(db) {
    let docs = [{}, {}, {}];
    let promises = docs.map((doc) => db.post(doc));
    let results = await Promise.all(promises);
    console.log(results);
}
```
&#8195;&#8195;4)	async 函数可以保留运行堆栈。
```js
const a = () => {
    b().then(() => c());
};
```        
&#8195;&#8195;当b()运行的时候，函数a()不会中断，而是继续执行。等到b()运行结束，可能a()早就运行结束了，b()所在的上下文环境已经消失了。如果b()或c()报错，错误堆栈将不包括a()。
```js
const a = async () => {
    await b();
    c();
};
```       
&#8195;&#8195;b()运行的时候，a()是暂停执行，上下文环境都保存着。一旦b()或c()报错，错误堆栈将包括a()。

#### 5、实例：按顺序完成异步操作

```js
async function logInOrder(urls) {
    for (const url of urls) {
        const response = await fetch(url);
        console.log(await response.text());
    }
}
```
&#8195;&#8195;上面代码的问题是所有远程操作都是继发。只有前一个 URL 返回结果，才会去读取下一个 URL，这样做效率很差，非常浪费时间。
```js
async function logInOrder(urls) {
    // 并发读取远程URL
    const textPromises = urls.map(async url => {
        const response = await fetch(url);
        return response.text();
    });
    // 按次序输出
    for (const textPromise of textPromises) {
        console.log(await textPromise);
    }
}
```
&#8195;&#8195;**虽然map方法的参数是async函数，但它是并发执行的，因为只有async函数内部是继发执行，外部不受影响。**

#### 6、异步遍历器

&#8195;&#8195;异步遍历器的最大的语法特点，就是调用遍历器的next方法，返回的是一个 Promise 对象。
```js
asyncIterator
    .next()
    .then(
    ({ value, done }) => /* ... */
    );
```
#### 7、异步 Generator 函数

&#8195;&#8195;语法上，异步 Generator 函数就是async函数与 Generator 函数的结合。
```js
async function* gen() {
    yield 'hello';
}
const genObj = gen();
genObj.next().then(x => console.log(x));
// { value: 'hello', done: false }
```       
&#8195;异步 `Generator` 函数内部，能够同时使用`await`和`yield`命令。可以这样理解，`await`命令用于将外部操作产生的值输入函数内部，`yield`命令用于将函数内部的值输出。

`async await`的源码实现
```js
const fun=x=>{
    return new Promise((resolve)=>{
        setTimeout(()=>{
            resolve(++x);
        },1000)
    })
}
functio
const generator=gen=>{
    const iterator=gen();
    function next(x){
        const {
            value,
            done
        }=iterator.next(x);
        if(done) return value;
        value.then(res=>{
            next(res)
        })
    }
    next();
}
```
