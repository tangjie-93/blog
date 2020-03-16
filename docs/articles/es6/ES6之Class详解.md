---
title: ES6之Class详解
date: '2020-03-15'
type: 技术
tags: es6
note: ES6之Class详解
---
<h4>1、class的基本语法</h4>

&#8195;新的class写法只是**让对象原型的写法更加清晰、更像面向对象编程的语法** 而已。ES6 的类，完全可以看作构造函数的另一种写法。
事实上，**类的所有方法都定义在类的prototype属性上面。**

>1、ES6 的类，完全可以看作构造函数的另一种写法。类本身就指向构造函数。
```js       
Point === Point.prototype.constructor // true
```       
>2、类的所有方法都定义在类的prototype属性上面。 

>3、在类的实例上面调用方法，其实就是调用原型上的方法。
```js       
p1.constructor === Point.prototype.constructor // true

function Point(x, y) {
    this.x = x;
    this.y = y;
}
Point.prototype.toString = function () {
    return '(' + this.x + ', ' + this.y + ')';
};
var p = new Point(1, 2);
//改成类的写法
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    toString() {
        return '(' + this.x + ', ' + this.y + ')';
    }
}
typeof Point // "function"
Point === Point.prototype.constructor // true 类本身就指向构造函数。
var p1=new Point(2,4);
p1.constructor === Point.prototype.constructor // true

Point.prototype.constructor === Point // true
Object.keys(Point.prototype)// []
```       
&#8195;&#8195;上面代码中，**toString方法是Point类内部定义的方法，它是不可枚举的**。这一点与 ES5 的行为不一致。

<h4>2、	constructor方法</h4>

&#8195;&#8195;`constructor`方法默认返回实例对象（即`this`），完全可以指定返回另外一个对象。类必须使用`new`调用，否则会报错。
```js
class Foo {
    constructor() {
        return Object.create(null);
    }
}
new Foo() instanceof Foo
// false
```        
<h4>3、	类的实例</h4>

&#8195;&#8195;与 ES5 一样，实例的属性除非显式定义在其本身（即定义在this对象上），否则都是定义在原型上（即定义在class上）。
```js
//定义类
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    toString() {
        return '(' + this.x + ', ' + this.y + ')';
    }
}
var point = new Point(2, 3);
point.toString() // (2, 3)
point.hasOwnProperty('x') // true
point.hasOwnProperty('y') // true
point.hasOwnProperty('toString') // false
point.__proto__.hasOwnProperty('toString') // true
//toString是原型上的方法，构造方法中的才是实例属性
```       
&#8195;&#8195;与 ES5 一样，类的所有实例共享一个原型对象。
```js
var p1 = new Point(2,3);
var p2 = new Point(3,2);
p1.__proto__ === p2.__proto__
//true
```       
<h4>4、取值函数（getter）和存值函数（setter）</h4>

&#8195;&#8195;在“类”的内部可以使用get和set关键字，对某个属性设置存值函数和取值函数，拦截该属性的存取行为。

<h4>5、	属性表达式</h4>

```js
let methodName = 'getArea';
class Square {
    constructor(length) {
    // ...
    }
    [methodName]() {
    // ...
    }
}
```       
<h4>6、	Class表达式</h4>

