---
title: vue常见知识点总结
date: '2020-01-14'
type: 技术
tags: vue
note: vue常见知识点总结
---

&#8195;&#8195;平时在项目开发过程中会用到一些知识点，自己觉得有些用，便整理下来供以后自己去回顾。


## 1、混入（mixins）
&#8195;&#8195;混入 (mixins) 是一种分发 Vue 组件中可复用功能的非常灵活的方式。混入对象可以包含任意组件选项。当组件使用混入对象时，所有混入对象的选项将被混入该组件本身的选项。

例子：定义一个混入
```js
var myMixin = {
    data: function () {
        return {
            message: 'hello',
            foo: 'abc'
        }
    },
    created: function () {
        this.hello()
    },
    methods: {
        hello: function () {
            console.log('hello from mixin!')
        },
        getName:function(name){
            console.log("我在迷信中名字是："+name);
        },
        getAge:function(age){
            console.log("我今年"+age+"岁了")
        }
    }
}  
//在vue中进行使用
var vm=new Vue({
    mixins: [myMixin],
    data: function () {
    return {
        message: 'goodbye',
        bar: 'def'
    }
    },
    created: function () {
        console.log("created:"+JSON.stringify(this.$data))
    },
    methods:{
        getName:function(name){
            console.log("我在vue中的名字为:"+name);
        }
    }
})
```
&#8195;&#8195;**同名钩子函数将混合为一个数组**，因此都将被调用。另外，**混合对象的钩子将在组件自身钩子之前调用**。因而在钩子函数created()中的输出为：
```js      
'created:hello from mixin!'   //第一行；    
'created:{ "message": "goodbye", "foo": "abc", "bar": "def" }'  //第二行；
```
 &#8195;&#8195; 在值为对象的这些Vue属性中，例如 methods, components 和 directives，将被混合为同一个对象。**当mixin对象和Vue实例两个对象中键名冲突时，取Vue实例对象的键值对。** 因此在调用methods中的方法时。**会将Vue实例中没有的，mixin中有的添加到Vue实例中去。**
```js        
vm.getName("黎明")；//我在vue中的名字为：黎明。  
vm.getAge(20);//我今年20岁了。  
```
  &#8195;&#8195; mixin有点跟jQuery中的$.extend()和es6的object.assign()方法在功能上有些相似。

## 2、Vue.nextTick()

&#8195;&#8195;在下次 DOM 更新循环结束之后执行延迟回调。在修改数据之后立即使用这个方法，获取更新后的 DOM。<br>   
&#8195;&#8195;在项目开发过程中遇到dom元素被隐藏或显示等**元素状态发生改变**时，最好是使用nextTick()方法，不然可能不能正常获取dom元素的属性信息。
```js            
new Vue({
    el: '.app',
    data: {
    msg: 'Hello Vue.',
    isShow:false
    },
    methods: {
    changeState() {
        this.isShow = !this.isShow;
        this.$nextTick(() => {
        //this.isShow改变后,导致dom树被更新后要执行的代码
        })
    }
    }
})
```
## 3、Vue.set( target, key, value )

>target：要更改的数据源(可以是对象或者数组)<br>
key：要更改的具体数据<br>
value ：重新赋的值<br>


&#8195;&#8195;向响应式对象中添加一个属性，并确保这个新属性同样是响应式的，且触发视图更新。它必须用于向响应式对象上添加新属性，因为  **Vue 无法探测普通的新增属性** 。比如下面的例子
```js
this.myObject.newProperty = 'hi'
```
例子如下：          

```js           
<div id="app">
    <input v-model="arr[0].name" />
    <ul>
        <li v-for="(item,index) in arr" :key="index">
            {{index}}——{{item.name}}
        </li>
    </ul>
    <button @click="changeArr">使用传统js方法修改数组</button>
    <button@click="changeArrBySet">使用Vue.set方法修改数组</button>
</div>
<script type="text/javascript">
    window.onload=function(){
        new Vue({
            el:"#app",
            data:{
                arr:[{name:"张三",age:20},{name:"李四",age:26},{name:"王五",age:20}]
            },
            methods:{
                changeArr(){
                    this.arr[0]={name:"张大",age:40};
                    console.log("使用传统js方法修改数组");
                },
                changeArrBySet(){
                    this.$set(this.arr,0,{name:"张大",age:40});
                    console.log("使用传统js方法修改数组");
                }
            }
        })
    }
</script>
```

