---
title: WebGL渲染和执行流程
date: '2024-06-11'
type: 技术
tags: WebGL
note: WebGL渲染流程
---

## 1、WebGL渲染流程

WebGL渲染流程可以用下面的流程图来表示。
<img src="../../images/webgl/WebGL-渲染管线.png" alt="暂无数据" />

`WebGL（Web Graphics Library）`是一种用于在Web浏览器中进行3D图形渲染的技术，其渲染管线包括以下步骤：

+ 数据准备阶段 (Data Preparation Stage):
  + 在这一阶段，应用程序通过JavaScript代码与WebGL API进行交互。应用程序负责设置渲染状态、创建和管理图形对象、处理用户输入等。
  + 主要操作包括：创建着色器、创建缓冲区对象、上传顶点数据、配置WebGL状态、发起绘制调用等。

+ 顶点着色器阶段 (Vertex Shader Stage):

  + 顶点着色器是一个运行在GPU上的小程序，用于处理顶点数据。每个顶点都会被传递到顶点着色器中进行处理。
  + 主要功能包括：顶点坐标变换（将顶点坐标从模型空间变换到裁剪空间）、计算顶点的颜色、纹理坐标等属性。
  + 输入：顶点属性（位置、颜色、法线、纹理坐标等）。
  + 输出：顶点的变换后位置、其他顶点属性。

+ 图元装配阶段 (Primitive Assembly Stage):

  + 在这一阶段，顶点着色器的输出会被组装成几何图元（例如点、线、三角形）。
  + 这些图元将用于后续的光栅化阶段。

+ 几何着色器阶段 (可选，Geometry Shader Stage):

  + 几何着色器是一个可选的阶段，用于在图元装配后进行额外的几何处理。
  + 可以通过几何着色器生成新的顶点，创建更多的几何图元，或进行其他复杂的几何操作。
  + `WebGL 1.0`不支持几何着色器，但`WebGL 2.0`及其扩展支持。

+ 光栅化阶段 (Rasterization Stage):

  + 光栅化是将几何图元转换为片元（fragments）的过程。片元可以视为覆盖图元的像素样本。
  + 每个片元包含了顶点插值后的属性（如颜色、深度、纹理坐标等）。
+ 片元着色器阶段 (Fragment Shader Stage):

  + 片元着色器是一个运行在GPU上的小程序，用于处理每个片元。片元着色器决定了每个片元的最终颜色和其他属性。
  + 主要功能包括：计算光照、应用纹理、处理阴影等。
  + 输入：插值后的片元属性。
  + 输出：片元的颜色值、深度值等。
+ 深度和模板测试阶段 (Depth and Stencil Test Stage):

  + 在这一阶段，进行深度测试和模板测试，以确定片元是否可见。
  + 深度测试：根据深度缓冲区中的值，决定片元是被保留还是丢弃。
  + 模板测试：根据模板缓冲区中的值，决定片元是被保留还是丢弃。
+ 混合阶段 `(Blending Stage)`:

  + 混合是将片元着色器的输出颜色与帧缓冲区中已有颜色进行组合的过程。
  + 混合操作可以实现透明效果、叠加效果等。
+ 帧缓冲区操作 (Framebuffer Operations):

  + 最终经过测试和混合的片元会写入帧缓冲区，帧缓冲区中的数据最终显示在屏幕上。


## 2、WebGL的执行流程
`GPU`中的渲染流程我们是看不见的，下面我们用一个`demo`来展示在`WebGL`的执行流程。
> 1.创建着色器代码
+  1.1 顶点着色器代码

顶点着色器的作用是计算顶点的位置。
```js
<script id="vertexShader" type="x-shader/x-vertex">
  //attribute声明vec4类型变量apos
  attribute vec4 apos;
  void main() {
    //顶点坐标apos赋值给内置变量gl_Position
    //逐顶点处理数据
    gl_Position = apos;
  }
</script>
```
**注意** 如果顶点数据给的不是`-1`到`1`之间的数据，那么顶点着色器的代码就得经过下面的换算
```js
<script id="vertex-shader-2d" type="x-shader/x-vertex">
  attribute vec2 a_position;
  uniform vec2 u_resolution;
  void main() {
    // 从像素坐标转换到 0.0 到 1.0
    vec2 zeroToOne = a_position / u_resolution;
    // 再把 0->1 转换 0->2
    vec2 zeroToTwo = zeroToOne * 2.0;
    // 把 0->2 转换到 -1->+1 (裁剪空间)
    vec2 clipSpace = zeroToTwo - 1.0;
    // WebGL认为左下角是 0，0 。 想要像传统二维API那样起点在左上角，我们只需翻转y轴即可
    gl_Position = vec4(clipSpace* vec2(1, -1), 0, 1);
  }
</script>
```
+ 1.2.片元着色器代码

