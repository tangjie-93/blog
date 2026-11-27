<template>
    <section ref="listElement" class="blog-list" :class="{ 'blog-list--fit': fitActive, 'blog-list--rows': viewMode === 'list' }" aria-label="文章列表">
        <div class="blog-list__view-toolbar">
            <div class="blog-list__heading">
                <h1>{{ props.title || '全部文章' }}</h1><span>{{ filteredPosts.length }} 篇</span>
            </div>
            <slot name="toolbar" />
            <div class="blog-list__view-controls">
                <div class="blog-list__date-controls" role="group" aria-label="按时间浏览文章">
                    <ElSelect v-model="selectedYear" class="blog-list__year-select" aria-label="筛选创建年份">
                        <template #header><span class="blog-list__year-hint">按创建日期统计</span></template>
                        <ElOption v-for="{ value, count } in yearCounts" :key="value" :value="value" :label="`${yearLabel(value)} · ${count} 篇`" />
                    </ElSelect>
                    <ElSelect v-model="dateOrder" class="blog-list__sort-select" aria-label="按创建日期排序">
                        <ElOption value="newest" label="创建：从新到旧" />
                        <ElOption value="oldest" label="创建：从旧到新" />
                    </ElSelect>
                </div>
                <div class="blog-list__view-switch" role="group" aria-label="文章展示形式">
                    <button type="button" :aria-pressed="viewMode === 'cards'" @click="setViewMode('cards')"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" /></svg>卡片</button>
                    <button type="button" :aria-pressed="viewMode === 'list'" @click="setViewMode('list')"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5h13M8 12h13M8 19h13M3 5h.01M3 12h.01M3 19h.01" /></svg>列表</button>
                </div>
            </div>
        </div>
        <div ref="gridViewport" class="blog-list__viewport">
            <div :key="`${props.tag || ''}-${props.type || ''}-${page}`" class="blog-list__grid" :style="gridStyle">
                <a v-for="(post, index) in visiblePosts" :key="post.url" class="blog-list__card" :href="withBase(post.url)" :aria-label="displayTitle(post.title)">
                    <div class="blog-list__eyebrow">
                        <span>{{ post.type || '技术笔记' }}</span>
                        <span class="blog-list__index" aria-hidden="true">{{ String((page - 1) * pageSize + index + 1).padStart(2, '0') }}</span>
                    </div>
                    <h2 class="blog-list__title"><span class="blog-list__title-text">{{ displayTitle(post.title) }}<span v-if="viewMode === 'cards'" class="blog-list__arrow" aria-hidden="true">↗</span></span></h2>
                    <p v-if="post.note" class="blog-list__note" v-html="renderInlineMarkdown(post.note)"></p>
                    <div class="blog-list__meta">
                        <div class="blog-list__tags" :title="post.tags.join(' · ')">
                            <span v-for="tag in post.tags" :key="tag" class="blog-list__tag">{{ tag }}</span>
                        </div>
                        <ArticleDates :post="post" />
                    </div>
                </a>
            </div>
            <p v-if="!filteredPosts.length" class="blog-list__empty">暂无文章</p>
            <footer ref="pagination" class="blog-list__pagination">
                <p class="blog-list__count" role="status" aria-live="polite" aria-atomic="true">
                    <strong>共 {{ filteredPosts.length }} 篇文章</strong>
                    <span v-if="filteredPosts.length">当前 {{ (page - 1) * pageSize + 1 }}–{{ Math.min(page * pageSize, filteredPosts.length) }} 篇</span>
                </p>
                <div class="blog-list__pagination-controls">
                    <ElButton native-type="button" :disabled="page === 1" @click="changePage(page - 1)">上一页</ElButton>
                    <ElSelect :model-value="page" class="blog-list__page-select" aria-label="选择页码" @change="changePage">
                        <ElOption v-for="number in pageCount" :key="number" :value="number" :label="`第 ${number} / ${pageCount} 页`" />
                    </ElSelect>
                    <ElButton native-type="button" :disabled="page === pageCount" @click="changePage(page + 1)">下一页</ElButton>
                </div>
            </footer>
        </div>
    </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { ElButton, ElSelect, ElOption } from 'element-plus'
import { withBase } from 'vitepress'
import { data as posts } from '../../posts.data'
import ArticleDates from './ArticleDates.vue'
import { filterPosts, postYearCounts, renderInlineMarkdown, sortPostsByDate } from '../blog'
import type { PostDateOrder, PostYearFilter } from '../blog'
import { articleGroups, postCategory } from '../../articleTaxonomy.mjs'
import { useFitPageSize } from '../useFitPageSize'

