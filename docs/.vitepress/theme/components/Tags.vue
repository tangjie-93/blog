<template>
    <main class="tag-index" aria-label="标签索引">
        <header class="tag-index__header">
            <div class="tag-index__identity">
                <span class="tag-index__core" aria-hidden="true"><i></i><i></i><b>✳</b></span>
                <div><h1>标签<span class="tag-index__cursor" aria-hidden="true">_</span></h1><p>{{ catalog.entries.length }} 个标签，连接你的下一次探索</p></div>
            </div>
            <ElInput v-model="query" type="search" clearable aria-label="搜索标签" placeholder="查找标签…"><template #prefix><svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" stroke-width="1.5"/><path d="m16 16 4.5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></template></ElInput>
        </header>
        <template v-if="!selectedTag">
            <div class="tag-index__groups">
                <section v-for="group in visibleGroups" :key="group.id" class="tag-index__group" :aria-label="group.label">
                    <div class="tag-index__group-label"><span class="tag-index__group-symbol" aria-hidden="true">{{ groupSymbols[group.id] || '◇' }}</span><h2>{{ group.label }}</h2><span class="tag-index__group-code" aria-hidden="true">{{ groupCodes[group.id] || 'INDEX' }}</span></div>
                    <div class="tag-index__tags"><button v-for="tag in group.entries" :key="tag.name" type="button" :aria-label="`${tag.name}，${tag.count} 篇文章`" @click="selectTag(tag.name)"><span class="tag-index__tag-mark" aria-hidden="true">#</span><span>{{ tag.name }}</span><small>{{ tag.count }}</small></button></div>
                </section>
            </div>
            <p v-if="!visibleGroups.length" class="tag-index__empty" role="status">没有匹配的标签，试试其他关键词。</p>
        </template>
        <section v-else class="tag-index__results" aria-label="标签相关文章">
            <div class="tag-index__result-heading"><button type="button" @click="selectedTag = ''">← 全部标签</button><h2>{{ selectedTag }} <small>{{ matchingPosts.length }} 篇</small></h2></div>
            <ul><li v-for="post in matchingPosts" :key="post.url"><a :href="withBase(post.url)"><span>{{ post.title }}</span><time v-if="post.date" :datetime="post.date">{{ post.date }}</time><span class="tag-index__arrow" aria-hidden="true">↗</span></a></li></ul>
        </section>
    </main>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElInput } from 'element-plus'
import { withBase } from 'vitepress'
import { data as posts } from '../../posts.data'
import { createTagCatalog, normalizeTag } from '../tags'
import { filterPosts } from '../blog'

const groupSymbols: Record<string, string> = { frontend: '{ }', ai: '✳', backend: '>_', engineering: '⌘', foundations: 'ƒ', practice: '↗' }
const groupCodes: Record<string, string> = { frontend: 'INTERFACE', ai: 'INTELLIGENCE', backend: 'DATA LAYER', engineering: 'SYSTEMS', foundations: 'LOGIC', practice: 'EXPLORATION' }
const query = ref('')
const selectedTag = ref('')
const catalog = computed(() => createTagCatalog(posts))
const visibleGroups = computed(() => {
    const keyword = query.value.trim().toLocaleLowerCase()
    const canonical = normalizeTag(query.value).toLocaleLowerCase()
    return catalog.value.groups.map(group => ({ ...group, entries: group.entries.filter(tag => !keyword || tag.name.toLocaleLowerCase().includes(keyword) || !!canonical && tag.name.toLocaleLowerCase().includes(canonical)) })).filter(group => group.entries.length)
})
const matchingPosts = computed(() => {
    const seen = new Set<string>()
    return filterPosts(posts, { tag: selectedTag.value }).filter(post => {
        if (seen.has(post.url)) return false
        seen.add(post.url)
        return true
    })
})
function selectTag(name: string): void { selectedTag.value = name }
watch(query, () => { selectedTag.value = '' })
</script>

