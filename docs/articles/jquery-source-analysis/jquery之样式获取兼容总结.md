---
title: jquery之样式获取兼容总结
date: '2020-11-25'
type: 技术
tags: jquery
note: jquery之样式获取兼容总结
---

## nodeType常用值总结
```js
1 表示是元素结点
2 表示属性结点
3 表示是文本结点
8 表示是注释结点
9 表示是document结点
```

## 1、获取样式的兼容处理
```js
var getStyles = function (elem) {
    // Support: IE <=11 only, Firefox <=30 (#15098, #14150)
    // IE throws on elements created in popups
    // FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
    var view = elem.ownerDocument.defaultView;

    if (!view || !view.opener) {
        view = window;
    }
    return view.getComputedStyle(elem);
};
```
## 2、获取样式值的兼容处理
```js
//判断是否是document的后代元素
const isAttached = function (elem) {
    return jQuery.contains(elem.ownerDocument, elem);
};
//获取样式
function curCSS (elem, name, computed) {
    var width, minWidth, maxWidth, ret,
        // Support: Firefox 51+
        // Retrieving style before computed somehow
        // fixes an issue with getting wrong values
        // on detached elements
        style = elem.style;
    computed = computed || getStyles(elem);

    // getPropertyValue is needed for:
    //   .css('filter') (IE 9 only, #12537)
    //   .css('--customProperty) (#3144)
    if (computed) {
        ret = computed.getPropertyValue(name) || computed[name];
        //在没有获取到的情况下
        if (ret === "" && !isAttached(elem)) {
            ret = jQuery.style(elem, name);
        }
        // A tribute to the "awesome hack by Dean Edwards"
        // Android Browser returns percentage for some values,
        // but width seems to be reliably pixels.
        // This is against the CSSOM draft spec:
        // https://drafts.csswg.org/cssom/#resolved-values
        /**
         * const cssExpand = ["Top", "Right", "Bottom", "Left"];
         * const rboxStyle = new RegExp(cssExpand.join("|"), "i");
         * const pnum = (/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/).source; //获取//中间的字符串
         * const rnumnonpx = new RegExp("^(" + pnum + ")(?!px)[a-z%]+$", "i");不带px的数字
         */
        if (!support.pixelBoxStyles() && rnumnonpx.test(ret) && rboxStyle.test(name)) {
            // Remember the original values
            width = style.width;
            minWidth = style.minWidth;
            maxWidth = style.maxWidth;

            // Put in the new values to get a computed value out
            style.minWidth = style.maxWidth = style.width = ret;
            ret = computed.width;

            // Revert the changed values
            style.width = width;
            style.minWidth = minWidth;
            style.maxWidth = maxWidth;
        }
    }

    return ret !== undefined ?

        // Support: IE <=9 - 11 only
        // IE returns zIndex value as an integer.
        ret + "" :
        ret;
}
```
## 3、
```js
function style(elem, name, value, extra) {
    //文本或注释节点不考虑
    if (!elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style) {
        return;
    }

    // Make sure that we're working with the right name
    var ret, type, hooks,
        origName = camelCase(name),
        // rcustomProp = /^--/
        isCustomProp = rcustomProp.test(name),
        style = elem.style;

    // Make sure that we're working with the right name. We don't
    // want to query the value if it is a CSS custom property
    // since they are user-defined.
    if (!isCustomProp) {
        name = finalPropName(origName);
    }
    // Gets hook for the prefixed version, then unprefixed version
    hooks = jQuery.cssHooks[name] || jQuery.cssHooks[origName];
    // Check if we're setting a value
    if (value !== undefined) {
        type = typeof value;
        // Convert "+=" or "-=" to relative numbers (#7345)
        if (type === "string" && (ret = rcssNum.exec(value)) && ret[1]) {
            //调整样式 += -=
            value = adjustCSS(elem, name, ret);
            // Fixes bug #9237
            type = "number";
        }

        // Make sure that null and NaN values aren't set (#7116)
        if (value == null || value !== value) {
            return;
        }

        // If a number was passed in, add the unit (except for certain CSS properties)
        // The isCustomProp check can be removed in jQuery 4.0 when we only auto-append
        // "px" to a few hardcoded values.
        if (type === "number" && !isCustomProp) {
            value += ret && ret[3] || (jQuery.cssNumber[origName] ? "" : "px");
        }

        // background-* props affect original clone's values
        if (!support.clearCloneStyle && value === "" && name.indexOf("background") === 0) {
            style[name] = "inherit";
        }

        // If a hook was provided, use that value, otherwise just set the specified value
        if (!hooks || !("set" in hooks) ||
            (value = hooks.set(elem, value, extra)) !== undefined) {

            if (isCustomProp) {
                style.setProperty(name, value);
            } else {
                style[name] = value;
            }
        }

    } else {

        // If a hook was provided get the non-computed value from there
        if (hooks && "get" in hooks &&
            (ret = hooks.get(elem, false, extra)) !== undefined) {

            return ret;
        }

        // Otherwise just get the value from the style object
        return style[name];
    }
},

function  css(elem, name, extra, styles) {
    var val, num, hooks,
        //转换为小驼峰命名
        origName = camelCase(name),
        isCustomProp = rcustomProp.test(name);

    // Make sure that we're working with the right name. We don't
    // want to modify the value if it is a CSS custom property
    // since they are user-defined.
    if (!isCustomProp) {
        name = finalPropName(origName);
    }

    // Try prefixed name followed by the unprefixed name
    hooks = jQuery.cssHooks[name] || jQuery.cssHooks[origName];

    // If a hook was provided get the computed value from there
    if (hooks && "get" in hooks) {
        val = hooks.get(elem, true, extra);
    }

    // Otherwise, if a way to get the computed value exists, use that
    if (val === undefined) {
        val = curCSS(elem, name, styles);
    }

    // Convert "normal" to computed value
    if (val === "normal" && name in cssNormalTransform) {
        val = cssNormalTransform[name];
    }

    // Make numeric if forced or a qualifier was provided and val looks numeric
    if (extra === "" || extra) {
        num = parseFloat(val);
        return extra === true || isFinite(num) ? num || 0 : val;
    }

    return val;
}
```

## 3、判断元素是否是包含关系
```js
//表示是否是原生方法
const rnative = /^[^{]+\{\s*\[native \w/;//=>表示不以{开头
const hasCompare = rnative.test(docElem.compareDocumentPosition);
// Element contains another
// Purposefully self-exclusive
// As in, an element does not contain itself
const contains = hasCompare || rnative.test(docElem.contains) ?
    function (a, b) {
        var adown = a.nodeType === 9 ? a.documentElement : a,
            bup = b && b.parentNode;
        //!!转换成boolean类型
        return a === bup || !!(bup && bup.nodeType === 1 && (
            adown.contains ?
                adown.contains(bup) :
                a.compareDocumentPosition && a.compareDocumentPosition(bup) & 16
        ));
    } :
    //判断b是否是a的子节点
    function (a, b) {
        if (b) {
            while ((b = b.parentNode)) {
                if (b === a) {
                    return true;
                }
            }
        }
        return false;
    };
```