```js
const MyClass = class Me {
    getClassName() {
        return Me.name;
    }
};
```
&#8195;&#8195;这个类的名字是Me，但是Me只在 Class 的内部可用，指代当前类。在 Class 外部，这个类只能用MyClass引用。
```js
let inst = new MyClass();
inst.getClassName() // Me
Me.name // ReferenceError: Me is not defined
```        
&#8195;&#8195;如果类的内部没用到的话，可以省略Me。
```js
const MyClass = class { /* ... */ };
```       
&#8195;&#8195;采用 Class 表达式，可以写出立即执行的 Class。
```js
let person = new class {
    constructor(name) {
        this.name = name;
    }
    sayName() {
        console.log(this.name);
    }
}('张三');
person.sayName(); // "张三" 
```       
&#8195;&#8195;**class的注意事项**  
&#8195;&#8195;1、严格模式。类和模块的内部，默认就是严格模式。     
&#8195;&#8195;2、不存在提升。类不存在变量提升。  
&#8195;&#8195;3、`name`属性总是返回紧跟在`class`关键字后面的类名。    
&#8195;&#8195;4、`Generator` 方法。`Symbol.iterator`方法返回一个Foo类的默认遍历器，for...of循环会自动调用这个遍历器。  
```js
class Foo {
    constructor(...args) {
        this.args = args;
    }
    * [Symbol.iterator]() {
        for (let arg of this.args) {
            yield arg;
        }
    }
}
for (let x of new Foo('hello', 'world')) {
    console.log(x); // hello，world
}
```
&#8195;&#8195;5、	This的指向。
**类的方法内部如果含有this，它默认指向类的实例。** 但是，必须非常小心，一旦单独使用该方法，很可能报错。`this`会指向该方法运行时所在的环境（由于 class 内部是严格模式，所以 this 实际指向的是undefined）
```js
class Logger {
    printName(name = 'there') {
        this.print(`Hello ${name}`);
    }
    print(text) {
        console.log(text);
    }
}
const logger = new Logger();
const { printName } = logger;
printName(); // TypeError: Cannot read property 'print' of undefined 本来是实例的方法，但是此时printName()不是实例调用的，所以this指向不明，默认为undefined
```       
&#8195;&#8195;一个比较简单的解决方法是，在构造方法中绑定this，这样就不会找不到print方法了。
```js
class Logger {
    constructor() {
        this.printName = this.printName.bind(this);
    }
    // ...
}
```
<h4>7、	静态方法</h4>

&#8195;&#8195;如果在一个方法前，加上`static`关键字，就表示该方法不会被实例继承，而是直接通过类来调用，这就称为“静态方法”。
如果静态方法包含this关键字，**这个this指的是类，而不是实例**。静态方法可以与非静态方法重名。
```js
class Foo {
    static bar() {
        this.baz();
    }
    static baz() {
        console.log('hello');
    }
    baz() {
        console.log('world');
    }
}
Foo.bar() // hello
```
&#8195;&#8195;父类的静态方法，可以被子类继承。
```js
class Foo {
    static classMethod() {
        return 'hello';
    }
}
class Bar extends Foo {}
Bar.classMethod() // 'hello'
```        
&#8195;&#8195;静态方法也是可以从super对象上调用的。
```js
class Foo {
    static classMethod() {
        return 'hello';
    }
}
class Bar extends Foo {
    static classMethod() {
        return super.classMethod() + ', too';
    }
}
Bar.classMethod() // "hello, too"
```       
<h4>8、	实例属性的新写法</h4>

&#8195;&#8195;这个属性也可以定义在类的最顶层，其他都不变。这种新写法的好处是，所有实例对象自身的属性都定义在类的头部，看上去比较整齐，一眼就能看出这个类有哪些实例属性。
```js
class IncreasingCounter {
    _count = 0;
    get value() {
        console.log('Getting the current value!');
        return this._count;
    }
    increment() {
        this._count++;
    }
}
```       
<h4>9、	静态属性</h4>
```js
class MyClass {
    static myStaticProp = 42;
    constructor() {
        console.log(MyClass.myStaticProp); // 42
    }
}
```
<h4>10、	私有方法和私有属性</h4>

&#8195;&#8195;1、	将私有方法移出模块，因为模块内部的所有方法都是对外可见的。
```js
class Widget {
    foo (baz) {
        bar.call(this, baz);
    }
    // ...
}
function bar(baz) {
    return this.snaf = baz;
}
```
&#8195;&#8195;2、利用`Symbol`值的唯一性，将私有方法的名字命名为一个`Symbol`值。一般情况下无法获取到它们，因此达到了私有方法和私有属性的效果。但是也不是绝对不行，Reflect.ownKeys()依然可以拿到它们。
```js
const bar = Symbol('bar');
const snaf = Symbol('snaf');
export default class myClass{
    // 公有方法
    foo(baz) {
        this[bar](baz);
    }
    // 私有方法
    [bar](baz) {
        return this[snaf] = baz;
    }
    // ...
};
```        
<h4>11、new.target()</h4>

