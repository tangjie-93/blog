---
title: typescript在vue中的使用
date: '2020-01-14'
type: 技术
tags: typescript
note: typescript在vue中的使用
---
&#8195;&#8195;**将`Typescript`引入`Vue`的原因有以下几个：**
+ **可读性。** ts是js的超集，支持js的所有语法，并对js进行了一些扩展。大大提高了代码的可阅读性。
+ **静态类型检查。** 静态类型检查可以避免很多不必要的错误，不用通过调试来发现这些问题。
+ **代码提示。** ts配合vscode，代码提示非常友好。
+ **代码重构。**  在全项目中更改某个变量名，会自动修改整个项目的import。

&#8195;&#8195;**`TypeScript`在vue中的使用完全依靠的是`vue-property-decorator`模块。该模块中主要有这几个属性。**<br>
+ 1、@Component (完全继承于 vue-class-component)

+ 2、@Prop
&#8195;&#8195;
+ 3、@Model
+ 4、@Watch
+ 5、@Emit
+ 6、@Inject
+ 7、@Provide
+ 8、Mixins (在vue-class-component中定义)

**在vue的es6环境中，组件的使用方式是这样的。**
```javascript
    <script>
        import Chart from '@/components/Charts/Keyboard'
        import "../mixin/mixin.js"
        export default{
            model: {
                prop: 'checked',
                event: 'change'
            },
            data(){
                return{
                    valA:"hello world"
                }
            },
            props：{
                entityId:{
                    type:String
                },
                msg: {
                    default: 'default value'
                },
                flag: {
                    type: [String, Boolean]
                },
            },
            mixins: [myMixins]
            components: { Chart },
            computed:{
                count(){
                    return "test"
                }
            },
            watch: {
                'person': {
                handler: 'onPersonChanged',
                immediate: true,
                deep: true
                }
            },
            created(){},
            mounted(){
                this.$on('emit-todo', function(n) {
                    console.log(n)
                })
                this.emitTodo('world');
            },
            methods:{
                todoCount(){

                },
                emitTodo(n){
                    console.log('hello');
                    this.$emit('emit-todo', n);
                }
            }
        }
    </script>
```
**而在vue和Ts的集成环境中，是这样的。**
```typescript
    <script lang="ts">
        import {Vue, Component,Prop,Model} from 'vue-property-decorator';
        import Chart from '@/components/Charts/Keyboard'
        @Component({
            components:{
                Chart
            },
            mixins: [myMixins]
        })
        export default class "组件名" extends Vue{
            //props属性
            @Prop(String) entityId!:string;
            @Prop({default:"default value"}) msg!:string;
            @Prop([String, Boolean]) flag:string | boolean;
            //model属性
            @Model ('change', {type: Boolean})  checked!: boolean;
            //data
            valA ：string="hello world"；
            //计算属性
            get count(){
                return "test";
            },
            //watch
            @Watch('person', { immediate: true, deep: true })
            created(){},
            mounted(){
                this.$on('emit-todo', function(n) {
                    console.log(n)
                })
                this.emitTodo('world');
            },
            //methods
            todoCount(){
                
            },
            @Emit() //对应着$emit
            emitTodo(n: string){
                console.log('hello');
            }
        }
    </script>
```
