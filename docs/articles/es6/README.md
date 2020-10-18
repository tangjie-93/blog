---
title: 我所理解的promise
date: '2020-01-14'
type: 技术
tags: es6
note: 我所理解的promise
---
&#8195;&#8195;虽然项目中一直在用到 `promise`，虽然以前也学习过 `promise`，但是对于 `promise`真的是没有很好的学以致用，有时候看到别人用`promise`的时候也是一脸懵逼，所以就决定花点时间再来好好研究一下`promise`到底是什么?应该怎么样用？

## 1、什么是promise?

&#8195;&#8195;`Promise` 是异步编程的一种解决方案。**它可以被看成一个容器，容器里面是我们无法干预的，里面保存着某个未来才会结束的事件的结果。** `Promise` 对象用于表示一个异步操作的最终状态（完成或失败），以及该异步操作的结果值。
```javascript             
let p=new Promise(function excutor(resolve,reject){
    //resolve和reject函数只执行一个
    resolve(123)//成功时执行resolve
    reject("出错了")//失败时执行reject
})
p.then(res=>{
    console.log(res);
},error=>{
    console.log(error);
})
//123 执行resolve函数后，状态由pending状态变成了fulfilled。再去调用reject函数时，因为状态已经不是pending了，所以reject里面的内容不会执行了
   
```
&#8195;&#8195;`Promise` 是一个构造函数， `new Promise` 返回一个`promise`对象，构造函数接收一个`excutor`执行函数作为参数， `excutor`有两个函数形参`resolve`和`reject`，分别作为异步操作成功和失败的回调函数。但该回调函数并不是立即返回最终执行结果，通过`then` 函数来获取执行结果。

## 2、Promise对象的特点

#### 1、对象的状态不受外界影响。
&#8195;&#8195;`Promise`对象有三种状态`fulfilled,rejected,pending）`。只有异步操作的结果，可以决定当前是哪一种状态，任何其他操作都无法改变这个状态。 
+ pending: 初始状态，既不是成功，也不是失败状态。
+ fulfilled: 意味着操作成功完成。
+ rejected: 意味着操作失败。
#### 2、状态一旦发生改变，就不会再变，任何时候都可以得到这个结果。
&#8195;&#8195; `Promise`对象的状态改变，只有两种可能：从`pending`变为`fulfilled`和从`pending`变为`rejected`。

**Promise的优点：** 
+ **将异步操作以同步操作的流程表达出来，避免了层层嵌套的回调函数**。
+ `Promise`对象提供统一的接口，使得控制异步操作更加容易。
+ 解决了异步并发问题(Promise.all)。

**Promise的不足：**
+ 1、无法取消`Promise`，一旦新建它就会立即执行，无法中途取消。  
+ 2、如果不设置回调函数，`Promise`内部抛出的错误，不会反应到外部。  
+ 3、当处于`pending`状态时，无法得知目前进展到哪一个阶段（刚刚开始还是即将完成）。
```javascript           
let p = new Promise((resolve, reject) => {
    console.log(7);
    setTimeout(() => {
        console.log(5);
        resolve(6);//不会再执行了。因为在setTimeout外面已经执行过resolve了，promise的状态已经改变了。
    }, 0)
    resolve(1);
});
p.then((arg) => {
    console.log(arg);
});
//所以上面的输出为7、1、5
```
## 3、Promise的实例方法

#### 1、Promise.prototype.then(onFulfilled, onRejected)
+ `onFulfilled`和`onRejected`分别是`Promise`实例对象成功和失败情况的回调函数。
+ 该方法返回一个新的 `promise`实例对象。
+ **将以回调的返回值（return，只要不报错），作为`then` 函数调用时 `onFulfilled` 回调函数的参数。** 并且`then`方法可以被同一个 `promise` 对象调用多次。

