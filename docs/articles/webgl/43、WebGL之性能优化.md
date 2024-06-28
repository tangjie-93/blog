---
title: 43、WebGL之性能优化
date: '2024-06-28'
lastmodifydate: '2024-06-28'
type: 技术
tags: WebGL
note: WebGL之性能优化
---
正常情况下，每绘制一个模型都要调用一次 `gl.uniform4v`，`gl.uniformMatrix4fv` 还有`gl.drawArrays`。加入需要绘制`n`个相同的模型，那么就需要调用`n`次 `gl.uniform4v`，`gl.uniformMatrix4fv` 还有`gl.drawArrays`。如果我们的着色器很复杂的化，那么调用的`WebGL`方法就会很多。

**实例化** 就是一个帮助我们减少函数调用的好路子。 它的工作原理是让你告诉 `WebGL` 你想绘制多少次相同的物体（实例的数量）。

对于每个 `attribute`，你可以让它每次调用顶点着色器时迭代到缓冲区的 下一个值（默认行为），或者是每绘制 `N`（`N`通常为`1`）个实例时才迭代到 下一个值。


## 1.WebGL性能优化 - 实例化绘制
我们不妨使用 `attribute`来提供`matrix`和`color`的值以取代`uniform` 。 我们会在缓冲区里为每个实例提供矩阵和颜色，设置好从缓冲区里读取数据的 `attribute`，然后告诉`WebGL`只有在绘制下一个实例的时候才迭代到下一个值。
#### 1.顶点着色器
```js
<script id="vertex-shader-3d" type="x-shader/x-vertex">
attribute vec4 a_position;
attribute vec4 color;
attribute mat4 matrix;
uniform mat4 projection;
uniform mat4 view;

varying vec4 v_color;

void main() {
    // Multiply the position by the matrix.
    gl_Position = projection * view * matrix * a_position;

    // Pass the vertex color to the fragment shader.
    v_color = color;
}
</script>
```
#### 2.片元着色器
因为 `attribute` 只能在顶点着色器中声明所以我们需要用 `varying` 把颜色传递到片元着色器。
```js
 <script id="fragment-shader-3d" type="x-shader/x-fragment">
    precision mediump float;
    // Passed in from the vertex shader.
    varying vec4 v_color;
    void main() {
        gl_FragColor = v_color;
    }
</script>
```
#### 3.启用实例化
```js
const canvas = document.querySelector('#canvas');
const gl = canvas.getContext('webgl');
if (!gl) {
  return;
}
 
const ext = gl.getExtension('ANGLE_instanced_arrays');
if (!ext) {
  return alert('need ANGLE_instanced_arrays');
}
```
#### 4. 创建缓冲区来存储提供给`attribute`的矩阵和颜色
`new Float32Array(matrixData.buffer,byteOffsetToMatrix,numFloatsForView)`参数的意义:
  + `matrixData.buffer`:  表示总字节大小
  + `byteOffsetToMatrix`: 表示字节偏移量
  + `numFloatsForView`：指定创建的矩阵视图包含的浮点数数量
```js
// 为每一个实例设置矩阵
const numInstances = 5;
// make a typed array with one view per matrix
const matrixData = new Float32Array(numInstances * 16);
const matrices = [];
for (let i = 0; i < numInstances; ++i) {
  const byteOffsetToMatrix = i * 16 * 4;
  const numFloatsForView = 16;
  // 初始化矩阵
  matrices.push(new Float32Array(matrixData.buffer,byteOffsetToMatrix,numFloatsForView));
}
const matrixBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, matrixBuffer);
// 只为缓冲区申请特定大小的空间
gl.bufferData(gl.ARRAY_BUFFER, matrixData.byteLength, gl.DYNAMIC_DRAW);

// 为每一个实例设置颜色
const colors =  new Float32Array([
                  1, 0, 0, 1,  // red
                  0, 1, 0, 1,  // green
                  0, 0, 1, 1,  // blue
                  1, 0, 1, 1,  // magenta
                  0, 1, 1, 1,  // cyan
                ]);
const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER,colors, gl.STATIC_DRAW);
```
**注意**: `gl.bufferData`最后一个参数是 `gl.DYNAMIC_DRAW`。这是一个给WebGL的指示， 告诉它我们要经常刷新这里的数据。

