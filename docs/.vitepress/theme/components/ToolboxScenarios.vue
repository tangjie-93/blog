<template>
    <section class="toolbox-scenarios" aria-label="按场景查找技能">
        <div class="toolbox-scenarios__browse">
            <ElInput v-model="query" size="large" aria-label="搜索工作场景" placeholder="搜索技能或任务场景…" clearable />
            <div class="toolbox-scenarios__categories" role="group" aria-label="场景分类">
                <button type="button" class="blog-choice" :aria-pressed="!category" @click="selectCategory('')">全部 <small>{{ skills.length }}</small></button>
                <button v-for="item in distribution" :key="item.id" type="button" class="blog-choice" :aria-pressed="category === item.id" @click="selectCategory(item.id)">{{ item.label }} <small>{{ item.count }}</small></button>
            </div>
        </div>
        <div v-if="matches.length" class="toolbox-scenarios__grid" role="group" aria-label="匹配技能">
            <button v-for="skill in visibleMatches" :key="skill.id" type="button" class="toolbox-scenarios__card" :aria-pressed="skill.id === selected?.id" @click="selectSkill(skill.id)">
                <strong>{{ skill.title }}</strong>
                <small>{{ skill.kind === 'plugin' ? 'Plugin Skill' : 'Skill' }} · {{ scenarioCount(skill) }} 个场景</small>
            </button>
        </div>
        <ElEmpty v-else description="没有找到匹配的工作场景"><ElButton @click="clearFilters">清除筛选</ElButton></ElEmpty>
        <nav v-if="matches.length" class="toolbox-scenarios__pager" aria-label="技能分页">
            <ElButton size="small" :disabled="page === 1" @click="goToPage(page - 1)">上一页</ElButton>
            <span role="status">第 {{ page }} / {{ pageCount }} 页</span>
            <ElButton size="small" :disabled="page === pageCount" @click="goToPage(page + 1)">下一页</ElButton>
        </nav>
        <article v-if="selected" ref="detail" class="toolbox-scenarios__detail" aria-labelledby="toolbox-scenario-title">
            <div ref="guidePanel" class="toolbox-scenarios__main blog-scrollbar" tabindex="0" role="region" aria-labelledby="toolbox-scenario-title">
                <p class="toolbox-scenarios__eyebrow">Skill · 使用指南</p>
                <h2 id="toolbox-scenario-title" ref="detailHeading" tabindex="-1">{{ selected.title }}</h2>
                <code class="toolbox-scenarios__invocation">{{ skillInvocation(selected) }}</code>
                <p class="toolbox-scenarios__summary">{{ selected.summary }}</p>
                <div v-if="selected.boundary || selected.requirements" class="toolbox-scenarios__boundary">
                    <strong>使用边界</strong>
                    <p>{{ selected.boundary || selected.requirements }}</p>
                </div>
                <details class="toolbox-scenarios__requirements">
                    <summary>准备材料、执行步骤与预期产物</summary>
                    <dl>
                        <div><dt>准备材料</dt><dd>{{ selected.inputs }}</dd></div>
                        <div v-if="selected.steps?.length"><dt>执行步骤</dt><dd><ol><li v-for="step in selected.steps" :key="step">{{ step }}</li></ol></dd></div>
                        <div><dt>预期产物</dt><dd>{{ activeExample?.outcome || selected.output }}</dd></div>
                        <div><dt>验收要求</dt><dd>{{ selected.requirements }}</dd></div>
                    </dl>
                </details>
                <div class="toolbox-scenarios__documents">
                    <span>主文档与配套规范：</span>
                    <SkillDocument :skill="selected" label="预览原文 ↗" />
                </div>
                <h3>在什么场景下使用</h3>
                <p class="toolbox-scenarios__hint">选一个具体例子，执行指令会同步更新。</p>
                <ol class="toolbox-scenarios__examples">
                    <li v-for="(example, index) in examples" :key="`${index}-${example.title}`">
                        <button type="button" :aria-pressed="index === exampleIndex" @click="selectExample(index)">
                            <span class="toolbox-scenarios__example-title">{{ index + 1 }}. {{ example.title }}</span>
                            <span v-if="example.when" class="toolbox-scenarios__example-when">{{ example.when }}</span>
                            <span class="toolbox-scenarios__example-cta">{{ index === exampleIndex ? '当前示例 →' : '使用此示例 →' }}</span>
                        </button>
                    </li>
                </ol>
            </div>
            <aside ref="promptPanel" class="toolbox-scenarios__prompt blog-scrollbar" tabindex="0" aria-labelledby="toolbox-prompt-title">
                <p class="toolbox-scenarios__prompt-eyebrow">先添加文档或调用技能，再复制下面的需求</p>
                <div class="toolbox-scenarios__prompt-head">
                    <h3 id="toolbox-prompt-title">复制到对话框使用</h3>
                    <ElButton native-type="button" aria-label="复制当前场景指令" @click="copyPrompt">复制指令</ElButton>
                </div>
                <ol class="toolbox-scenarios__steps">
                    <li><strong>还没安装 Skill</strong>：先下载 Skill ZIP，解压后把 <code>{{ documentPath }}</code> 拖入 AI 对话框，再粘贴下面的需求。</li>
                    <li><strong>已经安装 Skill</strong>：在 AI 工具的技能菜单或指令中选择 <code>{{ skillInvocation(selected) }}</code>，再粘贴下面的需求。</li>
                </ol>
                <p class="toolbox-scenarios__prompt-note">复制后，把【】换成你的实际信息<br>例如，把【填写或附上材料】换成实际文件路径或原文。</p>
                <pre tabindex="0" :aria-label="`${selected.title} 场景指令`">{{ prompt }}</pre>
                <p v-if="copyMessage" class="toolbox-scenarios__status" role="status">{{ copyMessage }}</p>
            </aside>
        </article>
    </section>
