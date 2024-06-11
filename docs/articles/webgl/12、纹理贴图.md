---
title: 纹理贴图
date: "2021-06-21"
type: 技术
tags: WebGL
note:  纹理贴图
---
简单的说就是将 `png、jpg` 等格式图片显示在 `WebGL` 三维场景中。例如往三维模型上贴商标。
在着色器中图片的坐标称为**纹理坐标**，图片称为**纹理图像**，图片上的一个像素称为**纹素**，一个纹素就是一个 `RGB` 或者`RGBA`值。把整个图片看成一个平面区域，用一个二维`UV`坐标可以描述每一个纹素的位置。下图来源于网络。

<img src="../../images/webgl/WebGL-UV.png" alt="暂无图片" />

上图展示了 **纹理坐标** 和 **顶点坐标** 的对应关系。在纹理坐标系统中左下角是坐标原点 `(0,0)`。纹理坐标系统可以理解为一个边长为 1 的正方形。

顶点坐标在顶点着色器中经过光栅化处理后得到片元数据，纹理坐标在光栅化过程中会进行插值计算，得到一系列的纹理坐标数据，纹理坐标会按照一定的规律对应纹理图像上的纹素，内插得到的片元纹理坐标会传递给片元着色器。
在片元着色器中利用插值得到的坐标数据可以抽取纹理图像中的纹素，将抽取的纹素逐个赋值给光栅化顶点坐标得到的片元。

实现纹理贴图的代码如下：
#### 1、顶点着色器代码
关键字`attribute`声明的顶点数据赋值给`varying`关键字声明的变量，该顶点数据在顶点光栅化的时候会进行插值计算，内插出一系列和片元一一对应的数据，不论顶点的颜色数据，还是顶点的纹理坐标数据都会进行插值计算。
```js
<script type="shader-source" id="vertexShader">
    //浮点数设置为中等精度
    precision mediump float;
    attribute vec2 a_Position;
    varying vec2 v_Uv; //插值后纹理坐标
    attribute vec2 a_Uv;//纹理坐标
    void main(){
        gl_Position = vec4(a_Position, 0, 1);
        //纹理坐标差值计算
        v_Uv = a_Uv;
    }
</script>
```
#### 2、 片元着色器代码
`sampler2D`关键字和 `float、int、vec2、mat4`一样都是标识数据类型的关键字。
`gl_FragColor = texture2D(u_Texture, v_Uv)`;类似`gl_FragColor = v_color;`都是逐片元赋值像素数据。

通过执行`texture2D`函数可以返回`u_Texture`坐标对应的纹理图片上的纹素，然后赋值给`v_TexCoord`坐标对应的片元，`v_TexCoord` 坐标的作用就是把纹素映射到片元。
```js
<script type="shader-source" id="fragmentShader">
    //浮点数设置为中等精度
    precision mediump float;
    // 取样器类型变量,对应纹理图片的像素数据
    uniform sampler2D u_Texture;
    // 接收插值后的纹理坐标
    varying vec2 v_Uv;
    void main(){
        // 点的最终颜色。采集纹素，逐片元赋值像素值
        //每一个纹理坐标对应u_Texture数据的一个纹素
        gl_FragColor = texture2D(u_Texture, v_Uv);
    }
</script>
```
#### 3、JavaScript代码bufen
+ 获取`WebGL`上下文
```js
 function init() {
    //获取canvas
    let canvas = document.querySelector("#canvas");
    //获取绘图上下文
    let gl = canvas.getContext('webgl');
    //设置视图区域
    gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
    //创建着色器程序
    let program = initShader(gl);
    //创建缓冲区跟着色器交互
    assignValue(gl, program)
}

```
+ 构建着色器需要的数据与顶点着色器交互
```js
function assignValue(gl, program) {
    let positions = new Float32Array([
        -0.85, -0.85, 0, 0,
        -0.85, 0.85, 0, 1,
        0.85, 0.85, 1, 1,
        -0.85, -0.85, 0, 0,
        0.85, 0.85, 1, 1,
        0.85, -0.85, 1, 0,
    ]);
    // 随机生成一个颜色。
    var color = randomColor();
    // 找到着色器中的全局变量 u_Color;
    var u_Texture = gl.getUniformLocation(program, "u_Texture");
    var a_Position = gl.getAttribLocation(program, "a_Position");
    var a_Uv = gl.getAttribLocation(program, "a_Uv");

    gl.enableVertexAttribArray(a_Position);
    gl.enableVertexAttribArray(a_Uv);
    // 创建缓冲区
    var buffer = gl.createBuffer();
    // 绑定缓冲区为当前缓冲
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    // 设置 a_Position 属性从缓冲区读取数据方式
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 16, 0);
    // 设置 a_Uv 属性从缓冲区读取数据方式
    gl.vertexAttribPointer(a_Uv, 2, gl.FLOAT, false, 16, 8);
    // 向缓冲区传递数据
    gl.bufferData(
    gl.ARRAY_BUFFER,
    positions,
    gl.STATIC_DRAW
    );
    //加载纹理图片
    loadTexture(gl, '../images/webgl/1.jpg', u_Texture, function () {
        //WebGL渲染
        render(gl, positions.length / 4);
    })
}
```
+ 加载纹理图片并将纹理数据传递给片元着色器
    图片坐标系统的特点是：
    + 左上角为原点(0, 0)。
    + 向右为横轴正方向，横轴最大值为 1，即横轴坐标范围【1，0】。
    + 向下为纵轴正方向，纵轴最大值为 1，即纵轴坐标范围【0，1】。

    纹理坐标系统不同于图片坐标系统，它的特点是：
    + 左下角为原点(0, 0)。
    + 向右为横轴正方向，横轴最大值为 1，即横轴坐标范围【1，0】。
    + 向上为纵轴正方向，纵轴最大值为 1，即纵轴坐标范围【0，1】。

    **所以我们需要在创建纹理图片的过程中将图片上下翻转使得图片的左下角与UV坐标原点重合。**
