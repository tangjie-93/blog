# vuex的常用api及内部原理

**1、什么是vuex?**<br>
&#8195;&#8195;Vuex是一个专门为Vue.js一个用程序开发的`状态管理模式`。将不同组件的共享状态抽取出来，以一个全局单例管理模式来管理，利用Vue.js的细粒度数据响应机制来进行高效的状态更新。<br>
&#8195;&#8195;优势：`通过定义和隔离状态管理中的各种概念并通过强制规则来维护视图和状态间的独立性，使得代码变得更结构化并且易于维护。`<br>
&#8195;&#8195;用一张官网的图可以很好的描述Vuex的状态管理模式。
<img src="../../images/vuex.png" alt="暂无图片" style="display:block;width:50%;margin:0 auto">

**2、核心概念**
+ **1、state<br>**
&#8195;&#8195;驱动应用的数据源。在组件中通过`this.$store.state.list`来访问这些state。
+ **2、Getter<br>**
&#8195;&#8195;可以认为是store的计算属性，getter额返回值会根据它的依赖被缓存起来，且只有当它的依赖值发生了变化才会被重新计算。在vue组件中，通过`this.$store.getters.doneTodos`访问这些值

```javascript
    const store=new Vuex.Store({
        state:{
            todos:[
                {
                    id:1,text:"fss"
                },
                {
                    id:2,:text:"344"
                }
            ]
        },
        getters:{
            1、通过属性访问
            //接受state作为其第一个参数
            doneTodos:state=>{
                return state.todos.filter(todo=>todo.text.includes("fs"))
                //以属性的形式访问这些值this.$store.getters.doneTodos
            }
            //接受其他getter作为第二个参数
            doneTodosCount: (state, getters) => {
                return getters.doneTodos.length
            }
            2、通过方法访问
            getTodoById: (state) => (id) => {
                return state.todos.find(todo => todo.id === id)
                //在组件中调用this.$store.getters.getTodoById(2) 
            }
        },
    })
```
&#8195;&#8195;可以使用`store.getter`来获取store中的getter属性，也可以使用mapGetters辅助函数来将store中的getter映射到局部计算属性。
```javascript
    import {mapGetters} from "vuex"
    export default{
        ...
        computed:{
            //使用对象展开运算符将getter混入到computed对象中
            ...mapGetters([
                "doneTodos","doneTodosCount"
            ])
            //也可以将一个getter属性另取一个名字
            mapGetters({
                // 把 `this.doneCount` 映射为 `this.$store.getters.doneTodosCount`
                doneCount: 'doneTodosCount'
            })
        }
    }
```
+ **3、Mutation<br>**
&#8195;&#8195;更改store中状态的唯一方法就是提交mutations。
```javascript
    ...
    mutations:{
        1、提交载荷（Payload）
        increment(state,n){
            state.count=n;
            //在组件中调用this.$store.commit("increment",10)
        }

        increment(state,obj){
            state.count=obj.count;
            //在组件中调用 store.commit('increment', {count: 10})
            //在组件中调用 store.commit({type:'increment', count: 10})
        }
    }
```
&#8195;&#8195;因为Vuex中的store的状态是响应式的，那么当我们变更状态时，监视状态的Vue组件也会相应更新。那么同样意味着Vuex中的mutation也需要和Vue一样，遵守以下注意事项。
```javascript
1、在store的state中初始化好所有所需属性
2、在对象在上添加属性时，应该使用
    this.$set(this.obj,"key",123),
    或者用新对象替换老对象
    state.obj={...state.obj,key:123}
3、mutation必须是同步函数。因为任何在回调函数中进行的状态的改变是不可追踪的。

```
&#8195;&#8195;在组件中提交Mutation的几种方法。
```javascript
export default {
    // ...
    methods: {
        ...mapMutations([
            'increment', 
            // 将 `this.increment()` 映射为 `this.$store.commit('increment')`
            'incrementBy' 
            // `mapMutations` 也支持载荷：
            // 将 `this.incrementBy(amount)` 映射为 `this.$store.commit('incrementBy', amount)`
        ]),
        ...mapMutations({
            add: 'increment' 
            // 将 `this.add()` 映射为 `this.$store.commit('increment')`
        })
    }
}
```

