---
title: WebGL之二维变换及其矩阵推导
date: '2024-06-14'
type: 技术
tags: WebGL
note: WebGL之二维变换及其矩阵推导
---

## 1.二维的平移、旋转、缩放的实现
+ 在`WebGL`中的平移、旋转、缩放操作
```glsl
<script id="vertex-shader-2d" type="x-shader/x-vertex">
attribute vec2 a_position;

uniform vec2 u_resolution;
uniform vec2 u_translation;
uniform vec2 u_rotation;
uniform vec2 u_scale;
 
void main() {
  // 缩放
  vec2 scaledPosition = a_position * u_scale;
 
  // 旋转
  vec2 rotatedPosition = vec2(
     scaledPosition.x * u_rotation.y + scaledPosition.y * u_rotation.x,
     scaledPosition.y * u_rotation.y - scaledPosition.x * u_rotation.x);
 
  // 平移
  vec2 position = rotatedPosition + u_translation;
  // convert the position from pixels to 0.0 to 1.0
  vec2 zeroToOne = position / u_resolution;

  // convert from 0->1 to 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;

  // convert from 0->2 to -1->+1 (clipspace)
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}
```
+ 在js中的平移、旋转、缩放赋值。
```js
const translationLocation = gl.getUniformLocation(gl.program, 'u_Translation');
const rotationLocation = gl.getUniformLocation(gl.program, 'u_rotation');
const scaleLocation = gl.getUniformLocation(gl.program, 'u_scale');
const resolutionLocation = gl.getUniformLocation(gl.program, 'u_resolution');
// set the resolution
gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

// set the color
gl.uniform4fv(colorLocation, color);
 // Set the translation. translation是一个二维数组
gl.uniform2fv(translationLocation, translation);

// Set the rotation.rotation是一个二维数组
gl.uniform2fv(rotationLocation, rotation);

// Set the scale.
gl.uniform2fv(scaleLocation, scale);
```
构建几何模型的顶点的创建。**按照顺时针的方向去构建，按照三角形去构建多边形，上一个三角形的最后一个顶点作为下一个三角形的起点。**
```js
// Fill the buffer with the values that define a letter 'F'.
function setGeometry(gl) {
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
          // left column
          0, 0,
          30, 0,
          0, 150,
          0, 150,
          30, 0,
          30, 150,

          // top rung
          30, 0,
          100, 0,
          30, 30,
          30, 30,
          100, 0,
          100, 30,

          // middle rung
          30, 60,
          67, 60,
          30, 90,
          30, 90,
          67, 60,
          67, 90,
        ]),
        gl.STATIC_DRAW
);
}
```

