---
title: 35.WebGL之选中物体
date: '2024-06-20'
lastmodifydate: '2024-06-28'
type: 技术
tags: WebGL
note: 关于找到用户点击的物体，一个最简单的方法是：为每一个对象赋予一个数字id，我们可以在关闭光照和纹理的情况下将数字id当作颜色绘制所有对象。 随后我们将得到一帧图片，上面绘制了所有物体的剪影，而深度缓冲会自动帮我们排序。 我们可以读取鼠标坐标下的像素颜色为数字id，就能得到这个位置上渲染的对应物体。
---

## 1.选中物体
通过在顶点着色器中定义一个`uniform bool u_Clicked`变量,用于判断鼠标点击的位置是否在`canvas`的区域内，通过判断`u_Clicked`的值来给模型设置相应的选中颜色。
+ **顶点着色器中的代码**如下所示
```js
attribute vec4 a_Position;
attribute vec4 a_Color;
uniform mat4 u_MvpMatrix;
uniform bool u_Clicked; // Mouse is pressed
varying vec4 v_Color;
void main() {
    gl_Position = u_MvpMatrix * a_Position;
    if (u_Clicked) { //  Draw in red if mouse is pressed
        v_Color = vec4(1.0, 0.0, 0.0, 1.0);
    } else {
        v_Color = a_Color;
    }
}
```
+ **`js`代码主要是通过 点击事件的位置 来判断鼠标落点是否在`canvas`中来设置`u_Clicked`的值。**
```js
canvas.onmousedown = function(ev) {   
    // Mouse is pressed
    // 默认offset为0
    const x = ev.clientX, y = ev.clientY;
    const rect = ev.target.getBoundingClientRect();
    // 判断是否canvas内
    if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
        // If pressed position is inside <canvas>, check if it is above object
        var x_in_canvas = x - rect.left, y_in_canvas = rect.bottom - y;
        var picked = check(gl, n, x_in_canvas, y_in_canvas, currentAngle, u_Clicked, viewProjMatrix, u_MvpMatrix);
    }
}
```
+ 判断是否点中的是物体。
```js
function check(gl, n, x, y, currentAngle, u_Clicked, viewProjMatrix, u_MvpMatrix) {
    gl.uniform1i(u_Clicked, 1);  // Pass true to u_Clicked
    draw(gl, n, currentAngle, viewProjMatrix, u_MvpMatrix); // Draw cube with red
    // Read pixel at the clicked position
    var pixels = new Uint8Array(4); // Array for storing the pixel value
    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        // The mouse in on cube if R(pixels[0]) is 255
    if (pixels[0] !== 255){
        gl.uniform1i(u_Clicked, 0);  // Pass false to u_Clicked(rewrite the cube)
        draw(gl, n, currentAngle, viewProjMatrix, u_MvpMatrix); // Draw the cube
        
    }else{
        alert('The cube was selected! ');
    }
}
```
**缺点**：上面的方法缺点很明显，如果模型过多就不太好使用了。上面的选中物体的原理是在鼠标触发点击事件后，将物体渲染为红色，然后在获取鼠标点的一个像素，判断是否为红色，是红色，则代表选中的是物体。
具体`demo` 参考 [选中物体](https://github.com/tangjie-93/WebGL/blob/main/%E8%B7%9F%E7%9D%80%E5%AE%98%E7%BD%91%E5%AD%A6WebGL%2BWebGL%E7%BC%96%E7%A8%8B%E6%8C%87%E5%8D%97/%E9%AB%98%E7%BA%A7%E6%8A%80%E6%9C%AF/%E9%80%89%E4%B8%AD%E7%89%A9%E4%BD%93/demo/%E9%80%89%E4%B8%AD%E7%89%A9%E4%BD%93.html)

## 2.选中一个面
需要为每个绘制的面设置一个编号，并作为`attribute float a_Face;`传递到顶点着色器中。然后再传递一个变量`uniform int u_PickedFace`表示选中的面的编号，通过判断两个变量的值是否相等来确定是否被选中了。并且将物体表面的编号存入到`a`分量中。
+ 顶点着色器代码
```js
attribute vec4 a_Position;
attribute vec4 a_Color;
attribute float a_Face;   // Surface number (Cannot use int for attribute variable)
uniform mat4 u_MvpMatrix;
uniform int u_PickedFace;// Surface number of selected face
varying vec4 v_Color;
void main() {
  gl_Position = u_MvpMatrix * a_Position;
  int face = int(a_Face); // Convert to int
  // 通过判断选中的面是否是face
  vec3 color = (face == u_PickedFace) ? vec3(1.0) : a_Color.rgb;
  if(u_PickedFace == 0) { // 将表面编号存入 alpha 分量
    v_Color = vec4(color, a_Face/255.0);
  } else {
    v_Color = vec4(color, a_Color.a);
  }
}
```
+ 判断是否选中的`js`代码
```js
  gl.uniform1i(u_PickedFace, -1);

  var currentAngle = 0.0; // Current rotation angle
  // Register the event handler
  canvas.onmousedown = function(ev) {   // Mouse is pressed
    var x = ev.clientX, y = ev.clientY;
    var rect = ev.target.getBoundingClientRect();
    if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
      // If Clicked position is inside the <canvas>, update the selected surface
      // 纹理坐标的(0,0)点在左下脚
      const x_in_canvas = x - rect.left, y_in_canvas = rect.bottom - y;
      const face = checkFace(gl, n, x_in_canvas, y_in_canvas, currentAngle, u_PickedFace, viewProjMatrix, u_MvpMatrix);
      gl.uniform1i(u_PickedFace, face); // Pass the surface number to u_PickedFace
      draw(gl, n, currentAngle, viewProjMatrix, u_MvpMatrix);
    }
  }
// 点击的时候采取设置颜色a分量的值
function checkFace(gl, n, x, y, currentAngle, u_PickedFace, viewProjMatrix, u_MvpMatrix) {
  var pixels = new Uint8Array(4); // Array for storing the pixel value
  gl.uniform1i(u_PickedFace, 0);  // 通过设置u_PickedFace 为0, 来将表面标号写入a分量
  // 存在颜色缓冲区中，没有最终显示在屏幕上
  draw(gl, n, currentAngle, viewProjMatrix, u_MvpMatrix);
  // Read the pixel value of the clicked position. pixels[3] is the surface number
  // 获取当前点击像素位置的表面编号，最大值是255
  gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  return pixels[3];
}
```
**问题：** 为什么在 `onmousedown` 事件中要 执行下面的代码？
```js
gl.uniform1i(u_PickedFace, 0);  // 通过设置u_PickedFace 为0, 来将表面标号写入a分量
draw(gl, n, currentAngle, viewProjMatrix, u_MvpMatrix);
```
回答：在点击鼠标后，通过设置 `u_PickedFace` 为 `0`, 来将表面编号写入 `a` 分量。
这样在下次绘制物体的时候才能将物体绘制成选中的颜色。这样也能保证没有选中的面都能绘制称原来的颜色。

```js
if(u_PickedFace == 0) { // 将表面编号存入 alpha 分量
    v_Color = vec4(color, a_Face/255.0);
  } else {
    v_Color = vec4(color, a_Color.a);
  }
```
具体`demo` 参考 [选中物体](https://github.com/tangjie-93/WebGL/blob/main/%E8%B7%9F%E7%9D%80%E5%AE%98%E7%BD%91%E5%AD%A6WebGL%2BWebGL%E7%BC%96%E7%A8%8B%E6%8C%87%E5%8D%97/%E9%AB%98%E7%BA%A7%E6%8A%80%E6%9C%AF/%E9%80%89%E4%B8%AD%E7%89%A9%E4%BD%93/demo/%E9%80%89%E4%B8%AD%E9%9D%A2.html)

## 3.在多个物体中选中一个物体
关于找到用户点击的物体，一个最简单的方法是：为每一个对象赋予一个数字 `id`，我们可以在关闭光照和纹理的情况下将**数字`id`当作颜色绘制所有对象**。 随后我们将得到一帧图片，上面绘制了所有物体的剪影，而深度缓冲会自动帮我们排序。 我们可以**读取鼠标坐标下的像素颜色为数字id**，就能得到这个位置上渲染的对应物体。

为了实现点击效果，我们需要用到**帧缓冲**，同时也会用到两份着色器数据，一份用于正常绘制，一份用于绘制模型的独一无二的颜色编号。
+ 正常绘制的着色器代码
```js
// 点元着色器
<script id="3d-vertex-shader" type="x-shader/x-vertex">
  attribute vec4 a_position;
  attribute vec4 a_color;

  uniform mat4 u_matrix;

  varying vec4 v_color;

  void main() {
    // Multiply the position by the matrix.
    gl_Position = u_matrix * a_position;

    // Pass the color to the fragment shader.
    v_color = a_color;
  }
</script>
// 片元着色器
<script id="3d-fragment-shader" type="x-shader/x-fragment">
  precision mediump float;

  // Passed in from the vertex shader.
  varying vec4 v_color;

  uniform vec4 u_colorMult;

  void main() {
    gl_FragColor = v_color * u_colorMult;
  }
  </script>
```
+ 选中的着色器代码
```js
// 点元着色器代码
<script id="pick-vertex-shader" type="x-shader/x-vertex">
  attribute vec4 a_position;
  
  uniform mat4 u_matrix;
  
  void main() {
      // Multiply the position by the matrix.
      gl_Position = u_matrix * a_position;
  }
</script>
// 片元着色器代码
<script id="pick-fragment-shader" type="x-shader/x-fragment">
  precision mediump float;

  uniform vec4 u_id;

  void main() {
      gl_FragColor = u_id;
  }
</script>
```

+ 创建和使用帧缓冲
```js
   // 创建并绑定帧缓冲
const fb = gl.createFramebuffer();
gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

// 创建用于纹理
const targetTexture = createTexture(gl);
// 附加纹理为第一个颜色附件
// 将祯缓冲的颜色关联对象指定为一个纹理对象
gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, targetTexture, 0);

 // 创建并绑定渲染缓冲对象
const depthBuffer = gl.createRenderbuffer();
gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
//祯缓冲的深度关联对象指定为一个渲染缓冲对象
gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

//在画布显示尺寸跟css尺寸不一致时
// 设置帧缓冲附件尺寸
// 纹理和深度渲染缓冲区配置代码，通过调用它来调整它们的尺寸，使之与画布的大小一致。
function setFramebufferAttachmentSizes(width, height) {
  // 绑定纹理
  gl.bindTexture(gl.TEXTURE_2D, targetTexture);
  // define size and format of level 0
  const level = 0;
  const internalFormat = gl.RGBA;
  const border = 0;
  const format = gl.RGBA;
  const type = gl.UNSIGNED_BYTE;
  const data = null;
  // 用于将图像数据上传到纹理对象的方法
  //data 是 null，我们不需要提供数据，只需要让WebGL分配一个纹理。
  // 设置纹理尺寸
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
    width, height, border,
    format, type, data);
  // 绑定渲染缓冲区
  gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
   // 设置深度渲染缓冲尺寸
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
}

```
+ 创建对象
```js
// 创建每个对象的信息 Make infos for each object for each object.
function createObjects(gl, programInfo) {
    const shapes = createShapes(gl);
    const objects = [];
    const objectsToDraw = [];
    const baseHue = rand(0, 360);
    const numObjects = 200;
    for (let ii = 0; ii < numObjects; ++ii) {
        const id = ii + 1;
        const u_colorMult = chroma.hsv(eMod(baseHue + rand(0, 120), 360), rand(0.5, 1), rand(0.5, 1)).gl();
        const object = {
            uniforms: {
                u_colorMult,
                u_world: m4.identity(),
                u_id: [
                    ((id >> 0) & 0xFF) / 0xFF,
                    ((id >> 8) & 0xFF) / 0xFF,
                    ((id >> 16) & 0xFF) / 0xFF,
                    ((id >> 24) & 0xFF) / 0xFF,
                ],
            },
            translation: [rand(-100, 100), rand(-100, 100), rand(-150, -50)],
            xRotationSpeed: rand(0.8, 1.2),
            yRotationSpeed: rand(0.8, 1.2),
        };
        objects.push(object);
        objectsToDraw.push({
            programInfo: programInfo,
            bufferInfo: shapes[ii % shapes.length],
            uniforms: object.uniforms,
        });
    }
    return {
        objects,
        objectsToDraw
    }

}

function createShapes(gl) {
    // creates buffers with position, normal, texcoord, and vertex color
    // data for primitives by calling gl.createBuffer, gl.bindBuffer,
    // and gl.bufferData
    //创建缓冲区数据
    const sphereBufferInfo = primitives.createSphereWithVertexColorsBufferInfo(gl, 10, 12, 6);
    const cubeBufferInfo = primitives.createCubeWithVertexColorsBufferInfo(gl, 20);
    const coneBufferInfo = primitives.createTruncatedConeWithVertexColorsBufferInfo(gl, 10, 0, 20, 12, 1, true, false);

    return [sphereBufferInfo, cubeBufferInfo, coneBufferInfo];
}
```
+ 渲染场景
渲染场景包括两部分，一部分是将利用帧缓冲区将物体渲染到纹理
```js
gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

gl.enable(gl.CULL_FACE);
gl.enable(gl.DEPTH_TEST);

// Clear the canvas AND the depth buffer.
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

drawObjects(gl,objectsToDraw, pickingProgramInfo);
```
渲染后，将鼠标位置的像素获取到，并转换成编号`id`,然后将对应编号的物体的颜色修改成指定颜色。
```js
const pixelX = mouseX * gl.canvas.width / gl.canvas.clientWidth;
// 纹理坐标的原点在左下角
const pixelY = gl.canvas.height - mouseY * gl.canvas.height / gl.canvas.clientHeight - 1;
const data = new Uint8Array(4);
gl.readPixels(
  pixelX,            // x
  pixelY,            // y
  1,                 // width
  1,                 // height
  gl.RGBA,           // format
  gl.UNSIGNED_BYTE,  // type
  data);             // typed array to hold result
const id = data[0] + (data[1] << 8) + (data[2] << 16) + (data[3] << 24);

// restore the object's color
if (oldPickNdx >= 0) {
  const object = objects[oldPickNdx];
  object.uniforms.u_colorMult = oldPickColor;
  oldPickNdx = -1;
}

// 高亮鼠标下的物体
if (id > 0) {
  const pickNdx = id - 1;
  oldPickNdx = pickNdx;
  const object = objects[pickNdx];
  oldPickColor = object.uniforms.u_colorMult;
  // 用于改变颜色
  object.uniforms.u_colorMult =  [1, 0, 0, 1]; //(frameCount & 0x8) ? [1, 0, 0, 1] : [1, 1, 0, 1];
}
```
最后用指定的颜色绘制鼠标下的物体。
```js
// 将物体绘制到canvas
gl.bindFramebuffer(gl.FRAMEBUFFER, null);
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
drawObjects(gl,objectsToDraw);
```
完成的渲染代码如下所示
```js
function drawScene(time) {
  time *= 0.0005;
  ++frameCount;
  if (webglUtils.resizeCanvasToDisplaySize(gl.canvas)) {
    // 当canvas改变尺寸后，同步帧缓冲的尺寸
    setFramebufferAttachmentSizes(gl.canvas.width, gl.canvas.height);
  }

  // 创建透视投影矩阵
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const projectionMatrix =
    m4.perspective(fieldOfViewRadians, aspect, 1, 2000);

  // 创建相机矩阵
  const cameraPosition = [0, 0, 100];
  const target = [0, 0, 0];
  const up = [0, 1, 0];
  const cameraMatrix = m4.lookAt(cameraPosition, target, up);

  // 根据相机创建视图矩阵
  const viewMatrix = m4.inverse(cameraMatrix);
  // 得到视图投影矩阵
  const viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

  // 计算每个物体的mvp矩阵
  objects.forEach(function (object) {
    object.uniforms.u_matrix = computeMatrix(
      viewProjectionMatrix,
      object.translation,
      object.xRotationSpeed * time,
      object.yRotationSpeed * time);
  });

  // ------ 将物体绘制到纹理 --------

  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);

  // Clear the canvas AND the depth buffer.
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  drawObjects(gl,objectsToDraw, pickingProgramInfo);

  // ------ Figure out what pixel is under the mouse and read it

  const pixelX = mouseX * gl.canvas.width / gl.canvas.clientWidth;
  // 纹理坐标的原点在左下角
  const pixelY = gl.canvas.height - mouseY * gl.canvas.height / gl.canvas.clientHeight - 1;
  const data = new Uint8Array(4);
  gl.readPixels(
    pixelX,            // x
    pixelY,            // y
    1,                 // width
    1,                 // height
    gl.RGBA,           // format
    gl.UNSIGNED_BYTE,  // type
    data);             // typed array to hold result
  const id = data[0] + (data[1] << 8) + (data[2] << 16) + (data[3] << 24);

  // restore the object's color
  if (oldPickNdx >= 0) {
    const object = objects[oldPickNdx];
    object.uniforms.u_colorMult = oldPickColor;
    oldPickNdx = -1;
  }

  // 高亮鼠标下的物体
  if (id > 0) {
    const pickNdx = id - 1;
    oldPickNdx = pickNdx;
    const object = objects[pickNdx];
    oldPickColor = object.uniforms.u_colorMult;
    // 用于改变颜色
    object.uniforms.u_colorMult =  [1, 0, 0, 1]; //(frameCount & 0x8) ? [1, 0, 0, 1] : [1, 1, 0, 1];
  }
  // 将物体绘制到canvas
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  drawObjects(gl,objectsToDraw);
  requestAnimationFrame(drawScene);
}
```
`demo`地址 [多个物理中选中物体-优化前](https://github.com/tangjie-93/WebGL/blob/main/%E8%B7%9F%E7%9D%80%E5%AE%98%E7%BD%91%E5%AD%A6WebGL%2BWebGL%E7%BC%96%E7%A8%8B%E6%8C%87%E5%8D%97/%E9%AB%98%E7%BA%A7%E6%8A%80%E6%9C%AF/%E9%80%89%E4%B8%AD%E7%89%A9%E4%BD%93/demo/%E5%A4%9A%E4%B8%AA%E7%89%A9%E4%BD%93%E4%B8%AD%E9%80%89%E4%B8%AD%E7%89%A9%E4%BD%93-%E4%BC%98%E5%8C%96%E5%90%8E.html)

上面的代码我们可以做一下优化，上面我们不物体渲染了两次，一次是利用帧缓冲把物体渲染到纹理中，第二次是把物体渲染到画布上。

我们可以把优化成只渲染鼠标下的像素，为了做到这一点，我们需要使用一个只覆盖这个像素空间的视锥体。

到目前为止，对于  `3D` 处理，我们一直在使用一个叫做 `perspective` (透视投影) 的函数，该函数将视场、长宽和近远平面的 `z` 值作为输入，并制作一个透视投影矩阵，将这些值所定义的视锥体转换为裁剪空间。

大多数三维数学库都有另一个叫做 `frustum`(正交投影) 的函数，它需要6个值，近 `Z` 面的左、右、上、下值，然后是`Z`面的 `Z`-近和`Z`-远值，并生成一个由这些值定义的投影矩阵。

利用上述方法，我们可以为鼠标下方的一个像素生成一个投影矩阵。我们可以通过以下代码来实现：
+ 计算覆盖视锥体前方的近平面矩形尺寸(投影矩阵的近平面)
```js
 const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
const top = Math.tan(fieldOfViewRadians * 0.5) * near;
const bottom = -top;
const left = aspect * bottom;
const right = aspect * top;
const width = Math.abs(right - left);
const height = Math.abs(top - bottom);
```
+ 计算近平面覆盖鼠标下1像素的部分
```js
//将鼠标为主转换为像素坐标
const pixelX = mouseX * gl.canvas.width / gl.canvas.clientWidth;
const pixelY = gl.canvas.height - mouseY * gl.canvas.height / gl.canvas.clientHeight - 1;
```
+ 计算鼠标下的像素在近平面上的位置
  将鼠标位置映射到近平面上的坐标
```js
// 计算的是鼠标在近平面上对应的左边界。
// pixelX * width / gl.canvas.width表示在近平面上的宽度
const subLeft = left + pixelX * width / gl.canvas.width;
```
**解释**
> 先将画布上的像素坐标（`pixelX`） 转换为在近平面上的相对位置（通过  `pixelX/gl.canvas.width`  计算出鼠标在画布宽度中的比例）。

> 再将这个比例乘以近平面的宽度（  `width` ）得到在近平面上对应的长度。

> 最后，将这个长度加到近平面的左边界（`left`），得到在近平面上对应的实际 `X` 坐标（`subLeft`）。
```js
// 计算的是鼠标在近平面上对应的下边界。
// pixelY * height / gl.canvas.height表示在近平面上的高度
const subBottom = bottom + pixelY * height / gl.canvas.height;
```
**解释**
> 先将画布上的像素坐标（`pixelY`）转换为在近平面上的相对位置（通过 `pixelY/gl.canvas.height` 计算出鼠标在画布高度中的比例）。

> 再将这个比例乘以近平面的高度（`height`）得到在近平面上对应的长度。

> 最后，将这个长度加到近平面的下边界（`bottom`），得到在近平面上对应的实际Y坐标（`subBottom`）。
```js
// 是近平面上一个像素的宽度
const subWidth = width / gl.canvas.width;
//是近平面上一个像素的高度
const subHeight = height / gl.canvas.height;
```

+ 为这个像素创建视锥体
```js
const projectionMatrix = m4.frustum(
  subLeft,
  subLeft + subWidth,
  subBottom,
  subBottom + subHeight,
  near,
  far);
```
+ 设置帧缓冲纹理渲染尺寸大小
现在不再需要`gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);`设置整个画布大小了，现在我们设置一个只有1x1像素的帧缓冲，这样就可以覆盖鼠标下的那个像素了。
```js
gl.viewport(0, 0, 1, 1);
```
+ 创建一个只有1x1像素的纹理和深度缓冲
//不再在判断`webglUtils.resizeCanvasToDisplaySize(gl.canvas)`的真假值来执行 `setFramebufferAttachmentSizes`,而是直接在创建帧缓冲的时候就设置。
```js
setFramebufferAttachmentSizes(1, 1);
```
+ 只为模型计算模型变换矩阵,因为现在渲染到纹理和渲染到画布用的透视投影矩阵不一样了
```js
// 为每个物体计算矩阵
objects.forEach(function(object) {
  object.uniforms.u_world = computeMatrix(
      object.translation,
      object.xRotationSpeed * time,
      object.yRotationSpeed * time);
});
```
+ 获取像素的颜色，现在只需要获取`（0,0）`位置的一个像素就行了
```js
const data = new Uint8Array(4);
gl.readPixels(
    0,                 // x
    0,                 // y
    1,                 // width
    1,                 // height
    gl.RGBA,           // format
    gl.UNSIGNED_BYTE,  // type
    data);             // typed array to hold result
const id = data[0] + (data[1] << 8) + (data[2] << 16) + (data[3] << 24);
```
`demo`地址 [多个物理中选中物体-优化后](https://github.com/tangjie-93/WebGL/blob/main/%E8%B7%9F%E7%9D%80%E5%AE%98%E7%BD%91%E5%AD%A6WebGL%2BWebGL%E7%BC%96%E7%A8%8B%E6%8C%87%E5%8D%97/%E9%AB%98%E7%BA%A7%E6%8A%80%E6%9C%AF/%E9%80%89%E4%B8%AD%E7%89%A9%E4%BD%93/demo/%E5%A4%9A%E4%B8%AA%E7%89%A9%E7%90%86%E4%B8%AD%E9%80%89%E4%B8%AD%E7%89%A9%E4%BD%93-%E4%BC%98%E5%8C%96%E5%89%8D.html)

<Valine></Valine>