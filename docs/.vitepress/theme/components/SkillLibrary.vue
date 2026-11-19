<template>
    <main class="skill-library">
        <header class="skill-library__intro">
            <div><h1>AI 工具箱</h1><p class="skill-library__lede">查找技能、插件和 MCP 工具。</p></div>
            <a :href="withBase('/skills/guide.html')">第一次使用？看入门指南 ↗</a>
        </header>
        <div class="skill-library__toolbar">
            <ElTabs v-model="kind" class="skill-library__tabs" aria-label="工具类型">
                <ElTabPane :label="`技能 ${skills.length}`" name="skill" />
                <ElTabPane :label="`插件 ${pluginEntries.length}`" name="plugin" />
                <ElTabPane :label="`MCP ${mcpEntries.length}`" name="mcp" />
            </ElTabs>
            <div class="skill-library__filters">
                <div class="skill-library__search"><label class="skill-library__label" for="toolbox-search">搜索任务或工具</label><ElInput id="toolbox-search" v-model="query" clearable placeholder="搜索任务或工具，例如：财报、Vue、PDF…" /></div>
                <div class="skill-library__source"><label class="skill-library__label" for="toolbox-source">工具来源</label><ElSelect v-model="source" id="toolbox-source" :empty-values="[null, undefined]" aria-label="工具来源" filterable><ElOption label="全部来源" value="" /><ElOption v-for="item in sources" :key="item" :value="item" :label="sourceLabel(item)" /></ElSelect></div>
            </div>
        </div>
        <nav v-if="kind === 'skill'" class="skill-library__categories" aria-label="技能任务分类">
            <ElButton :type="category === '' ? 'primary' : 'default'" plain :aria-pressed="category === ''" @click="category = ''">全部 <span>{{ skills.length }}</span></ElButton>
            <ElButton v-for="item in skillCategories" :key="item.id" :type="category === item.id ? 'primary' : 'default'" plain :aria-pressed="category === item.id" @click="category = item.id">{{ item.title }} <span>{{ skills.filter(skill => skill.category === item.id).length }}</span></ElButton>
        </nav>
        <p v-else class="skill-library__snapshot">{{ kind === 'plugin' ? '插件可以包含技能、MCP 或应用连接。没有技能的插件也可能提供工具能力。' : '此处展示本地配置和插件声明，不测试或公开你的凭据。未启用、未声明和连接未验证分别标注。' }} <a :href="withBase('/skills/connections.html')">了解安装与连接 ↗</a></p>
        <div ref="resultsHeader" class="skill-library__results-header">
            <p role="status" aria-live="polite">找到 {{ resultCount }} 项{{ kindLabel }}<span v-if="resultCount"> · 第 {{ page }} / {{ pageCount }} 页</span></p>
            <ElButton v-if="query || category || source" @click="clearFilters">清除筛选</ElButton>
        </div>
        <div ref="gridViewport" class="skill-library__viewport">
            <div v-if="resultCount" :key="JSON.stringify([kind, category, source, query, page])" class="skill-library__grid" :style="gridStyle">
                <template v-if="kind === 'skill'"><SkillCard v-for="skill in visibleSkills" :key="skill.id" :skill="skill" compact /></template>
                <template v-else><ToolCard v-for="entry in visibleTools" :key="entry.id" :entry="entry" compact /></template>
            </div>
            <ElEmpty v-else class="skill-library__empty" description="没有找到匹配工具，试试更短的任务词或清除筛选。" />
        </div>
        <div class="skill-library__footer">
            <p>已合并旧版本与其他宿主副本。Figma 和 Caveman 仅见本地缓存，未列为可用技能。<a :href="withBase('/skills/guide.html#目录范围与维护')">查看收录范围与更新方法 ↗</a></p>
            <ElPagination v-if="pageCount > 1" class="skill-library__pagination" :current-page="page" :page-size="pageSize" :total="resultCount" layout="prev, pager, next" :pager-count="5" background aria-label="工具分页" @current-change="changePage" />
        </div>
    </main>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { withBase } from 'vitepress'
import { ElButton, ElInput, ElSelect, ElOption, ElTabs, ElTabPane, ElPagination, ElEmpty } from 'element-plus'
import { filterTools, pluginEntries, mcpEntries } from '../toolbox'
import { filterSkills, skillCategories, skills } from '../skillCatalog'
import { useFitPageSize } from '../useFitPageSize'
import SkillCard from './SkillCard.vue'
import ToolCard from './ToolCard.vue'

const kind = ref('skill')
const query = ref('')
const category = ref('')
const source = ref('')
const page = ref(1)
const resultsHeader = ref<HTMLElement | null>(null)
const gridViewport = ref<HTMLElement | null>(null)
const { pageSize, gridStyle } = useFitPageSize(gridViewport, {
    enabled: true,
    fallbackSize: 12,
    minCardWidth: 260,
    minCardHeight: 220,
    minViewportWidth: 900
})
const kindLabel = computed(() => kind.value === 'skill' ? '技能' : kind.value === 'plugin' ? '插件' : 'MCP')
const toolEntries = computed(() => kind.value === 'plugin' ? pluginEntries : mcpEntries)
const sources = computed(() => [...new Set((kind.value === 'skill' ? skills : toolEntries.value).map(item => item.source))])
const filtered = computed(() => filterSkills(skills, query.value, category.value, source.value))
const filteredTools = computed(() => filterTools(toolEntries.value, query.value, source.value))
const resultCount = computed(() => kind.value === 'skill' ? filtered.value.length : filteredTools.value.length)
const pageCount = computed(() => Math.max(1, Math.ceil(resultCount.value / pageSize.value)))
const visibleSkills = computed(() => filtered.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value))
const visibleTools = computed(() => filteredTools.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value))

