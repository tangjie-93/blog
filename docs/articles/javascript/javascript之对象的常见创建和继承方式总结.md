---
title: 对象的常见创建和继承方式
date: '2020-01-14'
type: 技术
tags: javascript
note: 主要是经常被问到这些知识点，而自己总是不能回答的很全面，所以在这里做一个总结，以便自己以后忘记的时候可以很好的复习。参考来源主要是 **<<javascript高级程序设计>>**
---
​		
​		主要是经常被问到这些知识点，而自己总是不能回答的很全面，所以在这里做一个总结，以便自己以后忘记的时候可以很好的复习。参考来源主要是 **<<javascript高级程序设计>>**
<img src="../../images/js对象的创建和继承.png" alt="暂无数据">
<h3>一、创建对象的几种方式</h3>
<h4>1、工厂模式</h4>

&#8195;&#8195;工厂模式虽然解决了创建多个相似对象的问题，**但是没有解决对象识别的问题**（即不知道一个对象的类型，不是new出来的）。

```js
function Person(name,age){
    let o=new Object();
    o.name=name;
    o.age=age;
    o.sayName=function(){
        console.log(this.name);
    }
    return o;
}
let p=Person("张三",23);
```

<h4>2、构造函数模式</h4>
与工厂模式的不同在于：

+ 1、没有显示的创建对象；
+ 2、直接将属性和方法添加到this对象上；
+ 3、没有return语句。   
```js
function Person(name,age){
    this.name=name;
    this.age=age;
    this.sayName=function(){
        console.log(this.name);
    }
}
let p=new Person("黎明",24);
let p2=new Person("张三",30);
```

&#8195;&#8195;关于new的作用可以参考我以前写的一篇关于[new](https://juejin.im/post/5ca72eef6fb9a05e233c937e)的作用的文章。构造函数虽然很好的解决了对象识别(知道实例对象所属类)的问题，但是它的**缺点在于每个实例都会创建一遍类中的方法**。    
**构造函数模式改进版**

```js
function Person(name,age){
    this.name=name;
    this.age=age;
    this.sayName=sayName
}
function sayName(){
    conaole.log(this.name);
}
```
&#8195;&#8195;使所有实例对象共享sayName这个全局方法，只需要创建一次就够了。但是它的**问题在于该方法只能被某个对象调用，同时如果对象需要很多方法，那么就需要定义很多个这样的全局方法**。

<h4>3、原型模式</h4>
&#8195;&#8195;prototype是通过调用构造函数而创建的那个实例对象的原型对象。该对象包含所有实例共享的属性和方法。

```js
//原型模式1
function Person(){}
Person.prototype.name="黎明";
Person.prototype.age=26;
Person.prototype.sayName=function(){
    console.log(this.name);
};
//原型模式2-以对象字面量的形式重写原型对象
function Person(){
}
Person.prototype={
    constructor:Person,
    name:"黎明";
    age:26;
    sayName:function(){
        console.log(this.name);
    };
}
```
**注意：**  
+ 1、原型模式2这种方式如果不指定constructor属性，constructor将默认指向Object对象。
+ 2、这种方式相当于重写了原型对象，会切断构造函数与最初原型之间的联系。（**切记实例对象中的__proto__指针指向的是构造函数的prototype，而不是构造函数本身**）

原型模式的缺点在于：
+ 1、它省略了为构造函数传递初始化参数，所以**所有实例在默认情况下都具有相同的属性值。**
+ 2、原型模式的属性都是共享的，会引发数据安全问题。

<h4>4、组合模式</h4>

&#8195;&#8195;使用构造函数和原型模式的组合模式，使我们在创建对象的最常见模式，是用来定义对象的一种默认模式。构造函数用于定义实例属性，原型模式用于定义方法和共享的属性。**优点在于：** 每个实例都有一份属于自己的实例属性，同时还共享着某些属性和方法，最大限度的节省了内存；同时还能向构造函数传递属于自己的参数。    

```js
function Person(name,age){
    this.name=name;
    this.age=age;
    this.frineds=['sd',"df"];
}
Person.prototype={
    Constructor:Person,
    sayName:function(){
        console.log(this.name);
    }
}
```
<h4>5、动态原型模式</h4>

&#8195;&#8195;把所有信息都封装在构造函数中，在构造函数里初始化原型（通过判断某个应该存在的方法是否存在，来决定是否初始化原型）。具有同时使用构造函数和原型的优点。

