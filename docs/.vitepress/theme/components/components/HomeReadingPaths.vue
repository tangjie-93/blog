<template>
    <section class="home-reading-paths" aria-labelledby="reading-paths-title">
        <div class="home-reading-paths__heading">
            <div><p class="home-reading-paths__eyebrow">03 / READING PATHS</p><h2 id="reading-paths-title">选一个方向，深入一点。</h2></div>
            <p>从一个问题出发，把零散的知识串起来。</p>
        </div>
        <div class="home-reading-paths__grid">
            <a v-for="path in paths" :key="path.title" class="home-reading-paths__card" :href="withBase(path.url)">
                <div class="home-reading-paths__label"><span>{{ path.label }}</span><span aria-hidden="true">↗</span></div>
                <h3>{{ path.title }}</h3>
                <p class="home-reading-paths__description">{{ path.description }}</p>
                <ol class="home-reading-paths__steps"><li v-for="(step, index) in path.stages" :key="step"><span>{{ String(index + 1).padStart(2, '0') }}</span>{{ step }}</li></ol>
                <span class="home-reading-paths__action">浏览专题 <span aria-hidden="true">→</span></span>
            </a>
        </div>
    </section>
</template>

<script setup lang="ts">
import { withBase } from 'vitepress'

const paths = [
    {
        label: '01 / JAVASCRIPT', title: '读懂 JavaScript 的运行逻辑',
        description: '从变量提升、作用域到异步执行，把熟悉的语法变成真正理解的原理。',
        stages: ['作用域与闭包：追踪变量的查找与生命周期', '原型与对象：梳理继承链与 this 的指向', '事件循环与异步：推演 Promise 的执行顺序'],
        url: '/articles/?group=languages&topic=javascript',
    },
    {
        label: '02 / RAG', title: '从零搭建知识库问答',
        description: '先用白话理解 RAG，再动手跑通最小实现，逐步走向评估与生产化。',
        stages: ['理解链路：从文档解析到检索、生成与引用', '跑通实现：用 Python 搭建最小问答流程', '验证质量：检查检索效果、拒答与失败分层'],
        url: '/articles/rag/',
    },
    {
        label: '03 / WEBGL', title: '走进浏览器里的图形世界',
        description: '从顶点与着色器开始，理解图形如何经过变换，最终成为屏幕上的像素。',
        stages: ['渲染起点：连接顶点、缓冲区与着色器', '空间变换：理解模型、视图与投影矩阵', '画面表现：用纹理和光照构建三维场景'],
        url: '/articles/?group=graphics&topic=webgl',
    },
]
</script>

<style scoped>
.home-reading-paths {
    margin-top: 24px;
    & .home-reading-paths__heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 16px; }
    & .home-reading-paths__eyebrow { margin: 0 0 6px; color: var(--vp-c-brand-1); font: 9px/1.6 var(--vp-font-family-mono); letter-spacing: 1.7px; }
    & h2 { margin: 0; font-size: 21px; line-height: 1.4; font-weight: 650; letter-spacing: -.4px; }
    & .home-reading-paths__heading > p { margin: 0; color: var(--blog-muted); font-size: 12px; line-height: 1.7; }
    & .home-reading-paths__grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; }
    & .home-reading-paths__card { display: flex; flex-direction: column; min-width: 0; padding: 22px 24px; border: 1px solid var(--blog-border); border-radius: 14px; background: var(--blog-panel); transition: background .2s, border-color .2s; }
    & .home-reading-paths__card:hover { border-color: var(--blog-border-hover); background: var(--blog-hover-bg); }
    & .home-reading-paths__card:hover h3 { color: var(--vp-c-brand-1); }
    & .home-reading-paths__label { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; color: var(--vp-c-brand-1); font: 10px/1.6 var(--vp-font-family-mono); letter-spacing: 1px; }
    & h3 { margin: 0; font-size: 17px; line-height: 1.6; font-weight: 600; }
    & .home-reading-paths__description { margin: 8px 0 16px; color: var(--vp-c-text-2); font-size: 13px; line-height: 1.8; }
    & .home-reading-paths__steps { display: grid; gap: 8px; margin: 0; padding: 14px 0 0; border-top: 1px solid var(--blog-border); color: var(--vp-c-text-2); font-size: 12px; line-height: 1.7; list-style: none; }
    & .home-reading-paths__steps li { display: flex; align-items: baseline; gap: 10px; }
    & .home-reading-paths__steps li > span { flex-shrink: 0; color: var(--vp-c-brand-1); font: 10px/1.7 var(--vp-font-family-mono); }
    & .home-reading-paths__action { display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding-top: 16px; color: var(--vp-c-brand-1); font-size: 12px; }
    @media (max-width: 1199px) {
        & .home-reading-paths__grid { gap: 16px; }
        & .home-reading-paths__card { padding: 20px; }
    }
    @media (max-width: 767px) {
        & .home-reading-paths__heading { align-items: flex-start; flex-direction: column; gap: 8px; }
        & h2 { font-size: 18px; }
        & .home-reading-paths__grid { grid-template-columns: minmax(0, 1fr); }
        & .home-reading-paths__card { padding: 20px 16px; }
    }
    @media (min-width: 960px) {
        display: flex; flex-direction: column; min-height: 0; margin-top: 18px;
        & .home-reading-paths__grid { flex: 1; }
        & .home-reading-paths__heading { margin-bottom: 10px; }
        & .home-reading-paths__heading > div { display: flex; align-items: baseline; gap: 14px; }
        & .home-reading-paths__eyebrow { margin: 0; }
        & h2 { font-size: 17px; }
        & .home-reading-paths__card { min-height: 250px; padding: 18px 20px; }
        & .home-reading-paths__label { margin-bottom: 8px; }
        & h3 { font-size: 16px; }
        & .home-reading-paths__description { margin: 8px 0 12px; font-size: 13px; }
        & .home-reading-paths__steps { padding-top: 12px; }
    }
    @media (min-width: 960px) and (max-height: 800px) {
        margin-top: 10px;
        & .home-reading-paths__heading { margin-bottom: 8px; }
        & .home-reading-paths__card { padding: 10px 14px; }
        & .home-reading-paths__label { margin-bottom: 4px; }
        & .home-reading-paths__steps { margin-top: 6px; padding-top: 6px; }
    }
    @media (prefers-reduced-motion: reduce) {
        & a { transition: none; }
    }
}
</style>