## 2.使用矩阵去实现二维的平移、旋转和缩放
二维的平移、旋转和缩放我们一般用三维矩阵来操作。
矩阵主要是由前面的平移、旋转、缩放操作的常规操作来封装推导实现的。矩阵的运算是大学线性代数的知识，大家要是不记得话可以去回忆一下矩阵的乘法等运算知识。
具体推导过程可以参考下面的文章。
[平移、旋转和缩放矩阵的推导](https://webglfundamentals.org/webgl/lessons/zh_cn/webgl-2d-matrices.html)
```js
const m3 = {
    // x0 = 2x/width-1； y0 = -2y/height + 1;  (x,y)是屏幕空间坐标，(x0,y0)是裁剪空间坐标
    // 将像素空坐标转换为裁剪空间(各方向单位为 -1 到 +1 )坐标
    makeProjectionMatrix: function(width, height) {
        // 注意：这个矩阵翻转了 Y 轴，所以 0 在上方
        return [
            2 / width,  0,           0,
            0,          -2 / height, 0,
            -1,         1,           1
        ];
    },
    // 单位矩阵
    identity: function() {
        return [
            1, 0, 0,
            0, 1, 0,
            0, 0, 1,
        ];
    },
    // 平移
    translation: function(tx, ty) {
        return [
            1, 0, 0,
            0, 1, 0,
            tx, ty, 1,
        ];
    },
    /****
     * newX = x *  c + y * s;
       newY = x * -s + y * c;
     */
    // 旋转
    rotation: function(angleInRadians) {
        const c = Math.cos(angleInRadians);
        const s = Math.sin(angleInRadians);
        return [
            c,-s, 0,
            s, c, 0,
            0, 0, 1,
        ];
    },
    // 缩放
    scaling: function(sx, sy) {
        return [
            sx, 0, 0,
            0, sy, 0,
            0, 0, 1,
        ];
    },
    // 矩阵相乘
    multiply: function(a, b) {
        /**
         * a*b
         */
        const a00 = a[0 * 3 + 0];// 第一行
        const a01 = a[0 * 3 + 1];
        const a02 = a[0 * 3 + 2];
        const a10 = a[1 * 3 + 0];// 第二行
        const a11 = a[1 * 3 + 1];
        const a12 = a[1 * 3 + 2];
        const a20 = a[2 * 3 + 0];// 第三行
        const a21 = a[2 * 3 + 1];
        const a22 = a[2 * 3 + 2];
        const b00 = b[0 * 3 + 0];// 第一行
        const b01 = b[0 * 3 + 1];
        const b02 = b[0 * 3 + 2];
        const b10 = b[1 * 3 + 0];// 第二行
        const b11 = b[1 * 3 + 1];
        const b12 = b[1 * 3 + 2];
        const b20 = b[2 * 3 + 0];// 第三行
        const b21 = b[2 * 3 + 1];
        const b22 = b[2 * 3 + 2];
        const c00 = a00 * b00 + a10 * b01 + a20 * b02;// 第一行
        const c01 = a01 * b00 + a11 * b01 + a21 * b02;
        const c02 = a02 * b00 + a12 * b01 + a22 * b02;
        const c10 = a00 * b10 + a10 * b11 + a20 * b12;// 第二行
        const c11 = a01 * b10 + a11 * b11 + a21 * b12;
        const c12 = a02 * b10 + a12 * b11 + a22 * b12;
        const c20 = a00 * b20 + a10 * b21 + a20 * b22;// 第三行
        const c21 = a01 * b20 + a11 * b21 + a21 * b22;
        const c22 = a02 * b20 + a12 * b21 + a22 * b22;
        // return [
        //     b00 * a00 + b01 * a10 + b02 * a20,// a矩阵的第一列*b矩阵的第一行
        //     b00 * a01 + b01 * a11 + b02 * a21,// a矩阵的第二列*b矩阵的第一行
        //     b00 * a02 + b01 * a12 + b02 * a22,
        //     b10 * a00 + b11 * a10 + b12 * a20,
        //     b10 * a01 + b11 * a11 + b12 * a21,
        //     b10 * a02 + b11 * a12 + b12 * a22,
        //     b20 * a00 + b21 * a10 + b22 * a20,
        //     b20 * a01 + b21 * a11 + b22 * a21,
        //     b20 * a02 + b21 * a12 + b22 * a22,
        // ];
        // 实际上时按照 b*a 的顺序来计算，因为 b 是列向量，而 a 是行向量
        retrun [
            c00, c01, c02,
            c10, c11, c12,
            c20, c21, c22
        ]
  },
};
```
原来的平移、旋转和缩放操作使用矩阵来实现。因为`javascript`没有矩阵类型，所以这里使用`Array`来模拟矩阵。

**注意:下面定义的矩阵在进行矩阵运算时都是需要转置的，也就是矩阵的行和列互换。因为webgl中的矩阵是列主序的。**
```js
  // Compute the matrices
// 投影矩阵
const projectionMatrix = m3.projection(
        gl.canvas.clientWidth, gl.canvas.clientHeight);
// 平移矩阵
const translationMatrix = m3.translation(translation[0], translation[1]);
// 旋转矩阵
const rotationMatrix = m3.rotation(angleInRadians);
// 缩放
const scaleMatrix = m3.scaling(scale[0], scale[1]);

const matrix = m3.identity();
// Multiply the matrices.
// 平移
matrix = m3.multiply(projectionMatrix, translationMatrix);
//旋转
matrix = m3.multiply(matrix, rotationMatrix);
// 缩放
matrix = m3.multiply(matrix, scaleMatrix);

// Set the matrix.
gl.uniformMatrix3fv(matrixLocation, false, matrix);
```
在`WebGL`中的代码实现
```js
attribute vec2 a_position; 
uniform mat3 u_matrix;
void main() {
  // 使位置和矩阵相乘
  gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);
}
```

下面我们一起来推导以下上面几个矩阵。

#### 2.1 像素空坐标转换为裁剪空间矩阵的推导
```js
 // x0 = 2x/width-1； y0 = -2y/height + 1;  (x,y)是屏幕空间坐标，(x0,y0)是裁剪空间坐标
// 将像素空坐标转换为裁剪空间(各方向单位为 -1 到 +1 )坐标
function makeProjectionMatrix(width, height) {
    // 注意：这个矩阵翻转了 Y 轴，所以 0 在上方
    return [
        2 / width,  0,           0,
        0,          -2 / height, 0,
        -1,         1,           1
    ];
}
```
+ 定义矩阵 
```js
const projectionMatrix = {
    a,b,c,
    d,e,f,
    g,h,i
}
```
+ 屏幕空间和裁剪空间的计算公式
```js
x0 = 2x/width-1;// width为canvas的宽度
y0 = -2y/height + 1;//height为canvas的高度
```
上面的计算公式我们可以通过矩阵运算得到。
+ 矩阵运算跟计算公式的关系
为了便于计算，我们将当前屏幕坐标 也定义成一个`3X1(3行1列)`矩阵`P{x,y,1}`，那么就可以得到下面的矩阵运算
```js
projectionMatrix*P = {
    ax+dy+g,
    bx+ey+h,
    cx+fy+i
}
x0 = 2x/width-1 = ax+dy+g;//得到 a = 2/width,d = 0, g = -1
y0 = -2y/height + 1;//得到 b = 0, e = -2/height,h =1
z0 = 1; //得到 c= 0，f = 0,i =1；
```
将求出的 `a,b,e,d,e,f,g,h,i`代入上面定义的矩阵，就得到了我们之前创建的屏幕空间换算到裁剪空间的矩阵了。
#### 2.2 平移矩阵的推导
```js
 // 平移
function  translation(tx, ty) {
    return [
        1, 0, 0,
        0, 1, 0,
        tx, ty, 1,
    ];
},
```
+ 定义矩阵 
```js
const translationMatrix = {
    a,b,c,
    d,e,f,
    g,h,i
}
```
+ 平移坐标的计算公式
```js
x0 = x + tx;//tx为x轴平移距离
y0 = y + ty;//ty为y轴平移距离
```
+ 矩阵运算跟计算公式的关系
屏幕坐标定义成一个`3X1(3行1列)`矩阵`P{x,y,1}`
```js
translationMatrix * P = {
    ax+dy+g,
    bx+ey+h,
    cx+fy+i
}
x0 = x + tx = ax+dy+g;//得到 a = 1,d = 0, g = tx
y0 = y + ty;//得到 b = 0, e = 1,h = ty
z0 = 1; //得到 c= 0，f = 0,i =1；
```
将求出的 `a,b,e,d,e,f,g,h,i` 代入上面定义的矩阵，就得到了我们之前创建的平移矩阵了。
#### 2.3 缩放矩阵的推导
```js
// 缩放矩阵
function scaling(sx, sy) {
    return [
        sx, 0, 0,
        0, sy, 0,
        0, 0, 1,
    ];
},
```
+ 定义矩阵 
```js
const translationMatrix = {
    a,b,c,
    d,e,f,
    g,h,i
}
```
+ 缩放坐标的计算公式
```js
x0 = sx*x;//sx为x轴缩放因子
y0 = sy*y;//sy为y轴轴缩放因子
```
+ 矩阵运算跟计算公式的关系
屏幕坐标定义成一个`3X1(3行1列)`矩阵`P{x,y,1}`
```js
translationMatrix * P = {
    ax+dy+g,
    bx+ey+h,
    cx+fy+i
}
x0 = sx*x = ax+dy+g;//得到 a = sx,d = 0, g = 0
y0 = sy*y;//得到 b = 0, e = sy,h = 0
z0 = 1; //得到 c= 0，f = 0,i =1；
```
将求出的 `a,b,e,d,e,f,g,h,i` 代入上面定义的矩阵，就得到了我们之前创建的缩放矩阵了。

#### 2.3 旋转矩阵的推导
推导过程可以看下官网的这个例子 [WebGL 二维旋转](https://webglfundamentals.org/webgl/lessons/zh_cn/webgl-2d-rotation.html)


```js
/****
 * newX = x * c + y * s;
 * newY = -x * s + y * c;
*/
// 旋转
function rotation(angleInRadians) {
    const c = Math.cos(angleInRadians);
    const s = Math.sin(angleInRadians);
    return [
        c,-s, 0,
        s, c, 0,
        0, 0, 1,
    ];
},
```
+ 定义矩阵 
```js
const translationMatrix = {
    a,b,c,
    d,e,f,
    g,h,i
}
```
+ 旋转坐标的计算公式
```js
x0 = x *  c - y * s;//c = Math.cos(angleInRadians)
y0 = x *  s + y * c;//s = Math.sin(angleInRadians)
```

+ 矩阵运算跟计算公式的关系
屏幕坐标定义成一个`3X1(3行1列)`矩阵`P{x,y,1}`
```js
translationMatrix * P = {
    ax+dy+g,
    bx+ey+h,
    cx+fy+i
}
x0 = sx*x = ax+dy+g;//得到 a = sx,d = 0, g = 0
y0 = sy*y;//得到 b = 0, e = sy,h = 0
z0 = 1; //得到 c= 0，f = 0,i =1；
```
将求出的 `a,b,e,d,e,f,g,h,i` 代入上面定义的矩阵，就得到了我们之前创建的缩放矩阵了。

**旋转坐标的计算公式的详细推导过程**
> 初始坐标表示

**注意: `NDC`坐标系是左手坐标系，即 `z` 轴指向屏幕里面。在左手坐标系中，顺时针旋转对应于正方向。**

首先，我们将原始坐标 `(x,y)` 表示为极坐标的形式。极坐标形式可以帮助我们更直观地理解旋转操作,因此我们可以将`(x,y)`用下面的极坐标表示。
+ `r` 是向量的长度（即向量的模）
+ `ϕ` 是向量与 `x` 轴之间的角度。
```js
x = rcosϕ //r 是向量的长度（即向量的模），
y = rsinϕ // ϕ 是向量与 x 轴之间的角度。
```
> 旋转后的坐标

旋转一个角度 `θ` 后，新坐标 `(x′,y′)`的极坐标表示变为：
+ `r` 仍然是向量的长度，
+ `ϕ-θ` 是向量与 `x` 轴之间的新角度。
因此旋转后的坐标可以表示为
```js
x′=rcos(ϕ-θ)
y′=rsin(ϕ-θ)
```
利用三角函数中的合角公式来展开`cos(ϕ-θ)`和`rsin(ϕ-θ)`
```js
cos(ϕ-θ) = cosϕcosθ + sinϕsinθ
sin(ϕ-θ) = sinϕcosθ - cosϕsinθ
```
将这些公式代入旋转后的坐标公式中：
```js
x′= rcosϕcosθ + rsinϕsinθ
y′= rsinϕcosθ - rcosϕsinθ
```
由于 `x=rcosϕ` 和 `y=rsinϕ`，我们可以将其代入上面的公式：
```js
x′ = xcosθ + ysinθ
y′ = -xsinθ + ycosθ
```

<Valine></Valine>