```javascript     
let p=new Promise(function excutor(resolve,reject){
    resolve(20);//输出 成功了-> 20;成功了->200;失败了 2000
    // reject(20); //输出 失败了->20;成功了->2;失败了->20
})
p.then(res=>{
    console.log(`成功了->${res}`);
    return res*10;
},error=>{
    console.log(`失败了->${error}`);
    return (error/10);
}).then(res=>{
    console.log(`成功了->${res}`);
    return Promise.reject(res*10);
},error=>{
    console.log(`失败了->${error}`)
    return error/10;
}).then(res=>{
    console.log(`成功了->${res}`);
    return res*10;
},error=>{
    console.log(`失败了->${error}`);
    return error/10;
})
```
> 1、如果传入的 `onFulfilled` 参数类型不是函数，则会在内部被替换为`(x) => x` ，即原样返回 `promise` 最终结果的函数。

+ 例子1 
```javascript             
var p = new Promise((resolve, reject) => {
    resolve('foo')
})
// 'bar' 不是函数，会在内部被替换为 (x) => x
p.then('bar').then((value) => {
    console.log(value) // 'foo'
})
//等价于
p.then(res=>{
    return res;
}).then((value) => {
    console.log(value) // 'foo'
})
```
+ 例子2 
```js
Promise.reject(10).then(null,error=>error).then(
    res=>{
        console.log(`成功了->${res}`);
    },
    error=>{
        console.log(`失败了->${error}`);
        return error/10;
    }
)
Promise.resolve(10).then(null /*res=>res*/,error=>error).then(
    res=>{
        console.log(`成功了->${res}`);
    },
    error=>{
        console.log(`失败了->${error}`);
        return error/10;
    }
)
// 上面的两个都是输出 成功了->10
```
+ 例子3 
```js
Promise.reject(10).then(null  /*res=>res*/,null /*err=>Promise.reject(error) */).then(
    res=>{
        console.log(`成功了->${res}`);
    },
    error=>{
        console.log(`失败了->${error}`);
        return error/10;
    }
)
//输出 失败了->10
```
>2、`then` 方法允许链式调用。通过 `return` 将结果传递到下一个 `then` ,或者通过在 `then` 方法中新建一个 `promise` 实例，以`resolve(value)` 或者 `reject(value)` 方法向下一个 `then` 方法传递参数

```javascript     
//例子1
Promise.resolve("foo")
.then(function (string) {
    return string;
})
.then(function (string) {
    setTimeout(function () {
        string += 'baz';
        console.log(string + "第二次调用");//foobaz第二次调用
    }, 1)
    return string;
})
.then(function (string) {
    console.log(string + "第三次调用");//foo第三次调用
    return string;
}).then(res => {
    console.log(res + "第四次调用");//foo第四次调用
});

//例子2
Promise.resolve("foo")
.then(function(string) {
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
        string += 'bar';
        resolve(string);
        }, 1);
    });
})
.then(function(string) {
    setTimeout(function() {
        string += 'baz';
        console.log(string);//foobaz
    }, 1)
})
```
>3、如果函数抛出错误或返回一个 `rejected` 的 `Promise`，则调用将返回一个 `rejected` 的 `Promise`。

```javascript     
//例子1
Promise.resolve()
.then( () => {
    // 使 .then() 返回一个 rejected promise
    throw 'Oh no!';
})
.then( () => {
    console.log( 'Not called.' );
}, reason => {
    console.error( 'onRejected function called: ', reason );
//onRejected function called:  Oh no!
});
//例子2
Promise.reject()
    .then( () => 99, () => 42 )
    .then( solution => console.log( 'Resolved with ' + solution ) ); 
// Resolved with 42 //因为此时then方法接收的是上一个then方法reject方法中reject方法返回的值。
```
>4、 `promise` 的 `.then` 或者 `.catch` 可以被调用多次，但这里 `Promise` 构造函数只执行一次。或者说 `promise`内部状态一经改变，并且有了一个值，那么后续每次调用 `.then` 或者 `.catch` 都会直接拿到该值。
     
```javascript        
const promise = new Promise((resolve, reject) => {
    setTimeout(() => {
    console.log('once');//once
    resolve('success')
    }, 1000)
})

const start = Date.now()
promise.then((res) => {
    console.log(res, Date.now() - start);//success 1007
})
promise.then((res) => {
    console.log(res, Date.now() - start);//success 1007
})
```
#### 2、Promise.prototype.catch(onRejected)
&#8195;&#8195;该方法的原码如下所示：
      