<style scoped>
.tag-index {
    --tag-line: color-mix(in srgb, var(--vp-c-brand-1) 24%, var(--blog-border));
    --tag-glow: color-mix(in srgb, var(--vp-c-brand-1) 12%, transparent);
    position: relative; width: 100%; max-width: 1680px; margin: 0 auto; padding: 20px var(--blog-page-gutter) 24px; color: var(--vp-c-text-1);
}
.tag-index__header { position: relative; display: flex; align-items: center; justify-content: space-between; gap: 24px; padding: 4px 0 18px; border-bottom: 1px solid var(--tag-line); }
.tag-index__header::after { content: ''; position: absolute; bottom: -1px; left: 0; width: 120px; height: 2px; background: linear-gradient(90deg, var(--vp-c-brand-1), transparent); box-shadow: 0 0 18px var(--tag-glow); pointer-events: none; }
.tag-index__identity { display: flex; align-items: center; gap: 18px; }
.tag-index__identity h1 { margin: 0; font-size: 26px; line-height: 1.4; font-weight: 600; letter-spacing: 1px; }
.tag-index__identity p { margin: 5px 0 0; color: var(--vp-c-text-2); font-size: 12px; }
.tag-index__cursor { color: var(--vp-c-brand-1); margin-left: 5px; }
.tag-index__core { position: relative; display: grid; place-items: center; flex-shrink: 0; width: 52px; height: 52px; border: 1px solid var(--tag-line); border-radius: 14px; background: radial-gradient(circle, var(--tag-glow), transparent 75%); color: var(--vp-c-brand-1); }
.tag-index__core b { font-size: 27px; font-weight: 400; line-height: 1; }
.tag-index__core i { position: absolute; inset: 7px; border: 1px solid var(--tag-line); border-radius: 50%; }
.tag-index__core i:nth-child(2) { inset: -4px; border: 1px solid transparent; border-top-color: var(--vp-c-brand-1); border-bottom-color: var(--vp-c-brand-1); border-radius: 17px; opacity: .65; animation: tag-orbit 24s linear infinite; }
.tag-index__header .el-input { width: 280px; flex-shrink: 0; }
.tag-index__header :deep(.el-input__wrapper) { min-height: 40px; border-radius: 6px; background: var(--blog-panel); }
.tag-index__header :deep(.el-input__prefix) { color: var(--vp-c-brand-1); }
.tag-index__groups { position: relative; margin-top: 16px; border: 1px solid var(--tag-line); border-radius: 10px; background: color-mix(in srgb, var(--blog-panel) 88%, transparent); overflow: hidden; }
.tag-index__groups::before { content: ''; position: absolute; inset: 0; pointer-events: none; background: linear-gradient(90deg, var(--tag-glow), transparent 28%), linear-gradient(var(--tag-line) 1px, transparent 1px), linear-gradient(90deg, var(--tag-line) 1px, transparent 1px); background-size: auto, 32px 32px, 32px 32px; opacity: .13; }
.tag-index__group { position: relative; display: grid; grid-template-columns: 150px minmax(0, 1fr); align-items: start; gap: 20px; padding: 18px 20px; }
.tag-index__group + .tag-index__group { border-top: 1px solid var(--blog-border); }
.tag-index__group::after { content: ''; position: absolute; top: 0; left: 24px; width: 26px; height: 1px; background: var(--vp-c-brand-1); opacity: .5; }
.tag-index__group:first-child::after { display: none; }
.tag-index__group-label { position: relative; display: grid; grid-template-columns: 28px 1fr; gap: 0 10px; padding-top: 5px; }
.tag-index__group-symbol { grid-row: span 2; display: grid; place-items: center; align-self: start; width: 28px; height: 28px; color: var(--vp-c-brand-1); font: 17px/1 var(--vp-font-family-mono); }
.tag-index__group h2 { margin: 0; font-size: 13px; font-weight: 600; color: var(--vp-c-text-1); line-height: 1.7; }
.tag-index__group-code { margin-top: 4px; color: var(--vp-c-text-2); font: 9px/1.4 var(--vp-font-family-mono); letter-spacing: 1.1px; }
.tag-index__tags { display: flex; flex-wrap: wrap; gap: 9px; }
.tag-index__tags button { position: relative; display: inline-flex; align-items: center; gap: 9px; min-height: 36px; padding: 6px 11px; border: 1px solid var(--blog-border); border-radius: 5px; background: var(--blog-panel); color: var(--vp-c-text-1); font-size: 13px; line-height: 1.6; cursor: pointer; transition: background .18s, border-color .18s, box-shadow .18s; }
.tag-index__tags button:hover, .tag-index__tags button:focus-visible { background: color-mix(in srgb, var(--vp-c-brand-1) 7%, var(--blog-panel)); border-color: var(--vp-c-brand-1); box-shadow: 0 0 15px var(--tag-glow), inset 0 0 12px var(--tag-glow); }
.tag-index__tags button::after { content: ''; position: absolute; top: -1px; right: -1px; width: 5px; height: 5px; border-top: 1px solid var(--vp-c-brand-1); border-right: 1px solid var(--vp-c-brand-1); border-radius: 0 4px 0 0; opacity: 0; transition: opacity .18s; }
.tag-index__tags button:hover::after, .tag-index__tags button:focus-visible::after { opacity: 1; }
.tag-index__tag-mark { color: var(--vp-c-brand-1); font: 11px/1 var(--vp-font-family-mono); opacity: .75; }
.tag-index__tags small { padding-left: 8px; border-left: 1px solid var(--blog-border); color: var(--vp-c-text-2); font: 10px/1 var(--vp-font-family-mono); font-variant-numeric: tabular-nums; }
@keyframes tag-orbit { to { transform: rotate(360deg); } }
.tag-index__empty { padding: 50px 0; color: var(--vp-c-text-2); font-size: 14px; text-align: center; }
.tag-index__result-heading { display: flex; align-items: baseline; gap: 24px; padding: 24px 0 18px; }
.tag-index__result-heading button { color: var(--vp-c-text-2); font-size: 12px; cursor: pointer; }
.tag-index__result-heading h2 { margin: 0; font-size: 20px; font-weight: 550; }
.tag-index__result-heading small { margin-left: 8px; color: var(--vp-c-text-2); font-size: 12px; font-weight: 400; }
.tag-index__results ul { margin: 0; padding: 0; list-style: none; }
.tag-index__results li { border-bottom: 1px solid var(--blog-border); }
.tag-index__results a { display: flex; align-items: baseline; gap: 20px; padding: 15px 4px; color: var(--vp-c-text-1); text-decoration: none; font-size: 14px; line-height: 1.7; }
.tag-index__results a:hover { color: var(--vp-c-brand-1); }
.tag-index__results a > span:first-child { flex: 1; min-width: 0; }
.tag-index__results time { flex-shrink: 0; color: var(--vp-c-text-2); font: 11px var(--vp-font-family-mono); }
.tag-index__arrow { color: var(--vp-c-text-2); font-size: 12px; }
@media (min-width: 900px) and (max-height: 850px) {
    .tag-index { padding-top: 14px; padding-bottom: 16px; }
    .tag-index__header { padding-bottom: 14px; }
    .tag-index__groups { margin-top: 12px; }
    .tag-index__group { grid-template-columns: 135px minmax(0, 1fr); gap: 16px; padding: 11px 16px; }
    .tag-index__tags { gap: 7px; }
    .tag-index__tags button { min-height: 32px; padding: 4px 9px; }
}
@media (max-width: 767px) {
    .tag-index { padding-top: 22px; }
    .tag-index__header { align-items: stretch; flex-direction: column; gap: 16px; padding-bottom: 20px; }
    .tag-index__identity { gap: 14px; }
    .tag-index__identity h1 { font-size: 24px; }
    .tag-index__identity p { font-size: 12px; }
    .tag-index__core { width: 44px; height: 44px; }
    .tag-index__header .el-input { width: 100%; }
    .tag-index__groups { margin-top: 18px; }
    .tag-index__group { grid-template-columns: minmax(0, 1fr); gap: 15px; padding: 20px 15px; }
    .tag-index__group::after { left: 15px; }
    .tag-index__group-label { display: flex; align-items: center; gap: 8px; padding-top: 0; }
    .tag-index__group h2 { font-size: 13px; line-height: 1.6; }
    .tag-index__group-symbol { width: 24px; height: 24px; }
    .tag-index__group-code { margin: 0 0 0 auto; font-size: 8px; }
    .tag-index__tags { gap: 8px; }
    .tag-index__tags button { min-height: 38px; gap: 7px; padding: 6px 9px; font-size: 12px; }
    .tag-index__results a { flex-wrap: wrap; gap: 5px 12px; }
    .tag-index__results a > span:first-child { flex-basis: 100%; }
    .tag-index__result-heading { gap: 18px; }
}
@media (prefers-reduced-motion: reduce) {
    .tag-index__core i:nth-child(2) { animation: none; }
    .tag-index__tags button, .tag-index__tags button::after { transition: none; }
}
</style>
