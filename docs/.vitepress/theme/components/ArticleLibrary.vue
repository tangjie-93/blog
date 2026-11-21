<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useData, withBase } from 'vitepress'
import { articleGroups, categoryLabels, postCategory } from '../../articleTaxonomy.mjs'
import { data as posts } from '../../posts.data'
import BlogList from './BlogList.vue'

/** 同一套线性图标，颜色继承分类按钮，文字仍提供完整语义。 */
const groupIcons: Record<string, string> = {
    languages: 'm8 7-5 5 5 5m8-10 5 5-5 5m-3-13-2 16',
    engineering: 'm12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5',
    ai: 'M8 8h8v8H8zM6 5h12a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1ZM9 2v3m6-3v3M9 19v3m6-3v3M2 9h3m-3 6h3m14-6h3m-3 6h3',
    backend: 'M4 3h16v7H4zM4 14h16v7H4zM8 6.5h.01M8 17.5h.01M12 6.5h5M12 17.5h5',
    graphics: 'm12 3 9 5v8l-9 5-9-5V8l9-5Zm-9 5 9 5 9-5m-9 5v8M7.5 5.5l9 5',
    source: 'M6 6v12m0-9h8a4 4 0 0 0 4-4M4 4h4v4H4zM4 16h4v4H4zM16 2h4v4h-4z',
}
const { theme } = useData()
/** 复用真实导航入口；没有目录首页的旧专题回退到已配置的首篇文章。 */
function categoryHome(category: string): string {
    const groups = theme.value.sidebar?.[`/articles/${category}/`]
    return groups?.[0]?.link || groups?.[0]?.items?.[0]?.link || ''
}
const selectedGroup = ref('')
const selectedCategory = ref('')
const activeGroup = computed(() => articleGroups.find(group => group.id === selectedGroup.value))
const title = computed(() => selectedCategory.value ? categoryLabels[selectedCategory.value] || selectedCategory.value : activeGroup.value?.text || '全部文章')
const count = (categories: string[]) => posts.filter(post => categories.includes(postCategory(post.url))).length
function select(group: string, category = '', updateUrl = true) {
    selectedGroup.value = group
    selectedCategory.value = category
    if (updateUrl && typeof window !== 'undefined') {
        const url = new URL(window.location.href)
        url.searchParams.delete('group')
        url.searchParams.delete('topic')
        if (group) url.searchParams.set('group', group)
        if (category) url.searchParams.set('topic', category)
        window.history.replaceState({}, '', url)
    }
}
function restore() {
    const query = new URLSearchParams(window.location.search)
    const group = articleGroups.find(item => item.id === query.get('group'))
    const topic = query.get('topic') || ''
    select(group?.id || '', group?.categories.includes(topic) ? topic : '', false)
}
onMounted(() => { restore(); window.addEventListener('popstate', restore) })
onUnmounted(() => { window.removeEventListener('popstate', restore) })
</script>

<template>
    <div class="article-library">
        <aside class="library-sidebar" aria-label="技术分类">
            <div class="library-sidebar__heading"><span>LIBRARY</span><strong>按方向探索</strong></div>
            <nav class="library-groups" aria-label="选择文章大类">
                <button type="button" class="blog-choice" :aria-pressed="!selectedGroup" @click="select('')"><svg class="library-group-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" /></svg><span>全部文章</span><small>{{ posts.length }}</small></button>
                <button v-for="group in articleGroups" :key="group.id" type="button" class="blog-choice" :aria-pressed="selectedGroup === group.id" @click="select(group.id)"><svg class="library-group-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path :d="groupIcons[group.id]" /></svg><span>{{ group.text }}</span><small>{{ count(group.categories) }}</small></button>
            </nav>
            <p class="library-sidebar__hint">分类找方向，搜索找问题。</p>
        </aside>
        <main class="library-content" :aria-label="`${title} · 文章浏览`">
            <div v-if="activeGroup" class="library-toolbar">
                <div class="library-topics" role="group" aria-label="选择具体专题">
                    <button type="button" class="blog-choice" :aria-pressed="!selectedCategory" @click="select(selectedGroup)">全部</button>
                    <div v-for="category in activeGroup.categories" :key="category" class="library-topic" :class="{ 'is-selected': selectedCategory === category }">
                        <button type="button" class="blog-choice" :aria-pressed="selectedCategory === category" @click="select(selectedGroup, category)">{{ categoryLabels[category] || category }}</button>
                        <a v-if="categoryHome(category)" class="library-topic__home" :href="withBase(categoryHome(category))" :aria-label="`${categoryLabels[category] || category} 专题首页`" :title="`打开 ${categoryLabels[category] || category} 专题首页`"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m3 10 9-7 9 7M5 9v11h5v-6h4v6h5V9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
                    </div>
                </div>
                <div v-if="activeGroup.resources?.length" class="library-resources">
                    <a v-for="resource in activeGroup.resources" :key="resource.link" :href="withBase(resource.link)" :title="resource.description">{{ resource.text }} <span aria-hidden="true">↗</span></a>
                </div>
            </div>
            <BlogList fit-screen :group="selectedGroup" :category="selectedCategory" />
        </main>
    </div>
