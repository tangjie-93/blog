---
title: mvvm概念、原理及实现
date: '2020-01-14'
type: 技术
tags: vue
note: mvvm概念、原理及实现
---
### 1、MVVM的概念

​		**model-view-viewModel，通过数据劫持+发布订阅模式来实现。**

&#8195;&#8195;mvvm是一种设计思想。Model代表数据模型，可以在model中定义数据修改和操作的业务逻辑;view表示ui组件，负责将数据模型转换为ui展现出来，它做的是数据绑定的声明、 指令的声明、 事件绑定的声明。;而viewModel是一个同步view和model的对象。在mvvm框架中，view和model之间没有直接的关系，它们是通过viewModel来进行交互的。mvvm不需要手动操作dom，只需要关注业务逻辑就可以了。
&#8195;&#8195;mvvm和mvc的区别在于：mvvm是数据驱动的，而MVC是dom驱动的。mvvm的优点在于不用操作大量的dom，不需要关注model和view之间的关系，而MVC需要在model发生改变时，需要手动的去更新view。大量操作dom使页面渲染性能降低，使加载速度变慢，影响用户体验。

###  2、mvvm的优点

+ 1、低耦合性 view和model之间没有直接的关系，通过viewModel来完成数据双向绑定。
+ 2、可复用性 组件是可以复用的。可以把一些数据逻辑放到一个viewModel中，让很多view来重用。
+ 3、独立开发 开发人员专注于viewModel，设计人员专注于view。
+ 4、可测试性 ViewModel的存在可以帮助开发者更好地编写测试代码。

### 3、mvvm的缺点

+ 1、bug很难被调试，因为数据双向绑定，所以问题可能在view中，也可能在model中，要定位原始bug的位置比较难，同时view里面的代码没法调试，也添加了bug定位的难度。
+ 2、一个大的模块中的model可能会很大，长期保存在内存中会影响性能。
+ 3、对于大型的图形应用程序，视图状态越多，viewModel的构建和维护的成本都会比较高。

### 4、mvvm的双向绑定原理
&#8195;&#8195;mvvm的核心是数据劫持、数据代理、数据编译和"发布订阅模式"。

**1、数据劫持——就是给对象属性添加get,set钩子函数。**

+ 1、观察对象，给对象增加Object.defineProperty
+ 2、vue的特点就是新增不存在的属性不会给该属性添加get、set钩子函数。
+ 3、深度响应。循环递归遍历data的属性，给属性添加get，set钩子函数。
+ 4、每次赋予一个新对象时（即调用set钩子函数时），会给这个新对象进行数据劫持(defineProperty)。
```javascript
//通过set、get钩子函数进行数据劫持
function defineReactive(data){
    Object.keys(data).forEach(key=>{
        const dep=new Dep();
        let val=data[key];
        this.observe(val);//深层次的监听
        Object.defineProperty(data,key,{
            get(){
                //添加订阅者watcher（为每一个数据属性添加订阅者，以便实时监听数据属性的变化——订阅）
                Dep.target&&dep.addSub(Dep.target);
                //返回初始值
                return val;
            },set(newVal){
                if(val!==newVal){
                    val=newVal;
                    //通知订阅者，数据变化了（发布）
                    dep.notify();
                    return newVal;
                }
            }
        })
    })
}
```
**2、数据代理**

&#8195;&#8195;将`data,methods,compted`上的数据挂载到`vm`实例上。让我们不用每次获取数据时，都通过mvvm._data.a.b这种方式，而可以直接通过mvvm.b.a来获取。
```javascript
class MVVM{
    constructor(options){
        this.$options=options;
        this.$data=options.data;
        this.$el=options.el;
        this.$computed=options.computed;
        this.$methods=options.methods;
        //劫持数据，监听数据的变化
        new Observer(this.$data);
        //将数据挂载到vm实例上
        this._proxy(this.$data);
        //将方法也挂载到vm上
        this._proxy(this.$methods);
        //将数据属性挂载到vm实例上
        Object.keys(this.$computed).forEach(key=>{
            Object.defineProperty(this,key,{
                get(){
                    return this.$computed[key].call(this);//将vm传入computed中
                }
            })
        })
        //编译数据
        new Compile(this.$el,this)
    };
    //私有方法，用于数据劫持
    _proxy(data){
        Object.keys(data).forEach(key=>{
            Object.defineProperty(this,key,{
                get(){
                    return data[key]
                }
            })
        })
        
    }
}    
```
**3、数据编译**

