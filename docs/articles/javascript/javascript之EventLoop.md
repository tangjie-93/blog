---
title: javascript之EventLoop
date: '2020-01-14'
type: 技术
tags: javascript
note: 我们知道js的最大特点就是单线程，就是同一时间只能做一件事。即便HTML5提出Web Worker允许JavaScript脚本创建多个线程，但是子线程完全受主线程控制，且不得操作DOM。所以，这个新标准并没有改变JavaScript单线程的本质。
---

**到底是将异步任务直接放到任务队列，还是将异步任务的回调放到任务队列?**<br>
​		
​&#8195;&#8195;我们知道 `js` 的最大特点就是单线程，就是同一时间只能做一件事。即便`HTML5` 提出 `Web Worker` 允许 `JavaScript` 脚本创建多个线程，但是子线程完全受主线程控制，且不得操作 `DOM`。所以，这个新标准并没有改变`JavaScript`单线程的本质。
`js` 单线程跟它的用途有关。作为浏览器脚本语言，`javascript` 的主要用途是与用户互动，以及操作 `dom`。这决定了它只能是单线程。比如：`javascript`同时有两个线程，一个线程在 `dom` 上触发事件，另一个线程删除了这个  `dom` 元素，这时候会引发混乱。

js中常见的异步操作有以下：
+ setTimeout/setInterval
+ 事件绑定/事件监听
+ ajax/fetch请求数据
+ Promise的异步操作
+ async/await的异步操作
+ nodejs中的异步操作()
+ ....

<h3>1、任务队列(EventQueue)</h3>

&#8195;&#8195;因为 `js` 的单线程的特性，所有运行在js线程中的代码需要根据某种规则来按队列执行。因为 `js` 中既有同步事件，又有异步事件，所以有时候我们在工作中写 `js` 代码时总会一脸懵逼，特别是在浏览器环境中进行断点调试时，所以弄懂js代码的执行顺序非常重要。                

&#8195;&#8195; 按照 `js` 回调事件的特性，将任务分为**同步任务**和**异步任务**。在js代码执行时，浏览器回分配一个任务队列 `EventQueue`,包括宏任务队列和微任务队列。,
+ 1、所有同步任务都在**主线程**中执行，并形成一个执行栈，异步任务在有了运行结果之后才会将**回调函数**添加到**任务队列**中。
+ 2、代码运行时会先去执行主线程中的代码，等到主线程中的代码执行完毕后，才会去读取任务队列中的回调函数并放置到执行栈上来执行。
+ 3、主线程中会不断重复执行第二步，从**任务队列**中读取事件，这个过程是循环不断的，所以整个的这个运行机制又被称为 `EventLoop`。

<h3>2、任务队列的分类</h3>

&#8195;&#8195;任务队列按照某种条件又可以细分为 `microtask` 和 `macrotask`，通常我们会称之为微任务和宏任务。**代码执行的优先级为：微任务>宏任务。**
+ 微任务主要有：`ES6` 的`Promise`(then函数),`async/await`，`node.js`中的 `process.nextTick()`，`MessageChannel`(消息通道，类似`worker`)，`MutationObserver` (html5新特性)
+ 宏任务主要有：`setTimeout` 和 `setInterval`、`requestAnimationFrame`，`setImmediate`, `I/O`,事件绑定，`http`请求。

**&#8195;&#8195;js中代码执行的顺序是：首先执行主线程中的代码，等到主线程的同步代码执行完毕后，从微任务队列中逐个取出微任务到主线程执行，等到微任务队列被清空，然后再从宏任务队列中逐个取出宏任务到主线程中执行过，直到宏任务队列被清空。**

 详情请看如下代码