</template>

<style scoped>
.article-library {
    display: grid;
    grid-template-columns: 232px minmax(0, 1fr);
    width: 100%;
    max-width: var(--blog-page-max-width);
    margin: 0 auto;
    min-height: 0;
    flex: 1;

    & .library-sidebar { padding: 32px 20px 20px var(--blog-page-gutter); }
    & .library-sidebar__heading {
        display: grid; gap: 8px; margin-bottom: 24px; padding-inline: 12px;
        & > span { font: 11px/1.5 var(--vp-font-family-mono); letter-spacing: 1.5px; color: var(--blog-muted); }
        & > strong { font-size: 17px; font-weight: 600; }
    }
    & .library-groups {
        display: grid; gap: 6px;
        & button { display: flex; justify-content: space-between; align-items: center; gap: 10px; min-height: 48px; padding: 11px 12px; border-radius: 9px; text-align: left; font-size: 15px; line-height: 1.5; cursor: pointer; }
        & .library-group-icon { width: 18px; height: 18px; flex-shrink: 0; fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
        & button > span { flex: 1; white-space: nowrap; }
        & small { min-width: 26px; text-align: right; color: var(--blog-muted); font: 12px/1.5 var(--vp-font-family-mono); font-variant-numeric: tabular-nums; }
        & button[aria-pressed='true'] small { color: inherit; }
    }
    & .library-sidebar__hint { font-size: 12px; color: var(--blog-muted); margin: 24px 12px 0; line-height: 1.8; }
    & .library-content { display: flex; flex-direction: column; min-height: 0; min-width: 0; padding-top: 20px; }
    & .library-toolbar { display: flex; flex-shrink: 0; flex-wrap: wrap; align-items: center; gap: 8px 20px; padding: 4px var(--blog-page-gutter) 12px; }
    & .library-topics {
        display: flex; flex: 1; flex-wrap: wrap; gap: 6px; min-width: 0;
        & button { min-height: 34px; padding: 6px 12px; border-radius: 8px; font-size: 12px; cursor: pointer; }
    }
    & .library-topic {
        display: inline-flex; align-items: center; flex-shrink: 0; border: 1px solid var(--blog-border); border-radius: 8px; background: var(--blog-panel);
        & > button { border-radius: 7px 0 0 7px; font-size: 13px; }
        &.is-selected { border-color: var(--blog-selected-border); }
    }
    & .library-topic__home {
        display: inline-flex; align-items: center; justify-content: center; align-self: stretch; min-width: 32px; border-left: 1px solid var(--blog-border); border-radius: 0 7px 7px 0; color: var(--vp-c-brand-1); transition: background-color 160ms ease;
        &:hover { background: var(--vp-c-brand-soft); }
    }
    & .library-resources {
        display: flex; flex-shrink: 0; gap: 8px; margin-left: auto;
        & a { display: inline-flex; align-items: center; gap: 8px; min-height: 34px; padding: 6px 10px; border-radius: 6px; color: var(--vp-c-brand-1); font-size: 12px; white-space: nowrap; transition: background-color 160ms ease; }
        & a:hover { background: var(--vp-c-brand-soft); }
    }
    @media (max-width: 899px) {
        display: block;
        & .library-sidebar { padding: 16px var(--blog-page-gutter) 12px; border-bottom: 1px solid var(--blog-border); }
        & .library-sidebar__heading, & .library-sidebar__hint { display: none; }
        & .library-groups { display: flex; flex-wrap: wrap; gap: 6px; }
        & .library-groups button { min-height: 40px; gap: 8px; padding: 8px 10px; }
        & .library-groups small { min-width: 0; }
        & .library-content { padding-top: 12px; }
        & .library-content :deep(.blog-list) { padding: 0 var(--blog-page-gutter) 20px; }
    }
}
</style>