/** 统一显示个人、系统与插件来源名称。 */
function sourceLabel(value: string): string {
    if (value === 'personal') return '个人技能'
    if (value === 'system') return '系统技能'
    return kind.value === 'skill' ? `${value} 插件` : value
}

/** 清除全部筛选条件，分页由监听器回到第一页。 */
function clearFilters(): void {
    query.value = ''
    category.value = ''
    source.value = ''
}

/** 翻页后回到结果开头，方便继续浏览技能卡片。 */
async function changePage(nextPage: number): Promise<void> {
    page.value = Math.max(1, Math.min(pageCount.value, nextPage))
    await nextTick()
    resultsHeader.value?.scrollIntoView({ block: 'start', behavior: 'instant' })
}

watch([query, category, source], () => { page.value = 1 })
watch(kind, () => { clearFilters(); page.value = 1 })
watch(pageSize, () => { page.value = Math.min(page.value, pageCount.value) })
</script>

<style scoped>
.skill-library {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    width: 100%;
    margin: 0;
    padding: 16px var(--blog-page-gutter) 12px;
    & .skill-library__intro { display: flex; flex-shrink: 0; align-items: flex-end; justify-content: space-between; gap: 24px; }
    & h1 { margin: 0 0 4px; font-size: 24px; line-height: 1.3; }
    & .skill-library__lede { margin: 0; color: var(--vp-c-text-2); font-size: 13px; line-height: 1.6; }
    & a { color: var(--vp-c-brand-1); text-decoration: underline; text-underline-offset: 4px; }
    & .skill-library__intro > a { flex-shrink: 0; padding-bottom: 2px; font-size: 13px; }
    & .skill-library__snapshot { flex-shrink: 0; margin: 8px 0 0; color: var(--blog-muted); font-size: 12px; line-height: 1.6; }
    & .skill-library__toolbar { display: flex; flex-shrink: 0; align-items: center; gap: 24px; margin-top: 8px; border-bottom: 1px solid var(--blog-border); }
    & .skill-library__tabs { flex-shrink: 0; }
    & .skill-library__tabs :deep(.el-tabs__header) { margin: 0; }
    & .skill-library__tabs :deep(.el-tabs__nav-wrap::after) { display: none; }
    & .skill-library__tabs :deep(.el-tabs__item) { height: 36px; margin-right: 24px; padding: 0 4px; font-size: 14px; }
    & .skill-library__tabs :deep(.el-tabs__active-bar) { height: 2px; }
    & .skill-library__filters { display: flex; flex: 1; justify-content: flex-end; gap: 8px; padding-bottom: 6px; }
    & .skill-library__label { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
    & .skill-library__search { flex: 1; max-width: 360px; min-width: 180px; }
    & .skill-library__source { flex-shrink: 0; width: 180px; }
    & :deep(.el-input__wrapper), & :deep(.el-select__wrapper) { min-height: 34px; }
    & .skill-library__categories { display: flex; flex-shrink: 0; flex-wrap: nowrap; gap: 6px; margin: 10px 0 0; padding-bottom: 2px; overflow-x: auto; scrollbar-width: none; }
    & .skill-library__categories::-webkit-scrollbar { display: none; }
    & .skill-library__categories .el-button { flex-shrink: 0; height: 30px; padding: 0 10px; font-size: 12px; }
    & .skill-library__categories .el-button + .el-button { margin-left: 0; }
    & .skill-library__categories span { margin-left: 4px; font-size: 10px; }
    & .skill-library__results-header { display: flex; flex-shrink: 0; align-items: center; justify-content: space-between; min-height: 34px; gap: 12px; font-size: 12px; color: var(--blog-muted); scroll-margin-top: calc(var(--vp-nav-height) + 16px); }
    & .skill-library__results-header :deep(.el-button) { height: 26px; padding: 0 10px; font-size: 12px; }
    & .skill-library__viewport { display: flex; flex: 1; flex-direction: column; min-height: 0; }
    & .skill-library__grid { display: grid; flex: 1; min-width: 0; min-height: 0; height: 100%; overflow: hidden; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; align-items: stretch; animation: skill-results-enter 220ms ease-out; }
    & .skill-library__empty { margin: auto; padding: 48px 20px; text-align: center; border: 1px dashed var(--blog-border); border-radius: 10px; }
    & .skill-library__footer { display: flex; flex-shrink: 0; align-items: center; justify-content: space-between; gap: 16px; min-height: 48px; font-size: 12px; line-height: 1.8; color: var(--blog-muted); }
    & .skill-library__footer p { flex: 1; min-width: 0; margin: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
    & .skill-library__pagination { flex-shrink: 0; }
    @media (max-width: 1200px) { & .skill-library__grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
    @media (max-width: 900px) {
        & .skill-library__footer p { display: none; }
        & .skill-library__footer { justify-content: center; }
        & .skill-library__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        & .skill-library__toolbar { align-items: stretch; flex-direction: column; gap: 0; }
        & .skill-library__filters { padding: 8px 0; }
    }
    @media (max-width: 767px) {
        & .skill-library__intro { align-items: start; flex-direction: column; gap: 8px; }
        & .skill-library__grid { grid-template-columns: minmax(0, 1fr); }
        & .skill-library__search { min-width: 0; }
        & .skill-library__source { width: 130px; }
    }
    @media (prefers-reduced-motion: reduce) { & .skill-library__grid { animation: none; } & :deep(.el-button) { transition: none; } }
}
@keyframes skill-results-enter {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
