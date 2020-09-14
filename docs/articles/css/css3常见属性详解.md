---
title: background属性详解
date: '2020-08-27'
type: 技术
tags: css
note: background属性详解
---
## 1、background
&#8195;&#8195;`background` 是我们在 页面布局中经常用到的一个属性，但是很多时候都是很笼统的是使用`background`来设置背景图片，对于`background` 的其他属性可能很少去关注。我也是经常在用到的时候采取查询一下用法。但是经常记不住，所以写下这篇文章来加深自己对`background`的用法。除了常用的`background-color``background-image`,属性外，它还有以下用法：(**需要添加一个动态图来展示效果**)
+ background-position：	规定背景图像的位置。默认值：0% 0%。有以下属性
    + 如果您仅规定了一个关键词，那么第二个值将是"center"。
        + top left   
        + top center
        + top right
        + center left
        + center center
        + center right
        + bottom left
        + bottom center
        + bottom right
    + x% y%
        + 第一个值是水平位置，第二个值是垂直位置。
        + 左上角是 0% 0%。右下角是 100% 100%。
        + 如果您仅规定了一个值，另一个值将是 50%。
    + xpos ypos
        + 第一个值是水平位置，第二个值是垂直位置。
        + 左上角是 0 0。单位是像素 (0px 0px) 或任何其他的 CSS 单位。
        + 如果您仅规定了一个值，另一个值将是50%。
+ background-size：规定背景图片的尺寸。默认值时auto。主要有以下属性。
    + length
        + 设置背景图像的高度和宽度。第一个值设置宽度，第二个值设置高度。
        + 如果只设置一个值，则第二个值会被设置为 "auto"。
    + percentage
        + 以父元素的百分比来设置背景图像的宽度和高度。
        + 如果只设置一个值，则第二个值会被设置为 "auto"。
    + cover
        + 把背景图像扩展至足够大，以使背景图像完全覆盖背景区域。
    + contain
        + 把图像图像扩展至最大尺寸，以使其宽度和高度完全适应内容区域。(图片完全显示,没有图片的背景色填充)
+ background-repeat：规定如何重复背景图像。默认值 `repeat`。主要有以下属性。
    + repeat	默认。背景图像将在垂直方向和水平方向重复。
    + repeat-x	背景图像将在水平方向重复。
    + repeat-y	背景图像将在垂直方向重复。
    + no-repeat	背景图像将仅显示一次。
    + inherit	规定应该从父元素继承 background-repeat 属性的设置。
+ background-origin：规定背景图片的定位区域。默认值时`padding-box`。
    + padding-box	背景图像相对于内边距框来定位。以左内边距为原点	
    + border-box	背景图像相对于边框盒来定位。	
    + content-box	背景图像相对于内容框来定位。

+ background-clip：规定背景的绘制区域。默认值是`border-box`。效果跟`background-origin`很像。主要有以下属性。
    + border-box	背景被裁剪到边框盒。
    + padding-box	背景被裁剪到内边距框。
    + content-box	背景被裁剪到内容框。

+ background-attachment：规定背景图像是否固定或者随着页面的其余部分滚动。默认值是`scroll`。主要有以下属性。
    + scroll	默认值。背景图像会随着页面其余部分的滚动而移动。
    + fixed	当页面的其余部分滚动时，背景图像不会移动。
    + inherit	规定应该从父元素继承   `background-attachment` 属性的设置。

+ inherit：从父元素继承 `background` 属性

## 2、box-shadow
`box-shadpw` 给元素外框添加阴影。默认值为none，主要有以下属性：
+ h-shadow	必需的。水平阴影的位置。元素最右边位置为0，允许负值
+ v-shadow	必需的。垂直阴影的位置。元素最下边位置为0，允许负值
+ blur	可选。模糊距离
+ spread	可选。阴影的大小。元素四周的颜色
+ color	可选。阴影的颜色。在CSS颜色值寻找颜色值的完整列表
+ inset	可选。从外层的阴影（开始时）改变阴影内侧阴影
加入我想实现一个四周发光的元素。可以这样设置样式。
```html
<style>
.box{
    top: 15px;
    left: 15px;
    position: relative;
    width: 200px;
    height: 200px;
    background-size: contain;
    background-color: green;
    padding: 20px;
    box-shadow: 0px 0px 10px 10px red;
}
    
</style>
<div class="box></div>
```
效果如下所示
<img src="../../images/box-shadow.png" alt="暂无图片">

## 3、text-shadow
`text-shadow` 给文本设置阴影，可以给文本添加一个或多个阴影，用逗号隔开。默认值为`none`,主要有以下属性：
+ h-shadow	必需。水平阴影的位置。允许负值。	
+ v-shadow	必需。垂直阴影的位置。允许负值。
+ blur	可选。模糊的距离。
+ color	可选。阴影的颜色。
```html
<style>
h1
{
text-shadow: 5px 5px 5px #FF0000,-5px -5px 5px blue;
}
</style>
<h1>文本阴影效果！</h1>
```
效果如下所示：
<img src="../../images/text-shadow.png" alt="暂无图片"/>

## 4、filter
通常用来表示图片的可视效果(模糊和饱和度)。主要有以下属性：
+ blur(px) 给图像设置高斯模糊。不接受百分比值。
+ brightness(%) 给图片应用一种线性乘法，使其看起来更亮或更暗。默认值是1.
+ contrast(%) 调整图像的对比度。默认值是1
+ drop-shadow(h-shadow v-shadow blur spread color) 给图像设置一个阴影效果。阴影是合成在图像下面，可以有模糊度的，
+ grayscale(%)：将图像转换为灰度图像。默认值是0。
+ hue-rotate(deg) 给图像应用色相旋转。默认值是0。
+ invert(%) 反转输入图像。
+ opacity(%) 转化图像的透明程度。值定义转换的比例。默认是1
+ saturate(%) 转换图像饱和度。值定义转换的比例，默认是1
+ sepia(%) 将图像转换为深褐色。
+ url()  url函数接受一个XML文件，该文件设置了 一个 `SVG` 滤镜，且可以包含一个锚点来指定一个具体的滤镜元素。`filter: url(svg-url#element-id) `

## 5、变量的使用
`:root`伪类可以看成是一个全局变量，在里面定义的变量在全局的选择器中都可以使用。也可以在选择器中以`--xx`的形式定义变量，供它下方的子选择器使用。变量是选择就近原则采用的
```css
/**
定义变量,变量名前面加两条--
变量使用语法 var(变量) var函数还可以传第二个参数，作为默认参数

*/
/* 设置全局变量 */
:root{
    --bg:"rwr";
    --font-size:20px;
    --height:30px;
}
/* 使用变量 */
.box1{
    width: 200px;
    height: var(--height);
    background-image: url(../background/2.jpg);
    background-size: contain;
    background-color:var(--bg,blue);
    background-repeat: no-repeat;
    /* background-origin:padding */
    border: 10px solid black;
    padding: 20px;
    /* 定义局部变量 */
    --mr:10px 20px;
    margin:var(--mr);
    }
```
