<template>
    <article class="skill-card" :class="{ 'skill-card--compact': compact }">
        <div class="skill-card__meta"><span>{{ categoryTitle }}</span><span>{{ sourceLabel }}</span></div>
        <h2>{{ skill.title }}</h2>
        <code class="skill-card__name">{{ skillInvocation(skill) }}</code>
        <p>{{ skill.summary }}</p>
        <div class="skill-card__action"><ElButton text type="primary" native-type="button" aria-haspopup="dialog" :aria-label="`查看 ${skill.title} 用法与提示词`" @click="openDialog">查看用法与提示词 ↗</ElButton></div>
        <ElDialog v-if="dialogCreated" v-model="dialogVisible" :title="skill.title" width="min(720px, calc(100vw - 24px))" align-center append-to-body destroy-on-close @closed="dialogCreated = false">
            <div class="skill-card__details">
                <code class="skill-card__name">{{ skillInvocation(skill) }}</code>
                <p>{{ skill.summary }}</p>
                <ul><li v-for="scenario in skill.scenarios" :key="scenario">{{ scenario }}</li></ul>
                <dl>
                    <dt>准备什么</dt><dd>{{ skill.inputs }}</dd>
                    <dt>得到什么</dt><dd>{{ skill.output }}</dd>
                    <dt>使用前提</dt><dd>{{ skill.requirements }}</dd>
                </dl>
                <div class="skill-card__prompt-heading"><strong>复制后替换【】中的内容</strong><ElButton type="primary" plain native-type="button" :aria-label="`复制 ${skill.title} 提示词`" @click="copyPrompt">复制提示词</ElButton></div>
                <pre tabindex="0" :aria-label="`${skill.title} 提示词`">{{ skill.prompt }}</pre>
                <p v-if="copyMessage" class="skill-card__copy-status" role="status">{{ copyMessage }}</p>
                <small>来源：{{ sourceLabel }} · {{ skill.version === 'local' ? '本地整理版本' : skill.version }}</small>
            </div>
        </ElDialog>
    </article>
</template>

<script setup lang="ts">
import type { SkillEntry } from '../../../../src/types/skills'
import { computed, ref } from 'vue'
import { ElButton, ElDialog } from 'element-plus'
import { skillCategories, skillInvocation } from '../skillCatalog'

const props = defineProps<{ skill: SkillEntry; compact?: boolean }>()
const copyMessage = ref('')
const dialogCreated = ref(false)
const dialogVisible = ref(false)
const categoryTitle = computed(() => skillCategories.find(item => item.id === props.skill.category)?.title)
const sourceLabel = computed(() => props.skill.source === 'personal' ? '个人技能' : props.skill.source === 'system' ? '系统技能' : `${props.skill.source} 插件`)

/** 首次打开时创建弹框并清空复制反馈；关闭后卸载内容，焦点与滚动交给组件库管理。 */
function openDialog(): void {
    copyMessage.value = ''
    dialogCreated.value = true
    dialogVisible.value = true
}

/** 写入剪贴板；权限或环境不支持时保留可选中文本并告知手动复制。 */
async function copyPrompt(): Promise<void> {
    try {
        await navigator.clipboard.writeText(props.skill.prompt)
        copyMessage.value = '已复制，请粘贴到 Codex 并替换占位内容。'
    } catch {
        copyMessage.value = '无法自动复制，请选中提示词手动复制。'
    }
}
</script>

<style scoped>
.skill-card {
    display: flex; flex-direction: column; min-width: 0; padding: 16px; border: 1px solid var(--blog-border); border-radius: 8px; background: var(--blog-panel); overflow-wrap: anywhere;
    & .skill-card__meta { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; color: var(--blog-muted); font-size: 12px; }
    & > h2 { display: -webkit-box; margin: 8px 0 4px; overflow: hidden; font-size: 17px; line-height: 1.5; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
    & > p { display: -webkit-box; overflow: hidden; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
    & .skill-card__action { margin-top: auto; border-top: 1px solid var(--blog-border); padding-top: 6px; }
    & .skill-card__action .el-button { padding-inline: 0; }
}
.skill-card, .skill-card__details {
    & .skill-card__name { color: var(--vp-c-brand-1); font-size: 12px; }
    & p, & li, & dd { font-size: 14px; line-height: 1.8; color: var(--vp-c-text-2); }
    & p { margin: 12px 0; }
}
.skill-card__details {
    max-height: calc(100dvh - 160px); overflow: auto; overscroll-behavior: contain; overflow-wrap: anywhere; padding: 4px;
    & ul { padding-left: 18px; margin: 12px 0; list-style: disc; }
    & dt { font-weight: 600; margin-top: 14px; font-size: 14px; color: var(--vp-c-text-1); }
    & dd { margin: 4px 0 0; }
    & .skill-card__prompt-heading { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; justify-content: space-between; margin-top: 18px; font-size: 12px; }
    & pre { padding: 14px; margin: 10px 0; border-radius: 8px; background: var(--vp-c-bg); white-space: pre-wrap; font-size: 13px; line-height: 1.8; user-select: text; color: var(--vp-c-text-1); }
    & small { color: var(--blog-muted); }
    & pre:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 3px; }
}
/* 整屏分页时卡片高度由屏幕容量决定，压缩行高与间距以保证内容不被裁切。 */
.skill-card--compact {
    padding: 14px 16px;
    & .skill-card__meta { gap: 6px; font-size: 11px; line-height: 18px; }
    & > h2 { margin: 6px 0 2px; font-size: 16px; line-height: 1.4; }
    & .skill-card__name { font-size: 11px; line-height: 18px; }
    & > p { margin: 6px 0; font-size: 13px; line-height: 1.55; }
    & .skill-card__action { padding-top: 4px; }
    & .skill-card__action .el-button { min-height: 28px; font-size: 13px; }
}
</style>
