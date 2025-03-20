---
title: 22.javascript之设计模式
date: '2020-01-14'
type: 技术
tags: javascript
note: javascript之设计模式
---
## 一、设计模式分类

### 1、单例模式

**定义：** 保证一个类仅有一个实例，并提供一个访问它的`全局访问点`。js的常见单例对象有`线程池、全局缓存、浏览器中的window对象`。

**实现原理：** 用一个变量来标志是否已经为某个类创建过实例对象，如果创建过，这在下一次获取该类的实例时，直接返回之前创建的实例对象。

**优点：**

单例模式的代码实现如下：
+ 类的单例设计模式
```js
class Singleton{
    constructor(name){
        this.name=name;
        this.instance=null;
    }
    static getInstance(name){
        if(!this.instance){
            this.instance=new Singleton(name);
        }
        return this.instance;
    }
}
// 测试
let a=Singleton.getInstance("test");
let b=Singleton.getInstance("test");
console.log(a===b);//true
```
+ 对象的单例设计模式
```js
let utils=(function(){
    function css(){}
    function query(){}
    return {
        query,
        css
    }
})()
```
**惰性单例模式：** 将创建对象和管理单例的逻辑分开。

```js
//将管理单例的逻辑封装成一个方法
const getSingle=function(fn){
    let instance=null;
    return function(){
        return instance ||(instance=fn.apply(this,arguments))
    }
}
//创建对象
const  createLoginLayer=function(){
    let div = document.createElement( 'div' ); 
    div.innerHTML = '我是登录浮窗';     
    div.style.display = 'none';     		
    document.body.appendChild( div );     
    return div;
}
let  createSingleLoginLayer = getSingle( createLoginLayer ); 
document.getElementById( 'loginBtn' ).onclick = function(){     
    let loginLayer = createSingleLoginLayer();     
    loginLayer.style.display = 'block'; 
}; 
```

---

### 2、策略模式

**定义：** 定义一系列的算法，把它们各自封装成策略，算法被封装在策略内部。根据不同参数来命中不同的策略。

```js
//定义策略
let strategies={
    "S":salary=>salary*4,
    "A":salary=>salary*3,
    "B":salary=>salary*2,
    "C":salary=>salary,
}
//调用策略 
let calculateBonus=(level,salary)=> strategies[level](salary)

//测试
let sBonus=calculateBonus("S",40000);
let aBonus=calculateBonus("A",30000);
console.log(sBonus);//160000
console.log(aBonus);//90000
```

**优点**

+ 用组合、委托和多态等技术和思想，可以`有效的避免多重条件选择语句`。
+ 提供了对开放-闭合原则的完美支持，将算法封装在独立的`strategy`中，使得它们易于切换、易于理解，易于扩展。
+ 可以避免许多重复的粘贴工作。
+ 是继承的一种更轻便的替换方案。

**缺点**

+ 要向用户暴露策略的所有实现，违反了最少知识原则。

+ 要使用策略模式，首先得了解所有的`stratigy`。

---

### 3、代理模式

**定义：** 为一个对象提供一个代用品或占位符，以便控制对它的访问。代理模式的关键点：`当用户直接访问一个对象或者不满足需求的时候，提供一个替身对象对这个对象的访问。`

代理模式分为**保护代理和虚拟代理**。

**1、虚拟代理：** 将一些开销很大的对象，延迟到真正需要它的才去创建。

**1）、用虚拟代理实现图片预加载**

**思路：** 先用一张loading图片占位，然后用异步的方式加载图片，等图片加载好了再将它填充到img节点里。

**代理的意义：** 负责预加载图片，预加载的操作完成后，把请求交给本体myImage。符合单一职责原则——（`一个类或者一个对象和函数`），应该仅有一个引起它变化的原因。

**好处：**

+ 1、用户可以放心的请求代理，只用关心能否得到想要的结果。
+ 2、在任何使用本体的地方都可以替换成使用代理。

```js
//功能：给img节点设置src
let myImage=(function(){
    let imfNode=document.createElement("img");
    document.body.appendChild(imgNode);
    return function(src) {
         imgNode.src=src;
    }
})();
//功能:图片预加载
let proxyImage=(function(){
    //图片预加载
    let img=new Image();
    img.onload=function(){
        //真正的图片加载成功时触发，此时的图片资源已经下载好了
        myImage(this.src)
    }
    return function(src){
        //添加默认图片占位
        myImage("http://pic44.nipic.com/20140723/18505720_094503373000_2.jpg")
        img.src=src;
    }
})();
proxyImage("http://pic44.nipic.com/20140723/18505720_094503373000_2.jpg");
```

**2)、虚拟代理合并http请求**

**思路:** 通过一个代理函数来收集一段时间内的请求，最后一次性的发送给服务器。

```js
let synchronousFile=function(id){
    console.log("开始同步文件，id为:"+id);
}
let proxySynchronousFile=(function(){
    let cache=[],timer;
    return function(id){
        if(timer){
            return;
        }
        timer=setTimeout(()=>{
            synchronousFile(cache.join(,));//
            clearTimeout(timer);
            timer=null;
            cache.length=0;
        },2000)
     }  
})()
document.getElementById("btn").onclick=function(){
    proxySynchronousFile(id);
}

```

**2、保护代理：** 代理帮助本体过滤掉一些请求。

```js
let Flower=function(){};
let xiaoming={
    sendFlower:function(target){
        target.receiveFlower();
    }
}
//B属于代理对象，可以帮助A对象过滤一些请求
let B={
    receiveFlower:function(){
        //监听A的好心情
        A.listenGoodMood(()=>{
            // new Flower()是一个大的开销对象
            let flower=new Flower();
            A.receiveFlower(flower);
        })
    }
}
//目标对象
let A={
    receiveFlower:function(flower){
        console.log("收到花"+flower);
    },
    listenGoodMood:function(fn){
        //延迟10秒
        setTimeout(()=>{
            fn();
        },10000)
    }
}
xiaoming.sendFlower(B);
```

**3、缓存代理**

&#8195;&#8195;缓存代理可以为一些开销大的运算结果提供暂时的存储，在下次运算时，如果传递进来的参数跟原来的一致，可以直接返回之前存储的运算结果。

