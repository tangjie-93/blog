---
title: 18、源码解析之Object3
date: '2024-07-17'
lastmodifydate: '2024-07-17'
type: 技术
tags: threejs
note: 源码解析之Object3
---

## 1、applyMatrix4
```js
/**
 * 对当前物体应用这个变换矩阵，并更新物体的位置、旋转和缩放。
 *
 * @param matrix 传入的4x4矩阵
 * @returns 无返回值，直接修改对象的矩阵、位置、四元数和缩放值
 */
applyMatrix4( matrix ) {

    // 如果自动更新矩阵为true，则更新局部矩阵
    if ( this.matrixAutoUpdate ) this.updateMatrix();

    // 将传入的矩阵与当前矩阵相乘
    // 表示该matrix是在当前matrix之后才应用给当前对象的
    // 相当于 this.matrix = matrix * this.matrix;
    this.matrix.premultiply( matrix );

    // 分解当前矩阵为位置、四元数和缩放值
    this.matrix.decompose( this.position, this.quaternion, this.scale );

	}
```
## 2、updateMatrix
```js
/**
 * 更新局部矩阵
 *
 * 将位置、四元数和缩放组合到矩阵中，并标记矩阵世界需要更新
 */
updateMatrix() {
    // 将位置、四元数和缩放组合到矩阵中
    this.matrix.compose( this.position, this.quaternion, this.scale );

    // 标记世界矩阵需要更新
    this.matrixWorldNeedsUpdate = true;

}
```
## 3、updateMatrixWorld
```js
/**
 * 更新对象的世界矩阵
 *
 * @param force 是否强制更新，即使 matrixWorldNeedsUpdate 为 false
 */
updateMatrixWorld( force ) {
    // 如果 matrixAutoUpdate 为 true，则更新局部矩阵
    if ( this.matrixAutoUpdate ) this.updateMatrix();
    // 如果 matrixWorldNeedsUpdate 为 true 或者 force 为 true
    if ( this.matrixWorldNeedsUpdate || force ) {
        // 如果 matrixWorldAutoUpdate 为 true
        if ( this.matrixWorldAutoUpdate === true ) {
            // 如果 parent 为 null
            if ( this.parent === null ) {
                // 将 matrix 复制到 matrixWorld
                this.matrixWorld.copy( this.matrix );
            // 否则
            } else {

                // 将 parent 的 matrixWorld 和自身的 matrix 相乘，结果赋值给 matrixWorld
                this.matrixWorld.multiplyMatrices( this.parent.matrixWorld, this.matrix );
            }
        }
        // 将 matrixWorldNeedsUpdate 设置为 false
        this.matrixWorldNeedsUpdate = false;
        // 将 force 设置为 true
        force = true;
    }
    // 确保如果需要，则更新子节点
    // make sure descendants are updated if required
    const children = this.children;
    for ( let i = 0, l = children.length; i < l; i ++ ) {

        const child = children[ i ];

        // 递归调用子节点的 updateMatrixWorld 方法
        child.updateMatrixWorld( force );
    }
}
```

## 4、getWorldDirection
返回一个表示该物体在世界空间中`Z`轴正方向的矢量。
```js
/**
 * 获取世界方向
 *
 * @param target 目标向量，用于存储结果
 * @returns 返回经过归一化的目标向量，表示当前对象在世界空间中的方向
 */
getWorldDirection( target ) {
    // 更新世界矩阵
    this.updateWorldMatrix( true, false );

    // 获取矩阵元素的数组
    const e = this.matrixWorld.elements;

    // 设置目标向量的 x、y、z 分量，并返回归一化后的向量
    // 这里假设 target 是一个向量对象，具有 set 和 normalize 方法
    return target.set( e[ 8 ], e[ 9 ], e[ 10 ] ).normalize();
}
```

<Valine></Valine>