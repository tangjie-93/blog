---
title: typescript基本知识点总结
date: '2020-01-14'
type: 技术
tags: typescript
note: typescript基本知识点总结
---
## 1、基本类型和扩展类型

&#8195;&#8195;`ts` 和 `js` 共享相同的基本类型，还有一些其独有的类型如`元组、枚举、和any及void`。
+ 1、布尔类型
```typescript
    let flag:boolean=false;
```
+ 2、数字类型
```typescript
    let count:number=4;
```
+ 3、字符串
```typescript
    let str:string="hello world";
```
+ 4、数组
```typescript
    let list:number[]=[1,23,34];
    let str:string[]=["42q4","rtrwet","etetrs"]
    //数组泛型 Array<元素类型>
    let list:Array<number>=[1,2,3]
```
+ 5、元组
```typescript
    //定义
    let x: [string, number]=["hello",10];
    //获取
    console.log(x[0].slice())
    console.log(x[1])
    //当访问一个越界的元素，会使用联合类型（此处为string|number）替代
    x[3]="world";//ok
    x[4]=43;//ok

```
+ 6、枚举
```typescript
    enum Color {Red,Blue};
    //默认索引从0开始，也可以给枚举值手动赋值
    let c:Color=Color.Red
    console.log(c);//0
    console.log(Color);//Object {0:Red,1:Blue}
```
+ 7、任意值(any)
```typescript
    let str:any="hello";
    str=4;
    str.toString();//可以调用任意方法
    let obj:Object=4;
    obj.toFixed(2);//error Object不存在该方法

```
+ 8、空值（void）

  `void`类型与`any`类型相反，表示没有任何类型。
```typescript
    function sayName():void{
        console.log("test");
        //函数没有返回值
    }
    let name:void=undefined;
```
+ 9、Null和undefined

    默认情况下null和undefined是所有类型的子类型。如果编译器不能去除`null和undefined`，可以使用类型断言手动去除。语法是添加`!`后缀。
```typescript
    let u: undefined = undefined;
    let n: null = null;
    let n:string=null;
    let num:number=null;
```
+ 10、类型断言

  类型断言有两种形式。一种是**尖括号(<>)**语法。一种是**as语法**。
```typescript
    let str:any="test";
	//
    let len:number=(<string>str).length;
    let len:number=(str as string).length;
    let l:number=str.length;//也是可以的
```
+ 11、never

  ​		never类型表示那些**永不存在的值的类型**。never类型是那些总会抛出异常或者根本就`不会有返回值的函数表达式或者箭头函数的返回值类型`。

  ​		never类型是任何类型的子类型，可以赋值给任何类型；但是没有任何类型是never额子类型或者可以赋值给never类型（除了never本身之外）。

```ts
    //返回never的函数必须存在无法到达的终点
    function error(msg:string):never{
        throw new Erorr(msg)
    }
```

## 2、变量声明

+ 1、默认值
```typescript
    //默认值可以让我们在属性为undefined时使用缺省值
    function sayName(obj:{a:string,b?:number}){
        let {a,b=100}=obj;
    }
     //默认值可以让我们在没有传递该形参时赋予默认值
    function sayName(obj:{a:string="123",b?:number}){
        let {a,b=100}=obj;
    }
```
+ 2、const和readonly的区别

  const用于声明变量，定义后的变量不能赋值。readonly用于修饰属性，被修饰的属性只可读。

## 3、接口

&#8195;&#8195;接口的作用是为了给这些类型命名和为我们的代码或者第三方代码定义契约。
```typescript
    function printLabel(labelledObj: { name: string }) {
        console.log(labelledObj.name);
    }

    let myObj = { size: 10, name: "james" };
    printLabel(myObj); 
    //接口就好像一种描述
    interface labelledvalue{
        label:string;
    }
    function printLabel(labelledObj:labelledvalue){
        console.log(labelledObj.label);
    }
    let myObj = { size: 10, label: "Size 10 Object" };
    printLabel(myObj);
```
**1、可选属性**

&#8195;&#8195;即给函数传入的参数对象只有部分赋值了。
```typescript
    interface SquareConfig{
        color?:string;//？表示可选
        width?:number;
    }
    //{color:string;area:number}表示返回类型
    function createSquare(config:SquareConfig):void{
        let newSquare={color:"white",area:100};
        if(config.color){
            newSquare.color=config.color;
        }
        if(config.width){
            newSquare.area=config.width*config.width;
        }
        return newSquare;
    }
    let mySquare=createSquare({color:"black"});
```
**2、只读属性**

```typescript
    interface Point{
        readonly x:number;
        readonly y:number;
    }
    let p1:Point={x:10,y:20};//此时p1是只读的。

    let a:number[]=[2,3,4,56,67];
    let ra:ReadonlyArray<number>=a;//此时1也只是可读的
    //但是可以通过类型断言重写
    a=ra as number[];

```
**3、额外的属性检查**

```typescript
    interface SquareConfig {
        color?: string;
        width?: number;
    }

    function createSquare(config: SquareConfig): { color: string; area: number } {
        // ...
    }
    //类型“{ colour: string; width: number; }”的参数不能赋给类型“SquareConfig”的参数。
    let mySquare = createSquare({ colour: "red", width: 100 });
    //想要绕过这些检查，有很多种方法

    //方法1、可以使用类型断言，这是最简单的方式
    let mySquare = createSquare({ colour: "red", width: 100 } as SquareConfig);

    //方法2、添加一个字符串索引签名
    interface SquareConfig {
        color?: string;
        width?: number;
        [propName: string]: any;
    }

    //方法3、将该对象赋值给另一个变量
    let squareOptions = { colour: "red", width: 100 };
    let mySquare = createSquare(squareOptions);
```
**4、函数类型**

&#8195;&#8195;接口除了描述带有属性的普通对象外，接口也可以描述函数类型。
```typescript
    interface searchFunc{
        (source:string,subString:string):boolean;
    }
    let search:searchFunc;
    //对于函数类型的类型检查来说，函数的参数名不需要跟接口里定义的名字相匹配。
    search=function(src:string,subString:string):boolean{
        let index=src.search(subString);
        return index>-1?true:false;
    }
    //如果不指定类型，Typescript的类型系统会推断出参数类型，因为函数直接赋值给了SearchFunc类型变量。函数的返回值类型是通过其返回值推断出来的（此例是false和true）
    search=function(src,subString):boolean{
        let index=src.search(subString);
        return index>-1?true:false;
    }

```
**5、可索引的类型**

&#8195;&#8195;接口支持两种索引签名：**字符串和数字**。字符串索引签名能很好的描述 `dictionary` 模式，并且也会保证所有属性与其返回值类型相匹配。

**注意：** 可以同时使用两种类型的索引，**数字索引的返回值必须是字符串索引返回值类型的子类型**

+ 1、字符串索引签名

