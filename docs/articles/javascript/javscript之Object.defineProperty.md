---
title: 38.Object.defineProperty​详解
date: '2020-01-14'
type: 技术
tags: javascript
note: 自己在使用vue的过程中经常会用到听到`数据双向绑定`这个词，而且我们还可以直接通过调用`this.msg`(this表示vue实例),来获取data上的数据，以前一直不太明白为什么可以这样获取，直到有一天我在论坛里看到了`寻找海蓝96`这位大佬写的文章,才明白其原理，所以在此记录一下。
---
&#8195;&#8195;自己在使用vue的过程中经常会用到听到`数据双向绑定`这个词，而且我们还可以直接通过调用`this.msg`(this表示vue实例),来获取data上的数据，以前一直不太明白为什么可以这样获取，直到有一天我在论坛里看到了`寻找海蓝96`这位大佬写的文章,才明白其原理，所以在此记录一下。

<h3 id="a1">1、Object.defineProperty(obj,key,descriptor) </h3>
&#8195;&#8195;`Object.defineProperty`主要是通过Get和Set这两个访问器属性来实现数据双向绑定的。说到这里必须先介绍以下js对象的两种特性。
`ECMAScript`中有两种属性:数据属性和访问器属性。这是js中任何对象都拥有的特性。      

**数据属性** 主要是用于对数据的描述。数据属性主要有以下4个特性。    
>1、Configurable:（字面意思是可配置的，我理解为可操作（删除、修改））表示能否通过`delete`操作来删除属性，以及能否修改属性，或者能否将属性修改为访问器属性。直接定义在对象上的属性，该特性值默认为`true`。

>2、Enumerable：字面意思是可枚举的，表示能否通过`for-in`循环来遍历属性。直接在对象上定义的属性，该特性值默认为`true`。

>3、Writable:表示能否修改属性的值。直接定义在对象上的该特性值默认也为`true`。  

>4、Value:这个特性包含着属性的数据值。对对象属性的读写操作都是在这个特性上。该特性的默认值为undefined。   

&#8195;&#8195;想要修改上面的4个特性就得调用`Object.defineProperty(obj,key,descriptor)`方法，descriptor表示的是一个对象，对象中的属性必须是这四个特性中的一项或多项。

**注意：**

> 1、多次调用`Object.defineProperty()`方法修改同一个属性，只要把`configurable`特性设置为`false`后，就不能再把它变成可配置的了(再次调用`Object.defineProperty()`将`configurable`特性设置为`true`会报错)，即这个过程是不可逆的，**不能再对对象属性进行delete操作，但是还可以对对象属性进行修改操作。**    

```javascript           
Object.defineProperty(obj,"name",{
    configurable:false,
    enumerable:true,
    writable:true,
    value:"james"
});
delete obj.name;
console.log(obj);//{name: "james"}，可见不能对obj进行删除操作了。
obj.name="test";
console.log(obj.name);//test 还是可以对属性进行修改
```
> 2、调用 `Object.defineProperty()`方法时，如果不指定`Configurable、Enumerable`和 `writable`等特性的值，默认为`false`。

**访问器属性** 也有4个。但是不包含数据值  
>1、Configurable:（字面意思是可配置的，我理解为可操作（删除、修改））表示能否通过delete操作来删除属性，以及能否修改属性，或者能否将属性修改为访问器属性。直接定义在对象上的属性，该特性值默认为true。

>2、Enumerable：字面意思是可枚举的，表示能否通过for-in循环来遍历属性。直接在对象上定义的属性，该特性值默认为true。    

>3、Get:在读取属性时调用的函数。 默认值为undefined。   

>4、Set:在写入属性时调用的函数。的默认值为`undefined`。   

注意：**不能使用Object.defineProperty()方法同时修改默认数据属性和访问器属性。即set和get访问器属性不能与writable以及value特性共存。**

```javascript             
Object.defineProperty(obj,"name",{
    configurable:true,
    enumerable:true,
    writable:true,
    value:"james",
    get(){
        return this.val;
    },
    set(newVal){
        this.val=newval;
    }
});
//Uncaught TypeError: Invalid property descriptor. Cannot both specify accessors and a value or writable attribute, #<Object>
```
&#8195;&#8195;个人觉得数据属性和访问器属性的`Configurable`和 `Enumerable`没什么区别。访问器属性主要用的是 `Get` 和 `Set` 这两个。

**可以通过Object.defineProperty（）实现简单的数据双向绑定**。实现代码如下：

```javascript          
<input id="test1"/>
<input id="test2"/>
<script>
     let obj={};
    Object.defineProperty(obj,"name",{
        configurable:true,
        enumerable:true,
        writable:true,
        // value:"",
        set(newValue){
            document.querySelector("#test1").value=newValue;
            document.querySelector("#test2").value=newValue;
        },
        get(){
            return obj["name"];
        }
    });
    document.addEventListener("keyup",function(e){
        obj.name=e.target.value;
    })
</script>
```
通过操作可以发现，在 `test1` 中输入会改变 `test2` 中的值，在 `test2` 中输入也能改变 `test1` 中的值。

`vue` 中为什么可以直接通过 `this.msg` 获取到`data` 中的`msg`，原理代码如下：

```javascript           
class Vue{
    constructor(options={}){
        this.$options=options;
        this._data=options.data;
        let data=this._data;
        Object.keys(data).forEach((key)=>{
            this._proxy(key)
        })
    };
    _proxy(key){
        //以this做为obj,将data对象上的属性全部绑定到vue实例上来
        Object.defineProperty(this,key,{
            configurable:true,
            enumerable:true,
            get(){
                return this._data[key];
            },
            set(newval){
                this._data[key]=newval;
            }
        })
    }
}
```
<Valine></Valine>