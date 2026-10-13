<template>
    <section class="blog-list" aria-label="文章列表">
        <p class="blog-list__count" role="status">共 {{ filteredPosts.length }} 篇文章</p>
        <div class="blog-list__grid">
            <article v-for="post in visiblePosts" :key="post.url" class="blog-list__card">
                <h2 class="blog-list__title"><a :href="withBase(post.url)">{{ post.title }}</a></h2>
                <p v-if="post.note" class="blog-list__note">{{ post.note }}</p>
                <div class="blog-list__meta">
                    <span v-if="post.type">{{ post.type }}</span>
                    <span v-for="tag in post.tags" :key="tag" class="blog-list__tag">{{ tag }}</span>
                    <time v-if="post.date" :datetime="post.date">{{ post.date }}</time>
                </div>
            </article>
        </div>
        <p v-if="!filteredPosts.length">暂无文章</p>
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
const PAGE_SIZE = 20
const page = ref(1)
const filteredPosts = computed(() => filterPosts(posts, props))
const pageCount = computed(() => Math.ceil(filteredPosts.value.length / PAGE_SIZE))
const visiblePosts = computed(() => filteredPosts.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))

watch([() => props.tag, () => props.type], () => { page.value = 1 })
</script>

<style scoped>
.blog-list {
    & .blog-list__count { color: var(--vp-c-text-2); font-size: 14px; }
    & .blog-list__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
    & .blog-list__card {
        display: flex;
        flex-direction: column;
        padding: 20px;
        border: 1px solid var(--vp-c-divider);
        border-radius: 12px;
        background: var(--vp-c-bg-soft);
        overflow-wrap: anywhere;
    }
    & .blog-list__title { margin: 0; padding: 0; border: 0; font-size: 18px; line-height: 1.5; }
    & .blog-list__title a { color: var(--vp-c-text-1); text-decoration: none; }
    & .blog-list__title a:hover { color: var(--vp-c-brand-1); }
    & .blog-list__note { color: var(--vp-c-text-2); font-size: 14px; flex: 1; }
    & .blog-list__meta { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 12px; font-size: 12px; color: var(--vp-c-text-2); }
    & .blog-list__tag { padding: 0 8px; border-radius: 5px; background: var(--vp-c-default-soft); }
    & .blog-list__pagination { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 28px; font-size: 14px; }
    & button { padding: 5px 12px; border: 1px solid var(--vp-c-divider); border-radius: 6px; }
    & button:not(:disabled):hover { color: var(--vp-c-brand-1); border-color: var(--vp-c-brand-1); }
    & button:disabled { opacity: 0.45; cursor: not-allowed; }
    @media (max-width: 640px) {
        & .blog-list__grid { grid-template-columns: 1fr; }
        & .blog-list__pagination { gap: 12px; }
    }
}
</style>
