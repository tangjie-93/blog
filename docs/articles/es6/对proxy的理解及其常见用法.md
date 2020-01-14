## 对proxy的理解及其常见用法

​		虽然以前看过proxy的相关文章，但是最近在看到某为大神用proxy实现了单例及数据双向绑定，所以决定再次好好的来了解一下proxy的用法，谨以此文来记录我对它的理解及用法。
<h3>1、什么是Proxy?</h3>
&#8195;&#8195;Proxy 用于修改某些操作的默认行为,可以理解成，在**目标对象之前架设一层“拦截”，外界对该对象的访问，都必须先通过这层拦截**，因此提供了一种机制，可以对外界的访问进行过滤和改写。
&#8195;&#8195;换句话说就是——Proxy对象就是可以让你去对JavaScript中的一切合法对象的基本操作进行自定义，然后用你自定义的操作去覆盖其对象的基本操作。说白了就是**重写其其所属类或构造函数中的基本操作**。  

&#8195;&#8195;其基本语法是：
```js
let proxy=new Proxy(target,handler)
```
+ target——是你要对其基本操作进行自定义的对象，它可以是JavaScript中的任何合法对象。
+ handler——是你要自定义操作方法的一个对象.
+ proxy——是一个被代理后的新对象,它拥有target的一切属性和方法.只不过其行为和结果是在handler中自定义的。**在一定程度上可以看成是对target的引用。**

下面我们来看一个例子
     
```javascript        
let obj={a:1}；
let proxy=new Proxy(obj,{
    get(target,proxy){
        return 34;
    }
});
proxy.b=50;
proxy.c=60;
obj.d=70;
console.log(obj);
console.log(proxy);
console.log(proxy.d);
console.log(obj.d);
//输出结果如下所示：
//{a: 1, b: 50, c: 60, d: 70}
//Proxy {a: 1, b: 50, c: 60, d: 70}
//35
//70 
```
**&#8195;&#8195;结果分析：** 要想使得代理起作用，必须针对Proxy实例（上面是proxy对象）进行操作，而不是针对目标对象（上例是空对象）进行操作。而且对代理对象的操作也会影响到目标对象，防止也一样。在handler空对象的情况下，对target和proxy对象的操作是一样的。

&#8195;&#8195;再来看下面的这个例子

```javascript            
let obj={a:1};
let proxy=new Proxy(obj,{
    get(target,proxy){
        return 35;
    }
})
let object=Object.create(proxy);
//等效于 let object__proto__=proxy;
object.b=30;
console.log(obj);// {a: 1}
console.log(proxy);//Proxy {a: 1}
console.log(object);//{b: 30}
console.log(object.b);//30
console.log(object.a);//35
```
**&#8195;&#8195;结果分析:** 当我们访问对象的某个属性时，最先会访问对象本身，如果有该属性，则直接返回，如果没有则访问其原型，如果还是没有，再访问原型的原型，一直沿着原型链向上访问，直到访问到或者到达原型链终点（Object.prototype__proto__）为止。有则返回该属性的值，没有则返回undefined。     
    &#8195;&#8195;上面的代码中object对象中有b属性，所以直接返回该属性的值，但是object对象中没有a属性，所以会去访问object的原型，此时object的原型是proxy对象，所以object.a实际上相当于proxy.a,所以返回的是35。

<h3>2、Proxy 支持的拦截操作</h3>
&#8195;&#8195;proxy一共支持13中拦截类型，基本上是对于Object的方法进行拦截。个人觉得proxy拦截的好处主要有： 
**1、通过对某一操作进行拦截，能实现自己想要的效果，而且这种拦截属于一种不公开的操作，具备很好的安全性。      
2、通过对proxy对象的操作,来达到对目标对象的操作,很好的隐藏了目标对象，降低目标对象的曝光度,实现了对目标对象的保护效果。     
3、相比较Object.defineProperty()而言，proxy功能更强大,不仅能拦截对象的属性，还能对整个对象，如数组和函数进行拦截。而且proxy的拦截种类更多。**   

​		proxy主要有以下拦截方法。

+ **get(target, propKey,receiver)：** 拦截某个属性的读取操作，可以接受三个参数，依次为目标对象、属性名和 proxy 实例本身（严格地说，代表原始的读操作所在的那个对象），其中最后一个参数可选，一般情况下指向的是proxy对象，**但是如果proxy作为其他对象的原型时，则指向读取该属性的对象了。**  
运用：get()方法可以被继承、get()方法可以实现链式操作。
```javascript          
const proxy = new Proxy({}, {
    get: function(target, property, receiver) {
        return receiver;
    }
});
console.log(proxy.a===proxy);//true
const d = Object.create(proxy);//被继承
console.log(d.a === d) // true      
```
**注意：** 如果一个属性的特性configurable和writable都为false时，对该属性设置get代理会报错。及属性值不可被删除、不可被修改、不可被读取，所有使用代理的get方法去读取属性值会报错。

