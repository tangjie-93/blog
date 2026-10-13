<template>
    <main class="home-page">
        <section class="home-page__hero" aria-labelledby="home-title">
            <div class="home-page__intro">
                <p class="home-page__eyebrow"><span/> A DEVELOPER’S DIGITAL GARDEN</p>
                <h1 id="home-title">保持好奇，<br>探索<span>技术边界。</span></h1>
                <p class="home-page__description">你好，我是 Tang Jie。<br>在代码中寻找答案，在实践中建立连接。<br>这里记录前端、图形学与工程化的探索路径。</p>
                <div class="home-page__actions"><a class="home-page__primary" :href="withBase('/timeline/')">探索文章 <span aria-hidden="true">↗</span></a><a class="home-page__secondary" :href="withBase('/about/')">关于我 <span aria-hidden="true">→</span></a></div>
                <div class="home-page__stats"><div><strong>{{ posts.length }}</strong><span>篇技术笔记</span></div><div><strong>{{ tagCount }}</strong><span>个知识标签</span></div><div><strong>∞</strong><span>保持探索</span></div></div>
            </div>
            <HeroOrbit />
        </section>
        <div class="home-page__stack" aria-label="关注的技术"><span>BUILT ON CURIOSITY</span><span>JavaScript</span><span>TypeScript</span><span>Vue.js</span><span>WebGL</span><span>Three.js</span><span>Node.js</span></div>
        <section class="home-page__section" aria-labelledby="topics-title">
            <div class="home-page__heading"><div><p class="home-page__eyebrow">01 / KNOWLEDGE MAP</p><h2 id="topics-title">让知识，彼此连接。</h2></div><a :href="withBase('/tags/')">全部标签 <span aria-hidden="true">↗</span></a></div>
            <div class="home-page__topics">
                <a v-for="topic in topics" :key="topic.title" class="home-page__topic" :href="withBase(topic.url)">
                    <div class="home-page__topic-top"><span class="home-page__icon" aria-hidden="true">{{ topic.icon }}</span><span class="home-page__topic-code">{{ topic.code }}</span><span aria-hidden="true">↗</span></div>
                    <h3>{{ topic.title }}</h3><p>{{ topic.description }}</p><span class="home-page__topic-tags">{{ topic.tags }}</span>
                </a>
            </div>
        </section>
        <section class="home-page__section home-page__latest" aria-labelledby="latest-title">
            <div class="home-page__heading"><div><p class="home-page__eyebrow">02 / LATEST NOTES</p><h2 id="latest-title">最近的思考与记录</h2></div><a :href="withBase('/timeline/')">文章归档 <span aria-hidden="true">↗</span></a></div>
            <a v-for="(post, index) in recentPosts" :key="post.url" class="home-page__post" :href="withBase(post.url)"><span class="home-page__post-number">0{{ index + 1 }}</span><div><span class="home-page__post-tag">{{ post.tags[0] || '技术笔记' }}</span><h3>{{ post.title }}</h3></div><time :datetime="post.date">{{ post.date || '持续积累' }}</time><span class="home-page__post-arrow" aria-hidden="true">↗</span></a>
        </section>
        <div class="home-page__closing"><span aria-hidden="true">✳</span><p>把知识写下来，把原理弄明白。</p><span>NEVER STOP EXPLORING.</span></div>
    </main>
</template>

<script setup lang="ts">
import { withBase } from 'vitepress'
import { data as posts } from '../../posts.data'
import HeroOrbit from './HeroOrbit.vue'

const recentPosts = posts.slice(0, 3)
const tagCount = new Set(posts.flatMap(post => post.tags)).size
const topics = [
    { code: 'FOUNDATIONS', icon: '{ }', title: '语言与框架', description: '从语法走向原理，理解每一行代码背后的运行机制。', tags: 'JavaScript / TypeScript / Vue', url: '/articles/javascript/' },
    { code: 'CREATIVE CODING', icon: '⌘', title: '图形与交互', description: '穿过矩阵与渲染管线，让数学成为屏幕上的想象力。', tags: 'WebGL / Three.js / Graphics', url: '/articles/webgl/' },
    { code: 'UNDER THE HOOD', icon: '>_', title: '工程与基础', description: '连接网络、构建工具与算法，寻找更可靠的解决方式。', tags: 'HTTP / Node.js / Algorithms', url: '/articles/算法/' },
]
</script>