</template>

<script setup lang="ts">
import type { SkillEntry } from '../../../../src/types/skills'
import { computed, nextTick, onMounted, onUnmounted, shallowRef, useTemplateRef, watch } from 'vue'
import { ElButton, ElEmpty, ElInput } from 'element-plus'
import { filterSkills, skillDistribution, skillInvocation, skills } from '../skillCatalog'
import { skillDocumentPath, skillScenarioPrompt } from '../toolboxDocuments'
import { useToolboxHistory } from '../useToolboxHistory'
import SkillDocument from './SkillDocument.vue'

const props = defineProps<{ entryHash: string; initialSkill: string }>()
const initial = skills.find(skill => skill.id === props.initialSkill)
const distribution = skillDistribution()
const query = shallowRef('')
const category = shallowRef(initial?.category ?? '')
const selectedId = shallowRef(initial?.id ?? '')
const exampleIndex = shallowRef(0)
const copyMessage = shallowRef('')
const page = shallowRef(1)
const columns = shallowRef(8)
const detail = useTemplateRef<HTMLElement>('detail')
const guidePanel = useTemplateRef<HTMLElement>('guidePanel')
const promptPanel = useTemplateRef<HTMLElement>('promptPanel')
const detailHeading = useTemplateRef<HTMLHeadingElement>('detailHeading')
const matches = computed(() => filterSkills(skills, query.value, category.value))
const pageSize = computed(() => columns.value * 2)
const pageCount = computed(() => Math.max(1, Math.ceil(matches.value.length / pageSize.value)))
const visibleMatches = computed(() => matches.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value))
const selected = computed(() => matches.value.find(skill => skill.id === selectedId.value) ?? visibleMatches.value[0] ?? matches.value[0])
const examples = computed(() => {
    if (selected.value?.examples?.length) return selected.value.examples
    return selected.value?.scenarios.map(title => ({ title, when: '', task: '', outcome: '' })) ?? []
})
const activeExample = computed(() => selected.value?.examples?.[exampleIndex.value])
const activeScenario = computed(() => selected.value?.scenarios[exampleIndex.value])
const prompt = computed(() => {
    const skill = selected.value
    if (!skill) return ''
    if (activeExample.value) return activeExample.value.prompt || activeExample.value.task
    if (!activeScenario.value) return skill.prompt
    return skillScenarioPrompt(skill, activeScenario.value)
})
const documentPath = computed(() => selected.value ? skillDocumentPath(selected.value) : '')

