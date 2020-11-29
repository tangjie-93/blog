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
## 3、属性值的设置和获取
```js
function style(elem, name, value, extra) {
    //文本或注释节点不考虑
    if (!elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style) {
        return;
    }
    //样式名处理
    var ret, type, hooks,
        origName = camelCase(name),
        // rcustomProp = /^--/ 以--开口
        isCustomProp = rcustomProp.test(name),
        style = elem.style;

    //判断是否是用户自定义名
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
        //rcssNum .exec("+=90a")=> ["+=90a", "+", "90", "a", index: 0, input: "+=90a", groups: undefined]
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
        //添加在属性值后面添加单位px
        if (type === "number" && !isCustomProp) {
            value += ret && ret[3] || (jQuery.cssNumber[origName] ? "" : "px");
        }
        //处理background开头的样式
        // background-* props affect original clone's values
        if (!support.clearCloneStyle && value === "" && name.indexOf("background") === 0) {
            style[name] = "inherit";
        }

        // css钩子存在的情况下设置样式值
        if (!hooks || !("set" in hooks) ||
            (value = hooks.set(elem, value, extra)) !== undefined) {
            //设置样式值
            if (isCustomProp) {
                style.setProperty(name, value);
            } else {
                style[name] = value;
            }
        }

    } else {
        //有样式钩子时
        // If a hook was provided get the non-computed value from there
        if (hooks && "get" in hooks &&
            (ret = hooks.get(elem, false, extra)) !== undefined) {
            return ret;
        }

        // 否则从style对象中获取样式值
        return style[name];
    }
},
//获取样式值
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

    // 从css钩子中获取样式值
    if (hooks && "get" in hooks) {
        val = hooks.get(elem, true, extra);
    }

    // 如果没有从css钩子中获取到属性值时，则通过getComputedStyle或者elem.style对象获取
    if (val === undefined) {
        val = curCSS(elem, name, styles);
    }

    // 属性名为letterSpacing或者fontWeight时，将属性值为normal设置为正常值
    /*
        cssNormalTransform = {
            letterSpacing: "0",
            fontWeight: "400"
        };
    */

    if (val === "normal" && name in cssNormalTransform) {
        val = cssNormalTransform[name];
    }
    //将value转换成Number类型
    // Make numeric if forced or a qualifier was provided and val looks numeric
    if (extra === "" || extra) {
        num = parseFloat(val);
        //isFinite如果参数是 NaN，正无穷大或者负无穷大，会返回 false，其他返回 true。
        return extra === true || isFinite(num) ? num || 0 : val;
    }
    return val;
}
```

