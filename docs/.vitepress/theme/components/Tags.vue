<template>
    <section class="blog-tags" aria-label="按标签浏览">
        <div class="blog-tags__buttons">
            <button v-for="tag in tags" :key="tag" type="button" :aria-pressed="selectedTag === tag" @click="selectedTag = tag">{{ tag }}</button>
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
    & .blog-tags__buttons { display: flex; flex-wrap: wrap; gap: 10px; margin: 24px 0; }
    & button { padding: 5px 14px; border: 1px solid var(--vp-c-divider); border-radius: 20px; font-size: 14px; }
    & button:hover, & button[aria-pressed="true"] { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); background: var(--vp-c-brand-soft); }
    & .blog-tags__hint { color: var(--vp-c-text-2); }
}
</style>
