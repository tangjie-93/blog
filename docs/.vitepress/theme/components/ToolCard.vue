<template>
    <article class="tool-card" :class="{ 'tool-card--compact': compact }">
        <div class="tool-card__meta"><span>{{ entry.kind === 'plugin' ? '插件 · Plugin' : '工具连接 · MCP' }}</span><span>{{ entry.source }}</span></div>
        <h2>{{ entry.name }}</h2>
        <p>{{ entry.summary }}</p>
        <p class="tool-card__status">{{ entry.status }}<span v-if="entry.skillCount !== undefined"> · {{ entry.skillCount }} 项技能</span></p>
        <ul><li v-for="scenario in entry.scenarios" :key="scenario">{{ scenario }}</li></ul>
        <div class="tool-card__action"><ElButton text type="primary" native-type="button" aria-haspopup="dialog" :aria-label="`预览 ${entry.name} 文档`" @click="openDialog">预览文档 ↗</ElButton></div>
        <ElDialog v-if="dialogCreated" v-model="dialogVisible" :title="entry.name" width="min(720px, calc(100vw - 24px))" align-center append-to-body destroy-on-close @closed="dialogCreated = false">
            <div class="tool-card__details">
                <p>{{ entry.summary }}</p>
                <p class="tool-card__status">{{ entry.status }}</p>
                <dl>
                    <dt>适合什么时候用</dt><dd><ul><li v-for="scenario in entry.scenarios" :key="scenario">{{ scenario }}</li></ul></dd>
                    <dt>使用前提</dt><dd>{{ entry.requirements }}</dd>
                    <dt>怎样配置</dt><dd>{{ entry.setup }}</dd>
                </dl>
                <div class="tool-card__prompt-heading"><strong>复制后替换【】中的内容</strong><ElButton type="primary" plain native-type="button" :aria-label="`复制 ${entry.name} 提示词`" @click="copyPrompt">复制提示词</ElButton></div>
                <pre tabindex="0" :aria-label="`${entry.name} 提示词`">{{ entry.prompt }}</pre>
                <p v-if="copyMessage" role="status">{{ copyMessage }}</p>
                <small>公开整理的使用说明 · 来源：{{ entry.source }}<span v-if="entry.skillCount !== undefined"> · {{ entry.skillCount }} 项技能</span></small>
            </div>
            <template #footer><ElButton @click="dialogVisible = false">关闭预览</ElButton><ElButton type="primary" @click="downloadToolboxDocument(entry.id, toolDocument(entry))">下载 Markdown</ElButton></template>
        </ElDialog>
    </article>
</template>

<script setup lang="ts">
import type { ToolboxEntry } from '../../../../src/types/toolbox'
import { ref } from 'vue'
import { ElButton, ElDialog } from 'element-plus'
import { downloadToolboxDocument, toolDocument } from '../toolboxDocuments'

const props = defineProps<{ entry: ToolboxEntry; compact?: boolean }>()
const dialogCreated = ref(false)
const dialogVisible = ref(false)
const copyMessage = ref('')

/** 首次打开时创建弹框并清空复制反馈；关闭后卸载内容，焦点与滚动交给组件库管理。 */
function openDialog(): void {
    copyMessage.value = ''
    dialogCreated.value = true
    dialogVisible.value = true
}

/** 写入剪贴板；权限或环境不支持时保留可选中文本并告知手动复制。 */
async function copyPrompt(): Promise<void> {
    try {
        await navigator.clipboard.writeText(props.entry.prompt)
        copyMessage.value = '已复制，请粘贴到 Codex 并替换占位内容。'
    } catch {
        copyMessage.value = '无法自动复制，请选中提示词手动复制。'
    }
}
</script>

<style scoped>
.tool-card {
    display: flex; flex-direction: column; min-width: 0; padding: 22px; border: 1px solid var(--blog-border); border-radius: var(--blog-radius); background: var(--blog-panel); overflow-wrap: anywhere; box-shadow: var(--blog-surface-shadow);
    transition: border-color 180ms ease, box-shadow 180ms ease;
    &:hover, &:focus-within { border-color: var(--blog-border-hover); box-shadow: var(--blog-hover-shadow); }
    & .tool-card__meta { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; color: var(--blog-muted); font-size: 12px; }
    & h2 { margin: 14px 0 8px; font-size: 19px; line-height: 1.5; }
    & .tool-card__action { margin-top: auto; border-top: 1px solid var(--blog-border); padding-top: 12px; }
    & .tool-card__action .el-button { padding-inline: 0; }
}
.tool-card, .tool-card__details {
    & p, & li, & dd { font-size: 14px; line-height: 1.8; color: var(--vp-c-text-2); }
    & p { margin: 12px 0; }
    & ul { padding-left: 18px; margin: 12px 0 18px; list-style: disc; }
    & .tool-card__status { padding: 10px; border: 1px dashed var(--blog-border); border-radius: 6px; font-size: 12px; }
}
.tool-card__details {
    max-height: calc(100dvh - 208px); overflow: auto; overscroll-behavior: contain; overflow-wrap: anywhere; padding: 4px;
    & dt { font-weight: 600; margin-top: 14px; font-size: 14px; color: var(--vp-c-text-1); }
    & dd { margin: 4px 0 0; white-space: pre-line; }
    & .tool-card__prompt-heading { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; justify-content: space-between; margin-top: 18px; font-size: 12px; }
    & pre { padding: 14px; margin: 10px 0; border-radius: 8px; background: var(--vp-c-bg); white-space: pre-wrap; font-size: 13px; line-height: 1.8; user-select: text; color: var(--vp-c-text-1); }
    & small { color: var(--blog-muted); }
    & pre:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 3px; }
}
/* 整屏分页时卡片高度由屏幕容量决定；场景列表改到弹框里查看，卡片只留摘要与状态。 */
.tool-card--compact {
    padding: 14px 16px;
    & .tool-card__meta { gap: 6px; font-size: 11px; line-height: 18px; }
    & h2 { display: -webkit-box; margin: 6px 0 2px; overflow: hidden; font-size: 16px; line-height: 1.4; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
    & > p:not(.tool-card__status) { display: -webkit-box; margin: 6px 0; overflow: hidden; font-size: 13px; line-height: 1.55; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
    & .tool-card__status { margin: 4px 0 0; padding: 4px 8px; border: 0; background: var(--vp-c-bg-soft); font-size: 11px; line-height: 1.5; }
    & > ul { display: none; }
    & .tool-card__action { padding-top: 4px; }
    & .tool-card__action .el-button { min-height: 28px; font-size: 13px; }
}
</style>