实例：缓存乘积

```js
let multi = function() {
  let a = 1;
  for (let i = 0, len = arguments.length; i < len; i++) {
    a = a * arguments[i];
  }
  return a;
};
let add = function() {
    let a = 1;
    for (let i = 0, len = arguments.length; i < len; i++) {
      a = a + arguments[i];
    }
    return a;
  };
let proxyFactory = function(fn) {
  let cache = new Map();
  return function() {
    let args = [].join.call(arguments, ",");
    if (!cache.has(args)) {
      cache.set(args, fn.apply(this, arguments));
    }
    return cache.get(args);
  };
};
let proxyMulti=proxyFactory(multi);
proxyMulti(1, 2, 3, 4); // 输出：24
proxyMulti(1, 2, 3, 4); // 输出：24
let proxyAdd=proxyFactory(add);
proxyAdd(1, 2, 3, 4); // 输出：10
proxyAdd(1, 2, 3, 4); // 输出：10
```

----

### 4、迭代器模式

**定义：** 指提供一种方法顺序访问一个聚合对象中的各个元素，而又不需要暴露该对象的内部表示。可以分为内部迭代器和外部迭代器。

**好处：** 可以把迭代的过程从业务逻辑中分离出来，不用关心对象的内部构造，也可以按顺序访问其中的每个元素。

**内部迭代器：** 函数内部已经定义好了迭代规则，外部只需要一次初始调用。

```js
let each=function(args,callback){
    for(let i=0,len=args.length;i<len;i++){
        callback.call(args[i],i,args[i])
    }
}
//测试
each([1,2,3],function(i,n){
    console.log(i,n)
})
//判断两个数组元素里的值是否完全相等
let compare=function(arr1,arr2){
    if(arr1.length!==arr2.length){
        throw new Error("arr1和arr2不相等")
    }
    each(arr1,(i,n)=>{
        if(n!==arr[i]){
           throw new Error("arr1和arr2不相等") 
        }
    })
    alert("arr1和arr2相等")
}
//测试
compare([1,2,3],[1,2,3,4])// Uncaught Error: arr1和arr2不相等
```

**外部迭代器：** 必须显示的请求迭代下一个元素。增加了调用的复杂度，同时也增强了迭代器的灵活性，可以手动控制迭代的过程或者顺序。

```js
let Iterator=function(obj){
    let index=0;
    let next=function(){
        index+=1;
    };
    let isDone=function(){
        return index>=obj.length;
    };
    let getCurItem=function(){
        return obj[index];
    };
    return {
        next,
        isDone,
        getCurItem
    }
}
//判断两个数组元素里的值是否完全相等
let compare=function(iterator1,iterator2){
    while(!iterator1.isDone()&&!iterator2.isDone()){
        if(iterator1.getCurItem()!==iterator2.getCurItem()){
             throw new Error ( 'iterator1 和 iterator2 不相等' ); 
        }
        iterator1.next();
        iterator2.next(); 
    }
    alert ('iterator1 和 iterator2 相等'); 
}
var iterator1 = Iterator( [ 1, 2, 3 ] );
var iterator2 = Iterator( [ 1, 2, 3 ] ); 
compare( iterator1, iterator2 );  // iterator1 和 iterator2 相等  
```

**中止迭代器**

```js
let each=function(arr,callback){
    for(let i=0;i<arr.length;i++){
        if(callback(i,arr[i])===false){
            break;
        }
    }
}
each([1,2,34,5,4,5],(i,n)=>{
    if(n>5){
        return false;
    }
    console.log(n);//输出1、2
})
```

---

### 5、发布订阅模式

&#8195;&#8195;又称为`订阅者模式`，它定义了对象间的一种一对多的依赖关系，当一个对象的状态发生改变时，所有依赖于它的对象都将得到通知。

**缺点**

+ 创建订阅者本身要消耗一定的时间和内存，当你订阅一个消息后，也许此消息最后都未发生，但是这个订阅者会始终存在内存中。
+ 可以弱化对象之间的联系，但是过度使用的话，对象之间的必要联系也会被深藏在背后，会导致程序难以跟踪维护和理解。

**优点**

+ 时间上的解耦。

+ 对象之间的解耦

**实现步骤：**

+ 首先指定谁充当发布者。

+ 然后给发布者添加一个缓存列表，用于存放回调函数以便通知订阅者。

+ 最后发布消息的时候，发布者会遍历这和缓存列表，一次触发里面存放的订阅者回调函数。

```js
class EventBus{
    constructor(){
        //中介者
        this.event=Object.create(null);
    };
    //注册事件|监听事件（订阅者）
    on(name,fn){
        if(!this.event[name]){
            //一个事件可能有多个监听者
            this.event[name]=[];
        };
        this.event[name].push(fn);
    };
    //触发事件(观察者)
    emit(name,...args){
        //给回调函数传参
        this.event[name]&&this.event[name].forEach(fn => {
            fn(...args)
        });
    };
    //只被触发一次的事件
    once(name,fn){
        //在这里同时完成了对该事件的注册、对该事件的触发，并在最后取消该事件。
        const cb=(...args)=>{
            //触发
            fn(...args);
            //删除该订阅者
            this.off(name,fn);
        };
        //监听
        this.on(name,cb);
    };
    //取消事件
    off(name,offcb){
        if(this.event[name]){
            let index=this.event[name].findIndex((fn)=>{
                return offcb===fn;
            })
            this.event[name].splice(index,1);
            //没有人订阅该事件，则将该事件销毁
            if(!this.event[name].length){
                delete this.event[name];
            }
        }
    }
}
```
**观察者模式**
```js
//被观察者
class Subject {
    constructor (name) {
        this.name = name;
        this.Observer = [];
        this.state = undefined
    }
    attach (o) {
        if (!this.Observer.includes(o)) {
            this.Observer.push(o)
        }
    }
    setState (newState) {
        this.state = newState;
        this.Observer.forEach(observer => observer.update(this));
    }
}
//观察者
class Observer {
    constructor (name) {
        this.name = name;

    }
    update (sub) {
        console.log(`${sub.name}的状态改成了${sub.state}`)
    }
}
const o1 = new Observer('观察者1');
const o2 = new Observer('观察者2');
const sub = new Subject("发布者1");
sub.attach(o1);
sub.attach(o2);
sub.setState("开心");
```
---