```js
function Person(name,age){
    this.name=name;
    this.age=age;
    if(typeof this.sayName !="function"){
        Person.prototype.sayName=function(){
            console.log(this.name);
        }
    }
}
```
<h4>6、寄生构造函数模式</h4>
&#8195;&#8195;该模式的基本思想创建一个函数来封装创建对象的代码，然后再返回创建的对象。该模式实际上就是工厂模式，只不过在实例化对象时又是用的new。 

```js
function Person(name,age){
    let o=new Object();
    o.name=name;
    o.age=age;
    o.sayName=function(){
        console.log(this.name);
    }
    return o;
}
Person.prototype.sayHello=function(){
    console.log("hello");
}
let p=new Person("张三",23);//寄生构造函数模式
let p2=Person("张三",23);//工厂模式
console.log(p instanceof Person);//false
console.log(p2 instanceof Person);//false
p.sayHello();//p.sayHello is not a function
p2.sayHello();
```
注意：
+ 1、返回的对象和构造函数或者说与构造函数的原型属性之间没有关系。不能使用instanceof来判断类型。
+ **2、构造函数在不返回值的情况下，默认会返回新对象实例，而通过在构造函数的末尾添加一个return语句，会重写调用构造函数时返回的值。**

<h4>7、稳妥构造函数模式</h4>

&#8195;&#8195;**稳妥对象**指的是没有公共属性，且其方法也不引用this的对象。稳妥对象适合用在一些禁用this和new的环境以及防止数据被其他应用程序改动的环境。使用稳妥构造函数模式创建的对象与构造函数也没有什么关系。稳妥构造函数模式与寄生构造函数模式的区别在于：
+ 1、创建的对象中的实例方法不使用this。

+ 2、不使用new操作符调用构造函数.

```js
    function Person(name,age){
        let obj=new Object();
        obj.sayName=function(){
            console.log(name);
        };
        return obj
    }
    let p=Person("张三",23);
```

&#8195;&#8195;这种模式只能通过在构造函数中添加实例方法来访问传到构造函数中的原始数据。

<h3>二、继承</h3>

<h4>1、原型链继承</h4>

&#8195;&#8195;原型链的基本实现就是让原型对象指向另一个对象的实例。原型链继承的基本思想就是利用原型让一个引用类型继承另一个引用类型的属性和方法。**原型链继承的本质是重写原型对象。**

```js
function SuperType(){
    this.property=true;
};
SuperType.prototype.getSuperValue=function(){
    return this.property;
};
function SubType(){
    this.subproperty=false;
}
//继承SuperType所有属性（包括实例属性和原型属性）
SubType.prototype=new SuperType();//原型链继承
SubType.prototype.getSubValue=function(){
    return this.subproperty;
};

let instance=new SubTYype();
console.log(instance.getSuperValue);//true
console.log(instance);
```

