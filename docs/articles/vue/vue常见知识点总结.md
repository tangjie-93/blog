# vue常见知识点总结

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
    <li><a href="#a9">9、computed和methods及watch的对比</a></li>
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
        'created:hello from mixin!'   第一行；    
        'created:{ "message": "goodbye", "foo": "abc", "bar": "def" }'  第二行；
```  
 &#8195;&#8195; 在值为对象的这些Vue属性中，例如 methods, components 和 directives，将被混合为同一个对象。**当mixin对象和Vue实例两个对象中键名冲突时，取Vue实例对象的键值对。** 因此在调用methods中的方法时。**会将Vue实例中没有的，mixin中有的添加到Vue实例中去。**
```js        
vm.getName("黎明")；//我在vue中的名字为：黎明。  
vm.getAge(20);//我今年20岁了。
        

```  
  &#8195;&#8195; mixin有点跟jQuery中的$.extend()和es6的object.assign()方法在功能上有些相似。

<h3 id="a2">2、Vue.nextTick()</h3>   

&#8195;&#8195;在下次 DOM 更新循环结束之后执行延迟回调。在修改数据之后立即使用这个方法，获取更新后的 DOM。    
&#8195;&#8195;在项目开发过程中遇到dom元素被隐藏或显示等都没元素状态发生改变时，最好是使用nextTick()方法，不然可能不能正常获取dom元素的属性信息。
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


&#8195;&#8195;向响应式对象中添加一个属性，并确保这个新属性同样是响应式的，且触发视图更新。它必须用于向响应式对象上添加新属性，因为  **Vue 无法探测普通的新增属性** 。
        
        比如 this.myObject.newProperty = 'hi'

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
![](https://user-gold-cdn.xitu.io/2019/1/8/1682c3e7198d25d8?w=1245&h=266&f=png&s=52950)

![](https://user-gold-cdn.xitu.io/2019/1/8/1682c3d82f035f28?w=1242&h=280&f=png&s=53751)


&#8195;&#8195;从上面的输出结果我们可以看出，我们调用使用this.arr[0]={name:"张大",age:40};来修改数据元素时并没有改变视图中的元素。
而我们通过使用this.$set(this.arr,0,{name:"张大",age:40});能够实时修改视图元素。   

&#8195;&#8195;总结：通过数组的变异方法（Vue数组变异方法）我们可以动态控制数据的增减，但是我们却无法做到对某一条数据的修改，**修改数据我们可以使用Vue.set()方法。**

<h3 id="a4">4、Vue.extend()</h3>    

&#8195;&#8195;使用基础 Vue 构造器，创建一个“子类”。参数是一个包含组件选项的对象。data 选项是特例，需要注意 - 在 Vue.extend() 中它必须是函数。<br>
&#8195;&#8195;这里就我个人理解其实就是在定义组件，支持我们在框架中是直接定义.vue文件。使用这种情况比较多的是在页面中单独引入vue.js文件，然后在页面中定义组件用的。在框架中开发中这种全局方法用的比较少。    
例子：      
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
}}) 
```
&#8195;&#8195;通过Vue.extend()方法构造的组件必须通过` Vue.component('todo', todoWarp)注册到全局，才可以在页面中使用该组件。也可以在组件构造器中
        `components: {
            todoItem: todoItem
        }来将通过Vue.extend()构造的组件进行局部注册，作为其他组件的子组件。</p>

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

&#8195;&#8195;delimiters的作用是改变我们插值的符号。Vue默认的插值是双大括号{{}}。但有时我们会有需求更改这个插值的形式。
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
&#8195;&#8195;注意：这种通信方式是响应式的，一般情况下是用于单项通信的（父向子传递数据），但是如果在通过prop特性传的是一个引用类型的数据（如Object和Array）时，在子组件修改该引用类型的数据时，也会改变父组件中该prop的值。
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
&#8195;&#8195;这种通信方式主要是解决子组件向父组件传递数据的问题。

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

>**1、state:** 用于保存整个项目中用到的全局变量,是响应式的。与之对应的是mapState函数（当一个组件需要获取多个状态时候，将这些状态都声明为计算属性会有些重复和冗余。为了解决这个问题，我们可以使用 **mapState** 辅助函数帮助我们生成计算属性）具体的用法可以参考官方文档。[Vuex](https://vuex.vuejs.org/zh/guide/state.html) 

>**2、getters：** 可以认为是 store 的计算属性，getter 的返回值会根据它的依赖被缓存起来，且只有当它的依赖值发生了改变才会被重新计算。    **mapGetters：** mapGetters 辅助函数仅仅是将 store 中的 getter 映射到局部计算属性：    
>**3、Mutation：** 更改 Vuex 的 store 中的状态的唯一方法是提交 mutation。Vuex 中的 mutation 非常类似于事件：每个 mutation 都有一个字符串的 事件类型 (type) 和 一个 回调函数 (handler)。这个回调函数就是我们实际进行状态更改的地方，并且它会接受 state 作为第一个参数。    
**注意：** 1、Mutation 必须是同步函数；2、使用常量替代 Mutation 事件类型；3、Mutation 需遵守 Vue 的响应规则。

>**mapMutations** 辅助函数将组件中的 methods 映射为 store.commit 调用（需要在根节点注入 store）。    
>**4、Action：** Action 提交的是 mutation，而不是直接变更状态。
Action 可以包含任意异步操作。Action 通过 store.dispatch 方法触发。
在组件中分发 Action：this.$store.dispatch('xxx') 分发 action，或者使用 **mapActions** 辅助函数将组件的 methods 映射为 store.dispatch 调用（需要先在根节点注入 store）。  
>**5、Module** Vuex 允许我们将 store 分割成模块（module）。每个模块拥有自己的 state、mutation、action、getter、甚至是嵌套子模块——从上至下进行同样方式的分割。


<h4>4、$attrs和$listeners</h4>

>**attrs:**  包含了父作用域中不被 prop 所识别 (且获取) 的特性绑定 (class 和 style 除外)。当一个组件没有声明任何 prop 时，这里会包含所有父作用域的绑定 (class 和 style 除外)，并且可以通过 v-bind="$attrs" 传入内部组件。通常配合 inheritAttrs 选项一起使用。
inheritAttrs为true时，表示在该组件上显示哪些非prop属性，为false则不显示。

>**listeners：** 包含了父作用域中的 (不含 .native 修饰器的) v-on 事件监听器。它可以通过 v-on="$listeners" 传入内部组件。

<h4>5、provide和inject</h4>

 &#8195; &#8195;provide 选项应该是一个对象或返回一个对象的函数。该对象包含可注入其子孙的属性。  子孙组件通过inject注入获取到祖级和父级provide的数据。

>注意：provide 和 inject 绑定并不是可响应的。这是刻意为之的。然而，如果你传入了一个可监听的对象，那么其对象的属性还是可响应的。    

 &#8195; &#8195;provide与inject 实现数据响应式的两种方式：
>1、provide祖先组件的实例，然后在子孙组件中注入依赖，这样就可以在子孙组件中直接修改祖先组件的实例的属性，不过这种方法有个缺点就是这个实例上挂载很多没有必要的东西比如props，methods
>2、使用2.6最新API Vue.observable 优化响应式 provide(推荐)

<h4>6、$parent / $children与 ref</h4>

>**ref**：如果在普通的 DOM 元素上使用，引用指向的就是 DOM 元素；如果用在子组件上，引用就指向组件实例。    
>**parent / children**：访问父 / 子实例

&#8195;&#8195;这两种都是直接得到组件实例，使用后可以直接调用组件的方法或访问数据。这两种方法的弊端是，无法在跨级或兄弟间通信。
<h4>7、eventBus</h4>
&#8195;&#8195;这种通信方式可以跨组件通讯，经常用于兄弟组件间通讯。这种通讯方式的实现是通过新建一个vue实例，然后在需要通信的组件间引入，通过emit方法触发事件，通过on来监听相应事件来实现通讯的功能。

更详细的请参考大神的介绍——[vue组件间通信六种方式](https://juejin.im/post/5cde0b43f265da03867e78d3#heading-13)

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
<h3 id="a9">9、computed和methods及watch的对比</h3>

**1、computed** <br>
+ 1、computed是计算属性,也就是计算值,它更多用于计算值的场景
+ 2、computed具有缓存性,computed的值在getter执行后是会缓存的，只有在它依赖的属性值改变之后，下一次获取computed的值时才会重新调用对应的getter来计算
+ 3、computed适用于计算比较消耗性能的计算场景

**watch**

+ 1、更多的是「观察」的作用,类似于某些数据的监听回调,用于观察props $emit或者本组件的值,当数据变化时来执行回调进行后续操作。
+ 2、无缓存性，页面重新渲染时值不变化也会执行

小结:
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
<Valine></Valine>