```ts
interface StringArray{
    [index:number]:string;//表示当用number去索引StringArray类型的数据时会得到string类型的返回值。
}
let arr:StringArray=["test","red"];
let str=arr[0];
console.log(str); //test
```

+ 2、字符串索引和数字索引同时存在

```ts
class Animal{
    name:string;
}
class Dog extends Animal{
    breed:string;
}
interface cat{
    [x:number]:Animal;//报错，因为Animal并不是Dog的子类型，因为数字索引的返回值必须是字符串索引返回值类型的子类型
    [x:string]:Dog
}
```

+ 3、字符串索引签名能很好的描述dictionary模式，并且也会保证所有属性与其返回值类型相匹配

```ts
 interface NumberDictionary {
     [index: string]: number;
     length: number;    // 可以，length是number类型
     name: string       // 错误，`name`的类型不是索引类型的子类型
 }
```

+ 4、可以将索引签名设置为只读

```ts
interface ReadonlyStringArray {
    readonly [index: number]: string;
}
let myArray: ReadonlyStringArray = ["Alice", "Bob"];
myArray[2] = "Mallory"; // 报错
```

****

**6、类类型**

**1、实现接口**

```typescript
    interface ClockInterface {
        currentTime: Date;
        setTime(d: Date);
    }

    class Clock implements ClockInterface {
        currentTime: Date;
        setTime(d: Date) {
            this.currentTime = d;
            return this.currentTime;
        }
        constructor(h: number, m: number) { }
    }
    let clock =new Clock(5,6);
    console.log(clock.setTime(new Date()));
```
**2、类静态部分和实例部分的区别**

​		当一个类实现一个接口时，只对其实例部分进行类型检查。而constructor存在类的静态部分，所以不在检查的范围内。

```ts
//为构造函数所有
interface ClockConstructor {
    new (hour: number, minute: number): ClockInterface;
}
//为实例方法所用
interface ClockInterface {
    tick();
}

function createClock(ctor: ClockConstructor, hour: number, minute: number): ClockInterface {
    return new ctor(hour, minute);
}

class DigitalClock implements ClockInterface {
    constructor(h: number, m: number) { }
    tick() {
        console.log("beep beep");
    }
}
class AnalogClock implements ClockInterface {
    constructor(h: number, m: number) { }
    tick() {
        console.log("tick tock");
    }
}

let digital = createClock(DigitalClock, 12, 17);
let analog = createClock(AnalogClock, 7, 32);
```

**3、继承（扩展）接口**

```ts
interface Shape {
    color: string;
}
interface PenStroke {
    penWidth: number;
}

interface Square extends Shape, PenStroke {
    sideLength: number;
}

let square = <Square>{};
square.color = "blue";
square.sideLength = 10;
square.penWidth = 5.0;
```

----

## 4、类

&#8195;&#8195;成员默认是公有public的，当成员被标记为private时，就不能再声明它的类的外部访问。标记为protected的成员可以在派生类中访问。如果constructor也被标识为protected时，则该类不能被实例化，只能在该类的子类中实例化。

**1、protected修饰符**

```ts
 class Person{
     protected name:string;
     //该类不能在包含它的类外被实例化，但是能被继承
     protected constructor(name:string){
         this.name=name
     }
 }
class Employ extends Person{

    private department:string;
    constructor(name,department){
        super(name);
        this.department=department;
    }
}

let emp=new Employ("james","研发部");
let p=new Person("james");//报错
```

**2、readonly 修饰符(只读属性必须在声明时或构造函数里被初始化)**

```ts
 class Person{
     readonly name:string;
     readonly count:number=8;
     constructor(name:string){
         this.name=name;
     }
 }
let dad = new Octopus("Man with the 8 strong legs");
dad.name = "Man with the 3-piece suit"; // 错误! name 是只读的.
```

**3、参数属性**

​		参数属性通过给构造函数参数添加一个访问限定符来声明。在构造函数里使用`private name: string`来创建和初始化一个成员，把声明和赋值合并至一处

```ts
class Animal {
    constructor(private name: string) { }
    move(distanceInMeters: number) {
        console.log(`${this.name} moved ${distanceInMeters}m.`);
    }
}
```

**4、静态属性**

```ts
class Grid {
    static origin = {x: 0, y: 0};
    calculateDistanceFromOrigin(point: {x: number; y: number;}) {
        let xDist = (point.x - Grid.origin.x);
        let yDist = (point.y - Grid.origin.y);
        return Math.sqrt(xDist * xDist + yDist * yDist) / this.scale;
    }
    constructor (public scale: number) { }
}
```

**5、抽象类 是其他类继承的基类，一般不会被实例化。抽象类可以包含成员的实现细节。**

```ts
abstract class Animal { //抽象类
    abstract makeSound(): void;//抽象方法，不包含具体实现，必须在派生类中实现。
    move(): void {
        console.log('roaming the earch...');
    }
}
```

**6、存取器 通过getters/setters来截取对对象成员的访问。 它能帮助你有效的控制对对象成员的访问。**

```ts
let passcode = "secret passcode";

class Employee {
    private _fullName: string;
    get fullName(): string {
    return this._fullName;
}

set fullName(newName: string) {
    if (passcode && passcode == "secret passcode") {
        this._fullName = newName;
    }
    else {
        console.log("Error: Unauthorized update of employee!");
    }
}
    }

let employee = new Employee();
employee.fullName = "Bob Smith";
if (employee.fullName) {
    alert(employee.fullName);
}
```

---

## 5、函数

**1、为函数定义类型**

```typescript
    
    function add(x:number,y:number):number{
        return x+y;
    }
    let myAdd = function(x:number,y:number):number{
        return x+y;
    }

    
```
**2、书写完整函数类型 函数类型包括参数类型和返回值类型。**

```ts
    let myAdd: (baseValue:number, increment:number) => number =
    function(x: number, y: number): number { return x + y; };
```

**3、可选参数（？）和默认参数（提前给参数赋值）**

```ts
//带默认值的参数不需要放在必须参数的后面。如果带默认值的参数出现在必须参数前面，用户必须明确的传入undefined值来获得默认值。
function buildName(firstName="test", lastName?: string) {
    if (lastName)
        return firstName + " " + lastName;
    else
        return firstName;
}

let result1 = buildName("Bob");  // works correctly now
let result2 = buildName("Bob", "Adams", "Sr.");  // error, too many parameters
let result3 = buildName("Bob", "Adams");  // ah, just right
```
**4、剩余参数**

```ts
function buildName(firstName: string, ...restOfName: string[]) {
	return firstName + " " + restOfName.join(" ");
}

let employeeName = buildName("Joseph", "Samuel", "Lucas", "MacKinZie");
```

**5、重载**

