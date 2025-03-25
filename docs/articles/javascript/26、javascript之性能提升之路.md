---
title: 27、javascript之性能提升之路
date: '2020-01-14'
type: 技术
tags: javascript
note: 所以通过查阅相关资料并实践后，总结出如下知识点来提升性能。有什么写得不对的地方还希望各路大神指出并加以指点。
---

&#8195;&#8195;在平时工作做项目的过程中我们有时候会遇到页面加载很久才加载出来的情况，这样严重影响了用户的体验效果。虽然说有时候可能是因为网络问题，但有些时候确实是前端代码没有足够优化导致的。所以通过查阅相关资料并实践后，总结出如下知识点来提升性能。有什么写得不对的地方还希望各路大神指出并加以指点。
<ul>
    <li><a href="#a1">数据访问</a></li>
    <li><a href="#a2">Dom</a></li>
    <li><a href="#a3">循环</a></li>
</ul>
<h3 id="a1">1、数据访问</h3>

> 1、将所有script标签放在尽可能接近body标签底部的位置，尽可能减少对整个页面下载的影响。
![](https://user-gold-cdn.xitu.io/2019/4/7/169f775b3e400dce?w=993&h=465&f=png&s=48207)

> 2、尽量少用全局变量（解决办法：使用严格模式可以避免）。因为变量在作用域链中的位置越深，访问的时间就越长。局部变量位于作用域链中的第一个对象中，全局变量总是位于作用域链的最后一环，所以全局变量总是最慢的。 

> 3、避免全局查询，如果一定要用到全局变量时，并且需要在某个函数中多次用到该全局变量时，可以定义一个局部变量指向全局变量，来缩短在作用域链中的查询深度。 

```js
function addTotrackData(){
    var allChildrenNode=getAllChildrenDepartmentNodes();
    for (var i = 0; i < allChildrenNode.length; i++) {
        for (var j=0,len=track.length;j<len;j++) {
            if (trackNode[j]["userId"] == allChildrenNode[i]) {
                trackNode[j]["isOnMap"] = true;
            }
        }
    }
}
```

上面代码可以改写为如下所示
```js
function addTotrackData(){
    var allChildrenNode=getAllChildrenDepartmentNodes();
    var track=trackNode;
    for (var i = 0; i < allChildrenNode.length; i++) {
        for (var j=0,len=track.length;j<len;j++)  {
            if (track[j]["userId"] == allChildrenNode[i]) {
                track[j]["isOnMap"] = true;
            }
        }
    }
}
```

> 4、将集合的length属性用一个局部变量来保存，在迭代中使用该变量。

```js
 for (var j=0,len=track.length;j<len;j++) 
```

> 5、避免使用with表达式，因为它增加作用域链的长度(with可以将一个没有或有多个属性的对象处理成一个完全隔离的词法作用域，同时定义在这个with块内部var声明会被添加到with所在的函数作用域中)，with通常被当做重复引用同一个对象的多个属性的快捷方式，可以不需要重复引用对象本身。而且应当小心的对待try-catch的catch子句，它具有同样效果。

```js
//例子1
var obj={
    a:1,
    b:2,
    c:3
}
//简单的快捷方式
with(obj){
    a=2；
    b=3;
    c=4
}
```

```js
//例子2
function foo(obj){
    with(obj){
        a=2;
    }
}
var obj1={
    a:1
}
var obj2={
    b:3
}
foo(obj1);
console.log(obj1.a);//2
foo(obj2);
console.log(obj.a);//undefined
console.log(a);//2  a被泄露到全局作用域上，with中只会对传入的对象属性进行修改，不能给对象添加新属性。
```

> 5、一个属性或方法在原型链中的位置越深，它的访问速度就越慢。
  
> 6、声明变量时，多个变量合并声明，可以减少内存消耗。   

```js
var a;
var b;
var c;
//推荐
var a,b,c
```
 >7、不要使用eval(功能是把对应的字符串解析成JS代码并运行)，不安全，非常耗性能（2次，一次解析成js语句，一次执行），同时也会对eval()所在的词法作用域进行修改。  

```js
function foo(str,a){
    aval(str);//改变词法作用域
    console.log(a,b)
}
var b=2；
foo("var b=3",1);
```
 >8、利用图像灯标实现向服务器快速传送数据。格式：`(new Image).src=url?params.join("&")`。  

 >9、用数组和对象的直接量创建对象和数组,比非直接量形式创建和初始化更快。

```js
var obj={};
var arr=[];
```

>10、尽量使用javascript自带的原生方法，如Math.abs()。   

>11、避免重复进行相同操作。如需要检测浏览器时，使用延迟加载和条件预加载（？三元符）
延迟加载的代码如下：

```js
function addhandler(target,eventType,handler){
    if(target.addEventListener){
        addhandler=function(){
            target.addEventListener(eventType,handler,false);
        };
    }else{
        addhandler=function(){	
            target.addEventListener("on"+eventType,handler)
        };
	}
	addhandler(target,eventType,handler);
}
var dom=document.getElementById("test");
    addhandler(dom,"click",function(){
    console.log("测试");
})   
```

>12、减少ajax的请求次数。  在服务器端，设置http头，确保返回报文被缓存在浏览器端（Expires头告诉浏览器应当缓存返回报文多长时间，其值是一个日期。超过这个日期发起请求后，都将从服务器获取数据。同时向文件名附加时间戳可以解决缓存问题。

```js
格式：Expires: Mon, 28 Jul 2014 23:30:00 GM）。
```
>13、使用内容传递网络（CDN——通过地理位置上最近的位置向用户提供服务，减少网络延迟）提供javascript文件，在提高性能的同时，还可以管理压缩和缓存。

<h3 id="a2">2、Dom操作</h3>

&#8195;&#8195;Dom（文档对象模型）是一个独立于语言的，使用xml和html文档操作的应用程序接口。在浏览器中的接口却是以javascript来实现的。Dom和javascript看成两座岛，两者之间通过一座收费的桥连接。一般建议尽量留在javascript岛上。

> 1、用innerHTML代替DOM操作，减少DOM操作次数，优化javascript性能。

```js
//dom方式
var str=""
var dom=document.getElementById("test");
var start1=new Date();
for(var j=0;j<100000;j++){
    var div=document.createElement("div");
    div.innerText="test";
    dom.append(div);					
}
var end1=new Date();
console.log("dom方式:"+(end1-start1));//dom方式:356

//inerHTML方式
var content="";
var start=new Date();
for(var i=0;i<10000;i++){
    content=content+"<div>test</div>";
}
document.getElementById("test").innerHTML=content;
var end=new Date();
console.log("innerHTML方式:"+(end-start));//innerHTML方式:35
```

>2、如果同一个Dom元素或集合被访问一次以上，最好使用一个局部变量来缓存此Dom成员，在循环中使用局部变量缓存集合引用和集合元素会提升速度。 

>3、遍历children比childNodes更快。children不区分（包括）注释节点和空文本节点，所以快一些。

>4、使用element.cloneNode(bool)复制节点，bool为false表示浅复制，只复制当前节点，bool为true时，表示深复制，还会复制其子节点。这种方式比document.createElement()速度要快一些。  

>5、使用document.querySelector和document.querySelectorAll("div.warning,div.notice")来快速查找。因为它们返回一个NodeList——由符合条件的节点构成的类数组对象，而不是HTML集合（总是表现出存在性），避免了它所固有的性能问题（以及存在的逻辑问题）。querySelectorAll("div.warning,div.notice")还可以进行联合查询。  

>6、修改样式时，可以使用div.style.cssText来一起修改样式，或者使用类来修改（便于维护）。    


```js
var el = document.getElementById('mydiv');
//修改3次Dom
el.style.borderLeft = '1px';
el.style.borderRight = '2px';
el.style.padding = '5px'；
//推荐只需要修改1次Dom
el.style.cssText = 'border-left: 1px; border-right: 2px; padding: 5px;'  
```

>7、尽量避免在HTML标签中写Style属性，使用外联样式便于维护和修改。  

>8、避免图片和iFrame等的空Src。空Src会重新加载当前页面，影响速度和效率。  

>9、采用事件委托。元素连接事件句柄会影响页面性能，采用委托利用事件冒泡的性能减少元素连接事件。（事件挂接过程都是发生在onload或DOMContentReady）事件中。     

>10、避免使用css表达式，避免使用高级选择器（如后代、伪类选择器），通配选择器。    

>11、压缩文件（gzip），可以减少内存占用，同时减少查询时间。  

>12、合并样式和脚本、使用css图片精灵（雪碧图）（这样做是为了减少向服务器的请求数量，从而达到性能优化的效果）。

>13、缩短页面的加载时间，先将页面结构显示出来，然后使用ajax获取剩下的重要文件。  

<h3 id="a3">3、循环</h3>

> 1、for-in是四种循环方法中速度最慢的一种，一般用于循环对象（需要查找自身属性还是原型属性）。不建议循环数组。除非要迭代遍历一个属性未知的对象，否则一般不用for-in。    

> 2、改变循环条件的顺序来提高循环性能。

```js
//推荐
for(var i=items.length;i--;){
//todo
}
//不推荐
for(var i=0,len=items.length;i<len;i++){
//todo
}   
```

> 3、通过减少循环体来优化性能。

<Valine></Valine>