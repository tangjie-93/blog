---
title: jquery中关于闭包的使用
date: '2020-10-18'
type: 技术
tags: javascript
note: jquery中关于闭包的使用
---
`jquery`的整个代码的封装就是以自执行函数的形式来封装的，自执行函数在执行的过程中会形成闭包。
```js
let params1 = typeof window !== 'undefined' ? window : this;
let params2 = function (window, noGlobal) {
    //浏览器环境：window=>window noGlobal=>undefined
    //Node环境：window=>this noGlobal=>true
    const jQuery = function (selector, context) {
        //todo 核心代码
    }
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
    return jQuery;
};
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

})(params1, params2)
```