```ts
let suits = ["hearts", "spades", "clubs", "diamonds"];
//重载时只需要定义函数就行，不用实现
function pickCard(x: {suit: string; card: number; }[]): number; //重载1
function pickCard(x: number): {suit: string; card: number; };//重载2
function pickCard(x): any {
    // Check to see if we're working with an object/array
    // if so, they gave us the deck and we'll pick the card
    if (typeof x == "object") {
        let pickedCard = Math.floor(Math.random() * x.length);
        return pickedCard;
    }
    // Otherwise just let them pick the card
    else if (typeof x == "number") {
        let pickedSuit = Math.floor(x / 13);
        return { suit: suits[pickedSuit], card: x % 13 };
    }
}
```
**6、this**

&#8195;&#8195;在函数式编程中，直接在函数中调用`this`会报错，此时需要提供一个显示的`this`参数，该参数是一个假的参数，出现在参数列表的最前面。或者使用箭头函数，来让`this`指向其外层作用域中的`this`。

```ts
function debounce(fn:()=>void,immediate=true,time=300){
    let timer:any=null;
    return function (this:any,...args:any){
        timer&&clearTimeout(timer);
        let result;
        if(immediate){
            //time时间后，才能再次调用
            !timer&&result=fn.apply(this.args);
            timer=setTimeout(()=>{
                timer=null;
            },time)
        }else{
            timer=setTimeout(()=>{
                timer=null;
                result=fn.apply(this,args);
            },time)
        }
        return result;
    }
}
```

----

## 6、泛型

使用泛型可以创建重用的组件，可以支持多种数据类型。

```typescript
function identity<T>(arg: T): T {
    return arg;
}
```

**使用泛型的两种方法。**

+ 传入所有的参数，包含类型参数。

  ```ts
  let output = identity<string>("myString");  // type of output will be 'string'
  ```

+ 利用类型推导——编译器会根据传入的参数自动的帮助我们确定`T`的类型。

  ```ts
  let output = identity("myString");  // type of output will be 'string'
  ```

**1、使用泛型变量**

```ts
function loggingIdentity<T>(arg: T[]): T[] {
    console.log(arg.length);  // Array has a .length, so no more error
    return arg;
}
//效果同上
function loggingIdentity<T>(arg: Array<T>): Array<T> {
    console.log(arg.length);  // Array has a .length, so no more error
    return arg;
} 
```

**2、泛型接口**

```ts
interface GenericIdentityFn {
    <T>(arg: T): T;
}

function identity<T>(arg: T): T {
    return arg;
}

let myIdentity: GenericIdentityFn = identity;

//把非泛型函数签名作为泛型类型的一部分
interface GenericIdentityFn<T> {
    (arg: T): T;
}

function identity<T>(arg: T): T {
    return arg;
}

let myIdentity: GenericIdentityFn<number> = identity;
```
**3、泛型类**

​		泛型类指的是实例部分的类型，类的静态属性不能使用这个泛型类型。

```ts
class GenericNumber<T> {
    zeroValue: T;
    add: (x: T, y: T) => T;
}

let myGenericNumber = new GenericNumber<number>();
myGenericNumber.zeroValue = 0;
myGenericNumber.add = function(x, y) { return x + y; };
```

**4、泛型约束**

```ts
interface Lengthwise {
    length: number;
}
//没有限制之前，T可以是任何类型(any),约束之后T必须有length属性
function loggingIdentity<T extends Lengthwise>(arg: T): T {
    console.log(arg.length);  // Now we know it has a .length property, so no more error
    return arg;
}
```

+ 1、在泛型约束中使用类型参数

  ```js
  function getProperty(obj:T,key:K){
      return obj[key];
  }
  let obj={a:1,b:2,c:3};
  getProperty(obj,'a');
  ```

+ 2、在泛型里使用类类型

  ```ts
  //使用泛型创建工厂函数，引用构造函数的类类型
  function create<T>(c: {new(): T; }): T {
      return new c();
  }
  //或者
  interface PersonConstructor<T> {
      new ():T
  }
  function create<T>(c:PersonConstructor): T {
      return new c();
  }
  ```

  使用原型属性推断并约束构造函数与类实例的关系

  ```ts
  class BeeKeeper{
    hasMask:boolean
  }
  class Zookeeper{
    nameTag:string
  }
  class Animal{
    num:number
  }
  class Bee extends Animal{
    keeper:BeeKeeper
  }
  class Lion extends Animal{
    keeper:Zookeeper
  }
  
  function createInstance<A extends Animal>(c:new () => A):A{
    return new c();
  }
  createInstance(Bee).keeper.hasMask
  createInstance(Lssion).keeper.nameTag
  ```


## 7、类型兼容性

&#8195;&#8195;ts里的类型兼容性是基于结构子类型的。js里广泛的使用匿名对象，所以使用结构类型系统来描述这些类型比使用名义类型系统更好。**结构化类型系统的基本原则是，如果要将`=`右边的赋值给左边的，那么右边至少具有跟左边相同的属性。** 本质上上跟函数调用时的类型检查一样（实参的数据类型必须跟形参匹配）。

```ts
//例子1
interface Named {
  name: string;
}

class Person {
  name: string;
}
//person实例具有name属性，所以可以成功赋值
let p: Named=new Person();

//例子2
interface Named {
    name: string;
}
let x: Named={name: 'Alice', location: 'Seattle'};
```

**1、比较两个函数**

&#8195;&#8195;函数传参时，参数少的可以赋值给参数多的。源函数的返回值类型必须是目标函数返回值类型的子类型。

```typescript
//1、比较参数列表，
let x = (a: number) => 0;
let y = (b: number, s: string) => 0;

y = x; // OK x的每个参数都能在y中找到对应的参数，所以允许赋值。相当于调用 y 函数时，s参数变成了可选参数。反之则不可以。
x = y; // Error调用x函数时，只能传一个参数，传两个参数肯定会报错。

//2、比较返回值类型。
let x = () => ({name: 'Alice'});
let y = () => ({name: 'Alice', location: 'Seattle'});

x = y; // OK 类型系统强制源函数的返回值类型必须是目标函数返回值类型的子类型。
y = x; // Error because x() lacks a location property，就比如在调用y函数时，获取的返回结果没有location后会报错。因为已经指定了返回类型。
```
**2、枚举**

```ts
enum Status { Ready, Waiting };
enum Color { Red, Blue, Green };

let status = Status.Ready;
status = Color.Green;  // Error 不同枚举类型之间是不兼容的
```

**3、类**

​		比较两个类类型的对象时，只有实例的成员会被比较,类的私有成员和受保护成员会影响兼容性。静态成员和构造函数不在比较的范围内。

```ts
class Animal {
  private feet: number;
  name：string;
  constructor(name: string, numFeet: number) { }
}

class Size {
  private feet: number;
  name:string;
  constructor(numFeet: number) { }
}

let a: Animal;
let s: Size;

a = s;  // OK
s = a;  // OK
```

**4、泛型**

​		类型参数只影响使用其作为类型一部分的结果类型。

