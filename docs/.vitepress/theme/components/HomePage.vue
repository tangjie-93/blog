<script setup lang="ts">
import { shallowRef, useTemplateRef } from 'vue'
import { withBase } from 'vitepress'
import { data as posts } from '../../posts.data'
import { createTagCatalog } from '../tags'
import HomeReadingPaths from './components/HomeReadingPaths.vue'

const recentPosts = posts.slice(0, 6)
const tagCount = createTagCatalog(posts).entries.length
const topics = [
    { icon: '{ }', title: '语言与标准', summary: '理解语法，打牢运行机制。', description: 'JavaScript · TypeScript · CSS · HTTP', url: '/articles/?group=languages' },
    { icon: '⌘', title: '框架与工程', summary: '理解框架，构建可靠应用。', description: 'Vue · React · Node.js · Git', url: '/articles/?group=engineering' },
    { icon: '>_', title: 'AI 与智能应用', summary: '拆解模型，动手验证想法。', description: '模型原理 · RAG · Agent · 工具箱', url: '/articles/?group=ai' },
    { icon: '↔', title: '后端开发', summary: '连接服务与数据，补全视角。', description: 'Python · Java · 数据库 · Linux', url: '/articles/?group=backend' },
    { icon: '◈', title: '图形与交互', summary: '理解渲染，探索三维交互。', description: 'WebGL · Three.js · 渲染基础', url: '/articles/?group=graphics' },
    { icon: '</>', title: '源码与算法', summary: '读懂源码，练习拆解问题。', description: '数据结构 · 算法 · jQuery 源码', url: '/articles/?group=source' },
    { icon: '↗', title: '独立开发与出海', summary: '验证需求，把产品带向市场。', description: '产品验证 · 海外收款 · 获客运营', url: '/articles/?group=indie' },
]
const panels = [
    { id: 'home-topics', label: '知识专题' },
    { id: 'home-latest', label: '最近文章' },
    { id: 'home-paths', label: '阅读路线' },
] as const
const activePanel = shallowRef<(typeof panels)[number]['id']>(panels[0].id)
const workspace = useTemplateRef<HTMLElement>('workspace')

/** 切换分区时从顶部开始阅读。 */
function selectPanel(id: (typeof panels)[number]['id']): void {
    activePanel.value = id
    workspace.value?.scrollTo({ top: 0, behavior: 'instant' })
}
</script>

<template>
    <main class="home-page">
        <section class="home-page__hero" aria-labelledby="home-title">
            <div class="home-page__intro">
                <p class="home-page__eyebrow"><span /> A DEVELOPER’S DIGITAL GARDEN</p>
                <h1 id="home-title">保持好奇，探索<span>技术边界。</span></h1>
                <p class="home-page__description">你好，我是 Tang Jie。记录前端、AI 与工程实践，把知识写下来，把原理弄明白。</p>
            </div>
            <div class="home-page__hero-controls">
                <div class="home-page__actions">
                    <a class="home-page__primary" :href="withBase('/articles/')">探索文章 <span aria-hidden="true">↗</span></a>
                    <a class="home-page__secondary" :href="withBase('/skills/')">AI 工具箱 <span aria-hidden="true">↗</span></a>
                    <a class="home-page__secondary" :href="withBase('/mindmap/')">文章脑图 <span aria-hidden="true">↗</span></a>
                </div>
                <div class="home-page__stats">
                    <div><strong>{{ posts.length }}</strong><span>篇技术笔记</span></div>
                    <div><strong>{{ tagCount }}</strong><span>个知识标签</span></div>
                </div>
            </div>
        </section>
        <div class="home-page__stack" aria-label="关注的技术"><span>持续关注</span><span>JavaScript</span><span>TypeScript</span><span>Vue.js</span><span>WebGL</span><span>Three.js</span><span>Node.js</span></div>
        <div class="home-page__switcher" role="group" aria-label="首页分区">
            <button v-for="panel in panels" :key="panel.id" type="button" class="blog-choice" :aria-pressed="activePanel === panel.id" :aria-controls="panel.id" @click="selectPanel(panel.id)">{{ panel.label }}</button>
        </div>
        <div ref="workspace" class="home-page__workspace" role="region" aria-label="首页内容" tabindex="0">
            <section id="home-topics" class="home-page__panel home-page__section" :class="{ 'is-active': activePanel === 'home-topics' }" aria-labelledby="topics-title">
                <div class="home-page__heading"><h2 id="topics-title">让知识，彼此连接。</h2><a :href="withBase('/articles/')">全部文章 <span aria-hidden="true">↗</span></a></div>
                <div class="home-page__topics">
                    <a v-for="topic in topics" :key="topic.title" class="home-page__topic" :href="withBase(topic.url)">
                        <h3><span class="home-page__icon" aria-hidden="true">{{ topic.icon }}</span>{{ topic.title }}</h3>
                        <p class="home-page__topic-summary">{{ topic.summary }}</p>
                        <p class="home-page__topic-tech">{{ topic.description }}</p>
                    </a>
                </div>
            </section>
            <section id="home-latest" class="home-page__panel home-page__section" :class="{ 'is-active': activePanel === 'home-latest' }" aria-labelledby="latest-title">
                <div class="home-page__heading"><h2 id="latest-title">最近的思考与记录</h2><a :href="withBase('/articles/')">文章归档 <span aria-hidden="true">↗</span></a></div>
                <div class="home-page__posts">
                    <a v-for="post in recentPosts" :key="post.url" class="home-page__post" :href="withBase(post.url)">
                        <div><div class="home-page__post-meta"><span>{{ post.tags[0] || '技术笔记' }}</span><time :datetime="post.date">{{ post.date || '持续积累' }}</time></div><h3>{{ post.title }}</h3></div><span class="home-page__post-arrow" aria-hidden="true">↗</span>
                    </a>
                </div>
            </section>
            <HomeReadingPaths id="home-paths" class="home-page__panel home-page__paths" :class="{ 'is-active': activePanel === 'home-paths' }" />
        </div>
    </main>