```javascript       
Promise.prototype.catch = function(onRejected) {
    return this.then(null, onRejected);
}
this.then(null, onRejected) //中由于null不为函数，所以实际执行为
this.then(res=>{
    return res
}, onRejected);
        
```
&#8195;&#8195;该方法返回一个 `Promise`，并且处理 `reject` 的的情况。`onRejected`表示当 `Promise` 被 `rejected` 时,被调用的一个 `Function`。**当这个回调函数被调用，新 promise 将以它的返回值来resolve下一个then函数继续被调用**（正常情况是调用 `onFulfilled`方法，除非在 `catch` 中抛出错误）。

```javascript     
//例子1
var p1 = new Promise(function(resolve, reject) {
    resolve('Success');
});

p1.then(function(value) {
    console.log(value); // "Success!"
    throw 'oh, no!';
}).catch(function(e) {
    console.log(e); // "oh, no!"
}).then(function(){
    console.log('after a catch the chain is restored');//after a catch the chain is restored
    return 3;
}, function () {
    console.log('Not fired due to the catch');
})
```

>1、在异步函数中抛出的错误不会被catch捕获到   
        
```javascript     
var p2 = new Promise(function(resolve, reject) {
    setTimeout(function() {
        throw 'Uncaught Exception!';
    }, 1000);
});

p2.catch(function(e) {
    console.log(e); // 不会执行
});
```

>2、在 `resolve()`后面抛出的错误会被忽略(因为 Promise 的状态一旦改变，就永久保持该状态，不会再变了。)

```javascript     
var p3 = new Promise(function(resolve, reject) {
    resolve();
    throw 'Silenced Exception!';
});

p3.catch(function(e) {
    console.log(e); // 不会执行
});
```
>3、Promise 对象的错误具有"冒泡"性质，会一直向后传递，直到被捕获(或者被then()捕获)为止。也就是说，错误总是会被下一个catch语句捕获。
      
```javascript       
Promise.reject(2).then((res) => {
    console.log(res);
}).then().catch(res=>{
    console.log(res);//2
});

Promise.reject(2).then((res) => {
    console.log(res);
},(error)=>{
    console.log(error);//2
}).then().catch(res=>{
    console.log(res);//不会被捕获,没有任何输出
})
```

>4、如果使用了`catch`语句，然后前面的 `then` 方法并没有报错,那么就相当于直接跳过该 `catch` 方法，下一个 `then` 方法接收上一个 `then` 方法中 `onFulfilled` 传过来的参数。
     
```javascript        
var p1 = new Promise(function(resolve, reject) {
    resolve('Success');
});
    p1.then(function(value) {
    console.log(value); // "Success"
    return value;
}).catch(function(e) {
    console.log(e); // 没有任何输出
}).then(function(value){
    console.log(value);//"Success" 
    //就好像跳过了catch语句，实际上catch执行的是this.then(null,onrejected)
    //等同于
    //this.then((res)=>{
    //   return res;
    //},onrejected)
}, function () {
    console.log('Not fired due to the catch');
})
```

> 5、`.then` 或者 `.catch` 中 `return` 一个 `error` 对象并不会抛出错误，所以不会被后续的 `.catch` 捕获。因为返回任意一个非 `promise` 的值都会被包裹成 `promise` 对象**，即 `return new Error('error!!!')` 等价于 return Promise.resolve(new Error('error!!!'))。
        
```javascript     
Promise.resolve()
    .then(() => {
    return new Error('error!!!')
    //或者改为
    //return Promise.reject(new Error('error!!!'))或者
    //throw new Error('error!!!') 才会被后面的catch语句捕捉到
    })
    .then((res) => {
    console.log('then: ', res);//在这里输出
    })
    .catch((err) => {
    console.log('catch: ', err)
    })  
```