```javascript     
const target = Object.defineProperties({}, {
    foo: {
        value: 123,
        writable: false,
        configurable: false
    },
});
const handler = {
    get(target, propKey) {
        return 'abc';
    }
};
const proxy = new Proxy(target, handler);
console.log(proxy.foo);
//'get' on proxy: property 'foo' is a read-only and non-configurable data property on the proxy target but the proxy did not return its actual value (expected '123' but got 'abc')
```
+ **set(target, propKey, value,receiver)：** 用来拦截某个属性的赋值操作，可以接受四个参数，依次为目标对象、属性名、属性值和 Proxy 实例本身，其中最后一个参数可选。返回一个布尔值。   
**运用:** 利用set方法，可以数据绑定，即每当对象发生变化时，会自动更新 DOM。结合get和set方法，就可以定义私有属性。     
**注意:** 如果目标对象自身的某个属性，不可写且不可配置(即configurable和writable都为false)，那么set方法将不起作用。

```javascript             
"use strict"
let obj={};
Object.defineProperty(obj,"name",{
    configurable:false,
    writable:false,
    value:"james"
})
let proxy=new Proxy(obj,{
    set(target, propKey, value,receiver){
        target[propKey="tang";
               }
})
console.log(obj.name);//james
```
**注意：** 严格模式下，set代理如果没有返回true，就会报错。比如没有return语句或者return false;return;都会报错。

```javascript          
"use strict"
let obj={name:"james"};
let proxy=new Proxy(obj,{
    set(target, propKey, value,receiver){
        target[propKey]="tang";
    }
})
proxy.test="test";
//'set' on proxy: trap returned falsish for property 'test'
```
+ **has(target, propKey)：** 用来拦截HasProperty操作，用来判断对象是否具有某个属性。**典型的操作就是in运算符**。has方法可以接受两个参数，分别是目标对象、需查询的属性名。返回一个布尔值。就算你自定义返回的不是布尔值，也会转换布尔值。    
**注意:**
1、如果某个属性的configurable被设置为false或者整个对象被设置为禁止扩展的话。使用in运算符时，被has方法拦截时,必须返回target[key]所对应的值，否则会报错。  
2、has拦截的不是hasProperty()方法，也不会拦截has...in操作。

```javascript            
let obj={
    a:1,
    b:2
}
Object.defineProperty(obj,"c",{
    configurable:false,
    writable:false,
    value:"123",
})
Object.preventExtensions(obj);
let proxy=new Proxy(obj,{
    has(target,key){
        if(key==="a"){
            return target[key];
        }
        if(key==="b"){
            return false;
        }else{
            return false;
        }
    }
})
console.log("c" in proxy);//true
console.log("a" in proxy);//true
console.log("d" in proxy);//false
//console.log("b" in proxy);//trap returned falsish for property 'b' but the proxy target is not extensible
console.log(proxy.hasProperty("a"))// proxy.hasProperty is not a function
for(key in proxy){
    console.log(key);//a b (c因为writable属性被设置为false,故读取不到)
}
```

+ **deleteProperty(target, propKey)：** 用于拦截delete操作。返回一个布尔值。      
&#8195;&#8195;**该方法主要是拦截delete操作，并在deleteProperty执行真正想做的操作，同时对proxy的属性执行delete操作，并不会真正将该属性删除。** 不可以删除目标对象自身的不可配置（configurable）的属性，否则报错。
  
```javascript          
let obj={
    a:1,
    b:2
}
Object.defineProperty(obj,"c",{
    configurable:false,
    value:"123"
})
let proxy=new Proxy(obj,{
    deleteProperty(target,key){
        if(key==="a"){
            return false;
        }
        return true;
    }
})
delete proxy.a;
delete proxy.b;
console.log(proxy.a);//1
console.log(proxy.b);//2
console.log(obj);//{a:1,b:2}
delete proxy.c;//'deleteProperty' on proxy: trap returned truish for property 'c' which is non-configurable in the proxy target
```
+ **ownKeys(target)：** 拦截Object.getOwnPropertyNames(proxy)、Object.getOwnPropertySymbols(proxy)、Object.keys(proxy)、for...in循环等操作。该方法返回目标对象所有自身的属性的属性名。  
**注意：1、使用Object.keys方法时，有三类属性会被ownKeys方法自动过滤**
        a、目标对象上不存在的属性
        b、属性名为 Symbol 值
        c、不可遍历（enumerable）的属性     
2、ownKeys()的返回必须是一个数组，不然会报错。且返回的数组成员必须是字符串或者Symbol值（**即可以为对象属性的值**）。  
3、obj对象的某属性如果不可配置的，这时ownKeys方法返回的数组之中，必须包含该属性，否则会报错。
4、如果目标对象是不可扩展的（non-extensible），这时ownKeys方法返回的数组之中，必须包含原对象中所有可被返回的属性（**如Symbol属性、不可枚举属性以及不存在的属性都不能被返回，**），且不能包含多余的属性，否则报错。
  
