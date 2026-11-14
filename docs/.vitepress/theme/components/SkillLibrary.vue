<template>
    <main class="skill-library">
        <header class="skill-library__intro">
            <div><p class="skill-library__eyebrow">AI TOOLBOX / 按任务找工具</p><h1>想做什么，就从这里开始。</h1><p>技能教你怎么做，插件打包能力，MCP 连接工具与数据。按任务选择，再准备材料开始。</p></div>
            <a :href="withBase('/skills/guide.html')">第一次使用？看入门指南 ↗</a>
        </header>
        <p class="skill-library__snapshot">整理于 {{ skillSnapshot.updatedAt }} · {{ skills.length }} 项技能、{{ pluginEntries.length }} 个启用插件、{{ mcpEntries.length }} 项 MCP 配置记录。配置记录不代表已连接；详情中说明使用前提。</p>
        <ElTabs v-model="kind" class="skill-library__tabs" aria-label="工具类型">
            <ElTabPane :label="`技能 ${skills.length}`" name="skill" />
            <ElTabPane :label="`插件 ${pluginEntries.length}`" name="plugin" />
            <ElTabPane :label="`MCP ${mcpEntries.length}`" name="mcp" />
        </ElTabs>
        <div class="skill-library__filters">
            <div class="skill-library__search"><label for="toolbox-search">搜索任务或工具</label><ElInput id="toolbox-search" v-model="query" clearable placeholder="例如：财报、Vue、PDF、检查网页…" /></div>
            <div class="skill-library__source"><label for="toolbox-source">工具来源</label><ElSelect v-model="source" id="toolbox-source" :empty-values="[null, undefined]" aria-label="工具来源" filterable><ElOption label="全部来源" value="" /><ElOption v-for="item in sources" :key="item" :value="item" :label="sourceLabel(item)" /></ElSelect></div>
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
        <div v-if="resultCount" :key="JSON.stringify([kind, category, source, query, page])" class="skill-library__grid">
            <template v-if="kind === 'skill'"><SkillCard v-for="skill in visibleSkills" :key="skill.id" :skill="skill" /></template>
            <template v-else><ToolCard v-for="entry in visibleTools" :key="entry.id" :entry="entry" /></template>
        </div>
        <ElEmpty v-else description="没有找到匹配工具，试试更短的任务词或清除筛选。" />
        <ElPagination v-if="pageCount > 1" class="skill-library__pagination" :current-page="page" :page-size="pageSize" :total="resultCount" layout="prev, pager, next" :pager-count="5" background aria-label="工具分页" @current-change="changePage" />
        <footer class="skill-library__footer">已合并旧版本与其他宿主副本。Figma 和 Caveman 仅见本地缓存，未列为可用技能。<a :href="withBase('/skills/guide.html#目录范围与维护')">查看收录范围与更新方法 ↗</a></footer>
    </main>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { withBase } from 'vitepress'
import { ElButton, ElInput, ElSelect, ElOption, ElTabs, ElTabPane, ElPagination, ElEmpty } from 'element-plus'
import { filterTools, pluginEntries, mcpEntries } from '../toolbox'
import { filterSkills, skillCategories, skills, skillSnapshot } from '../skillCatalog'
import SkillCard from './SkillCard.vue'
import ToolCard from './ToolCard.vue'

const kind = ref('skill')
const query = ref('')
const category = ref('')
const source = ref('')
const page = ref(1)
const resultsHeader = ref<HTMLElement | null>(null)
const pageSize = 12
const kindLabel = computed(() => kind.value === 'skill' ? '技能' : kind.value === 'plugin' ? '插件' : 'MCP')
const toolEntries = computed(() => kind.value === 'plugin' ? pluginEntries : mcpEntries)
const sources = computed(() => [...new Set((kind.value === 'skill' ? skills : toolEntries.value).map(item => item.source))])
const filtered = computed(() => filterSkills(skills, query.value, category.value, source.value))
const filteredTools = computed(() => filterTools(toolEntries.value, query.value, source.value))
const resultCount = computed(() => kind.value === 'skill' ? filtered.value.length : filteredTools.value.length)
const pageCount = computed(() => Math.ceil(resultCount.value / pageSize))
const visibleSkills = computed(() => filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize))
const visibleTools = computed(() => filteredTools.value.slice((page.value - 1) * pageSize, page.value * pageSize))

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
</script>

<style scoped>
.skill-library {
    max-width: 1440px; margin: 0 auto; padding: 28px var(--blog-page-gutter) 40px;
    & .skill-library__intro { display: flex; align-items: center; justify-content: space-between; gap: 24px; }
    & .skill-library__eyebrow { color: var(--vp-c-brand-1); font-size: 11px; letter-spacing: 1.5px; }
    & h1 { margin: 10px 0; font-size: clamp(26px, 3vw, 36px); line-height: 1.4; }
    & .skill-library__intro p:last-child { color: var(--vp-c-text-2); font-size: 14px; }
    & a { color: var(--vp-c-brand-1); text-decoration: underline; text-underline-offset: 4px; }
    & .skill-library__intro > a { flex-shrink: 0; font-size: 14px; }
    & .skill-library__snapshot { margin: 22px 0; color: var(--blog-muted); font-size: 12px; line-height: 1.8; }
    & .skill-library__filters { display: flex; flex-wrap: wrap; gap: 16px; padding: 18px; border: 1px solid var(--blog-border); border-radius: 12px; background: var(--blog-panel); }
    & label { display: block; margin-bottom: 8px; font-size: 13px; }
    & .skill-library__search { flex: 1; min-width: 200px; }
    & .skill-library__source { width: 220px; }
    & :deep(.el-input__wrapper), & :deep(.el-select__wrapper) { min-height: 42px; }
    & .skill-library__categories { display: flex; flex-wrap: wrap; gap: 8px; margin: 16px 0; }
    & .skill-library__categories .el-button { min-height: 38px; }
    & .skill-library__categories span { margin-left: 5px; font-size: 11px; }
    & .skill-library__results-header { display: flex; align-items: center; justify-content: space-between; min-height: 48px; gap: 12px; font-size: 13px; color: var(--blog-muted); scroll-margin-top: calc(var(--vp-nav-height) + 16px); }
    & .skill-library__grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; align-items: stretch; animation: skill-results-enter 220ms ease-out; }
    & .skill-library__pagination { display: flex; gap: 18px; align-items: center; justify-content: center; margin-top: 24px; font-size: 13px; }
    & .skill-library__empty { padding: 48px 20px; text-align: center; border: 1px dashed var(--blog-border); border-radius: 10px; }
    & .skill-library__footer { margin-top: 28px; font-size: 12px; line-height: 1.8; color: var(--blog-muted); }
    @media (max-width: 1100px) { & .skill-library__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (max-width: 767px) {
        & .skill-library__intro { align-items: start; flex-direction: column; gap: 14px; }
        & .skill-library__grid { grid-template-columns: minmax(0, 1fr); }
        & .skill-library__source { width: 100%; }
    }
    @media (prefers-reduced-motion: reduce) { & .skill-library__grid { animation: none; } & :deep(.el-button) { transition: none; } }
}
@keyframes skill-results-enter {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
