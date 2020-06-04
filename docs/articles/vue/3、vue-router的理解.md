---
title: vue-router的理解
date: '2020-03-13'
type: 技术
tags: vue
note: vue-router的理解
---

vue-router有三种路由模式，`hash、history、abstract`。
+ **hash:** 使用url hash值来作为路由。支持所有浏览器。
+ **history：** 依赖 `HTML5` 的 `History API` 和服务器配置。
+ **abstract：** 支持所有 `JavaScript` 运行环境，如 `node` 服务器环境，如果发现没有浏览器的`API`,路由会自动强制进入这个模式。 

## 1、hash路由

主要是通过监听`hashChange`事件来执行相应的回调的。通过改变`location.hash`来切换路由。`location.hash`的值就是`URL`中`#`后面的内容。    
hash路由模式的实现主要是基于下面几个特性:
+ `URL`中`hash`值只是客户端的一种状态，也就是说当向服务器端发出请求时，hash 部分不会被发送；
+ hash 值的改变，都会在浏览器的访问历史中增加一个记录。因此我们能通过浏览器的回退、前进按钮控制hash 的切换；
+ 可以通过 a 标签，并设置 href 属性，当用户点击这个标签后，URL 的 hash 值会发生改变；或者使用  `JavaScript` 来对 `loaction.hash` 进行赋值，改变 URL 的 hash 值；
+ 我们可以使用 `hashchange` 事件来监听 hash 值的变化，从而对页面进行跳转（渲染）。
**代码实现**
```js
class hashRouters {
    constructor () {
        this.routes = {};
        //当前路由
        this.currentUrl = '';
        // 记录出现过的hash
        this.history = [];
        // 作为指针,默认指向this.history的末尾,根据后退前进指向history中不同的hash
        this.currentIndex = this.history.length - 1;

        //防止调用refresh的时候this不为Routers的实例
        this.refresh = this.refresh.bind(this);
        this.backOff = this.backOff.bind(this);
        // 默认不是后退操作
        this.isBack = false;
        window.addEventListener('load', this.refresh, false);
        window.addEventListener('hashchange', this.refresh, false);
    }

    route (path, callback) {
        this.routes[path] = callback || function () { };
    }
    backOff () {
        // 默认不是后退操作
        this.isBack = true;
        // 如果指针小于0的话就不存在对应hash路由了,因此锁定指针为0即可
        this.currentIndex = this.currentIndex ? 0 : this.currentIndex - 1;
        location.hash = `#${this.history[this.currentIndex]}`;

        this.routes[this.history[this.currentIndex]]();

    }
    refresh () {
        this.currentUrl = location.hash.slice(1) || '/';
        if (!this.isBack) {
            // 如果不是后退操作,且当前指针小于数组总长度,直接截取指针之前的部分储存下来
            // 此操作来避免当点击后退按钮之后,再进行正常跳转,指针会停留在原地,而数组添加新hash路由
            // 避免再次造成指针的不匹配,我们直接截取指针之前的数组
            // 此操作同时与浏览器自带后退功能的行为保持一致
            this.history = this.history.slice(0, this.currentIndex + 1);
            this.history.push(this.currentUrl);
            this.currentIndex++;
        }
        this.routes[this.currentUrl]();
        this.isBack = false;
    }

}
```
## 2、`vue history` 路由的代码实现

`history` 实际采用了 `HTML5` 中提供的 `API` 来实现，主要有 `history.pushState()` 和`history.replaceState()` 。跟 `window.onpopstate` 配合使用。
+ `pushState(state,title,path)` ：将当前`URL`和`state`加入到历史记录中，并用新的`state`和`URL`替换当前。不会造成页面刷新。`pushState`是添加历史记录的
+ `replaceState(state,title,path)` ：用新的 `state` 和 `URL` 替换当前。不会造成页面刷新。`replaceState` 是不添加历史记录。  

**`history` 路由模式的实现主要基于存在下面几个特性：**
+ `pushState 和 repalceState` 两个 API 来操作实现 URL 的变化 ;
+ 可以使用 `popstate` 事件来监听 url 的变化，从而对页面进行跳转（渲染）;
+ `history.pushState()` 或 `history.replaceState()` 不会触发 `popstate` 事件，这时我们需要手动触发页面跳转（渲染）。

```js
class Routers {
    constructor() {
      this.routes = {};
      // 在初始化时监听popstate事件
      this._bindPopState();
    }
    // 初始化路由
    init(path) {
      history.replaceState({path: path}, null, path);
      this.routes[path] && this.routes[path]();
    }
    // 将路径和对应回调函数加入hashMap储存
    route(path, callback) {
      this.routes[path] = callback || function() {};
    }
  
    // 触发路由对应回调
    go(path) {
      history.pushState({path: path}, null, path);
      this.routes[path] && this.routes[path]();
    }
    // 监听popstate事件
    _bindPopState() {
      window.addEventListener('popstate', e => {
        const path = e.state && e.state.path;
        this.init(path)
      });
    }
  }
```