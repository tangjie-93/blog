<template>
    <ElButton text type="primary" native-type="button" aria-haspopup="dialog" :aria-label="`${label}：${skill.title}`" @click="openDialog">{{ label }}</ElButton>
    <ElDialog v-if="dialogCreated" v-model="dialogVisible" width="min(920px, calc(100vw - 24px))" align-center append-to-body destroy-on-close class="skill-document-dialog" @closed="dialogCreated = false">
        <template #header>
            <div class="skill-document__heading">
                <div>
                    <h2>{{ skill.title }}</h2>
                    <p>{{ categoryTitle }} <span aria-hidden="true">/</span> {{ skill.kind === 'plugin' ? 'Plugin Skill' : 'Skill' }}</p>
                </div>
            </div>
        </template>
        <div class="skill-document">
            <div class="skill-document__toolbar">
                <ElSelect v-model="activePath" class="skill-document__path" aria-label="选择技能文档" :empty-values="[null, undefined]">
                    <ElOption v-for="file in documentFiles" :key="file.path" :value="file.path" :label="file.path" />
                </ElSelect>
                <div class="skill-document__tabs" role="tablist" aria-label="文档视图">
                    <button v-for="tab in tabs" :key="tab.id" type="button" role="tab" :aria-selected="activeTab === tab.id" :tabindex="activeTab === tab.id ? 0 : -1" @click="activeTab = tab.id">{{ tab.label }}</button>
                </div>
                <div class="skill-document__actions">
                    <ElButton native-type="button" :aria-label="`复制 ${activeFile.path} 原文`" @click="copyOriginal">复制原文</ElButton>
                    <ElButton type="primary" plain native-type="button" aria-label="下载含 SKILL.md 的技能 ZIP" @click="downloadArchive">下载 Skill ZIP</ElButton>
                </div>
            </div>
            <p v-if="copyMessage" class="skill-document__status" role="status">{{ copyMessage }}</p>
            <div v-if="activeTab === 'guide'" class="skill-document__panel skill-document__guide blog-scrollbar" role="tabpanel">
                <code class="skill-document__name">{{ skillInvocation(skill) }}</code>
                <p>{{ skill.summary }}</p>
                <h3>适用场景</h3>
                <ul><li v-for="scenario in skill.scenarios" :key="scenario">{{ scenario }}</li></ul>
                <dl>
                    <dt>准备什么</dt><dd>{{ skill.inputs }}</dd>
                    <template v-if="skill.steps?.length"><dt>执行步骤</dt><dd><ol><li v-for="step in skill.steps" :key="step">{{ step }}</li></ol></dd></template>
                    <dt>得到什么</dt><dd>{{ skill.output }}</dd>
                    <dt>使用边界</dt><dd>{{ skill.boundary || skill.requirements }}</dd>
                </dl>
                <div class="skill-document__prompt-heading"><strong>复制后替换【】中的内容</strong><ElButton type="primary" plain native-type="button" :aria-label="`复制 ${skill.title} 提示词`" @click="copyPrompt">复制提示词</ElButton></div>
                <pre tabindex="0" :aria-label="`${skill.title} 提示词`">{{ skill.prompt }}</pre>
            </div>
            <div v-else-if="activeTab === 'preview'" class="skill-document__panel skill-document__markdown blog-scrollbar" role="tabpanel" v-html="renderedDocument" />
            <pre v-else class="skill-document__panel skill-document__raw blog-scrollbar" role="tabpanel" tabindex="0" :aria-label="`${activeFile.path} 原文`">{{ activeFile.content }}</pre>
            <small class="skill-document__note">公开整理的使用说明 · 来源：{{ sourceLabel }} · {{ skill.version === 'local' ? '本地整理版本' : skill.version }}</small>
        </div>
        <template #footer><ElButton @click="dialogVisible = false">关闭</ElButton></template>
    </ElDialog>
</template>

<script setup lang="ts">
import type { SkillEntry } from '../../../../src/types/skills'
import { computed, ref, shallowRef } from 'vue'
import { ElButton, ElDialog, ElOption, ElSelect } from 'element-plus'
import { skillCategories, skillInvocation } from '../skillCatalog'
import { downloadSkillArchive, renderMarkdown, skillDocumentFiles } from '../toolboxDocuments'

const props = withDefaults(defineProps<{ skill: SkillEntry; label?: string }>(), { label: '预览文档 ↗' })
const tabs = [
    { id: 'guide', label: '文档' },
    { id: 'preview', label: '预览' },
    { id: 'raw', label: '原文' },
] as const
const copyMessage = ref('')
const dialogCreated = ref(false)
const dialogVisible = ref(false)
const activeTab = shallowRef<(typeof tabs)[number]['id']>('preview')
const activePath = shallowRef('')
const documentFiles = computed(() => skillDocumentFiles(props.skill))
const activeFile = computed(() => documentFiles.value.find(file => file.path === activePath.value) ?? documentFiles.value[0])
const renderedDocument = computed(() => renderMarkdown(activeFile.value.content))
const categoryTitle = computed(() => skillCategories.find(item => item.id === props.skill.category)?.title)
const sourceLabel = computed(() => props.skill.source === 'personal' ? '个人技能' : props.skill.source === 'system' ? '系统技能' : `${props.skill.source} 插件`)

/** 打开当前技能的文档，并从预览与主文档开始。 */
function openDialog(): void {
    copyMessage.value = ''
    activeTab.value = 'preview'
    activePath.value = documentFiles.value[0].path
    dialogCreated.value = true
    dialogVisible.value = true
}

/** 复制当前文档原文，失败时保留文本供手动复制。 */
async function copyOriginal(): Promise<void> {
    await copyText(activeFile.value.content, `已复制 ${activeFile.value.relativePath}。`)
}