```javascript          
let obj={
    a:1,
    b:2
    Symbol.for("c"):4
}
Object.defineProperty(obj,"d",{
    enumerable：false
})
//片段1
let proxy=new Proxy(obj,{
    ownKeys(target){
        return true
    }
});
Object.keys(proxy);//报错CreateListFromArrayLike called on non-object
//片段2
let proxy=new Proxy(obj,{
    ownKeys(target){
        return Object.keys(target)
    }
});
Object.keys(proxy);//a,b
//片段3
let proxy=new Proxy(obj,{
    ownKeys(target){
        return ["test","name","a",{}];//报错
    }
});
Object.keys(proxy);//a 只会返回对象中存在的，且可枚举的，非symbol属性
```

+ **getOwnPropertyDescriptor(target, propKey)：** 拦截Object.getOwnPropertyDescriptor(proxy, propKey)，返回属性的描述对象。

+ **defineProperty(target, propKey, propDesc)：** 拦截Object.defineProperty(proxy, propKey, propDesc）、Object.defineProperties(proxy, propDescs)以及set操作，返回一个布尔值。**该方法的作用在于拦截这些操作，然后自定义操作，被拦截的操作并不能生效**。

```javascript     
let obj = {
    a: 1,
    b: 2
}
let proxy = new Proxy(obj, {
    defineProperty(target, key,descriptor) {
        return true;
    }
});
Object.defineProperty(proxy,"c",{
    value:123
})
Object.defineProperty(proxy,"d",{
    value:"234"
})
console.log(obj);//{a:1,b:2}
console.log(proxy);proxy{a:1,b:2}
```
+ **preventExtensions(target)：** 拦截Object.preventExtensions(proxy)，返回一个布尔值。**该方法必须返回一个布尔值，否则会被自动转为布尔值。该方法有一个强制，只有目标对象不可扩展时，才能返回true,否则会报错**
+ **getPrototypeOf(target)：** 拦截获取对象原型的操作。具体来说，拦截下面这些操作。    
**注意: 1、该方法必须返回一个对象或者null，否则会报错。     
2、另外，如果目标对象不可扩展（non-extensible）， getPrototypeOf方法必须返回目标对象的原型对象。**

```javascript             
Object.prototype.isPrototypeOf()
Object.getPrototypeOf()
Reflect.getPrototypeOf()
instanceof

    let obj = {
        a: 1,
        b: 2
    }

let proxy = new Proxy(obj, {
    getPrototypeOf(target){
        console.log("proto");
        return null;
    }
});
Object.getPrototypeOf(proxy);//proto
Object.prototype.isPrototypeOf(proxy);//proto
proxy instanceof Object;//proto
Object.preventExtensions(obj);
Object.getPrototypeOf(proxy);//getPrototypeOf' on proxy: proxy target is non-extensible but the trap did not return its actual prototype
```

+ **isExtensible(target)：** 拦截Object.isExtensible(proxy)，返回一个布尔值。**该方法只能返回布尔值，跟前面那些只能返回布尔值方法一样，否则返回值会被自动转为布尔值。同时它的返回值必须与目标对象的isExtensible属性保持一致，否则就会抛出错误。**

+ **setPrototypeOf(target, proto)：** 拦截Object.setPrototypeOf(proxy, proto)，返回一个布尔值。如果目标对象是函数，那么还有两种额外操作可以拦截。
+ **apply(target, object, args)：** 拦截函数的调用、以及call、apply和bind操作，比如proxy(...args)、proxy.call(object, ...args)、proxy.apply(...),proxy.bind(...)()。
  
```javascript          
function foo(a,b){
    return a+b;
}
let proxy=new Proxy(foo,{
    apply(target, ctx, args){
        let num=1;
        for(let i=0;i<args.length;i++){
            num*=args[i];
        }
        //return target(...args);
        return num;
    }
})
console.log(proxy(10,20));//200
let obj={
    a:10,
    b:30
}
console.log(proxy.call(obj,10,20));// 240 apply中的ctx为obj
console.log(proxy.call(window,10,20));// 200 apply中的ctx为window
console.log(proxy.call(null,10,20));//200 apply中的ctx为null 
console.log(proxy.bind(window,20)(10));//200 apply中的ctx为window
console.log(proxy.toString(10));不会被拦截
```
+ **construct(target, args)：** 拦截 Proxy 实例作为构造函数调用的操作，比如new proxy(...args)。**construct方法返回的必须是一个对象，否则会报错。同时拦截对象target也必须是一个可以被new的对象**

```javascript     
function Foo(x,y){
    this.x=x;
    this.y=y;
}
let proxy=new Proxy(Foo,{
    construct(target,args){
        return {total:args[0]*args[1]}
    }
})
console.log(new proxy(10,20));//200
```



参考链接：  
[1、ES6中的代理模式-----Proxy](https://juejin.im/post/5a5227ce6fb9a01c927e85c4)  
[2、ECMAScript6 入门](http://es6.ruanyifeng.com/#docs/proxy)    
[3、ES6 系列之 defineProperty 与 proxy](https://juejin.im/post/5be4f7cfe51d453339084530#heading-4)   
[4、快来围观一下JavaScript的Proxy](https://juejin.im/post/5b09234d6fb9a07acf569905)
