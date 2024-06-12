---
title: 顶点、片元着色器详解
date: '2024-06-12'
type: 技术
tags: WebGL
note: 顶点、片元着色器详解
---
`WebGL` 在 `GPU` 上的工作基本上分为两部分，第1部分是将顶点（或数据流）转换到裁剪空间坐标， 第2部分是基于第一部分的结果绘制像素点。

##  1.顶点着色器
一个顶点着色器的工作是生成裁剪空间坐标值，通常是以下的形式
```js
void main() {
  // 该变量的值就是裁减空间坐标值
   gl_Position = doMathToMakeClipspaceCoordinates
}
```
在顶点着色器定义变量时前面的修饰符主要用到的是下面三个属性
+ `attribute` 属性 (从缓冲中获取的数据)
+ `uniform` 全局变量 (在一次绘制中对所有顶点保持一致值)
+ `texture` 纹理 (从像素或纹理元素中获取的数据)
顶点着色器需要的数据，可以通过以下三种方式获得。

> **attribute 属性**

最常用的方法是缓冲和属性。使用缓冲的一般流程上面已经讲过了。就是 
+ 创建缓冲
```js
const buf = gl.createBuffer();
```
+ 将数据存入缓冲
```js
gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, someData, gl.STATIC_DRAW);
```
+ 在着色器中找到属性所在地址
```js
const positionLoc = gl.getAttribLocation(someShaderProgram, "a_position");
```
+ 从缓冲中获取数据传递给属性
```js
// 开启从缓冲中获取数据
gl.enableVertexAttribArray(positionLoc);
 
const numComponents = 3;  // (x, y, z)
const type = gl.FLOAT;    // 32位浮点数据
const normalize = false;  // 不标准化
const offset = 0;         // 从缓冲起始位置开始获取
const stride = 0;         // 到下一个数据跳多少位内存
                        // 0 = 使用当前的单位个数和单位长度 （ 3 * Float32Array.BYTES_PER_ELEMENT ）
 
gl.vertexAttribPointer(positionLoc, numComponents, type, false, stride, offset);
```
+ 最后将数据传递给  `gl_Position`
```js
attribute vec4 a_position;
 
void main() {
   gl_Position = a_position;
}
```
**属性**可以用 `float, vec2, vec3, vec4, mat2, mat3` 和 `mat4` 数据类型。

> `uniform` 全局变量

全局变量在一次绘制过程中传递给着色器的值都一样。下面是一个用全局变量给顶点着色器添加一个偏移量的例子。
```js
attribute vec4 a_position;
uniform vec4 u_offset;
 
void main() {
   gl_Position = a_position + u_offset;
}
```
在初始化时找到全局变量的地址。
```js
const offsetLoc = gl.getUniformLocation(someProgram, "u_offset");
```
在绘制前设置全局变量
```js
gl.uniform4fv(offsetLoc, [1, 0, 0, 0]);  // 向右偏移一半屏幕宽度
```
**注意：** 全局变量属于单个着色程序，如果多个着色程序有同名全局变量，需要找到每个全局变量并设置自己的值。 我们调用`gl.uniform???` 的时候只是设置了当前程序的全局变量，当前程序是传递给 `gl.useProgram` 的最后一个程序。