### 6、命令模式

&#8195;&#8195;命令模式是最简单和优雅的模式之一，命令模式中的`命令`指的是一个执行某些特定事情的指令。

&#8195;&#8195;应用场景：需要向某些对象发送请求，但是并不知道请求的接收者是谁，也不知道请求的操作是什么。核心就是`将请求发送者和接收者解耦`。

```js
var closeDoorCommand = {     
    execute: function(){         
        console.log( '关门' );     
    } 
}; 
 
var openPcCommand = {     
    execute: function(){         
        console.log( '开电脑' );     
    } 
}
var openQQCommand = {     
    execute: function(){         
        console.log( '登录 QQ' );     
    } 
}; 
//宏命令:命令模式和组合模式的产物。
var MacroCommand = function(){     
    return {         
        commandsList: [],         
        add: function( command ){             
            this.commandsList.push( command );         
        },         
        execute: function(){             
            for ( var i = 0, command; command = this.commandsList[ i++ ]; ){
                command.execute();             
            }         
        }     
    } 
}; 
 
var macroCommand = MacroCommand(); 
macroCommand.add( closeDoorCommand ); 
macroCommand.add( openPcCommand ); 
macroCommand.add( openQQCommand ); 
 
macroCommand.execute(); 
```

---

### 7、组合模式

&#8195;&#8195;将对象组合成树形结构，以表示"部分-整体"的层次结构。通过对象的多态性表现，使得用户对单个对象和组合对象的使用具有一致性。

**缺点**

+ 系统中额每个对象看起来和其他对象都差不多。代码在运行起来的时候区别才会显示出来，使得代码难以理解。
+ 组合模式如果创建了太多的对象，可能会让系统负担不起。

**优点**

+ 表示树形结构：提供了一种遍历树形结构的方案，通过调用组合对象的execute方法，程序会递归调用组合对象下面的叶对象的execute方法。

+ 利用对象多态性统一的对待组合对象和单个对象。对象的多态性表现，可以忽略组合对象和单个对象的不同。在组合模式中，不需要关心是组合对象还是单个对象。

  **组合模式使用场景**

+ 表示对象的部分-整体层次结构。
+ 客户希望统一对待树中的所有对象。

```js
let MacroCommand = function() {
      return {
        commandList: [],
        add: function(command) {
          this.commandList.push(command);
        },
        execute: function() {
          for (let i = 0,command;command=this.commandList[i++];) {
            command.execute();
          }
        }
      };
    };
    var openAcCommand = {
      execute: function() {
        console.log("打开空调");
      },
      add：function(){
           throw new Error( '叶对象不能添加子节点' ); 
      }
    };
    var openTvCommand = {
      execute: function() {
        console.log("打开电视");
      }
    };
    var openSoundCommand = {
      execute: function() {
        console.log("打开音响");
      }
    };
    //组合命令1
    var macroCommand1 = MacroCommand();
    macroCommand1.add(openTvCommand);
    macroCommand1.add(openSoundCommand);

    /*********关门、打开电脑和打登录 QQ 的命令****************/

    var closeDoorCommand = {
      execute: function() {
        console.log("关门");
      }
    };

    var openPcCommand = {
      execute: function() {
        console.log("开电脑");
      }
    };

    var openQQCommand = {
      execute: function() {
        console.log("登录 QQ");
      }
    };
    //组合命令2
    var macroCommand2 = MacroCommand();
    macroCommand2.add(closeDoorCommand);
    macroCommand2.add(openPcCommand);
    macroCommand2.add(openQQCommand);

    /*********现在把所有的命令组合成一个“超级命令”**********/
	//超集组合命令
    var macroCommand = MacroCommand();
    macroCommand.add(openAcCommand);
    macroCommand.add(macroCommand1);
    macroCommand.add(macroCommand2);
    /*********最后给遥控器绑定“超级命令”**********/

    var setCommand = (function(command) {
      document.getElementById("btn").onclick = function() {
        command.execute();
      };
    })(macroCommand);
```

**利用组合模式扫描文件夹**

```js
class Folder {
    constructor(name) {
        this.name = name;
        this.files = [];
        this.parent=null;
    };
    add(file) {
        file.parent=this;
        this.files.push(file);
    };
    scan() {
        console.log("开始扫描文件夹:"+this.name)
        for (let i = 0, file; file = this.files[i++];) {
            file.scan();
        }
    };
    remove(){
        if(!this.parent){
            return;
        }
        for(let files=this.parent.files,len=files.length;len--;){
            let file=files[len];
            if(file===this){
                files.splice(len,1);
            }
        }
    }
}
//文件类
class File {
    constructor(name) {
        this.name = name;
        this.parent=null;
    };
    add() {
        throw new Error("文件下面不能再添加文件")
    };
    scan() {
        console.log("开始扫描文件")
        console.log("文件名为:" + this.name)
    };
     remove(){
        if(!this.parent){
            return;
        }
        for(let files=this.parent.files,len=files.length;len--;){
            let file=files[len];
            if(file===this){
                files.splice(len,1);
            }
        }
    }
}
var folder = new Folder('学习资料'); 
var folder1 = new Folder('JavaScript'); 
var folder2 = new Folder('jQuery');

var file1 = new File('JavaScript 设计模式与开发实践'); 
var file2 = new File('精通 jQuery'); 
var file3 = new File('重构与模式')


folder1.add(file1); 
folder2.add(file2);

folder.add(folder1); 
folder.add(folder2); 
folder.add(file3);
var folder3 = new Folder('Nodejs'); 
var file4 = new File('深入浅出 Node.js');
folder3.add(file4);

var file5 = new File('JavaScript 语言精髓与编程实践');
folder.add(folder3);
folder.add(file5);
folder1.remove();
folder.scan();
```

---

### 8、模板方法模式

&#8195;&#8195;是一种只需要使用继承就可以实现的简单模式。

