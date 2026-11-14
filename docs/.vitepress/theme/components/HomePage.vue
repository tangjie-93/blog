<template>
    <main class="home-page">
        <section class="home-page__hero" aria-labelledby="home-title">
            <HeroOrbit />
            <div class="home-page__intro">
                <p class="home-page__eyebrow"><span/> A DEVELOPER’S DIGITAL GARDEN</p>
                <h1 id="home-title">保持好奇，<br>探索<span>技术边界。</span></h1>
            </div>
            <div class="home-page__welcome">
                <p class="home-page__description">你好，我是 Tang Jie。<br>在代码中寻找答案，在实践中建立连接。<br>这里记录前端、图形学与工程化的探索路径。</p>
                <div class="home-page__actions">
                    <a class="home-page__primary" :href="withBase('/timeline/')">探索文章 <span aria-hidden="true">↗</span></a>
                    <a class="home-page__secondary" :href="withBase('/mindmap/')">文章脑图 <span aria-hidden="true">↗</span></a>
                </div>
            </div>
            <div class="home-page__stats"><div><strong>{{ posts.length }}</strong><span>篇技术笔记</span></div><div><strong>{{ tagCount }}</strong><span>个知识标签</span></div><div><strong>∞</strong><span>保持探索</span></div><p>把知识写下来，把原理弄明白。</p></div>
        </section>
        <div class="home-page__stack" aria-label="关注的技术"><span>持续关注</span><span>JavaScript</span><span>TypeScript</span><span>Vue.js</span><span>WebGL</span><span>Three.js</span><span>Node.js</span></div>
        <div class="home-page__dashboard">
            <section class="home-page__section" aria-labelledby="topics-title">
                <div class="home-page__heading"><div><p class="home-page__eyebrow">01 / KNOWLEDGE MAP</p><h2 id="topics-title">让知识，彼此连接。</h2></div><a :href="withBase('/tags/')">全部标签 <span aria-hidden="true">↗</span></a></div>
                <div class="home-page__topics">
                    <a v-for="topic in topics" :key="topic.title" class="home-page__topic" :href="withBase(topic.url)">
                        <div class="home-page__topic-top"><span class="home-page__icon" aria-hidden="true">{{ topic.icon }}</span><span aria-hidden="true">↗</span></div>
                        <span class="home-page__topic-code">{{ topic.code }}</span><h3>{{ topic.title }}</h3><p>{{ topic.description }}</p><span class="home-page__topic-tags">{{ topic.tags }}</span>
                    </a>
                </div>
            </section>
            <section class="home-page__section home-page__latest" aria-labelledby="latest-title">
                <div class="home-page__heading"><div><p class="home-page__eyebrow">02 / LATEST NOTES</p><h2 id="latest-title">最近的思考与记录</h2></div><a :href="withBase('/timeline/')">文章归档 <span aria-hidden="true">↗</span></a></div>
                <div class="home-page__posts">
                    <a v-for="(post, index) in recentPosts" :key="post.url" class="home-page__post" :href="withBase(post.url)"><span class="home-page__post-number">0{{ index + 1 }}</span><div><div class="home-page__post-meta"><span>{{ post.tags[0] || '技术笔记' }}</span><time :datetime="post.date">{{ post.date || '持续积累' }}</time></div><h3>{{ post.title }}</h3></div><span class="home-page__post-arrow" aria-hidden="true">↗</span></a>
                </div>
            </section>
        </div>
        <div class="home-page__closing"><span aria-hidden="true">✳</span><p>在实践中积累，在分享中成长。</p><span>NEVER STOP EXPLORING.</span></div>
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
    width: 100%; max-width: var(--blog-page-max-width); margin: 0 auto; padding: 24px var(--blog-page-gutter) 0;
    min-height: calc(100svh - var(--vp-nav-height) - var(--vp-layout-top-height, 0px));
    display: grid;
    grid-template-rows: minmax(auto, .65fr) auto minmax(auto, 1fr) auto;
    & .home-page__hero { position: relative; isolation: isolate; overflow: hidden; display: grid; grid-template-columns: 1.15fr 1fr; align-items: center; gap: 28px 48px; padding: 32px 40px 0; border: 1px solid var(--blog-border); border-radius: 16px; background: linear-gradient(120deg, var(--blog-panel), var(--vp-c-brand-soft)); }
    & .hero-orbit { position: absolute; z-index: -1; width: 460px; right: -100px; top: -90px; opacity: .16; pointer-events: none; }
    & .home-page__eyebrow { display: flex; align-items: center; gap: 10px; margin: 0 0 16px; color: var(--vp-c-brand-1); font: 10px/1.6 var(--vp-font-family-mono); letter-spacing: 1.7px; }
    & .home-page__eyebrow > span { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
    & h1 { margin: 0; font-size: clamp(34px, 3.1vw, 52px); line-height: 1.25; font-weight: 700; letter-spacing: -1.5px; }
    & h1 span { color: var(--vp-c-brand-1); }
    & .home-page__welcome { min-width: 0; }
    & .home-page__description { margin: 0 0 20px; color: var(--vp-c-text-2); font-size: 15px; line-height: 1.9; }
    & .home-page__actions { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
    & .home-page__primary, & .home-page__secondary { display: inline-flex; gap: 24px; align-items: center; min-height: 44px; padding: 10px 18px; border: 1px solid transparent; border-radius: 8px; font-size: 14px; font-weight: 600; transition: background .2s, border-color .2s; }
    & .home-page__primary { background: var(--vp-c-brand-1); color: var(--blog-on-accent); }
    & .home-page__primary:hover { background: var(--vp-c-brand-2); }
    & .home-page__secondary { background: var(--vp-c-bg); color: var(--vp-c-text-1); border-color: var(--blog-border); }
    & .home-page__secondary:hover { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); }
    & .home-page__stats { grid-column: 1 / -1; display: flex; align-items: center; gap: 28px; padding: 20px 0; border-top: 1px solid var(--blog-border); }
    & .home-page__stats > div { display: flex; align-items: baseline; gap: 10px; }
    & .home-page__stats > div + div { padding-left: 28px; border-left: 1px solid var(--blog-border); }
    & .home-page__stats strong { font: 24px/1.2 var(--vp-font-family-mono); letter-spacing: -1px; }
    & .home-page__stats span, & .home-page__stats p { color: var(--blog-muted); font-size: 12px; }
    & .home-page__stats p { margin: 0 0 0 auto; }
    & .home-page__stack { display: flex; flex-wrap: wrap; gap: 12px 28px; align-items: center; padding: 20px 0; color: var(--vp-c-text-2); font: 12px/1.5 var(--vp-font-family-mono); }
    & .home-page__stack > span:first-child { color: var(--blog-muted); font: 12px/1.5 var(--vp-font-family-base); padding-right: 24px; border-right: 1px solid var(--blog-border); }
    & .home-page__dashboard { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); gap: 24px; }
    & .home-page__section { display: flex; flex-direction: column; min-width: 0; padding: 24px; border: 1px solid var(--blog-border); border-radius: 14px; background: var(--blog-panel); }
    & .home-page__heading { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; margin-bottom: 20px; }
    & .home-page__heading .home-page__eyebrow { margin-bottom: 6px; font-size: 9px; }
    & h2 { margin: 0; font-size: 21px; line-height: 1.4; font-weight: 650; letter-spacing: -.4px; }
    & .home-page__heading > a { flex-shrink: 0; color: var(--vp-c-text-2); font-size: 12px; }
    & .home-page__heading > a:hover { color: var(--vp-c-brand-1); }
    & .home-page__topics { flex: 1; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
    & .home-page__topic { display: flex; flex-direction: column; min-width: 0; padding: 20px; border: 1px solid var(--blog-border); border-radius: 10px; background: var(--vp-c-bg); transition: border-color .2s, background .2s; }
    & .home-page__topic:hover { border-color: var(--vp-c-brand-1); background: var(--vp-c-brand-soft); }
    & .home-page__topic-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px; color: var(--vp-c-brand-1); }
    & .home-page__icon { font: 24px/1 var(--vp-font-family-mono); }
    & .home-page__topic-code { margin-bottom: 8px; font: 9px/1.5 var(--vp-font-family-mono); letter-spacing: .6px; color: var(--blog-muted); }
    & h3 { margin: 0; font-size: 17px; font-weight: 600; }
    & .home-page__topic p { margin: 10px 0 20px; color: var(--vp-c-text-2); font-size: 13px; line-height: 1.8; }
    & .home-page__topic-tags { display: block; padding-top: 14px; margin-top: auto; border-top: 1px solid var(--blog-border); color: var(--blog-muted); font: 10px/1.7 var(--vp-font-family-mono); overflow-wrap: anywhere; }
    & .home-page__posts { flex: 1; display: grid; grid-template-rows: repeat(3, 1fr); }
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
        grid-template-rows: auto auto 1fr auto;
        & .home-page__dashboard { grid-template-columns: minmax(0, 1fr); }
        & .home-page__hero { gap: 24px; padding: 28px 28px 0; }
        & .home-page__stats p { display: none; }
    }
    @media (max-width: 767px) {
        padding-top: 16px;
        & .home-page__hero { grid-template-columns: minmax(0, 1fr); gap: 20px; padding: 24px 20px 0; }
        & .hero-orbit { width: 320px; right: -120px; opacity: .1; }
        & .home-page__eyebrow { font-size: 9px; letter-spacing: 1px; }
        & .home-page__description { font-size: 14px; }
        & .home-page__stats { justify-content: space-between; gap: 10px; padding: 18px 0; }
        & .home-page__stats > div { flex-direction: column; gap: 4px; }
        & .home-page__stats > div + div { padding-left: 12px; }
        & .home-page__stats strong { font-size: 22px; }
        & .home-page__stats span { font-size: 11px; }
        & .home-page__stack { gap: 10px 16px; padding: 16px 0; font-size: 11px; }
        & .home-page__stack > span:first-child { display: none; }
        & .home-page__section { padding: 20px 16px; }
        & .home-page__dashboard { gap: 16px; }
        & .home-page__heading { align-items: start; gap: 8px; }
        & h2 { font-size: 18px; }
        & .home-page__topics { grid-template-columns: minmax(0, 1fr); }
        & .home-page__topic { padding: 18px; }
        & .home-page__topic-top { margin-bottom: 16px; }
        & .home-page__closing { flex-wrap: wrap; }
        & .home-page__closing > span:last-child { width: 100%; margin-left: 32px; }
    }
    @media (prefers-reduced-motion: reduce) {
        & a { transition: none; }
    }
}
</style>