**全局变量有很多类型，对应的类型所对应的设置方法**。
```js
gl.uniform1f (floatUniformLoc, v);                 // float
gl.uniform1fv(floatUniformLoc, [v]);               // float 或 float array
gl.uniform2f (vec2UniformLoc,  v0, v1);            // vec2
gl.uniform2fv(vec2UniformLoc,  [v0, v1]);          // vec2 或 vec2 array
gl.uniform3f (vec3UniformLoc,  v0, v1, v2);        // vec3
gl.uniform3fv(vec3UniformLoc,  [v0, v1, v2]);      // vec3 或 vec3 array
gl.uniform4f (vec4UniformLoc,  v0, v1, v2, v4);    // vec4
gl.uniform4fv(vec4UniformLoc,  [v0, v1, v2, v4]);  // vec4 或 vec4 array
 
gl.uniformMatrix2fv(mat2UniformLoc, false, [  4x element array ])  // mat2 或 mat2 array
gl.uniformMatrix3fv(mat3UniformLoc, false, [  9x element array ])  // mat3 或 mat3 array
gl.uniformMatrix4fv(mat4UniformLoc, false, [ 16x element array ])  // mat4 或 mat4 array
 
gl.uniform1i (intUniformLoc,   v);                 // int
gl.uniform1iv(intUniformLoc, [v]);                 // int 或 int array
gl.uniform2i (ivec2UniformLoc, v0, v1);            // ivec2
gl.uniform2iv(ivec2UniformLoc, [v0, v1]);          // ivec2 或 ivec2 array
gl.uniform3i (ivec3UniformLoc, v0, v1, v2);        // ivec3
gl.uniform3iv(ivec3UniformLoc, [v0, v1, v2]);      // ivec3 or ivec3 array
gl.uniform4i (ivec4UniformLoc, v0, v1, v2, v4);    // ivec4
gl.uniform4iv(ivec4UniformLoc, [v0, v1, v2, v4]);  // ivec4 或 ivec4 array
 
gl.uniform1i (sampler2DUniformLoc,   v);           // sampler2D (textures)
gl.uniform1iv(sampler2DUniformLoc, [v]);           // sampler2D 或 sampler2D array
 
gl.uniform1i (samplerCubeUniformLoc,   v);         // samplerCube (textures)
gl.uniform1iv(samplerCubeUniformLoc, [v]);         // samplerCube 或 samplerCube array

```
一个**数组**可以一次设置所有的全局变量，例如
```js
// 着色器里
uniform vec2 u_someVec2[3];
// JavaScript 初始化时
const someVec2Loc = gl.getUniformLocation(someProgram, "u_someVec2");
// 渲染的时候
gl.uniform2fv(someVec2Loc, [1, 2, 3, 4, 5, 6]);  // 设置数组 u_someVec2
```
也可以使用下面的方法来设置数组里面的值。
```js
// JavaScript 初始化时
const someVec2Element0Loc = gl.getUniformLocation(someProgram, "u_someVec2[0]");
const someVec2Element1Loc = gl.getUniformLocation(someProgram, "u_someVec2[1]");
const someVec2Element2Loc = gl.getUniformLocation(someProgram, "u_someVec2[2]");
 
// 渲染的时候
gl.uniform2fv(someVec2Element0Loc, [1, 2]);  // set element 0
gl.uniform2fv(someVec2Element1Loc, [3, 4]);  // set element 1
gl.uniform2fv(someVec2Element2Loc, [5, 6]);  // set element 2
```
当我们使用**结构体**时
```js
struct SomeStruct {
  bool active;
  vec2 someVec2;
};
uniform SomeStruct u_someThing;
...
const someThingActiveLoc = gl.getUniformLocation(someProgram, "u_someThing.active");
const someThingSomeVec2Loc = gl.getUniformLocation(someProgram, "u_someThing.someVec2");
```
> `texture` 纹理

跟下面片元着色器中的一样。

##  2.片元着色器
一个片段着色器的工作是为当前光栅化的像素提供颜色值，通常是以下的形式。
```js
precision mediump float;
void main() {
   gl_FragColor = doMathToMakeAColor;
}
```
每个像素都将调用一次片段着色器，每次调用需要从你设置的特殊全局变量 `gl_FragColor`中获取颜色信息。
片段着色器所需的数据，可以通过以下三种方式获取。
+ `uniform` 全局变量 (对于单个绘制调用的每个像素保持相同的值)
+ `texture` 纹理 (数据来源于像素)
+ `varying` 可变量 (数据来源于差值过的顶点着色器)。

> `uniform` 全局变量（片元着色器中）

跟点元着色器中的全局变量一样。

> `texture` 纹理
在着色器中获取纹理信息，可以先创建一个 `sampler2D` 类型全局变量，然后用 `GLSL` 方法 `texture2D` 从纹理中提取信息。
```js
precision mediump float;
 
uniform sampler2D u_texture;
 
void main() {
   vec2 texcoord = vec2(0.5, 0.5);  // 获取纹理中心的值
   gl_FragColor = texture2D(u_texture, texcoord);
}
```
下面是使用纹理的一般步骤。
+ 创建纹理
```js
const tex = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, tex);
const level = 0;
const width = 2;
const height = 1;
const data = new Uint8Array([
   255, 0, 0, 255,   // 一个红色的像素
   0, 255, 0, 255,   // 一个绿色的像素
]);
gl.texImage2D(gl.TEXTURE_2D, level, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
```
+ 找到全局变量的地址
```js
const someSamplerLoc = gl.getUniformLocation(someProgram, "u_texture");
```
+ 绑定并激活纹理
```js
const unit = 5;  // 挑选一个纹理单元
gl.activeTexture(gl.TEXTURE0 + unit);
gl.bindTexture(gl.TEXTURE_2D, tex);
```
+ 将数据传递给着色器
```js
gl.uniform1i(someSamplerLoc, unit);
```
> `varying` 可变量

