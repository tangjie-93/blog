​		在工作中经常会用到一些有用的知识点，可能当时用的时候还记得，但是过一段时间就忘了，所以在这里做一个记录，方便以后再来复习。写得不对的地方还请各位大神指点一下。

<ul>
    <li><a href="#a1">1、判断传过来的变量是否是一个数组</a></li>
    <li><a href="#a2">2、typeof和instanceof的区别</a></li>
    <li><a href="#a3">3、Window.onload和DOMContentLoaded的区别</a></li>
    <li><a href="#a4">4、javascript延迟加载的方式</a></li>
    <li><a href="#a6">5、js获取元素的宽高</a></li>
    <li><a href="#a10">6、IE 与其他浏览器的区别？</a></li>
    <li><a href="#a11">7、ajax</a></li>
</ul>

<h3><span id="a1">1、判断传过来的变量是否是一个数组</span></h3>
​		很多时候我们都会用下面这个方法来判断传递过来的对象是否是一个数组。

```js    
var isArray = value instanceof Array; 
```

​		这个方法在一般情况下（value不是从其他frame传过来的）是成立的。
​		但是为了防止一般情况的发生，我们可以用该方法来验证。 

```js
 function isArray(value) {
	 return Object.prototype.toString.call(value) == "[object Array]";
 } 
```

<h3><span id="a2">2、typeof和instanceof的区别</span></h3>
<h4>&#8195;2.1  typeof</h4>
​		是一种操作符而不是一个函数，用来检测给定变量的数据类型。一般是用来判	断"number"、"string"、"boolean"、 和 "undefined"这4种基本数据类型的。object类型用typeof来判断结果存在争议，所以一般是使用instanceof来进行判断。**引用类型用typeof来进行判断时返回的都是object，**以至于我们还是不知道用于判断的变量到到底是什么数据类型。

```js	    
console.log(typeof(null));//object
console.log(typeof([1,2]));//object
```
但实际上null是Null类型，而[1,2]是Array类型。

​		**typeof 最常见的用法**

>1、判断某个变量是否未定义  
>2、判断某个变量是否初始化


        if(typeof(b)=="undefined"){}

不能直接用if(b)去判断，这样代码会直接报错，后面的代码也会运行不了。因为typeof判断数据类型的不足（只能用于判断基本数据类型），引用数据类型需要使用instanceof的方式来进行判断

 <h4>&#8195;2.2  instanceof</h4>     
​		`object instanceof constructor` 此运算符可以判断一个变量是否是某个对象（类）的实例。换句话说用来检测 `constructor.prototype` 是否存在于参数 object 的原型链上。  
​		下面通过代码阐述instanceof的内部机制，假设现在有 x instanceof y 一条语句，则其内部实际做了如下判断：

```js
while(x.__proto__!==null) {
    if(x.__proto__===y.prototype) {
        return true;
    }
    x.__proto__ = x.__proto__.proto__;
    
}
if(x.__proto__==null) {return false;}
//函数代码实现
function instanceOf(instance,constructor){
    let proto=Object.getPrototypeOf(instance);
    while(proto){
        if(proto===constructor.prototype){
            return true;
        }
        proto=Object.getPrototypeOf(proto);
    }
    return false;
}
```

​		参考链接：https://juejin.im/post/5c19c1b6e51d451d1e06c163   
​		x会一直沿着隐式原型链__proto__向上查找直到x.__proto__.__proto__......===y.prototype为止，如果找到则返回true，也就是x为y的一个实例。否则返回false，x不是y的实例。

<h3 id="a3">3、Window.onload和DOMContentLoaded的区别</h3>
> **Window.onload：** 当页面完全加载后（包括所有图像、javascript文件、css文件等外部资源）触发的事件。   
> **DOMContentLoaded:** 在形成完整的dom树之后就会触发，不理会图像、javascript文件、css文件或其他资源是否已经下载完毕。跟$(function(){})的作用是一样的。

<h3 id="a4">4、javascript延迟加载的方式</h3>
> 1、defer：并行加载js文件，表示脚本可以延迟到整个页面完全被解析和显示之后再执行，标记为defer的脚本按照页面上script标签的顺序执行，但只适用于外部脚本文件。。**（立即下载，延迟执行）**    
> 2、async:并行加载js文件，下载完成立即执行，不保证按照页面上script标签的顺序执行。只适合外部脚本文件。并且一定会在页面的load事件前执行，但可能会在DOMContentLoaded事件触发之前或之后执行。  
> 3、动态创建script元素。此文件当元素添加到页面之后立刻开始下载，可以使用load事件来监听script是否加载（下载）完毕，IE使用onreadystatechange函数），下载许多时可以使用promise

```js
function loadScript(url, callback){
    var script = document.createElement ("script")
    script.type = "text/javascript";
    if (script.readyState){ //IE
        script.onreadystatechange = function(){
            if (script.readyState == "loaded" || script.readyState == "complete"){
                script.onreadystatechange = null;
                callback();
            }
        };
    } else { //Others
        script.onload = function(){
            callback();
        };
    }
    script.src = url;
    document.getElementsByTagName_r("head")[0].appendChild(script);
}
```

> 4、使用XHR对象将脚本注入到页面中。

