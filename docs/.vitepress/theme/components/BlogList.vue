<template>
    <section ref="listElement" class="blog-list" aria-label="文章列表">
        <div class="blog-list__toolbar">
            <p class="blog-list__count" role="status" aria-live="polite" aria-atomic="true">
                <strong>共 {{ filteredPosts.length }} 篇文章</strong>
                <span v-if="filteredPosts.length">当前 {{ (page - 1) * PAGE_SIZE + 1 }}–{{ Math.min(page * PAGE_SIZE, filteredPosts.length) }} 篇</span>
            </p>
            <nav v-if="pageCount > 1" class="blog-list__pagination" aria-label="文章分页">
                <button type="button" :disabled="page === 1" @click="changePage(page - 1)">上一页</button>
                <select :value="page" aria-label="选择页码" @change="changePage(Number(($event.target as HTMLSelectElement).value))">
                    <option v-for="number in pageCount" :key="number" :value="number">第 {{ number }} / {{ pageCount }} 页</option>
                </select>
                <button type="button" :disabled="page === pageCount" @click="changePage(page + 1)">下一页</button>
            </nav>
        </div>
        <div :key="`${props.tag || ''}-${props.type || ''}-${page}`" class="blog-list__grid">
            <article v-for="(post, index) in visiblePosts" :key="post.url" class="blog-list__card">
                <div class="blog-list__eyebrow">
                    <span>{{ post.type || '技术笔记' }}</span>
                    <span class="blog-list__index" aria-hidden="true">{{ String((page - 1) * PAGE_SIZE + index + 1).padStart(2, '0') }}</span>
                </div>
                <h2 class="blog-list__title"><a :href="withBase(post.url)">{{ displayTitle(post.title) }}<span class="blog-list__arrow" aria-hidden="true">↗</span></a></h2>
                <p v-if="post.note" class="blog-list__note">{{ post.note }}</p>
                <div class="blog-list__meta">
                    <span v-for="tag in post.tags" :key="tag" class="blog-list__tag">{{ tag }}</span>
                    <time v-if="post.date" :datetime="post.date">{{ post.date }}</time>
                </div>
            </article>
        </div>
        <p v-if="!filteredPosts.length" class="blog-list__empty">暂无文章</p>
    </section>
</template>

<script setup lang="ts">
import type { BlogListProps } from '../../../../src/types/blog'
import { computed, nextTick, ref, watch } from 'vue'
import { withBase } from 'vitepress'
import { data as posts } from '../../posts.data'
import { filterPosts } from '../blog'

const props = defineProps<BlogListProps>()
const PAGE_SIZE = 24
const page = ref(1)
const listElement = ref<HTMLElement | null>(null)
const filteredPosts = computed(() => filterPosts(posts, props))
const pageCount = computed(() => Math.ceil(filteredPosts.value.length / PAGE_SIZE))
const visiblePosts = computed(() => filteredPosts.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))

/** 归档卡片已用右上角编号表示顺序，标题保留正文名称即可。 */
function displayTitle(title: string): string {
    return title.replace(/^\d+[、.．]\s*/, '')
}

/** 切换到指定页，待列表更新后回到开头，避免用户继续停留在上一页底部。 */
async function changePage(nextPage: number): Promise<void> {
    page.value = Math.max(1, Math.min(nextPage, pageCount.value))
    await nextTick()
    listElement.value?.scrollIntoView({ block: 'start', behavior: 'instant' })
}

watch([() => props.tag, () => props.type], () => { page.value = 1 })
</script>

