---
title: Vue.use()函数的内部实现原理
date: '2020-06-10'
type: 技术
tags: vue
note: Vue.use()函数的内部实现原理
---
`Vue.use()` 一般用来注册插件。如`Vue.use(vueRouter)、Vue.user(Vuex)`。常常通过这种方式将 `Vue`传到插件内部，在插件内部将 `Vue` 构造函数添加原型属性。经常跟 `Vue.extend()` 搭配着使用。其内部代码如下所示。
```js
Vue.use = function (plugin) {
    //installedPlugins表示应注册的插件
    var installedPlugins = (this._installedPlugins || (this._installedPlugins = []));
    if (installedPlugins.indexOf(plugin) > -1) {
        return this
    }

    // additional parameters，表示出Vue之外的参数
    var args = toArray(arguments, 1);
    args.unshift(this);//将Vue添加到args中首位
    //如果传入的插件有install属性，且其是一个函数
    if (typeof plugin.install === 'function') {
        plugin.install.apply(plugin, args);
    } else if (typeof plugin === 'function') {
        plugin.apply(null, args);
    }
    //将此插件添加到插件列表中
    installedPlugins.push(plugin);
    return this
};
```
下面是 `Vue.use()` 搭配 `Vue.extend()` 注册一个插件的简单例子。
## 1、定义插件需要用到的组件
```vue
//<Modal>用的是iview ui库的组件
<template>
    <Modal
        v-model="visible"
        :closable="false"
        footer-hide
        :width="350"
        :mask-closable="false"
    >
        <div class="custom-confirm">
            <div class="custom-confirm-header">{{title}}</div>
            <div class="custom-confirm-body" v-html="content"></div>
            <div class="custom-confirm-footer">
                <Button @click="handleOk">{{okText}}</Button>
                <Button @click="handleCancel">{{cancelText}}</Button>
            </div>
        </div>
    </Modal>
</template>
<script>
    export default {
        name: 'show-modal',
        props: {
            title: {
                type: String,
                default: ''
            },
            content: {
                type: String,
                default: '',
            },
            okText: {
                type: String,
                default: '确定'
            },
            cancelText: {
                type: String,
                default: '取消'
            },
            ok: {
                type: Function,
            },
            cancel: {
                type: Function
            }
            
        },
        data () {
            return {
                visible: false,
            }
        },
        methods: {
            handleCancel () {
                this.visible = false;
                this.cancel && this.cancel()
            },
            handleOk () {
                this.visible = false;
                this.ok && this.ok()
            }
        }
    }
</script>
<style scoped lang="scss">
.custom-confirm{
    margin: -16px;
    padding: 20px 0;
    &-header{
        text-align: center;
        color: #333;
        font-size: 14px;
        font-weight: bold;
    }
    &-body{
        text-align: center;
        color: #666;
        font-size: 12px;
        line-height: 22px;
        margin-top: 20px;
        padding: 0 65px;
    }
    &-footer{
        display: flex;
        justify-content: space-between;
        margin-top: 20px;
        padding: 0 70px;
        /deep/ .ivu-btn{
            height: 26px;
            width: 72px;
            color: #ffffff;
            font-size: 12px;
            background-color: #00BDEC;
        }
    }
}
</style>
```
## 2、插件内容的核心代码
```js
import ConfirmModal from './ShowModal.vue';
function confirmModal (component, props, Vue) {
    const constructor = Vue.extend(component);
    const instance = new constructor({
        propsData: props
    });
    instance.$mount();
    document.body.appendChild(instance.$el);
    instance.visible = true
    return instance
}
export default {
    install (Vue) {
        Vue.prototype.$ShowModal = props => {
            return confirmModal(ConfirmModal, props, Vue)
        }
    }
}
```
## 3、在入口文件将插件注入全局
```js
//main.js 在程序入口注册
import ShowModal from '@/plugins/ShowModal'
Vue.use(ShowModal)
```
## 4、插件的全局使用
```js
this.$ShowModal({
    title: '是否保存数据',
    content: '您是否要保存卡片布局数据?',
    ok: () => {
        
    },
    cancel: () => {
        //todo
    }
})
```