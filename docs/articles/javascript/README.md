
# 变量声明提升

 <h3 id="a16">变量声明提升</h3>

 变量提升是将变量声明提升到它所在作用域的最开始的部分。

```js
//代码1
var t = 1; 
function a(){
    console.log(t);
    var t=2;
}
a();//undefined;
```

这是因为函数里的变量t声明提升到函数最开始的部分了。上面的代码1相当于代码2：

```js
//代码2
var t = 1; 
function a(){
    var t;
    console.log(t);
    t=2;
}
a();//undefined;
```

​		在函数内部，如果没有用var进行申明，则创建的变量是**全局变量，而不是局部变量**了。所以，建议变量声明加上var关键字。

```js   
//代码3
var t = 1; 
function a(){
    console.log(t)//undefined
    t=4;
    console.log(t);//4
    var t=2;
    console.log(t);//2
}
a();
```

function声明会比var声明优先级更高一点。

```js
//代码4
console.log(foo);
var foo=10;
console.log(foo);
function foo(){
    console.log(10);
}
console.log(foo);
```

相当于下面的代码：

```js
function foo(){
    console.log(10);
}
var foo；
console.log(foo);
foo=10;
console.log(foo);
console.log(foo);
```

运行结果如下:

![](https://user-gold-cdn.xitu.io/2019/4/10/16a07e5f751f4e06?w=1914&h=146&f=png&s=20751)


```js
//代码5
function foo(){
	console.log(a);//2
}
function bar(){
	var a=3;
	foo();
}
var a=2;
bar();
```

​		上面的代码的运行过程是bar()-->foo(),此时的a由于在调用bar()之前已经初始化了，所以相当于给在foo()函数的所在作用域中的this对象添加了a属性，并赋值为2，所以调用foo()函数的a时，实际上调用的foo()所在作用域的this的a属性。