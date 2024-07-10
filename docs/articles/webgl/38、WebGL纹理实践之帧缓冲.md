---
title: 38、WebGL之帧缓冲
date: '2024-06-24'
lastmodifydate: '2024-06-24'
type: 技术
tags: WebGL
note: 指的是使用 WebGL 渲染三维图形，然后将渲染结果作为纹理贴到另一个三维物体上去。实际上就是将渲染结果作为纹理使用。
---

在 `WebGL` 中，帧缓冲（`Frame Buffer`）是一种用于离屏渲染（`off-screen rendering`）的技术。通过使用帧缓冲，你可以渲染场景到纹理或特定的缓冲，而不是直接渲染到屏幕。这对于实现一些高级效果（如后期处理、阴影映射和反射）非常有用。

## 1.帧缓冲的基本概念
+ **帧缓冲对象（`Framebuffer Object, FBO`）**：
一个容器，用于存储多个缓冲（颜色缓冲、深度缓冲和模板缓冲）。
+ **渲染缓冲对象（`Renderbuffer Object, RBO`）**：一个缓冲对象，通常用于存储深度和模板信息。它不能像纹理那样直接读取数据，但通常在需要高效存储和访问的情况下使用，例如多重采样抗锯齿（`MSAA`）
+ **纹理（`Texture`）**：可以将纹理附加到帧缓冲对象上，并将渲染输出直接写入纹理中。帧缓冲的渲染目标，可以将渲染结果保存为纹理，用于后续的渲染处理,例如模糊、后期色彩调整等，因为你可以在渲染完场景后使用该纹理进行进一步处理。

**总结**:使用纹理和渲染缓冲对象各有优缺点，具体选择取决于你的应用需求。如果你需要后续处理渲染结果或对渲染结果进行采样，使用纹理会更合适。如果你需要更高效的存储和访问，且不需要直接读取渲染结果，可以考虑使用渲染缓冲对象。

**注意**：在`WebGL`中，帧缓冲（`Framebuffer`）不一定需要使用渲染缓冲对象（`Renderbuffer Object`）。你可以选择使用纹理（`Texture`）作为帧缓冲的附件来进行渲染

默认情况下，`WebGL`在颜色缓冲中进行绘图，在开启隐藏面消除功能时，还会使用到深度缓冲。绘制的结果图像是存储在颜色缓冲中的。

**祯缓冲对象**可以用来代替颜色缓冲或者深度缓冲。绘制在祯缓冲的对象并不会直接显示在`canvas`上，我们可以先对祯缓冲中的内容进行一些处理再显示，或者是直接使用其中的内容作为纹理图像。

+ **离屏绘制**: 在祯缓冲中进行绘制的过程称之为**离屏绘制**。
+ **关联对象**: 
模型的绘制工作并不是直接发生在祯缓冲中的，而是发生在祯缓冲所关联的对象上。祯缓冲中有三种关联对象：**颜色关联对象**，**深度关联对象**，**模版关联对象**，分别用来替代颜色缓冲, 深度缓冲和模版缓冲。

+ **关联对象类型**: 
每个关联对象有可以是两种类型的；**纹理对象**和**渲染缓冲对象**。纹理对象存储了纹理图像，一般是作为颜色关联对象关联到祯缓冲对象，随后`WebGL`就可以在纹理对象中绘图了。渲染缓冲对象表示一种更加通用的绘图区域，可以向其中写入多种类型的数据。

