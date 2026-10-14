<template>
    <section class="blog-comments" aria-label="评论">
        <h2>评论</h2>
        <p v-if="error" role="status">{{ error }}</p>
        <iframe v-if="documentHtml" :key="commentPath" ref="commentFrame" class="blog-comments__frame" title="文章评论和阅读量" :srcdoc="documentHtml" sandbox="allow-scripts allow-same-origin allow-popups" @load="syncCommentTheme" />
        <p v-else-if="!error" role="status">正在加载评论…</p>
    </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useData } from 'vitepress'
import { getCommentPath } from '../blog'
import { createCommentDocument } from '../comments'
import { commentSettings } from '../commentSettings'

const { page, isDark } = useData()
const commentFrame = ref<HTMLIFrameElement | null>(null)
const commentPath = computed(() => getCommentPath(page.value.relativePath))
const documentHtml = ref('')
const error = ref('')
let isMounted = false
let loadId = 0

/** 只更新隔离文档的配色，切换主题时保留正在编辑的留言。 */
function syncCommentTheme(): void {
    const root = commentFrame.value?.contentDocument?.documentElement
    if (root) root.dataset.theme = isDark.value ? 'dark' : 'light'
}

/** 仅在浏览器加载评论脚本；路由切换销毁 iframe，并忽略已过期的异步加载。 */
async function loadComments(): Promise<void> {
    if (!isMounted) return
    const currentLoadId = ++loadId
    documentHtml.value = ''
    error.value = ''
    if (!commentSettings.serverURL) {
        error.value = '评论服务正在迁移，暂时无法留言。'
        return
    }
    try {
        const [{ default: scriptUrl }, { default: styleUrl }] = await Promise.all([
            import('@waline/client/full?url'),
            import('@waline/client/style?url'),
        ])
        if (currentLoadId !== loadId || !isMounted) return
        documentHtml.value = createCommentDocument(new URL(scriptUrl, window.location.href).href, new URL(styleUrl, window.location.href).href, commentPath.value, page.value.title, commentSettings)
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
watch(isDark, syncCommentTheme)
</script>

<style scoped>
.blog-comments {
    margin-top: 32px;
    & .blog-comments__frame { display: block; box-sizing: border-box; width: 100%; height: 120px; border: 1px solid var(--vp-c-divider); border-radius: 12px; background: var(--vp-c-bg); }
}
</style>
