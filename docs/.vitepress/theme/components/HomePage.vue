<template>
    <main class="home-page">
        <section class="home-page__hero" aria-labelledby="home-title">
            <div class="home-page__intro">
                <p class="home-page__eyebrow"><span/> A DEVELOPER’S DIGITAL GARDEN</p>
                <h1 id="home-title">保持好奇，<br>探索<span>技术边界。</span></h1>
            </div>
            <div class="home-page__welcome">
                <p class="home-page__description"><span>你好，我是 Tang Jie。记录前端、AI 与工程实践，</span><span>把知识写下来，把原理弄明白。</span></p>
                <div class="home-page__actions">
                    <a class="home-page__primary" :href="withBase('/articles/')">探索文章 <span aria-hidden="true">↗</span></a>
                    <a class="home-page__secondary" :href="withBase('/mindmap/')">文章脑图 <span aria-hidden="true">↗</span></a>
                </div>
            </div>
            <div class="home-page__stats"><div><strong>{{ posts.length }}</strong><span>篇技术笔记</span></div><div><strong>{{ tagCount }}</strong><span>个知识标签</span></div><div><strong>∞</strong><span>保持探索</span></div><p>把知识写下来，把原理弄明白。</p></div>
        </section>
        <div class="home-page__stack" aria-label="关注的技术"><span>持续关注</span><span>JavaScript</span><span>TypeScript</span><span>Vue.js</span><span>WebGL</span><span>Three.js</span><span>Node.js</span></div>
        <div class="home-page__dashboard">
            <section class="home-page__section" aria-labelledby="topics-title">
                <div class="home-page__heading"><div><p class="home-page__eyebrow">01 / KNOWLEDGE MAP</p><h2 id="topics-title">让知识，彼此连接。</h2></div><a :href="withBase('/articles/')">全部文章 <span aria-hidden="true">↗</span></a></div>
                <div class="home-page__topics">
                    <a v-for="topic in topics" :key="topic.title" class="home-page__topic" :href="withBase(topic.url)">
                        <div class="home-page__topic-top"><span class="home-page__icon" aria-hidden="true">{{ topic.icon }}</span><span aria-hidden="true">↗</span></div>
                        <h3>{{ topic.title }}</h3><p class="home-page__topic-summary">{{ topic.summary }}</p><p class="home-page__topic-tech">{{ topic.description }}</p>
                    </a>
                </div>
            </section>
            <section class="home-page__section home-page__latest" aria-labelledby="latest-title">
                <div class="home-page__heading"><div><p class="home-page__eyebrow">02 / LATEST NOTES</p><h2 id="latest-title">最近的思考与记录</h2></div><a :href="withBase('/articles/')">文章归档 <span aria-hidden="true">↗</span></a></div>
                <div class="home-page__posts">
                    <a v-for="(post, index) in recentPosts" :key="post.url" class="home-page__post" :href="withBase(post.url)"><span class="home-page__post-number">0{{ index + 1 }}</span><div><div class="home-page__post-meta"><span>{{ post.tags[0] || '技术笔记' }}</span><time :datetime="post.date">{{ post.date || '持续积累' }}</time></div><h3>{{ post.title }}</h3></div><span class="home-page__post-arrow" aria-hidden="true">↗</span></a>
                </div>
            </section>
        </div>
        <HomeReadingPaths />
        <div class="home-page__closing"><span aria-hidden="true">✳</span><p>在实践中积累，在分享中成长。</p><span>NEVER STOP EXPLORING.</span></div>
    </main>
</template>

<script setup lang="ts">
import { withBase } from 'vitepress'
import { data as posts } from '../../posts.data'
import { createTagCatalog } from '../tags'
import HomeReadingPaths from './components/HomeReadingPaths.vue'