可变量是一种顶点着色器给片段着色器传值的方式。为了使用可变量，要在两个着色器中定义同名的可变量。 
```js
// 点元着色器
attribute vec4 a_position;
uniform vec4 u_offset;
varying vec4 v_positionWithOffset;
void main() {
  gl_Position = a_position + u_offset;
  v_positionWithOffset = a_position + u_offset;
}
// 片元着色器
precision mediump float;
varying vec4 v_positionWithOffset;
void main() {
  // 从裁剪空间 (-1 <-> +1) 转换到颜色空间 (0 -> 1).
  vec4 color = v_positionWithOffset * 0.5 + 0.5;
  gl_FragColor = color;
}
```

## 3. 着色器的工作原理
`WebGL`在`GPU`上的工作基本上分为两部分，第一部分是将顶点（或数据流）转换到裁剪空间坐标， 第二部分是基于第一部分的结果绘制像素点。
#### 3.1 点元着色器的工作原理
顶点着色器代码
```js
attribute vec3 a_position;
uniform vec4 u_matrix;
void main() {
  gl_Position =u_matrix * a_position + u_offset;
}
```
`WebGL` 渲染代码
```js
const primitiveType = gl.TRIANGLES;
const offset = 0;
const count = 9;
gl.drawArrays(primitiveType, offset, count);
```
这里的9表示 **处理9个顶点**，所以将会有9个顶点被转换。下面是处理顶点的示意图。(图片来自官网)
<img src='../../images/webgl/vertex-shader-anim.gif'>

着色器中的代码在绘制每个顶点的时候都会被调用一次。顶点在顶点着色器中被处理后会被保存到 `gl_Position`变量中， 这个变量就是该顶点转换到裁剪空间中的坐标值，`GPU` 接收该值并将其保存起来。
#### 3.2 片元着色器的工作原理

在片段着色器中有一个变量 `gl_FragColor` 用来设置顶点的颜色，一般情况下我们都只会给每个顶点设置颜色，而其它非顶点位置的颜色是怎么来的呢？