&#8195;&#8195;模板方法模式由两部分结构组成，第一部分是抽象类，第二部分是具体的实现子类。抽象父类中封装子类的算法框架，包括公共方法和子类中所有方法的执行顺序。子类通过继承抽象类，来继承整个算法结构，也可以选择重写父类的方法。

&#8195;&#8195;**提示：** 很多时候都不需要依样画瓢的去实现一个模板方法模式，高阶函数式更好的选择。

```js
class Beverage {
    boilWater() {
        console.log("把水煮沸");
    };
    brew() {
        throw new Error("子类必须重写brew方法");
    };
    pourInCup() {
        throw new Error("子类必须重写pourInCup 方法");
    };
    addCondiments() {
        throw new Error("子类必须重写 addCondiments 方法");
    };
    //钩子函数
    customerWantsCondiments() {
        return true; // 默认需要调料
    };
    init() {
        this.boilWater();
        this.brew();
        this.pourInCup();
        if (this.customerWantsCondiments()) {
            // 如果挂钩返回 true，则需要调料
            this.addCondiments();
        }
    }
}
class CoffeeWithHook extends Beverage {
    constructor() {
        super();
    };
    boilWater() {
        console.log("把水煮沸");
    };
    brew() {
        console.log("用沸水冲泡咖啡");
    };
    pourInCup() {
        console.log("把咖啡倒进杯子");
    };
    addCondiments() {
        console.log('加糖和牛奶' );
    };
    customerWantsCondiments() {
        return window.confirm("请问需要调料吗？");
    }
}
var coffeeWithHook = new CoffeeWithHook(); 
coffeeWithHook.init(); 
```

---

### 9、享元模式

​&#8195;&#8195;享元（flyWeight）模式是一种用于**性能优化**的模式。其核心是运用`共享技术`来有效支持大量细粒度的对象。享元模式要求把对象的属性划分为内部状态和外部状态（状态也就是属性）。其目标是尽量减少共享对象的数量。

**内部状态和外部状态的划分原则：**

+ 内部状态存储于对象内部。

+ 内部状态被一些对象共享。

+ 内部状态独立于具体的场景，通常不会改变。

+ 外部状态取决于具体的场景，并根据场景而变化，外部状态不能被共享。

  **享元模式的适用性**

+ 一个程序中使用了大量的相似对象。

+ 由于使用了大量对象，造成了很大的内存开销。

+ 对象的大多数状态都可以变为外部状态。

+ 剥离出对象的外部状态之后，可以用相对较少的共享对象取代大量对象。

**1、享元模式之文件上传**

```js
//创建共享对象（内部状态）
class Upload {
    constructor(uploadType) {
        this.uploadType = uploadType;
    };
    delFile(id) {
        if (this.fileSize < 3000) {
            return this.dom.parentNode.removeChild(this.dom);
        }

        if (window.confirm("确定要删除该文件吗? " + this.fileName)) {
            return this.dom.parentNode.removeChild(this.dom);
        }
    }
}
//创建上传类工厂
class UploadFactory {
    constructor() {
        this.createdFlyWeightObjs = {};
    }
    //创建共享对象
    create(uploadType) {
        if (this.createdFlyWeightObjs[uploadType]) {
            return this.createdFlyWeightObjs[uploadType];
        }
        this.createdFlyWeightObjs[uploadType] = new Upload(uploadType)
        return this.createdFlyWeightObjs[uploadType] ;
    }
}
//封装外部状态
class UploadManager {
    constructor() {
        this.uploadDatabase = {};
    }
    add(id, uploadType, fileName, fileSize) {
        //创建享元对象
        const uploadObj=new UploadFactory();
        var flyWeightObj = uploadObj.create(uploadType);
        const dom=this.addDivDom(id,fileName,fileSize,flyWeightObj);
        this.uploadDatabase[id] = {
            fileName: fileName,
            fileSize: fileSize,
            dom: dom
        };

        return flyWeightObj;
    };
    addDivDom(id,fileName,fileSize,flyWeightObj){
        let dom = document.createElement("div");
        dom.innerHTML = `<span>文件名称: ${fileName}, 文件大小:${fileSize} </span><button class="delFile">删除</button>`;

        dom.querySelector(".delFile").onclick = ()=>{
            this.setExternalState(id, flyWeightObj);
            flyWeightObj.delFile(id);
        };
        document.body.appendChild(dom);
        return dom;
    };
    //设置外部状态
    setExternalState(id, flyWeightObj) {
        var uploadData = this.uploadDatabase[id];
        Object.keys(uploadData).forEach(key=>{
            flyWeightObj[key] = uploadData[key];
        })
    }
}
let id = 0;
const startUpload = (uploadType, files) => {
    const uploadManager=new UploadManager();
    for (var i = 0, file; (file = files[i++]); ) {
        var uploadObj = uploadManager.add(
            ++id,
            uploadType,
            file.fileName,
            file.fileSize
        );
    }
};
startUpload("plugin", [
    { fileName: "1.txt", fileSize: 1000 },
    { fileName: "2.html", fileSize: 3000 },
    { fileName: "3.txt", fileSize: 5000 }
]);
startUpload("flash", [
    { fileName: "4.txt", fileSize: 1000 },
    { fileName: "5.html", fileSize: 3000 },
    { fileName: "6.txt", fileSize: 5000 }
]);
//有多少种内部状态的组合，就有多少个共享对象。
```

**2、对象池**

&#8195;&#8195;对象池也是一种性能优化方案，跟享元模式有一些相似之处，但是没有分离内部状态和外部状态。

```js
class ObjectPoolFactory {
    constructor(createObjFn) {
        this.objectPool = [];
    }
    create(createObjFn) {
        let obj =
            this.objectPool.length === 0
        ? createObjFn.apply(this, arguments)
        : this.objectPool.shift();

        return obj;
    };//回收节点
    recover(obj) {
        this.objectPool.push(obj);
    }
}
function createIframe() {
    var iframe = document.createElement("iframe");
    document.body.appendChild(iframe);

    iframe.onload = function() {
        iframe.onload = null;
        // 防止 iframe 重复加载的 bug
        new ObjectPoolFactory().recover(iframe);
        // iframe 加载完成之后回收节点
    };
    return iframe;
}
let ObjectPool= new ObjectPoolFactory();
let iframe1=ObjectPool.create(createIframe);

iframe1.src='http://baidu.com'; 
let iframe2=ObjectPool.create(createIframe);
iframe2.src='http://QQ.com'; 
let iframe3=ObjectPool.create(createIframe);
iframe3.src='http://QQ.com';
```

