---
title: 函数形参值传递
date: '2020-01-14'
type: 技术
tags: javascript
note: 函数形参值传递
---
#  函数形参值传递

1、函数形参值传递主要是考虑实参是引用类型的情况。
代码如下：
```javascript
    function foo(obj){
        obj.a="ssssss";
        console.log(obj);//{b: "eeeeeee", a: "ssssss"}
        obj={};
        obj.a="kkkkkk";
        console.log(obj);//{a: "kkkkkk"}
    }
    const o={b:"eeeeeee"};
    foo(o);
    console.log(o);//{b: "eeeeeee", a: "ssssss"}
```
分析：当函数实参传递的是引用类型时，传递到函数中的实参在函数内部作为活动变量时，其就相当于对实参的浅拷贝。活动对象和该实参指向的是同一个内存地址。而在函数内部对该活动对象再一次初始化时，相当于切断了对实参内存地址的引用，指向了一个新的内存地址。

2、有一次在网上看到一个这样的题目
```javascript
   let a={s:1};
   let b=a;
   a.x=a={k:2};
   console.log(a);
   console.log(b);
   最后 的输出结果为
   a：{k:2};
   b：{s:1,x:{k:2}} 
```
分析：这是因为“.”的优先级比“=”高。所以a.x=a={k:2}的执行顺序为从左到右。同时a指向了另一个内存地址。

3、[请写出如下代码的打印结果 ](https://github.com/Advanced-Frontend/Daily-Interview-Question/issues/155)
```javascript
    function Foo() {
        Foo.a = function() {
            console.log(1)
        }
        this.a = function() {
            console.log(2)
        }
    }
    Foo.prototype.a = function() {
        console.log(3)
    }
    Foo.a = function() {
        console.log(4)
    }
    Foo.a();//4
    let obj = new Foo();
    obj.a();//2
    Foo.a();//1
```
分析：javascript中一切皆对象，函数也是一个对象。最开始调用Foo.a()时，调用的是Foo.a所以输出的是4，此时a是Foo对象一个静态属性。而调用obj.a()时，调用的是Foo作为构造函数时的实例方法。最后一次调用的Foo.a()调用的是Foo对象本身的a属性，因为在调用构造函数Foo时将Foo函数外部的a属性覆盖了。所以输出的是1.
