---
title: vue3是如何封装插件的
date: '2020-12-12'
type: 技术
tags: vue3
note: vue3是如何封装插件的
---
&#8195;&#8195;最近公司有一个新的项目，项目框架是我来负责搭建的，所以果断选择了`Vue3.x+ts`。`vue3.x`不同于`vue2.x`，他们两的插件封装方式完全不一样。由于项目中需要用到自定义提示框,所以想着自己封装一个。`vue2.x`提供了一个`vue.extend`的全局方法。那么`vue3.x`是不是也会提供什么方法呢?果然从`vue3.x`源码中还是找到了。插件封装的方法，还是分为两步。
## 1、组件准备
&#8195;&#8195;按照`vue3.x`的组件风格封装一个自定义提示框组件。在`props`属性中定义好。需要传入的数据流。
```html
<template>
    <div v-show="visible" class="model-container">
      <div class="custom-confirm">
        <div class="custom-confirm-header">{{ title }}</div>
        <div class="custom-confirm-body" v-html="content"></div>
        <div class="custom-confirm-footer">
          <Button @click="handleOk">{{ okText }}</Button>
          <Button @click="handleCancel">{{ cancelText }}</Button>
        </div>
      </div>
    </div>
</template>
```
```ts
<script lang="ts">
import { defineComponent, watch, reactive, onMounted, onUnmounted, toRefs } from "vue";
export default defineComponent({
  name: "ElMessage",
  props: {
    title: {
      type: String,
      default: "",
    },
    content: {
      type: String,
      default: "",
    },
    okText: {
      type: String,
      default: "确定",
    },
    cancelText: {
      type: String,
      default: "取消",
    },
    ok: {
      type: Function,
    },
    cancel: {
      type: Function,
    },
  },
  setup(props, context) {
    const state = reactive({
      visible: false,
    });
    function handleCancel() {
      state.visible = false;
      props.cancel && props.cancel();
    }
    function handleOk() {
      state.visible = false;
      props.ok && props.ok();
    }
    return {
      ...toRefs(state),
      handleOk,
      handleCancel,
    };
  },
});
</script>
```
## 2、插件注册
&#8195;&#8195;这个才是插件封装的重点。不过代码量非常少，只有那么核心的几行。主要是调用了`vue3.x`中的`createVNode`创建虚拟节点，然后调用`render`方法将虚拟节点渲染成真实节点。并挂在到真实节点上。本质上就是`vue3.x`源码中的`mount`操作。
```js
import { createVNode, render } from 'vue';
import type {App} from "vue";
import MessageConstructor from './index.vue'
const body=document.body;
const Message: any= function(options:any){
  const modelDom=body.querySelector(`.container_message`)
    if(modelDom){
      body.removeChild(modelDom)
    }
    options.visible=true;
    const container = document.createElement('div')
    container.className = `container_message`
    //创建虚拟节点
    const vm = createVNode(
      MessageConstructor,
      options,
    )
    //渲染虚拟节点
    render(vm, container)
    document.body.appendChild(container);
}  
export default {
    //组件祖册
    install(app: App): void {
        app.config.globalProperties.$message = Message
    }
}
```

&#8195;&#8195;[插件封装完整地址](https://github.com/tangjie-93/vue/tree/master/plugin-demo-ts-vue3)。**源码位置————`packages/runtime-core/src/apiCreateApp`中的`createAppAPI`函数中的`mount`方法。**

<img src="../../images/vue3-mount.png" />