<style scoped>
.home-page {
    max-width: 1200px; margin: 0 auto; padding: 0 40px;
    & .home-page__hero { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: center; gap: 24px; padding: 40px 0 32px; }
    & .home-page__eyebrow { margin: 0 0 24px; color: var(--vp-c-brand-1); font: 11px/1.6 var(--vp-font-family-mono); letter-spacing: 2px; display: flex; align-items: center; gap: 10px; }
    & .home-page__eyebrow > span { width: 6px; height: 6px; border-radius: 50%; background: currentColor; box-shadow: 0 0 14px currentColor; }
    & h1 { font-size: clamp(38px, 4.5vw, 62px); line-height: 1.3; font-weight: 750; letter-spacing: -2px; }
    & h1 span { color: var(--vp-c-brand-1); }
    & .home-page__description { margin: 26px 0 30px; color: var(--vp-c-text-2); font-size: 15px; line-height: 1.95; }
    & .home-page__actions { display: flex; gap: 24px; align-items: center; }
    & .home-page__primary { display: inline-flex; gap: 30px; align-items: center; padding: 13px 23px; border-radius: 6px; background: var(--vp-c-brand-1); color: var(--blog-on-accent); font-size: 14px; font-weight: 650; box-shadow: 0 0 30px var(--vp-c-brand-soft); transition: transform .2s, box-shadow .2s; }
    & .home-page__primary:hover { transform: translateY(-3px); box-shadow: 0 5px 38px var(--vp-c-brand-soft); }
    & .home-page__secondary { color: var(--vp-c-text-2); font-size: 14px; }
    & .home-page__secondary span { margin-left: 16px; }
    & .home-page__stats { display: flex; gap: 36px; margin-top: 44px; }
    & .home-page__stats > div { display: flex; flex-direction: column; gap: 6px; }
    & .home-page__stats > div + div { padding-left: 34px; border-left: 1px solid var(--blog-border); }
    & .home-page__stats strong { font: 27px/1.2 var(--vp-font-family-mono); letter-spacing: -1px; }
    & .home-page__stats span { color: var(--blog-muted); font-size: 12px; }
    & .home-page__stack { display: flex; flex-wrap: wrap; gap: 20px; justify-content: space-between; align-items: center; border-block: 1px solid var(--blog-border); padding: 23px 0; color: var(--vp-c-text-2); font: 13px/1.5 var(--vp-font-family-mono); }
    & .home-page__stack > span:first-child { font-size: 9px; letter-spacing: 1px; color: var(--blog-muted); }
    & .home-page__section { margin-top: 44px; }
    & .home-page__heading { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; margin-bottom: 28px; }
    & .home-page__heading .home-page__eyebrow { margin-bottom: 10px; font-size: 10px; }
    & h2 { font-size: 27px; line-height: 1.4; font-weight: 650; letter-spacing: -.6px; }
    & .home-page__heading > a { color: var(--vp-c-text-2); font-size: 12px; white-space: nowrap; }
    & .home-page__heading > a:hover { color: var(--vp-c-brand-1); }
    & .home-page__topics { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
    & .home-page__topic { padding: 26px; border: 1px solid var(--blog-border); border-radius: 10px; background: var(--blog-panel); transition: border-color .2s, transform .2s; }
    & .home-page__topic:hover { border-color: var(--vp-c-brand-1); transform: translateY(-4px); }
    & .home-page__topic-top { display: flex; align-items: center; gap: 12px; margin-bottom: 28px; color: var(--vp-c-brand-1); }
    & .home-page__icon { font: 22px/1 var(--vp-font-family-mono); }
    & .home-page__topic-code { font: 9px/1.5 var(--vp-font-family-mono); letter-spacing: 1px; color: var(--blog-muted); }
    & .home-page__topic-top > span:last-child { margin-left: auto; }
    & h3 { font-size: 19px; font-weight: 600; }
    & .home-page__topic p { margin-top: 12px; color: var(--vp-c-text-2); font-size: 14px; line-height: 1.9; }
    & .home-page__topic-tags { display: block; padding-top: 22px; margin-top: 24px; border-top: 1px solid var(--blog-border); color: var(--blog-muted); font: 10px/1.6 var(--vp-font-family-mono); }
    & .home-page__post { display: grid; grid-template-columns: 36px 1fr auto 24px; gap: 20px; align-items: center; padding: 24px 8px; border-top: 1px solid var(--blog-border); transition: background .2s; }
    & .home-page__post:last-child { border-bottom: 1px solid var(--blog-border); }
    & .home-page__post:hover { background: var(--vp-c-brand-soft); }
    & .home-page__post-number { font: 12px/1 var(--vp-font-family-mono); color: var(--blog-muted); }
    & .home-page__post-tag { color: var(--vp-c-brand-1); font: 10px/1.5 var(--vp-font-family-mono); }
    & .home-page__post h3 { margin-top: 5px; font-size: 16px; overflow-wrap: anywhere; }
    & .home-page__post time { font: 12px/1.5 var(--vp-font-family-mono); color: var(--blog-muted); }
    & .home-page__post-arrow { color: var(--vp-c-brand-1); }
    & .home-page__closing { display: flex; align-items: center; gap: 16px; padding: 36px 0; color: var(--blog-muted); font-size: 12px; }
    & .home-page__closing > span:first-child { font-size: 24px; color: var(--vp-c-brand-1); }
    & .home-page__closing > span:last-child { margin-left: auto; font: 9px/1.5 var(--vp-font-family-mono); letter-spacing: 2px; }
    @media (max-width: 900px) {
        padding: 0 28px;
        & .home-page__hero { gap: 0; padding-top: 50px; }
        & h1 { font-size: 43px; }
        & .home-page__topic { padding: 20px; }
        & .home-page__topic-code { font-size: 8px; letter-spacing: 0; }
        & .home-page__stack { justify-content: center; }
        & .home-page__stack > span:first-child { display: none; }
    }
    @media (max-width: 640px) {
        padding: 0 22px;
        & .home-page__hero { grid-template-columns: 1fr; padding: 40px 0 25px; }
        & h1 { font-size: clamp(37px, 9vw, 54px); }
        & .home-page__description { font-size: 14px; }
        & .home-page__eyebrow { font-size: 9px; letter-spacing: 1.5px; }
        & .home-page__stats { margin-top: 32px; gap: 26px; }
        & .home-page__stats > div + div { padding-left: 26px; }
        & .hero-orbit { max-width: 340px; margin: 24px auto 0; }
        & .home-page__stack { gap: 14px 24px; font-size: 12px; }
        & .home-page__section { margin-top: 44px; }
        & h2 { font-size: 22px; }
        & .home-page__topics { grid-template-columns: 1fr; gap: 12px; }
        & .home-page__topic-top { margin-bottom: 18px; }
        & .home-page__post { grid-template-columns: 24px 1fr 16px; gap: 10px; }
        & .home-page__post time { grid-column: 2; grid-row: 2; }
        & .home-page__post-arrow { grid-column: 3; grid-row: 1 / 3; }
        & .home-page__closing { padding: 36px 0; flex-wrap: wrap; }
        & .home-page__closing > span:last-child { width: 100%; margin-left: 40px; }
    }
    @media (prefers-reduced-motion: reduce) {
        & a { transition: none; }
        & .home-page__primary:hover, & .home-page__topic:hover { transform: none; }
    }
}
</style>