>6、`.then` 或者 `.catch` 的参数期望是函数，传入非函数则会发生值穿透.

```javascript              
Promise.resolve(1)
.then(2)
.then(Promise.resolve(3))
.then(console.log);
//输出1
//实际执行语句为
new Promise((resolve, reject) => {
    resolve(1)
}).then(res => {
    return res;
}).then((res) => {
    return res;
}).then((res) => {
    console.log(res);
})
```
#### 3、Promise.prototype.finally(onFinally)
&#8195;&#8195;该方法返回一个 `Promise`，在`promise`执行结束时，无论结果是`fulfilled`或者是`rejected`，在执行`then()`和`catch()`后，都会执行`finally`指定的回调函数。源码实现如下：

```javascript          
Promise.prototype.finally = function (f) {
    return this.then(function (value) {
        return Promise.resolve(f()).then(function () {
            return value;
        });
    }, function (err) {
        return Promise.resolve(f()).then(function () {
            throw err;
        });
    });
};
```

## 3、Promise的静态方法
#### 1、Promise.all(iterable)
&#8195;&#8195;该方法返回一个新的 `promise` 对象，该 `promise`对象在 `iterable` 参数对象里所有的 `promise`对象都成功的时候才会触发成功，一旦有任何一个 `iterable`里面的 `promise` 对象失败则立即触发该 `promise` 对象的失败。        

源码实现如下：
      
```javascript       
Promise.all=function(promises){
    return new Promise((reslove,reject)=>{
        let arr=[];
        let count=0;
        promises.forEach((promise,i)=>{
            promise.then(value=>{
                arr.push(value);
                if(++count===promises.length){
                    resolve(arr);
                }
            },err=>{
               reject(err)
            })
        })
    })
}
```
&#8195;&#8195;**操作成功（Fulfillment）**

&#8195;&#8195;1、如果**传入的可迭代对象为空**，Promise.all **会同步地返回一个已完成（resolved）状态的promise。**

```javascript           
var p = Promise.all([]);
console.log(p);//Promise {<resolved>: Array(0)}  
```
&#8195;&#8195;2、如果所有传入的 promise 都变为完成状态，或者**传入的可迭代对象内没有 promise，Promise.all 返回的 promise 异步地变为完成。**

&#8195;&#8195;3、在任何情况下，Promise.all 返回的 promise 的完成状态的**结果都是一个数组**，它包含所有的传入迭代参数对象的值（也包括非 promise 值）。

```javascript            
var p1 = Promise.resolve(3);
var p2 = 1337;
var p3 = new Promise((resolve, reject) => {
    setTimeout(resolve, 100, 'foo');
}); 

Promise.all([p1, p2, p3]).then(values => { 
    console.log(values); // [3, 1337, "foo"] 
});
```

&#8195;&#8195;**操作失败（Rejection）**

&#8195;&#8195;1、如果传入的 promise 中有一个失败（rejected），Promise.all 异步地将失败的那个结果给失败状态的回调函数，而不管其它 promise 是否完成。

```javascript           
var resolvedPromisesArray = [Promise.resolve(33), Promise.reject(44)];

var p = Promise.all(resolvedPromisesArray);
console.log(p);//Promise {<pending>}
// using setTimeout we can execute code after the stack is empty
//进入第二次循环
setTimeout(function(){
    console.log('the stack is now empty');
    console.log(p);//Promise {<rejected>: 44}
});
```
<h4>&#8195;2、Promise.race(iterable)</h4>

&#8195;&#8195;原码实现如下：
```javascript        
Promise.race = function(promises) {
    return new Promise((resolve, reject) => {
        promises.forEach((promise, index) => {
            promise.then(resolve, reject);
        });
    });
}
```
&#8195;&#8195;该方法返回一个 `promise`，一旦迭代器中的某个子`promise`执行了成功或失败操作，父`promise`对象也会用子`promise`的成功返回值或失败详情作为参数调用父`promise`绑定的相应句柄，并返回该`promise`对象。如果传的迭代`(iterable)`是空的，则返回的 `promise` 将永远等待。

