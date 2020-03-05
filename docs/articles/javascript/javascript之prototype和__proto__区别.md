---
title: prototype和__proto__区别​
date: '2020-01-14'
type: 技术
tags: javascript
note: 在工作中有时候会看到**prototype**和__proto__这两个属性，对这两个属性我一直比较蒙圈，但是我通过查阅相关资料，决定做一下总结加深自己的理解，写得不对的地方还请各位大神指出。
---
​&#8195;&#8195;在工作中有时候会看到**prototype**和__proto__这两个属性，对这两个属性我一直比较蒙圈，但是我通过查阅相关资料，决定做一下总结加深自己的理解，写得不对的地方还请各位大神指出。

<ul>
    <li>
        <a href="#a1">prototype</a>
    </li>
    <li>
        <a href="#a2">__proto__</a>
    </li>
    <li>
        <a href="#a3">跟__proto__属性相关的两个方法</a>
    </li>
    <li>
        <a href="#a4">判断属性是存在实例对象中，还是存在原型对象中的方法</a>
    </li>
    <li>
        <a href="#a5">获取或遍历对象中属性的几种方法</a>
    </li>
    <li><a href="#a6">原型链</a></li>
</ul>

<h3><span id="a1">1、prototype</span></h3>

&#8195;&#8195;每个函数都有一个prototype属性，该属性是一个指针，指向一个对象。 而这个对象的用途是包含由特定类型的所有实例共享的属性和方法。使用这个对象的好处就是可以让所有实例对象共享它所拥有的属性和方法。**这个属性只用js中的类(或者说能够作为构造函数的对象)才会有。**

<h3><span id="a2">2、 __proto__</span></h3>

&#8195;&#8195;每个实例对象都有一个__proto__属性，用于指向构造函数的原型对象。__proto__属性是在调用构造函数创建实例对象时产生的。**该属性存在于实例和构造函数的原型对象之间，而不是存在于实例与构造函数之间。** 