/** 复制提示词，失败时保留文本供手动复制。 */
async function copyPrompt(): Promise<void> {
    await copyText(props.skill.prompt, '已复制提示词。')
}

async function copyText(text: string, success: string): Promise<void> {
    try {
        await navigator.clipboard.writeText(text)
        copyMessage.value = success
    } catch {
        copyMessage.value = '无法自动复制，请选中内容手动复制。'
    }
}

/** 导出技能包；已安装 Skill 时也可直接放入技能目录。 */
function downloadArchive(): void {
    downloadSkillArchive(props.skill)
    copyMessage.value = '已下载 Skill ZIP。'
}
</script>

<style scoped>
.skill-document__heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    min-width: 0;
    & h2 { margin: 0; font-size: 20px; line-height: 1.35; }
    & p { margin: 2px 0 0; color: var(--blog-muted); font-size: 13px; }
}
.skill-document {
    min-width: 0;
}
.skill-document__toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 10px;
    padding: 0 0 12px;
    border-bottom: 1px solid var(--blog-border);
    & .skill-document__path { flex: 1 1 260px; min-width: 0; }
    & .skill-document__path :deep(.el-select__wrapper) { min-height: 34px; }
}
.skill-document__tabs {
    display: inline-flex;
    gap: 2px;
    padding: 3px;
    border: 1px solid var(--blog-border);
    border-radius: 8px;
    background: var(--blog-panel);
    & button { min-height: 28px; padding: 3px 12px; border-radius: 6px; color: var(--vp-c-text-2); font-size: 13px; }
    & button:hover { background: var(--blog-hover-bg); color: var(--vp-c-text-1); }
    & button[aria-selected='true'] { background: var(--blog-selected-bg); color: var(--blog-selected-text); font-weight: 600; box-shadow: inset 0 0 0 1px var(--blog-selected-border); }
    & button:focus-visible { outline: 2px solid var(--blog-focus-ring); outline-offset: 1px; }
}
.skill-document__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-left: auto;
    & .el-button { min-height: 34px; }
}
.skill-document__status {
    margin: 8px 0 0;
    color: var(--blog-selected-text);
    font-size: 13px;
}
.skill-document__panel {
    max-height: calc(100dvh - 260px);
    min-height: 220px;
    margin-top: 12px;
    overflow: auto;
    overscroll-behavior: contain;
    overflow-wrap: anywhere;
    padding: 4px;
}
.skill-document__guide {
    & .skill-document__name { color: var(--vp-c-brand-1); font-size: 12px; }
    & p, & li, & dd { color: var(--vp-c-text-2); font-size: 14px; line-height: 1.8; }
    & p { margin: 12px 0; }
    & h3 { margin: 18px 0 4px; font-size: 15px; }
    & ol { list-style: decimal; padding-left: 18px; }
    & ul { padding-left: 18px; margin: 8px 0; list-style: disc; }
    & dt { margin-top: 14px; color: var(--vp-c-text-1); font-size: 14px; font-weight: 600; }
    & dd { margin: 4px 0 0; }
    & .skill-document__prompt-heading { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; margin-top: 18px; font-size: 12px; }
    & pre { margin: 10px 0; padding: 14px; border-radius: 8px; background: var(--vp-c-bg); color: var(--vp-c-text-1); font-size: 13px; line-height: 1.8; white-space: pre-wrap; user-select: text; }
    & pre:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 3px; }
}
.skill-document__markdown {
    padding: 8px 14px 16px;
    & :deep(h1) { margin: 18px 0 12px; padding-bottom: 10px; border-bottom: 1px solid var(--blog-border); font-size: 26px; line-height: 1.35; }
    & :deep(h2) { margin: 26px 0 10px; padding-bottom: 6px; border-bottom: 1px solid var(--blog-border); font-size: 19px; line-height: 1.4; }
    & :deep(h3) { margin: 18px 0 8px; font-size: 16px; }
    & :deep(p), & :deep(li) { color: var(--vp-c-text-2); font-size: 14px; line-height: 1.9; }
    & :deep(p) { margin: 10px 0; }
    & :deep(ul), & :deep(ol) { margin: 8px 0; padding-left: 22px; }
    & :deep(ul) { list-style: disc; }
    & :deep(ol) { list-style: decimal; }
    & :deep(li) { margin: 4px 0; }
    & :deep(blockquote) { margin: 12px 0; padding: 6px 14px; border-left: 3px solid var(--blog-border); color: var(--blog-muted); font-size: 13px; }
    & :deep(code) { padding: 1px 5px; border-radius: 4px; background: var(--vp-c-bg-soft); color: var(--vp-c-brand-1); font-size: .88em; }
    & :deep(pre) { margin: 12px 0; padding: 14px; overflow: auto; border-radius: 8px; background: var(--vp-c-bg); }
    & :deep(pre code) { padding: 0; background: none; color: var(--vp-c-text-1); font-size: 13px; line-height: 1.8; white-space: pre-wrap; }
    & :deep(hr) { margin: 20px 0; border: 0; border-top: 1px solid var(--blog-border); }
}
.skill-document__raw {
    margin-top: 12px;
    padding: 14px;
    border-radius: 8px;
    background: var(--vp-c-bg);
    color: var(--vp-c-text-1);
    font-size: 13px;
    line-height: 1.8;
    white-space: pre-wrap;
    user-select: text;
    &:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 3px; }
}
.skill-document__note {
    display: block;
    margin-top: 12px;
    color: var(--blog-muted);
    font-size: 12px;
}
@media (max-width: 640px) {
    .skill-document__actions { margin-left: 0; }
    .skill-document__panel { max-height: calc(100dvh - 340px); }
}
</style>