----

### 10、职责链模式

**定义：** 使多个对象都有机会处理请求，从而避免请求的发送者和接收者之间的耦合关系，将这些对象连城一条链，并沿着这条链传递该请求，直到有一个对象处理它为止。

**优点：**

+ 请求发送者只需要知道链中的第一个节点。弱化了发送者和一组接收者之间的强联系。
+ 链中的节点对象可以灵活拆分重组。
+ 可以手动指定起始节点，请求并不非得从链中的第一个节点开始传递。

**缺点：**

+ 我们不能保证某个请求一定会被链中的节点处理。这种情况可以在链尾增加一个节点专门来处理异常。
+ 职责链可能会使得过程中会增加许多没有起到实质性作用的节点，会产生性能损耗。

**职责链模式的常用场景：** 早高峰坐公交投币。（将硬币往前传递给售票员）

实例：电商网站

```js
 class Chain{
     constructor(fn) {
         this.fn=fn;
         this.successor =null;
     };
     setNextSuccessor(successor ){
         //return 供链式调用
        return this.successor =successor 
     }
     passRequest(){
         //判断执行结果是不是nextSuccessor，是的话，继续往下执行
         const result=this.fn.apply(this,arguments);
         if(result==="nextSuccessor"){
             //递归,直到val不等于nextSuccessor为止
             return this.successor&& this.successor.passRequest.apply(this.successor,arguments)
         }
         return val;
     }
 }
const order500=(orderType,pay,stock)=>{
    if(orderType==1&&pay===true){
        console.log("500 元定金预购, 得到 100 优惠券");
        return;
    }else{
        return 'nextSuccessor'
    }
}
const order200=(orderType,pay,stock)=>{
    if(orderType==2&&pay===true){
        console.log("200 元定金预购, 得到 50 优惠券");
        return;
    }else{
        return 'nextSuccessor'
    }
}
const orderNormal =(orderType,pay,stock)=>{
    if(stock>0){
        console.log( '普通购买，无优惠券' ); 
    }else{
        console.log( '手机库存不足' ); 
    }
}
var chainOrder500 = new Chain( order500 ); 
var chainOrder200 = new Chain( order200 ); 
var chainOrderNormal = new Chain( orderNormal ); 
chainOrder500.setNextSuccessor( chainOrder200 )
    .setNextSuccessor( chainOrderNormal ); 
chainOrder500.passRequest( 1, true, 500 );    // 输出：500 元定金预购，得到 100 优惠券 
chainOrder500.passRequest( 2, true, 500 );    // 输出：200 元定金预购，得到 50 优惠券 
chainOrder500.passRequest( 3, true, 500 );    // 输出：普通购买，无优惠券 
chainOrder500.passRequest( 1, false, 0 );     // 输出：手机库存不足 
```

**用AOP实现职责链**

```js
const order500=(orderType,pay,stock)=>{
    if(orderType==1&&pay===true){
        console.log("500 元定金预购, 得到 100 优惠券");
        return;
    }else{
        return 'nextSuccessor'
    }
}
const order200=(orderType,pay,stock)=>{
    if(orderType==2&&pay===true){
        console.log("200 元定金预购, 得到 50 优惠券");
        return;
    }else{
        return 'nextSuccessor'
    }
}
const orderNormal =(orderType,pay,stock)=>{
    if(stock>0){
        console.log( '普通购买，无优惠券' ); 
    }else{
        console.log( '手机库存不足' ); 
    }
}
//切换编程
Function.prototype.after = function( fn ){     
    var self = this;     
    return function(){         
        var ret = self.apply( this, arguments );         
        if ( ret === 'nextSuccessor' ){             
            return fn.apply( this, arguments );         
        } 
        return ret;     
    } 
}; 
var order = order500.after( order200 ).after( orderNormal ); 

order( 1, true, 500 );    // 输出：500 元定金预购，得到 100 优惠券 
order( 2, true, 500 );    // 输出：200 元定金预购，得到 50 优惠券 
order( 1, false, 500 );   // 输出：普通购买，无优惠券 
```

---

### 11、中介者模式

中介者模式的作用就是解除对象和对象之间的紧耦合关系。

**优点：** 以中介者和对象的一对多关系取代了对象之间的网状多对多关系。每个对象只需要关注自身功能的实现即可。对象之间的交互关系交给中介者来实现和维护。

**缺点：** 系统中会增加一个中介者对象，对象之间的交互复杂性，转移成了中介者对象的复杂性，使得中介者对象自身会成为一个难以维护的对象。

**实例：用中介者模式实现泡泡堂游戏**

