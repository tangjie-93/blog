<template>
    <section class="blog-tags" aria-label="按标签浏览">
        <p class="blog-tags__label">探索技术标签 <span>{{ tags.length }} TOPICS</span></p>
        <div class="blog-tags__buttons">
            <button v-for="tag in tags" :key="tag" type="button" :aria-pressed="selectedTag === tag" @click="selectedTag = tag"><span class="blog-tags__hash" aria-hidden="true">#</span>{{ tag }}</button>
        </div>
        <BlogList v-if="selectedTag" :tag="selectedTag" />
        <p v-else class="blog-tags__hint">请选择标签，浏览相关文章。</p>
    </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { data as posts } from '../../posts.data'
import BlogList from './BlogList.vue'

const selectedTag = ref('')
const tags = [...new Set(posts.flatMap(post => post.tags))].sort((a, b) => a.localeCompare(b, 'zh-CN'))
</script>

<style scoped>
.blog-tags {
    & .blog-tags__label {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        margin: 16px 0 12px;
        color: var(--vp-c-text-2);
        font-size: 14px;

        & span { color: var(--blog-muted, var(--vp-c-text-2)); font-family: var(--vp-font-family-mono); font-size: 12px; letter-spacing: 0.08em; }
    }
    & .blog-tags__buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 18px;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--blog-border, var(--vp-c-divider));
    }
    & button {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        min-height: 40px;
        padding: 7px 15px;
        border: 1px solid var(--blog-border, var(--vp-c-divider));
        border-radius: 24px;
        background: var(--blog-panel, var(--vp-c-bg-soft));
        color: var(--vp-c-text-1);
        font-size: 15px;
        font-weight: 500;
        line-height: 1.5;
        transition: color 180ms ease, border-color 180ms ease, background 180ms ease;

        &:hover, &[aria-pressed="true"] {
            border-color: var(--vp-c-brand-1);
            color: var(--vp-c-brand-1);
            background: var(--vp-c-brand-soft);
        }
        &[aria-pressed="true"] { box-shadow: 0 0 16px var(--vp-c-brand-soft); }
        &:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 4px; }
    }
    & .blog-tags__hash { color: var(--vp-c-brand-1); font-family: var(--vp-font-family-mono); font-size: 12px; opacity: 0.8; }
    & .blog-tags__hint {
        padding: 22px 20px;
        border: 1px dashed var(--blog-border, var(--vp-c-divider));
        border-radius: 14px;
        background: var(--blog-panel, var(--vp-c-bg-soft));
        color: var(--vp-c-text-2);
        font-size: 15px;
        text-align: center;
    }
    @media (max-width: 640px) {
        & .blog-tags__buttons { gap: 8px; }
        & button { padding-right: 12px; padding-left: 12px; }
    }
    @media (prefers-reduced-motion: reduce) {
        & button { transition: none; }
    }
}
</style>
