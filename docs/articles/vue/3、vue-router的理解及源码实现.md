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
## 3、导航守卫

我们在项目开发过程中经常会用到导航守卫，在这些导航守卫中执行以下逻辑操作。导航守卫按使用范围分为：**全局导航守卫，路由独享守卫和组件内守卫**。详细介绍可以查看[官方地址](https://router.vuejs.org/zh/guide/advanced/navigation-guards.html#%E7%BB%84%E4%BB%B6%E5%86%85%E7%9A%84%E5%AE%88%E5%8D%AB)
#### 1、全局导航守卫
+ 全局前置守卫
一般是用来就你行权限控制的，在这里进行用权限控制及路由跳转和重定向操作。守卫是异步解析执行，此时导航在所有守卫 `resolve` 完之前一直处于**等待中**。
```js
const router = new VueRouter({ ... })
router.beforeEach((to, from, next) => {
  // ...
  同
})
```
每个守卫方法接收三个参数
  + to: Route: 即将要进入的目标 路由对象
  + from: Route: 当前导航正要离开的路由
  + next: Function: 一定要调用该方法来 resolve 这个钩子。执行效果依赖 next 方法的调用参数。
    + next(): 进行管道中的下一个钩子。如果全部钩子执行完了，则导航的状态就是 confirmed (确认的)。
    + next(false): 中断当前的导航。如果浏览器的 URL 改变了 (可能是用户手动或者浏览器后退按钮)，那么 URL 地址会重置到 from 路由对应的地址。
    + next('/') 或者 next({ path: '/' }): 跳转到一个不同的地址。当前的导航被中断，然后进行一个新的导航。你可以向 next 传递任意位置对象，且允许设置诸如 replace: true、name: 'home' 之类的选项以及任何用在 router-link 的 to prop 或 router.push 中的选项。
    + next(error): (2.4.0+) 如果传入 next 的参数是一个 Error 实例，则导航会被终止且该错误会被传递给 router.onError() 注册过的回调。
+ 全局解析守卫(2.5.0新增的)
`router.beforeResolve` 在导航被确认之前，**同时在所有组件内守卫和异步路由组件被解析之后**，解析守卫才被调用。
+ 全局后置守卫
```js
router.afterEach((to, from) => {
  // ...
})
```
#### 2、路由独享守卫
在路由配置里定义的。
```js
const router = new VueRouter({
  routes: [
    {
      path: '/foo',
      component: Foo,
      beforeEnter: (to, from, next) => {
        // ...
      }
    }
  ]
})
```
#### 3、组件内的守卫
+ beforeRouteEnter
+ beforeRouteUpdate (2.2 新增)
+ beforeRouteLeave
```js
beforeRouteEnter (to, from, next) {
  // 在渲染该组件的对应路由被 confirm 前调用
  // 不！能！获取组件实例 `this`
  // 因为当守卫执行前，组件实例还没被创建
  next(vm=>{
    //通过vm访问组件实例
  })
},
beforeRouteUpdate (to, from, next) {
  // 在当前路由改变，但是该组件被复用时调用
  // 举例来说，对于一个带有动态参数的路径 /foo/:id，在 /foo/1 和 /foo/2 之间跳转的时候，
  // 由于会渲染同样的 Foo 组件，因此组件实例会被复用。而这个钩子就会在这个情况下被调用。
  // 可以访问组件实例 `this`
},
beforeRouteLeave (to, from, next) {
  // 导航离开该组件的对应路由时调用
  // 可以访问组件实例 `this`
}
```
**完整的导航解析流程**
+ 导航被触发。
+ 在失活的组件里调用 beforeRouteLeave 守卫。
+ 调用全局的 beforeEach 守卫。
+ 在重用的组件里调用 beforeRouteUpdate 守卫 (2.2+)。
+ 在路由配置里调用 beforeEnter。
+ 解析异步路由组件。
+ 在被激活的组件里调用 beforeRouteEnter。
+ 调用全局的 beforeResolve 守卫 (2.5+)。
+ 导航被确认。
+ 调用全局的 afterEach 钩子。
+ 触发 DOM 更新。
+ 用创建好的实例调用 beforeRouteEnter 守卫中传给 next 的回调函数。

## 4、vue-router的源码实现
+ 第一版，简单实现
```js
//引入Vue构造函数
import routerView from './router-view.vue';
import routerLink from './router-link.vue';
let Vue
class VueRouter{
    constructor(options) {
        //保存选项备用
        this.$options=options
        this.routeMap={};
        options.routes.forEach(route=>{
            this.routeMap[route.path]=route;
        })
        //当前路由时响应式的
        Vue.util.defineReactive(this,'current','/')
        //监听hash
        window.addEventListener('hashchange',this.onhashChange.bind(this))
    }
    onhashChange(){
        //获取当期url
        this.current=window.location.hash.slice(1);
    }
}

VueRouter.install=function(_Vue){
    Vue=_Vue;
    //1、挂载VueRouter实例
    //全局混入
    Vue.mixin({
        beforeCreate() {
            //上下文已经是组件实例，只有根组件有这个router属性
            if(this.$options.router){
                //获取外面的组件实例
                Vue.prototype.$router=this.$options.router
            }
            
        },
      
    })
    Vue.component("router-link",routerLink)
    Vue.component("router-view",routerView)
}
export default VueRouter
```
传送门 [vue-router的简单实现]()
+ 第二版，考虑递归
```js
import Link from './router-link'
import View from './router-view'
let Vue;
class BVueRouter {
  constructor(options) {    //options接收用户传进来的配置及属性
    this.$options = options
 
    this.current = window.location.hash.slice(1) || '/'
    Vue.util.defineReactive(this, 'matched', [])
    //match方法可以递归遍历路由表，获得匹配关系数据matched
    this.match()
 
    //这里使用bind(this)的原因是因为是window调用的，用bind(this)就是重新指向当前类KVueRouter
    window.addEventListener('hashchange', this.onHashChange.bind(this))
    window.addEventListener('load', this.onHashChange.bind(this))
 
  }
 
  onHashChange() {
    console.log('window.location.hash:===', window.location.hash);
 
    this.current = window.location.hash.slice(1)
    //当路由变化的时候，把matched数组清空，重新匹配
    this.matched = []
    this.match()
  }
  match(routes) {
    routes = routes || this.$options.routes
 
    //递归遍历
    for (const route of routes) {
      if (route.path === '/' && this.current === '/') {
        this.matched.push(route)
        return
      }
      //this.current是/about/info时的判断
      if (route.path !== '/' && this.current.indexOf(route.path) != -1) {
        this.matched.push(route)
        //路由/info
        if (route.children) {
          this.match(route.children)
        }
        return
      }
    }
  }
 
}
BVueRouter.install = function (_vue) {
  //保存构造函数，在KVueRouter中使用
  Vue = _vue
 
  //挂载$router   
  //怎么获取根实例下的router选项
  Vue.mixin({
    beforeCreate() {
      // console.log(this);
      //确保根实例的时候才执行，只有根实例的时候才会存在router,所以用下面的判断
      if (this.$options.router) {
        Vue.prototype.$router = this.$options.router
      }
 
    }
  })
  }) */
  Vue.component('router-link', Link)
  Vue.component('router-view', View)
 
}

export default BVueRouter

```
传送门 [vue-router的路由的递归实现]()