```ts
//例子1
interface Empty<T> {
}
let x: Empty<number>;
let y: Empty<string>;

x = y;  // OK, because y matches structure of x

//例子2
interface NotEmpty<T> {
    data: T;
}
let x: NotEmpty<number>;
let y: NotEmpty<string>;
x = y;  // Error,类型不兼容

//例子3 对于没有指定泛型类型的泛型参数是，会把所有泛型参数当做`any`比较
let identity = function<T>(x: T): T {
    // ...
}

let reverse = function<U>(y: U): U {
    // ...
}

identity = reverse;  // OK, because (x: any) => any matches (y: any) => any

```

---
## 8、高级类型
**1、联合类型**

​		表示一个值可以是几种类型之一。用竖线（|）分隔每个类型。如果一个值是联合类型，我们只能**访问此联合类型的所有类型里共有的成员。**

```typescript
interface Bird {
    fly();
    layEggs();
}

interface Fish {
    swim();
    layEggs();
}

function getSmallPet(): Fish | Bird {
    // ...
}

let pet = getSmallPet();
pet.layEggs(); // okay Fish类和Bird类的共有成员。
pet.swim();    // errors
```
**2、类型保护和区分类型：**

  + 用户自定义的类型保护。简单的定义一个函数，**返回值是一个谓词**。谓词是`parameter is Type`形式。`parameter`必须来自于当前函数签名里的一个参数名。

    ```ts
    function isFish(per:Fish |Bird):per is Fish{
        return (per as Person).swin!==undefined
    }
    //当调用isFish时，TypeScript会自动检查该变量是否是哪个具体的类型，是就返回true，否则返回false
    if(isFish(pet)){
        pet.swin()
    }else{
        pet.fly()
    }
    ```

    

  + `typeof` 类型保护。 类型是`number,string,boolean,symbol`等简单类型。可以通过`typeof`操作符在类型注解中使用变量。告诉编译器，一个变量的类型和类型相同。

    ```ts
    //例子1
    function padLeft(value: string, padding: string | number) {
        if (typeof padding === "number") {
            return Array(padding + 1).join(" ") + value;
        }
        if (typeof padding === "string") {
            return padding + value;
        }
        throw new Error(`Expected string or number, got '${padding}'.`);
    }
    //例子2
    let foo="123";
    let bar:typeof foo;//bar将具有跟foo一样的类型
    bar="123";
    bar=345;// error 不能将类型“345”分配给类型“string”。
    //例子3
    const foo="123";
    let bar:typeof foo;
    bar="234";//error 不能将类型“"234"”分配给类型“"123"”
    ```

  + `instanceof` 类型保护。是通过构造函数来细化类型的一种方式。

**3、交叉类型**

&#8195;&#8195;将多个类型合并为一个类型。并且该类型并且包含所有类型的特性。`Person&Animal&Log`同时是`Person和Animal和Log`，该类型的对象同时拥有了这三种类型的成员。

```ts
function extend<T,U>(first:T,second:U):T&U{
  let result=<T&U>{};
  for(let item in first){
    (result as any)[item]=(first as any)[item];
  }
  for(let item in second){
    if(!result.hasOwnProperty(item)){
      (result as any)[item]=(second as any)[item]
    }
  }
  return result
}
class Person {
  constructor(public name: string) { }
  getName(){
    return this.name;
  }
}
class Animal{
  constructor(public type:string){};
  getType(){
    return this.type
  }
}
//unionObj具有Person类和Animal类的所有实例属性和方法。
let unionObj= extend(new Person("jim"),new Animal("dog"));
console.log(unionObj.type);//gog
console.log(unionObj.name);//jim
console.log(unionObj.getName());//jim
console.log(unionObj.getType());//dog
```

**4、类型别名**

&#8195;&#8195;类型别名会给一个类型起个新名字。起别名不会新建一个类型，只是创建了一个新名字来引用那个类型。

```ts
type Name = string;
type NameResolver = () => string;
type NameOrResolver = Name | NameResolver;
function getName(n: NameOrResolver): Name {
    if (typeof n === 'string') {
        return n;
    }
    else {
        return n();
    }
}
```

​		类型别名也可以是泛型。同时还可以使用类型别名在属性里引用自己。

```ts
type Container<T>={value:T};

type Tree<T>{
	value:T;
	left:Tree<T>;
    right:Tree<T>;
}
```
​		与交叉类型一起使用，可以创造出一些复杂类型。

```ts
type Tree<T>=T&{
	value:T;
	left:Tree<T>;
  right:Tree<T>;
}
interface Person{
    name:string;
}
let person:Tree<Person>;
//注意一旦s初始化后，它的类型就确定了，不能再给他赋值其他类型的数据
var s=person.name;
s=person.left.name;
s=person.value.name
s=person.left.right.value.name
```

​		类型名不能出现在声明右侧的任何地方。

```ts
type Yikes = Array<Yikes>; // error
```

**接口和类型别名的区别**

+ 接口创建了一个新的类型，可以在任何地方使用。类型别名不会创建新类型。
+ 类型别名不能被`extends`和`implements`。
+ 在无法通过接口来描述一个类型并且需要使用联合类型或元组类型时，这时通常会使用类型别名。

**5、字符串字面量类型**

&#8195;&#8195;字符串字面量类型允许我们指定字符串的固定值。

```ts
type Easing="ease-in" | "ease-out" | "ease-in-out";
function test(name:string,easeType:Easing){
    switch(easeType){
        case "ease-in":
            break;
        case "ease-out":
            break;
        case "ease-in-out":
            break;
    }
}
test("123","ease-in");//ok 
test("123","ease");//erorr easeType参数传递的必须是Easing类型
```

**6、可辨识联合**

&#8195;&#8195;合并类型来创建一个可辨识联合的高级模式，也被称为`标签联合`或`代数数据类型`。

```ts
//声明将要联合的接口
//1、相同属性kind
interface Square {
    kind: "square";
    size: number;
}
interface Rectangle {
    kind: "rectangle";
    width: number;
    height: number;
}
interface Circle {
    kind: "circle";
    radius: number;
}
//2、联合类型
type Shape = Square | Rectangle | Circle;
//3、kind属性的类型保护
function area(s: Shape) {
    switch (s.kind) {
        case "square": return s.size * s.size;
        case "rectangle": return s.height * s.width;
        case "circle": return Math.PI * s.radius ** 2;
    }
}
```

**完整性检查**

​		当没有涵盖所有可辨识联合的变化是，想让编译器通知我们报错。可以通过以下两种方式来。实现

+ 指定返回值类型

  ```ts
  function area(s: Shape): number { // error: returns number | undefined
      switch (s.kind) {
          case "square": return s.size * s.size;
          case "rectangle": return s.height * s.width;
          case "circle": return Math.PI * s.radius ** 2;
      }
  }
  ```