####  5.绘制
+ 更新所有的矩阵
```js
matrices.forEach((mat, ndx) => {
    m4.translation(-0.5 + ndx * 0.25, 0, 0, mat);
    m4.zRotate(mat, time * (0.1 + 0.1 * ndx), mat);
});
```
+ 上传新的矩阵数据
`gl.bufferSubData(gl.ARRAY_BUFFER, 0, matrixData)` 用于更新已存在的缓冲区对象中的子数据，用于将新数据（或部分数据）上传到已绑定的缓冲区对象中。因为前面调用了`  gl.bufferData(gl.ARRAY_BUFFER, matrixData.byteLength, gl.DYNAMIC_DRAW);`
```js
gl.bindBuffer(gl.ARRAY_BUFFER, matrixBuffer);
gl.bufferSubData(gl.ARRAY_BUFFER, 0, matrixData);
```
+ 为矩阵设置`attribute`
```js
const bytesPerMatrix = 4 * 16;
for (let i = 0; i < 4; ++i) {
  const loc = matrixLoc + i;
  gl.enableVertexAttribArray(loc);
  // 注意stride和offset
  const offset = i * 16;  // 一行有4个单精度浮点数，1个就占用4字节
  gl.vertexAttribPointer(
      loc,              // location
      4,                // size (num values to pull from buffer per iteration)
      gl.FLOAT,         // type of data in buffer
      false,            // normalize
      bytesPerMatrix,   // stride, num bytes to advance to get to next set of values
      offset,           // offset in buffer
  );
  // 这行说的是attribute只对下一个实例才进行迭代
  ext.vertexAttribDivisorANGLE(loc, 1);
}
```
+ 为颜色设置`attribute`
```js
// 为颜色设置attribute
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.enableVertexAttribArray(colorLoc);
gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
// this line says this attribute only changes for each 1 instance
ext.vertexAttribDivisorANGLE(colorLoc, 1);
```
+ 绘制所有的模型
```js
ext.drawArraysInstancedANGLE(
  gl.TRIANGLES,
  0,             // offset
  numVertices,   // 每个实例的顶点数
  numInstances,  // 实例的数量
);
```

`demo`地址 [非实例化绘制](https://github.com/tangjie-93/WebGL/blob/main/fundmantalExamples/%E6%80%A7%E8%83%BD%E4%BC%98%E5%8C%96/%E9%9D%9E%E5%AE%9E%E4%BE%8B%E5%8C%96%E7%BB%98%E5%88%B6.html)
`demo`地址 [实例化绘制](https://github.com/tangjie-93/WebGL/blob/main/fundmantalExamples/%E6%80%A7%E8%83%BD%E4%BC%98%E5%8C%96/%E5%AE%9E%E4%BE%8B%E5%8C%96%E7%BB%98%E5%88%B6.html)

## 2.WebGL - 顶点索引

在 `WebGL` 中有两个基本的绘制函数。 `gl.drawArrays` 和 `gl.drawElements`。 这个网站的文章中，大部分是调用 `gl.drawArrays` 的。

`gl.drawElements` 需要一个填充了顶点索引的缓存，然后以此来绘制。

使用顶点索引时，有几个需要注意的地方。
+ 缓冲区的对象不一样了

使用顶点缓冲时的缓冲类型是`ELEMENT_ARRAY_BUFFER`，之前是  `gl.ARRAY_BUFFER`。

+ 创建顶点缓冲
```js
// create the buffer
const indexBuffer = gl.createBuffer();
// make this buffer the current 'ELEMENT_ARRAY_BUFFER'
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

// Fill the current element array buffer with data
const indices = [
    0, 1, 2,   // first triangle
    2, 1, 3,   // second triangle
];
gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.STATIC_DRAW
);
```
+ 绘制对象的方法不一样了
之前的方法
```js
const primitiveType = gl.TRIANGLES;
const offset = 0;
const count = 6;//num vertices per instance
gl.drawArrays(primitiveType,offset,count);
```
使用顶点索引
```js
const primitiveType = gl.TRIANGLES;
const offset = 0;
const count = 6;
const indexType = gl.UNSIGNED_SHORT;
gl.drawElements(primitiveType, count, indexType, offset);
```


`demo`地址 [顶点索引](https://github.com/tangjie-93/WebGL/blob/main/fundmantalExamples/%E6%80%A7%E8%83%BD%E4%BC%98%E5%8C%96/%E9%A1%B6%E7%82%B9%E7%B4%A2%E5%BC%95.html)

**参考文档**

[WebGL 顶点索引](https://webglfundamentals.org/webgl/lessons/zh_cn/webgl-indexed-vertices.html)<br>
[WebGL性能优化 - 实例化绘制](https://webglfundamentals.org/webgl/lessons/zh_cn/webgl-instanced-drawing.html)<br>

<Valine></Valine>