&#8195;&#8195;从上面的输出结果我们可以看出，我们调用使用`this.arr[0]={name:"张大",age:40};`来修改数据元素时并没有改变视图中的元素。
而我们通过使用`this.$set(this.arr,0,{name:"张大",age:40});`能够实时修改视图元素。   

&#8195;&#8195;总结：通过数组的变异方法（Vue数组变异方法）我们可以动态控制数据的增减，但是我们却无法做到对某一条数据的修改，**修改数据我们可以使用Vue.set()方法。**

## 4、Vue.extend()
  
&#8195;&#8195;使用基础 Vue 构造器，创建一个“子类”。参数是一个包含组件选项的对象。data 选项是特例，需要注意 - 在 Vue.extend() 中它必须是函数。<br>
&#8195;&#8195;这里就我个人理解其实就是在定义组件，支持我们在框架中是直接定义.vue文件。使用这种情况比较多的是在页面中单独引入vue.js文件，然后在页面中定义组件用的。在框架中开发中这种全局方法用的比较少。    例子如下：      
```js
<div id="app">
    <todo :todo-data="dataList"></todo>
</div>
// 构建一个子组件
var todoItem = Vue.extend({
    template: ` <li> {{ text }} </li> `,
    props: {
        text: {
            type: String,
            default: ''
        }
    }
})
// 构建一个父组件
var todoWarp = Vue.extend({
    template: `
        <ul>
            <todo-item 
                v-for="(item, index) in todoData"
                v-text="item.text"
            ></todo-item>
        </ul>
    `,
    props: {
        todoData: {
            type: Array,
            default: []
        }
    },
    // 局部注册子组件
    components: {
        todoItem: todoItem
    }
})
// 注册到全局
Vue.component('todo', todoWarp)；

new Vue({
    el: '#app',
    data: {
        dataList: [
            { id: 0, text: '蔬菜' },
            { id: 1, text: '奶酪' },
            { id: 2, text: '随便其它什么人吃的东西' }
        ]
    }
}) 
```
&#8195;&#8195;**通过Vue.extend()方法构造的组件可以通过` Vue.component('todo', todoWarp)`注册到全局**，才可以在页面中使用该组件。也可以在组件构造器中来将通过Vue.extend()构造的组件进行局部注册，作为其他组件的子组件。

```js
components: {
    todoItem: todoItem
}
```

&#8195;&#8195;**Vue.extend()返回的是一个构造函数**，因此还可以这样使用。
```js           
<div id="mount-point"></div>
// 创建构造器
var Profile = Vue.extend({
    template: '<p>{{firstName}} {{lastName}} aka {{alias}}</p>',
    data: function () {
    return {
        firstName: 'Walter',
        lastName: 'White',
        alias: 'Heisenberg'
    }
    }
})
// 创建 Profile 实例，并挂载到一个元素上。
new Profile().$mount('#mount-point')

<div id="mount-point"></div>将会被渲染成<p>Walter White aka Heisenberg</p>
```
## 5、delimiters

&#8195;&#8195;delimiters的作用是改变我们插值的符号。Vue默认的插值是双大括号`{{}}`。但有时我们会有需求更改这个插值的形式。

```js           
delimiters:['${','}']
```
现在我们的插值形式就变成了${}。代替了{{ }}。

## 6、BEM设计模式

 &#8195;&#8195;BEM是 `(Block Element Modifier)` 的简称,翻译为块级元素修饰符。是由`Yandex`团队提出的一种前端命名方法论。这种巧妙的命名方法让你的CSS类对其他开发者来说更加透明而且更有意义。`BEM` 命名约定更加严格，而且包含更多的信息，它们用于一个团队开发一个耗时的大项目。

