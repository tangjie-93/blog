---
title: 1.vue3响应式源码之ref.js源码分析
date: '2020-11-22'
type: 技术
tags: vue3
note: vue3响应式源码之ref.js源码分析
---
&#8195;&#8195;下面主要讲一下`vue3.x`中一些常用方法的实现。本文主要是基于`reactivity/src/ref.ts`的源码进行解读的。下面会将一些暴露到外面`api`的源码进行分析一下。
## 1、ref的实现
+ 在将`ref(val)`中的值**转换成响应式**的时候，要判断该值是否已经是响应式的了，如果已经是的话，就直接返回。
+ 如果传入的值不是一个对象，则直接返回原值。否则调用`reactive`方法将对象变成响应式对象。**响应式对象上有响应式的`value`属性**(通过`Object。defineProperty`来实现)。
+ 获取响应式对象的`value`属性时，会对该对象的`value`属性进行**依赖收集**。但是由于 **`ref`函数的创建过程中并没有调用`effect`函数**，所以在`track`函数中的`activeEffect`为`undefined`,会直接返回，所以并不会对`value`属性进行依赖收集。
+ 在该响应式对象的`value`属性被修改时，触发更新。
+ 在给`value`**设置值的时候，还要判断该值是否是对象**，如果是对象，需要对该对象进行响应式处理。
```js
function ref(value) {
    return createRef(value);
}
//创建ref对象
function createRef(rawValue, shallow) {
    //判断shallow是不是undefined
    if (shallow === void 0) { shallow = false; }
    //判断传入的值是否已经调用过ref方法了
    if (isRef(rawValue)) {
        return rawValue;
    }
    return new RefImpl(rawValue, shallow);
}

function isObject(val){
    return val!==null&&typeof val==='object';
}
//如果传入的值是对象，就将原始值转换成响应式的，否则不做任何处理
function convert(val) {
    return isObject(val) ? reactive_1.reactive(val) : val;
};
//作为构造函数使用
function RefImpl(_rawValue, _shallow) {
    //判断_shallow是否为undefined
    if (_shallow === void 0) { _shallow = false; }
    //原始值
    this._rawValue = _rawValue;
    this._shallow = _shallow;
    //用于表示_rawValue是否已经被创建成ref了
    this.__v_isRef = true;
    //转换后的最终的值
    this._value = _shallow ? _rawValue : convert(_rawValue);
}
Object.defineProperty(RefImpl.prototype, "value", {
    get: function () {
        //依赖收集 但是因为它不再effect中，所以不会对它进行依赖收集，调用track方法时，activeEffect为undefined
        effect_1.track(reactive_1.toRaw(this), operations_1.TrackOpTypes.GET, 'value');
        return this._value;
    },
    set: function (newVal) {
        //判断原来的值跟现在的值是否一样
        if (shared_1.hasChanged(reactive_1.toRaw(newVal), this._rawValue)) {
            this._rawValue = newVal;
            //判断值是否是对象，是的话，需要进行响应式处理
            this._value = this._shallow ? newVal : convert(newVal);
            effect_1.trigger(reactive_1.toRaw(this), operations_1.TriggerOpTypes.SET, 'value', newVal);
        }
    },
    enumerable: true,//可被遍历 默认是false
    configurable: true//可被修改 默认是false
});
```
`ref`的用法`demo`
```js
const foo=ref({
    a:123
})
//是一个RefImpl 的实例对象
console.log("foo",foo);//foo RefImpl {_rawValue: {…}, _shallow: false, __v_isRef: true, _value: Proxy}
//是一个调用reactive后的代理对象
console.log("foo.value",foo.value);//Proxy {a: 123}
//foo.value变成了响应式对象
console.log(isReactive(foo.value));//true
```