```js
    class Player {
      constructor(name, teamColor) {
        this.name =name;
        this.teamColor = teamColor;
        this.state = "alive";
        this.add();
      };
      win() {
        console.log(`玩家${this.name}赢了`);
      };
      lose() {
        console.log(`玩家${this.name}输了`);
      };
      add(){
        if(!Player.playDirector){
          Player.playDirector=new PlayDirector();
        }    
        Player.playDirector.addPlayer(this);
      };
      die() {
        this.state = "dead";
        // 给中介者发送消息，玩家死亡
        Player.playDirector.playerDead(this);
      };
      remove() {
        console.log(`玩家${this.name}掉线了`);
        Player.playDirector.removePlayer(this);
      };
      changeTeam(color) {
        console.log(`玩家${this.name}叛变了`);
        // 给中介者发送消息，玩家换队
        Player.playDirector.changeTeam(this, color);
      }
    }
    Player.playDirector=null;

    class PlayDirector {
      constructor() {
        this.players = {};
      }
      addPlayer(player) {
        let teamColor = player.teamColor; //玩家额队伍颜色
        this.players[teamColor] = this.players[teamColor] || [];
        this.players[teamColor].push(player); //添加玩家
      }
      //移除玩家
      removePlayer(player) {
        let teamColor = player.teamColor;
        let teamPlayers = this.players[teamColor] || [];
        const index = teamPlayers.indexOf(player);
        index>-1 && teamPlayers.splice(index, 1);
      }
      //玩家换队
      changeTeam(player, newTeamColor) {
        this.removePlayer(player); // 从原队伍中删除
        player.teamColor = newTeamColor; // 改变队伍颜色         operations.addPlayer( player );       // 增加到新队伍中
      }
      //玩家死亡
      playerDead(player) {
        // 玩家死亡
        var teamColor = player.teamColor,
          teamPlayers = this.players[teamColor]; // 玩家所在队伍
        var all_dead = true;
        for (var i = 0, player; (player = teamPlayers[i++]); ) {
          if (player.state !== "dead") {
            all_dead = false;
            break;
          }
        }
        if (all_dead === true) {
         
          // 全部死亡
          for (var i = 0, player; (player = teamPlayers[i++]); ) {
            player.lose(); // 本队所有玩家 lose
          }
          console.log(teamColor+"队输了")
          for (var color in this.players) {
            if (color !== teamColor) {
              var teamPlayers = this.players[color]; // 其他队伍的玩家
              for (var i = 0, player; (player = teamPlayers[i++]); ) {
                player.win(); // 其他队伍所有玩家 win
              }
            }
          }
        }
      }
    }
    //测试
    // 红队： 
    var player1 = new Player( '皮蛋', 'red' ),     
    player2 = new Player( '小乖', 'red' ),     
    player3 = new Player( '宝宝', 'red' ),     
    player4 =new Player( '小强', 'red' ); 
 
    // 蓝队： 
    var player5 = new Player( '黑妞', 'blue' ),     
    player6 = new Player( '葱头', 'blue' ),     
    player7 = new Player( '胖墩', 'blue' ),     
    player8 = new Player( '海盗', 'blue' ); 

    //红队全部死亡
    // player1.die(); 
    // player2.die(); 
    // player3.die(); 
    // player4.die();

    //玩家 player1和player1掉线
    // player1.remove();
    // player2.remove(); 
    // player3.die(); 
    // player4.die(); 
    
    //玩家1叛变
    player1.changeTeam( 'blue' );
    player2.die(); 
    player3.die();
    player4.die();
```

### 12、装饰器模式

&#8195;&#8195;给对象动态的增加职责的方式称为`装饰者模式`。装饰者模式能够在不改变对象自身的基础上，在程序运行期间给对象动态的添加职责。是一种`即用即付`的方式。

&#8195;&#8195;装饰者模式将一个对象嵌入到另一个对象中，实际上相当于这个对象被另一个对象包装起来，形成一条包装链。请求随着这条链依次传递到所有的对象，每个对象都有处理这条请求的机会。

**1、模拟传统面向对象语言的装饰者模式**

&#8195;&#8195;分析：给对象动态增加职责的方式，并没有真正地改动对象自身，而是将对象放入另一个对象 之中，这些对象以一条链的方式进行引用，形成一个聚合对象。这些对象都拥有相同的接口（fire 方法），当请求达到链中的某个对象时，这个对象会执行自身的操作，随后把请求转发给链中的 下一个对象。 

```js
var Plane = function(){} 
//
Plane.prototype.fire = function(){     
    console.log( '发射普通子弹' ); 
} 
//接下来增加两个装饰类，分别是导弹和原子弹： 
var MissileDecorator = function( plane ){     
    this.plane = plane; 
}


MissileDecorator.prototype.fire = function(){     
    this.plane.fire();     
    console.log( '发射导弹' ); 
} 
//将一个对象放入另一个对象中
var AtomDecorator = function( plane ){     
    this.plane = plane; 
} 
//给对象动态添加职责
AtomDecorator.prototype.fire = function(){     
    this.plane.fire();     
    console.log( '发射原子弹' ); 
} 
var plane = new Plane(); 
plane = new MissileDecorator( plane ); 
plane = new AtomDecorator( plane ); 
plane.fire();
```

**2、装饰函数**

```js
var a = function(){     
    alert (1); 
} 
var _a = a; 
a = function(){     
    _a();     
    alert (2); 
} 
a();
```

**装饰函数的优点：**

​&#8195;&#8195;将行为依照职责分成粒度更细的函数，随后通过装饰把它们合并到一起，这有助于我 们编写一个松耦合和高复用性的系统。 

**装饰函数缺点：**

+ 必须维护中间变量，如果函数的装饰链较长，或者 需要装饰的函数变多，这些中间变量的数量也会越来越多。 

+  this 被劫持的问题。

  ```js
  var _getElementById = document.getElementById; 
   
  document.getElementById = function( id ){     
      alert (1);// (1)      
      return _getElementById( id ); // 输出： Uncaught TypeError: Illegal invocation       	
  } 
   //document.getElementById方法的内部实现需要 使用 this 引用，this 在这个方法内预期是指向 document，而不是 window,调用_getElementById( id )方法时内部的this指向的是window。
   
  ```

**3、用AOP装饰函数**（给函数动态添加功能）

```js
Function.prototype.before = function( beforefn ){     
    var __self = this;  // 保存原函数的引用     
    return function(){    // 返回包含了原函数和新函数的"代理"函数         
        beforefn.apply( this, arguments );  // 执行新函数，且保证 this 不被劫持，新函数接受的参数,
        //也会被原封不动地传入原函数，新函数在原函数之前执行(前置装饰) ，这样就实现了动态装饰的效果                                             
        return __self.apply( this, arguments );  // 执行原函数并返回原函数的执行结果，并且保证 this 不被劫持    
    } 
} 
//不污染原型的写法
var before = function( fn, beforefn ){     
    return function(){         
        beforefn.apply( this, arguments );         
        return fn.apply( this, arguments );     
    } 
} 
Function.prototype.after = function( afterfn ){     
    var __self = this;     
    return function(){         
        var ret = __self.apply( this, arguments );         
        afterfn.apply( this, arguments );          
        return ret;     
    } 
}
//不污染原型的写法
var after = function( fn, beforefn ){     
    return function(){         
        var ret = fn.apply( this, arguments );         
        afterfn.apply( this, arguments );          
        return ret;     
    } 
} 
//测试
var a = before(
    function () { console.log(3) },
    function () { console.log(2) }
);

a = before(a, function () { 
    console.log(1); 
}); 
a();//顺序输出1,2,3
```

