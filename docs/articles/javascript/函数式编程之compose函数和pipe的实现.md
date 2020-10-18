---
title: 函数式编程之compose函数和pipe的实现
date: '2020-01-14'
type: 技术
tags: javascript
note: compose和pipe函数是一种以函数作为输入参数的函数,compose函数执行顺序是从右到左,pipe函数执行顺序是从左到右。调用后返回的还是一个函数，跟偏函数和柯里化函数有点像。
---
### 1、compose函数
&#8195;&#8195;是一种以函数作为输入参数的函数,且函数执行顺序是从右到左。调用后返回的还是一个函数，跟偏函数和柯里化函数有点像。具体实现过程如下。
```javascript
//compose函数实现方式1
function compose(...funs){
    const len=funs.length;
    if(len===0) return x=>x;
    if(len===1) return funs[0];
    return function(args){
        let res=args;
        for(let i=fns.length;i--;){
            res=fns[i](res);
        }
        return res;
    }
}
//compose函数实现方式2
function compose(...funs){
    const len=funs.length;
    if(len===0) return x=>x;
    if(len===1) return funs[0];
    return fns.reduce((cur,next)=>{
        return (arg)=>cur(next(arg))
    })
}
// compose函数实现方式3
function compose(...funs){
    const len=funs.length;
    if(len===0) return x=>x;
    if(len===1) return funs[0];
    return (...arg)=>{
        //也可以 funs.reverse().reduce()
        return funs.reduceRight((cur,next)=>{
            return next(...cur);
        },arg)
    }
}
function add(x){
    return x+5;
};
function multyply(x){
    return x*5;
}
function minus(x){
    return x-5;
}
let fn1=compose(add,multyply,minus);
console.log(fn1(10));//30
```
### 2、pipe函数
&#8195;&#8195;是一种以函数作为输入参数的函数,且函数执行顺序是从左到右。
```javascript
    //pipe函数
    function pipe(){
        const fns=[].slice.call(arguments);
        return function(args){
            let res=ars;
            for(let i=0;i<fns.length;i++){
                res=fns[i](res);
            }
            return res;
        }
    }
    //实践
    function add(x){
        return x+5;
    };
    function multyply(x){
        return x*5;
    }
    function minus(x){
        return x-5;
    }
    let fn1=compose(add,multyply,minus);
    console.log(fn1(10));//30
    let fn2=pipe(add,multyply,minus);
    console.log(fn2(10));//70

```
