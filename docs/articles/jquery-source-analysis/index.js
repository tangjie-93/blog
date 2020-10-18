// function toType (obj) {
//     const dataTypes = ["Boolean", "Number", "String", "Function", "Array", "Date", "RegExp", "Object", "Error", "Symbol"]
//     const class2type = dataTypes.reduce((obj, name) => {
//         obj["[object " + name + "]"] = name.toLowerCase();
//         return obj;
//     }, {});
//     const { toString } = Object.prototype;
//     //obj为null或者undefined
//     if (obj == null) {
//         return obj + "";
//     }
//     const type = typeof obj
//     // Support: Android <=2.3 only (functionish RegExp)
//     return /^(object|function)$/.test(type) ?
//         class2type[toString.call(obj)] || "object" : type
// }
// //这是我自己总结的数据类型检测方法
// function toType2 (obj) {
//     //obj为null或者undefined
//     if (obj == null) {
//         return obj + "";
//     }
//     const { toString } = Object.prototype;
//     const baseType = typeof obj;
//     return /^(object|function)$/.test(baseType) ?
//         toString.call(obj).toLowerCase().slice(8, -1) : baseType
// }
// console.log(toType2(12));
// console.log(toType2(12n));
// console.log(toType2('123'));
// console.log(toType2(true))
// console.log(toType2(Symbol(123)));
// console.log(toType2(function () { }));
// console.log(toType2({}))
// console.log(toType2(/\d+/))
// console.log(toType2(new Error()))
// console.log(toType2(new Date()))
// console.log("_____________________")
// console.log(toType(11));
// console.log(toType(11n));
// console.log(toType('3'));
// console.log(toType(true))
// console.log(toType(Symbol(3)));
// console.log(toType(function () { }));
// console.log(toType({}))
// console.log(toType(/\d+/))
// console.log(toType(new Error()))

const { Object } = require('leancloud-storage');

// console.log(toType(new Date()))
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