**3、1 AOP的应用实例**

&#8195;&#8195;装饰行为依照职责分成粒度更细的函数，随后通过装饰把它们合并到一起，这有助于我 们编写一个松耦合和高复用性的系统。 

+ **数据统计上报**

  分离业务代码和数据统计代码。

  ```js
  //业务代码
  var showLogin = function(){         
      console.log( '打开登录浮层' );     
  } 
  var log = function(){         
      console.log( '上报标签为: ' + this.getAttribute( 'tag' ) );     
  }
  //数据统计代码
  showLogin = showLogin.after( log );    // 打开登录浮层之后上报数据 
  document.getElementById( 'button' ).onclick = showLogin; 
  ```

+ **用AOP动态改变函数的参数**

  ```js
  var func = function( param ){     
      console.log( param );    // 输出： {a: "a", b: "b"}  
  } 
  func = func.before( function( param ){     
      param.b = 'b'; 
  }); 
  //在调用func之前调用before
  func( {a: 'a'} );
  ```

+ **插件式的表单验证**

  ```js
   Function.prototype.before = function (beforefn) {
       var __self = this; return function () {
           if (beforefn.apply(this, arguments) === false) {
               // beforefn 返回 false 的情况直接 return，不再执行后面的原函数            
               return;
           }
           return __self.apply(this, arguments);
       }
   }
  //代码验证
  var validata = function () {
      if (username.value === '') {
          alert('用户名不能为空');
          return false;
      }
      if (password.value === '') {
          alert('密码不能为空');
          return false;
      }
  }
  //代码提交
  var formSubmit = function () {
      var param = { username: username.value, password: password.value }
      ajax('http:// xxx.com/login', param);
  }
  //将代码验证和代码提交耦合性降低
  formSubmit = formSubmit.before(validata);
  submitBtn.onclick = function () {
      formSubmit();
  }
  ```

**3.2 用AOP装饰函数的缺点**

+ 通过 Function.prototype.before 或者 Function.prototype.after 被装 饰之后，返回的实际上是一个新的函数，如果在原函数上保存了一些属性，那么这些属性会丢失。因为原函数所指向的内存地址发生了变化，原函数指向了另一个函数。

  ```js
  var func = function () { alert(1); } 
  func.a = 'a';
  func = func.after(function () { alert(2); });
  alert(func.a);   // 输出：undefined 
  ```

+ 这种装饰方式也叠加了函数的作用域，如果装饰的链条过长，性能上也会受到一些 影响。 

**4、装饰者模式和代理模式的区别**

**相同点：** 都描述了怎样为对象提供一定程度上的间接引用。它们的实现部分都保留了对另一个对象的引用（`返回一个函数`），并且向那个对象发送请求(`调用返回的函数`)。

**区别：** 最主要的区别在于设计目的和意图。

+ 代理模式的目的在于当直接访问本体或者不方便访问本体时，为本体提供一个替代者，代理可以拦截一些对本体的访问请求。或者再访问本体之前做一些额外的事情。`代理模式强调的是一种在一开始就确定的静态关系`。代理模式通常只有一层`代理-本体`的引用。
+ 装饰者模式在一开始不能确定对象的全部功能。而装饰者模式常常会形成一条装饰者链。

### 13、状态模式
**定义：** 允许一个对象在其内部状态改变时改变它的行为，对象看起来似乎修改了它的类。

状态模式的关键是`区分事物的内部状态`，因为事物内部状态的改变往往会引起事物行为的改变。

状态模式的关键是把`事物的每种状态都封装成单独的类`，跟此类有关的行为都被封装在这个类的内部。

**状态模式的通用结构**

```js
class State{
    constructor(light){
        this.light=light;
    };
    buttonPress(state){
        // this.light.setState( this.light.offLightState );
        this.light.setState( state ); 
    }
}
class OffLightState extends State{
    constructor(){
        super(this);
    };
}
class WeakLightState{
    constructor(light){
        super(light);
    }
}
class StrongLightState{
    constructor(light){
        super(light);
    }
}
class SuperStrongLightState{
    constructor(light){
        super(light);
    }
}
class Light{
    constructor(){
        this.offLightState = new OffLightState( this );    // 持有状态对象的引用    		   // 将对象保存为对象的属性。
        this.weakLightState = new WeakLightState( this );    
        this.strongLightState = new StrongLightState( this );   
        this.superStrongLightState = new SuperStrongLightState( this );  
        this.button = null; 
    };
    init(){
        this.currentState=this.offLightState;
        this.button=document.createElement("button");
        this.button.innerHTML="开关";
        this.button.onclick=()=>{
            this.currentState.buttonPress();
        }
    };
    setState(newState){
        this.currentState = newState; 
    }
}
var light = new Light(); 
light.init(); 
```

**状态模式的优缺点**

​	**缺点：** 会在系统中定义许多状态类。

​	**优点**

+ 状态模式定义了状态与行为之间的关系，并将它们封装在一个类里。通过增加新的状态 ，很容易增加新的状态和转换。 
+ 避免 Context（Light类）无限膨胀，状态切换的逻辑被分布在状态类中，也去掉了 Context中原本过多的条件分支。
+   用**对象代替字符串来记录当前状态**，使得状态的切换更加一目了然。 
+  Context中的请求动作和状态类中封装的行为可以非常容易地独立变化而互不影响。

**状态模式和策略模式的关系**

**区别：**`策略模式`中的各个策略类之间是平等又平行的，它们之间没有任何联系， 所以客户必须熟知这些策略类的作用，以便客户可以随时主动切换算法。在`状态模式`中，状态 和状态对应的行为是早已被封装好的，状态之间的切换也早被规定完成，“改变行为”这件事情 发生在状态模式内部。