>B: 表示块，可以抽象成一个组件<br>
>E: 表示元素，组件下的一个元素，多个元素形成一个组件<br>
>M:表示修饰符，可以用来表示元素的状态，比如激活状态，颜色，大小<br>

>__主要用来表示块(B)和元素(E)间的连接。<br>
--用来表示块或者元素与状态的连接。

常见样式设置格式
>.button{} // 块  <br>
>.button__text{} //元素 <br>
>.button--primary{}//修饰符 

假如有如下代码，其class名称如下所示
```js
<div class="button button--primary">
    <span class="button__text">蓝色按钮</span>
</div>
<div class="button button--success">
    <span class="button__text">绿色按钮</span>
</div>
<div class="button button--warning">
    <span class="button__text">红色按钮</span>
</div>    
```

## 7、简单说一下vue2.X的响应式原理</h3>

vue在初始化数据时，会使用`Object.defineProperty`对`data`数据进行劫持，当页面使用对应属性时，首先会进行依赖收集（收集当前组件的`watcher`）,如果属性发生变化，会通知相关依赖进行更新操作（发布订阅）。

响应式系统简述:

+ 任何一个 `Vue Component` 都有一个与之对应的 `Watcher` 实例。
+ `Vue` 的 `data` 上的属性会被添加 `getter` 和 `setter` 属性。
+ 当 `Vue Component render` 函数被执行的时候, `data` 上会被 触碰(touch), 即被读, `getter` 方法会被调用, 此时 `Vue` 会去记录此 `Vue component` 所依赖的所有 `data`。(这一过程被称为依赖收集)
+ `data` 被改动时（主要是用户操作）, 即被写, `setter` 方法会被调用, 此时 `Vue` 会去通知所有依赖于此 `data` 的组件去调用他们的 `render` 函数进行更新。


## 8、简单说一下vue3.X的响应式原理</h3>

`Vue3.x` 改用`Proxy`来替代`Object.defineProperty`,因为Proxy可以直接监听对象和数组的变化，并且有多达13种拦截方法。并且作为新标准将受到浏览器厂商重点持续的性能优化。<br>

&#8195;&#8195;**Proxy只会代理对象的第一层，那么Vue3又是怎样处理这个问题的呢？**<br>
&#8195;&#8195;判断当前`Reflect.get`的返回值是否为`Object`，如果是则再通过`reactive`方法做代理， 这样就实现了深度观测。<br>

&#8195;&#8195;**监测数组的时候可能触发多次get/set，那么如何防止触发多次呢？**<br>
&#8195;&#8195;我们可以判断 `key` 是否为当前被代理对象 `target` 自身属性，也可以判断旧值与新值是否相等，只有满足以上两个条件之一时，才有可能执行 `trigger`。

## 9、说一下vue2.x中如何监测数组变化</h3>

使用了函数劫持的方式，重写了数组的方法，**Vue将data中的数组进行了原型链重写，指向了自己定义的数组原型方法**。这样当调用数组api时，可以通知依赖更新。如果数组中包含着引用类型，会对数组中的引用类型再次递归遍历进行监控。这样就实现了监测数组变化。
```js
const aryMethods = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'];
const arrayAugmentations = [];

aryMethods.forEach((method)=> {

    // 这里是原生Array的原型方法
    let original = Array.prototype[method];

   // 将push, pop等封装好的方法定义在对象arrayAugmentations的属性上
   // 注意：是属性而非原型属性
    arrayAugmentations[method] = function () {
        console.log('我被改变啦!');

        // 调用对应的原生方法并返回结果
        return original.apply(this, arguments);
    };

});

let list = ['a', 'b', 'c'];
// 将我们要监听的数组的原型指针指向上面定义的空数组对象
// 别忘了这个空数组的属性上定义了我们封装好的push等方法
list.__proto__ = arrayAugmentations;
list.push('d');  // 我被改变啦！ 4

// 这里的list2没有被重新定义原型指针，所以就正常输出
let list2 = ['a', 'b', 'c'];
list2.push('d');  // 4
```
## 10、说一下v-if和v-show的区别？</h3>

