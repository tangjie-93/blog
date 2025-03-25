---
title: 10、css选择器的优先级
date: '2020-01-14'
type: 技术
tags: css
note: css选择器的优先级
---

CSS选择器的优先级是:`内联>ID选择器>类选择器>标签选择器`。
注意`!important优先级比内联还要高`不同的优先级其权重是不一样的。可以将权重分为从大到小的4个级别`A,B,C,D`。
+ A 的值等于 1 的前提是存在内联样式, 否则 `A = 0`;
+ B 的值等于 ID选择器 出现的次数;
+ C 的值等于 `类选择器 和 属性选择器 和 伪类` 出现的总次数;
+ D 的值等于 `标签选择器 和 伪元素` 出现的总次数 。

比较优先级的方式是从`A到D`去比较值的大小。判断优先级时，从左到右，一一比较，直到比较出最大值，就可以停止比较了。
**例子**
```css
div ul li .test {
    color: red;
}

#test {
    color: blue
}

.span {
    color: green;
}
```
```html
<div>
    <ul>
        <li>
            <span class="test span" id="test">test </span>
        </li>
    </ul>
</div>
```
`div ul li .test`的权重值是`{0,0,1,3}`,`#test`的权重值为`{0,1,0,0}`,`.span`的权重值为`{0,0,1,0}`，对比之下可以看出`#test`的权重值最高，所以`span`元素最终的颜色是蓝色。