## 2.创建和使用帧缓冲
下面是一个创建和使用帧缓冲的基本步骤：
#### 1.创建祯缓冲对象
帧缓冲只是一个附件集，附件是纹理或者 `renderbuffers`， 我们之前讲过纹理，`Renderbuffers` 和纹理很像但是支持纹理不支持的格式和可选项，同时， 不能像纹理那样直接将 `renderbuffer` 提供给着色器。
```js
const framebuffer = gl.createFramebuffer();
//绑定到 FRAMEBUFFER 绑定点
//绑定帧缓冲后，每次调用 gl.clear, gl.drawArrays, 或 gl.drawElements WebGL都会渲染到纹理上而不是画布上。
gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
```
#### 2.创建纹理并将其附加到帧缓冲对象
将祯缓冲的颜色关联对象指定为一个纹理对象
```js
const texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture);
//注意 data 是 null，我们不需要提供数据，只需要让WebGL分配一个纹理。
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
// 设置筛选器
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
// 附加纹理为第一个颜色附件
// 将祯缓冲的颜色关联对象指定为一个纹理对象
gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
```
**注意**：`data` 是 `null`，我们不需要提供数据，只需要让 `WebGL` 分配一个纹理。
#### 3.创建渲染缓冲对象并将其附加到帧缓冲对象（用于深度和模板缓冲）
将祯缓冲的深度关联对象指定为一个渲染缓冲对象
```js
const renderbuffer = gl.createRenderbuffer();
gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
//祯缓冲的深度关联对象指定为一个渲染缓冲对象
gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);
```
#### 4.检查帧缓冲对象是否正确配置
```js
// Check if FBO is configured correctly
const e = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
if (gl.FRAMEBUFFER_COMPLETE !== e) {
  console.log('Frame buffer object is incomplete: ' + e.toString());
  return error();
}
...
// Unbind the buffer object
gl.bindFramebuffer(gl.FRAMEBUFFER, null);
gl.bindTexture(gl.TEXTURE_2D, null);
gl.bindRenderbuffer(gl.RENDERBUFFER, null);
```
#### 5.解除绑定帧缓冲
```js
gl.bindFramebuffer(gl.FRAMEBUFFER, null);
```
## 3.使用帧缓冲进行渲染
当你需要将渲染结果输出到帧缓冲时
#### 1.绑定帧缓冲
```js
gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
gl.viewport(0, 0, width, height);
```
#### 2.执行渲染操作
```js
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
// 渲染场景的代码
// ...
```
#### 3.解除绑定帧缓冲以恢复默认帧缓冲（屏幕）
```js
gl.bindFramebuffer(gl.FRAMEBUFFER, null);
gl.viewport(0, 0, canvas.width, canvas.height);
```
#### 4.使用纹理进行后续处理或渲染到屏幕
```js
gl.bindTexture(gl.TEXTURE_2D, texture);
// 使用该纹理进行后续渲染
// ...
```
使用帧缓冲渲染的完整代码可以参考下面的代码
```js
function draw(gl, canvas, fbo, plane, cube, angle, texture, viewProjMatrix, viewProjMatrixFBO) {
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);              // Change the drawing destination to FBO
  gl.viewport(0, 0, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT); // Set a viewport for FBO

  gl.clearColor(0.2, 0.2, 0.4, 1.0); // Set clear color (the color is slightly changed)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);  // Clear FBO

  drawTexturedCube(gl, gl.program, cube, angle, texture, viewProjMatrixFBO);   // Draw the cube
    // 切换绘制目标为颜色缓冲
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);        // Change the drawing destination to color buffer
  gl.viewport(0, 0, canvas.width, canvas.height);  // Set the size of viewport back to that of <canvas>

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // Clear the color buffer

  drawTexturedPlane(gl, gl.program, plane, angle, fbo.texture, viewProjMatrix);  // Draw the plane
}
```

## 4.如何实现渲染到纹理

如果我们想把`WebGL`中渲染出的图像作为纹理使用，那么就需要将纹理对象作为颜色关联对象关联到祯缓冲对象上，然后在祯缓冲进行绘制，此时颜色关联对像就代替了颜色缓冲。

如果我们需要进行隐藏面消除，我们就需要再创建一个渲染缓冲对象来作为祯缓冲的深度关联对象，来代替深度缓冲。
+ 创建数据纹理，用于绘制缓冲区中的立方体
```js
  // Create a texture.
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  {
    // fill texture with 3x2 pixels
    const level = 0;
    const internalFormat = gl.LUMINANCE;
    const width = 3;
    const height = 2;
    const border = 0;
    const format = gl.LUMINANCE;
    const type = gl.UNSIGNED_BYTE;
    const data = new Uint8Array([
      128,  64, 128,
        0, 192,   0,
    ]);
    const alignment = 1;
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, alignment);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border,
                  format, type, data);

    // set the filtering so we don't need mips and it's not filtered
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

```
+ 绘制场景
将数据纹理（`texture`）绘制到帧缓冲中，随后将帧缓冲中的内容(`targetTexture`)绘制到画布上。
```js
// 绘制场景
function drawScene(time) {
 
  ...
 
  {
    // 通过绑定帧缓冲绘制到纹理
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
 
    // 使用 3×2 的纹理渲染立方体
    gl.bindTexture(gl.TEXTURE_2D, texture);
 
    // 告诉WebGL如何从裁剪空间映射到像素空间
    gl.viewport(0, 0, targetTextureWidth, targetTextureHeight);
 
    // 清空画布和深度缓冲
    gl.clearColor(0, 0, 1, 1);   // clear to blue
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
 
    const aspect = targetTextureWidth / targetTextureHeight;
    drawCube(aspect)
  }
 
  {
    // 渲染到画布
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
 
    // 立方体使用刚才渲染的纹理
    gl.bindTexture(gl.TEXTURE_2D, targetTexture);
 
    // 告诉WebGL如何从裁剪空间映射到像素空间
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
 
    // 清空画布和深度缓冲
    gl.clearColor(1, 1, 1, 1);   // clear to white
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
 
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    drawCube(aspect)
  }
 
  requestAnimationFrame(drawScene);
}
```
渲染效果如下所示