&#8195;&#8195;v-if是真正的条件渲染。当条件不成立时，`v-if`不会渲染DOM元素。它会保证在切换过程中，条件块内的事件监听器和子组件完全被销毁和重建。 `v-show`操作的是样式(`display`)，切换当前DOM的显示和隐藏。`v-show`为`true`时display为该标签默认属性，为`false`时`display:none`。
条件频繁切换时用`v-show`，运行时较少改变条件时用v-if。

## 11、组件中的data为什么是一个函数？</h3>

&#8195;&#8195;因为组件是可以复用的,`JS` 里对象是引用关系,如果组件 `data` 是一个对象,那么子组件中的 `data` 属性值会互相污染,产生副作用。

&#8195;&#8195;所以一个组件的 `data` 选项必须是一个函数,因此每个实例可以维护一份被返回对象的独立的拷贝。`new Vue` 的实例是不会被复用的,因此不存在以上问题。


## 12、v-model 的原理？</h3>

&#8195;&#8195;`v-model` 本质上不过是语法糖，`v-model` 在内部为不同的输入元素使用不同的属性并抛出不同的事件：

+ `text` 和 `textarea` 元素使用 `value` 属性和 `input` 事件；
+ `checkbox` 和 `radio` 使用 `checked` 属性和 `change` 事件；
+ `select` 使用 `value` 和 `change` 事件。

## 13、Vue中组件生命周期调用顺序？</h3>

+ 组件的调用顺序都是`先父后子`,渲染完成的顺序是`先子后父`。
+ 组件的销毁操作是`先父后子`，销毁完成的顺序是`先子后父`。
+ 加载渲染过程:
```js
//同步组件：
父beforeCreate->父created->父beforeMount->子beforeCreate->子created->子beforeMount- >子mounted->父mounted
//异步组件
父beforeCreate->父created->父beforeMount—>父mounted->父beforeUpdate->子beforeCreate->子created->子beforeMount- >子mounted->父Updated
```
+ 子组件更新过程 `父beforeUpdate->子beforeUpdate->子updated->父updated`
+ 父组件更新过程  `父 beforeUpdate -> 父 updated`
+ 销毁过程 `父beforeDestroy->子beforeDestroy->子destroyed->父destroyed`

## 14、什么是SSR？</h3>

&#8195;&#8195;`SSR` 也就是服务端渲染，也就是将 `Vue` 在客户端把标签渲染成 `HTML` 的工作放在服务端完成，然后再把 `html` 直接返回给客户端。


## 15、谈谈你对`keep-alive的理解？</h3>

&#8195;&#8195;keep-alive 是 Vue 内置的一个组件，可以使被包含的组件保留状态，避免重新渲染 ，其有以下特性：
+ 一般结合路由和动态组件一起使用，用于缓存组件；
+ 提供 `include` 和 `exclude` 属性，两者都支持字符串或正则表达式， `include` 表示只有名称匹配的组件会被缓存，`exclude` 表示任何名称匹配的组件都不会被缓存 ，其中 `exclude` 的优先级比 `include` 高；
+ 对应两个钩子函数 `activated` 和 `deactivated` ，当组件被激活时，触发钩子函数 `activated`，当组件被移除时，触发钩子函数 `deactivated`。

## 16、ref的作用？</h3>

+	获取dom元素 this.$refs.box
+ 	获取子组件中的数据 this.$refs.box.msg
+	调用子组件中的方法 this.$refs.box.open()  


## 18、什么是SPA,它的优缺点是什么？</h3>

&#8195;&#8195;SPA(single-page application)是指仅在`web`页面初始化时就加载相应的HTML、JavaScript和Css。一旦页面加载完成，不会因为用户的操作而进行页面的重新加载或跳转。而是利用`路由机制`实现`HTML`内容的变换、避免页面的重新渲染。

**优点：**
+ 用户体验好，内容的改变不需要重新加载整个页面，避免了不必要的跳转和重复渲染。
+ SPA相对服务器压力小。
+ 前后端职责分离，架构清晰，前端进行交互逻辑，后端负责数据处理。

