---
title: react之hook总结
date: '2020-07-06'
type: 技术
tags: react
note: react之hook总结
---
## 1、HOOk是什么?
`Hook` 是一些可以让你在函数组件里“钩入” `React state` 及生命周期等特性的函数。它不能在 `class` 组件中使用。
`Hook`是特殊的函数，可以让我们在不编写 `class` 的情况下使用 `state` 以及其他的 `React` 特性。

## 2、Hook的优点
+ `Hook` 可以使我们在无需改变组件结构的情况下**复用状态逻辑**。可以使用 `hook` 在组件中提取状态逻辑，使得这些逻辑可以单独测试并复用。
+ `Hook` 将组件中相互关联的部分拆分成更小的函数(比如订阅或请求数据),而并非强制按照生命周期划分。使得组件变得易于理解。
+ `Hook` 使得我们在非 `class` 的情况下可以使用更多的 `React` 特性。（class不能很好的被压缩，而且会使热重载出现不稳定的情况）。
+ `Hook`和现有代码可以同时工作，你可以渐进式的使用他们。（`Hook` 是向下兼容的）。
+ `Hook` 是一种复用状态逻辑的方式，它不复用 `state` 本身。事实上 `Hook` 的每次调用都有一个完全独立的 `state` —— 因此你可以在单个组件中多次调用同一个自定义 `Hook`。
## 3、Hook使用规则
+ 只能在函数最外层调用 `Hook`。不要在循环、条件判断或者子函数中调用。
遵守这条规则，你就能确保 `Hook` 在**每一次渲染中都按照同样的顺序被调用**。
+ 只能在 `React` 的函数组件中调用 `Hook`。
  + 不要在其他 JavaScript 函数中调用。
  + 可以在自定义的 `Hook` 中 调用其他 `Hook`)
+ 自定义  `Hook` 以 `use` 开头。是一个函数,函数内部可以调用其他的 `Hook`。
如果自定义 `Hook` 不遵循以 `use` 开头的话，由于无法判断某个函数是否包含对其内部 `Hook `的调用,`React` 将无法自动检查你的 `Hook` 是否违反了 `Hook` 的规则。
## 3、常用 Hook 介绍
#### 1、useState
`useState` 会返回一对值：当前状态(`state`)和一个让你更新它的函数，你可以在事件处理函数中或其他一些地方调用这个函数。这里的 `state` 不一定要是一个对象，同时这个初始 `state` 参数只在第一次渲染时会被用到。可以在一个组件中多次使用 `useState`。
```js
import React, { useState } from 'react';
function Example() {
  // 声明一个叫 “count” 的 state 变量。
  const [count, setCount] = useState(0);
  const [fruit, setFruit] = useState('banana');
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```
#### 2、useEffect
在 `React` 组件中执行过**数据获取、订阅或者手动修改过 `DOM`**。我们统一把这些操作称为**副作用**，或者简称为“作用”。
`useEffect` 就是一个 `Effect Hook`，给函数组件增加了操作副作用的能力。它跟 `class` 组件中的 `componentDidMount`、`componentDidUpdate` 和 `componentWillUnmount `具有相同的用途，只不过被合并成了一个 `API`。默认情况下，`React` 会在每次渲染后调用副作用函数 —— 包括第一次渲染的时候。跟 `useState` 一样，你可以在组件中多次使用 `useEffect` 。
```js
import React, { useState, useEffect } from 'react';
function Example() {
  const [count, setCount] = useState(0);
  // 相当于 componentDidMount 和 componentDidUpdate:
  useEffect(() => {
    // 使用浏览器的 API 更新页面标题
    document.title = `You clicked ${count} times`;
  });
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```
但我们**订阅外部数据源时**,这时候的副作用使需要清除的。
```js
 const [ignore,dispatch]=useReducer();
 useEffect(() => {
    const unsubscrite=()=>{
      dispatch()
    }
    return ()=>{
      unsubscrite()
    }
  });
```
可以给 `useEffect`设置第二个参数,参数类型是数组,只有当第二个参数变化时，才会执行第一个参数里面的内容。
```js
useEffect(() => {
    // 使用浏览器的 API 更新页面标题
    document.title = `You clicked ${count} times`;
},[count]);
```
#### 3、useContext

接收一个 `context` 对象（`React.createContext` 的返回值）并返回该 `context` 的当前值。**当前的 `context` 值由上层组件中距离当前组件最近的 `<MyContext.Provider>`** 的 `value prop` 决定。调用了 `useContext` 的组件总会在 `context` 值变化时重新渲染。
```js
const value = useContext(MyContext);
```
**注意：** 
+ `useContext(MyContext)` 相当于 `class` 组件中的 `static contextType = MyContext` 或者 `<MyContext.Consumer>`。
+ 需要在上层组件树中使用 `<MyContext.Provider>` 来为下层组件提供 `context`。

#### 4、useLayoutEffect

#### 5、useReducer
`useState` 的替代方案。它接收一个形如 `(state, action) => newState` 的 `reducer`，并返回当前的 `state` 以及与其配套的 `dispatch` 方法。
```js
const [state, dispatch]=useReducer(reducer, initialState)
//内部实现
function useReducer(reducer, initialState) {
  const [state, setState] = useState(initialState);
  function dispatch(action) {
    const nextState = reducer(state, action);
    setState(nextState);
  }
  return [state, dispatch];
}
```
**初始化的两种方式**
+ 指定初始 `state`
```js
const [state, dispatch] = useReducer(
  reducer,
  {count: initialCount}
);
```
+ 惰性初始化
初始 `state` 将被设置为 `init(initialArg)`。
```js
const [state, dispatch] = useReducer(reducer, initialCount, init);
function init(initialCount) {
  return {count: initialCount};
}
```
#### 6、useCallBack
把内联回调函数及依赖项数组作为参数传入 `useCallback`，它将返回该回调函数的 `memoized` 版本，该回调函数仅在某个依赖项改变时才会更新。`useCallback(fn, deps)` 相当于 `useMemo(() => fn, deps)`。
**注意:** 依赖项数组不会作为参数传给回调函数。
```js
const memoizedCallback = useCallback(
  () => {
    doSomething(a, b);
  },
  [a, b],
);
```

#### 7、useMemo
把“创建”函数和依赖项数组作为参数传入 `useMemo`，它仅会在某个依赖项改变时才重新计算 `memoized` 值。不要在这个函数内部执行与渲染无关的操作，诸如副作用这类的操作。
**注意：**依赖项数组不会作为参数传给“创建”函数。如果没有提供依赖项数组，`useMemo` 在每次渲染时都会计算新的值。
```js
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
```

#### 8、useRef
`useRef` 返回一个可变的 `ref` 对象，其 `.current` 属性被初始化为传入的参数（`initialValue`）。`useRef` 会在每次渲染时返回同一个 `ref` 对象。

**注意：** 当 `ref` 对象内容发生变化时，`useRef` 并不会通知你。变更 `.current `属性不会引发组件重新渲染。如果想要在 `React` 绑定或解绑 `DOM `节点的 `ref` 时运行某些代码，则需要使用回调 `ref` 来实现。
```js
const refContainer = useRef(initialValue);
```
#### 9、useLayoutEffect
它会在所有的 `DOM` 变更之后同步调用 `effect`。可以使用它来读取 `DOM` 布局并同步触发重渲染。在浏览器执行绘制之前，`useLayoutEffect` 内部的更新计划将被同步刷新。