/** 按卡片网格的列数限制默认展示数量，避免出现半截空行。 */
function syncColumns(): void {
    const width = window.innerWidth
    columns.value = width >= 1600 ? 8 : width >= 1200 ? 6 : width >= 960 ? 5 : width >= 640 ? 4 : 2
}

/** 切换分类时保留关键词并回到该类别的第一页。 */
function selectCategory(id: string): void {
    category.value = id
    page.value = 1
    selectedId.value = ''
    exampleIndex.value = 0
    copyMessage.value = ''
}

/** 翻页后自动选中新页的第一个技能。 */
function goToPage(next: number): void {
    const target = Math.min(Math.max(1, next), pageCount.value)
    if (target === page.value) return
    page.value = target
    selectedId.value = visibleMatches.value[0]?.id ?? ''
    exampleIndex.value = 0
    copyMessage.value = ''
}

/** 选择技能；窄屏滚动到详情，宽屏保持卡片与详情同屏。 */
async function selectSkill(id: string): Promise<void> {
    selectedId.value = id
    exampleIndex.value = 0
    copyMessage.value = ''
    await nextTick()
    if (!window.matchMedia('(max-width: 1279px)').matches) {
        detailHeading.value?.focus({ preventScroll: true })
        return
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    detail.value?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
    detailHeading.value?.focus({ preventScroll: true })
}

/** 清空关键词和分类，恢复完整目录。 */
function clearFilters(): void {
    query.value = ''
    category.value = ''
    page.value = 1
    selectedId.value = ''
    exampleIndex.value = 0
    copyMessage.value = ''
}

/** 切换场景示例，更新指令和复制反馈。 */
function selectExample(index: number): void {
    exampleIndex.value = index
    copyMessage.value = ''
}

/** 复制当前指令，写入失败时保留可手动选择的文本。 */
async function copyPrompt(): Promise<void> {
    const text = prompt.value
    let message = '已复制指令，请粘贴到 AI 对话框。'
    try {
        await navigator.clipboard.writeText(text)
    } catch {
        message = '无法自动复制，请选中文字手动复制。'
    }
    if (prompt.value === text) copyMessage.value = message
}

/** 场景数量优先取结构化示例，缺失时回退到场景列表。 */
function scenarioCount(skill: SkillEntry): number {
    return skill.examples?.length || skill.scenarios.length
}

watch(selected, () => { exampleIndex.value = 0 }, { flush: 'sync' })
watch(selected, () => {
    guidePanel.value?.scrollTo({ top: 0, behavior: 'instant' })
    promptPanel.value?.scrollTo({ top: 0, behavior: 'instant' })
}, { flush: 'post' })
watch([query, category], () => { page.value = 1 }, { flush: 'sync' })
watch(columns, () => { page.value = Math.min(page.value, pageCount.value) }, { flush: 'sync' })
onMounted(() => {
    syncColumns()
    window.addEventListener('resize', syncColumns)
})
onUnmounted(() => window.removeEventListener('resize', syncColumns))
useToolboxHistory(props.entryHash, () => ({ query: query.value, category: category.value, page: page.value, selectedId: selectedId.value, exampleIndex: exampleIndex.value }), state => {
    query.value = state.query
    category.value = state.category
    page.value = state.page || 1
    selectedId.value = state.selectedId
    exampleIndex.value = state.exampleIndex
})
</script>

<style scoped>
.toolbox-scenarios {
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: calc(100svh - var(--vp-nav-height) - var(--vp-layout-top-height, 0px) - 48px);
    & .toolbox-scenarios__browse { padding-bottom: 14px; border-bottom: 1px solid var(--blog-border); }
    & .toolbox-scenarios__categories { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
    & .toolbox-scenarios__categories button { min-height: 34px; padding: 5px 10px; border-radius: 6px; font-size: 13px; }
    & .toolbox-scenarios__categories small { color: var(--blog-muted); font: 11px var(--vp-font-family-mono); }
    & .toolbox-scenarios__grid { display: grid; grid-template-rows: repeat(2, 62px); grid-template-columns: repeat(8, minmax(0, 1fr)); gap: 7px; margin: 12px 0 8px; }
    & .toolbox-scenarios__pager { display: flex; align-items: center; justify-content: center; gap: 10px; min-height: 34px; margin-bottom: 10px; color: var(--blog-muted); font-size: 12px; }
    & .toolbox-scenarios__pager .el-button { min-height: 30px; font-size: 12px; }
}
.toolbox-scenarios__card {
    display: grid;
    gap: 2px;
    min-width: 0;
    padding: 6px 10px;
    border: 1px solid var(--blog-border);
    border-radius: 8px;
    background: var(--blog-panel);
    text-align: left;
    overflow-wrap: anywhere;
    cursor: pointer;
    transition: border-color 160ms ease, background-color 160ms ease;
    & strong { display: -webkit-box; overflow: hidden; color: var(--vp-c-text-1); font-size: 13px; line-height: 1.25; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
    & small { color: var(--blog-muted); font-size: 10.5px; line-height: 1.2; }
    &:hover { border-color: var(--blog-border-hover); background: var(--blog-hover-bg); }
    &[aria-pressed='true'] { border-color: var(--blog-selected-border); background: var(--blog-selected-bg); }
    &[aria-pressed='true'] strong { color: var(--blog-selected-text); }
    &:focus-visible { outline: 2px solid var(--blog-focus-ring); outline-offset: 2px; }
}
.toolbox-scenarios__detail {
    display: grid;
    flex: 1;
    grid-template-columns: minmax(0, 1fr) minmax(300px, .92fr);
    gap: clamp(14px, 1.6vw, 22px);
    margin-top: 14px;
    overflow-wrap: anywhere;
}
.toolbox-scenarios__main,
.toolbox-scenarios__prompt {
    min-width: 0;
    padding: 12px;
    border: 1px solid var(--blog-border);
    border-radius: 10px;
    background: var(--vp-c-bg-soft);
}
.toolbox-scenarios__main {
    & .toolbox-scenarios__eyebrow { margin: 0; color: var(--blog-muted); font-size: 11px; }
    & h2 { margin: 2px 0 4px; font-size: clamp(19px, 1.6vw, 23px); line-height: 1.25; }
    & h2:focus-visible { outline: 2px solid var(--blog-focus-ring); outline-offset: 4px; }
    & h3 { margin: 14px 0 4px; font-size: 14px; }
}
.toolbox-scenarios__invocation {
    color: var(--vp-c-brand-1);
    font-size: 11px;
}
.toolbox-scenarios__summary {
    margin: 6px 0 0;
    color: var(--vp-c-text-2);
    font-size: 13px;
    line-height: 1.7;
}
.toolbox-scenarios__boundary {
    margin-top: 10px;
    padding: 7px 10px;
    border-left: 3px solid var(--blog-selected-border);
    border-radius: 0 6px 6px 0;
    background: var(--blog-selected-bg);
    & strong { color: var(--blog-selected-text); font-size: 12px; }
    & p { margin: 1px 0 0; color: var(--vp-c-text-2); font-size: 12px; line-height: 1.65; }
}
.toolbox-scenarios__requirements {
    margin-top: 10px;
    padding: 6px 10px;
    border-radius: 6px;
    background: var(--vp-c-bg-soft);
    & summary { color: var(--vp-c-brand-1); font-size: 12px; cursor: pointer; }
    & dl { display: grid; gap: 6px; margin-top: 8px; }
    & dt { color: var(--vp-c-text-1); font-size: 12px; font-weight: 650; }
    & dd { margin: 1px 0 0; color: var(--vp-c-text-2); font-size: 12px; line-height: 1.65; }
    & ol { list-style: decimal; padding-left: 18px; }
}
.toolbox-scenarios__documents {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 2px 6px;
    margin-top: 8px;
    color: var(--blog-muted);
    font-size: 12px;
}
.toolbox-scenarios__hint {
    margin: 0 0 6px;
    color: var(--blog-muted);
    font-size: 11px;
}
.toolbox-scenarios__examples {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 5px;
    margin-top: 2px;
    & button {
        display: grid;
        gap: 1px;
        width: 100%;
        padding: 7px 10px;
        border: 1px solid var(--blog-border);
        border-radius: 7px;
        background: var(--blog-panel);
        text-align: left;
        transition: border-color 160ms ease, background-color 160ms ease;
    }
    & button:hover { border-color: var(--blog-border-hover); background: var(--blog-hover-bg); }
    & button[aria-pressed='true'] { border-color: var(--blog-selected-border); background: var(--blog-selected-bg); }
    & button:focus-visible { outline: 2px solid var(--blog-focus-ring); outline-offset: 2px; }
    & .toolbox-scenarios__example-title { color: var(--vp-c-text-1); font-size: 13px; font-weight: 600; }
    & .toolbox-scenarios__example-when { color: var(--vp-c-text-2); font-size: 12px; line-height: 1.6; }
    & .toolbox-scenarios__example-cta { color: var(--vp-c-brand-1); font-size: 11px; }
}
.toolbox-scenarios__prompt {
    display: flex;
    flex-direction: column;
    align-self: stretch;
    & .toolbox-scenarios__prompt-eyebrow { margin: 0; color: var(--blog-muted); font-size: 11px; }
    & .toolbox-scenarios__prompt-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 6px; margin-top: 1px; }
    & h3 { margin: 0; font-size: 15px; }
    & .toolbox-scenarios__steps { display: grid; gap: 4px; margin: 8px 0 0; padding-left: 16px; list-style: decimal; }
    & .toolbox-scenarios__steps li { color: var(--vp-c-text-2); font-size: 12px; line-height: 1.6; }
    & code { color: var(--vp-c-brand-1); font-size: 11px; }
    & .toolbox-scenarios__prompt-note { margin: 8px 0 0; padding: 6px 8px; border: 1px solid var(--blog-border); border-radius: 6px; background: var(--blog-panel); color: var(--vp-c-text-2); font-size: 11px; line-height: 1.6; }
    & pre { flex: 1; margin: 8px 0 0; padding: 10px; border-radius: 6px; background: var(--blog-panel); color: var(--vp-c-text-1); font-size: 12px; line-height: 1.65; white-space: pre-wrap; user-select: text; }
    & pre:focus-visible { outline: 2px solid var(--blog-focus-ring); outline-offset: 2px; }
    & .toolbox-scenarios__status { margin: 6px 0 0; color: var(--blog-selected-text); font-size: 11px; }
}
@media (min-width: 1280px) {
    .toolbox-scenarios {
        height: max(550px, calc(100dvh - var(--vp-nav-height) - var(--vp-layout-top-height, 0px) - 48px));
        & .toolbox-scenarios__browse,
        & .toolbox-scenarios__grid,
        & .toolbox-scenarios__pager { flex-shrink: 0; }
        & .toolbox-scenarios__detail {
            min-height: 0;
            grid-template-rows: minmax(0, 1fr);
        }
        & .toolbox-scenarios__main,
        & .toolbox-scenarios__prompt {
            min-height: 0;
            overflow: auto;
            overscroll-behavior: contain;
        }
    }
}
@media (max-width: 1599px) {
    .toolbox-scenarios {
        & .toolbox-scenarios__grid { grid-template-columns: repeat(6, minmax(0, 1fr)); }
    }
}
@media (max-width: 1199px) {
    .toolbox-scenarios {
        & .toolbox-scenarios__grid { grid-template-columns: repeat(5, minmax(0, 1fr)); }
    }
}
@media (max-width: 959px) {
    .toolbox-scenarios {
        & .toolbox-scenarios__grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    }
}
@media (max-width: 1050px) {
    .toolbox-scenarios {
        & .toolbox-scenarios__detail { grid-template-columns: minmax(0, 1fr); }
    }
}
@media (max-width: 639px) {
    .toolbox-scenarios {
        & .toolbox-scenarios__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        & .toolbox-scenarios__examples { grid-template-columns: minmax(0, 1fr); }
    }
}
</style>