```js            
function Person(name, age, job){    
    this.name = name;
    this.age = age;
    this.job = job;
    this.sayName = function(){
        console.log(this.name);
    }; // 与声明函数在逻辑上是等价的
}
var person1=new Person("Nicholas",29,"Software Engineer");
console.log(person1);
console.log(Person);
console.log(person1.prototype);//undefined
console.log(person1.__proto__);
console.log(Person.prototype);
console.log(person1.__proto__===Person.prototype);//true
```
输出结果如下：
<img>
![](https://user-gold-cdn.xitu.io/2019/4/6/169f1de8bb834e7f?w=1918&h=348&f=png&s=66345)

**总结：**
>1、调用构造函数创建的**实例对象**的prototype属性为"undefined",构造函数的prototype是一个对象。

>2、__proto__属性是在调用构造函数创建实例对象时产生的。

>3、调用构造函数创建的实例对象的__proto__属性指向构造函数的prototype，**本质上就是继承构造函数的原型属性**。 

>4、在默认情况下，所有原型对象都会自动获得一个constructor(构造函数)属性，这个属性包含一个指向prototype属性所在函数的指针。

下图展示了使用Person构造函数创建实例后各个对象之间的关系
<img src="https://user-gold-cdn.xitu.io/2019/1/18/1685e7139ef652db?w=987&h=423&f=png&s=53240" alt="暂无图片">
上图展示了 Person 构造函数、 Person 的原型属性以及 Person现有的两个实例之间的关系。

<h3><span id="a3">3、 跟__proto__属性相关的两个方法</span></h3>

```js
function Person(){
}
Person.prototype.name = "Nicholas";
Person.prototype.age = 29;
Person.prototype.job = "Software Engineer";
Person.prototype.sayName = function(){
    alert(this.name);
};
var person1 = new Person();
var person2 = new Person();
person1.name = "Greg";
alert(person1.name); //"Greg"—— 来自实例
alert(person2.name); //"Nicholas"—— 来自原型
```

>**isPrototypeOf():** 虽然在所有实现中都无法访问到__proto__，但可以通过 isPrototypeOf()方法来确定对象之间是否存在这种关系。

```js
alert(Person.prototype.isPrototypeOf(person1)); //true
alert(Person.prototype.isPrototypeOf(person2)); //true
```
>**Object.getPrototypeOf():** 在所有支持的实现中，这个方法返回__proto__的值。例如：

```js
//这里的person1是下面实例
alert(Object.getPrototypeOf(person1) == Person.prototype); //true
alert(Object.getPrototypeOf(person1).name); //"Nicholas"  person1
```

**注意：** 虽然可以通过对象实例访问保存在原型中的值，但却不能通过对象实例重写原型中的值。如果我们在实例中添加了一个属性，而该属性与实例原型中的一个属性同名，那我们就在实例中创建该属性，该属性将会**屏蔽**原型中的那个属性。请看下面的例子：      

<h3><span id="a4">4、 判断属性是存在实例对象中，还是存在原型对象中，有以下方法</span></h3>

>**hasOwnProperty():** 可以检测一个属性是存在于实例中，还是存在于原型中。返回值为true表示该属性存在实例对象中，其他情况都为false。

>**in 操作符:** 无论该属性存在于实例中还是原型中。只要存在对象中，都会返回true。但是可以同时使用 hasOwnProperty()方法和 in 操作符，就可以确定该属性到底是存在于对象中，还是存在于原型中。

```js
var person1 = new Person();
var person2 = new Person();
alert(person1.hasOwnProperty("name")); //false
alert("name" in person1); //true
person1.name = "Greg";
alert(person1.name); //"Greg" —— 来自实例
alert(person1.hasOwnProperty("name")); //true
alert("name" in person1); //true
alert(person2.name); //"Nicholas" —— 来自原型
alert(person2.hasOwnProperty("name")); //false
alert("name" in person2); //true
delete person1.name;
alert(person1.name); //"Nicholas" —— 来自原型
alert(person1.hasOwnProperty("name")); //false
alert("name" in person1); //true
```

<h3><span id="a5">5、 获取或遍历对象中属性的几种方法</span></h3>

> **for-in：** 通过for-in循环的返回的是**能够被访问的、可枚举的属性**，不管该属性是在实例中，还是存在原型中。

```js
function Person(name, age, job) {
    this.name = name;
    this.age = age;
    this.job = job;	
}
Person.prototype={
    sayName:function(){
        return this.name;
    }
}
var p=new Person("李明",30,"诗人");
for(var prop in p){
    console.log(prop);//name、age、job、sayName
}
console.log(Object.keys(p));//["name", "age", "job"]
console.log(Object.keys(Person.prototype));//["sayName"]
console.log(Object.getOwnPropertyNames(Person.prototype))
// ["constructor", "sayName"] 
```
> **Object.keys()：** 取得实例对象上所有**可枚举的属性**。
> **Object.getOwnPropertyNames():** 获取实例对象所有属性，**无论它是否可枚举。**

```js
function Person() {}
var friend2 = new Person();
Person.prototype = {
    //constructor : Person,
    name: "Nicholas",
    age: 29,
    job: "Software Engineer",
    sayName: function() {
        alert(this.name);
    }
};

console.log(friend2 instanceof Object); //true
console.log(friend2 instanceof Person); //false,Person.prototype!==friend2.__proto__
console.log(friend2.constructor == Person); //true
console.log(friend2.constructor == Object); //false
var friend = new Person();
console.log(friend instanceof Object); //true
console.log(friend instanceof Person); //true
console.log(friend.constructor == Person); //false
console.log(friend.constructor == Object); //true
```
注意：**使用对象字面量来重写整个原型对象时**，本质上完全重写了默认的 prototype 对象，因此 constructor 属性也就变成了新对象的 constructor 属性（**指向 Object 构造函数**），不再指向 Person。但是可以通过在重写原型对象时指定constructor属性，使之还是指向原来的constructor。此时，尽管 instanceof
操作符还能返回正确的结果，但通过 constructor 已经无法确定对象的类型了。

**object instanceof constructor:** 检测 constructor.prototype 是否存在于参数 object 的原型链上。

​		由于原型的动态性，调用构造函数时会为实例添加一个指向最初原型的Prototype指针，而把原型修改为另外一个对象就等于切断了构造函数与最初原型之间的联系。看下面的例子         

```js
function Person(){}
var friend = new Person();
Person.prototype = {
    constructor: Person,
    name : "Nicholas",
    age : 29,
    job : "Software Engineer",
    sayName : function () {
        alert(this.name);
    }
};
var friend2=new Person();
friend.sayName(); //Uncaught TypeError: friend.sayName is not a function 
friend2.sayName();//Nicholas
console.log(friend instanceof Person);//false
console.log(friend instanceof Object);//true
console.log(friend2 instanceof Person);//true
```
结果分析：这是因为friend1的prototype指向的是没重写Person.prototype之前的Person.prototype，也就是构造函数最初的原型对象。而friend2的prototype指向的是重写Person.prototype后的Person.prototype。如下图所示
<img src="https://user-gold-cdn.xitu.io/2019/1/18/1685f0eaf93e9a82?w=1034&h=808&f=png&s=100941" alt="暂无图片">

<h3><span id="a6">6、 原型链</span></h3>

&#8195;&#8195;基本思想是利用原型让一个引用类型继承另一个引用类型的属性和方法。最直观的表现就是让原型对象指向另一个类型的实例。
​         
```js
function SuperType(){
    this.property = true;
}
SuperType.prototype.getSuperValue = function(){
    return this.property;
};
function SubType(){
    this.subproperty = false;
}
//继承了 SuperType
SubType.prototype = new SuperType();
SubType.prototype.getSubValue = function (){
    return this.subproperty;
};
var instance = new SubType();
alert(instance.getSuperValue()); //true
```
`SubType.prototype = new SuperType()`这句代码使得原来存在于 SuperType 的实例中的所有属性和方法，现在也存在于 SubType.prototype 中。使得instance的constructor指向了SuperType。
```js
console.log(instance.constructor===SuperType);//true
```
**总结：** 访问一个实例属性时，首先会在实例中搜索该属性。如果没有找到该属性，则会继续搜索实例的原型。在通过原型链实现继承的情况下，搜索过程就得以沿着原型链继续向上。在找不到属性或方法的情况下，搜索过程总是要一环一环地前行到原型链末端才会停下来。

就拿上面的例子来说，调用
instance.getSuperValue()会经历4个搜索步骤：

<ol>
    <li>搜索instance实例；</li>
    <li>搜索 SubType.prototype；</li>
    <li>搜索SuperType的实例；</li>
    <li>搜索 SuperType.prototype，最后一步才会找到该方法。</li>
</ol>

<Valine></Valine>
​    


​    