</template>

<style scoped>
.home-page {
    --home-gap: clamp(8px, 1.3dvh, 16px);
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    width: 100%;
    max-width: var(--blog-page-max-width);
    margin-inline: auto;
    padding: var(--home-gap) var(--blog-page-gutter);
    overflow-wrap: anywhere;
}
.home-page__hero {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 12px clamp(16px, 2vw, 28px);
    padding: clamp(10px, 1.7dvh, 22px) clamp(12px, 1.6vw, 24px);
    border: 1px solid var(--blog-border);
    border-radius: 14px;
    background: linear-gradient(120deg, var(--blog-panel), var(--vp-c-brand-soft));
}
.home-page__eyebrow {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 6px;
    color: var(--vp-c-brand-1);
    font: 10px/1.6 var(--vp-font-family-mono);
    letter-spacing: 1px;
}
.home-page__eyebrow > span { flex: none; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.home-page h1 { margin: 0; font-size: clamp(20px, 2vw, 32px); line-height: 1.25; font-weight: 700; letter-spacing: -.7px; }
.home-page h1 span, .home-page__post-arrow { color: var(--vp-c-brand-1); }
.home-page__description { margin-top: 4px; color: var(--vp-c-text-2); font-size: 13px; line-height: 1.6; }
.home-page__hero-controls { display: flex; align-items: center; gap: clamp(12px, 1.5vw, 20px); }
.home-page__actions { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.home-page__actions a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 40px;
    padding: 4px 12px;
    border: 1px solid var(--blog-border);
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    text-align: center;
}
.home-page__primary { background: var(--vp-c-brand-1); color: var(--blog-on-accent); }
.home-page__primary:hover { background: var(--vp-c-brand-2); }
.home-page__secondary { background: var(--vp-c-bg); }
.home-page__secondary:hover { background: var(--blog-hover-bg); }
.home-page__stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; padding-inline-start: clamp(12px, 1.5vw, 20px); border-inline-start: 1px solid var(--blog-border); text-align: center; }
.home-page__stats > div { display: grid; gap: 2px; white-space: nowrap; }
.home-page__stats strong { font: 21px/1.2 var(--vp-font-family-mono); }
.home-page__stats span { color: var(--blog-muted); font-size: 11px; line-height: 1.3; }
.home-page__stack {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 20px;
    padding: 8px 0;
    color: var(--vp-c-text-2);
    font: 11px/1.5 var(--vp-font-family-mono);
}
.home-page__stack > span:first-child { color: var(--blog-muted); padding-right: 16px; border-right: 1px solid var(--blog-border); }
.home-page__switcher { display: none; }
.home-page__workspace {
    display: grid;
    flex: 1;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    /* 用剩余高度分配两排空间，同时保留文字换行后的自然高度。 */
    grid-template-rows: minmax(min-content, 3fr) minmax(min-content, 2fr);
    gap: var(--home-gap);
    min-height: 0;
    overflow: auto;
    overscroll-behavior: contain;
    scrollbar-width: none;
}
.home-page__workspace::-webkit-scrollbar { display: none; }
.home-page__workspace:focus-visible { outline: 2px solid var(--blog-focus-ring); outline-offset: 2px; }
.home-page__paths { grid-column: 1 / -1; }
.home-page__section {
    display: flex;
    flex-direction: column;
    min-width: 0;
    padding: clamp(10px, 1.7dvh, 20px);
    border: 1px solid var(--blog-border);
    border-radius: 14px;
    background: var(--blog-panel);
}
.home-page__heading { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; margin-bottom: 8px; }
.home-page h2 { margin: 0; font-size: 18px; line-height: 1.4; font-weight: 650; }
.home-page__heading > a { flex-shrink: 0; color: var(--vp-c-text-2); font-size: 12px; }
.home-page__heading > a:hover, .home-page__post:hover h3 { color: var(--vp-c-brand-1); }
.home-page__topics {
    --topic-columns: 3;
    --topic-gap: 8px;
    display: flex;
    flex: 1;
    flex-wrap: wrap;
    gap: var(--topic-gap);
}
.home-page__topic {
    /* 每排独立均分宽度，最后一排不用留空位。 */
    flex: 1 0 calc((100% - (var(--topic-columns) - 1) * var(--topic-gap)) / var(--topic-columns));
    min-width: 0;
    padding: 12px;
    border: 1px solid var(--blog-border);
    border-radius: 8px;
    background: var(--vp-c-bg);
}
.home-page__topic:hover { border-color: var(--blog-border-hover); background: var(--blog-hover-bg); }
.home-page__topic h3 { display: flex; align-items: baseline; gap: 5px; font-size: 14px; line-height: 1.4; font-weight: 600; }
.home-page__icon { flex: none; color: var(--vp-c-brand-1); font: 13px/1 var(--vp-font-family-mono); white-space: nowrap; }
.home-page__topic-summary { margin-top: 4px; color: var(--vp-c-text-2); font-size: 12px; line-height: 1.5; }
.home-page__topic-tech { margin-top: 4px; color: var(--blog-muted); font-size: 11px; line-height: 1.5; }
.home-page__posts { display: grid; flex: 1; }
.home-page__post { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 8px; padding: 5px 0; border-top: 1px solid var(--blog-border); }
.home-page__post-meta { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 0 8px; color: var(--blog-muted); font-size: 11px; line-height: 1.5; }
.home-page__post-meta > span { color: var(--vp-c-brand-1); }
.home-page__post h3 { margin: 0; font-size: 13px; line-height: 1.5; font-weight: 600; }
@media (min-width: 1280px) {
    .home-page__topics { --topic-columns: 4; }
}
@media (min-width: 1280px) and (min-height: 800px) {
    .home-page__hero { grid-template-columns: max-content minmax(0, 1fr); }
    .home-page__actions { flex: 1; }
}
@media (min-width: 1280px) and (max-height: 860px) {
    .home-page__eyebrow { display: none; }
    .home-page__hero { padding-block: 10px; }
}
@media (width < 1280px), (height < 800px) {
    .home-page__description, .home-page__stats, .home-page__stack { display: none; }
    .home-page__switcher { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 4px; margin-block: var(--home-gap); }
    .home-page__switcher button { min-height: 36px; padding: 4px; border-radius: 6px; font-size: 13px; line-height: 1.4; }
    .home-page__workspace { grid-template-columns: minmax(0, 1fr); grid-template-rows: minmax(min-content, 1fr); }
    .home-page__panel:not(.is-active) { display: none; }
}
@media (max-width: 600px) {
    .home-page__hero { grid-template-columns: minmax(0, 1fr); gap: 8px; }
    .home-page__actions { width: 100%; gap: 4px; }
    .home-page__actions a { padding-inline: 4px; }
    .home-page__actions a > span { display: none; }
    .home-page__topics { --topic-columns: 2; }
}
@media (max-height: 480px) {
    .home-page__eyebrow { display: none; }
    .home-page__hero { padding-block: 6px; }
}
</style>
