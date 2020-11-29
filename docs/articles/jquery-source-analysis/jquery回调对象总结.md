---
title: jquery回调对象总结
date: '2020-11-27'
type: 技术
tags: jquery
note: jquery回调对象总结
---
&#8195;&#8195;`jquery.CallBacks`是一个在 `jquery`中应用广泛的回调函数列表对象，它对回调函数队列进行了很好的管理。主要用的`发布订阅设计模式`。
## 1、jQuery.Callbacks
&#8195;&#8195;在函数内部定义并初始化一些私有变量。
```js
jQuery.Callbacks = function (options) {
    options = typeof options === "string" ?
        //将options构造成对象
        createOptions(options) :
        jQuery.extend({}, options);
    var firing, //列表中的函数是否正在回调中
        memory,//最后一次回调触发时传的参数
        fired,//列表中的函数是否已经被调用
        locked,//是否被锁住
        list = [],//实际回调列表
        queue = [], //存放的是执行参数
        firingIndex = -1,//当前正在执行的回调的索引
        //触发回调(私有函数)
        fire = function () {
            //队列是否被锁住或者只触发一次
            locked = locked || options.once;
            //触发了
            fired = firing = true;
            //循环实参列表，并且每次循环都重置firingIndex
            for (; queue.length; firingIndex = -1) {
                //从队列中取出实参
                memory = queue.shift();
                while (++firingIndex < list.length) {
                    //执行回调 查看回调是否提前结束
                    //当回调返回一个false同时在调用$.Callbacks("stopOnfalse")时会中断回调的执行
                    //memory[0]是执行上下文 this
                    if (list[firingIndex].apply(memory[0], memory[1]) === false &&
                        options.stopOnFalse) {
                        //fireIndex赋值为队尾所以，并且在添加回调的时候，不会再马上触发回调。
                        // Jump to end and forget the data so .add doesn't re-fire
                        firingIndex = list.length;
                        memory = false;
                    }
                }
            }
            //判断是否需要将上次的实参存起来
            if (!options.memory) {
                memory = false;
            }
            //回调函数执行完毕,将正在调用firing修改为false
            firing = false;
            // 判断是否被锁住
            if (locked) {
                //如果memory存在(此时为函数执行的实参)，则需要将队列清空，避免在添加函数的时候，再次被调用。
                if (memory) {
                    list = [];
                    // Otherwise, this object is spent
                } else {
                    list = "";
                }
            }
        },
        //实际的回调对象
        self={};
        //暴露给外界调用
        return self;
}
```
## 2、jquery.CallBacks的可选参数
&#8195;&#8195;在初始化`jquery.CallBacks(options)`时会传入可选参数。
+ `once`: 确保这个回调列表只执行一次。
+ `memory`: 保持以前的值，将添加到这个列表的后面的最新的值立即执行调用任何回调 (像一个递延 Deferred).
+ `unique`: 确保一次只能添加一个回调(所以在列表中没有重复的回调).
+ `stopOnFalse`: 当一个回调返回 `false` 时中断调用。
## 3、jquery.CallBacks()暴露给外界的API
&#8195;&#8195;`jquery.CallBacks()`主要提供了一下`API`。
```js
callbacks.add()        回调列表中添加一个回调或回调的集合。
callbacks.disable()    禁用回调列表中的回调
callbacks.disabled()   确定回调列表是否已被禁用。 
callbacks.empty()      从列表中删除所有的回调.
callbacks.fire()       用给定的参数调用所有的回调
callbacks.fired()      访问给定的上下文和参数列表中的所有回调。 
callbacks.fireWith()   访问给定的上下文和参数列表中的所有回调。
callbacks.has()        确定列表中是否提供一个回调
callbacks.lock()       锁定当前状态的回调列表。
callbacks.locked()     确定回调列表是否已被锁定。
callbacks.remove()     从回调列表中的删除一个回调或回调集合。
```
## 3、暴露给外界的API详解
#### 1、add
&#8195;&#8195;将回调函数添加到回调函数列表。如果存在缓存的情况下，则会在添加之后，立马执行该回调函数。
```js
add() {
    if (list) {
        //初始化jquery.CallBacks()是memory没有赋值，是undefined，如果memory此时有值的话，那就是在调用私有方法fire时赋值的。
        //如果memory存在并且还不是触发正在触发的情况下，则应该在添加回调后马上执行回调
        if (memory && !firing) {
            //触发回调索引赋值
            firingIndex = list.length - 1;
            queue.push(memory);
        }
        //自实行函数
        //args可能是多个回调函数,所以这里用到了循环
        (function add (args) {
            jQuery.each(args, function (_, arg) {
                if (isFunction(arg)) {
                    //该回调不是只执行一次或者回调函数队列中还不存在该回调
                    if (!options.unique || !self.has(arg)) {
                        list.push(arg);
                    }
                    //参数可能是数组或者类数组
                } else if (arg && arg.length && toType(arg) !== "string") {
                    //循环调用自执行函数
                    add(arg);
                }
            });
        })(arguments);
        if (memory && !firing) {
            fire();
        }
    }
    return this;
},

```
#### 2、remove
&#8195;&#8195;删除回调队列中的一些回调。
```js
remove() {
    let index;
    //arguments是类数组
    jQuery.each(arguments, function (_, arg) {
        //判断要删除的回调是否在回调列表中，参数可能是多个回调，所以使用循环
        while ((index = jQuery.inArray(arg, list, index)) > -1) {
            //存在则删除
            list.splice(index, 1);
            // 将当前正在触发的回调函数的索引减1
            if (index <= firingIndex) {
                firingIndex--;
            }
        }
    });
    return this;
},
```
#### 3、has
&#8195;&#8195;用于判断当前回调函数是否已经被添加到回调函数列表当中了。
```js
has(fn) {
    return fn ?
        jQuery.inArray(fn, list) > -1 :list.length > 0;
}					
```
#### 4、empty
```js
//清空回调列表
empty () {
    if (list) {
        list = [];
    }
    return this;
},
```
#### 5、disable
&#8195;&#8195;使得回调队列不能被触发，同时也不能添加回调。该函数的功能跟`lock`函数很像，只不过`lock`函数需要先回调队列是否触发被调用中且不用缓存。 
```js
disable() {
    //清空参数队列
    locked = queue = [];
    //情况回调队列
    list = memory = "";
    return this;
},
```
#### 6、disabled
&#8195;&#8195;判断列表是否已经被禁用
```js
disabled () {
    return !list;
},
```
#### 7、lock
&#8195;&#8195;将回调队列锁住。将实参队列清空。最后将当前执行上下文返回。
```js
lock () {
    //清空参数队列
    locked = queue = [];
    //如果不用缓存，并且也不是处于正在触发的状态，则将回调队列清空。
    if (!memory && !firing) {
        list = memory = "";
    }
    return this;
},
```
#### 8、locked
&#8195;&#8195;判断回调队列是否被锁住。
```js
locked () {
    return !!locked;
},
```
#### 9、fireWith
&#8195;&#8195;根据给定的**初始执行上下文对象和实参**触发回调。并将实参用一个队列存起来。实际上还是调用`jQuery.Callbacks`的私有方法`fire`。最后将当前执行上下文对象返回。
```js
fireWith(context, args) {
    //判断回调函数队列是否被锁住
    if (!locked) {
        args = args || [];
        args = [context, args.slice ? args.slice() : args];
        //将实参存放到队列中
        queue.push(args);
        //如果还没触发则触发回调
        if (!firing) {
            //私有函数
            fire();
        }
    }
    return this;
},
```
#### 10、 fire
&#8195;&#8195;触发回调，将当前上下文对象和实参传递给`fireWith`方法。 并将当前上下文返回。
```js
fire() {
    self.fireWith(this, arguments);
    return this;
},
```
#### 11、fired
&#8195;&#8195;该函数主要用于判断回调函数队列是否已经被调用过了。
```js
fired () {
    return !!fired;
}
```