<style scoped>
.blog-list {
    scroll-margin-top: calc(var(--vp-nav-height) + 12px);

    & .blog-list__toolbar {
        display: flex;
        position: sticky;
        top: calc(var(--vp-nav-height) + 8px);
        z-index: 10;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 12px 20px;
        margin-bottom: 16px;
        padding: 12px 16px;
        border: 1px solid var(--blog-border, var(--vp-c-divider));
        border-radius: 10px;
        background: var(--vp-c-bg);
        box-shadow: 0 4px 16px var(--vp-c-brand-soft);
    }
    & .blog-list__count {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 4px 12px;
        margin: 0;
        color: var(--vp-c-text-2);
        font-size: 14px;
        font-variant-numeric: tabular-nums;

        & strong { color: var(--vp-c-text-1); }
    }
    & .blog-list__grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
        animation: blog-content-enter 200ms ease-out;
    }
    & .blog-list__card {
        display: flex;
        flex-direction: column;
        position: relative;
        padding: 16px 18px;
        border: 1px solid var(--blog-border, var(--vp-c-divider));
        border-radius: 10px;
        background: var(--blog-panel, var(--vp-c-bg-soft));
        overflow-wrap: anywhere;
        transition: border-color 180ms ease, transform 180ms ease, box-shadow 180ms ease;

        &:hover, &:focus-within {
            border-color: var(--vp-c-brand-1);
            box-shadow: 0 8px 28px var(--vp-c-brand-soft);
        }
        @media (hover: hover) {
            &:hover { transform: translateY(-3px); }
        }
    }
    & .blog-list__eyebrow {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 8px;
        color: var(--vp-c-brand-1);
        font-size: 12px;
        font-weight: 600;
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
        font-size: 16px;
        line-height: 1.55;
        letter-spacing: -0.02em;

        & a {
            color: var(--vp-c-text-1);
            text-decoration: none;
            transition: color 180ms ease;

            &:hover { color: var(--vp-c-brand-1); }
            &:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 5px; border-radius: 3px; }
        }
    }
    & .blog-list__arrow {
        display: inline-block;
        margin-left: 8px;
        color: var(--vp-c-brand-1);
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
        padding-top: 12px;
        font-size: 12px;
        color: var(--blog-muted, var(--vp-c-text-2));

        & time { margin-left: auto; font-family: var(--vp-font-family-mono); font-size: 12px; }
    }
    & .blog-list__tag {
        padding: 2px 8px;
        border: 1px solid var(--blog-border, var(--vp-c-divider));
        border-radius: 5px;
        line-height: 1.6;
    }
    & .blog-list__empty {
        padding: 32px;
        border: 1px dashed var(--blog-border, var(--vp-c-divider));
        border-radius: 12px;
        color: var(--vp-c-text-2);
        text-align: center;
    }
    & .blog-list__pagination {
        display: flex;
        align-items: center;
        gap: 8px;
        font-variant-numeric: tabular-nums;

        & select { appearance: auto; }
    }
    & button, & select {
        min-height: 44px;
        padding: 8px 14px;
        border: 1px solid var(--blog-border, var(--vp-c-divider));
        border-radius: 8px;
        background: var(--blog-panel, var(--vp-c-bg-soft));
        color: var(--vp-c-text-1);
        font-size: 14px;
        line-height: 1.5;
        white-space: nowrap;
        cursor: pointer;
        transition: color 180ms ease, border-color 180ms ease;

        &:not(:disabled):hover { color: var(--vp-c-brand-1); border-color: var(--vp-c-brand-1); }
        &:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 4px; }
        &:disabled { opacity: 0.4; cursor: not-allowed; }
    }
    @media (min-width: 641px) and (max-width: 1023px) {
        & .blog-list__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    @media (min-width: 960px) {
        scroll-margin-top: 12px;
        & .blog-list__toolbar { top: 8px; }
    }
    @media (max-width: 640px) {
        & .blog-list__grid { grid-template-columns: 1fr; gap: 10px; }
        & .blog-list__card { padding: 14px 16px; }
        & .blog-list__title { font-size: 16px; }
        & .blog-list__toolbar { gap: 10px; padding: 10px; }
        & .blog-list__count { width: 100%; justify-content: space-between; font-size: 13px; }
        & .blog-list__pagination { width: 100%; display: grid; grid-template-columns: 1fr auto 1fr; gap: 6px; }
        & button, & select { min-width: 0; padding-inline: 8px; }
    }
    @media (prefers-reduced-motion: reduce) {
        & .blog-list__card, & .blog-list__title a, & button, & select { transition: none; }
        & .blog-list__card:hover { transform: none; }
    }
}
</style>