const recentPosts = posts.slice(0, 4)
const tagCount = createTagCatalog(posts).entries.length
const topics = [
    { icon: '{ }', title: '语言与标准', summary: '从语法到运行机制，打牢基础。', description: 'JavaScript · TypeScript · CSS · HTTP', url: '/articles/?group=languages' },
    { icon: '⌘', title: '框架与工程', summary: '理解框架原理，构建可靠应用。', description: 'Vue · React · Node.js · Git', url: '/articles/?group=engineering' },
    { icon: '>_', title: 'AI 与智能应用', summary: '拆解模型原理，动手验证想法。', description: '模型原理 · RAG · Agent · 工具箱', url: '/articles/?group=ai' },
    { icon: '↔', title: '后端开发', summary: '连接服务与数据，补全技术视角。', description: 'Python · Java · 数据库 · Linux', url: '/articles/?group=backend' },
    { icon: '◈', title: '图形与交互', summary: '从渲染管线走向三维交互。', description: 'WebGL · Three.js · 渲染基础', url: '/articles/?group=graphics' },
    { icon: '</>', title: '源码与算法', summary: '读懂实现细节，练习拆解问题。', description: '数据结构 · 算法 · jQuery 源码', url: '/articles/?group=source' },
]
</script>

<style scoped>
.home-page {
    width: 100%; max-width: var(--blog-page-max-width); margin: 0 auto; padding: 24px var(--blog-page-gutter) 0;
    display: grid;
    align-content: start;
    & .home-page__hero { display: grid; grid-template-columns: minmax(300px, .85fr) minmax(320px, 1.3fr) auto; align-items: center; gap: 28px; padding: 26px 32px; border: 1px solid var(--blog-border); border-radius: 14px; background: linear-gradient(120deg, var(--blog-panel), var(--vp-c-brand-soft)); }
    & .home-page__eyebrow { display: flex; align-items: center; gap: 10px; margin: 0 0 16px; color: var(--vp-c-brand-1); font: 10px/1.6 var(--vp-font-family-mono); letter-spacing: 1.7px; }
    & .home-page__eyebrow > span { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
    & h1 { margin: 0; font-size: clamp(32px, 2.6vw, 44px); line-height: 1.25; font-weight: 700; letter-spacing: -1.2px; }
    & h1 span { color: var(--vp-c-brand-1); }
    & .home-page__welcome { min-width: 0; }
    & .home-page__description { margin: 0 0 20px; color: var(--vp-c-text-2); font-size: 15px; line-height: 1.9; }
    & .home-page__description > span { display: block; }
    & .home-page__actions { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
    & .home-page__primary, & .home-page__secondary { display: inline-flex; gap: 24px; align-items: center; min-height: 44px; padding: 10px 18px; border: 1px solid transparent; border-radius: 8px; font-size: 14px; font-weight: 600; transition: background .2s, border-color .2s; }
    & .home-page__primary { background: var(--vp-c-brand-1); color: var(--blog-on-accent); }
    & .home-page__primary:hover { background: var(--vp-c-brand-2); }
    & .home-page__secondary { background: var(--vp-c-bg); color: var(--vp-c-text-1); border-color: var(--blog-border); }
    & .home-page__secondary:hover { border-color: var(--blog-border-hover); background: var(--blog-hover-bg); }
    & .home-page__stats { display: grid; gap: 12px; padding: 4px 0 4px 24px; border-left: 1px solid var(--blog-border); }
    & .home-page__stats > div { display: flex; align-items: baseline; gap: 10px; }
    & .home-page__stats strong { min-width: 46px; font: 23px/1.2 var(--vp-font-family-mono); letter-spacing: -1px; }
    & .home-page__stats span { color: var(--blog-muted); font-size: 12px; }
    & .home-page__stats p { display: none; }
    & .home-page__stack { display: flex; flex-wrap: wrap; gap: 10px 24px; align-items: center; padding: 16px 0; color: var(--vp-c-text-2); font: 12px/1.5 var(--vp-font-family-mono); }
    & .home-page__stack > span:first-child { color: var(--blog-muted); font: 12px/1.5 var(--vp-font-family-base); padding-right: 24px; border-right: 1px solid var(--blog-border); }
    & .home-page__dashboard { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: stretch; gap: 20px; }
    & .home-page__section { display: flex; flex-direction: column; min-width: 0; padding: 24px; border: 1px solid var(--blog-border); border-radius: 14px; background: var(--blog-panel); }
    & .home-page__heading { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; margin-bottom: 20px; }
    & .home-page__heading .home-page__eyebrow { margin-bottom: 6px; font-size: 9px; }
    & h2 { margin: 0; font-size: 21px; line-height: 1.4; font-weight: 650; letter-spacing: -.4px; }
    & .home-page__heading > a { flex-shrink: 0; color: var(--vp-c-text-2); font-size: 12px; }
    & .home-page__heading > a:hover { color: var(--vp-c-brand-1); }
    & .home-page__topics { flex: 1; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
    & .home-page__topic { display: flex; flex-direction: column; min-width: 0; padding: 14px; border: 1px solid var(--blog-border); border-radius: 10px; background: var(--vp-c-bg); transition: border-color .2s, background .2s; }
    & .home-page__topic:hover { border-color: var(--blog-border-hover); background: var(--blog-hover-bg); }
    & .home-page__topic-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; color: var(--vp-c-brand-1); }
    & .home-page__icon { font: 24px/1 var(--vp-font-family-mono); }
    & h3 { margin: 0; font-size: 17px; font-weight: 600; }
    & .home-page__topic-summary { margin: 8px 0 14px; color: var(--vp-c-text-2); font-size: 12px; line-height: 1.7; }
    & .home-page__topic-tech { margin: auto 0 0; padding-top: 10px; border-top: 1px solid var(--blog-border); color: var(--blog-muted); font-size: 11px; line-height: 1.7; }
    & .home-page__posts { flex: 1; display: grid; grid-auto-rows: 1fr; }
    & .home-page__post { display: grid; grid-template-columns: 24px minmax(0, 1fr) 16px; gap: 12px; align-items: center; padding: 16px 0; border-top: 1px solid var(--blog-border); }
    & .home-page__post:hover h3 { color: var(--vp-c-brand-1); }
    & .home-page__post-number { font: 11px/1.5 var(--vp-font-family-mono); color: var(--blog-muted); }
    & .home-page__post-meta { display: flex; flex-wrap: wrap; gap: 6px 12px; margin-bottom: 7px; font-size: 11px; color: var(--blog-muted); }
    & .home-page__post-meta > span { color: var(--vp-c-brand-1); }
    & .home-page__post-meta time { margin-left: auto; }
    & .home-page__post h3 { font-size: 14px; line-height: 1.65; overflow-wrap: anywhere; }
    & .home-page__post-arrow { color: var(--vp-c-brand-1); }
    & .home-page__closing { display: flex; align-items: center; gap: 12px; padding: 20px 0; color: var(--blog-muted); font-size: 12px; }
    & .home-page__closing p { margin: 0; }
    & .home-page__closing > span:first-child { color: var(--vp-c-brand-1); font-size: 20px; }
    & .home-page__closing > span:last-child { margin-left: auto; font: 9px/1.5 var(--vp-font-family-mono); letter-spacing: 1px; }
    @media (max-width: 1199px) {
        & .home-page__hero { grid-template-columns: 1fr 1fr; gap: 20px; padding: 24px; }
        & .home-page__stats { grid-column: 1 / -1; display: flex; gap: 24px; padding: 16px 0 0; border-left: 0; border-top: 1px solid var(--blog-border); }
        & .home-page__dashboard { gap: 16px; }
        & .home-page__topics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        & .home-page__section { padding: 20px; }
    }
    @media (max-width: 959px) {
        & .home-page__dashboard { grid-template-columns: minmax(0, 1fr); }
        & .home-page__topics { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    }
    @media (max-width: 767px) {
        padding-top: 16px;
        & .home-page__hero { grid-template-columns: minmax(0, 1fr); gap: 20px; padding: 24px 20px; }
        & .home-page__eyebrow { font-size: 9px; letter-spacing: 1px; }
        & .home-page__description { font-size: 14px; }
        & .home-page__stats { justify-content: space-between; gap: 10px; padding: 18px 0; }
        & .home-page__stats > div { flex-direction: column; gap: 4px; }
        & .home-page__stats strong { font-size: 22px; }
        & .home-page__stats span { font-size: 11px; }
        & .home-page__stack { gap: 10px 16px; padding: 16px 0; font-size: 11px; }
        & .home-page__stack > span:first-child { display: none; }
        & .home-page__section { padding: 20px 16px; }
        & .home-page__dashboard { gap: 16px; }
        & .home-page__heading { align-items: start; gap: 8px; }
        & h2 { font-size: 18px; }
        & .home-page__topics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        & .home-page__topic { padding: 12px; }
        & .home-page__topic-top { margin-bottom: 10px; }
        & .home-page__topic h3 { font-size: 15px; }
        & .home-page__closing { flex-wrap: wrap; }
        & .home-page__closing > span:last-child { width: 100%; margin-left: 32px; }
    }
    /* 桌面按可用视口分配空间；窄屏保留自然文档流，避免裁切内容。 */
    @media (min-width: 960px) {
        min-height: calc(100svh - var(--vp-nav-height) - var(--vp-layout-top-height, 0px));
        padding-top: 16px;
        grid-template-rows: auto auto minmax(280px, 1fr) auto auto;
        & .home-page__hero { grid-template-columns: max-content minmax(0, 1fr) auto; gap: 28px; padding: 16px 24px; }
        & .home-page__eyebrow { margin-bottom: 10px; }
        & h1 { font-size: clamp(24px, 2.1vw, 32px); white-space: nowrap; }
        & h1 br { display: none; }
        & .home-page__welcome { display: flex; align-items: center; justify-content: space-between; gap: 20px; }
        & .home-page__description { flex: 1; min-width: 0; margin: 0; font-size: 15px; line-height: 1.8; }
        & .home-page__actions { flex-shrink: 0; gap: 10px; }
        & .home-page__primary, & .home-page__secondary { gap: 16px; padding-inline: 14px; }
        & .home-page__stats { grid-column: auto; display: flex; flex-wrap: nowrap; gap: 18px; padding: 0 0 0 20px; border-top: 0; border-left: 1px solid var(--blog-border); }
        & .home-page__stats strong { min-width: 0; font-size: 22px; }
        & .home-page__stats > div { flex-direction: column; align-items: flex-start; gap: 6px; white-space: nowrap; }
        & .home-page__stack { padding: 10px 0; }
        & .home-page__section { min-height: 0; padding: 16px 20px; }
        & .home-page__heading { margin-bottom: 12px; }
        & .home-page__heading .home-page__eyebrow { margin-bottom: 4px; }
        & h2 { font-size: 19px; }
        & .home-page__topics { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
        & .home-page__topic { position: relative; display: grid; grid-template-columns: max-content minmax(0, 1fr); align-content: start; align-items: center; gap: 8px; padding: 12px; }
        & .home-page__topic-top { display: contents; }
        & .home-page__topic-top > span:last-child { position: absolute; right: 10px; top: 10px; font-size: 12px; }
        & .home-page__icon { font-size: 20px; white-space: nowrap; }
        & .home-page__topic h3 { padding-right: 10px; font-size: 15px; line-height: 1.5; }
        & .home-page__topic-summary { grid-column: 1 / -1; margin: 0; }
        & .home-page__topic-tech { grid-column: 1 / -1; margin: 0; padding-top: 8px; }
        & .home-page__post { padding: 10px 0; }
        & .home-page__closing { padding: 10px 0; }
    }
    @media (min-width: 960px) and (max-width: 1199px) {
        & .home-page__hero { gap: 20px; padding-inline: 20px; }
        & .home-page__welcome { align-items: flex-start; flex-direction: column; gap: 8px; }
        & .home-page__description { flex-shrink: 1; font-size: 15px; }
        & .home-page__stats { padding-left: 16px; }
        & .home-page__topic { padding: 10px; gap: 6px; }
        & .home-page__topic h3 { font-size: 13px; }
    }
    @media (min-width: 1200px) and (max-width: 1279px) {
        & .home-page__welcome { align-items: flex-start; flex-direction: column; gap: 8px; }
    }
    @media (min-width: 960px) and (max-height: 800px) {
        padding-top: 12px;
        & .home-page__hero { padding: 12px 20px; }
        & .home-page__description { font-size: 15px; }
        & .home-page__section { padding: 14px 16px; }
        & .home-page__topic { gap: 6px; padding: 10px; }
        & .home-page__topic-summary { display: none; }
        & .home-page__post { padding: 6px 0; }
        & .home-page__post-meta { margin-bottom: 4px; line-height: 1.5; }
        & .home-page__post h3 { line-height: 1.5; }
        & .home-page__closing { padding: 6px 0; }
    }
    @media (prefers-reduced-motion: reduce) {
        & a { transition: none; }
    }
}
</style>
