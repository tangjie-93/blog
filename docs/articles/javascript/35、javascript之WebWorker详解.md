---
title: 36、javascript之WebWorker详解
date: '2020-03-23'
type: 技术
tags: javascript
note: 我们知道js的最大特点就是单线程，就是同一时间只能做一件事。即便HTML5提出Web Worker允许JavaScript脚本创建多个线程，但是子线程完全受主线程控制，且不得操作DOM。下面就来详细了解一下这个新API的用途。
---
## 1、概述
&#8195;&#8195;`Web Worker`的作用，为 `javascript`创建了多线程环境，在主线程创建 `worker`线程，将一些计算量大的任务分配给后者运行。  
&#8195;&#8195;`worker` 线程在后台运行，跟主线程互不干扰。等到 `worker`线程完成计算任务，再把结果返回给主线程。  
&#8195;&#8195;`Worker` 线程一旦新建成功，就会始终运行，不会被主线程上的活动（比如用户点击按钮、提交表单）打断。这样有利于随时响应主线程的通信。一旦使用完毕，就应该关闭。

**`Web Worker`的一些限制：**
+ 同源限制  
&#8195;&#8195;分配给 `worker`运行的脚本必须和主线程同源。
+ `DOM` 限制    
&#8195;&#8195;`Worker` 线程所在的全局对象，无法读取主线程所在网页的 `DOM` 对象，也无法使用 `document、window、parent` 这些对象。但是，`Worker` 线程可以 `navigator` 对象和 `location` 对象。并且 `navigator` 被封装成了 `WorkerNavigator` 对象。并且 `location` 被封装成了 `Workerlocation` 对象。
+ 通信联系  
&#8195;&#8195;`Worker` 线程和主线程不在同一个上下文环境，它们不能直接通信，必须通过消息完成。在通讯过程中值过大也会影响性能。（可以通过 `transferable objects` 来解决值过大的问题）。

+ 脚本限制  
&#8195;&#8195;`Worker` 线程不能执行 `alert()` 方法和 `confirm()` 方法，但可以使用 `XMLHttpRequest` 对象发出 `AJAX` 请求。还可以使用 `setTimeout/setInterval`和 `Application Cache`。

+ 文件限制  
&#8195;&#8195;`Worker` 线程无法读取本地文件，即不能打开本机的文件系统 `（file://）`，它所加载的脚本，必须来自网络。

**`Web Worker` 的常用场景如下：**
+ 使用专用线程进行数学运算
+ 图像、影音等文件处理  
&#8195;&#8195;通过使用从`<canvas>`或者 `<video>` 元素中获取的数据，可以把图像分割成几个不同的区域并且把它们推送给并行的不同Workers来做计算
+ 大量数据的检索   
&#8195;&#8195;当需要在调用 `ajax`后处理大量的数据，如果处理这些数据所需的时间长短非常重要，可以在  `Web Worker` 中来做这些，避免冻结 `UI` 线程。当用户打字时后台在词典中进行查找，帮助用户自动纠错等等。
&#8195;&#8195;
## 2、基本用法
#### 2.1 主线程
> 1、创建 `worker` 子线程。          
```js
const worker=new Worker(jsUrl,options);
```
&#8195;&#8195;**注意：** 新建 `worker`子线程时会将 `worker` 子进程中的代码执行一遍。  
&#8195;&#8195;第一个参数是脚本的网址，必须是 `js`脚本。第二个参数是配置对象，是可选的，可以用它来指定 `worker` 的名称，用于区分多个 `worker` 线程。`Worker()`构造函数返回一个 `Worker` 线程实例对象，该线程对象主要有以下方法：
+ `worker.onerror`：指定 `error` 事件的监听函数。
+ `worker.onmessage`：指定 `message` 事件的监听函数，发送过来的数据在 `Event.data` 属性中。
+ `worker.postMessage()`：向 `Worker` 线程发送消息。
+ `worker.terminate()`：立即终止 `Worker` 线程。
```js
const worker=new Worker("./test.js");
```
> 2、 在主线程中向 `worker` 线程发送数据，可以是各种数据类型。

