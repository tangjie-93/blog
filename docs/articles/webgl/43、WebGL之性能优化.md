---
title: 43、WebGL之性能优化
date: '2024-06-28'
lastmodifydate: '2024-06-28'
type: 技术
tags: WebGL
note: WebGL之性能优化
---
正常情况下，每绘制一个模型都要调用一次 `gl.uniform4v`，`gl.uniformMatrix4fv` 还有`gl.drawArrays`。加入需要绘制`n`个相同的模型，那么就需要调用`n`次 `gl.uniform4v`，`gl.uniformMatrix4fv` 还有`gl.drawArrays`。如果我们的着色器很复杂的化，那么调用的`WebGL`方法就会很多。

**实例化** 就是一个帮助我们减少函数调用的好路子。 它的工作原理是让你告诉WebGL你想绘制多少次相同的物体（实例的数量）。

对于每个 `attribute`，你可以让它每次调用顶点着色器时迭代到缓冲区的 下一个值（默认行为），或者是每绘制 `N`（`N`通常为`1`）个实例时才迭代到 下一个值。


## 1.WebGL性能优化 - 实例化绘制
我们不妨使用 `attribute`来提供`matrix`和`color`的值以取代`uniform` 。 我们会在缓冲区里为每个实例提供矩阵和颜色，设置好从缓冲区里读取数据的 `attribute`，然后告诉`WebGL`只有在绘制下一个实例的时候才迭代到下一个值。
+ 顶点着色器
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
+ 片元着色器
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
+ 启用实例化
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

`demo`地址 [实例化绘制]()

## 2.WebGL - 顶点索引

`demo`地址 [顶点索引](https://github.com/tangjie-93/WebGL/blob/main/fundmantalExamples/%E6%80%A7%E8%83%BD%E4%BC%98%E5%8C%96/%E9%A1%B6%E7%82%B9%E7%B4%A2%E5%BC%95.html)

**参考文档**

[WebGL 顶点索引](https://webglfundamentals.org/webgl/lessons/zh_cn/webgl-indexed-vertices.html)<br>
[WebGL性能优化 - 实例化绘制](https://webglfundamentals.org/webgl/lessons/zh_cn/webgl-instanced-drawing.html)<br>

<Valine></Valine>