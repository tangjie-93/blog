<template>
    <section class="skill-library" aria-label="能力搜索和结果">
        <ElInput v-model="query" size="large" clearable aria-label="搜索任务或工具" placeholder="搜索名称、场景或关键词…" />
        <div ref="resultsHeader" class="skill-library__toolbar">
            <div class="skill-library__kinds" role="group" aria-label="资产类型">
                <button v-for="item in kinds" :key="item.id" type="button" class="blog-choice" :aria-pressed="kind === item.id" @click="selectKind(item.id)">
                    {{ item.label }} <small>{{ item.count }}</small>
                </button>
            </div>
            <div v-if="kind === 'skill' || kind === 'plugin' || kind === 'mcp'" class="skill-library__filters">
                <ElSelect v-if="kind === 'skill'" v-model="category" aria-label="技能分类" :empty-values="[null, undefined]">
                    <ElOption label="全部分类" value="" />
                    <ElOption v-for="item in skillCategories" :key="item.id" :value="item.id" :label="item.title" />
                </ElSelect>
                <ElSelect v-model="source" aria-label="工具来源" :empty-values="[null, undefined]" filterable>
                    <ElOption label="全部来源" value="" />
                    <ElOption v-for="item in sources" :key="item" :value="item" :label="sourceLabel(item)" />
                </ElSelect>
            </div>
            <p class="skill-library__count" role="status">匹配 {{ results.length }} 项<span v-if="results.length"> · 展示 {{ visible.length }} 项</span></p>
        </div>
        <div v-if="results.length" id="toolbox-results" ref="resultsGrid" class="skill-library__grid">
            <template v-for="row in visible" :key="`${row.kind}:${row.entry.id}`">
                <SkillCard v-if="row.kind === 'skill'" :skill="row.entry" compact />
                <ToolCard v-else-if="row.kind === 'tool'" :entry="row.entry" compact />
                <article v-else class="skill-library__card">
                    <h2>{{ row.entry.title }}</h2><p>{{ row.entry.summary }}</p>
                    <details><summary>预览说明</summary><pre>{{ row.entry.prompt }}</pre></details>
                </article>
            </template>
        </div>
        <ElEmpty v-else :description="query || category || source ? '没有找到匹配的能力' : '这个类型暂无内容'">
            <ElButton v-if="query || category || source" @click="clearFilters">清除筛选</ElButton>
            <ElButton v-else @click="selectKind('all')">查看全部能力</ElButton>
        </ElEmpty>
        <button v-if="results.length > previewLimit" type="button" class="skill-library__expand" aria-controls="toolbox-results" :aria-expanded="expanded" @click="toggleExpanded">
            {{ expanded ? '收起能力目录 ↑' : '展开全部能力 ↓' }}
        </button>
    </section>
</template>

<script setup lang="ts">
import { computed, shallowRef, useTemplateRef, watch } from 'vue'
import { ElButton, ElEmpty, ElInput, ElOption, ElSelect } from 'element-plus'
import { filterTools, pluginEntries, mcpEntries } from '../toolbox'
import { filterSkills, skillCategories, skills, agents, rules } from '../skillCatalog'
import type { CapabilityKind } from '../../../../src/types/skills'
import { useToolboxHistory } from '../useToolboxHistory'
import SkillCard from './SkillCard.vue'
import ToolCard from './ToolCard.vue'

const props = defineProps<{ entryHash: string; initialKind: CapabilityKind | 'all'; initialCategory: string }>()
const kinds = [
    { id: 'all', label: '全部', count: skills.length + agents.length + rules.length + pluginEntries.length + mcpEntries.length },
    { id: 'skill', label: '技能', count: skills.length },
    { id: 'agent', label: 'Agent', count: agents.length },
    { id: 'rule', label: '规则', count: rules.length },
    { id: 'plugin', label: '插件', count: pluginEntries.length },
    { id: 'mcp', label: 'MCP', count: mcpEntries.length },
] as const
const kind = shallowRef(props.initialKind === 'all' && props.initialCategory ? 'skill' : props.initialKind)
const query = shallowRef('')
const category = shallowRef(props.initialCategory)
const source = shallowRef('')
const expanded = shallowRef(false)
const resultsHeader = useTemplateRef<HTMLElement>('resultsHeader')
const resultsGrid = useTemplateRef<HTMLElement>('resultsGrid')
const previewLimit = shallowRef(6)
const sources = computed(() => {
    const entries = kind.value === 'skill' ? skills : kind.value === 'plugin' ? pluginEntries : mcpEntries
    return [...new Set(entries.map(entry => entry.source))]
})
const results = computed(() => {
    const rows = []
    const matches = query.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean)
    if (kind.value === 'all' || kind.value === 'skill') {
        rows.push(...filterSkills(skills, query.value, category.value, source.value).map(entry => ({ kind: 'skill' as const, entry })))
    }
    if (kind.value === 'all' || kind.value === 'agent' || kind.value === 'rule') {
        const entries = kind.value === 'agent' ? agents : kind.value === 'rule' ? rules : [...agents, ...rules]
        rows.push(...entries.filter(entry => matches.every(word => `${entry.name} ${entry.title} ${entry.summary}`.toLocaleLowerCase().includes(word)))
            .map(entry => ({ kind: 'text' as const, entry })))
    }
    if (kind.value === 'all' || kind.value === 'plugin' || kind.value === 'mcp') {
        const entries = kind.value === 'plugin' ? pluginEntries : kind.value === 'mcp' ? mcpEntries : [...pluginEntries, ...mcpEntries]
        rows.push(...filterTools(entries, query.value, source.value).map(entry => ({ kind: 'tool' as const, entry })))
    }
    return rows
})
const visible = computed(() => expanded.value ? results.value : results.value.slice(0, previewLimit.value))

