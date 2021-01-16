---
title: jquery整体封装设计总结
date: '2020-10-18'
type: 技术
tags: javascript
note: jquery整体封装设计总结
---

`jquery`的整个代码的封装就是以自执行函数的形式来封装的，自执行函数在执行的过程中会形成闭包。下面将对`jQuery`整体封装设计进行大概的分析。可以总结出如下亮点。

+ `jQuery`的闭包封装
```js
const params1 = typeof window !== 'undefined' ? window : this;
const params2 = function (window, noGlobal) {
    //浏览器环境：window=>window noGlobal=>undefined
    //Node环境：window=>this noGlobal=>true
    const jQuery = function (selector, context) {
        /**
         * 返回一个实例对象,该对象可以调用jQuery.prototype的所有方法
         * jQuery.fn=>jQuery.prototype
         * jQuery.fn.init.prototype=>jQuery.fn=jQuery.prototype
         */
        return new jQuery.fn.init(selector, context);
    }
    return jQuery;
};
//自执行函数 闭包封装
(function (global, factory) {
    //浏览器环境 global=>window Node环境下global=>当前module
    'use strict';
    if (typeof module === 'object' && typeof module.exports === 'object') {
        //Node环境 支持commonJS规范,还是需要在
        module.exports = global.document ? factory(global, true) : function (w) {
            if (!w.document) {
                throw new Error("jQuery requires a window with a document");
            }
            return factory(w);
        };
    } else {
        //浏览器环境
        factory(global)
    }

})(params1, params2);
//测试
$(".box");//每调用一次会创建一个实例
```
+ `jQuery` 的无 `new` 构建
    + 在调用`jQuery()` 将`jQuery.fn.init`看成一个构造函数,并返回它的实例。
    + 将`jQuery.fn.init`的原型对象指向 `jQuery` 的原型对象,这样`jQuery()` 对象就能调用 `jQuery`上的共有属性和方法。
```js
const jQuery = function (selector, context) {
    //将jQuery.fn.init看成一个构造函数
    return new jQuery.fn.init(selector, context);
}
//获取jQuery原型对象
jQuery.fn = jQuery.prototype={
    constructor:jQuery,
    //返回一个新的数组
    pushStack: function (elems) {
        //this.constructor()=>jQuery实例
        const ret = jQuery.merge(this.constructor(), elems);
        //给 prevObject指向它的实例
        ret.prevObject = this;
        // Return the newly-formed element set
        return ret;
    },
};
jQuery.fn.init = function (selector, context, root) { }
//jQuery.fn.init的原型对象指向jQuery的原型对象
jQuery.fn.init.prototype = jQuery.fn;
$("#box");//返回一个实例，并能调用jQuery原型对象上的属性和方法
```
+ `jQuery`的链式调用
+ 通过`jQuery.extend = jQuery.fn.extend=function()` 来扩展`jQuery`自身及其原型对象。
    + `jQuery.extend` 调用的时候，`this`是指向`jQuery`对象
    + 而`jQuery.fn.extend `调用的时候，`this`指向`fn`对象,即`jQuery`的原型对象。
```js
//扩展方法(扩展jQuery对象或者jQuery实例以及其他对象)
jQuery.extend = jQuery.fn.extend = function () {
    var options, name, src, copy, copyIsArray, clone,
        target = arguments[0] || {},
        i = 1,
        length = arguments.length,
        deep = false;
    // Todo
    // Return the modified object
    return target;
};
//给jQuery对象添加静态方法
jQuery.extend({
    //数组合并
    merge: function (first, second) {
        const len = +second.length,
        let j = 0,i = first.length;
        for (; j < len; j++) {
            first[i++] = second[j];
        }
        first.length = i;
        return first;
    },
})
```
+ 使`jQuery`实例支持迭代
```js
if (typeof Symbol === "function") {
    //在jQuery原型对象上添加Symbol.iterator属性，并指向数组原型上的Symbol.iterator属性
    jQuery.fn[Symbol.iterator] = arr[Symbol.iterator];
}
```
+ `jQuery`和`$`的命名冲突解决方式
```js
//为了防止暴露到全局的jQuery和$命名冲突，可以提供$等使用权限的转让
/**
 * 在zepto.js 中 $=Zepto
 * 在jquery.js中 $=jQuery
 */
const _jQuery = window.jQuery, _$ = window.$;//_$指向Jquery引入之前的内存地址
jQuery.noConflict = function (deep) {
    //判断是否当前库中window.$是否指向jQuery
    if (window.$ === jQuery) {
        //将 window.$指向之前$的指向(Zepto)
        window.$ = _$;
    }
    //导入不同版本的jQuery时,时jQuery指向之前版本的jQuery
    if (deep && window.jQuery === jQuery) {
        window.jQuery = _jQuery;
    }

    return jQuery;
};
//浏览器环境下，将jQuery暴露给全局
if (typeof noGlobal === 'undefined') {
    window.jQuery = window.$ = jQuery;
}
```
