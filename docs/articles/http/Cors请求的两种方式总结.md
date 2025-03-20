---
title: Cors请求的两种方式总结
date: '2020-08-04'
type: 技术
tags: http
note: Cors请求的两种方式总结——简单请求和非简单请求
---
### 1、简单请求
**同时满足两大条件：**
+ 请求方法是`get、post、head`之一。
+ HTTP的头信息不超出以下几个字段。
    + `Accept`
    + `Accept-Language`
    + `Content-Language`
    + `Last-Event-Id`
    + `Content-Type` 只限于三个值`application/x-www-form-urlencoded、multipart/form-data、text/plain`

&#8195;&#8195;**基本流程：** 浏览器直接发出CORS请求。具体来说，就是在头信息之中，增加一个Origin字段。服务器根据`Origin`的值，来决定是否同意此次请求。`Origin`在许可范围内，服务器返回的响应头中，会多出几个以`Access-Control-`开头的响应头。

+ `Access-Control-Allow-Origin`

&#8195;&#8195;该字段是必须的。它的值要么是请求时`Origin`字段的值，要么是一个*，表示接受任意域名的请求。

+ `Access-Control-Allow-Credentials`

&#8195;&#8195;该字段可选。它的值是一个布尔值，表示是否允许发送Cookie。默认情况下，Cookie不包括在CORS请求之中。设为true，即表示服务器明确许可，Cookie可以包含在请求中，一起发给服务器。这个值也只能设为true，如果服务器不要浏览器发送Cookie，删除该字段即可。

+ `Access-Control-Expose-Headers`

&#8195;&#8195;该字段可选。`CORS`请求时，`XMLHttpRequest`对象的`getResponseHeader()`方法只能拿到6个基本字段：`Cache-Control、Content-Language、Content-Type、Expires、Last-Modified、Pragma`。如果想拿到其他字段，就必须在`Access-Control-Expose-Headers`里面指定。

### 2、非简单请求

&#8195;&#8195;非简单请求是那种对服务器有特殊要求的请求，比如请求方法是`PUT或DELETE`，或者`Content-Type`字段的类型是`application/json`。<br>

&#8195;&#8195;**基本流程： **非简单请求的CORS请求，会在正式通信之前，增加一次HTTP查询请求，称为**预检**请求。浏览器先询问服务器，当前网页所在的域名是否在服务器的许可名单之中，以及可以使用哪些HTTP动词和头信息字段。<br> 

&#8195;&#8195;**预检**请求用的请求方法是`OPTIONS`，表示这个请求是用来询问的。头信息里面，关键字段是`Origin`，表示请求来自哪个源。除了`Origin`字段，"预检"请求的头信息包括两个特殊字段。

&#8195;&#8195;如果浏览器否定了**预检**请求，会返回一个正常的`HTTP`回应，但是没有任何`CORS`相关的头信息字段。这时，浏览器就会认定，服务器不同意预检请求，因此触发一个错误，被`XMLHttpRequest`对象的`onerror`回调函数捕获。

&#8195;&#8195;只有得到肯定答复，浏览器才会发出正式的`XMLHttpRequest`请求，否则就报错。一旦服务器通过了**预检**请求，以后每次浏览器正常的`CORS`请求，就都跟**简单请求一样**，会有一个`Origin`头信息字段。服务器的回应，也都会有一个`Access-Control-Allow-Origin`头信息字段。<br>
&#8195;&#8195;**预检**请求的头信息包括两个特殊字段。`Access-Control-Request-Method`和`Access-Control-Request-Headers`。
+ `Access-Control-Request-Method`

&#8195;&#8195;该字段是必须的，用来列出浏览器的CORS请求会用到哪些HTTP方法，上例是PUT。

+ `Access-Control-Request-Headers`

&#8195;&#8195;该字段是一个逗号分隔的字符串，指定浏览器CORS请求会额外发送的头信息字段，上例是`X-Custom-Header`