+ 使用never类型。

  ```ts
  function assertNever(x: never): never {
      throw new Error("Unexpected object: " + x);
  }
  function area(s: Shape) {
      switch (s.kind) {
          case "square": return s.size * s.size;
          case "rectangle": return s.height * s.width;
          case "circle": return Math.PI * s.radius ** 2;
          default: return assertNever(s); // error here if there are missing cases
      }
  }
  ```

**7、索引类型**

&#8195;&#8195;通过使用索引类型，编译器能够检查使用了动态属性名的代码。

+ **索引类型查询操作符**

  **`keyof T`:索引类型查询操作符。** 对于任何类型`T`,**`keyof T`** 的结果为`T`上已知的公共属性的联合（属性列表）。

  ```ts
  interface Person{
      name:string;
      age:number;
  }
  let person:Person={
      name:"james",
      age:26
  }
  //T[K][]表示 Person[name][]或者Person[age][]   K表示name|age
  function pluck<T,K extends keysof T>(o:T,names:k[]):T[K][]{
      return names.map(n=>o[n])
  }
  let values:(number|string)[]=pluck(person,['name','age']);
  console.log(values);//['james',26];
  let props:keyof Person;// name|age 获取了Person的联合属性
  ```

+ **索引访问操作符` T[K]`**

  下面函数getProperty`里的 `o: T`和 `name: K`，意味着**o[name]:T[K]**，**T[K]是结果类型**。

  ```ts
  function getProperty<T,K extends keyof T>(o:T,name:K):T[k]{
      return o[name]; 
  }
  ```

+ **索引类型和字符串索引签名**

  ```ts
  interface Map<T> {
      [key: string]: T;
  }
  let keys: keyof Map<number>; // key的数据类型为string|number
  let value: Map<number>['foo']; // value的数据类型为number
  ```


**8、映射类型**

&#8195;&#8195;映射类型——从旧类型里创建新类型，基于一些已存在的类型，按照一定方式转换字段。新类型以相同的形式去转换旧类型里每个属性。

```ts
interface Person{
  name:string;
  age:number;
}
//使用类型别名来根据Person创建只读和可选类型。
1、定义只读类型,属于同态
type ReadonlyPerson<T>={
  readonly [p in keyof T]:T[p]
}
2、定义可选类型，属于同态
type PartialPerson<T>={
  [p in keyof T]?:T[p]
}
3、属于同态
type Pick<T,k extends keyof T>={
    [p in K]:T[P];
}
4、非同态，不会创建新的属性
type Record<k extends string,T>={
    [p in K]:T
}
type personPartial=Partial<Person>
type personReadonly=ReadonlyPerson<Person>;
const partial:personPartial={name:"123"};
const readonly:personReadonly={name:"123",age:12};
```

&#8195;&#8195;映射类型的语法和索引签名的语法类型相似，映射类型内部使用了`for...in或者keyof`。包含了三个部分。

+ 类型变量`p`，依次绑定到每个属性。
+ 字符串字面量联合的`keys`,表示要迭代的属性名。
+ 属性的结果类型。

## 9、迭代器

**for...in和for...of的对比**

>   一个数据结构只要部署了`Symbol.iterator`属性，就被视为具有 iterator 接口，就可以用`for...of`循环遍历它的成员。也就是说，`for...of`循环内部调用的是数据结构的`Symbol.iterator`方法。

优点：

+ 有着同`for...in`一样的简洁语法，但是没有`for...in`那些缺点。
+ 不同于`forEach`方法，它可以与`break`、`continue`和`return`配合使用。
+ 提供了遍历所有数据结构的统一操作接口。

> `for...in`主要是为了遍历对象而设计的，不适合遍历数组。它迭代的是对象的键的列表。

缺点:

+ 数组的键名是数字，但是`for...in`循环却是以字符串作为健名。

+ 遍历的健名包括对象上的所有属性名，包括手动添加的和原型上的。

+ 在某些情况下，会以任意顺序遍历健名。

  

## 10、模块

**1、`export=和import = require()`语法**

​		`export=`语法定义一个模块的到处对象。它可以是类，接口，命名空间，函数或枚举。若要**导入一个使用了`export=`的模块时**，必须使用TypeScript提供的特定语法 `import zip=require("module")`

```typescript
    //ZipCodeValidator.ts
    let numberRegexp = /^[0-9]+$/;
    class ZipCodeValidator {
        isAcceptable(s: string) {
            return s.length === 5 && numberRegexp.test(s);
        }
    }
    export = ZipCodeValidator;

    //Test.ts
    import zip = require("./ZipCodeValidator");

    // Some samples to try
    let strings = ["Hello", "98052", "101"];

    // Validators to use
    let validator = new zip();

    // Show whether each string passed each validator
    strings.forEach(s => {
    console.log(`"${ s }" - ${ validator.isAcceptable(s) ? "matches" : "does not## match"}`);
    });
```

**2、外部模块**

```ts
//node.d.ts
declare module "url" {
    export interface Url {
        protocol?: string;
        hostname?: string;
        pathname?: string;
    }