```javascript            
let p=Promise.race([1,2]).then(value=>{
    console.log(value);//1
});

let p=Promise.race([]);
console.log(p);//Promise {<pending>}
        
```
#### 3、Promise.resolve(value)

&#8195;&#8195;**该方法的作用就是将现有对象转为 Promise 实例,并且该实例的状态为resolve。**
该方法的源码实现如下：

  ```javascript          
Promise.resolve (value) {
    // 如果参数是MyPromise实例，直接返回这个实例
    if (value instanceof MyPromise) return value
    return new MyPromise(resolve => resolve(value))
}
  ```
​		参数value可以是一个Promise对象，或者是一个thenable，也可以就是一个字符串等常量，还可以为空。该方法返回一个以给定值解析后的Promise 对象。   
```javascript     
Promise.resolve('foo')
// 等价于
return new MyPromise(resolve => resolve(value))
if (value instanceof MyPromise) {
    return value
}else{
    return new MyPromise(resolve => resolve(value))
}
```

&#8195;&#8195;1、如果这个值是个thenable（即带有then方法），返回的promise会"跟随"这个thenable的对象（**从它们的运行结果来看，返回的就好像是这个thenable对象一样。但实际上返回的是一个Promise对象**），采用它的最终状态（指resolved/rejected/pending/settled）。

```javascript             
let thenable = {
    then: function(resolve, reject) {
        resolve(42);
    }
};
let p1 = Promise.resolve(thenable);
p1.then(function(value) {
    console.log(value);  // 42
});
thenable.then(res=>{
    console.log(res);//42
})

//上面的代码可以被解析为
let p1=new Promise(resolve=>{
    reslove(thenable);
})
p1.then(function(value) {
    console.log(value);  // 42 
});
```

&#8195;&#8195;2、如果传入的value本身就是promise对象，那么Promise.resolve将不做任何修改、原封不动地返回这个实例。
```javascript     
var original = Promise.resolve('我在第二行');
original.then(function(value) {
    console.log('value: ' + value);//'我在第二行'
});
var cast = Promise.resolve(original);
cast.then(function(value) {
    console.log('value: ' + value);//'我在第二行'
});
console.log('original === cast ? ' + (original === cast));//true
```


&#8195;&#8195;3、参数不是具有then方法的对象，或根本就不是对象，则Promise.resolve方法返回一个新的 Promise 对象，状态为resolved。

 ```javascript            
const p = Promise.resolve('Hello')；
//等同于
const p=new Promise(resolve=>{
    resolve('Hello');
})
p.then(res=>{
    console.log(res) // Hello
});
 ```
&#8195;&#8195;4、不带有任何参数。直接返回一个resolved状态的 Promise 对象。         
```javascript     
const p = Promise.resolve()；
console.log(p);//Promise {<resolved>: undefined}
```

<h4>&#8195;4、Promise.rejected(value)</h4>
&#8195;&#8195;返回一个新的 Promise 实例，该实例的状态为rejected。

```javascript            
const p = Promise.reject('出错了');
// 等同于
const p = new Promise((resolve, reject) => reject('出错了'))
p.then(null, function (s) {
    console.log(s);//  出错了
});
```

## 4、Promise代码实现
>1、初始版

```javascript  
function Promise1(executor) {
    let self = this;
    self.PromiseState = "pending";
    self.PrimiseResult = undefined;
    function resolve(value) {
        if (self.PromiseState === "pending") {
            self.PrimiseResult = value;
            self.PromiseState = "fulfilled";
        }
    }
    function reject(reason) {
        if (self.PromiseState === "pending") {
            self.PrimiseResult = reason;
            self.PromiseState = "rejected"
        }
    }
    try {
        executor(resolve, reject)
    } catch (e) {
        reject(e)
    }
}
Promise1.prototype.then = function (onFullfilled, onRejected) {
    let PromiseState = this.PromiseState;
    switch (PromiseState) {
        case "resolve":
            onFullfilled(this.PrimiseResult);
            break;
        case "reject":
            onRejected(this.PrimiseResult);
            break;
        default:
            break;
    }
}
let p = new Promise1((resolve, reject) => {
    resolve(123);
});
p.then(res => {
    console.log(res);
})
```
>2、进阶版——异步处理