&#8195;&#8195;把`{{}},v-model,v-html,v-on`,里面的对应的变量用data里面的数据进行替换。
```javascript
 class Compile{
    constructor(el,vm){
        this.el=this.isElementNode(el)?el:document.querySelector(el);
        this.vm=vm;
        let fragment=this.nodeToFragment(this.el);
        //编译节点
        this.compile(fragment);
        //将编译后的代码添加到页面
        this.el.appendChild(fragment);
    };
    //核心编译方法
    compile(node){
        const childNodes=node.childNodes;
        [...childNodes].forEach(child=>{
            if(this.isElementNode(child)){
                this.compileElementNode(child);
                //如果是元素节点就还得递归编译
                this.compile(child);
            }else{
                this.compileTextNode(child);
            }
        }) 

    };
    //编译元素节点
    compileElementNode(node){
        const attrs=node.attributes;
        [...attrs].forEach(attr=>{
            //attr是一个对象
            let {name,value:expr}=attr;
            if(this.isDirective(name)){
                //只考虑到v-html和v-model的情况
                let [,directive]=name.split("-");
                //考虑v-on:click的情况
                let [directiveName,eventName]=directive.split(":");
                //调用不同的指令来进行编译
                CompileUtil[directiveName](node,this.vm,expr,eventName);
            }
        })
    };
    //编译文本节点
    compileTextNode(node){
        const textContent=node.textContent;
        if(/\{\{(.+?)\}\}/.test(textContent)){
            CompileUtil["text"](node,this.vm,textContent)
        }
    };
    //将元素节点转化为文档碎片
    nodeToFragment(node){
         //将元素节点缓存起来，统一编译完后再拿出来进行替换
         let fragment=document.createDocumentFragment();
         let firstChild;
         while(firstChild=node.firstChild){
             fragment.appendChild(firstChild);
         }
         return fragment;
    };
    //判断是否是元素节点
    isElementNode(node){
        return node.nodeType===1;
    };
    //判断是否是指令
    isDirective(attr){
        return attr.includes("v-");
    }
}
//存放编译方法的对象
CompileUtil={
    //根据data中的属性获取值,触发观察者的get钩子
    getVal(vm,expr){
        const data= expr.split(".").reduce((initData,curProp)=>{
            //会触发观察者的get钩子
            return initData[curProp];
        },vm)
        return data;
    },
    //触发观察者的set钩子
    setVal(vm,expr,value){
        expr.split(".").reduce((initData,curProp,index,arr)=>{
            if(index===arr.length-1){
                initData[curProp]=value;
                return;
            }
            return initData[curProp];
        },vm)
    },
    getContentValue(vm,expr){
        const data= expr.replace(/\{\{(.+?)\}\}/g,(...args)=>{
            return this.getVal(vm,args[1]);
        });
        return data;
    },
    model(node,vm,expr){ 
        const value=this.getVal(vm,expr);
        const fn=this.updater["modelUpdater"];   
        fn(node,value);
        //监听input的输入事件，实现数据响应式
        node.addEventListener('input',e=>{
            const value=e.target.value;
            this.setVal(vm,expr,value);
        })
        //观察数据（expr）的变化，并将watcher添加到订阅者队列中
        new Watcher(vm,expr,newVal=>{
            fn(node,newVal);
        });
    },
    text(node,vm,expr){
        const fn=this.updater["textUpdater"];
        //将{{person.name}}中的person.james替换成james
        const content=expr.replace(/\{\{(.+?)\}\}/g,(...args)=>{
            //观察数据的变化
            new Watcher(vm,args[1],()=>{
                // this.getContentValue(vm,expr)获取textContent被编译后的值
                fn(node,this.getContentValue(vm,expr))

            })
            return this.getVal(vm,args[1]);
        })
        fn(node,content);
    },
    html(node,vm,expr){
        const value=this.getVal(vm,expr);
        const fn=this.updater["htmlUpdater"];
        fn(node,value);
        new Watcher(vm,expr,newVal=>{
            //数据改变后，再次替换数据
            fn(node,newVal);
        })
    },
    on(node,vm,expr,eventName){
        node.addEventListener(eventName,e=>{
            //调用call将vm实例(this)传到方法中去
            vm[expr].call(vm,e);
        })
    },
    updater:{
        modelUpdater(node,value){
            node.value=value
        },
        htmlUpdater(node,value){
            node.innerHTML=value;
        },
        textUpdater(node,value){
            
            node.textContent=value;
        }
    }
}
```
**4、发布订阅**

&#8195;&#8195;发布订阅主要靠的是数组关系，订阅就是放入函数（就是将订阅者添加到订阅队列中），发布就是让数组里的函数执行（在数据发生改变的时候，通知订阅者执行相应的操作）。**消息的发布和订阅是在观察者的数据绑定中进行数据的——在get钩子函数被调用时进行数据的订阅（在数据被编译时就通过`new Watcher()来添加对数据的订阅`），在set钩子函数被调用时进行数据的发布**。
```javascript
//消息管理者(发布者)，在数据发生变化时，通知订阅者执行相应的操作
class Dep{
    constructor(){
        this.subs=[];
    };
    //订阅
    addSub(watcher){
        this.subs.push(watcher);
    };
    //发布
    notify(){
        this.subs.forEach(watcher=>watcher.update());
    }
}
//订阅者，主要是观察数据的变化
class Watcher{
    constructor(vm,expr,cb){
        this.vm=vm;
        this.expr=expr;
        this.cb=cb;
        this.oldValue=this.get();
    };
    get(){
        Dep.target=this;
        const value=CompileUtil.getVal(this.vm,this.expr);
        Dep.target=null;
        return value;
    };
    update(){
        const newVal=CompileUtil.getVal(this.vm,this.expr);
        if(this.oldValue!==newVal){
            this.cb(newVal);
        }
    }
}
//观察者
class Observer{
    constructor(data){
        this.observe(data);
    };
    //使数据可响应
    observe(data){
        if(data&&typeof data==="object"){
            this.defineReactive(data)
        }
    };
    defineReactive(data){
        Object.keys(data).forEach(key=>{
            const dep=new Dep();
            let val=data[key];
            this.observe(val);//深层次的监听
            Object.defineProperty(data,key,{
                get(){
                    //添加订阅者watcher（为每一个数据属性添加订阅者，以便实时监听数据属性的变化——订阅）
                    Dep.target&&dep.addSub(Dep.target);
                    //返回初始值
                    return val;
                },set(newVal){
                    if(val!==newVal){
                        val=newVal;
                        //通知订阅者，数据变化了（发布）
                        dep.notify();
                        return newVal;
                    }
                }
            })
        })
    }
}
```

<Valine></Valine>


