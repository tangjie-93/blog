---
title: vue常见知识点总结
date: '2020-01-14'
type: 技术
tags: vue
note: vue常见知识点总结
---

&#8195;&#8195;平时在项目开发过程中会用到一些知识点，自己觉得有些用，便整理下来供以后自己去回顾。

<ul>
    <li><a href="#a1">1、混入（mixins）</a></li>
    <li><a href="#a2">2、Vue.nextTick()</a></li>
    <li><a href="#a3">3、Vue.set( target, key, value )</a></li>
    <li><a href="#a4">4、Vue.extend()</a></li>
    <li><a href="#a5">5、delimiters</a></li>
    <li><a href="#a6">6、BEM设计模式</a></li>
    <li><a href="#a7">7、组件间通信的几种方式</a></li>
    <li><a href="#a8">8、立即触发watch的方法</a></li>
    <li><a href="#a9">9、computed和watch的对比</a></li>
    <li><a href="#a10">10、require.context()的用法</a></li>
</ul>

<h3 id="a1">1、混入（mixins）</h3>
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

<h3 id="a2">2、Vue.nextTick()</h3>   

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
<h3 id="a3">3、Vue.set( target, key, value )</h3>

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
点击事件操作结果如下所示：
<!-- <img src="" alt="暂无图片"> -->
![](https://user-gold-cdn.xitu.io/2019/1/8/1682c3e7198d25d8?w=1245&h=266&f=png&s=52950)

![](https://user-gold-cdn.xitu.io/2019/1/8/1682c3d82f035f28?w=1242&h=280&f=png&s=53751)

&#8195;&#8195;从上面的输出结果我们可以看出，我们调用使用`this.arr[0]={name:"张大",age:40};`来修改数据元素时并没有改变视图中的元素。
而我们通过使用`this.$set(this.arr,0,{name:"张大",age:40});`能够实时修改视图元素。   

&#8195;&#8195;总结：通过数组的变异方法（Vue数组变异方法）我们可以动态控制数据的增减，但是我们却无法做到对某一条数据的修改，**修改数据我们可以使用Vue.set()方法。**

<h3 id="a4">4、Vue.extend()</h3>  
  
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
<h3 id="a5">5、delimiters</h3>

&#8195;&#8195;delimiters的作用是改变我们插值的符号。Vue默认的插值是双大括号`{{}}`。但有时我们会有需求更改这个插值的形式。

```js           
delimiters:['${','}']
```
现在我们的插值形式就变成了${}。代替了{{ }}。
<h3 id="a6">6、BEM设计模式</h3>

 &#8195;&#8195;BEM是(Block Element Modifier)的简称,翻译为块级元素修饰符。是由Yandex团队提出的一种前端命名方法论。这种巧妙的命名方法让你的CSS类对其他开发者来说更加透明而且更有意义。BEM命名约定更加严格，而且包含更多的信息，它们用于一个团队开发一个耗时的大项目。


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
<h3 id="a7">7、组价间通信的几种方式</h3>
<h4>1、props</h4>

&#8195;&#8195;这是父子间组件通信的常见方式，一般用于父组件向子组件传递数据，并且是**响应式**的。一般情况下子组件不会去直接改变从父组件同过prop传过来的数据，一般会在子组件data中定义一个变量来进行接收：    
&#8195;&#8195;注意：这种通信方式是响应式的，**一般情况下是用于单向通信**的（父向子传递数据），但是如果在通过`props`特性传的是一个引用类型的数据（如Object和Array）时，在子组件修改该引用类型的数据时，也会改变父组件中该`props`的值。
```js        
props:{
    name:{
        type:String,
        dafault:""
    },
    age:{
        type:Number,
        dafault:0
    }
}
data(){
    return{
        perName=this.name
    }
}
```
<h4>2、 $emit和$on</h4>

&#8195;&#8195;这种通信方式主要是**解决子组件向父组件传递数据**的问题。

```js
//子组件中
<button @click="send"></button>
...
methods:{
    send(){
        this.$emit("sendMsg","我是子组件的数据")
    }
}
//父组件中
created(){
    this.$on("sendMsg",data=>{
        console.log(data);//"我是子组件的数据"
    })
}
```

<h4>3、vuex</h4>

&#8195;&#8195;这种通信方式属于全局通信方式，一般vuex用在中大型项目中。
主要是有以下几个核心概念：  

>**1、state:** 用于保存整个项目中用到的全局变量,是响应式的。与之对应的是`mapState`函数（当一个组件需要获取多个状态时候，将这些状态都声明为计算属性会有些重复和冗余。为了解决这个问题，我们可以使用 **mapState** 辅助函数帮助我们生成计算属性）具体的用法可以参考官方文档。[Vuex](https://vuex.vuejs.org/zh/guide/state.html) 

>**2、getters：** 可以认为是 store 的**计算属性**，getter 的返回值会根据它的依赖被缓存起来，且只有当它的依赖值发生了改变才会被重新计算。    **mapGetters：** mapGetters 辅助函数仅仅是将 store 中的 getter 映射到局部计算属性。

>**3、Mutation：** 更改 Vuex 的 store 中的状态的唯一方法是提交 mutation。Vuex 中的 mutation 非常类似于事件：每个 mutation 都有一个字符串的 事件类型 (type) 和 一个 回调函数 (handler)。这个回调函数就是我们实际进行状态更改的地方，并且它会接受 state 作为第一个参数。    
**注意：** 1、Mutation 必须是同步函数；2、使用常量替代 Mutation 事件类型；3、Mutation 需遵守 Vue 的响应规则。<br>
**mapMutations** 辅助函数将组件中的 methods 映射为 store.commit 调用（需要在根节点注入 store）。 

>**4、Action：** Action 提交的是 mutation，而不是直接变更状态。
Action 可以包含任意异步操作。Action 通过 store.dispatch 方法触发。
在组件中分发 Action：this.$store.dispatch('xxx') 分发 action，或者使用 **mapActions** 辅助函数将组件的 methods 映射为 store.dispatch 调用（需要先在根节点注入 store）。 

>**5、Module** Vuex 允许我们将 store 分割成模块（module）。每个模块拥有自己的 state、mutation、action、getter、甚至是嵌套子模块——从上至下进行同样方式的分割。

<h4>4、$attrs和$listeners</h4>

>**attrs:**  包含了**父作用域中不被 props 所识别 (且获取) 的特性绑定** (class 和 style 除外)。当一个组件没有声明任何 `props` 时，这里会包含所有父作用域的绑定 (`class` 和 `style` 除外)，并且可以通过 `v-bind="$attrs"` 传入内部组件。通常配合 `inheritAttrs` 选项一起使用。
`inheritAttrs`为true时，表示在该组件上显示那些非props属性，为false则不显示。

>**listeners：** 包含了父作用域中的 (不含 .native 修饰器的) v-on 事件监听器。它可以通过 `v-on="$listeners"` 传入内部组件。

<h4>5、provide和inject</h4>

 &#8195; &#8195;provide 选项应该是一个对象或返回一个对象的函数。该对象包含可注入其子孙的属性。  子孙组件通过inject注入获取到祖级和父级provide的数据。

>注意：**provide 和 inject 绑定并不是可响应的**。这是刻意为之的。然而，如果你传入了一个可监听的对象，那么其对象的属性还是可响应的。    

 &#8195; &#8195;provide与inject 实现数据响应式的两种方式：
>1、**provide祖先组件的实例**，然后在子孙组件中注入依赖，这样就可以在子孙组件中直接修改祖先组件的实例的属性，不过这种方法有个缺点就是这个实例上挂载很多没有必要的东西比如props，methods
>2、使用2.6最新API Vue.observable 优化响应式 provide(推荐)

<h4>6、$parent / $children与 ref</h4>

>**ref**：如果在普通的 DOM 元素上使用，引用指向的就是 DOM 元素；如果用在子组件上，引用就指向组件实例。    
>**parent / children**：访问父 / 子实例

&#8195;&#8195;这两种都是直接得到组件实例，使用后可以直接调用组件的方法或访问数据。这两种方法的弊端是，无法在跨级或兄弟间通信。

<h4>7、eventBus</h4>

&#8195;&#8195;这种通信方式可以跨组件通讯，经常用于兄弟组件间通讯。这种通讯方式的实现是通过新建一个vue实例，然后在需要通信的组件间引入，通过emit方法触发事件，通过on来监听相应事件来实现通讯的功能。更详细的请参考大神的介绍——[vue组件间通信六种方式](https://juejin.im/post/5cde0b43f265da03867e78d3#heading-13)
```js
//evenBus.js
import Vue from "vue"
export default new Vue();
```

<h3 id="a8">8、立即触发watch的方法</h3>

```js
watch:{
    "type":function(){
        handler(){
            //注意这里不要使用箭头函数，否则取不到vue实例
            console.log(this.msg);
        },
        immediate:true
        
    }
}
```
<h3 id="a9">9、computed和watch的对比</h3>

**1、computed** <br>
+ 1、computed是计算属性,也就是计算值,它更多用于**计算值的场景**。
+ 2、computed**具有缓存性**,computed的值在getter执行后是会缓存的，只有在它依赖的属性值改变之后，下一次获取computed的值时才会重新调用对应的getter来计算。每当触发重新渲染时，`调用方法`将总会再次执行函数。如果计算属性依赖的值没有变化，计算属性会立即返回之前的计算结果，而不必再次执行函数。
+ 3、computed适用于计算**比较消耗性能**的计算场景。

**2、watch**

+ 1、更多的是**观察**的作用,类似于某些数据的监听回调,用于观察props $emit或者本组件的值,当数据变化时来执行回调进行后续操作。
+ 2、**无缓存性**，页面重新渲染时值不变化也会执行
+ 3、当需要在数据变化时执行异步或开销较大的操作时，这个方式是最有用的。
+ 4、当我们需要深度监听对象中的属性时，可以打开deep：true选项，这样便会对对象中的每一项进行监听。这样会带来性能问题，优化的话可以使用字符串形式监听，如果没有写到组件中，不要忘记使用unWatch手动注销哦。    

**小结:**
当我们要进行数值计算,而且依赖于其他数据，那么把这个数据设计为computed
如果你需要在某个数据变化时做一些事情，使用watch来观察这个数据变化。

<h3 id="a10">10、require.context()的用法</h3>

```javascript
require.context(directory,useSubdirectories,regExp)
//directory:表示检索的目录
//useSubdirectories：表示是否检索子文件夹
//regExp:匹配文件的正则表达式,一般是文件名
例如 require.context("@/views/components",false,/\.vue$/)
```
**1、常常用来在组件内引入多个组件。**
```javascript
const path = require('path')
const files = require.context('@/components/home', false, /\.vue$/)
const modules = {}
files.keys().forEach(key => {
  const name = path.basename(key, '.vue')
  modules[name] = files(key).default || files(key)
})
export default{
    ...
    components:modules
}
```
**2、在main.js中引入大量公共组件**
```javascript
import Vue from 'vue'
// 自定义组件
const requireComponents = require.context('../views/components', true, /\.vue/)
// 打印结果
// 遍历出每个组件的路径
requireComponents.keys().forEach(fileName => {
  // 组件实例
  const reqCom = requireComponents(fileName)
  // 截取路径作为组件名
  const reqComName = fileName.split('/')[1]
  // 组件挂载
  Vue.component(reqComName, reqCom.default || reqCom)
})
```
<h3 id="a11">11、简单说一下vue2.X的响应式原理</h3>

vue在初始化数据时，会使用`Object.defineProperty`对`data`数据进行劫持，当页面使用对应属性时，首先会进行依赖收集（收集当前组件的`watcher`）,如果属性发生变化，会通知相关依赖进行更新操作（发布订阅）。

响应式系统简述:

+ 任何一个 Vue Component 都有一个与之对应的 Watcher 实例。
+ Vue 的 data 上的属性会被添加 getter 和 setter 属性。
+ 当 Vue Component render 函数被执行的时候, data 上会被 触碰(touch), 即被读, getter 方法会被调用, 此时 Vue 会去记录此 Vue component 所依赖的所有 data。(这一过程被称为依赖收集)
+ data 被改动时（主要是用户操作）, 即被写, setter 方法会被调用, 此时 Vue 会去通知所有依赖于此 data 的组件去调用他们的 render 函数进行更新。


<h3 id="a12">12、简单说一下vue3.X的响应式原理</h3>

Vue3.x改用`Proxy`来替代`Object.defineProperty`,因为Proxy可以直接监听对象和数组的变化，并且有多达13种拦截方法。并且作为新标准将受到浏览器厂商重点持续的性能优化。<br>
&#8195;&#8195;**Proxy只会代理对象的第一层，那么Vue3又是怎样处理这个问题的呢？**<br>
&#8195;&#8195;判断当前Reflect.get的返回值是否为Object，如果是则再通过reactive方法做代理， 这样就实现了深度观测。<br>

&#8195;&#8195;**监测数组的时候可能触发多次get/set，那么如何防止触发多次呢？**<br>
&#8195;&#8195;我们可以判断key是否为当前被代理对象target自身属性，也可以判断旧值与新值是否相等，只有满足以上两个条件之一时，才有可能执行trigger。

<h3 id="a13">13、说一下vue2.x中如何监测数组变化</h3>

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

<h3 id="a14">13、nextTick知道吗，实现原理是什么?</h3>
在下次`DOM`更新循环结束之后执行的延迟回调。nextTick主要使用了宏任务和微任务。根据执行环境分别尝试采用

+ Promise
+ MutationObserver
+ setImmediate
+ 如果以上都不行则采用setTimeout

<h3 id="a14">13、说一下Vue的生命周期?</h3>
          
`beforeCreate` 是new Vue()之后触发的第一个钩子，在当前阶段data、methods、computed以及watch上的数据和方法都不能被访问。  

`created` 在实例创建完成后发生，当前阶段已经完成了数据的初始化，可以获取到`data/$ref`等属性，但是在这里更改数据`不会触发updated函数`。在当前阶段无法与Dom进行交互(获取不到`$el`)，如果非要想，可以通过vm.$nextTick来访问Dom。

`beforeMounted` 发生在挂载之前，在这之前template模板已导入渲染函数编译。而当前阶段**虚拟Dom已经创建完成**，即将开始渲染。在此时也可以对数据进行更改，`不会触发updated`。

`mounted` 在挂载完成后发生，在当前阶段，真实的Dom挂载完毕(数据编译完成)，数据完成双向绑定，可以访问到Dom节点，使用$ref属性对Dom进行操作。

`beforeUpdate` 发生在更新之前，也就是响应式数据发生更新，虚拟dom重新渲染之前被触发，你可以`在当前阶段进行更改数据，不会造成重渲染`。

`updated` 发生在更新完成之后，当前阶段组件Dom已完成更新。要注意的是避免在此期间更改数据，因为这可能会导致无限循环的更新。

`beforeDestroy` 发生在实例销毁之前，在当前阶段实例完全可以被使用，我们可以在这时进行善后收尾工作，比如清除计时器。

`destroyed` 发生在实例销毁之后，这个时候只剩下了dom空壳。组件已被拆解，数据绑定被卸除，监听被移出，子实例也统统被销毁。

**几种不常用的钩子**    
`activated` 在keep-alive 组件激活时调用，该钩子在服务器端渲染期间不被调用。

`deactivated` 在keep-alive 组件停用时调用，该钩子在服务器端渲染期间不被调用。

`errorCaptured` 当捕获一个来自子孙组件的错误时被调用。此钩子会收到三个参数：错误对象、发生错误的组件实例以及一个包含错误来源信息的字符串。此钩子可以返回 false 以阻止该错误继续向上传播。

<h3 id="a14">14、说一下v-if和v-show的区别？</h3>

&#8195;&#8195;v-if是真正的条件渲染。当条件不成立时，`v-if`不会渲染DOM元素。它会保证在切换过程中，条件块内的事件监听器和子组件完全被销毁和重建。 `v-show`操作的是样式(`display`)，切换当前DOM的显示和隐藏。`v-show`为`true`时display为该标签默认属性，为`false`时`display:none`。
条件频繁切换时用`v-show`，运行时较少改变条件时用v-if。

<h3 id="a15">15、组件中的data为什么是一个函数？</h3>

&#8195;&#8195;因为组件是可以复用的,JS 里对象是引用关系,如果组件 data 是一个对象,那么子组件中的 data 属性值会互相污染,产生副作用。

&#8195;&#8195;所以一个组件的 data 选项必须是一个函数,因此每个实例可以维护一份被返回对象的独立的拷贝。new Vue 的实例是不会被复用的,因此不存在以上问题。

<h3 id="a16">16、v-model 的原理？</h3>

&#8195;&#8195;v-model 本质上不过是语法糖，v-model 在内部为不同的输入元素使用不同的属性并抛出不同的事件：

+ text 和 textarea 元素使用 value 属性和 input 事件；
+ checkbox 和 radio 使用 checked 属性和 change 事件；
+ select 使用 value 和 change事件。

<h3 id="a17">17、Vue中组件生命周期调用顺序？</h3>

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

<h3 id="a18">18、什么是SSR？</h3>

&#8195;&#8195;SSR也就是服务端渲染，也就是将Vue在客户端把标签渲染成HTML的工作放在服务端完成，然后再把html直接返回给客户端。


<h3 id="a19">19、谈谈你对`keep-alive的理解？</h3>

&#8195;&#8195;keep-alive 是 Vue 内置的一个组件，可以使被包含的组件保留状态，避免重新渲染 ，其有以下特性：
+ 一般结合路由和动态组件一起使用，用于缓存组件；
+ 提供 `include` 和 `exclude` 属性，两者都支持字符串或正则表达式， `include` 表示只有名称匹配的组件会被缓存，`exclude` 表示任何名称匹配的组件都不会被缓存 ，其中 `exclude` 的优先级比 `include` 高；
+ 对应两个钩子函数 `activated` 和 `deactivated` ，当组件被激活时，触发钩子函数 `activated`，当组件被移除时，触发钩子函数 `deactivated`。

<h3 id="a20">20、ref的作用？</h3>

+	获取dom元素 this.$refs.box
+ 	获取子组件中的数据 this.$refs.box.msg
+	调用子组件中的方法 this.$refs.box.open()  

<h3 id="a21">21、Vue 中的 key 有什么作用？</h3>

&#8195;&#8195;key 是 Vue 中 vnode 的唯一标记，通过这个 key，我们的 diff 操作可以更准确、更快速。
+ 更准确：因为带 key 就不是就地复用（`如果数据项的顺序被改变，Vue 将不会移动 DOM 元素来匹配数据项的顺序， 而是简单复用此处每个元素,会导致之前节点的状态被保留下来从而产生一些问题`）了，在比较是否是同一个节点的 sameNode 函数 a.key === b.key 对比中可以避免就地复用的情况。所以会更加准确。
+ 更快速：利用 key 的唯一性生成 map 对象来获取对应节点，比遍历方式更快

<h3 id="a22">22、什么是SPA,它的优缺点是什么？</h3>

&#8195;&#8195;SPA(single-page application)是指仅在`web`页面初始化时就加载相应的HTML、JavaScript和Css。一旦页面加载完成，不会因为用户的操作而进行页面的重新加载或跳转。而是利用`路由机制`实现`HTML`内容的变换、避免页面的重新渲染。

**优点：**
+ 用户体验好，内容的改变不需要重新加载整个页面，避免了不必要的跳转和重复渲染。
+ SPA相对服务器压力小。
+ 前后端职责分离，架构清晰，前端进行交互逻辑，后端负责数据处理。

**缺点**
+ 初次加载耗时多;
+ 前进后退路由管理。由于单页应用在一个页面中显示所有的内容，所以不能使用浏览器的前进后退功能，所有的页面切换需要自己构建堆栈管理。
+ `SEO`难度较大。所有的内容都在一个页面中动态切换显示，所在`SEO`上有着天然的弱势。

<h3 id="a23">23、Vue模版编译原理</h3>

Vue的编译过程就是将`template`转化为`render`函数的过程。会经历以下阶段：

+ 生成AST树
+ 优化
+ 代码生成

首先解析模版，生成`AST语法树`(一种用JavaScript对象的形式来描述整个模板)。使用大量的正则表达式对模板进行解析，遇到标签、文本的时候都会执行对应的钩子进行相关处理。

Vue的数据是响应式的，但其实模板中并不是所有的数据都是响应式的。有一些数据首次渲染后就不会再变化，对应的DOM也不会变化。那么优化过程就是深度遍历AST树，按照相关条件对树节点进行标记。这些被标记的节点(静态节点)我们就可以跳过对它们的比对，对运行时的模板起到很大的优化作用。
编译的最后一步是将优化后的AST树转换为可执行的代码。

<h3 id="a24">24、Vue2.x和Vue3.x渲染器的diff算法分别说一下</h3>

diff算法有以下过程
+ 同级比较，再比较子节点
+ 先判断一方有子节点一方没有子节点的情况(如果新的children没有子节点，将旧的子节点移除)
+ 比较都有子节点的情况(核心diff)
+ 递归比较子节点

正常Diff两个树的时间复杂度是`O(n^3)`，但实际情况下我们很少会进行跨层级的移动DOM，所以Vue将Diff进行了优化，从`O(n^3) -> O(n)`，只有当新旧children都为多个子节点时才需要用核心的Diff算法进行同层级比较。

Vue2的核心Diff算法采用了`双端比较`的算法，同时从新旧children的两端开始进行比较，借助key值找到可复用的节点，再进行相关操作。可以减少移动节点次数，减少不必要的性能损耗，更加的优雅。

Vue3.x借鉴了`ivi算法和 inferno算法`

在创建VNode时就`确定其类型`，以及在`mount/patch`的过程中采用`位运算`来判断一个VNode的类型，在这个基础之上再配合核心的Diff算法，使得性能上较Vue2.x有了提升。

<h3 id="a25">25、在哪个生命周期内调用异步请求？</h3>

在 created 钩子函数中调用异步请求有以下优点：
+ 能更快获取到服务端数据，减少页面`loading`时间。
+ `ssr`不支持`beforeMount 、mounted `钩子函数,所以放在 created 中有助于一致性；

<h3 id="a26">26、父组件如何监听到子组件的生命周期</h3>

&#7195;&#7195;有父组件 Parent 和子组件 Child，如果父组件监听到子组件挂载 mounted 就做一些逻辑处理，可以通过以下写法实现：
```js
// Parent.vue
<Child @mounted="doSomething"/>
    
// Child.vue
mounted() {
  this.$emit("mounted");
}
```
&#7195;&#7195;上面的代码需要手动设置`$emit`触发父组件的事件，更简单的方式可以在父组件中引用子组件通过`@hook`来监听即可。其他生命周期事件也可以这样监听。
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

<h3 id="a27">27、Vue 怎么用 vm.$set() 解决对象新增属性不能响应的问题</h3>

```js
export function set (target: Array<any> | Object, key: any, val: any): any {
  // target 为数组  
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    // 修改数组的长度, 避免索引>数组长度导致splcie()执行有误
    target.length = Math.max(target.length, key)
    // 利用数组的splice变异方法触发响应式  
    target.splice(key, 1, val)
    return val
  }
  // key 已经存在，直接修改属性值  
  if (key in target && !(key in Object.prototype)) {
    target[key] = val
    return val
  }
  const ob = (target: any).__ob__
  // target 本身就不是响应式数据, 直接赋值
  if (!ob) {
    target[key] = val
    return val
  }
  // 对属性进行响应式处理
  defineReactive(ob.value, key, val)
  ob.dep.notify()
  return val
}
```
vm.$set 的实现原理是：
+ 如果目标是数组，直接使用数组的 `splice` 方法触发响应式；
+ 如果目标是对象，会先判读属性是否存在、对象是否是响应式，最终如果要对属性进行响应式处理，则是通过调用 defineReactive 方法进行响应式处理。

<Valine></Valine>