```js
function Promise2(executor) {
    let self = this;
    self.status = "pending";
    self.value = undefined;
    self.reason = undefined;
    //存放成功处理
    self.onFullfilledArray = [];
    //存放失败处理
    self.onRejectedArray = [];
    function resolve(value) {
        if (self.status === "pending") {
            self.value = value;
            self.status = 'resolve';
            self.onFullfilledArray.forEach(fn => {
                fn(self.value);
            })
        }
    }
    function reject(reason) {
        if (self.status === "pending") {
            self.reason = reason;
            self.status = "reject";
            self.onFullfilledArray.forEach(fn => {
                fn(this.reason);
            })
        }
    }
    try {
        executor(resolve, reject)
    } catch (e) {
        reject(e);
    }
}
Promise2.prototype.then = function (onFullfilled, onRejected) {
    let status = this.status;
    switch (status) {
        case "pending":
            //处理异步情况
            this.onFullfilledArray.push(() => {
                onFullfilled(this.value);
            })
            this.onRejectedArray.push(() => {
                onRejected(this.reason);
            });
            break;
        case "resolve":
            onFullfilled(this.value);
            break;
        case "reject":
            onRejected(this.reason);
            break;
        default:
            break;
    }
}
let p = new Promise2((resolve, reject) => {
    setTimeout(function () { resolve(1) }, 1000)
});
p.then(res => {
    console.log(res);
})
```
>3、 进阶版——链式调用

```js
function Promise3(executor) {
    if (typeof executor !== "function") {
        throw new Error("executor必须是一个函数");
    }
    let self = this;
    self.status = "pending";
    self.value = "";
    self.reason = "";
    self.onFullfilledArray = [];
    self.onRejectedArray = [];

    function resolve(value) {
        if (self.status === "pending") {
            self.status = "resolve";
            self.value = value;
            self.onFullfilledArray.forEach(fn => {
                fn(this.value);
            });
        }
    }
    function reject(reason) {
        if (self.status === "pending") {
            self.status = "resolve";
            self.reason = reason;
            self.onRejectedArray.forEach(fn => {
                fn(this.reason);
            });
        }
    }
    try {
        executor(resolve, reject)
    } catch (e) {
        reject(e);
    }
}
Promise3.prototype.then = function (onFullfilled, onRejected) {
    let status = this.status;
    let promise;
    switch (status) {
        case "pending":
            promise = new Promise3((resolve, reject) => {
                this.onFullfilledArray.push(() => {
                    let value = onFullfilled(this.value);
                    try {
                        resolve(value);
                    } catch (e) {
                        reject(e);
                    }
                });
                this.onRejectedArray.push(() => {
                    let value = onRejected(this.reason);
                    try {
                        resolve(value);
                    } catch (e) {
                        reject(e);
                    }
                });
            });
            break;
        case "resolve":
            promise = new Promise3((resolve, reject) => {
                let value = onFullfilled(this.value);
                try {
                    resolve(value);
                } catch (e) {
                    reject(e);
                }
            });
            break;
        case "reject":
            promise = new Promise3((resolve, reject) => {
                let value = onRejected(this.reason);
                try {
                    resolve(value);
                } catch (e) {
                    reject(e);
                }
            });
            break;
    }
    return promise;
}
```
后面再复杂的情况暂时就不考虑了。

参考链接    
[1、ECMAScript入门](http://es6.ruanyifeng.com/#docs/promise)    
[2、Promise——MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise)   
[3、Promise原理讲解 && 实现一个Promise对象 (遵循Promise/A+规范)](https://juejin.im/post/5aa7868b6fb9a028dd4de672#heading-9)  
[4、这一次，彻底弄懂 JavaScript 执行机制](https://juejin.im/post/59e85eebf265da430d571f89#heading-4)    
[5、Promise 必知必会（十道题）](https://juejin.im/post/5a04066351882517c416715d)