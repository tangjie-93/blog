---
title: jquery的缓存处理机制
date: '2020-11-27'
type: 技术
tags: jquery
note: jquery的缓存处理机制
---

` jquery `的缓存机制主要包含以下几个方法。不外乎增、删、改、查操作，以及缓存是否存在的情况。
## 1、初始化缓存对象——cache
```js
var acceptData = function (owner) {
    // Accepts only:
    //  - Node
    //    - Node.ELEMENT_NODE
    //    - Node.DOCUMENT_NODE
    //  - Object
    //    - Any
    return owner.nodeType === 1 || owner.nodeType === 9 || !(+owner.nodeType);
};
cache(owner) {
    //判断当前对象是否已经有一个缓存了
    // Check if the owner object already has a cache
    var value = owner[this.expando];
    //换存对象不存在时则创建
    if (!value) {
        value = {};
        //判断什么对象可以这是缓存对象 owner必须是元素节点或者文档节点或者对象
        if (acceptData(owner)) {
            //给owner添加唯一值
            //如果是元素节点
            if (owner.nodeType) {
                //给元素添加唯一属性，可以避免冲突
                owner[this.expando] = value;
            } else { //如果是对象
                //给对象定义唯一属性，同样可以避免冲突
                //defineProperty定义的属性默认是不能迭代的enumerable=false
                Object.defineProperty(owner, this.expando, {
                    value: value,
                    configurable: true //表示value是可以被修改的
                });
            }
        }
    }
    return value;
},
```
## 1、缓存的设置——set
&#8195;&#8195;设置缓存时要考虑`key`为字符串和对象情况。
```js
set(owner, data, value) {
    var prop,cache = this.cache(owner);
    if (typeof data === "string") {
        //camelCase(data)使字符串首字母大写
        //键为字符串的情况 设置缓存
        cache[camelCase(data)] = value;
    } else {
        //键为对象的情况
        // 当data不是字符串的情况，对象或者数组
        for (prop in data) {
            cache[camelCase(prop)] = data[prop];
        }
    }
    return cache;
},
```
## 2、缓存的获取——get
&#8195;&#8195;` key `不存在的话这获取整个缓存对象。 
```js
get(owner, key) {
    return key === undefined ?
        this.cache(owner) :
        //owner[this.expando]=>获取对象自身唯一属性的值
        owner[this.expando] && owner[this.expando][camelCase(key)];
},
```
## 3、缓存的删除——remove
&#8195;&#8195;删除缓存时，要将传递的`key`统一转换为小驼峰命名。
```js
remove (owner, key) {
    var i,cache = owner[this.expando];
    //缓存不存在去情况下，直接返回
    if (cache === undefined) {
        return;
    }
    //key存在情况下
    if (key !== undefined) {
        // Support array or space separated string of keys
        if (Array.isArray(key)) {
            //如果key是数组，则将之转换为小驼峰命名
            key = key.map(camelCase);
        } else {
            //将key转成小驼峰命名
            key = camelCase(key);
            // If a key with the spaces exists, use it.
            // Otherwise, create an array by matching non-whitespace
            key = key in cache ?
                [key] :
                (key.match(rnothtmlwhite) || []);
        }

        i = key.length;
        //删除缓存
        while (i--) {
            delete cache[key[i]];
        }
    }
    //key不存在或者缓存对象是空对象的情况
    if (key === undefined || jQuery.isEmptyObject(cache)) {
        //如果是节点，则释放内存
        if (owner.nodeType) {
            owner[this.expando] = undefined;
        } else {
            //如果是对象，则删除对象属性
            delete owner[this.expando];
        }
    }
},
```
## 4、缓存的获取或删除——access
+ 缓存的获取，在以下两种情况下。
    + ` key===undefined `没有提供` key `。
    + 提供了`key`，并且是字符串类型，同时缓存值没有提供。
+ 缓存的设置。`key`或者`value`提供了的情况下。最后返回`value`或者`key`作为缓存的值。
```js
access(owner,key,value){
    if (key === undefined ||
        ((key && typeof key === "string") && value === undefined)) {
        //value不存在，key不存在或者key为string的情况
        return this.get(owner, key);
    }
    //key或者alue存在的情况
    this.set(owner, key, value);
    return value !== undefined ? value : key;
}
```
## 5、缓存的是否设置——hasData
```js
hasData(owner) {
    //this.expando是唯一标识
    var cache = owner[this.expando];
    //cache不等于undefined并且cache不是一个空对象
    return cache !== undefined && !jQuery.isEmptyObject(cache);
}
```