片段着色器的作用计算出当前绘制图元中每个像素的颜色值。
```js
<script id="fragmentShader" type="x-shader/x-fragment">
  void main() {
    // 逐片元处理数据，所有片元(像素)设置为红色
    gl_FragColor = vec4(1.0,0.0,0.0,1.0);
  }
</script>
```

> 3.获取 `WebGL` 上下文

```js
const canvas = document.querySelector("#c");
const gl = canvas.getContext("webgl");
```
> 4.创建和连接着色器程序

该步骤主要用到的是下面的`API`。**js 程序中的 GLSL 语言——如何连接着色器程序**
```js
- createShader：创建着色器对象
- shaderSource：提供着色器源码
- compileShader：编译着色器对象
- createProgram：创建着色器程序
- attachShader：绑定着色器对象
- linkProgram：链接着色器程序
- useProgram：启用着色器程序，可以放在渲染之前，也可以放在链接着色器程序之后
```
下面是完整的例子
+ 获取着色器源码
```js
function initShader(gl) {
  //1.获取着色器源码:
  //顶点着色器源码
  const vertexShaderSource = document.getElementById('vertexShader').innerText;
  //片元着色器源码
  const fragmentShaderSource = document.getElementById('fragmentShader').innerText;
  //2.创建着色器对象
  const vertexShader = createShader(gl,gl.VERTEX_SHADER,vertexShaderSource);
  const fragmentShader = createShader(gl,gl.FRAGMENT_SHADER,fragmentShaderSource);
  const program =  initProgram(vertexShader,fragmentShader);
  return  program;
}
```
+ 创建并编译着色器
编译是将 `GLSL`（`OpenGL`着色器语言）代码转换为GPU可执行代码的过程。
```js
function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  //3.为着色器对象提供源码
  gl.shaderSource(shader, source);
  //4.编译着色器 编译是将GLSL（OpenGL着色器语言）代码转换为GPU可执行代码的过程。
  gl.compileShader(shader);
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }
  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}
```
+ 根据着色器创建着色程序（`program`）
```js
function initProgram(vertexShader,fragmentShader){
  //5.创建和连接着色器程序
  const program = gl.createProgram();
  //6.将编译后的顶点着色器和片元着色器附加到程序对象上。
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  // 7.链接着色器程序。链接是将多个着色器组合成一个完整的程序的过程，链接成功后，这个程序可以用于渲染。
  gl.linkProgram(program);
  // 8.将创建和链接好的着色器程序设置为当前使用的程序，这里也可以暂时先不链接
  gl.useProgram(program);
  return program;
}
```
> 5.数据准备阶段
```js
 const data = new Float32Array([
    -0.5, 0.5,
    -0.5, -0.5,
    0.5, 0.5,
  ]);
```
> 6.数据传输阶段

数据传输过程中主要是通过创建缓冲区，并使用缓冲区来传递数据的，下面是使用缓冲区的一些`API`。
+ gl.createBuffer：创建缓冲区。
+ gl.bindBuffer：绑定某个缓冲区对象为当前缓冲区。
+ gl.bufferData：往缓冲区中复制数据。
+ gl.enableVertexAttribArray：启用顶点属性。
+ gl.vertexAttribPointer：设置顶点属性从缓冲区中读取数据的方式。
**主意：** 下面的4，5，6步，也可以放在渲染阶段进行。
```js
//1.创建缓冲区对象
const buffer = gl.createBuffer();
//2.绑定缓冲区对象,激活buffer
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
//3.顶点数组data数据传入缓冲区
gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
//4.获取顶点着色器的位置变量apos，即aposLocation指向apos变量。
const aposLocation = gl.getAttribLocation(program, 'apos');
//5.缓冲区中的数据按照一定的规律传递给位置变量apos
gl.vertexAttribPointer(aposLocation, 2, gl.FLOAT, false, 0, 0);
//6.允许数据传递
gl.enableVertexAttribArray(aposLocation);
```
上面的代码只能算是 `WebGL` 的初始化，下面的才算是 `WebGL`的渲染过程。
> 7.调整画布的尺寸。

