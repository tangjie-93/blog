---
title: 39、WebGL之立方体贴图
date: '2024-06-24'
lastmodifydate: '2024-06-25'
type: 技术
tags: WebGL
note: WebGL之立方体贴图
---
## 1.立方体贴图
在 `WebGL` 中实现立方体贴图`（Cube Mapping）`是一种用于环境贴图或反射效果的技术。以下是如何在 `WebGL` 中实现立方体贴图的步骤，包括创建一个立方体并应用贴图。立方体贴图由六个面组成，分别对应立方体的六个方向（正 `X`、负 `X`、正`Y`、负`Y`、正`Z`、负`Z`）。每个面都是一个独立的 `2D` 纹理。不像常规的纹理坐标有`2`个纬度，立方体纹理使用法向量， 根据法向量的朝向选取立方体`6`个面中的一个，这个面的像素用来采样生成颜色。
我们除了使用图片绘制纹理，我们还可以使用`canvas`来绘制纹理。

#### 1.1 使用图片绘制纹理
核心代码如下所示
+ 顶点着色器代码
```js
attribute vec4 a_position;
uniform mat4 u_matrix;
varying vec3 v_normal;
void main() {
  // Multiply the position by the matrix.
  gl_Position = u_matrix * a_position;
  // 传递法向量。因为位置是以几何中心为原点的
  // 我们可以直接传递位置
  // 直接使用顶点位置作为法向量可以简化计算。如果顶点是在单位球体上的点，顶点的归一化坐标即为法向量。
  v_normal = normalize(a_position.xyz);
}
```
+ 片段着色器代码
```js
precision mediump float;
// Passed in from the vertex shader.
varying vec3 v_normal;
// The texture.
uniform samplerCube u_texture;

void main() {
    gl_FragColor = textureCube(u_texture, normalize(v_normal));
}
```
+ 创建纹理对象
```js
function createTexture(gl) {
    // Create a texture.
    const texture = gl.createTexture();
    // 立方体纹理 gl.TEXTURE_CUBE_MAP
    // 二维纹理 gl.TEXTURE_2D
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
    const faceInfos = [
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, url: '../../images/1.jpg' },
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, url: '../../images/2.jpg' },
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, url: '../../images/3.jpg' },
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, url: '../../images/4.jpg' },
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, url: '../../images/5.jpg' },
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, url: '../../images/6.jpg' },
    ];
    // faceInfos.forEach((face) => {
    //     const { target, url } = face;
    //     // 配置每个面的纹理
    //     loadImg(url).then(image => {
    //          // gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeTexture);
    //         gl.texImage2D(target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    //         gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    //         gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    //     })
    // });
    Promise.allSettled(faceInfos.map(item=>loadImg(item.url))).then(res => {
        faceInfos.forEach(({ target }, index) => {
            // Upload the canvas to the cubemap face.
            const level = 0;
            const internalFormat = gl.RGBA;
            const format = gl.RGBA;
            const type = gl.UNSIGNED_BYTE;
            gl.texImage2D(target, level, internalFormat, format, type, res[index].value);
        });
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    })
}
```
传送门 [立方体贴图-使用图片绘制纹理](https://github.com/tangjie-93/WebGL/blob/main/fundmantalExamples/%E4%B8%89%E7%BB%B4%E7%BA%B9%E7%90%86/%E7%AB%8B%E6%96%B9%E4%BD%93%E8%B4%B4%E5%9B%BE-%E4%BD%BF%E7%94%A8%E5%9B%BE%E7%89%87%E7%BB%98%E5%88%B6%E7%BA%B9%E7%90%86.html)
#### 1.2 使用canvas绘制纹理
核心代码如下所示
```js
function createTexture() {
    // Create a texture.
    const texture = gl.createTexture();
    // 立方体纹理 gl.TEXTURE_CUBE_MAP
    // 二维纹理 gl.TEXTURE_2D
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
    // Get A 2D context
    /** @type {Canvas2DRenderingContext} */
    const ctx = document.createElement("canvas").getContext("2d");
    // 立方体纹理需要正方形纹理
    ctx.canvas.width = 128;
    ctx.canvas.height = 128;

    const faceInfos = [
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, faceColor: '#F00', textColor: '#0FF', text: '+X', },
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, faceColor: '#FF0', textColor: '#00F', text: '-X', },
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, faceColor: '#0F0', textColor: '#F0F', text: '+Y', },
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, faceColor: '#0FF', textColor: '#F00', text: '-Y', },
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, faceColor: '#00F', textColor: '#FF0', text: '+Z', },
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, faceColor: '#F0F', textColor: '#0F0', text: '-Z', },
    ];
    faceInfos.forEach((faceInfo, index) => {
        const { target, faceColor, textColor, text } = faceInfo;
        generateFace(ctx, faceColor, textColor, text);

        // Upload the canvas to the cubemap face.
        const level = 0;
        const internalFormat = gl.RGBA;
        const format = gl.RGBA;
        const type = gl.UNSIGNED_BYTE;
        gl.texImage2D(target, level, internalFormat, format, type, ctx.canvas);

    });
    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    // Now that the image has loaded make copy it to the texture.
    // Check if the image is a power of 2 in both dimensions.
    if (isPowerOf2(ctx.canvas.width) && isPowerOf2(ctx.canvas.height)) {
        // Yes, it's a power of 2. Generate mips.
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);


    } else {
        // No, it's not a power of 2. Turn of mips and set wrapping to clamp to edge
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
}
function generateFace(ctx, faceColor, textColor, text) {
    const { width, height } = ctx.canvas;
    ctx.fillStyle = faceColor;
    ctx.fillRect(0, 0, width, height);
    ctx.font = `${width * 0.7}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = textColor;
    ctx.fillText(text, width / 2, height / 2);
}
```
与使用图片绘制纹理的区别在于传递纹理时的参数不同
```js
 gl.texImage2D(target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
 gl.texImage2D(target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, ctx.canvas);
```
传送门 [立方体贴图-使用canvas绘制纹理](https://github.com/tangjie-93/WebGL/blob/main/fundmantalExamples/%E4%B8%89%E7%BB%B4%E7%BA%B9%E7%90%86/%E7%AB%8B%E6%96%B9%E4%BD%93%E8%B4%B4%E5%9B%BE-%E4%BD%BF%E7%94%A8canvas%E7%BB%98%E5%88%B6%E7%BA%B9%E7%90%86.html)
## 2.天空盒子
在 `WebGL` 中，天空盒子`（skybox）`是一种常见的技术，用于模拟远处的环境，使场景看起来像被包围在一个巨大的立方体或球体内。天空盒子通常使用立方体贴图`（cube map）`来创建。


## 3.环境贴图
环境贴图表示你所绘制物体的环境。环境贴图用于模拟物体周围的环境光照和反射。常见的应用包括反射贴图和折射贴图。

**参考文档**<br>
[WebGL 立方体贴图](https://webglfundamentals.org/webgl/lessons/zh_cn/webgl-cube-maps.html)<br>
[WebGL 环境贴图 (反射)](https://webglfundamentals.org/webgl/lessons/zh_cn/webgl-environment-maps.html)<br>
[WebGL 天空盒子](https://webglfundamentals.org/webgl/lessons/zh_cn/webgl-skybox.html)<br>