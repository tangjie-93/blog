---
title: (a==1&&a==2&&a==3)===true的实现
date: '2020-01-14'
type: 技术
tags: javascript
note: 由表达式可以看出a的数据类型只能是引用类型。所以在判断a==1时会进行强制类型转换。==运算符的作用是判断该运算符左右两边的对象的值是否相等。而根据强制类型转换规则。当原始类型和引用类型做比较时，对象类型会依照ToPrimitive规则转换为原始类型。
---
# (a==1&&a==2&&a==3)===true的实现

&#8195;&#8195;由表达式可以看出a的数据类型只能是引用类型。所以在判断a==1时会进行强制类型转换。==运算符的作用是判断该运算符左右两边的对象的值是否相等。而根据强制类型转换规则。当原始类型和引用类型做比较时，对象类型会依照ToPrimitive规则转换为原始类型。
```javascript  
toPrimitive(input,preferedType?)
```
>1、引用类型转换为Number类型，先调用valueOf()，再调用toString()<br>
>2、引用类型转换为String类型，直接调用toString()。

所以我们可以重写Symbol.ToPrimitive方法。
**方法1 重写Symbol.ToPrimitive方法**

```javascript  
let a={
    [Symbol.toPrimitive]:(function(hint){
        let i=0;
        return ()=>{
            return ++i;
        }
    })()  //必须采用立即执行函数，不然a得到的是一个对函数的引用
    //简写
    [Symbol.toPrimitive]:((i)=>++i)(0)
}
```

**方法2 利用proxy进行拦截（主要是拦截set及“.”运算符）**

```javascript    
let a=new Proxy({i:0},{
    get(target){
        //利用闭包，保存上次的值
        return ()=>++target.i;
    }
})
```
**方法3 因为在调用toString()方法时，会调用数组的join方法。所以我们重写join方法**

```javascript  
let a=[1,2,3];
a.join=c.shift;
```
**方法4，直接利用toString()或者valueOf()**

```javascript  
let a={
    i:1,
    toString(){
        return a.i++;
    }
},
    let a={
        i:1,
        valueOf(){
            return a.i++;
        }
    }
```

以上解决方法皆参考(转载)自掘金@刘小夕的[这儿有20道大厂面试题等你查收](https://juejin.im/post/5d124a12f265da1b9163a28d)

<Valine></Valine>