> 例子1 
```js
//20秒后放到任务队列
setTimeout(() => {
    console.log(1);
}, 20)
//10秒后放到任务队列
setTimeout(() => {
    console.log(2);
    setTimeout(() => {
        console.log(3);
    }, 50);
}, 10)
console.time();
for (let index = 0; index < 100000000; index++) {

}
//两秒后放到任务队列
setTimeout(() => {
    console.log(4);
}, 2)
console.timeEnd();
console.log(5)
//50秒后放到任务队列
setTimeout(() => {
    console.log(6)
}, 50);
```
上面代码的执行过结果是：5 2 1 4 6 3。根据被放到宏任务队列的先后时间去执行异步任务。
> 例子2
```javascript     
//宏任务
setTimeout(function(){
    console.log("我是宏任务1");
})
let p=new Promise((resolve,reject)=>{
    console.log("promise1");
    resolve();
});
//微任务
p.then(res=>{
    console.log("我是微任务1")
});
let p2=new Promise((resolve,reject)=>{
    console.log("promise2");
    resolve();
});
//微任务
p2.then(res=>{
    console.log("我是微任务2")
});
//宏任务
setTimeout(function(){
    console.log("我是宏任务2");
})
console.log("我是主线程");
//输出顺序 promise1、promise2、我是主线程、我是微任务1、我是微任务2、我是宏任务1、我是宏任务2
```
执行结果如下所示：