&#8195;&#8195;**注意：** 这种数据通信属于拷贝关系，是传值不是传址。实际上是先将数据 `JSON.stringify` 之后再 `JSON.parse`。所以不能传递不能被序列化的数据，比如函数、`dom` 元素。
```js
 worker.postMessage({ type: 'start', number: 20 });
 worker.postMessage("test");
```
> 3、在主线程中接收 `worker` 线程发送回来的数据。
```js
worker.onmessage = function (event) {
  console.log('Received message ' + event.data);
}
//或者
 worker.addEventListener("message", (event) => {
    console.log('Received message ' +event.data);
})
```
> 4、在 `worker` 线程完成任务后，要及时关闭该线程。
```js
worker.terminate();
```
&#8195;&#8195;以下是主线程中 `index.html` 的代码。
```html
<button id="start">开始工作</button>
<button id="stop">暂停工作</button>
```
```js
let worker = null;
function startWorker() {
    worker = new Worker("./test.js");
    //发送消息
    worker.postMessage({ type: 'start', number: 20 });
    worker.onmessage = function (event) {
        console.log(event.data);
    }
}
function stopWorker() {
    worker.postMessage({ type: 'stop', number: null })
    worker.terminate();
    worker = null;
}
document.querySelector("#start").onclick = startWorker
document.querySelector("#stop").onclick = stopWorker
```
#### 2.1 Worker子线程
&#8195;&#8195;`Web Worker` 有自己的全局对象，不是主线程的 `window`，而是一个专门为 `Worker` 定制的全局对象——`self`。因此定义在 `window` 上面的对象和方法**不是全部**都可以使用。`Worker` 线程有一些自己的全局属性和方法。
+ `self.name`： `Worker` 的名字。该属性只读，由构造函数指定。
+ `self.onmessage`：指定message事件的监听函数。
+ `self.onmessageerror`：指定 `messageerror` 事件的监听函数。发送的数据无法序列化成字符串时，会触发这个事件。
+ `self.close()`：关闭 `Worker` 线程。
+ `self.postMessage()`：向产生这个 `Worker` 的线程发送消息。
+ `self.importScripts()`：加载 `JS` 脚本。

> 1、监听创建该 `worker` 线程后的的 `worker` 实例对象发送过来的信息。
```js
self.addEventListener("message", (e) => {
    const data = e.data;
    const { type, number } = data;
    switch (type) {
        case "start":
            test(number);
            break;
        case "stop":
            postMessage("closeWorker");
            self.close();
    }
}, false)
//或者
self.onmessage = function (e) {
    ...
}
```
> 2、向创建该 `worker` 线程的的线程发送消息。

&#8195;&#8195;**注意：** 传递的数据是对数据的拷贝，是传值不是传址。实际上是先将数据数据转化为字符串，然后才发给 `worker`, 然后 `worker` 再将它还原。
```js
self.postMessage("closeWorker");
```
> 3、关闭该 `worker` 线程。
```js
self.close();
```
> 4、`worker` 内部加载其他 `js` 脚本。同步运行代码。其作用是将整个 `js` 文件引入到当前文件中。
```js
importScripts('script1.js', 'script2.js');
```
> 5、错误处理。主线程可以监听 `worker` 线程是否发生错误。有错误的话会触发主线程的 `error` 事件。
```js
worker.onerror=(e)=>{
    console.log(e);
}
//或者
worker.addEventListener("error", (e) => {
    console.log(e);
}, false)
```
&#8195;&#8195;下面是 `test.js` 文件里的代码。
```js
function test (n) {
    for (let i = 0; i < n; i++) {
        postMessage(i)
    }
}
self.addEventListener("message", (e) => {
    const data = e.data;
    const { type, number } = data;
    switch (type) {
        case "start":
            test(number);
            break;
        case "stop":
            postMessage("closeWorker");
            self.close();
    }
}, false)
```
## 3、同页面的 `Web Worker`

&#8195;&#8195;通过 `script` 标签向主线程网页嵌入一段代码，但是 `script`上的 `type`属性必须是一个浏览器不认识的值。
```js
//主线程
var blob = new Blob([document.querySelector('#worker').textContent]);
var url = window.URL.createObjectURL(blob);
var worker = new Worker(url);
worker.postMessage("test");
worker.onmessage = function (e) {
  console.log(e.data)
};
//嵌入主线程里的子线程
<script id="worker" type="app/worker">
addEventListener('message', function () {
    console.log(e.data);
    postMessage('some message');
}, false);
</script>
```
## 4、在 `worker` 中新建 `worker`
&#8195;&#8195;主线程代码如下
```html
<div id="result"></div>
```
```js
const worker = new Worker('./index.js');
worker.onmessage = function (event) {
  document.querySelector('#result').textContent = event.data;
};
``` 
&#8195;&#8195;`worker` 线程 `index.js` 代码如下:
```js
var worker = new Worker('./core.js');
//给子线程发送数据
worker.postMessage(100);
worker.postMessage(200);
//监听子线程发送过来的数据
worker.onmessage = storeResult;
// handle the results
function storeResult (event) {
    const result = event.data;

    postMessage(result); // finished!
}
```
&#8195;&#8195;`worker` 线程 `index.js` 中新建的 `worker`线程 `core.js` 代码如下:
```js
let start;
onmessage = getStart;
function getStart (event) {
    start = event.data;
    onmessage = getEnd;
}

let end;
function getEnd (event) {
    end = event.data;
    onmessage = null;
    work();
}
function work () {
    let result = 0;
    for (let i = start; i < end; i += 1) {
        // perform some complex calculation here
        result += 1;
    }
    postMessage(result);
    close();
}
```
**参考文献**

[Web Worker 使用教程](http://www.ruanyifeng.com/blog/2018/07/web-worker.html)   
[聊聊webWorker](https://segmentfault.com/a/1190000009313491)    
[前端er来学习一下webWorker吧](https://juejin.im/post/5bf8fa045188252f170e0dcb)