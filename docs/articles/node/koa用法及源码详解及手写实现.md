---
title: koa用法及源码详解
date: '2020-01-14'
type: 技术
tags: node
note: koa用法及源码详解。
---
## 1、koa是什么

&#8195;&#8195;`Koa`是一个类似于`Express`的`Web`开发框架，创始人也是同一个人。它的主要特点是，使用了`ES6`的`Generator`函数，进行了架构的重新设计。也就是说，`Koa`的原理和内部结构很像`Express`，但是语法和内部结构进行了升级。


**&#8195;一个Koa应用就是一个对象，包含了一个middleware数组，这个数组由一组Generator函数组成**。这些函数负责对HTTP请求进行各种加工，比如生成缓存、指定代理、请求重定向等等。
```javascript
var koa = require('koa');
var app = koa();
app.use(function *(){
    this.body = 'Hello World';
});
app.listen(3000);
//app.use方法用于向middleware数组添加Generator函数。
//listen方法指定监听端口，并启动当前应用。
```
## 2、中间件

&#8195;&#8195;是对 `HTTP` 请求进行处理的函数，但是必须是一个 `async` 函数。而且，`Koa` 的中间件是一个级联式（`Cascading`）的结构，也就是说，属于是层层调用，第一个中间件调用第二个中间件，第二个调用第三个，以此类推。上游的中间件必须等到下游的中间件返回结果，才会继续执行，这点很像递归。中间件通过当前应用的use方法注册。

**多个中间件的合并:**
```javascript
const random= async (next)=> {
    if ('/random' == this.path) {
        this.body = Math.floor(Math.random()*10);
    } else {
        await next;
    }
};

const backwards=async (next)=> {
    if ('/backwards' == this.path) {
        this.body = 'sdrawkcab';
    } else {
        yield next;
    }
}

const pi=async (next)=> {
    if ('/pi' == this.path) {
        this.body = String(Math.PI);
    } else {
        await next;
    }
}

const all=async (next)=> {
    await random.call(this, backwards.call(this, pi.call(this, next)));
}

app.use(all);
```
## 3、路由

+ 1、可以通过 `this.path` 属性，判断用户请求的路径，从而起到路由作用。
```javascript
let koa = require('koa')
let app = koa()
// normal route
app.use(function* (next) {
    if (this.path !== '/') {
        return yield next
    }
    this.body = 'hello world'
});
```
+ 2、复杂的路由需要安装`koa-router`插件。
```javascript
var app = require('koa')();
var Router = require('koa-router');
var myRouter = new Router();
    myRouter.get('/', function *(next) {
    this.response.body = 'Hello World!';
});
app.use(myRouter.routes());
app.listen(3000);
```
+ 3、`Koa-router` 实例提供一系列动词方法，即一种 `HTTP` 动词对应一种方法。
```javascript
1)router.get()
2)router.post()
3)router.put()
4)router.del()
5)router.patch()
```
+ 4、有些路径模式比较复杂，`Koa-router` 允许为路径模式起别名。起名时，别名要添加为动词方法的第一个参数，这时动词方法变成接受三个参数。
```javascript
router.get('user', '/users/:id', function *(next) {
// ...
});
//上面代码中，路径模式\users\:id的名字就是user。
```
+ 5、`Koa-router` 允许为路径统一添加前缀。
```javascript
var router = new Router({
    prefix: '/users'
});
router.get('/', ...); // 等同于"/users"
router.get('/:id', ...); // 等同于"/users/:id"
```
+ 6、路径的参数通过 `this.params` 属性获取，该属性返回一个对象，所有路径参数都是该对象的成员。

```javascript
    // 访问 /programming/how-to-node
    router.get('/:category/:title', function *(next) {
        console.log(this.params);
        // => { category: 'programming', title: 'how-to-node' }
    });
```
+ 7、param方法可以针对命名参数，设置验证条件。
```javascript
    router.get('/users/:user', function *(next) {
        this.body = this.user;
    }).param('user', function *(id, next) {
        var users = [ '0号用户', '1号用户', '2号用户'];
        this.user = users[id];
        if (!this.user) return this.status = 404;
        yield next;
    })
```
+ **8、redirect** 方法会将某个路径的请求，重定向到另一个路径，并返回301状态码。
```javascript
    router.redirect('/login', 'sign-in');
    // 等同于
    router.all('/login', function *() {
        this.redirect('/sign-in');
        this.status = 301;
    });
```
+ **9、context对象**

&#8195;&#8195;中间件当中的 `this` 表示上下文对象 `context`，代表一次 `HTTP` 请求和回应，即一次访问/回应的所有信息，都可以从上下文对象获得。`context` 对象封装了 `request` 和 `response` 对象，并且提供了一些辅助方法。每次 `HTTP` 请求，就会创建一个新的`context` 对象。
`context` 对象的全局属性。
+  request：指向Request对象
+  response：指向Response对象
    + response.set(key,val);//设置响应头
    + response.status=200;//设置状态码
    + response.body="cee";//响应体

`context` 也可以直接使用respanse以及request的api
+ ctx.set(key,value);
+ ctx.status=200;
+ ctx.body="cee"    
+ req：指向Node的request对象
+ res：指向Node的response对象
+ app：指向App对象
+ state：用于在中间件传递信息。

`context` 对象的全局方法。
+ throw()：抛出错误，直接决定了HTTP回应的状态码。
+ assert()：如果一个表达式为false，则抛出一个错误。

## 4、Koa提供内置的错误处理机制
&#8195;&#8195;任何中间件抛出的错误都会被捕捉到，引发向客户端返回一个500错误，而不会导致进程停止，因此也就不需要`forever` 这样的模块重启进程。

`this.throw`方法的两个参数，一个是错误码，另一个是报错信息。如果省略状态码，默认是500错误。
`this.assert`方法用于在中间件之中断言，用法类似于 `Node` 的`assert` 模块。
## 5、cookie
```javascript
    this.cookies.get('view');
    this.cookies.set('view', n);
    
```
`get`和 `set` 方法都可以接受第三个参数，表示配置参数。其中的 `signed` 参数，用于指定 `cookie` 是否加密。如果指定加密的话，必须用`app.keys`指定加密短语。
`this.cookie`的配置对象的属性如下。
+ signed：cookie是否加密。
+ expires：cookie何时过期
+ path：cookie的路径，默认是“/”。
+ domain：cookie的域名。
+ secure：cookie是否只有https请求下才发送。
+ httpOnly：是否只有服务器可以取到cookie，默认为true。

<!-- ## 6、koa源码实现 -->