这是因为顶点传递到片元着色器后，会转换成像素，其它非顶点像素的颜色都是通过顶点颜色差值生成的。颜色差值的主要原理可以看下下面的图片。[差值的动态过程](https://webglfundamentals.org/webgl/lessons/zh_cn/webgl-how-it-works.html)

<img src='../../images/webgl/差值的动态过程.png'>

如果我们像实现颜色的自定义，就需要使用变量 `varing`,来将在点段着色器中的 颜色值传递给片元着色器中。
注意：颜色必须从点元着色器中通过变量 `attribute`  去接收，最后通过 `varying` 传递给 片元着色器。
```js
<script  id="vertex-shader-2d" type="x-shader/x-vertex">
attribute vec2 a_position;
attribute vec4 a_color;

uniform mat3 u_matrix;

varying vec4 v_color;

void main() {
  // Multiply the position by the matrix.
  gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);

  // Copy the color from the attribute to the varying.
  v_color = a_color;
}
</script>
<script  id="fragment-shader-2d" type="x-shader/x-fragment">
precision mediump float;

varying vec4 v_color;

void main() {
  gl_FragColor = v_color;
}
</script>
```
## 4.着色器中的细节梳理
#### 4.1 关于buffer和attribute的代码是干什么的？
**缓冲操作**是在 `GPU` 上**获取顶点和其他顶点数据**的一种方式。一般会通过下面的三部曲来完成缓冲数据的初始化操作，这些操作一般在初始化完成。
> 创建一个缓冲
```js
const colorBuffer = gl.createBuffer()
```
> 设置缓冲为当前使用缓冲
```js
// 将gl.ARRAY_BUFFER与colorBuffer版定
gl.bindBuffer(gl.ARRAY_BUFFER,colorBuffer) 
```
> 将数据拷贝到缓冲
```js
gl.bufferData(
     gl.ARRAY_BUFFER,
      new Float32Array(
        [ Math.random(), Math.random(), Math.random(), 1,
          Math.random(), Math.random(), Math.random(), 1,
          Math.random(), Math.random(), Math.random(), 1,
          Math.random(), Math.random(), Math.random(), 1,
          Math.random(), Math.random(), Math.random(), 1,
          Math.random(), Math.random(), Math.random(), 1]),
      gl.STATIC_DRAW)
```
一旦数据存到缓冲中，还需要告诉 `WebGL` 怎么**从缓冲中提取数据传给顶点着色器的属性**。这一步一般也是在初始化部分完成。
> 询问顶点数据应该放在哪里，是数据通过属性传到GPU的一个桥梁，获取属性的地址
```js
// 询问顶点数据应该放在哪里
const positionLocation = gl.getAttribLocation(program, "a_position");
const colorLocation = gl.getAttribLocation(program, "a_color");
```
一旦知道了属性的地址，在绘制前还需要发出三个命令。
> 打开`colorLocation`的缓冲通道
```js
// Turn on the attribute 打开location的缓冲通道
gl.enableVertexAttribArray(colorLocation);
```
> 绑定缓冲区
```js
// 告诉我们WebGL我们想从缓冲中提供数据
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
```
> 告诉颜色属性如何从   `colorBuffer`中提取数据`(ARRAY_BUFFER)`
```js
const size = 4;                 // 每次迭代使用四个单位数据
const type = gl.UNSIGNED_BYTE;  // 数据类型是8位的 UNSIGNED_BYTE 类型。
const normalize = true;         // 标准化数据
const stride = 0;               // 0 = 移动距离 * 单位距离长度sizeof(type) 
                                // 每次迭代跳多少距离到下一个数据
const offset = 0;               // 从缓冲的起始处开始
gl.vertexAttribPointer(
    colorLocation, size, type, normalize, stride, offset)
```

#### 4.2 vertexAttribPointer 中的 normalizeFlag 参数是什么意思？
标准化标记`（normalizeFlag）`**适用于所有非浮点型数据**。如果传递 `false` 就解读原数据类型。 `BYTE` 类型的范围是从 `-128` 到 `127`，`UNSIGNED_BYTE` 类型的范围是从 0 到 255， `SHORT` 类型的范围是从 `-32768` 到 `32767`，等等...

如果标准化标记设为 `true`，`BYTE` 数据的值(-128 to 127)将会转换到 -1.0 到 +1.0 之间， `UNSIGNED_BYTE` (0 to 255) 变为 0.0 到 +1.0 之间，`SHORT` 也是转换到 -1.0 到 +1.0 之间， 但比 BYTE 精确度高。
最常用的是标准化颜色数据。大多数情况颜色值范围为 0.0 到 +1.0。 使用4个浮点型数据存储红，绿，蓝和阿尔法通道数据时，每个顶点的颜色将会占用16字节空间， 如果你有复杂的几何体将会占用很多内存。代替的做法是将颜色数据转换为四个 UNSIGNED_BYTE ， 其中 0 表示 0.0，255 表示 1.0。现在每个顶点只需要四个字节存储颜色值，省了 75% 空间。
```js
// 告诉颜色属性如何从colorBuffer中提取数据 (ARRAY_BUFFER)
  const size = 4;                 // 每次迭代使用四个单位数据
  const type = gl.UNSIGNED_BYTE;  // 数据类型是8位的 UNSIGNED_BYTE 类型。
  const normalize = true;         // 标准化数据
  const stride = 0;               // 0 = 移动距离 * 单位距离长度sizeof(type) 
                                // 每次迭代跳多少距离到下一个数据
  const offset = 0;               // 从缓冲的起始处开始
  gl.vertexAttribPointer(
      colorLocation, size, type, normalize, stride, offset);
```
```js
// 给矩形的两个三角形
// 设置颜色值并发到缓冲
function setColors(gl) {
  // 设置两个随机颜色
  const r1 = Math.random() * 256; // 0 到 255.99999 之间
  const b1 = Math.random() * 256; // 这些数据
  const g1 = Math.random() * 256; // 在存入缓冲时
  const r2 = Math.random() * 256; // 将被截取成
  const b2 = Math.random() * 256; // Uint8Array 类型
  const g2 = Math.random() * 256;
 
  gl.bufferData(
      gl.ARRAY_BUFFER,
      new Uint8Array(   // Uint8Array
        [ r1, b1, g1, 255,
          r1, b1, g1, 255,
          r1, b1, g1, 255,
          r2, b2, g2, 255,
          r2, b2, g2, 255,
          r2, b2, g2, 255]),
      gl.STATIC_DRAW);
}
```
[WebGL的执行流程图](https://webglfundamentals.org/webgl/lessons/resources/webgl-state-diagram.html#no-help)


<Valine></Valine>