![](https://user-gold-cdn.xitu.io/2019/6/26/16b948067bc23463?w=1076&h=224&f=png&s=29667)

&#8195;&#8195;代码解析：
+ 1、js代码开始执行后，遇到 `setTimeout`，将其回调函数添加到宏任务队列中，记为setTimeout1；
+ 2、遇到 `Promise`，`Promise` 构造函数中的代码是同步任务，所以最先输出 `promise1`,同时将 `then` 函数添加到微任务队列中，记为 `then1`；
+ 3、接着再次遇到 `Promise`，然后输出 `promise2`，并将其 `then` 函数添加在微任务队列中，记为 `then2`。
+ 4、执行到 `setTimeout` ，将其回调函数添加到宏任务队列中，记为 `setTimeout2`。
+ 5、最后输出"我是主线程"。此时主线程中的代码执行完毕。此时任务队列中的情况如下。
<table style="width:100%;text-align:center">
    <thead style="width:100%;text-align:center">
        <tr>
            <th>宏任务</th>
            <th>微任务</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>setTimeout1	</td>
            <td>then1	</td>
        </tr>
        <tr>
            <td>setTimeout2	</td>
            <td>then2	</td>
        </tr>
    </tbody>
</table>

+ 6、接着开始执行微任务队列中的所有任务，输出"我是微任务1","我是微任务2",此时第一轮事件事件循环结束。
+ 7、随着setTimeout1回调事件的执行，意味着第二轮事件循环的开始，接着输出"我是宏任务1"，它的结束意味着第二轮事件循环的结束。
+ 8、随着setTimeout2回调事件的执行，意味着第三轮事件循环的开始，它的结束就意味着第三轮事件循环的结束。
+ 9、开始第二次循环，执行第一个宏任务中的代码，并输出"我是宏任务1"，接着输出"我是宏任务2"。
所以我的理解其实就是宏任务队列中有几个宏任务，就意味着在此次js代码执行过程中有几次事件循环。

接下来再看下面的一个特殊的例子：
```js
setTimeout(() => {
	console.log(2)
}, 2)

setTimeout(() => {
	console.log(1)
}, 1)

setTimeout(() => {
	console.log(0)
}, 0)
//输出结果是1、0、2
```
**结果分析：延迟时间1毫秒的比延迟时间0毫秒的先执行，大于1毫秒的按延迟时间大小先后顺序执行。**

例子
```js
let document=document.body;
//宏任务1
body.addEventListener("click",()=>{
    Promise.resolve().then(()=>{
        console.log(1)
    })
    console.log(2)
})
//宏任务2
body.addEventListener("click",()=>{
    Promise.resolve().then(()=>{
        console.log(3)
    })
    console.log(4)
})
//输出顺序 2 1 4 3
```


<h3>3、浏览器环境中和node环境中EventLoop的异同</h3>
&#8195;&#8195;示例代码如下所示；

```javascript     
//宏任务，第二次事件循环的开始
setTimeout(function() {
    console.log('setTimeout1');
    new Promise(function(resolve) {
        console.log('setTimeout1-Promise');
        resolve();
        //微任务
    }).then(function() {
        console.log('setTimeout1-then')
    })
})
new Promise(function(resolve) {
    console.log('Promise1');
    resolve();
    //微任务
}).then(function() {
    console.log('then1')
})
//宏任务，第三次事件循环的开始
setTimeout(function() {
    console.log('setTimeout2');
    new Promise(function(resolve) {
        console.log('setTimeout2-promise');
        resolve();
    }).then(function() {
        console.log('setTimeout2-then')
    })
})
```
<h4>1、浏览器中js事件循环机制</h4>
&#8195;&#8195;上面代码在浏览器环境中的输出结果如下所示：

![](https://user-gold-cdn.xitu.io/2019/6/27/16b994527d4ba908?w=1080&h=241&f=png&s=26891)

所以我得出结论：**在浏览器环境下js代码的执行顺序是。主线程>微任务队列中所有的回调函数>宏任务队列中的所有宏任务。主线程和微任务成为第一次事件循环。宏任务队列中的一个宏任务就是一个事件循环。**

<h4>2、node环境中js事件循环机制</h4>
&#8195;&#8195;个人觉得node中的js执行机制比在浏览器中的要复杂一些。盗用掘金网友的一张图很好的解释了node环境中的事件循环机制。

<img src="../../images/node-eventloop.jpg" alt="暂无图片">

&#8195;&#8195;node环境中的eventLoop是按阶段来执行的，主要有6个阶段，这个阶段里的代码执行完毕，才会去执行下一个阶段里的代码。**6个阶段中的代码都执行完毕才算是完成一个事件循环。**
+ 原生的libuv事件循环中的队列主要有4种类型：    
&#8195; &#8195;1、expired timers and intervals，即到期的setTimeout/setInterval   
&#8195; &#8195;2、I/O events，包含文件，网络等等    
&#8195; &#8195;3、immediates，通过setImmediate注册的函数    
&#8195; &#8195;4、close handlers，close事件的回调，比如TCP连接断开
+ 同步任务及每个阶段之后都会清空microTask队列  
&#8195; &#8195;1、优先清空nextTick  queue，即通过process.nextTick注册的函数     
&#8195; &#8195;2、再清空other queue，常见的如Promise
+ 而和浏览器规范的区别，在于node会清空当前所处阶段的队列，即执行所有macroTask

**&#8195;&#8195;而在node环境中的输出结果是这样的，两次执行结果还不一样**
&#8195;&#8195;上面的代码在node环境中的执行结果如下所示。
<img src="../../images/node-eventloop-example.png" alt="暂无数据">

结果分析：
+ 首先执行主线程中的同步代码，输出 `promise1`。
+ 接着清空微队列中的任务，即执行外层 `then` 函数中的代码，输出 `then1` （**微任务不在任何一个阶段执行，在各个阶段切换的中间执行**）。
+ 接着开始执行 `timer` 阶段中的所有任务，所以此时输出`setTimeOut1——>setTimeOut1-Promise——>setTimeOut2——>setTimeOut2-Promise`。
+ `timer` 阶段中的任务执行完毕后，又开始执行微任务队列中的所有任务。所以此时输出`setTimeOut1-then、setTimeOut1-then2`。

**最后：** `node`中的 `eventLoop`运行机制比较复杂，所以还需要花费更多的时间去多多研究。

参考文档    
[1、这一次，彻底弄懂 JavaScript 执行机制](https://juejin.im/post/59e85eebf265da430d571f89)  
[2、JavaScript 运行机制详解：再谈Event Loop](http://www.ruanyifeng.com/blog/2014/10/event-loop.html)   
[3、Eventloop不可怕，可怕的是遇上Promise](https://juejin.im/post/5c9a43175188252d876e5903)    
[4、浏览器说：虽然都叫event loop，但是我和node不一样](https://juejin.im/post/5b0ab722f265da0dbd7a646f)

<!-- <Valine></Valine> -->