// 就地声明 props：开发服务器会缓存跨文件类型解析结果，若沿用导入的 BlogListProps，
// 运行中的服务可能仍在用旧字段表，新加的 fitScreen 会变成普通属性而非布尔 prop，整屏分页静默失效。
const props = defineProps<{
    title?: string
    tag?: string
    type?: string
    group?: string
    category?: string
    /** 铺满一屏：按容器可用空间计算每页数量，由调用页负责提供固定高度。 */
    fitScreen?: boolean
    /** 设为 0 时，窄屏也保持整屏分页。 */
    fitMinViewportWidth?: number
}>()
type ViewMode = 'cards' | 'list'
const viewMode = ref<ViewMode>('cards')
const viewStorageKey = 'blog-article-view'
function setViewMode(mode: ViewMode): void {
    if (mode === viewMode.value) return
    viewMode.value = mode
    page.value = 1
    try { localStorage.setItem(viewStorageKey, mode) } catch { /* 存储不可用时仍可正常切换。 */ }
}
onMounted(() => {
    try {
        if (localStorage.getItem(viewStorageKey) === 'list') viewMode.value = 'list'
    } catch { /* SSR 和限制存储的浏览器均保留默认卡片视图。 */ }
})
const page = ref(1)
const listElement = ref<HTMLElement | null>(null)
const gridViewport = ref<HTMLElement | null>(null)
const pagination = ref<HTMLElement | null>(null)
const selectedYear = ref<PostYearFilter>('all')
const dateOrder = ref<PostDateOrder>('newest')
const scopedPosts = computed(() => filterPosts(posts, props).filter(post => {
    const category = postCategory(post.url)
    if (props.category) return category === props.category
    if (!props.group) return true
    return articleGroups.find(group => group.id === props.group)?.categories.includes(category) ?? false
}))
const yearCounts = computed(() => postYearCounts(scopedPosts.value))
const filteredPosts = computed(() => sortPostsByDate(
    selectedYear.value === 'all' ? scopedPosts.value : scopedPosts.value.filter(post => (post.createdYear ?? 'unknown') === selectedYear.value),
    dateOrder.value
))

function yearLabel(year: PostYearFilter): string {
    if (year === 'all') return '全部年份'
    if (year === 'unknown') return '未注明年份'
    return `${year} 年`
}

const { pageSize, gridStyle, active: fitActive } = useFitPageSize(gridViewport, {
    enabled: props.fitScreen === true,
    fallbackSize: 24,
    minCardWidth: () => viewMode.value === 'list' ? Number.MAX_SAFE_INTEGER : 300,
    // 卡片保留完整行高；列表固定单列，标题简介与右侧元信息并排展示。
    minCardHeight: () => viewMode.value === 'list' ? 80 : 240,
    maxCardHeight: () => viewMode.value === 'list' ? 84 : 256,
    minViewportWidth: props.fitMinViewportWidth ?? 900,
    minViewportHeight: 640,
    footer: pagination
})
const pageCount = computed(() => Math.max(1, Math.ceil(filteredPosts.value.length / pageSize.value)))
const visiblePosts = computed(() => filteredPosts.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value))

/** 归档卡片已用右上角编号表示顺序，标题保留正文名称即可。 */
function displayTitle(title: string): string {
    return title.replace(/^\d+[、.．]\s*/, '')
}

/** 切换到指定页；整屏模式下列表已完整可见，无需滚动。 */
async function changePage(nextPage: number): Promise<void> {
    page.value = Math.max(1, Math.min(nextPage, pageCount.value))
    await nextTick()
    if (!fitActive.value) listElement.value?.scrollIntoView({ block: 'start', behavior: 'instant' })
}

watch(yearCounts, options => {
    if (!options.some(option => option.value === selectedYear.value)) selectedYear.value = 'all'
})
watch([() => props.tag, () => props.type, () => props.group, () => props.category, selectedYear, dateOrder], () => { page.value = 1 })
watch(pageSize, () => { page.value = Math.min(page.value, pageCount.value) })
</script>