    export function parse(urlStr: string, parseQueryString?, slashesDenoteHost?): Url;
}
declare module "path" {
    export function normalize(p: string): string;
    export function join(...paths: any[]): string;
    export let sep: string;
}
///调用外部模块
/// <reference path="node.d.ts"/>
import * as URL from "url";
let myUrl = URL.parse("http://www.typescriptlang.org");
```

**3、模块解析**

​		模块解析策略:一共有`Node`和`Classic`两种。Classic是以前typescript默认的解析策略。

​		**1、Classic策略**

+ 相对导入的模块主要是相对于导入它的文件进行解析的（先找`.ts`文件，找不到再找`.d.ts`文件）。

  ```ts
  //在/root/src/folder/A.ts
  import { b } from "./moduleB"
  //查找流程是
  /root/src/folder/moduleB.ts
  /root/src/folder/moduleB.d.ts
  ```

+ 对于非相对模块的导入，编译器会从包含导入文件的目录依次向上级目录进行遍历。（也是先找`.ts`文件，找不到再找`.d.ts`文件）

  ```ts
  //在/root/src/folder/A.ts
  import { b } from "moduleB"
  //查找流程是
  /root/src/folder/moduleB.ts
  /root/src/folder/moduleB.d.ts
  /root/src/moduleB.ts
  /root/src/moduleB.d.ts
  /root/moduleB.ts
  /root/moduleB.d.ts
  /moduleB.ts
  /moduleB.d.ts
  ```

  **2、Node.js如何解析模块**

+ 相对路径解析。

  ```ts
  // 在/root/src/moduleA.js文件中
  var x = require("./moduleB")
  //文件解析顺序为
  1、检查/root/src/moduleB.js文件是否存在。
  2、检查/root/src/moduleB目录是否包含一个package.json文件，且package.json文件指定了一个"main"模块。 在我们的例子里，如果Node.js发现文件 /root/src/moduleB/package.json包含了{ "main": "lib/mainModule.js" }，那么Node.js会引用/root/src/moduleB/lib/mainModule.js。
  3、检查/root/src/moduleB目录是否包含一个index.js文件。 这个文件会被隐式地当作那个文件夹下的"main"模块。
  ```

+ 非相对路径解析。

  ```ts
  // 在/root/src/moduleA.js文件中
  var x = require("./moduleB")
  //文件解析顺序为
  1、/root/src/node_modules/moduleB.js
  2、/root/src/node_modules/moduleB/package.json (如果指定了"main"属性)
  3、/root/src/node_modules/moduleB/index.js
  
  4、/root/node_modules/moduleB.js
  5、/root/node_modules/moduleB/package.json (如果指定了"main"属性)
  6、/root/node_modules/moduleB/index.js
  
  7、/node_modules/moduleB.js
  8、/node_modules/moduleB/package.json (如果指定了"main"属性)
  9、/node_modules/moduleB/index.js
  ```

**3、TypeScript如何解析模块**

+ 相对路径时。

  ```ts
  在/root/src/moduleA.ts里
  import { b } from "./moduleB"
  ///查询顺序
  1、/root/src/moduleB.ts
  2、/root/src/moduleB.tsx
  3、/root/src/moduleB.d.ts
  4、/root/src/moduleB/package.json (如果指定了"types"属性)
  5、/root/src/moduleB/index.ts
  6、/root/src/moduleB/index.tsx
  7、/root/src/moduleB/index.d.ts
  ```

+ 非相对路径时

  ```ts
  在/root/src/moduleA.ts里
  import { b } from "./moduleB"
  ///查询顺序
  1、/root/src/node_modules/moduleB.ts
  2、/root/src/node_modules/moduleB.tsx
  3、/root/src/node_modules/moduleB.d.ts
  4、/root/src/node_modules/moduleB/package.json (如果指定了"types"属性)
  5、/root/src/node_modules/moduleB/index.ts
  6、/root/src/node_modules/moduleB/index.tsx
  7、/root/src/node_modules/moduleB/index.d.ts
  
  8、/root/node_modules/moduleB.ts
  9、/root/node_modules/moduleB.tsx
  10、/root/node_modules/moduleB.d.ts
  11、/root/node_modules/moduleB/package.json (如果指定了"types"属性)
  12、/root/node_modules/moduleB/index.ts
  13、/root/node_modules/moduleB/index.tsx
  14、/root/node_modules/moduleB/index.d.ts
  
  15、/node_modules/moduleB.ts
  16、/node_modules/moduleB.tsx
  17、/node_modules/moduleB.d.ts
  18、/node_modules/moduleB/package.json (如果指定了"types"属性)
  19、/node_modules/moduleB/index.ts
  20、/node_modules/moduleB/index.tsx
  21、/node_modules/moduleB/index.d.ts
  ```

**4、附加的模块解析标记**

+ **BaseUrl**  告诉编译器去哪里查找模块。BaseUrl的值由两者之一决定。

  + 命令行的baseUrl值。（如果给定的路径是相对的，那么将相对于当前路径进行计算）
  + `tsconfig.json`里的baseUrl。（如果给定的路径是相对的，那么将相对`tsconfig.json`路径进行计算。）

+ **路径映射**  TS编译器使用`tsconfig.json`文件里的`paths`来支持这样的声明映射。

  ```ts
  {
    "compilerOptions": {
      "baseUrl": "./src", // This must be specified if "paths" is.
      "paths": {
        "jquery": ["../node_modules/jquery/dist/jquery"] // 此处映射是相对于"baseUrl"
      }
    }
  }
  
  ```

  `paths`是相对于`baseUrl`进行解析的。通过`paths`还可以指定复杂的映射。可以将一些不在同一个文件夹下的文件集中到一处。

  ```ts
  {
    "compilerOptions": {
      "baseUrl": ".",
      "paths": {
        "*": [
          "*",
          "generated/*"
        ]
      }
    }
  }
  ```

  上面的代码告诉编译器所有匹配`*`模式的模块导入会在以下两个位置查找。

  + `*`表示名字不发生改变，映射为`moduleName=>baseUrl/moduleName`。
  + `generated/*`表示模块名添加了`generated`前缀，所以映射为`moduleName=>baseUrl/generated/moduleName`

+ **利用`rootDirs`指定虚拟目录。**

  ```ts
  {
    "compilerOptions": {
      "rootDirs": [
        "src/views",
        "generated/templates/views"
      ]
    }
  }
  ```

  ​		在构建的过程中会将`/src/views`和`/generated/templates/views`的输出拷贝到同一个目录下。所以下面的配置是可以的。**合并物理目录列表**

  ```tree
   src
   └── views
       └── view1.ts (imports './template1')
       └── view2.ts
  
   generated
   └── templates
           └── views
               └── template1.ts (imports './view2')
  ```

​		还可以自动插入特定的路径记号来生成针对不同区域的捆绑。

```ts
{
  "compilerOptions": {
    "rootDirs": [
      "src/zh",
      "src/de",
      "src/#{locale}"
    ]
  }
}
```

​		编译器现在可以将`import messages from './#{locale}/messages'`解析为`import messages from './zh/messages'`用做工具支持的目的，并允许在开发时不必了解区域信息。

+ **跟踪模块解析**

  通过`--traceResolution`启用编译器的模块解析跟踪，会告诉我们在模块解析过程中发生了什么。

  使用`--noResolve`，正常情况下，编译器会在编译之前解析模块导入。而`--noResolve`编译选项可以告诉编译器不要添加任何不在命令行上传入的文件到编译列表。

## 11、命名空间

&#8195;&#8195;不同的文件，如果`namespace`一样,使用的时候就如同它们在同一个文件一样。不同文件之间存在依赖关系，所以需要使用引用标签来告诉编译器文件之间的关联。
**1、将大文件分离到多文件**

```ts
//Validation.ts
namespace Validation{
    export interface StringValidator{
        isAcceptable(s:string):boolean;
    }
}
//LettersOnlyValidator.ts
/// <reference path="Validation.ts" />
namespace Validation {
    const lettersRegexp = /^[A-Za-z]+$/;
    export class LettersOnlyValidator implements StringValidator {
        isAcceptable(s: string) {
            return lettersRegexp.test(s);
        }
    }
}
```

**2、命名空间的的别名**
使用别名来简化命令空间。

```ts
namespace Shapes {
    export namespace Polygons {
        export class Triangle { }
        export class Square { }
    }
}

import polygons = Shapes.Polygons;
let sq = new polygons.Square(); // Same as "new Shapes.Polygons.Square()"
```

**3、外部命名空间**

```ts
//D3.d.ts
declare namespace D3 {
    export interface Selectors {
        select: {
            (selector: string): Selection;
            (element: EventTarget): Selection;
        };
    }

    export interface Event {
        x: number;
        y: number;
    }

    export interface Base extends Selectors {
        event: Event;
    }
}

declare var d3: D3.Base;
```

## 12、声明合并

**1、接口合并**

+ 接口的非函数的成员应该是唯一的。如果它们不是唯一的，那么它们必须是相同的类型。

+ 对于函数成员，每个同名函数声明都会被当成这个函数的一个重载。 同时需要注意，当接口 `A`与后来的接口 `A`合并时，**后面的接口具有更高的优先级。每组接口里的顺序保持不变，但是每组接口之间的顺序是后来的接口重载在靠前位置。但是当出现特殊的签名函数时，如果签名里有一个参数的类型是单一的字符串字面量，那么它将会被提升到重载列表的最顶端。**

  ```ts
  interface Document {
      createElement(tagName: any): Element;
  }
  interface Document {
      createElement(tagName: "div"): HTMLDivElement;
      createElement(tagName: "span"): HTMLSpanElement;
  }
  interface Document {
      createElement(tagName: string): HTMLElement;
      createElement(tagName: "canvas"): HTMLCanvasElement;
  }
  //接口合并
  interface Document {
      createElement(tagName: "canvas"): HTMLCanvasElement;
      createElement(tagName: "div"): HTMLDivElement;
      createElement(tagName: "span"): HTMLSpanElement;
      createElement(tagName: string): HTMLElement;
      createElement(tagName: any): Element;
  }
  ```

**2、命名空间合并**

+ 对于**命名空间的合并**，模块导出的同名接口进行合并，构成单一命名空间内含合并后的接口。
+ 对于命名空间里值的合并，如果当前已经存在给定名字的命名空间，那么后来的命名空间的导出成员会被添加到应存在的那个模块里。
+ **非导出成员**仅在其原有的命名空间内可见。

**3、命名空间与类和函数和枚举类型合并**。只要命名空间的定义符合将要合并的类型的定义，合并结果包含两者的声明类型。

+ 命名空间和类合并。可以使用命名空间为类增加一些静态属性。

  ```ts
  class Album {
      label: Album.AlbumLabel;
      name: Album.name;
  }
  namespace Album {
      export class AlbumLabel { };
      export const name="test"
  }
  ```

+ 命名空间和函数合并。使用命名空间来扩展函数。

  ```ts
  function buildLabel(name: string): string {
      return buildLabel.prefix + name + buildLabel.suffix;
  }
  
  namespace buildLabel {
      export let suffix = "";
      export let prefix = "Hello, ";
  }
  
  console.log(buildLabel("Sam Smith"));
  ```

+ 命名空间可以用来扩展枚举型。

  ```ts
  enum Color {
      red = 1,
      green = 2,
      blue = 4
  }
  
  namespace Color {
      export function mixColor(colorName: string) {
          if (colorName == "yellow") {
              return Color.red + Color.green;
          }
          else if (colorName == "white") {
              return Color.red + Color.green + Color.blue;
          }
      }
  }
  ```

  

## 13、混合

​		从可重用组件构建类的另种方式是通过基类来构建他们，这种方式称为混合。

​	 混合是一个函数，混合的步骤如下：

+ 传入一个构造函数；
+ 构建一个带有新功能，并且扩展构造函数新类；
+ 返回这个新类。

```ts
//1、定义构造函数的类型
type Constructor<T={}>=new (...args:any[])=>T;
//2、扩展该类并返回它（扩展属性）
function TimesTamped<TBase extends Constructor>(Base:TBase){
  return class extends Base{
    timestamp=Date.now();
  }
}
//3、扩展该类并返回它（扩展属性和方法）
function Activatable<TBase extends Constructor>(Base: TBase) {
  //返回新类
  return class extends Base {
    isActivated = false;
    activate() {
      this.isActivated = true;
    }

    deactivate() {
      this.isActivated = false;
    }
  };
}
//定义基类
class User{
    name:string;
    age:number  
}
// 扩展基类并添加 TimesTamped 属性的 类
const TimestampedUser = TimesTamped(User);
// 扩展基类并添加 TimesTamped 和 Activatable 的类
const TimestampedActivatableUser = TimesTamped(Activatable(User));
//使用组合类
const timestampedUserExample = new TimestampedUser();
console.log(timestampedUserExample.timestamp);

const timestampedActivatableUserExample = new TimestampedActivatableUser();
console.log(timestampedActivatableUserExample.timestamp);
console.log(timestampedActivatableUserExample.isActivated);
```



## 14、装饰器

&#8195;&#8195;装饰器是一种特殊类型的声明，它能够被附加到类声明、方法、访问符，属性或参数上。使用`@expression`形式，`expression`求值后必须为一个函数，在运行时调用，被装饰的声明信息作为参数传入。
其实就是一个语法糖，背后利用的是`Object.defineProperty(target,name,descripter)`。本质上是`AOP`

**1、装饰器工厂**

是一个简单的函数，返回一个表达式，供装饰器在运行时调用。

```ts
function clolor(value:string){
    //target是被装饰的对象
    return function(target){
        //do something with target and value
    }
}
```

**2、装饰器组合**

表示多个装饰器同时应用到一个声明上。当多个装饰器声明在同一个声明上会进行如下操作。

+ 由上至下依次对装饰器表达式求值。

+ 求值的结果会被当做函数，由下至上依次调用。

  ```ts
  function f() {
      console.log("f(): evaluated");
      return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
          console.log("f(): called");
      }
  }
  
  function g(value:string) {
      console.log("g(): evaluated");
      return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
          console.log("g(): called");
          console.log(target);//表示装饰的类的实例 => {test: ƒ, constructor: ƒ}
          console.log(propertyKey);//表示装饰的声明的名称 => test
          console.log(descriptor);//表示对象的数据属性 => {value: ƒ, writable: true, enumerable: true, configurable: true}
      }
  }
  
  class C {
      @f()
      @g()
      test() {}
  }
  ```

  在控制台里会打印出如下结果：

  ```ts
  f(): evaluated
  g(): evaluated
  g(): called
  {test: ƒ, constructor: ƒ}
  {value: ƒ, writable: true, enumerable: true, configurable: true}
  test
  f(): called
  ```

**3、装饰器求值**

类中不同声明上的装饰器将按照以下规定的顺序应用。

+ 参数装饰器，然后依次是方法装饰器*，*访问符装饰器，或属性装饰器应用到每个实例成员。
+ 参数装饰器，然后依次是方法装饰器*，*访问符装饰器，或属性装饰器应用到每个静态成员。
+ 参数装饰器应用到构造函数。
+ 类装饰器应用到类。

**4、类装饰器**

​		在类声明之前被调用。应用于类构造函数，可以用来监视、修改或替换类定义。该装饰器不能用在声明文件(`.d.ts`)，也不能用在任何外部上下文(`declare的类`)。

​		类装饰器表达式会在运行时被当做函数调用，**类的构造函数作为其唯一的参数。**

​		如果类装饰器返回一个值，它会使用提供的构造函数类替换类的声明。
```ts
function name(constructor) {  
  return class extends constructor{
    name="jamestang"
  }
}
```

> **1、修改构造函数原型属性**

```typescript
function Path(path: string) {
    //target是类的构造函数，且是唯一的参数
    return function (target: Function) {
        console.log(target);//function HelloService(){}
        !target.prototype.$Meta && (target.prototype.$Meta = {})
        target.prototype.$Meta.baseUrl = path;
    };
}

@Path('/hello')
class HelloService {
    constructor() {}
}

console.log(HelloService.prototype.$Meta);// 输出：{ baseUrl: '/hello' }
let hello = new HelloService();
console.log(hello.$Meta) // 输出：{ baseUrl: '/hello' }
```

> **2、密封构造函数及原型,使构造函数的属性只能被修改。**

```ts
function sealed(constructor: Function) {
    Object.seal(constructor);
    Object.seal(constructor.prototype);
}
@sealed
class Greeter {
    greeting: string;
    constructor(message: string) {
        this.greeting = message;
    }
    greet() {
        return "Hello, " + this.greeting;
    }
}
```

> **3、重载构造函数**

```ts
function classDecorator<T extends {new(...args:any[]):{}}>(constructor:T){
    //	如果类装饰器返回一个值，它会使用提供的构造函数类替换类的声明。
    return class extends constructor{
        newProperty="new property";
        hello="override";
    }
}
@classDecorator
class Greeter{
    property="property";
    hello:string;
    constructor(m:string){
        this.hello=m;
    }
}
```

**5、方法装饰器**

&#8195;&#8195;方法装饰器声明在一个方法的声明之前（紧靠着方法声明）。会被应用到方法的属性描述符上，可以用来监视、修改或替换方法定义。该装饰器不能用在声明文件(`.d.ts`)，也不能用在任何外部上下文(`declare的类`)。

方法装饰器表达式会在运行时当作函数被调用，传入下列3个参数:

```ts
(target: any, propertyKey: string, descriptor: PropertyDescriptor)
```

  + **`target`**——对于静态成员来说是类的构造函数，对于实例成员是类的原型对象。

  + **`propertyKey`**——成员的名字（被修饰的方法的名字）。

  + **`descriptor`**——成员的属性描述符。

    ```ts
    class Greeter {
        greeting: string;
        constructor(message: string) {
            this.greeting = message;
        }
    
        @enumerable(false)
        greet() {
            return "Hello, " + this.greeting;
        }
    }
    function enumerable(value: boolean) {
        return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
            descriptor.enumerable = value;//使属性不能被迭代
        };
    }
    ```

**6、访问器装饰器**

访问器装饰器声明在一个访问器的声明之前（紧靠着访问器声明）。 访问器装饰器应用于访问器的属性描述符并且可以用来监视，修改或替换一个访问器的定义。访问器装饰器不能用在声明文件中（.d.ts），或者任何外部上下文（比如 `declare`的类）里。

如果访问器装饰器返回一个值，它会被用作方法的**属性描述符**。

**注意**  TypeScript不允许同时装饰一个成员的`get`和`set`访问器。因为，在装饰器应用于一个*属性描述符*时，它联合了`get`和`set`访问器，而不是分开声明的。

​		访问器装饰器表达式会在运行时当作函数被调用，传入下列3个参数，跟方法装饰器的参数一样。

  + 1、对于静态成员来说是类的构造函数，对于实例成员是类的原型对象。

  + 2、成员的名字。

  + 3、成员的属性描述符。

    ```ts
    class Point {
        private _x: number;
        private _y: number;
        constructor(x: number, y: number) {
            this._x = x;
            this._y = y;
        }
    
        @configurable(false)
        get x() { return this._x; }
    
        @configurable(false)
        get y() { return this._y; }
    }
    function configurable(value: boolean) {
        return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
            descriptor.configurable = value;
        };
    }
    ```


**7、属性装饰器**

​		属性装饰器声明在一个属性声明之前（紧靠着属性声明）。 属性装饰器不能用在声明文件中（.d.ts），或者任何外部上下文（比如 `declare`的类）里。属性描述符*不会做为参数传入属性装饰器，属性描述符只能用来监视类中是否声明了某个名字的属性。

属性装饰器表达式会在运行时当作函数被调用，传入下列2个参数：

+ 对于静态成员来说是类的构造函数，对于实例成员是类的原型对象。

+ 成员的名字。
```ts
    function setDefaultValue(target: Object, propertyName: string) {
      target[propertyName] = "jamestang";
    }

    class Person {
      @setDefaultValue
      name: string;
    }

    console.log(new Person().name); // 输出: jamestang
```

**8、参数装饰器**

参数装饰器声明在一个参数声明之前（紧靠着参数声明）。 

## 15、this

​		`this`在`js`中表示对象上下文。在`TypeScript`可以通过`ThisType`我们可以在对象字面量中键入`this`，并通过上下文控制`this`的类型。主要有以下几种情况。

+ 方法里显示制定了`this`。

  ```ts
  let bar = {
    x: 'hello',
    f(this: { message: string }) {
      console.log(this); // { message: string }
    }
  };
  ```

+ `this`参数由上下文键入。

  ```ts
  let foo = {
    x: 'hello',
    f(n: number) {
      console.log(this); // { x: string, f(n: number): void }
    }
  };
  ```

+ 如果 `--noImplicitThis` 选项已经启用，并且对象字面量中包含由 `ThisType` 键入的上下文类型，那么 `this` 的类型为 `T`。

  ```ts
  // Compile with --noImplicitThis
  
  obj.f = function(n) {
    return this.x - n; // 'this' has same type as 'obj'
  };
  
  obj['f'] = function(n) {
    return this.x - n; // 'this' has same type as 'obj'
  };
  ```

+ 如果 `--noImplicitThis` 选项已经启用，并且对象字面量中不包含由 `ThisType` 键入的上下文类型，那么 `this` 的类型为该上下文类型。

  ```ts
  // Compile with --noImplicitThis
  
  type ObjectDescriptor<D, M> = {
    data?: D;
    methods?: M & ThisType<D & M>; // Type of 'this' in methods is D & M
  };
  
  function makeObject<D, M>(desc: ObjectDescriptor<D, M>): D & M {
    let data: object = desc.data || {};
    let methods: object = desc.methods || {};
    return { ...data, ...methods } as D & M;
  }
  
  let obj = makeObject({
    data: { x: 0, y: 0 },
    methods: {
      moveBy(dx: number, dy: number) {
        this.x += dx; // Strongly typed this
        this.y += dy; // Strongly typed this
      }
    }
  });
  
  obj.x = 10;
  obj.y = 20;
  obj.moveBy(5, 5);
  ```

+ 如果 `--noImplicitThis` 选项已经启用，`this` 具有该对象字面量的类型。

+ 否则，`this` 的类型为 `any`。