+ **4、Action<br>**
&#8195;**1、Action类似于mutation，他们的不同点在于：**<br>
&#8195;&#8195;`1）Action提交的是mutation，而不是直接改变状态。`<br>
&#8195;&#8195;`2）Action可以包含任何异步操作`。
```javascript
    const store = new Vuex.Store({
        state: {
            count: 0
        },
        mutations: {
            increment (state) {
                state.count++
            }
        },
        actions: {
            increment (context) {
                //context是与store实例就有相同方法和属性的对象
                context.commit('increment')
            }
            //或者通过解构赋值来简化代码
            increment({commit}){
                commit('increment')
            },
            //异步操作
            incrementAsync ({ commit }) {
                setTimeout(() => {
                commit('increment')
                }, 1000)
            }

        }
    })
```
&#8195;&#8195;**2、在组件中分发Action** <br>
&#8195;&#8195;可以在组件中使用`this.$store.dispatch("xxx")`分发action，或者使用mapActions辅助函数来将组件的methods映射为store.dispatch(需要在根节点注入store)。
```javascript
    import { mapActions } from 'vuex'
    export default {
    // ...
    methods: {
        ...mapActions([
            'increment', 
            // 将 `this.increment()` 映射为 `this.$store.dispatch('increment')`
            'incrementBy' 
            // `mapActions` 也支持载荷：
            // 将 `this.incrementBy(amount)` 映射为 `this.$store.dispatch('incrementBy', amount)`
        ]),
        ...mapActions({
            add: 'increment' 
            // 将 `this.add()` 映射为 `this.$store.dispatch('increment')`
        })
    }
    }
```
&#8195;&#8195;**3、组合Action** <br>
```javascript
    actions: {
        actionA ({ commit }) {
            return new Promise((resolve, reject) => {
            setTimeout(() => {
                commit('someMutation')
                resolve()
            }, 1000)
            })
        },
        // ...
        actionB ({ dispatch, commit }) {
            return dispatch('actionA').then(() => {
                commit('someOtherMutation')
            })
        }
    }
    //调用
    store.dispatch('actionA').then(() => {
        // ...
    })
    //或者利用async/await
    // getData() 和 getOtherData() 返回的是 Promise

    actions: {
        async actionA ({ commit }) {
            commit('gotData', await getData())
        },
        async actionB ({ dispatch, commit }) {
            await dispatch('actionA') // 等待 actionA 完成
            commit('gotOtherData', await getOtherData())
        }
    }
```
+ **5、Module**<br>
&#8195;&#8195;Vuex允许我们将store分割成多个模块。每个模块都有自己的state、mutation、action和getter。
```javascript
    const moduleA = {
        state: { ... },
        mutations: { ... },
        actions: { ... },
        getters: { ... }
    }

    const moduleB = {
        state: { ... },
        mutations: { ... },
        actions: { ... }
    }

    const store = new Vuex.Store({
        modules: {
            a: moduleA,
            b: moduleB
        }
    })

    store.state.a // -> moduleA 的状态
    store.state.b // -> moduleB 的状态
```
&#8195;&#8195;**1、模块的局部状态**<br>
&#8195;&#8195;对于模块内部的mutation和getter，接收的第一个参数是模块的局部状态对象。<br>
&#8195;&#8195;对于模块内部的action，局部状态通过context.state暴露出来，根节点(`store实例中的state、getter等属性`)状态则为context.rootState。
```javascript
    const moduleA = {
        // ...
        actions: {
            increment ({ state, commit, rootState }) {
                if ((state.count + rootState.count) % 2 === 1) {
                    commit('increment')
                }
            }
        }
    }
```
&#8195;&#8195;对于模块内部的 getter，根节点状态会作为第三个参数暴露出来：
```javascript
    const moduleA = {
        // ...
        getters: {
            sumWithRootCount (state, getters, rootState) {
                return state.count + rootState.count
            }
        }
    }
```