<img width=200 src='../../images/webgl/渲染到纹理.png'>

`demo`地址 [渲染到纹理-面和立方体](https://github.com/tangjie-93/WebGL/blob/main/%E8%B7%9F%E7%9D%80%E5%AE%98%E7%BD%91%E5%AD%A6WebGL%2BWebGL%E7%BC%96%E7%A8%8B%E6%8C%87%E5%8D%97/%E9%AB%98%E7%BA%A7%E6%8A%80%E6%9C%AF/%E6%B8%B2%E6%9F%93%E5%88%B0%E7%BA%B9%E7%90%86/%E9%9D%A2%E5%92%8C%E7%AB%8B%E6%96%B9%E4%BD%93.html)
[渲染到纹理-立方体和立方体](https://github.com/tangjie-93/WebGL/blob/main/%E8%B7%9F%E7%9D%80%E5%AE%98%E7%BD%91%E5%AD%A6WebGL%2BWebGL%E7%BC%96%E7%A8%8B%E6%8C%87%E5%8D%97/%E9%AB%98%E7%BA%A7%E6%8A%80%E6%9C%AF/%E6%B8%B2%E6%9F%93%E5%88%B0%E7%BA%B9%E7%90%86/%E7%AB%8B%E6%96%B9%E4%BD%93%E5%92%8C%E7%AB%8B%E6%96%B9%E4%BD%93.html)

## 4.问题
#### 4.1 上面的代码为什么要执行两遍gl.bindTexture(gl.TEXTURE_2D, null)
在 `WebGL` 编程中，`gl.bindTexture(gl.TEXTURE_2D, null);` 的作用是解除当前绑定的2D纹理。这么做有几个原因：

+ **防止意外修改**： 在很多情况下，你可能会有多个纹理对象，并且不希望对一个纹理的操作影响到其他纹理。因此，在操作一个纹理之后，解除绑定可以确保后续操作不会意外地修改这个纹理。

+ **明确渲染状态**： 在渲染管线中，保持明确的状态管理是一个好习惯。解除绑定可以让代码更具可读性，明确指出此时不再需要这个纹理。

+ **调试便利**： 当你在调试 `WebGL` 程序时，明确解除绑定可以帮助你更容易地追踪问题所在。如果某个纹理绑定出现问题，明确的解除绑定能让问题更容易被发现和解决。

**第一次 `gl.bindTexture(gl.TEXTURE_2D, null);`出现在你设置纹理之后。**
```js
image.onload = function() {
  // Write image data to texture object
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);  // Flip the image Y coordinate
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  // Pass the texure unit 0 to u_Sampler
  gl.uniform1i(u_Sampler, 0);

  gl.bindTexture(gl.TEXTURE_2D, null); // Unbind the texture object
};
```
在这里解除绑定是为了确保在接下来的帧缓冲设置过程中，不会对这个纹理进行任何意外的修改。解除绑定后，可以放心地进行帧缓冲对象的其他设置。
**第二次 `gl.bindTexture(gl.TEXTURE_2D, null);`出现在你使用纹理之后。**
```js
// 使用帧缓冲纹理
gl.bindTexture(gl.TEXTURE_2D, texture);
...
// Check if FBO is configured correctly
var e = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
if (gl.FRAMEBUFFER_COMPLETE !== e) {
  console.log('Frame buffer object is incomplete: ' + e.toString());
  return error();
}

// Unbind the buffer object
gl.bindFramebuffer(gl.FRAMEBUFFER, null);
gl.bindTexture(gl.TEXTURE_2D, null);
gl.bindRenderbuffer(gl.RENDERBUFFER, null);
```
在这里解除绑定是为了确保在后续的渲染过程中，不会对这个纹理进行任何意外的修改。此时，你已经完成了对这个纹理的所有必要操作，所以可以解除绑定，确保状态的清晰。
以下是简化的代码段，重点展示两次解除绑定的位置：
```js
// 创建并配置纹理
const texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
gl.bindTexture(gl.TEXTURE_2D, null); // 第一次解除绑定

// ... 其他帧缓冲对象配置 ...

// 使用帧缓冲纹理
gl.bindTexture(gl.TEXTURE_2D, texture);
...
// 这里使用纹理进行后续渲染操作
gl.bindTexture(gl.TEXTURE_2D, null); // 第二次解除绑定
...

```
#### 4.2 上面的代码为什么要执行两遍gl.bindFramebuffer(gl.FRAMEBUFFER, null)
在 `WebGL`编程中，`gl.bindFramebuffer(gl.FRAMEBUFFER, null)`;的作用是解除当前绑定的帧缓冲对象 `(Framebuffer Object, FBO)`，恢复默认的帧缓冲（即屏幕）。这样做有几个原因：

+ **防止意外修改**：当你绑定一个帧缓冲对象后，所有的绘制操作都会作用于该帧缓冲对象。解除绑定可以确保后续的绘制操作不会意外地影响到这个帧缓冲对象。

+ **明确渲染状态**：在渲染管线中，保持明确的状态管理是一个好习惯。解除绑定可以让代码更具可读性，明确指出此时不再需要这个帧缓冲对象。

+ **恢复默认帧缓冲**：在使用自定义帧缓冲对象进行渲染之后，通常需要将绘制目标切换回默认帧缓冲对象（即屏幕），以进行最终的绘制。
让我们具体看一下在代码中的两次`gl.bindFramebuffer(gl.FRAMEBUFFER, null)`;：

**第一次 gl.bindFramebuffer(gl.FRAMEBUFFER, null);**
这个解除绑定出现在你设置并检查帧缓冲对象之后：
```js
// 检查帧缓冲对象是否完整
if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
    console.error("Framebuffer is not complete");
}
gl.bindFramebuffer(gl.FRAMEBUFFER, null); // 第一次解除绑定
```
在这里解除绑定是为了确保在接下来的操作中，所有的绘制操作都不会作用于这个帧缓冲对象。你已经完成了帧缓冲对象的设置和检查，可以解除绑定，将绘制目标切换回默认帧缓冲。
**第二次 gl.bindFramebuffer(gl.FRAMEBUFFER, null);**
第二个解除绑定出现在你使用帧缓冲对象进行渲染之后：
```js
// 渲染到帧缓冲对象
gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
gl.viewport(0, 0, canvas.width, canvas.height);

// 这里执行实际的渲染操作
gl.bindFramebuffer(gl.FRAMEBUFFER, null); // 第二次解除绑定
```
在这里解除绑定是为了确保在完成对帧缓冲对象的渲染之后，绘制目标切换回默认帧缓冲（即屏幕）。这样可以进行后续的渲染操作，如将帧缓冲对象中的内容绘制到屏幕上。

以下是简化的代码段，重点展示两次解除绑定的位置：
```js
// 创建帧缓冲对象
const framebuffer = gl.createFramebuffer();
gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

// ... 帧缓冲对象配置 ...

// 检查帧缓冲对象是否完整
if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
    console.error("Framebuffer is not complete");
}
gl.bindFramebuffer(gl.FRAMEBUFFER, null); // 第一次解除绑定
...
// 渲染到帧缓冲对象
gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
gl.viewport(0, 0, canvas.width, canvas.height);

// 这里执行实际的渲染操作

gl.bindFramebuffer(gl.FRAMEBUFFER, null); // 第二次解除绑定

```


**参考文档**<br>
[WebGL 帧缓冲](https://webglfundamentals.org/webgl/lessons/zh_cn/webgl-framebuffers.html)
[WebGL 渲染到纹理](https://webglfundamentals.org/webgl/lessons/zh_cn/webgl-render-to-texture.html)
<Valine></Valine>