```js
function loadTexture(gl, src, attribute, callback) {
    let img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () {
    let texture = gl.createTexture();//创建纹理图像缓冲区
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); //纹理图片上下反转,使得图片的左下角与UV坐标原点重合。
    gl.activeTexture(gl.TEXTURE0);//激活0号纹理单元TEXTURE0
    
    gl.bindTexture(gl.TEXTURE_2D, texture);//绑定纹理缓冲区
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img); //设置纹素格式，jpg格式对应gl.RGB
    //设置纹理贴图填充方式(纹理贴图像素尺寸小于顶点绘制区域像素尺寸)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        //设置纹理贴图填充方式(纹理贴图像素尺寸大于顶点绘制区域像素尺寸)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // 水平填充
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    //竖直填充
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.uniform1i(attribute, 0);
    callback && callback();
    };
    img.src = src;
}
```
+ 渲染`WebGL`
```js
function render(gl, count) {
    //设置清屏颜色为黑色。
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, count);
}
```

下面是一些例子中用到的 `GLSL`语言 和`WeBGL API`的总结.
+ 着色器语言`GLSL`
    + 修饰符
        + attribute：属性修饰符。
        + uniform：全局变量修饰符。
        + varying：顶点着色器传递给片元着色器的属性修饰符。
    + 屏幕坐标系到设备坐标系的转换。
        + 屏幕坐标系左上角为原点，X 轴坐标向右为正，Y 轴坐标向下为正。
        + 坐标范围：
            + X轴：【0, canvas.width】
            + Y轴：【0, canvas.height】
        + 设备坐标系以屏幕中心为原点，X 轴坐标向右为正，Y 轴向上为正。
        + 坐标范围是
            + X轴：【-1, 1】。
            + Y轴：【-1, 1】。
+ WebGL API
    + shader：着色器对象
        + gl.createShader：创建着色器。
        + gl.shaderSource：指定着色器源码。
        + gl.compileShader：编译着色器。
    + program：着色器程序
        + gl.createProgram：创建着色器程序。
        + gl.attachShader：链接着色器对象。
        + gl.linkProgram：链接着色器程序。
        + gl.useProgram：使用着色器程序。
    + attribute：着色器属性
        + gl.getAttribLocation：获取顶点着色器中的属性位置。
        + gl.enableVertexAttribArray：启用着色器属性。
        + gl.vertexAttribPointer：设置着色器属性读取 buffer 的方式。
        + gl.vertexAttrib2f：给着色器属性赋值，值为两个浮点数。
        + gl.vertexAttrib3f：给着色器属性赋值，值为三个浮点数。
    + uniform：着色器全局属性
        + gl.getUniformLocation：获取全局变量位置。
        + gl.uniform4f：给全局变量赋值 4 个浮点数。
        + gl.uniform1i：给全局变量赋值 1 个整数。
    + buffer：缓冲区
        + gl.createBuffer：创建缓冲区对象。
        + gl.bindBuffer：将缓冲区对象设置为当前缓冲。
        + gl.bufferData：向当前缓冲对象复制数据。
    + clear：清屏
        + gl.clearColor：设置清除屏幕的背景色。
        + gl.clear：清除屏幕。
    + draw：绘制
        + gl.drawArrays：数组绘制方式。
        + gl.drawElements：索引绘制方式。
    + 图元
        + gl.POINTS：点。
        + gl.LINE：基本线段。
        + gl.LINE_STRIP：连续线段。
        + gl.LINE_LOOP：闭合线段。
        + gl.TRIANGLES：基本三角形。
        + gl.TRIANGLE_STRIP：三角带。
        + gl.TRIANGLE_FAN：三角扇。
    + 纹理贴图
        + gl.createTexture：创建纹理对象。
        + gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); 设置图片的翻转
        + gl.activeTexture：激活纹理单元。
        + gl.bindTexture：绑定纹理对象到当前纹理。
        + gl.texImage2D：将图片数据传递给 GPU。
        + gl.texParameterf：设置图片放大缩小时的过滤算法。


**参考**<br>
[WebGL零基础入门教程(郭隆邦)](http://www.yanhuangxueyuan.com/WebGL/)<br>
[WebGL 入门与实践](https://juejin.cn/book/6844733755580481543/section/6844733755916025869)<br>
[WebGL官方文档](https://developer.mozilla.org/zh-CN/docs/Web/API/WebGLRenderingContext/vertexAttribPointer)<br>
