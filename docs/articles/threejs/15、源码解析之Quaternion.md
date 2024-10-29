---
title: 15、源码解析之Quaternion
date: '2024-07-16'
lastmodifydate: '2024-07-16'
type: 技术
tags: threejs
note: 源码解析
---

四元数在3D计算机图形学中用于表示旋转，因为它们比欧拉角和旋转矩阵更稳定且不容易产生万向节锁问题

## 1、setFromRotationMatrix
改方法的作用是将一个旋转矩阵转换为四元数。
```js
/**
 * 从旋转矩阵设置四元数
 *
 * @param m 旋转矩阵
 * @returns 当前四元数对象
 */
setFromRotationMatrix( m ) {

    // http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm

    // assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

    const te = m.elements,

        m11 = te[ 0 ], m12 = te[ 4 ], m13 = te[ 8 ],
        m21 = te[ 1 ], m22 = te[ 5 ], m23 = te[ 9 ],
        m31 = te[ 2 ], m32 = te[ 6 ], m33 = te[ 10 ],

        trace = m11 + m22 + m33;
    // 
    if ( trace > 0 ) {

        const s = 0.5 / Math.sqrt( trace + 1.0 );

        this._w = 0.25 / s;
        this._x = ( m32 - m23 ) * s;
        this._y = ( m13 - m31 ) * s;
        this._z = ( m21 - m12 ) * s;

    } else if ( m11 > m22 && m11 > m33 ) {

        const s = 2.0 * Math.sqrt( 1.0 + m11 - m22 - m33 );

        this._w = ( m32 - m23 ) / s;
        this._x = 0.25 * s;
        this._y = ( m12 + m21 ) / s;
        this._z = ( m13 + m31 ) / s;

    } else if ( m22 > m33 ) {

        const s = 2.0 * Math.sqrt( 1.0 + m22 - m11 - m33 );

        this._w = ( m13 - m31 ) / s;
        this._x = ( m12 + m21 ) / s;
        this._y = 0.25 * s;
        this._z = ( m23 + m32 ) / s;

    } else {

        const s = 2.0 * Math.sqrt( 1.0 + m33 - m11 - m22 );

        this._w = ( m21 - m12 ) / s;
        this._x = ( m13 + m31 ) / s;
        this._y = ( m23 + m32 ) / s;
        this._z = 0.25 * s;

    }

    this._onChangeCallback();

    return this;

}
```

## 2、setFromEuler
从欧拉角设置四元数
```js
/**
 * 从欧拉角设置四元数
 *
 * @param euler 欧拉角对象，包含x、y、z和order属性
 * @param update 是否触发onChangeCallback回调，默认为true
 * @returns 返回当前四元数对象
 */
setFromEuler( euler, update = true ) {

    const x = euler._x, y = euler._y, z = euler._z, order = euler._order;

    // http://www.mathworks.com/matlabcentral/fileexchange/
    // 	20696-function-to-convert-between-dcm-euler-angles-quaternions-and-euler-vectors/
    //	content/SpinCalc.m

    const cos = Math.cos;
    const sin = Math.sin;

    const c1 = cos( x / 2 );
    const c2 = cos( y / 2 );
    const c3 = cos( z / 2 );

    const s1 = sin( x / 2 );
    const s2 = sin( y / 2 );
    const s3 = sin( z / 2 );

    switch ( order ) {

        case 'XYZ':
            this._x = s1 * c2 * c3 + c1 * s2 * s3;
            this._y = c1 * s2 * c3 - s1 * c2 * s3;
            this._z = c1 * c2 * s3 + s1 * s2 * c3;
            this._w = c1 * c2 * c3 - s1 * s2 * s3;
            break;

        case 'YXZ':
            this._x = s1 * c2 * c3 + c1 * s2 * s3;
            this._y = c1 * s2 * c3 - s1 * c2 * s3;
            this._z = c1 * c2 * s3 - s1 * s2 * c3;
            this._w = c1 * c2 * c3 + s1 * s2 * s3;
            break;

        case 'ZXY':
            this._x = s1 * c2 * c3 - c1 * s2 * s3;
            this._y = c1 * s2 * c3 + s1 * c2 * s3;
            this._z = c1 * c2 * s3 + s1 * s2 * c3;
            this._w = c1 * c2 * c3 - s1 * s2 * s3;
            break;

        case 'ZYX':
            this._x = s1 * c2 * c3 - c1 * s2 * s3;
            this._y = c1 * s2 * c3 + s1 * c2 * s3;
            this._z = c1 * c2 * s3 - s1 * s2 * c3;
            this._w = c1 * c2 * c3 + s1 * s2 * s3;
            break;

        case 'YZX':
            this._x = s1 * c2 * c3 + c1 * s2 * s3;
            this._y = c1 * s2 * c3 + s1 * c2 * s3;
            this._z = c1 * c2 * s3 - s1 * s2 * c3;
            this._w = c1 * c2 * c3 - s1 * s2 * s3;
            break;

        case 'XZY':
            this._x = s1 * c2 * c3 - c1 * s2 * s3;
            this._y = c1 * s2 * c3 - s1 * c2 * s3;
            this._z = c1 * c2 * s3 + s1 * s2 * c3;
            this._w = c1 * c2 * c3 + s1 * s2 * s3;
            break;

        default:
            console.warn( 'THREE.Quaternion: .setFromEuler() encountered an unknown order: ' + order );

    }

    if ( update === true ) this._onChangeCallback();

    return this;

}
```
## 3、setFromAxisAngle
从轴和角度设置四元数
```js

	/**
	 * 从轴和角度设置四元数
	 *
	 * @param {Vector3} axis 旋转轴，假设已经单位化
	 * @param {number} angle 旋转角度，单位为弧度
	 * @returns {Object} 当前对象
	 */
	setFromAxisAngle( axis, angle ) {

		// http://www.euclideanspace.com/maths/geometry/rotations/conversions/angleToQuaternion/index.htm

		// assumes axis is normalized

		const halfAngle = angle / 2, s = Math.sin( halfAngle );

		this._x = axis.x * s;
		this._y = axis.y * s;
		this._z = axis.z * s;
		this._w = Math.cos( halfAngle );

		this._onChangeCallback();

		return this;

	}
```


<Valine></Valine>