---
title: react基本知识点总结
date: '2020-07-05'
type: 技术
tags: react
note: react基本知识点总结
---

## Context-组件跨层级通信
`Context` 设计的目的是为了共享那些对于一个组件而言是 全局的数据。主要有以下 `API`。

#### 1 `React.createContext`
创建一个 `Context` 对象。当 `React` 渲染一个订阅了这个 Context 对象的组件，这个组件会从组件树中离自身最近的那个匹配的 `Provider` 中读取到当前的 `context` 值。
```jsx
import React from "react"
export const ColorContext=React.createContext({color:'red'}) 
export const ColorProvider=ColorContext.Provider;
export const ColorConsumer=ColorContext.Consumer;

export const UserContext=React.createContext();
export const UserProvider=UserContext.Provider;
export const UserConsumer=UserContext.Consumer; 
```
**只有** 当组件所处的树中没有匹配到 `Provider` 时，其 `defaultValue` 参数才会生效。**将 `undefined` 传递给 `Provider` 的 `value` 时，消费组件的 `defaultValue` 不会生效。**
#### 2 `Context.Provider`
`Provider` 接收一个 `value` 属性，传递给消费组件。一个 `Provider` 可以和多个消费组件有对应关系。多个 `Provider` 也可以嵌套使用，里层的会覆盖外层的数据。
当 `Provider` 的 `value` 值发生变化时，它内部的所有消费组件都会重新渲染。`Provider` 及其内部 `consumer` 组件都不受制于 `shouldComponentUpdate` 函数，因此当 `consumer` 组件在其祖先组件退出更新的情况下也能更新。
```js
import React, { Component } from "react"
import { ColorProvider, UserProvider } from '../context'
export default class Color extends Component {
    constructor (props) {
        super(props)
        this.state = {
            theme: {
                color: 'blue'
            }, userInfo: {
                name: 'james',
                age: 18
            }

        }
    }
    render () {
        const { theme, userInfo } = this.state;
        return (
            <div>
                <ColorProvider value={theme}>
                    <UserProvider value={userInfo}>
                    </UserProvider>
                </ColorProvider>
            </div>
        )
    }
}
```
#### 3 `Class.contextType`
挂载在 `class` 上的静态属性 `contextType` 属性会被重赋值为一个由 `React.createContext()` 创建的 `Context` 对象。这能让你使用 `this.context` 来消费最近 `Context` 上的那个值。
**注意:** 一定要将使用当前组件包裹在 `<MyContext.Provider>` ,不然`context value` 不会被更新。
```js
import React, { Component } from 'react'
import {ColorContext} from "../context/index"
export default class ContextTypePage extends Component{
    static contextType=ColorContext
    render(){
        const {color} =this.context;
        return(
            <div className="border">
                <h3 className={color}>ContextTypePage</h3>
            </div>
        )
    }
}
```
#### 4 `Context.Consumer`
这需要函数作为子元素`（function as a child）`这种做法。这个函数接收当前的 `context` 值，返回一个 `React` 节点。传递给函数的 `value` 值等同于往上组件树离这个 `context` 最近的 `Provider` 提供的 `value` 值。如果没有对应的 `Provider`，`value` 参数等同于传递给 `createContext()` 的 `defaultValue`。
```js
import React, { Component } from "react"
import { ColorConsumer, UserConsumer } from '../context';
export default class ColorConsumerPage extends Component {
    render () {
        return (
            <div>
                <ColorConsumer>
                    {context => (
                        <UserConsumer>
                            {userInfo => (
                                <div className={context.color}>
                                    <p>{userInfo.name}</p>
                                    <p>{userInfo.age}</p>
                                </div>
                            )}
                        </UserConsumer>
                    )}
                </ColorConsumer>
            </div>
        )
    }
}>

```

#### 5 `Context.displayName`
`context` 对象接受一个名为 `displayName` 的 `property`，类型为字符串。`React DevTools` 使用该字符串来确定 `context` 要显示的内容。

#### 6 `useContext()`
除了以上 `api`列举的在子组件中获取父组件状态 `2` 种方法外，还有一种方式 `useContext`。该方法是 `Hook` 方法，不属于 `Context` 的 `api`。
当前的 context 值由上层组件中距离当前组件最近的 <MyContext.Provider> 的 value prop 决定。
当组件上层最近的 `<MyContext.Provider>` 更新时，该 `Hook` 会触发重渲染，并使用最新传递给 `MyContext provider` 的 `context value` 值。
**注意:** 一定要将使用当前组件包裹在 `<MyContext.Provider>` ,不然`context value` 不会被更新。
```js
const context = useContext(MyContext);
```

[完整的跨层级demo地址](https://github.com/tangjie-93/react/tree/master/context-demo)