**相同点：** 都有一个上下文、一些策略或者状态类，上下文把请 求委托给这些类来执行。

---

### 14、适配器模式

```js
var guangdongCity = { 
    shenzhen: 11, 
    guangzhou: 12, 
    zhuhai: 13 
};
var getGuangdongCity = function () {
    var guangdongCity = [
        { name: 'shenzhen', id: 11, },
        { name: 'guangzhou', id: 12, }
    ];
    return guangdongCity;
};
var render = function (fn) {
    console.log('开始渲染广东省地图');
    document.write(JSON.stringify(fn()));
};

var addressAdapter = function (oldAddressfn) {
    var address = {}, oldAddress = oldAddressfn();
    for (var i = 0, c; c = oldAddress[i++];) {
        address[c.name] = c.id;
    }
    return function () {
        return address;
    }
};
render(addressAdapter(getGuangdongCity));
```

**适配器模式、装饰者模式、代理模式和外观模式的区别**

**相同点：** 都属于`包装模式`。都是由一个对象来包装另一个对象。

**区别：**

+ **适配器模式**主要是用来解决两个接口之间不匹配的问题。不考虑这些接口是怎样实现的，也不考虑这些接口将来怎么变化。

+ **装饰者模式和代理模式**也不会改变原有对象的接口，但**装饰者模式**的作用是为了给对象增加功能。装饰者模式常常形成一条长的装饰链，而适配器模式通常只包装一次。**代理模式**是为了控制对对象的访问，通常也只包装一次。 

+ 外观模式的作用和适配器比较相似，有人把外观模式看成一组对象的适配器，但外观模式显著的特点是**定义了一个新的接口。** 

  

## 二、设计原则和编程技巧

### 1、第一职责原则

​		第一职责原则（Single Resonsibility Principle——SRP），体现为一个对象（方法）只做一件事情。

​		**优点：** 降低了单个类或对象的复杂度，按照职责将对象分解为更小的粒度，这有助于代码的复用，同时也有助于单元测试。这样当一个职责变更的时候，不会影响到其他的功能。降低了代码耦合度。

​		**不足：** 会增加编写代码的复杂度。将对象按照职责分解成更小粒度后，同时也增加了这些对象互相联系的难度。

​		设计模式中有用到第一职责原则的有`单例模式、代理模式、迭代器模式、装饰者模式`。

### 2、最少知识原则

​		最少知识原则（Least Knowledge Principle——LKP），指的是一个对象尽量减少与其他对象之间发生相互作用。

​		设计模式中用到最少知识原则的是`中介者模式、外观模式、`。封装也是最少知识原则的一种体现。

### 3、开放封闭原则

​		开放封闭原则（Open Closed Principle——OCP）。当需要改变一个程序的功能或者说是要给该程序增加新功能时，可以使用增加代码的方式，但是不要不允许更改程序的原代码。

​		AOP动态装饰函数就很好的运用到了开放闭合原则。

​		开放闭合原则最重的就是把程序中变化的部分找出并封装起来，将程序中不变和变化的部分隔离开来。

​		**实行开放封闭原则的常见方法有：**

- 利用对象的多态性。

- **放置挂钩**。在程序有可能发生变化的地方放置一个挂钩，挂钩的返回结果决定了程序的下一步走向

- **使用回调函数**。以把一部分易于变化的逻辑封装在回调函数里，然后把回调函数当作参数传入一个稳定和封闭的函数中。当回调函数被执行的时候，程序就可以因为回调函数的内部逻辑不同，而产生不同的结果

  设计模式中用到开放闭合原则的主要有`发布订阅模式、模板方法模式、策略模式、代理模式、职责链模式`。

### 4、代码重构

​			模式和重构有着一种与生俱来的关系，设计模式的行为的目标就是为了代码重构做准备。

​	**代码重构的主要手段**

- 提炼函数。

- 合并重复的条件片段。

- 把条件分支语句提炼成函数。

  ```js
  var isSummer = function(){     
      var date = new Date();     
      return date.getMonth() >= 6 && date.getMonth() <= 9;     
  }; 
   
  var getPrice = function( price ){     
      if ( isSummer() ){    // 夏天         
          return price * 0.8;     
      }     
      return price; 
  }; 
  ```

- 合理使用循环。

  ```js
  var createXHR = function(){ 
      var versions= [ 'MSXML2.XMLHttp.6.0ddd', 'MSXML2.XMLHttp.3.0', 'MSXML2.XMLHttp' ];     
      for ( var i = 0, version; version = versions[ i++ ]; ){         
          try{             
              return new ActiveXObject( version );         
          }catch(e){ 
   
          }     
      } 
  }; 
   
  var xhr = createXHR(); 
  ```

- 提前让函数退出代替嵌套条件分支 。

  ```js
  var del = function( obj ){     
      if ( obj.isReadOnly ){    
          // 反转 if 表达式         
          return;     
      }     
      if ( obj.isFolder ){         
          return deleteFolder( obj );     
      }     
      if ( obj.isFile ){         
          return deleteFile( obj );     
      } 
  }; 
  ```

- 传递对象参数代替过长的参数列表 

  ```js
  var setUserInfo = function( obj ){     
      console.log( 'id= ' + obj.id );     
      console.log( 'name= ' + obj.name );     
      console.log( 'address= ' + obj.address );     
      console.log( 'sex= ' + obj.sex );     
      console.log( 'mobile= ' + obj.mobile );     
      console.log( 'qq= ' + obj.qq ); 
  }; 
  setUserInfo({ id: 1314, name: 'sven', address: 'shenzhen', sex: 'male', mobile: '137********', qq: 377876679 }); 
  ```

- 尽量减少参数数量 

- 少用三目运算符 

- 合理使用链式调用

- 分解大型类 

- 用return 退出多重循环 

  ```js
  var func = function(){     
      for ( var i = 0; i < 10; i++ ){         
          for ( var j = 0; j < 10; j++ ){             
              if ( i * j >30 ){ 
                  //避免有代码没有被执行
                  return print( i );            
              }         
          }     
      } 
  }; 
  ```

  <Valine></Valine>

  

  

  