**缺点**
+ 初次加载耗时多;
+ 前进后退路由管理。由于单页应用在一个页面中显示所有的内容，所以不能使用浏览器的前进后退功能，所有的页面切换需要自己构建堆栈管理。
+ `SEO`难度较大。所有的内容都在一个页面中动态切换显示，所在`SEO`上有着天然的弱势。

## 19、Vue2.x和Vue3.x渲染器的diff算法分别说一下</h3>

diff算法有以下过程
+ 同级比较，再比较子节点
+ 先判断一方有子节点一方没有子节点的情况(如果新的children没有子节点，将旧的子节点移除)
+ 比较都有子节点的情况(核心diff)
+ 递归比较子节点

正常Diff两个树的时间复杂度是`O(n^3)`，但实际情况下我们很少会进行跨层级的移动DOM，所以Vue将Diff进行了优化，从`O(n^3) -> O(n)`，只有当新旧children都为多个子节点时才需要用核心的Diff算法进行同层级比较。

Vue2的核心Diff算法采用了`双端比较`的算法，同时从新旧children的两端开始进行比较，借助key值找到可复用的节点，再进行相关操作。可以减少移动节点次数，减少不必要的性能损耗，更加的优雅。

Vue3.x借鉴了`ivi算法和 inferno算法`

在创建VNode时就`确定其类型`，以及在`mount/patch`的过程中采用`位运算`来判断一个VNode的类型，在这个基础之上再配合核心的Diff算法，使得性能上较Vue2.x有了提升。

## 20、在哪个生命周期内调用异步请求？</h3>

在 `created` 钩子函数中调用异步请求有以下优点：
+ 能更快获取到服务端数据，减少页面`loading`时间。
+ `ssr`不支持`beforeMount 、mounted `钩子函数,所以放在 created 中有助于一致性；

## 21、父组件如何监听到子组件的生命周期</h3>

&#7195;&#7195;有父组件 `Parent` 和子组件 `Child`，如果父组件监听到子组件挂载 `mounted` 就做一些逻辑处理，可以通过以下写法实现：
```js
// Parent.vue
<Child @mounted="doSomething"/>
    
// Child.vue
mounted() {
  this.$emit("mounted");
}
```
&#8195;&#8195;上面的代码需要手动设置`$emit`触发父组件的事件，更简单的方式可以在父组件中引用子组件通过`@hook`来监听即可。其他生命周期事件也可以这样监听。
```js
/  Parent.vue
<Child @hook:mounted="doSomething" ></Child>

doSomething() {
   console.log('父组件监听到 mounted 钩子函数 ...');
},
    
//  Child.vue
mounted(){
   console.log('子组件触发 mounted 钩子函数 ...');
},  
//输出顺序
// 子组件触发 mounted 钩子函数 ...
// 父组件监听到 mounted 钩子函数 ...
```
参考地址<br>
[30 道 Vue 面试题，内含详细讲解（涵盖入门到精通，自测 Vue 掌握程度）](https://juejin.im/post/5d59f2a451882549be53b170)

<Valine></Valine>


## 22、slot的使用
`slot`用于在组件中作为占位符存在。但是也可以作为一种通信手段。我们可以在组件中，给它的父组件传递数据。通过在子组件的 `slot` 组件上定义属性，给父组件传递数据。在父组件里通过 `slot-scope` 去接收数据。
```js
//child
<template >
    <div>
        <span>{{userInfo.userName}}</span>
        <button @click="change">修改</button>
        <slot name='child1' childData="{test:'name'}"></slot>
    </div>
</template>
<script>
export default {
    name:"child1",
    props:{
        user:Object
    },
    data(){
        return{
            userInfo:this.user
        }
    },
    methods:{
        change(){
            this.userInfo.userName="userName改变了"
        }
    }
}
</script>
//parent
<template >
    <div>
        <child1 :user="userInfo">
            <template slot="child1" slot-scope="data">
                {{data.childData}}
            </template>
        </child1>
    </div>
</template>
<script>
import child1 from "./child1"
export default {
    name:"parent",
    data () {
        return {
            userInfo:{
                userName:'james',

            }
        }
    },
    components:{
        child1
    },
    methods: {
        
    },
}
</script>

```