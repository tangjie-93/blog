<template>
    <section class="skill-library" aria-label="能力搜索和结果">
        <div ref="resultsHeader" class="skill-library__toolbar">
            <ElInput v-model="query" class="skill-library__search" size="large" clearable aria-label="搜索任务或工具" placeholder="搜索名称、场景或关键词…" />
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
        <div id="toolbox-results" ref="resultsViewport" class="skill-library__viewport blog-scrollbar">
            <div v-show="results.length" class="skill-library__grid" :style="fittedGridStyle">
                <template v-for="row in visible" :key="`${row.kind}:${row.entry.id}`">
                    <SkillCard v-if="row.kind === 'skill'" :skill="row.entry" compact />
                    <ToolCard v-else-if="row.kind === 'tool'" :entry="row.entry" compact />
                    <article v-else class="skill-library__card">
                        <h2>{{ row.entry.title }}</h2><p>{{ row.entry.summary }}</p>
                        <details><summary>预览说明</summary><pre>{{ row.entry.prompt }}</pre></details>
                    </article>
                </template>
            </div>
            <ElEmpty v-if="!results.length" :description="query || category || source ? '没有找到匹配的能力' : '这个类型暂无内容'">
                <ElButton v-if="query || category || source" @click="clearFilters">清除筛选</ElButton>
                <ElButton v-else @click="selectKind('all')">查看全部能力</ElButton>
            </ElEmpty>
        </div>
        <nav v-if="results.length" class="skill-library__pagination" aria-label="能力目录分页">
            <ElButton native-type="button" :disabled="currentPage === 1" aria-controls="toolbox-results" @click="changePage(currentPage - 1)">上一页</ElButton>
            <ElSelect :model-value="currentPage" class="skill-library__page-select" aria-label="选择页码" @change="changePage">
                <ElOption v-for="number in pageCount" :key="number" :value="number" :label="`第 ${number} / ${pageCount} 页`" />
            </ElSelect>
            <ElButton native-type="button" :disabled="currentPage === pageCount" aria-controls="toolbox-results" @click="changePage(currentPage + 1)">下一页</ElButton>
        </nav>
    </section>
</template>

<script setup lang="ts">
import { computed, nextTick, shallowRef, useTemplateRef, watch } from 'vue'
import { ElButton, ElEmpty, ElInput, ElOption, ElSelect } from 'element-plus'
import { filterTools, pluginEntries, mcpEntries } from '../toolbox'
import { filterSkills, skillCategories, skills, agents, rules } from '../skillCatalog'
import type { CapabilityKind } from '../../../../src/types/skills'
import { useToolboxHistory } from '../useToolboxHistory'
import { useFitPageSize } from '../useFitPageSize'
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
const page = shallowRef(1)
const resultsHeader = useTemplateRef<HTMLElement>('resultsHeader')
const resultsViewport = useTemplateRef<HTMLElement>('resultsViewport')
const { pageSize, rowHeight, gridStyle, active: fitActive } = useFitPageSize(resultsViewport, {
    enabled: true,
    fallbackSize: 6,
    minCardWidth: 288,
    minCardHeight: () => kind.value === 'plugin' || kind.value === 'mcp' ? 230 : 200,
    maxColumns: 5,
    minViewportWidth: 960,
})
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
const fittedGridStyle = computed(() => gridStyle.value && {
    gridTemplateColumns: gridStyle.value.gridTemplateColumns,
    gridAutoRows: `minmax(min-content, ${rowHeight.value}px)`,
})
const pageCount = computed(() => Math.max(1, Math.ceil(results.value.length / pageSize.value)))
const currentPage = computed(() => Math.min(page.value, pageCount.value))
const visible = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return results.value.slice(start, start + pageSize.value)
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

/**
 * 切换能力目录页码，更新卡片后回到结果顶部。
 * @param nextPage 分页控件选中的页码。
 */
async function changePage(nextPage: number): Promise<void> {
    page.value = nextPage
    await nextTick()
    if (!fitActive.value) resultsHeader.value?.scrollIntoView({ block: 'start', behavior: 'instant' })
}

watch([currentPage, kind, query, category, source], () => resultsViewport.value?.scrollTo({ top: 0, behavior: 'instant' }), { flush: 'post' })
watch([kind, query, category, source], () => { page.value = 1 }, { flush: 'sync' })
useToolboxHistory(props.entryHash, () => ({ kind: kind.value, query: query.value, category: category.value, source: source.value, page: page.value }), state => {
    kind.value = state.kind
    query.value = state.query
    category.value = state.category
    source.value = state.source
    page.value = state.page ?? 1
})
</script>

<style scoped>
.skill-library {
    display: flex;
    flex-direction: column;
    min-width: 0;
    container-type: inline-size;
    & .skill-library__toolbar { display: flex; flex: none; flex-wrap: wrap; align-items: center; gap: 8px 14px; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--blog-border); scroll-margin-top: calc(var(--vp-nav-height) + 12px); }
    & .skill-library__search { flex: 0 0 150px; min-width: 0; }
    & .skill-library__kinds, & .skill-library__filters { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; }
    & .skill-library__kinds button { min-height: 34px; padding: 5px 9px; border-radius: 6px; font-size: 13px; }
    & .skill-library__kinds small { font: 11px var(--vp-font-family-mono); }
    & .skill-library__filters :deep(.el-select) { width: 150px; }
    & .skill-library__count { flex: none; margin-left: auto; color: var(--blog-muted); font-size: 13px; }
    & .skill-library__viewport { flex: 1; min-height: 0; }
    & .skill-library__grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 14px; }
    & .skill-library__card { padding: 16px; border: 1px solid var(--blog-border); border-radius: var(--blog-radius); background: var(--blog-panel); overflow-wrap: anywhere; }
    & .skill-library__card pre { white-space: pre-wrap; }
    & .skill-library__pagination { display: flex; flex: none; flex-wrap: wrap; align-items: center; justify-content: center; gap: 8px; min-height: 32px; margin-top: 12px; }
    & .skill-library__pagination .el-button { margin: 0; }
    & .skill-library__page-select { width: 120px; }
    @media (min-width: 960px) {
        height: 100%;
        & .skill-library__viewport { overflow: auto; }
    }
    @container (min-width: 580px) { & .skill-library__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @container (min-width: 880px) { & .skill-library__grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
    @container (min-width: 1180px) {
        & .skill-library__search { flex-basis: 320px; }
        & .skill-library__grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    }
    @container (min-width: 1500px) { & .skill-library__grid { grid-template-columns: repeat(5, minmax(0, 1fr)); } }
    @media (max-width: 580px) {
        & .skill-library__search { flex-basis: 100%; }
        & .skill-library__filters :deep(.el-select) { width: min(142px, 100%); }
        & .skill-library__count { margin-left: 0; }
    }
}
</style>