## 4、判断元素是否是包含关系
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
## 5、盒模型下的宽高获取
```js
//盒模型计算width和height
function boxModelAdjustment (elem, dimension, box, isBorderBox, styles, computedVal) {
    var i = dimension === "width" ? 1 : 0,
        extra = 0,
        delta = 0;
    if (box === (isBorderBox ? "border" : "content")) {
        return 0;
    }
    for (; i < 4; i += 2) {
        // 盒模型不考虑margin
        if (box === "margin") {
            delta += jQuery.css(elem, box + cssExpand[i], true, styles);
        }

        // If we get here with a content-box, we're seeking "padding" or "border" or "margin"
        if (!isBorderBox) {

            // Add padding
            delta += jQuery.css(elem, "padding" + cssExpand[i], true, styles);

            // For "border" or "margin", add border
            if (box !== "padding") {
                delta += jQuery.css(elem, "border" + cssExpand[i] + "Width", true, styles);

                // But still keep track of it otherwise
            } else {
                extra += jQuery.css(elem, "border" + cssExpand[i] + "Width", true, styles);
            }

            // If we get here with a border-box (content + padding + border), we're seeking "content" or
            // "padding" or "margin"
        } else {

            // For "content", subtract padding
            if (box === "content") {
                delta -= jQuery.css(elem, "padding" + cssExpand[i], true, styles);
            }

            // For "content" or "padding", subtract border
            if (box !== "margin") {
                delta -= jQuery.css(elem, "border" + cssExpand[i] + "Width", true, styles);
            }
        }
    }

    // Account for positive content-box scroll gutter when requested by providing computedVal
    if (!isBorderBox && computedVal >= 0) {

        // offsetWidth/offsetHeight is a rounded sum of content, padding, scroll gutter, and border
        // Assuming integer scroll gutter, subtract the rest and round down
        delta += Math.max(0, Math.ceil(
            elem["offset" + dimension[0].toUpperCase() + dimension.slice(1)] -
            computedVal -
            delta -
            extra -
            0.5

            // If offsetWidth/offsetHeight is unknown, then we can't determine content-box scroll gutter
            // Use an explicit zero to avoid NaN (gh-3964)
        )) || 0;
    }

    return delta;
}
//获取宽度或高度
function getWidthOrHeight (elem, dimension, extra) {

    // 获取计算属性
    var styles = getStyles(elem),

        // To avoid forcing a reflow, only fetch boxSizing if we need it (gh-4322).
        // Fake content-box until we know it's needed to know the true value.
        //是否需要应用了boxSizing属性
        boxSizingNeeded = !support.boxSizingReliable() || extra,
        //判断boxSizing的属性是否是border-box
        isBorderBox = boxSizingNeeded &&
            jQuery.css(elem, "boxSizing", false, styles) === "border-box",
        valueIsBorderBox = isBorderBox,
        //获取属性值
        val = curCSS(elem, dimension, styles),
        //offset属性
        offsetProp = "offset" + dimension[0].toUpperCase() + dimension.slice(1);

    // Support: Firefox <=54
    // Return a confounding non-pixel value or feign ignorance, as appropriate.
    //判断属性值是否是
    if (rnumnonpx.test(val)) {
        if (!extra) {
            return val;
        }
        val = "auto";
    }


    // Support: IE 9 - 11 only
    // Use offsetWidth/offsetHeight for when box sizing is unreliable.
    // In those cases, the computed value can be trusted to be border-box.
    if ((!support.boxSizingReliable() && isBorderBox ||

        // Support: IE 10 - 11+, Edge 15 - 18+
        // IE/Edge misreport `getComputedStyle` of table rows with width/height
        // set in CSS while `offset*` properties report correct values.
        // Interestingly, in some cases IE 9 doesn't suffer from this issue.
        !support.reliableTrDimensions() && nodeName(elem, "tr") ||

        // Fall back to offsetWidth/offsetHeight when value is "auto"
        // This happens for inline elements with no explicit setting (gh-3571)
        val === "auto" ||

        // Support: Android <=4.1 - 4.3 only
        // Also use offsetWidth/offsetHeight for misreported inline dimensions (gh-3602)
        !parseFloat(val) && jQuery.css(elem, "display", false, styles) === "inline") &&

        // Make sure the element is visible & connected
        elem.getClientRects().length) {
        //获取属性值
        isBorderBox = jQuery.css(elem, "boxSizing", false, styles) === "border-box";

        // Where available, offsetWidth/offsetHeight approximate border box dimensions.
        // Where not available (e.g., SVG), assume unreliable box-sizing and interpret the
        // retrieved value as a content box dimension.
        valueIsBorderBox = offsetProp in elem;
        if (valueIsBorderBox) {
            val = elem[offsetProp];
        }
    }

    // Normalize "" and auto 将值转换为Number类型
    val = parseFloat(val) || 0;

    // Adjust for the element's box model
    return (val +
        boxModelAdjustment(
            elem,
            dimension,
            extra || (isBorderBox ? "border" : "content"),
            valueIsBorderBox,
            styles,

            // Provide the current computed size to request scroll gutter calculation (gh-3589)
            val
        )
    ) + "px";
}
```
## 6、宽高属性的的钩子
```js
function setPositiveNumber (_elem, value, subtract) {
    // 判断value是否是以+/-开头的
    var matches = rcssNum.exec(value);
    return matches ?
        Math.max(0, matches[2] - (subtract || 0)) + (matches[3] || "px") :
        value;
}
//给width和height添加钩子
jQuery.each(["height", "width"], function (_i, dimension) {
    jQuery.cssHooks[dimension] = {
        //获取宽高额钩子
        get: function (elem, computed, extra) {
            if (computed) {
                //rdisplayswap= /^(none|table(?!-c[ea]).+)/,
                return rdisplayswap.test(jQuery.css(elem, "display")) &&
                    (!elem.getClientRects().length || !elem.getBoundingClientRect().width) ?
                    //保存elem原来的属性，在执行过程中将elem设置为绝对定位
                    //cssShow = { position: "absolute", visibility: "hidden", display: "block" },
                    swap(elem, cssShow, function () {
                        return getWidthOrHeight(elem, dimension, extra);
                    }) :
                    getWidthOrHeight(elem, dimension, extra);
            }
        },

        set: function (elem, value, extra) {
            var matches,
                styles = getStyles(elem),
                scrollboxSizeBuggy = !support.scrollboxSize() &&
                    styles.position === "absolute",
                //box-sizing=>border-box
                boxSizingNeeded = scrollboxSizeBuggy || extra,
                isBorderBox = boxSizingNeeded &&
                    jQuery.css(elem, "boxSizing", false, styles) === "border-box",
                subtract = extra ?
                    boxModelAdjustment(
                        elem,
                        dimension,
                        extra,
                        isBorderBox,
                        styles
                    ) :
                    0;

            // Account for unreliable border-box dimensions by comparing offset* to computed and
            // faking a content-box to get border and padding (gh-3699)
            if (isBorderBox && scrollboxSizeBuggy) {
                //获取elem内容的宽或者高
                subtract -= Math.ceil(
                    elem["offset" + dimension[0].toUpperCase() + dimension.slice(1)] -
                    parseFloat(styles[dimension]) -
                    boxModelAdjustment(elem, dimension, "border", false, styles) -
                    0.5
                );
            }

            // Convert to pixels if value adjustment is needed
            if (subtract && (matches = rcssNum.exec(value)) &&
                (matches[3] || "px") !== "px") {

                elem.style[dimension] = value;
                value = jQuery.css(elem, dimension);
            }
            return setPositiveNumber(elem, value, subtract);
        }
    };
});
```