## 2、isRef
&#8195;&#8195;用于判断是否是响应式的。因为将数据转换成响应式时，会给响应对象添加一个`__v_isRef`的属性，并设值为`true`。
```js
function isRef(r) {
    return Boolean(r && r.__v_isRef === true);
}
```

## 3、shallowRef
&#8195;&#8195;该方法也是创建一个`ref`,但是在创建的过程中不会调用`reactive`方法将值转换成响应式对象。对它转换后的`value`值也不会做响应式代理。
该方法本质上就是给**传入的对象**添加一些属性，并对它的`value`属性进行劫持。
```js
function shallowRef(value) {
    return createRef(value, true);
}
```

## 4、unref
&#8195;&#8195;如果他本身是一个`ref`对象，则获取`ref`对象的`value`属性对应的值（是一个代理对象），否则返回它自身。所以此时该对象也不是`ref`对象了。
```js
function unref(ref) {
    return isRef(ref) ? ref.value : ref;
}
//demo
const foo=ref({
    name:"james"
})
console.log(foo);
// __v_isRef: true
// _rawValue: {name: "james"}
// _shallow: false
// _value: Proxy {name: "james"}
// value: Proxy
console.log(unref(foo));//=>Proxy {name: "james"}
```
## 5、proxyRefs
&#8195;&#8195;对`ref`对象进行代理。如果该对象不是响应式的,将不会对它进行依赖收集和触发更新操作。
```js
var shallowUnwrapHandlers = {
    get: function (target, key, receiver) { return unref(Reflect.get(target, key, receiver)); },
    set: function (target, key, value, receiver) {
        var oldValue = target[key];
        if (isRef(oldValue) && !isRef(value)) {
            oldValue.value = value;
            return true;
        }
        else {
            return Reflect.set(target, key, value, receiver);
        }
    }
};
function proxyRefs(objectWithRefs) {
    return reactive_1.isReactive(objectWithRefs)
        ? objectWithRefs
        : new Proxy(objectWithRefs, shallowUnwrapHandlers);
}
```
## 6、customRef
&#8195;&#8195;`customRef` 用于自定义一个 `ref`，可以显式地控制依赖追踪和触发响应，接受一个工厂函数，两个参数分别是用于追踪的 `track` 与用于触发响应的 `trigger`，并返回一个带有 `get` 和 `set` 属性的对象。官网上有一个用它来实现[防抖的例子](https://composition-api.vuejs.org/zh/api.html#customref)。
```js
//以下是该函数的定义
function customRef<T>(factory: CustomRefFactory<T>): Ref<T>
type CustomRefFactory<T> = (
  track: () => void,
  trigger: () => void
) => {
  get: () => T
  set: (value: T) => void
}
```
## 7、toRefs
&#8195;&#8195;将响应式对象转换成ref对象
```js
//将响应式对象转换成ref对象
function toRefs(object) {
    if ( !isProxy(object)) {
        console.warn(`toRefs() expects a reactive object but received a plain one.`);
    }
    const ret = shared.isArray(object) ? new Array(object.length) : {};
    for (const key in object) {
        ret[key] = toRef(object, key);
    }
    return ret;
}
```
## 8、toRef
&#8195;&#8195;将普通对象的转换成`ref`对象。可以用来为一个 reactive 对象的属性创建一个 ref。这个 ref 可以被传递并且能够保持响应性。
```js
class ObjectRefImpl {
    constructor(_object, _key) {
        this._object = _object;
        this._key = _key;
        this.__v_isRef = true;
    }
    get value() {
        return this._object[this._key];
    }
    set value(newVal) {
        this._object[this._key] = newVal;
    }
}
function toRef(object, key) {
    return isRef(object[key])
        ? object[key]
        : new ObjectRefImpl(object, key);
}
```
```js
//例子
const state = reactive({
  foo: 1,
  bar: 2,
})
const fooRef = toRef(state, 'foo')
fooRef.value++
console.log(state.foo) // 2
state.foo++
console.log(fooRef.value) // 3
```
