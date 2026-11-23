<template>
    <div class="toolbox-handbook vp-raw" @click="followSectionLink">
        <aside class="toolbox-handbook__sidebar">
            <nav aria-label="工具箱导航">
                <a href="#/library" :aria-current="section === 'library' ? 'page' : undefined">能力目录</a>
                <a href="#/scenarios" :aria-current="section === 'scenarios' ? 'page' : undefined">应用场景</a>
            </nav>
        </aside>
        <main class="toolbox-handbook__main" :aria-label="sectionTitle">
            <SkillLibrary v-if="section === 'library'" :key="locationHash" :entry-hash="locationHash" :initial-kind="initialKind" :initial-category="initialCategory" />
            <ToolboxScenarios v-else :key="locationHash" :entry-hash="locationHash" :initial-skill="params.get('skill') || ''" />
        </main>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, shallowRef } from 'vue'
import { skillCategories } from '../skillCatalog'
import SkillLibrary from './SkillLibrary.vue'
import ToolboxScenarios from './ToolboxScenarios.vue'

const kinds = ['skill', 'agent', 'rule', 'plugin', 'mcp'] as const
const locationHash = shallowRef('')
const section = computed(() => locationHash.value.split('?')[0] === '#/scenarios' ? 'scenarios' : 'library')
const sectionTitle = computed(() => section.value === 'library' ? '能力目录' : '应用场景')
const params = computed(() => new URLSearchParams(locationHash.value.split('?')[1]))
const initialKind = computed(() => kinds.find(kind => kind === params.value.get('kind')) ?? 'all')
const initialCategory = computed(() => skillCategories.find(item => item.id === params.value.get('category'))?.id ?? '')

/** 同步当前章节。 */
function syncLocation(): void {
    locationHash.value = window.location.hash
}

/** 记录章节来源和滚动位置，保留浏览器的前进、后退及新标签页操作。 */
function followSectionLink(event: MouseEvent): void {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const link = event.target instanceof Element ? event.target.closest('a[href^="#/"]') : null
    const hash = link?.getAttribute('href')
    if (!link || !hash) return
    event.preventDefault()
    if (hash === locationHash.value || (!locationHash.value && hash === '#/library')) return

    window.history.replaceState({ ...window.history.state, scrollPosition: window.scrollY }, '')
    window.history.pushState({ toolboxPrevious: true }, '', hash)
    syncLocation()
    window.scrollTo({ top: 0, behavior: 'instant' })
}

onMounted(() => {
    syncLocation()
    window.addEventListener('popstate', syncLocation)
    window.addEventListener('hashchange', syncLocation)
})
onUnmounted(() => {
    window.removeEventListener('popstate', syncLocation)
    window.removeEventListener('hashchange', syncLocation)
})
</script>

<style scoped>
.toolbox-handbook {
    display: grid;
    grid-template-columns: 204px minmax(0, 1fr);
    min-height: calc(100svh - var(--vp-nav-height));
    & .toolbox-handbook__sidebar { border-right: 1px solid var(--blog-border); background: var(--blog-panel); }
    & nav { position: sticky; top: var(--vp-nav-height); display: grid; gap: 4px; padding: 24px 14px; }
    & nav a { padding: 8px 10px; border-radius: 6px; }
    & nav a:hover { background: var(--blog-hover-bg); }
    & nav a[aria-current] { color: var(--blog-selected-text); background: var(--blog-selected-bg); font-weight: 600; }
    & .toolbox-handbook__main { min-width: 0; padding: 24px clamp(16px, 2.2vw, 24px); }
    @media (max-width: 767px) {
        grid-template-columns: minmax(0, 1fr);
        align-content: start;
        & .toolbox-handbook__sidebar { border-right: 0; border-bottom: 1px solid var(--blog-border); }
        & nav { display: flex; flex-wrap: wrap; align-items: center; padding: 6px 12px; }
        & nav a { padding: 6px 10px; font-size: 14px; }
    }
}
</style>