// 按实际列数保留两行预览，避免在脚本中重复定义断点。
watch(resultsGrid, (grid, _, onCleanup) => {
    if (!grid || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() => {
        const columns = getComputedStyle(grid).gridTemplateColumns.split(' ').length
        previewLimit.value = columns * 2
    })
    observer.observe(grid)
    onCleanup(() => observer.disconnect())
})

/** 切换类型时保留搜索关键词并重置类型专属筛选。 */
function selectKind(id: CapabilityKind | 'all'): void {
    if (kind.value === id) return
    kind.value = id
    category.value = ''
    source.value = ''
}

/** 清空关键词及目录筛选。 */
function clearFilters(): void {
    query.value = ''
    category.value = ''
    source.value = ''
}

/** 查找来源的显示名称。 */
function sourceLabel(value: string): string {
    if (value === 'personal') return '个人技能'
    if (value === 'system') return '系统技能'
    return kind.value === 'skill' ? `${value} 插件` : value
}

/** 展开全部结果，收起时将焦点移回筛选区。 */
function toggleExpanded(): void {
    expanded.value = !expanded.value
    if (!expanded.value) resultsHeader.value?.querySelector<HTMLButtonElement>('button[aria-pressed="true"]')?.focus()
}

watch([kind, query, category, source], () => { expanded.value = false }, { flush: 'sync' })
useToolboxHistory(props.entryHash, () => ({ kind: kind.value, query: query.value, category: category.value, source: source.value, expanded: expanded.value }), state => {
    kind.value = state.kind
    query.value = state.query
    category.value = state.category
    source.value = state.source
    expanded.value = state.expanded
})
</script>

<style scoped>
.skill-library {
    min-width: 0;
    container-type: inline-size;
    & .skill-library__toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 14px; margin: 10px 0 16px; padding-bottom: 12px; border-bottom: 1px solid var(--blog-border); }
    & .skill-library__kinds, & .skill-library__filters { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; }
    & .skill-library__kinds button { min-height: 34px; padding: 5px 9px; border-radius: 6px; font-size: 13px; }
    & .skill-library__kinds small { font: 11px var(--vp-font-family-mono); }
    & .skill-library__filters :deep(.el-select) { width: 150px; }
    & .skill-library__count { margin-left: auto; color: var(--blog-muted); font-size: 13px; }
    & .skill-library__grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 14px; }
    & .skill-library__card, & .skill-library__expand { border: 1px solid var(--blog-border); border-radius: var(--blog-radius); background: var(--blog-panel); }
    & .skill-library__card { padding: 16px; overflow-wrap: anywhere; }
    & .skill-library__card pre { white-space: pre-wrap; }
    & .skill-library__expand { width: 100%; min-height: 42px; margin-top: 16px; font-size: 14px; }
    & .skill-library__expand:hover { border-color: var(--blog-border-hover); color: var(--vp-c-brand-1); }
    @container (min-width: 580px) { & .skill-library__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @container (min-width: 880px) { & .skill-library__grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
    @container (min-width: 1180px) { & .skill-library__grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
    @container (min-width: 1500px) { & .skill-library__grid { grid-template-columns: repeat(5, minmax(0, 1fr)); } }
    @media (max-width: 580px) {
        & .skill-library__filters :deep(.el-select) { width: min(142px, 100%); }
        & .skill-library__count { margin-left: 0; }
    }
}
</style>
