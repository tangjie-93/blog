---
title: 15、源码解析之Euler
date: '2024-07-16'
lastmodifydate: '2024-07-16'
type: 技术
tags: threejs
note: 源码解析之Euler
---

## 1、setFromRotationMatrix
```js
/**
 * 从旋转矩阵中设置欧拉角
 *
 * @param m 旋转矩阵
 * @param order 旋转顺序，默认为 this._order
 * @param update 是否触发 onChange 回调，默认为 true
 * @returns 当前对象
 */
setFromRotationMatrix( m, order = this._order, update = true ) {

    // assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

    const te = m.elements;
    const m11 = te[ 0 ], m12 = te[ 4 ], m13 = te[ 8 ];
    const m21 = te[ 1 ], m22 = te[ 5 ], m23 = te[ 9 ];
    const m31 = te[ 2 ], m32 = te[ 6 ], m33 = te[ 10 ];

    switch ( order ) {

        case 'XYZ':

            this._y = Math.asin( clamp( m13, - 1, 1 ) );

            if ( Math.abs( m13 ) < 0.9999999 ) {

                this._x = Math.atan2( - m23, m33 );
                this._z = Math.atan2( - m12, m11 );

            } else {

                this._x = Math.atan2( m32, m22 );
                this._z = 0;

            }

            break;

        case 'YXZ':

            this._x = Math.asin( - clamp( m23, - 1, 1 ) );

            if ( Math.abs( m23 ) < 0.9999999 ) {

                this._y = Math.atan2( m13, m33 );
                this._z = Math.atan2( m21, m22 );

            } else {

                this._y = Math.atan2( - m31, m11 );
                this._z = 0;

            }

            break;

        case 'ZXY':

            this._x = Math.asin( clamp( m32, - 1, 1 ) );

            if ( Math.abs( m32 ) < 0.9999999 ) {

                this._y = Math.atan2( - m31, m33 );
                this._z = Math.atan2( - m12, m22 );

            } else {

                this._y = 0;
                this._z = Math.atan2( m21, m11 );

            }

            break;

        case 'ZYX':

            this._y = Math.asin( - clamp( m31, - 1, 1 ) );

            if ( Math.abs( m31 ) < 0.9999999 ) {

                this._x = Math.atan2( m32, m33 );
                this._z = Math.atan2( m21, m11 );

            } else {

                this._x = 0;
                this._z = Math.atan2( - m12, m22 );

            }

            break;

        case 'YZX':

            this._z = Math.asin( clamp( m21, - 1, 1 ) );

            if ( Math.abs( m21 ) < 0.9999999 ) {

                this._x = Math.atan2( - m23, m22 );
                this._y = Math.atan2( - m31, m11 );

            } else {

                this._x = 0;
                this._y = Math.atan2( m13, m33 );

            }

            break;

        case 'XZY':

            this._z = Math.asin( - clamp( m12, - 1, 1 ) );

            if ( Math.abs( m12 ) < 0.9999999 ) {

                this._x = Math.atan2( m32, m22 );
                this._y = Math.atan2( m13, m11 );

            } else {

                this._x = Math.atan2( - m23, m33 );
                this._y = 0;

            }

            break;

        default:

            console.warn( 'THREE.Euler: .setFromRotationMatrix() encountered an unknown order: ' + order );

    }

    this._order = order;

    if ( update === true ) this._onChangeCallback();

    return this;

}
```
## 2、setFromQuaternion
```js
/**
 * 通过四元数设置对象的旋转。
 *
 * @param q 四元数对象，表示旋转。
 * @param order 旋转顺序，默认为'XYZ'。
 * @param update 是否更新对象的矩阵自动，默认为true。
 * @returns 返回当前对象。
 */
setFromQuaternion( q, order, update ) {

    _matrix.makeRotationFromQuaternion( q );

    return this.setFromRotationMatrix( _matrix, order, update );

}
```

<Valine></Valine>