<style scoped>
.blog-list {
    scroll-margin-top: calc(var(--vp-nav-height) + 12px);
    padding: 0 var(--blog-page-gutter) 16px;

    &.blog-list--fit {
        display: flex;
        flex: 1;
        flex-direction: column;
        min-height: 0;

        & .blog-list__viewport { display: flex; flex: 1; flex-direction: column; min-height: 0; }
        & .blog-list__grid { flex: none; }
        & .blog-list__card { padding: 14px 16px; overflow: hidden; }
        & .blog-list__eyebrow { flex-shrink: 0; margin-bottom: 6px; line-height: 1.5; }
        & .blog-list__title { flex-shrink: 0; font-size: 17px; line-height: 1.5; }
        & .blog-list__title-text { display: -webkit-box; overflow: hidden; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
        & .blog-list__note { flex-shrink: 0; margin-top: 6px; font-size: 14px; line-height: 1.55; -webkit-line-clamp: 2; }
        & .blog-list__meta { flex-shrink: 0; padding-top: 10px; gap: 6px; }
        & .blog-list__pagination { flex-shrink: 0; }
        &:not(.blog-list--rows) .blog-list__tags { max-height: 24px; overflow: hidden; }
    }
    & .blog-list__count {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 4px 12px;
        margin: 0;
        color: var(--blog-muted);
        font-size: 12px;
        font-variant-numeric: tabular-nums;

        & strong { color: var(--vp-c-text-2); font-weight: 500; }
    }
    & .blog-list__grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(min(100%, 340px), 1fr));
        gap: 12px;
        align-content: start;
        animation: blog-content-enter 200ms ease-out;
    }
    & .blog-list__card {
        display: flex;
        flex-direction: column;
        position: relative;
        min-width: 0;
        padding: 22px;
        border: 1px solid var(--blog-border, var(--vp-c-divider));
        border-radius: var(--blog-radius);
        background: var(--blog-panel, var(--vp-c-bg-soft));
        overflow-wrap: anywhere;
        color: var(--vp-c-text-1);
        text-decoration: none;
        cursor: pointer;
        box-shadow: var(--blog-surface-shadow);
        transition: border-color 180ms ease, box-shadow 180ms ease;

        &:hover, &:focus-within {
            border-color: var(--blog-border-hover);
            box-shadow: var(--blog-hover-shadow);
            & .blog-list__title-text { color: var(--vp-c-brand-1); }
        }
        &:focus-visible { outline: 2px solid var(--blog-focus-ring); outline-offset: 3px; }
    }
    & .blog-list__eyebrow {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 14px;
        color: var(--blog-muted);
        font-size: 12px;
        font-weight: 500;
        letter-spacing: 0.08em;
        text-transform: uppercase;
    }
    & .blog-list__index {
        color: var(--blog-muted, var(--vp-c-text-2));
        font-family: var(--vp-font-family-mono);
        font-size: 12px;
        font-weight: 400;
    }
    & .blog-list__title {
        margin: 0;
        padding: 0;
        border: 0;
        font-size: 18px;
        line-height: 1.55;
        letter-spacing: -0.02em;

        & .blog-list__title-text {
            display: block;
            position: relative;
            padding-right: 22px;
            color: var(--vp-c-text-1);
            transition: color 180ms ease;
        }
    }
    & .blog-list__arrow {
        position: absolute;
        top: 0;
        right: 0;
        color: var(--blog-muted);
        font-size: 16px;
        font-weight: 400;
    }
    & .blog-list__note {
        display: -webkit-box;
        margin: 8px 0 0;
        color: var(--vp-c-text-2);
        font-size: 14px;
        line-height: 1.65;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    & .blog-list__meta {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
        margin-top: auto;
        padding-top: 20px;
        font-size: 12px;
        color: var(--blog-muted, var(--vp-c-text-2));
    }
    & .blog-list__meta .article-dates { width: 100%; flex-direction: column; align-items: flex-end; }
    & .blog-list__tags { display: contents; }
    &:not(.blog-list--rows) {
        & .blog-list__tags { display: flex; flex-wrap: wrap; gap: inherit; width: 100%; }
        & .blog-list__tag { max-width: 100%; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
    }
    & .blog-list__tag {
        padding: 2px 8px;
        background: var(--blog-hover-bg);
        border-radius: 5px;
        font-size: 12px;
        line-height: 1.6;
    }
    & .blog-list__empty {
        margin: 0;
        padding: 32px;
        border: 1px dashed var(--blog-border, var(--vp-c-divider));
        border-radius: 12px;
        color: var(--vp-c-text-2);
        text-align: center;
    }
    & .blog-list__pagination {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 8px 16px;
        padding-top: 12px;
        font-variant-numeric: tabular-nums;
    }
    & .blog-list__pagination-controls { display: flex; align-items: center; gap: 8px; }
    & .el-button { min-height: 44px; margin: 0; }
    & .blog-list__page-select { width: 148px; }
    & :deep(.el-select__wrapper) { min-height: 44px; }
    @media (min-width: 641px) and (max-width: 1023px) {
        & .blog-list__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    @media (max-width: 640px) {
        & .blog-list__grid { grid-template-columns: 1fr; gap: 10px; }
        & .blog-list__card { padding: 14px 16px; }
        & .blog-list__title { font-size: 17px; }
        & .blog-list__count { width: 100%; justify-content: space-between; font-size: 13px; }
        & .blog-list__pagination { width: 100%; }
        & .blog-list__pagination-controls { width: 100%; display: grid; grid-template-columns: 1fr auto 1fr; gap: 6px; }
        & .el-button { min-width: 0; padding-inline: 8px; }
        & .blog-list__page-select { width: 130px; }
    }
    & .blog-list__view-toolbar { display: flex; align-items: center; gap: 16px; flex-shrink: 0; min-width: 0; padding: 2px 0 12px; overflow-x: auto; }
    & .blog-list__heading {
        display: flex; flex-shrink: 0; align-items: baseline; gap: 10px; white-space: nowrap;
        & h1 { margin: 0; font-size: 20px; font-weight: 600; line-height: 1.4; }
        & span { color: var(--blog-muted); font-size: 13px; font-variant-numeric: tabular-nums; }
    }
    & .blog-list__view-controls, & .blog-list__date-controls { display: flex; align-items: center; flex-shrink: 0; gap: 8px; }
    & .blog-list__view-controls { margin-left: auto; }
    & .blog-list__year-select { width: 160px; }
    & .blog-list__sort-select { width: 136px; }
    & .blog-list__view-switch {
        display: inline-flex; flex-shrink: 0; gap: 3px; padding: 3px; border: 1px solid var(--blog-border); border-radius: 8px; background: var(--blog-panel);
        & button { display: inline-flex; align-items: center; gap: 6px; min-height: 32px; padding: 5px 10px; border-radius: 5px; color: var(--vp-c-text-2); font-size: 12px; line-height: 1.5; cursor: pointer; }
        & button:hover { background: var(--blog-hover-bg); color: var(--vp-c-text-1); }
        & button[aria-pressed='true'] { background: var(--blog-selected-bg); color: var(--blog-selected-text); box-shadow: inset 0 0 0 1px var(--blog-selected-border); }
        & svg { width: 15px; height: 15px; fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
    }
    &.blog-list--rows {
        & .blog-list__grid { grid-template-columns: 1fr; gap: 6px; }
        & .blog-list__card { display: grid; grid-template-columns: 52px minmax(0, 1fr) minmax(240px, .38fr); grid-template-rows: auto auto; align-content: center; gap: 3px 16px; padding: 5px 14px; border-radius: 8px; }
        & .blog-list__eyebrow { grid-column: 1; grid-row: 1 / 3; flex-direction: column-reverse; align-items: flex-start; justify-content: flex-end; gap: 4px; margin: 0; padding-top: 2px; line-height: 1.5; letter-spacing: 0; }
        & .blog-list__index { font-size: 13px; }
        & .blog-list__title { grid-column: 2; font-size: 17px; line-height: 1.5; min-width: 0; }
        & .blog-list__title-text { display: block; padding-right: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        & .blog-list__note { grid-column: 2; margin: 0; font-size: 14px; line-height: 1.55; -webkit-line-clamp: 1; }
        & .blog-list__meta { grid-column: 3; grid-row: 1 / 3; align-self: center; justify-content: flex-end; margin: 0; padding-top: 0; gap: 4px 6px; }
        & .blog-list__tag { padding: 1px 4px; line-height: 1.4; }
        @media (min-width: 900px) {
            & .blog-list__tags { display: flex; width: 100%; justify-content: safe flex-end; gap: inherit; overflow: hidden; white-space: nowrap; }
            & .blog-list__tag { flex-shrink: 0; }
        }
        @media (max-width: 1100px) {
            & .blog-list__card { grid-template-columns: 40px minmax(0, 1fr) 200px; }
            & .blog-list__meta { gap: 2px 4px; }
        }
        @media (max-width: 899px) {
            & .blog-list__card { grid-template-columns: 40px minmax(0, 1fr); grid-template-rows: auto auto auto; }
            & .blog-list__eyebrow { grid-row: 1 / 4; }
            & .blog-list__meta { grid-column: 2; grid-row: 3; justify-content: flex-start; }
            & .blog-list__tag { display: inline; }
            & .blog-list__meta .article-dates { flex-direction: row; }
        }
        @media (max-width: 640px) {
            & .blog-list__card { grid-template-columns: 30px minmax(0, 1fr); gap: 6px 10px; padding: 12px; }
            & .blog-list__eyebrow > span:first-child { display: none; }
            & .blog-list__title-text { display: -webkit-box; white-space: normal; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
        }
    }
    @media (prefers-reduced-motion: reduce) {
        & .blog-list__card, & .blog-list__title-text, & .el-button { transition: none; }
        & .blog-list__card:hover { transform: none; }
    }
}
</style>
