<ul>
    <li><a href="#new">new关键字的作用</a></li>
    <li><a href="#useNew">调用构造函数使用new关键字的情况</a></li>
    <li><a href="#noNew">调用构造函数不使用new关键字的情况</a></li>
    <li><a href="#return">调用构造函数时，在内部有retun语句的情况</a></li>
</ul>

先看一下如下实例代码
```javascript
function Person(name,age){
    this.name=name;
    this.age=age;
}
Person.prototype.say=function(){
    console.log("姓名："+this.name+"，年龄："+this.age);				
}
var p1=new Person("黎明",30);
console.log(p1.name);//黎明
p1.say();//姓名：黎明，年龄：30
```

<h4><span id="new">1、new在这个过程中执行了以下三个步骤</span></h4>
> 1、创建一个空对象；   
> 2、然后让这个空对象的__proto__指向函数的原型prototype，继承了该函数的原型。    
> 3、调用call方法，将这个空对象对象作为函数的this传进去，并且最后隐式的返回这个空对象 。

<h4><span id="useNew">2、调用构造函数使用new关键字的情况</span></h4>
var p1=new Person("黎明",30)这句代码的内部代码执行如下： 

```javascript
new Person("黎明",30)={
    var obj  = {};//创建一个空对象 
    obj.__proto__ = Person.prototype;   
    Person.call(obj,"黎明",30);
    return obj；
}
```
​		分析：所以new在这个过程中的作用是,使p1继承了Person的name和age属性，使p1的原型指向了Person的原型，使得p1拥有了Person的全部实例属性和原型对象，因此p1具有了name和age属性以及say方法。new Person("黎明",30)返回的是如下所示的对象。

![](https://user-gold-cdn.xitu.io/2019/4/5/169ed224f2de8e81?w=452&h=191&f=png&s=14037)

<h4><span id="noNew">3、调用构造函数不使用new关键字的情况</span></h4>
```javascript	
var p2=Person("李明",24);
console.log(p2.name);//Cannot read property 'age' of undefined
```
​		分析：此时相当于只是调用了Person("李明"，24)的这样一个普通方法,并不是调用Person构造函数创建一个新的实例对象，并且该方法没有返回值，所以调用Person("李明",24)返回的是默认值undefined。因此P2也没有name和age属性。

```javascript
var p2=Person("李明",24)
p1.say.call(p2);//"姓名：李明，年龄：24
```
为什么这句代码会有输出呢？原因如下    
>1、var p2=Person("李明",24);在Person构造方法中的this表示的是window,所以就有；

```javascript    
window.name="李明";
window.age=24;
```
>2、p1.say.call(p2)中的p2表示是调用Person("李明",24)构造函数后的返回值，但是该构造函数没有返回值，因此p2=undefined，根据call方法的定义，所以在say()方法中的this表示window。

<h4><span id="return">4、调用构造函数时，在内部有retun语句的情况</span></h4>
```javascript	 
         function Person(name,age){
		this.name=name;
		this.age=age;
		return name;
	 }
	 var p1=new Person("黎明"，23)；
	 console.log(p1);//{name: "黎明",age:23}
	 function Person(name,age){
		this.name=name;
		this.age=age;
		return {};
	}
	 var p1=new Person("黎明"，23)；
	 console.log(p1);//{}
```
​		原因分析：构造函数不需要显示的返回值。使用new来创建对象(调用构造函数)时，如果return返回的是非对象(数字、字符串、布尔类型等)会忽略返回值；如果return的是对象，则返回该对象(注：若return null也会忽略返回值）。