![](https://user-gold-cdn.xitu.io/2019/6/21/16b7ac0533987a7c?w=406&h=222&f=png&s=21116)
&#8195;&#8195;从上面的图片可以看出，instance具有了subproperty的实例属性，getSubValue和property以及getSuperValue的原型属性(即instance的__proto__指向SuperType的原型对象，SuperType的__proto__又指向SuperType的原型对象)。并且它的constructor目前指向的是SuperType。
注意：
+ 1、instance是SubType、SuperType和Object的实例。使用instanceof来判断都会得到true。
+ 2、**子类型在需要覆盖超类中的某个方法时或者说添加超类中不存在的某个方法时，给原型添加的代码一定要放在替换原型(SubType.prototype=new SuperType())的语句之后。**
+ 3、通过原型链是实现继承后，不能使用对象字面量创建原型方法，这样会重写原型链。会导致(SubType.prototype=new SuperType())无效。

 **原型链继承的问题：**
 + 1、原型链中的引用类型的原型属性会被所有实例共享。
 + 2、在创建子类型的实例时,不能向超类的构造函数传递参数。

<h4>2、借用构造函数模式</h4>

&#8195;&#8195;基本思想是在子类型构造函数的内部调用超类构造函数(也称为伪造继承和经典继承)。优点在于**该模式可以在子类构造函数中向超类构造函数传递参数**。它的缺点在于——**方法都在构造函数内定义，函数复用无从谈起。**

```js
function SuperType(name){
    this.colors=["red","blue"];
    this.name=name;
}
function SubType(name){
    //继承SuperType的实例属性和方法，本质上是改变超类中this的指向
    SuperType.call(this,name);
}
let instance=new SubType("black");
console.log(instance.colors);// ["red", "blue"]
console.log(instance.name);// black
```

<h4>3、组合继承</h4>

&#8195;&#8195;是原型链和借用构造函数模式的组合。也称为`伪经典继承`。基本思想是通过原型链实现对原型属性和方法的继承，通过构造函数来实现对实例属性的继承。是最常用的继承模式，不足之处在于调用了两次超类,对超类的实例属性继承了两次。
```js
function SuperType(name){
    this.colors=["red","blue"];
    this.name=name;
}
function SubType(name){
    //继承SuperType;
    SuperType.call(this,name);
}
SubType.prototype=new SuperType();
SubType.prototype.constructor=SubType;
```
<h4>4、原型式继承</h4>

&#8195;&#8195;基本思想新建一个对象,然后新建一个函数,将该对象作为参数传入函数,在该函数中新建一个构造函数,并将该对象赋值给该构造函数的原型对象，最后返回该构造函数的实例对象。

&#8195;&#8195;该方法的规范式写法就是**Object.create(obj,propObj)**,第一个参数为作为新对象原型的对象；第二个对象为给新对象添加额外属性的对象。**该模式其实就是创建一个对象来作为其他构造函数的原型对象，然后创建一个函数来返回该构造函数的实例对象。** 该模式的缺点就是原型属性会被所有实例对象共享。

```js
function object(o){
    function F(){};
    F.prototype=o;
    return new F();
}
let person={
    name:"nicholas",
    friends:["james","jordan"]
}
let p=object(person);
let p2=object(person);
p.friends.push("kiddy");
console.log(p.friends);// ["james", "jordan", "kiddy"]
console.log(p2.friends);// ["james", "jordan", "kiddy"]

let p3=Object.create(person,{
    name:{
        age:"james"
    }
})
console.log(p3);
```
<img src="https://user-gold-cdn.xitu.io/2019/6/22/16b7afa0cbd369ba?w=1062&h=157&f=png&s=17348" alt="暂无数据">
        
<h4>5、寄生式继承</h4>

&#8195;&#8195;寄生式继承的基本思路跟寄生构造函数和工厂模式类似，即创建一个仅用于封装过程的函数，该函数在内部以某种方式来增强对象。**继承式继承实际是在原型式继承的基础上多包装了一层函数。其实就是对Object.create()的原理的实现。**

```js
function object(o){
    function F(){};
    F.prototype=o;
    return new F();
}
function createAnother(o){
    let clone=object(o);
    //添加实例属性
    clone.sayHi=function(){
        console.log("hi");
    }
    return clone;
}
let person={
    name:"nicholas",
    friends:["james","jordan"]
}
let p=createAnother(person);
let p2=Object.create(person,{sayHi:{
    value:function(){
        console.log("hi");
    }
}});
console.log(p);
console.log(p2);
```
从下面的图片中可以看出p和p2的输出是完全一样的。
<img src="https://user-gold-cdn.xitu.io/2019/6/22/16b7b01ead8d5b3a?w=1070&h=309&f=png&s=34135" alt="暂无数据">

<h4>6、寄生组合式继承</h4> 

&#8195;&#8195;组合继承的不足在于调用了两次超类。一次在创建子类原型时(**原型链**)，另一次是在子类型构造函数内部(**借用构造函数**)。   
&#8195;&#8195;寄生组合式继承的基本思想是：通过借用构造函数来继承属性，通过原型链的混成形式来继承方法，是对组合式继承的一个优化。 是实现基于类型继承的最有效方式。

```js
function inheritPrototype(SubType,SuperType){
    let prototype=Object(SuperType.prototype);
    SubType.prototype=prototype;
    SubType.prototype.constructor=SubType;
}
function SuperType(name){
    this.name=name;
    this.colors=["red","blue","gren"];
}
SuperType.prototype.sayName=function(){
    console.log(name);
}
function SubType(name,age){
    //继承实例属性
    SuperType.call(this,name);
    this.age=age;
}
//继承超类的原型属性
inheritPrototype(SubType,SuperType)
SubType.prototype.sayAge=function(){
    console.log(this.age);
}
```
<Valine></Valine>