调整画布`（canvas）`的尺寸以匹配它的显示尺寸,画布就像图片一样有两个尺寸。 一个是它拥有的实际像素个数，另一个是它显示的大小。
```js
// https://webglfundamentals.org/webgl/lessons/zh_cn/webgl-resizing-the-canvas.html
function resizeCanvasToDisplaySize(canvas) {
    // 考虑像素比的情况 
    // Lookup the size the browser is displaying the canvas in CSS pixels.
    const realToCSSPixels = window.devicePixelRatio;

    // 获取浏览器显示的画布的CSS像素值
    // 然后计算出设备像素设置drawingbuffer
    const displayWidth  = Math.floor(gl.canvas.clientWidth  * realToCSSPixels);
    const displayHeight = Math.floor(gl.canvas.clientHeight * realToCSSPixels);

    // Check if the canvas is not the same size.
    const needResize = canvas.width  !== displayWidth ||
                       canvas.height !== displayHeight;

    if (needResize) {
      // Make the canvas the same size
      canvas.width  = displayWidth;
      canvas.height = displayHeight;
    }

    return needResize;
  }
```
> 8.数据渲染阶段
+ 简单版
```js
//1.设置清屏颜色为黑色。
gl.clearColor(0, 0, 0, 1.0);
//2.清屏
gl.clear(gl.COLOR_BUFFER_BIT);
//3.开始绘制图形
gl.drawArrays(gl.TRIANGLES, 0, count);
```
如果我们在前面没有**使用着色程序**，也没有将数据和着色器关联起来时，需要用到下面的复杂版。
+ 复杂版
```js
//1.设置清屏颜色为黑色。
gl.clearColor(0, 0, 0, 1.0);
//2.清屏
gl.clear(gl.COLOR_BUFFER_BIT);
//3.告诉它用我们之前写好的着色程序（一个着色器对）
gl.useProgram(program);
//4.将数据与着色器关联起来
//从GLSL着色程序中找到这个属性值所在的位置。
const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
// 告诉WebGL怎么从我们之前准备的缓冲中获取数据给着色器中的属性。启动属性
gl.enableVertexAttribArray(positionAttributeLocation);
// 将绑定点绑定到缓冲数据（positionBuffer）
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
 
// 告诉属性怎么从positionBuffer中读取数据 (ARRAY_BUFFER)
const size = 2;          // 每次迭代运行提取两个单位数据
const type = gl.FLOAT;   // 每个单位的数据类型是32位浮点型
const normalize = false; // 不需要归一化数据
const stride = 0;        // 0 = 移动单位数量 * 每个单位占用内存（sizeof(type)）
                       // 每次迭代运行运动多少内存到下一个数据开始点
const offset = 0;        // 从缓冲起始位置开始读取
// gl.vertexAttribPointer是将属性绑定到当前的ARRAY_BUFFER。 换句话说就是属性绑定到了positionBuffer上。
gl.vertexAttribPointer(
    positionAttributeLocation, size, type, normalize, stride, offset)
//5.开始绘制图形
const primitiveType = gl.TRIANGLES;//绘制方式
const offset = 0; //每次绘制时的偏移量
const count = 3;// 顶点着色器运行的次数
gl.drawArrays(primitiveType, offset, count);
```

> `gl.vertexAttribPointer方法详解`

本质上就是告诉属性怎么从 `positionBuffer`中读取数据 (`ARRAY_BUFFER`)
```js
const size = 2;          // 每次迭代运行提取两个单位数据
const type = gl.FLOAT;   // 每个单位的数据类型是32位浮点型
const normalize = false; // 不需要归一化数据
const stride = 0;        // 0 = 移动单位数量 * 每个单位占用内存（sizeof(type)）
                       // 每次迭代运行运动多少内存到下一个数据开始点
const offset = 0;        // 从缓冲起始位置开始读取
// gl.vertexAttribPointer是将属性绑定到当前的ARRAY_BUFFER。 换句话说就是属性绑定到了positionBuffer上。
gl.vertexAttribPointer(
    positionAttributeLocation, size, type, normalize, stride, offset)
```

> `gl.drawArrays` 方法详解
```js
const primitiveType = gl.TRIANGLES;//绘制方式
const offset = 0; //每次绘制时的偏移量
const count = 3;// 顶点着色器运行的次数
gl.drawArrays(primitiveType, offset, count);
```

<Valine></Valine>