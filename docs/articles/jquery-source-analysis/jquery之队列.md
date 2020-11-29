---
title: jquery之队列
date: '2020-11-27'
type: 技术
tags: jquery
note: jquery之队列
---
`jquery`的队列主要包含以下几个方法。`jquery`中队列中存放的都是函数。
## 1、入队操作——queue
&#8195;&#8195;入队方法中，分以下几种情况讨论：
+ 如果`data`存在的情况下
    + 如果队列还没初始化。或者队列存在，并且`data`是数组类型时。这重新设置队列。
    + 如果队列初始化了，这直接将`data`入队。
+ `data`不存在的情况，队列存在则返回队列，不存在则返回一个空数组。
```js
//入队
queue (elem, type, data) {
    var queue;
    if (elem) {
        //type重新赋值
        type = (type || "fx") + "queue";
        //获取缓存队列数据
        queue = dataPriv.get(elem, type);
        if (data) {
            //queue不存在，且data是数组的情况
            if (!queue || Array.isArray(data)) {
                //type和jQuery.makeArray(data)同时存在的情况下 acces函数会做两件事情，1、设置队列缓存；2、并初始队列(jQuery.makeArray(data))
                queue = dataPriv.access(elem, type, jQuery.makeArray(data));
            } else {
                //queue存在，且data不是数组的情况
                queue.push(data);
            }
        }
        return queue || [];
    }
},
```
## 2、出队操作
```js
	//出队
dequeue(elem, type) {
    type = type || "fx";
    //获取队列
    var queue = jQuery.queue(elem, type),
        startLength = queue.length,
        fn = queue.shift(),
        hooks = jQuery._queueHooks(elem, type),
        //循环操作，继续出队操作
        next = function () {
            jQuery.dequeue(elem, type);
        };

    // 出队操作，不处理  progress 阶段的情况
    if (fn === "inprogress") {
        fn = queue.shift();
        startLength--;
    }
    if (fn) {
        // Add a progress sentinel to prevent the fx queue from being
        // automatically dequeued
        if (type === "fx") {
            queue.unshift("inprogress");
        }
        // Clear up the last queue stop function
        delete hooks.stop;
        //执行队列里的方法,将next和hooks暴露给外边的方法，执行完fn后，若在fn找那个调用next()则继续出队。
        fn.call(elem, next, hooks);
    }
    //如果队列里面没有数据了 ，清空队列，清除缓存中队列相关的数组
    if (!startLength && hooks) {
        //hooks是一个有empty属性的对象。
        hooks.empty.fire();
    }
},
```
## 3、队列钩子

```js
_queueHooks (elem, type) {
    var key = type + "queueHooks";
    return dataPriv.get(elem, key) || dataPriv.access(elem, key, {
        //once表示只执行一次 memory表示将上一下的参数缓存
        empty: jQuery.Callbacks("once memory").add(function () {
            dataPriv.remove(elem, [type + "queue", key]);
        })
    });
}
```