&#8195;&#8195;ES6 为new命令引入了一个new.target属性，该属性一般用在构造函数之中，**返回new命令作用于的那个构造函数** 。如果构造函数不是通过new命令或Reflect.construct()调用的，new.target会返回undefined，因此**这个属性可以用来确定构造函数是怎么调用的。** Class 内部调用new.target，返回当前Class。在函数外部，使用new.target会报错。
```js
function Person(name) {
    if (new.target !== undefined) {
        this.name = name;
    } else {
        throw new Error('必须使用 new 命令生成实例');
    }
}
// 另一种写法
function Person(name) {
    if (new.target === Person) {
        this.name = name;
    } else {
        throw new Error('必须使用 new 命令生成实例');
    }
}
var person = new Person('张三'); // 正确
var notAPerson = Person.call(person, '张三');  // 报错 
 ```       
 &#8195;&#8195;**子类继承父类时，new.target会返回子类。主要是看new后面的类是哪个**  
```js
class Rectangle {
constructor(length, width) {
    console.log(new.target === Rectangle);
    // ...
    }
}
class Square extends Rectangle {
    constructor(length，width) {
    super(length, width);
    }
}
var c=new Rectangle(1,2);
var obj = new Square(3); // 输出 false
```    
<h4>12、 类的继承</h4>

&#8195;&#8195;Class 可以通过extends关键字实现继承，这比 ES5 的通过修改原型链实现继承，要清晰和方便很多。
```js
class ColorPoint extends Point {
    constructor(x, y, color) {
        super(x, y); // 调用父类的constructor(x, y)
        this.color = color;
    }
    toString() {
        return this.color + ' ' + super.toString(); // 调用父类的toString()
    }
}
```       
>1、	super关键字，它在这里表示父类的构造函数，用来新建父类的this对象。

>2、	子类必须在`constructor`方法中调用super方法，否则新建实例时会报错。这是因为子类自己的this对象，必须先通过父类的构造函数完成塑造，得到与父类同样的实例属性和方法，然后再对其进行加工，加上子类自己的实例属性和方法。**如果不调用super方法，子类就得不到this对象。 或者是不写constructor(){}，写了必须写super()。**
```js
class Point { /* ... */ }
class ColorPoint extends Point {
    constructor() {}
}
let cp = new ColorPoint(); // ReferenceError
————————————————————————————————————————————————————————————
class ColorPoint extends Point {}
// 等同于
class ColorPoint extends Point {
    constructor(...args) {
        super(...args);
    }
}
```
>3、	ES5 的继承，实质是先创造子类的实例对象`this`，然后再将父类的方法添加到`this`上面`（Parent.apply(this)`）。ES6 的继承机制完全不同，实质是先将父类实例对象的属性和方法，加到this上面（所以必须先调用super方法），然后再用子类的构造函数修改`this`。   

>4、	在子类的构造函数中，只有调用super之后，才可以使用this关键字，否则会报错。这是因为子类实例的构建，基于父类实例，只有super方法才能调用父类实例。

>5	子类实例对象cp同时是ColorPoint和Point（父类）两个类的实例，这与 ES5 的行为完全一致。

>6	父类的静态方法，也会被子类继承。
<h4>13、	Object.getPrototypeOf() </h4>

&#8195;&#8195;Object.getPrototypeOf方法可以用来从子类上获取父类。可以使用这个方法判断，一个类是否继承了另一个类。
```js
Object.getPrototypeOf(ColorPoint) === Point// true
```      
<h4>14、	Super关键字</h4>

