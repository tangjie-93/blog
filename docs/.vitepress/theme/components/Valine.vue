<template>
    <section class="blog-comments" aria-label="评论">
        <h2>评论</h2>
        <p v-if="error" role="status">{{ error }}</p>
        <iframe v-if="documentHtml" :key="commentPath" class="blog-comments__frame" title="文章评论和阅读量" :srcdoc="documentHtml" sandbox="allow-scripts allow-same-origin allow-popups" />
        <p v-else-if="!error" role="status">正在加载评论…</p>
    </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useData } from 'vitepress'
import { getCommentPath } from '../blog'
import { createCommentDocument } from '../comments'
import { commentSettings } from '../commentSettings'

const { page } = useData()
const commentPath = computed(() => getCommentPath(page.value.relativePath))
const documentHtml = ref('')
const error = ref('')
let isMounted = false
let loadId = 0

/** 仅在浏览器加载评论脚本；路由切换销毁 iframe，并忽略已过期的异步加载。 */
async function loadComments(): Promise<void> {
    if (!isMounted) return
    const currentLoadId = ++loadId
    documentHtml.value = ''
    error.value = ''
    try {
        const [{ default: scriptUrl }, { default: storageUrl }] = await Promise.all([
            import('valine/dist/Valine.min.js?url'),
            import('leancloud-storage/dist/av-min.js?url'),
        ])
        if (currentLoadId !== loadId || !isMounted) return
        documentHtml.value = createCommentDocument(new URL(scriptUrl, window.location.href).href, new URL(storageUrl, window.location.href).href, commentPath.value, page.value.title, commentSettings)
    } catch {
        if (currentLoadId === loadId) error.value = '评论暂时无法加载，请刷新页面重试。'
    }
}

onMounted(() => {
    isMounted = true
    void loadComments()
})
onBeforeUnmount(() => {
    isMounted = false
    loadId++
    documentHtml.value = ''
})
watch(commentPath, loadComments)
</script>

<style scoped>
.blog-comments {
    margin-top: 32px;
    & .blog-comments__frame { display: block; box-sizing: border-box; width: 100%; height: 120px; border: 1px solid var(--vp-c-divider); border-radius: 8px; background: #fff; }
}
</style>
