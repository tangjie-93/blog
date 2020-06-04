## 1、接口之可索引的类型

&#8195;&#8195;接口支持两种索引签名：**字符串和数字**。字符串索引签名能很好的描述 `dictionary` 模式，并且也会保证所有属性与其返回值类型相匹配。

**注意：** 可以同时使用两种类型的索引，**数字索引的返回值必须是字符串索引返回值类型的子类型**

#### 1、字符串索引签名

```ts
interface StringArray{
    [index:number]:string;//表示当用number去索引StringArray类型的数据时会得到string类型的返回值。
}
let arr:StringArray=["test","red"];
let str=arr[0];
console.log(str); //test
```

#### 2、字符串索引和数字索引同时存在

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

#### 3、字符串索引签名能很好的描述dictionary模式，并且也会保证所有属性与其返回值类型相匹配

```ts
 interface NumberDictionary {
     [index: string]: number;
     length: number;    // 可以，length是number类型
     name: string       // 错误，`name`的类型不是索引类型的子类型
 }
```

#### 4、可以将索引签名设置为只读

```ts
interface ReadonlyStringArray {
    readonly [index: number]: string;
}
let myArray: ReadonlyStringArray = ["Alice", "Bob"];
myArray[2] = "Mallory"; // 报错
```

## 2、interface和 type的区别
**`interface`**
+ 1、同名的 `interface` 自动聚合，也可以跟同名的 `class` 自动聚合。
```ts
interface Point {x:number;};
interface Point {y:number;};
const point:Pint = {x:1,y:2};
```
+ 2、只能表示 `object、class、function`类型
```ts
    interface Point{
    x:number;
    y:number;
    }
    interface SetPoint{
    (x:number,y:number):void;
    }
    interface ClockInterface {
        currentTime: Date;
        setTime(d: Date);
    }

    class Clock implements ClockInterface {
        currentTime: Date;
        setTime(d: Date) {
            this.currentTime = d;
        }
        constructor(h: number, m: number) { }
    }
```
+ 3、创建了新的类型
+ 4、和类一样，接口是可以相互扩展的。通过 `extends` 来实现继承。
```ts
    interface Shape {
        color: string;
    }

    interface Square extends Shape {
        sideLength: number;
    }
```
+ 5、可以创建可索引的类型
```ts
interface FuncWithAttachment {
  (param: string): boolean;
  someProperty: number;
}
```
**`type`**
+ 1、不仅仅表示 `object、class、function`类型
+ 2、不能重名（自然不存在同名聚合了），扩展已有的 type 需要创建新 `type`。
+ 3、支持复杂的类型操作
+ 没有创建新的类型，知识创建一个新的名字来引用那个类型。
+ 4、可以被`extends`和 `implements`,只是语法上会有些不同。`type`主要是通过交差类型来实现继承的。
```ts
    //type extends type
    type PartialPointX = {x:number;};
    type Point = PartialPointX & {y:number;};

    //type extends interface
    interface ParticalPointX = {x:number;};
    type Point = ParticalPointX & {y:number};

    //interface extends type
    type PartialPointX = {x:number;};
    interface Point extends PartialPointX {y:number;};

    //type extends interface
    interface ParticalPointX = {x:number;};
    type Point = ParticalPointX & {y:number};
```
+  5、在无法通过接口来描述一个类型并且需要使用联合类型或元组类型时，这时通常会使用类型别名。
```ts
    type Name = string;
    type PartialPointX = {x:number;};
    type PartialPointY = {y:number;};
    type PartialPoint = PartialPointX | PartialPointY;
```
## 3、装饰器

&#8195;&#8195;装饰器是一种特殊类型的声明，它能够被附加到类声明、方法、访问符，属性或参数上。使用`@expression`形式，`expression`求值后必须为一个函数，在运行时调用，被装饰的声明信息作为参数传入。
其实就是一个语法糖，背后利用的是`Object.defineProperty(target,name,descripter)`。本质上是`AOP`

#### 1、装饰器工厂

是一个简单的函数，返回一个表达式，供装饰器在运行时调用。

```ts
function clolor(value:string){
    //target是被装饰的对象
    return function(target){
        //do something with target and value
    }
}
```

#### 2、装饰器组合

&#8195;&#8195;表示多个装饰器同时应用到一个声明上。当多个装饰器声明在同一个声明上会进行如下操作。

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

#### 3、装饰器求值

类中不同声明上的装饰器将按照以下规定的顺序应用。

+ 参数装饰器，然后依次是方法装饰器，访问符装饰器，或属性装饰器应用到每个实例成员。
+ 参数装饰器，然后依次是方法装饰器，访问符装饰器，或属性装饰器应用到每个静态成员。
+ 参数装饰器应用到构造函数。
+ 类装饰器应用到类。

#### 4、类装饰器

​&#8195;​&#8195;在类声明之前被调用。应用于类构造函数，可以用来监视、修改或替换类定义。该装饰器不能用在声明文件(`.d.ts`)，也不能用在任何外部上下文(`declare的类`)。

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

#### 5、方法装饰器

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

#### 6、访问器装饰器

​&#8195;​&#8195;访问器装饰器声明在一个访问器的声明之前（紧靠着访问器声明）。 访问器装饰器应用于访问器的属性描述符并且可以用来监视，修改或替换一个访问器的定义。访问器装饰器不能用在声明文件中（.d.ts），或者任何外部上下文（比如 `declare`的类）里。

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
#### 7、属性装饰器

​​&#8195;​&#8195;属性装饰器声明在一个属性声明之前（紧靠着属性声明）。 属性装饰器不能用在声明文件中（.d.ts），或者任何外部上下文（比如 `declare`的类）里。属性描述符不会做为参数传入属性装饰器，属性描述符只能用来监视类中是否声明了某个名字的属性。

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
#### 8、参数装饰器

&#8195;&#8195;参数装饰器声明在一个参数声明之前（紧靠着参数声明）。
参数装饰器表达式会在运行时当作函数被调用，传入下列3个参数: 
+ 对于静态成员来说是类的构造函数，对于实例成员是类的原型对象。
+ 成员的名字。
+ 参数在函数参数列表中的索引。

## 4、ts中的条件判断
```ts
T extends U ? x:y;
```
```ts
type num = 1;
type str = 'hello world';

type IsNumber<N> = N extends number ? 'yes, is a number' : 'no, not a number';
//作为一种类型
type result1 = IsNumber<num>; // "yes, is a number"
type result2 = IsNumber<str>; // "no, not a number"
```

## 5、使用 keyof 关键字动态地取出某个键值对类型的 key
```ts
interface Student {
  name: string;
  age: number;
}

type studentKey = keyof Student; // "name" | "age"
```