```js
var xhr = new XMLHttpRequest();
xhr.open("get", "file1.js", true);
xhr.onreadystatechange = function(){
    if (xhr.readyState == 4){
        if (xhr.status >= 200 && xhr.status < 300 || xhr.status == 304){
            var script = document.createElement ("script");
            script.type = "text/javascript";
            script.text = xhr.responseText;
            document.body.appendChild(script);
        }
    }
};
xhr.send(null)       
```
<h3 id="a6">5、js获取元素的宽高</h3>

&#8195;&#8195;转载自:[https://www.cnblogs.com/chengzp/p/cssbox.htm](https://www.cnblogs.com/chengzp/p/cssbox.htm)  
&#8195;&#8195;通过JS获取盒模型对应的宽和高，有以下几种方法。为了方便书写，以下用dom来表示获取的HTML的节点。

>1.  dom.style.width/height 
　　这种方式**只能取到dom元素内联样式**所设置的宽高，也就是说如果该节点的样式是在style标签中或外联的CSS文件中设置的话，通过这种方法是获取不到dom的宽高的。

> 2. dom.currentStyle.width/height  

　　这种方式获取的是在页面渲染完成后的结果，就是说不管是哪种方式设置的样式，都能获取到。**但这种方式只有IE浏览器支持。**

 >3. window.getComputedStyle(dom).width/height

　　这种方式的原理和2是一样的，这个可以兼容更多的浏览器，通用性好一些。

 >4. dom.getBoundingClientRect().width/height

　　这种方式是根据元素在`视窗中的绝对位置`来获取宽高的

 >   5.dom.offsetWidth/offsetHeight

　　这个就没什么好说的了，最常用的，也是兼容最好的
<h3 id="a10">6、IE 与其他浏览器区别</h3>

|   特性   |              IE               |               其他浏览器               |
| :------: | :---------------------------: | :------------------------------------: |
| 获取样式 | dom.currentStyle.width/height | window.getComputStyle(dom).width/width |
| 滤镜方面 |  filter:alpha(opacity= num)   |    -moz-opacity:num、opacity:num等     |
| 添加事件 |          attachEvent          |            addEventListener            |
| 鼠标位置 |         event.clientX         |              event.pageX               |
| 事件目标 |       event.srcElement        |              event.target              |
| CSS圆角  |       ie7以下不支持圆角       |                  支持                  |

<h3 id="a11">7、ajax</h3>
<h4>&#8195;7.1、创建ajax的步骤</h4>

> 1、创建`XMLHttpRequest`对象，也就是创建一个异步调用对象。 
> 2、创建一个新的`HTTP`请求，并指定该`HTTP`请求的方法、`URL`及是否异步。  
> 3、设置响应`HTTP`请求状态变化的函数。通过检测readState属性的值，判断当前请求或相应过程的当前活动阶段，readState有以下几个值：

```javascript
0：未初始化。尚未调用open()方法。
1：启动。已经调用open()方法,但尚未调用send()方法。
2：发送。已经调用send()方法，但尚未收到响应。
3：接收。已经接收到部分响应数据。
4：完成。已经接收到全部响应数据。
```
>4、发送`HTTP`请求。   
>5、获取异步调用返回的数据。响应数据会自动填充xhr对象的属性。主要有以下属性。  

```js
responseText：作为响应主体被返回的文本。
responseXML：如果响应的内容类型是"text/xml"或者"application/xml"，这个属性将保存着响应数据的XML DOM文档。
status：响应的HTTP状态码。
statusText：HTTP状态的说明。
```
>6、使用JavaScript和DOM实现局部刷新。

```js
function loadXMLDoc(){
    var xhr;
    if (window.XMLHttpRequest)
    {
        //IE7+, Firefox, Chrome, Opera, Safari 浏览器执行代码
        xhr=new XMLHttpRequest();
    }else{
        // IE6, IE5 浏览器执行代码
        xhr=new ActiveXObject("Microsoft.XMLHTTP");
    }
    xhr.open("GET","file.txt",true);//确保浏览器兼容性。
    xhr.onreadystatechange=function(){
        if (xhr.readyState==4 && xhr.status==200)
        {   
            if(xhr.status>=200&&xhr.status<300||xhr.status==304){
                document.getElementById("myDiv").innerHTML=xhr.responseText;
            } 

        }
    }
    xhr.send();
}
```

<h4>&#8195;7.2、HTTP头部信息</h4>

>**xhr.setRequestHeader()** 用于设置请求头部信息。接收两个参数，头部字段的名称和头部字段的值。该方法必须放在open()和send()方法之间。
>**xhr.getResponseHeader()** 传入相应的头部字段名称，获取相应的头部信息。
>**xhr.getAllResponseHeader()** 获取所有头部信息。
<h4>&#8195;7.3、ajax的优缺点</h4>

**优点**
>1.	不需要插件支持。(原生代码)
>2.	优秀的用户体验。(局部刷新)
>3.	提高web程序的性能。(异步加载，无序等待)
>4.	减轻服务器和宽带的负担。（，对于大量数据可以分很多批次请求进行）

**缺点**
>1.	破坏了浏览器"前进"、"后退"按钮的正常功能。
>2.	安全问题：AJAX暴露了与服务器交互的细节。
>3.	对搜索引擎的支持比较弱。
>4.	破坏了程序的异常机制。
>5.	浏览器对xhr对象的支持不足（兼容性）。
