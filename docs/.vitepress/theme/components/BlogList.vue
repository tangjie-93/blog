<template>
    <section class="blog-list" aria-label="文章列表">
        <p class="blog-list__count" role="status"><span class="blog-list__signal" aria-hidden="true"></span> 共 {{ filteredPosts.length }} 篇文章</p>
        <div :key="`${props.tag || ''}-${props.type || ''}-${page}`" class="blog-list__grid">
            <article v-for="(post, index) in visiblePosts" :key="post.url" class="blog-list__card">
                <div class="blog-list__eyebrow">
                    <span>{{ post.type || '技术笔记' }}</span>
                    <span class="blog-list__index" aria-hidden="true">{{ String((page - 1) * PAGE_SIZE + index + 1).padStart(2, '0') }}</span>
                </div>
                <h2 class="blog-list__title"><a :href="withBase(post.url)">{{ post.title }}<span class="blog-list__arrow" aria-hidden="true">↗</span></a></h2>
                <p v-if="post.note" class="blog-list__note">{{ post.note }}</p>
                <div class="blog-list__meta">
                    <span v-for="tag in post.tags" :key="tag" class="blog-list__tag">{{ tag }}</span>
                    <time v-if="post.date" :datetime="post.date">{{ post.date }}</time>
                </div>
            </article>
        </div>
        <p v-if="!filteredPosts.length" class="blog-list__empty">暂无文章</p>
        <nav v-if="pageCount > 1" class="blog-list__pagination" aria-label="文章分页">
            <button type="button" :disabled="page === 1" @click="page--">上一页</button>
            <span role="status" aria-live="polite">第 {{ page }} / {{ pageCount }} 页</span>
            <button type="button" :disabled="page === pageCount" @click="page++">下一页</button>
        </nav>
    </section>
</template>

<script setup lang="ts">
import type { BlogListProps } from '../../../../src/types/blog'
import { computed, ref, watch } from 'vue'
import { withBase } from 'vitepress'
import { data as posts } from '../../posts.data'
import { filterPosts } from '../blog'

const props = defineProps<BlogListProps>()
const PAGE_SIZE = 24
const page = ref(1)
const filteredPosts = computed(() => filterPosts(posts, props))
const pageCount = computed(() => Math.ceil(filteredPosts.value.length / PAGE_SIZE))
const visiblePosts = computed(() => filteredPosts.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))

watch([() => props.tag, () => props.type], () => { page.value = 1 })
</script>

<style scoped>
.blog-list {
    & .blog-list__count {
        display: flex;
        align-items: center;
        gap: 9px;
        margin: 0 0 12px;
        color: var(--vp-c-text-2);
        font-size: 13px;
        letter-spacing: 0.04em;
    }
    & .blog-list__signal {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--vp-c-brand-1);
        box-shadow: 0 0 12px var(--vp-c-brand-soft);
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
        font-size: 11px;
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
        font-size: 13px;
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
        font-size: 11px;
        color: var(--blog-muted, var(--vp-c-text-2));

        & time { margin-left: auto; font-family: var(--vp-font-family-mono); font-size: 11px; }
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
        justify-content: center;
        align-items: center;
        gap: 20px;
        margin-top: 20px;
        padding-top: 16px;
        border-top: 1px solid var(--blog-border, var(--vp-c-divider));
        color: var(--vp-c-text-2);
        font-size: 12px;
        font-variant-numeric: tabular-nums;
    }
    & button {
        min-height: 40px;
        padding: 8px 15px;
        border: 1px solid var(--blog-border, var(--vp-c-divider));
        border-radius: 8px;
        background: var(--blog-panel, var(--vp-c-bg-soft));
        color: var(--vp-c-text-1);
        font-size: 13px;
        transition: color 180ms ease, border-color 180ms ease;

        &:not(:disabled):hover { color: var(--vp-c-brand-1); border-color: var(--vp-c-brand-1); }
        &:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 4px; }
        &:disabled { opacity: 0.4; cursor: not-allowed; }
    }
    @media (min-width: 641px) and (max-width: 1023px) {
        & .blog-list__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    @media (max-width: 640px) {
        & .blog-list__grid { grid-template-columns: 1fr; gap: 10px; }
        & .blog-list__card { padding: 14px 16px; }
        & .blog-list__title { font-size: 16px; }
        & .blog-list__pagination { gap: 12px; }
    }
    @media (prefers-reduced-motion: reduce) {
        & .blog-list__card, & .blog-list__title a, & button { transition: none; }
        & .blog-list__card:hover { transform: none; }
    }
}
</style>
