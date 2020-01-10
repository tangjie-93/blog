**nginx是一款轻量级的HTTP服务器，采用事件驱动的异步非阻塞处理方式，时常用于服务器的反向代理和负载均衡。**
nginx和node.js的对比。
>nginx的优势：更擅长底层服务器端资源的处理。如静态资源处理转发，反向代理和负载均衡。
>node更擅长上层具体业务逻辑的处理。
## 1、什么是代理？
&#8195;&#8195;代理其实就是在client端和server端之间增加一层提供特殊服务的服务器，及代理服务器。
## 2、代理的分类
### 2.1 正向代理
&#8195;&#8195;代理服务器跟客户端处理同一个局域网（LAN）；代理对用户是非透明的，用户需要感自己知或者操作自己的请求被发送到代理服务器；然后代理服务器通过代理服务器的请求向域外服务器请求响应内容。我们常用的翻墙工具就是一个正向代理服务器，会把访问墙外服务器服务的的网络请求，代理到一个可以访问该网站的代理服务器proxy，这个代理服务器把墙外服务器上的资源获取，再转发给用户。如下图所示。
<img alt="nginx-proxy" class="lazyload inited loaded" data-src="https://user-gold-cdn.xitu.io/2018/9/27/1661ac31c06b0681?imageView2/0/w/1280/h/960/format/webp/ignore-error/1" data-width="625" data-height="467" src="https://user-gold-cdn.xitu.io/2018/9/27/1661ac31c06b0681?imageView2/0/w/1280/h/960/format/webp/ignore-error/1">
### 2.2 反向代理
&#8195;&#8195;代理服务器跟内部服务器之间可以互相访问，属于同一个局域网（LAN）；代理对用户是透明的，即无感知，即加不加这个代理，用户都会通过相同的请求进行的。且不需要任何额外的操作；代理服务器通过代理内部服务器接收域外客户端的请求，并将请求发送到对应的内部服务器上。反向代理的意思——代理服务器。
<img alt="nginx-proxy-reverse" class="lazyload inited loaded" data-src="https://user-gold-cdn.xitu.io/2018/9/27/1661ac31c192d22f?imageView2/0/w/1280/h/960/format/webp/ignore-error/1" data-width="655" data-height="499" src="https://user-gold-cdn.xitu.io/2018/9/27/1661ac31c192d22f?imageView2/0/w/1280/h/960/format/webp/ignore-error/1">
**反向代理的好处？**
+ 1、安全及权限。使用反向代理后，用户端将无法直接访问正真的内容服务器，而是通过Nginx将没有权限或者危险的请求内容过滤掉，从而保证服务器的安全。
+ 2、负载均衡。一个网站上的内容可以部署到多态服务器上，形成一个集群。那么Nginx可以将接收到的客户端请求“均匀地”分配到这个集群中所有的服务器上（内部模块提供了多种负载均衡算法），从而实现服务器压力的负载均衡。同时Nginx还带有（服务器心跳检查功能），来检查服务器是否异常，从而保证客户端请求的稳定性。
## 3、nginx是什么？
&#8195;&#8195;Nginx是一个开源且高性能、可靠的HTTP中间件、代理服务器。
### 3.1常见的HTTP服务
&#8195;&#8195;HTTPD-Apache基金会、IIS-微软、GWS-Google。
### 3.2 为什么选择Nginx？
+ 1、IO多路复用epoll
    IO多路复用：多个描述符的I/O操作都能在一个线程内并发交替的顺序完成。这里的“复用”指的是复用同一个线程。
    IO多路复用的实现方式：select、poll、epoll
    1.1 什么是select？
    1.2 select的缺点？
        1、能够监视文件描述符的数量存在最大限制
        2、线性扫描效率低下
    2、epoll模型
        1、每当FD就绪，采用系统的回调函数之间将fd放入，效率更高。
        2、最大连接无限制。
+ 2、轻量级
    1、功能模块少
    2、代码模块化
+ 3、CPU亲和(affinity)
    是一种把CPU核心和Nginx工作进程绑定的方式，把每个worker进程固定在一个CPU上执行，减少切换cpu的cache miss，获得更好的性能。
+ 4、sendfile



## 4、Nginx反向代理可以做什么？
+ 1、快速实现简单的访问限制 
```javascript
    location / {
        deny  192.168.1.100;
        allow 192.168.1.10/200;
        allow 10.110.50.16;
        deny  all;
    }
```
+ 2、解决跨域
+ 3、适配PC与移动环境
+ 4、合并请求
+ 5、图片处理
+ 6、页面内容修改