>1、	**super作为函数调用时，代表父类的构造函数** 。ES6 要求，子类的构造函数必须执行一次super函数。
super虽然代表了父类A的构造函数，但是返回的是子类B的实例。
**作为函数时，super()只能用在子类的构造函数之中，用在其他地方就会报错。**
```js
class A {
    constructor() {
        console.log(new.target.name);//new.targe构造函数
    }
}
class B extends A {
    constructor() {
        super();
    }
}
new A() // A
new B() // B
```
>2、	**super作为对象时，在普通方法中，指向父类的原型对象；在静态方法中，指向父类**。所以定义在父类实例上的方法或属性，是无法通过super调用的。
```js
class A {
    p() {
        return 2;
    }
}
class B extends A {
    constructor() {
        super();
        console.log(super.p()); // 2
    }
}
let b = new B();
```       
&#8195;&#8195;**在子类普通方法中通过super调用父类的方法时，方法内部的this指向当前的子类实例。**
```js
class A {
    constructor() {
        this.x = 1;
    }
    print() {
        console.log(this.x);
    }
}
class B extends A {
    constructor() {
        super();
        this.x = 2;
    }
    m() {
        super.print();
    }
}
let b = new B();
b.m() // 2
```       
&#8195;&#8195;由于this指向子类实例，所以如果通过super对某个属性赋值，这时super就是this，赋值的属性会变成子类实例的属性。
```js
class A {
    constructor() {
        this.x = 1;
    }
}
class B extends A {
    constructor() {
        super();
        this.x = 2;
        super.x = 3;//此时的super相当于this
        console.log(super.x); // undefined
        console.log(this.x); // 3
    }
}
let b = new B();
```        
&#8195;&#8195;而当读取super.x的时候，读的是A.prototype.x，所以返回undefined。
```js
class A {
    constructor() {
        this.x = 1;
    }
    static print() {
        console.log(this.x);
    }
}
class B extends A {
    constructor() {
        super();
        this.x = 2;
    }
    static m() {
        super.print();
    }
}
B.x = 3;
B.m() // 3
```       
&#8195;&#8195;静态方法B.m里面，super.print指向父类的静态方法。这个方法里面的this指向的是B，而不是B的实例。

<h4>15、	类的 prototype 属性和__proto__属性</h4>

 &#8195; &#8195;ES5 实现之中，每一个对象都有__proto__属性，指向对应的构造函数的prototype属性。
```js
instance.__proto__===A.prototype//instance是A的实例
```   
  &#8195; &#8195;`Class`作为构造函数的语法糖，同时有`prototype`属性和`__proto__`属性，因此同时存在两条继承链。    
>（1）子类的`__proto__`属性，**表示构造函数的继承，** 总是指向父类。  
>（2）子类`prototype`属性的`__proto__`属性，**表示方法的继承，**总是指向父类的`prototype`属性。
```js
class A {}
class B extends A {}
console.log(B.__proto__ === A) // true,
console.log(B.prototype.__proto__ === A.prototype )// true,
// 等同于
Object.create(A.prototype);
```       
 &#8195; &#8195;作为一个对象，子类（B）的原型（__proto__属性）是父类（A）；作为一个构造函数，子类（B）的原型对象（prototype属性）是父类的原型对象（prototype属性）的实例。
 
<h4>16、实例的 __proto__ 属性</h4>

&#8195;&#8195;子类实例的`__proto__`属性的`__proto__`属性，指向父类实例的`__proto__`属性。也就是说，子类的原型的原型，是父类的原型。(p2是子类，p1是父类)
```js
p2.__proto__.__proto__ === p1.__proto__ // true
//解析：
p2.__proto__===p2的类.prototype；
p2的类.prototype.__proto__===p2的类的父类的.prototype
p1.__proto__===p2的类的父类的.prototype。

&#8195;&#8195;因此，通过子类实例的__proto__.__proto__属性，可以修改父类实例的行为。

p2.__proto__.__proto__.printName = function () {
    console.log('Ha');
};
p1.printName() // "Ha"
```