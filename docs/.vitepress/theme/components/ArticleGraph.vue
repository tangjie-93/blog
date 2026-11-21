<template>
    <section class="article-graph" aria-label="全站文章脑图">
        <header class="article-graph__header">
            <div class="article-graph__heading"><p>CONNECTED KNOWLEDGE</p><h1>让知识，连接成网络<span>知识图谱</span></h1></div>
            <div class="article-graph__filters">
                <ElInput v-model="query" class="article-graph__search" type="search" clearable aria-label="搜索文章、标签或分类" placeholder="搜索一个知识节点…" />
                <ElSelect v-model="category" :empty-values="[null, undefined]" class="article-graph__category" aria-label="筛选技术分类"><ElOption value="" label="全部技术分类" /><ElOption v-for="item in graph.categories" :key="item.id" :value="item.id" :label="`${item.label} · ${item.count}`" /></ElSelect>
                <button class="article-graph__list-toggle" type="button" :aria-expanded="listOpen" :aria-controls="listId" @click="listOpen = !listOpen"><svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M7 5h10M7 10h10M7 15h10M3 5h.1M3 10h.1M3 15h.1" /></svg>{{ listOpen ? '收起列表' : '文章列表' }}</button>
            </div>
        </header>
        <div class="article-graph__body" :class="{ 'has-list': listOpen }">
            <div class="article-graph__canvas" :class="{ 'is-paused': motionPaused, 'has-focus': !!hovered }">
                <div class="article-graph__canvas-top">
                    <div class="article-graph__legend" aria-label="节点图例"><span><i class="is-root" />知识中枢</span><span><i class="is-category" />技术分类</span><span><i class="is-article" />文章</span></div>
                    <p class="article-graph__count" role="status" aria-live="polite"><strong>{{ graph.articles.length }}</strong> 篇文章<span> / </span>{{ visibleCategories }} 个主题</p>
                </div>
                <svg ref="canvas" class="article-graph__network" viewBox="-640 -430 1280 860" role="group" aria-label="文章关系图，点击分类筛选，点击文章阅读" @wheel.prevent="onWheel" @pointerdown="startPan" @pointermove="movePan" @pointerup="endPan" @pointercancel="endPan" @lostpointercapture="endPan" @dblclick.self="resetViewport">
                    <g :transform="`translate(${pan.x} ${pan.y}) scale(${zoom})`">
                        <g class="article-graph__clusters" aria-hidden="true">
                            <ellipse v-for="node in categoryNodes" :key="node.id" :cx="node.x" :cy="node.y" :rx="clusterRadius(node)" :ry="clusterRadius(node) * .8" :class="{ 'is-related': isRelated(node) }" />
                        </g>
                        <g class="article-graph__edges" aria-hidden="true">
                            <g v-for="(edge, index) in graph.edges" :key="edge.id" :class="{ 'is-related': isEdgeRelated(edge) }">
                                <path :d="edgePath(edge)" :class="edge.target.kind === 'category' ? 'article-graph__trunk' : 'article-graph__branch'" />
                                <path v-if="edge.target.kind === 'category' || hovered === edge.target.id" :d="edgePath(edge)" class="article-graph__flow" pathLength="100" :style="{ animationDelay: `${-(index % 9) * .6}s` }" />
                            </g>
                        </g>
                        <g v-if="graph.nodes.length" class="article-graph__core" aria-hidden="true"><circle r="45" /><circle r="58" class="article-graph__orbit" /><circle r="70" class="article-graph__pulse" /></g>
                        <g v-for="node in graph.nodes" :key="node.id" :transform="`translate(${node.x} ${node.y})`" class="article-graph__node" :class="[node.kind, { hovered: hovered === node.id, 'is-related': isRelated(node) }]" @mouseenter="hovered = node.id" @mouseleave="hovered = ''" @focusin="hovered = node.id" @focusout="hovered = ''">
                            <g v-if="node.kind === 'article'">
                                <circle class="article-graph__dot" :r="hovered === node.id ? 6 : 4" />
                                <g v-if="articleLabel(node)" class="article-graph__article-label"><path v-if="articleLabel(node)!.x || articleLabel(node)!.y !== -32" :d="`M 0 0 L ${articleLabel(node)!.x} ${articleLabel(node)!.y + 23}`" /><g :transform="`translate(${articleLabel(node)!.x} ${articleLabel(node)!.y})`"><rect :x="-labelWidth(shortLabel(node.label)) / 2" :width="labelWidth(shortLabel(node.label))" height="23" rx="5" /><text y="15">{{ shortLabel(node.label) }}</text></g></g>
                                <!-- HTML 链接保留 VitePress 导航与浏览器新标签行为。 -->
                                <foreignObject x="-17" y="-17" width="34" height="34"><a class="article-graph__hit" :href="withBase(node.url!)" :aria-label="node.label" :title="node.label"></a></foreignObject>
                            </g>
                            <g v-else-if="node.kind === 'category'" class="article-graph__category-button" role="button" tabindex="0" :aria-label="`${node.label}，${node.count} 篇文章，点击筛选`" @click="category = node.category!" @keydown.enter.prevent="category = node.category!" @keydown.space.prevent="category = node.category!">
                                <title>{{ node.label }} · {{ node.count }} 篇</title><circle class="article-graph__target" r="25" /><circle class="article-graph__halo" r="19" /><circle class="article-graph__dot" r="10" /><rect :x="-labelWidth(node.label) / 2" y="-39" :width="labelWidth(node.label)" height="24" rx="6" /><text y="-23">{{ node.label }}</text><text class="article-graph__degree" y="34">{{ node.count }} 篇</text>
                            </g>
                            <g v-else aria-hidden="true"><circle class="article-graph__root-disc" r="30" /><path class="article-graph__root-icon" d="M-12 4 0-10 13 1 1 13-12 4M0-10 1 13M-12 4 13 1" /><circle class="article-graph__root-joint" cx="-12" cy="4" r="3" /><circle class="article-graph__root-joint" cy="-10" r="3" /><circle class="article-graph__root-joint" cx="13" cy="1" r="3" /><circle class="article-graph__root-joint" cx="1" cy="13" r="3" /><rect x="-62" y="77" width="124" height="25" rx="6" /><text y="94">前端技术积累</text><text class="article-graph__root-subtitle" y="112">KNOWLEDGE NETWORK</text></g>
                        </g>
                    </g>
                </svg>
                <div v-if="!graph.articles.length" class="article-graph__empty"><strong>暂时没有找到这个节点</strong><p>试试其他关键词，或回到全部主题。</p><button type="button" @click="clearFilters">重置筛选</button></div>
                <div class="article-graph__bottom">
                    <div class="article-graph__inspector" aria-live="polite"><span class="article-graph__inspector-mark" aria-hidden="true">{{ activeNode?.kind === 'article' ? '↗' : '⌘' }}</span><div><strong>{{ activeNode && activeNode.kind !== 'root' ? activeNode.label : '每一个节点，都是一条探索路径' }}</strong><p>{{ activeNode?.kind === 'article' ? `${categoryLabels[activeNode.category!] || activeNode.category} · 点击节点阅读完整文章` : activeNode?.kind === 'category' ? `${activeNode.count} 篇笔记 · 点击聚焦这个主题` : '按技术分类组织 · 连线表示归属，不代表模型推理或文章引用' }}</p></div></div>
                    <div class="article-graph__view-controls" aria-label="图谱视图控制"><button type="button" aria-label="缩小脑图" :disabled="zoom <= .5" @click="changeZoom(1 / 1.25)">−</button><span>{{ Math.round(zoom * 100) }}%</span><button type="button" aria-label="放大脑图" :disabled="zoom >= 4" @click="changeZoom(1.25)">＋</button><span class="article-graph__control-separator" /><button type="button" title="适应屏幕" aria-label="适应屏幕" @click="resetViewport">⤢</button><button type="button" :aria-pressed="motionPaused" :title="motionPaused ? '播放动画' : '暂停动画'" :aria-label="motionPaused ? '播放动画' : '暂停动画'" @click="motionPaused = !motionPaused">{{ motionPaused ? '▷' : 'Ⅱ' }}</button></div>
                </div>
                <div class="article-graph__utility"><span>拖动平移 · 滚轮缩放 · 悬停聚焦</span><button type="button" :aria-pressed="showLabels" @click="showLabels = !showLabels">{{ showLabels ? '隐藏文章标题' : '显示文章标题' }}</button><button v-if="query || category" type="button" @click="clearFilters">回到全部主题 ↗</button></div>
            </div>
            <aside v-show="listOpen" :id="listId" class="article-graph__results" aria-label="脑图中的文章">
                <header><div><p>EXPLORE NOTES</p><h2>{{ category ? categoryLabels[category] || category : '全部文章' }}</h2></div><button type="button" aria-label="关闭文章列表" @click="listOpen = false">×</button></header>
                <p class="article-graph__list-count">{{ graph.articles.length }} 篇笔记 · 可直接浏览和键盘导航</p>
                <ul><li v-for="post in graph.articles" :key="post.url"><a :href="withBase(post.url)" @mouseenter="hovered = `article:${post.url}`" @mouseleave="hovered = ''" @focus="hovered = `article:${post.url}`" @blur="hovered = ''"><span>{{ post.title }}</span><span aria-hidden="true">↗</span></a></li></ul>
            </aside>
        </div>
    </section>
</template>

<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import { ElInput, ElSelect, ElOption } from 'element-plus'
import { useData, withBase } from 'vitepress'
import type { ArticleGraphNode, ArticleGraphEdge } from '../../../../src/types/articleGraph'
import { data as posts } from '../../posts.data'
import { createArticleGraph } from '../articleGraph'

const { theme } = useData()
const query = ref('')
const category = ref('')
const hovered = ref('')
const showLabels = ref(false)
const motionPaused = ref(false)
const listOpen = ref(false)
const listId = `graph-list-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
const canvas = ref<SVGSVGElement | null>(null)
const zoom = ref(1)
const pan = ref({ x: 0, y: 0 })
let pointerId: number | null = null
let lastPoint = { x: 0, y: 0 }
const categoryLabels = computed<Record<string, string>>(() => Object.fromEntries(
    Object.entries(theme.value.sidebar || {}).map(([path, groups]) => [
        path.split('/')[2], Array.isArray(groups) ? String(groups[0]?.text || '').replace(/ 专题$/, '') : path.split('/')[2],
    ]),
))
const graph = computed(() => createArticleGraph(posts, categoryLabels.value, query.value, category.value))
const categoryNodes = computed(() => graph.value.nodes.filter(node => node.kind === 'category'))
const visibleCategories = computed(() => categoryNodes.value.length)
// 小范围探索直接显示标题；全站视图按需显示，避免几百个标签彼此覆盖。
const labelsVisible = computed(() => showLabels.value || graph.value.articles.length <= 20)
const activeNode = computed(() => graph.value.nodes.find(node => node.id === hovered.value))
// 为短列表的标题寻找无碰撞位置；全站强制显示时隐藏放不下的标签，悬停仍可读取。
const articleLabels = computed(() => {
    const result = new Map<string, { x: number; y: number }>()
    if (!labelsVisible.value) return result
    type Box = { left: number; right: number; top: number; bottom: number }
    const boxes: Box[] = [{ left: -76, right: 76, top: -75, bottom: 124 }, ...categoryNodes.value.map(node => ({ left: node.x - labelWidth(node.label) / 2 - 8, right: node.x + labelWidth(node.label) / 2 + 8, top: node.y - 44, bottom: node.y + 42 }))]
    for (const node of graph.value.nodes.filter(item => item.kind === 'article')) {
        const width = labelWidth(shortLabel(node.label))
        const candidates = [-32, 13, -64, 45, -96, 77, -128, 109].flatMap(y => [0, -width / 2 - 12, width / 2 + 12].map(x => ({ x, y })))
        for (const offset of candidates) {
            const centerX = Math.max(-610 + width / 2, Math.min(610 - width / 2, node.x + offset.x))
            const box = { left: centerX - width / 2 - 4, right: centerX + width / 2 + 4, top: node.y + offset.y - 4, bottom: node.y + offset.y + 27 }
            if (box.top < -390 || box.bottom > 365 || boxes.some(other => box.left < other.right && box.right > other.left && box.top < other.bottom && box.bottom > other.top)) continue
            result.set(node.id, { x: centerX - node.x, y: offset.y }); boxes.push(box); break
        }
    }
    return result
})
function articleLabel(node: ArticleGraphNode): { x: number; y: number } | undefined {
    return articleLabels.value.get(node.id) ?? (hovered.value === node.id ? { x: 0, y: -32 } : undefined)
}

/** 仅突出当前分支，保留根节点和父节点来提供空间上下文。 */
function isRelated(node: ArticleGraphNode): boolean {
    const active = activeNode.value
    if (!active || active.kind === 'root' || node.kind === 'root' || node.id === active.id) return true
    return active.kind === 'category' ? node.category === active.category : node.kind === 'category' && node.category === active.category
}
function isEdgeRelated(edge: ArticleGraphEdge): boolean {
    const active = activeNode.value
    if (!active || active.kind === 'root') return true
    return active.kind === 'category' ? edge.target.category === active.category : edge.target.id === active.id || edge.target.kind === 'category' && edge.target.category === active.category
}
/** 弯曲仅为视觉路由，连线仍严格表示真实的文章分类归属。 */
function edgePath(edge: ArticleGraphEdge): string {
    const { source: a, target: b } = edge
    const dx = b.x - a.x, dy = b.y - a.y
    const bend = (edge.target.kind === 'category' ? .16 : .10) * (b.y > a.y ? 1 : -1)
    return `M ${a.x} ${a.y} Q ${(a.x + b.x) / 2 - dy * bend} ${(a.y + b.y) / 2 + dx * bend} ${b.x} ${b.y}`
}
function clusterRadius(node: ArticleGraphNode): number { return Math.min(105, 42 + Math.sqrt(node.count || 1) * 8) }
function shortLabel(label: string): string { return label.length > 20 ? `${label.slice(0, 20)}…` : label }
function labelWidth(label: string): number { return Math.max(50, [...label].reduce((width, char) => width + (/[^\x00-\xff]/.test(char) ? 12 : 7), 20)) }
function resetViewport(): void { zoom.value = 1; pan.value = { x: 0, y: 0 } }
function clearFilters(): void { query.value = ''; category.value = ''; resetViewport() }
function svgPoint(clientX: number, clientY: number): DOMPoint | null {
    const matrix = canvas.value?.getScreenCTM()
    return matrix ? new DOMPoint(clientX, clientY).matrixTransform(matrix.inverse()) : null
}
function changeZoom(factor: number, x = 0, y = 0): void {
    const next = Math.max(.5, Math.min(4, zoom.value * factor))
    const ratio = next / zoom.value
    pan.value = { x: x - (x - pan.value.x) * ratio, y: y - (y - pan.value.y) * ratio }
    zoom.value = next
}
function onWheel(event: WheelEvent): void {
    const point = svgPoint(event.clientX, event.clientY)
    if (point) changeZoom(event.deltaY > 0 ? 1 / 1.1 : 1.1, point.x, point.y)
}
function startPan(event: PointerEvent): void {
    if (event.button !== 0 || pointerId !== null || (event.target as Element).closest('.article-graph__node')) return
    const point = svgPoint(event.clientX, event.clientY)
    if (!point) return
    pointerId = event.pointerId; lastPoint = point
    canvas.value?.setPointerCapture(event.pointerId)
}
function movePan(event: PointerEvent): void {
    if (pointerId !== event.pointerId) return
    const point = svgPoint(event.clientX, event.clientY)
    if (!point) return
    pan.value = { x: pan.value.x + point.x - lastPoint.x, y: pan.value.y + point.y - lastPoint.y }
    lastPoint = point
}
function endPan(event: PointerEvent): void {
    if (pointerId !== event.pointerId) return
    if (canvas.value?.hasPointerCapture(event.pointerId)) canvas.value.releasePointerCapture(event.pointerId)
    pointerId = null
}
watch([query, category], () => { hovered.value = ''; resetViewport() })
</script>

<style scoped>
.article-graph {
    --graph-root: #2a78d6; --graph-category: #eb6834; --graph-article: #1baf7a;
    display: flex; flex-direction: column; height: max(720px, calc(100dvh - var(--vp-nav-height) - var(--vp-layout-top-height, 0px))); padding: 24px var(--blog-page-gutter) 20px; gap: 20px;
}
:global(.dark) .article-graph { --graph-root: #3987e5; --graph-category: #d95926; --graph-article: #199e70; }
.article-graph__header { display: flex; align-items: center; justify-content: space-between; gap: 20px; }
.article-graph__heading p { margin: 0 0 6px; font: 10px/1.5 var(--vp-font-family-mono); letter-spacing: 2px; color: var(--vp-c-text-2); }
.article-graph__heading h1 { display: flex; align-items: center; gap: 14px; margin: 0; font-size: 23px; font-weight: 600; letter-spacing: -.5px; line-height: 1.5; }
.article-graph__heading h1 span { border: 1px solid var(--blog-border); border-radius: 4px; padding: 1px 6px; font-size: 10px; font-weight: 400; color: var(--vp-c-text-2); letter-spacing: .5px; }
.article-graph__filters { display: flex; gap: 10px; align-items: center; }
.article-graph__search { width: clamp(300px, 28vw, 420px); }
.article-graph__category { width: 175px; }
.article-graph :deep(.el-input__wrapper), .article-graph :deep(.el-select__wrapper) { min-height: 38px; background: var(--blog-panel); }
.article-graph button { cursor: pointer; color: var(--vp-c-text-1); }
.article-graph button:focus-visible { outline: 2px solid var(--vp-c-text-1); outline-offset: 3px; }
.article-graph__list-toggle { display: flex; align-items: center; justify-content: center; gap: 7px; min-height: 38px; padding: 0 12px; border: 1px solid var(--blog-border); border-radius: 6px; font-size: 12px; background: var(--blog-panel); white-space: nowrap; }
.article-graph__list-toggle svg { fill: none; stroke: currentColor; stroke-width: 1.5; stroke-linecap: round; }
.article-graph__body { display: grid; grid-template-columns: minmax(0, 1fr); flex: 1; min-height: 0; border: 1px solid var(--blog-border); border-radius: 14px; overflow: hidden; background: var(--vp-c-bg); }
.article-graph__body.has-list { grid-template-columns: minmax(0, 1fr) 310px; }
.article-graph__canvas { position: relative; min-width: 0; min-height: 0; isolation: isolate; background: radial-gradient(ellipse at 50% 46%, var(--vp-c-brand-soft), transparent 65%); overflow: hidden; }
.article-graph__canvas::before { content: ''; position: absolute; inset: 0; z-index: -1; pointer-events: none; opacity: .35; background-image: radial-gradient(var(--blog-muted) .6px, transparent .6px); background-size: 24px 24px; mask-image: radial-gradient(ellipse, #000, transparent 75%); }
.article-graph__canvas-top { position: absolute; z-index: 1; top: 20px; left: 22px; right: 22px; display: flex; align-items: center; justify-content: space-between; gap: 12px; pointer-events: none; }
.article-graph__legend { display: flex; gap: 18px; font-size: 11px; color: var(--vp-c-text-2); }
.article-graph__legend span { display: flex; align-items: center; gap: 7px; }
.article-graph__legend i { display: block; width: 7px; height: 7px; border-radius: 50%; background: var(--graph-article); }
.article-graph__legend .is-root { background: var(--graph-root); width: 10px; height: 10px; }
.article-graph__legend .is-category { background: var(--graph-category); width: 9px; height: 9px; border-radius: 2px; }
.article-graph__count { margin: 0; font: 11px/1.5 var(--vp-font-family-base); color: var(--vp-c-text-2); }
.article-graph__count strong { color: var(--vp-c-text-1); font: 15px/1 var(--vp-font-family-mono); }
.article-graph__count span { padding: 0 7px; color: var(--blog-muted); }
.article-graph__network { display: block; width: 100%; height: 100%; touch-action: none; cursor: grab; }
.article-graph__network:active { cursor: grabbing; }
.article-graph__clusters ellipse { fill: var(--graph-article); opacity: .035; transition: opacity .25s; pointer-events: none; }
.article-graph__edges path { fill: none; stroke: var(--blog-muted); stroke-width: .7; opacity: .27; pointer-events: none; transition: opacity .2s, stroke .2s; }
.article-graph__edges .article-graph__trunk { stroke-width: 1; opacity: .38; }
.article-graph__edges .article-graph__flow { stroke: var(--graph-article); stroke-width: 1.6; stroke-linecap: round; stroke-dasharray: 1.5 98.5; opacity: .7; animation: graph-signal 5s linear infinite; }
.article-graph__core { pointer-events: none; }
.article-graph__core circle { fill: none; stroke: var(--graph-root); stroke-width: .7; opacity: .4; }
.article-graph__core .article-graph__orbit { stroke-dasharray: 3 8; transform-origin: 0 0; animation: graph-orbit 70s linear infinite; opacity: .3; }
.article-graph__core .article-graph__pulse { animation: graph-pulse 5s ease-out infinite; }
.article-graph__node { cursor: pointer; transition: opacity .2s; }
.article-graph__dot { fill: var(--graph-article); stroke: var(--vp-c-bg); stroke-width: 1.5; transition: r .2s; }
.article-graph__node.category .article-graph__dot { fill: var(--graph-category); stroke-width: 2; }
.article-graph__halo { fill: none; stroke: var(--graph-category); stroke-width: 1; opacity: .28; }
.article-graph__target { fill: transparent; stroke: none; }
.article-graph__node rect { fill: var(--vp-c-bg); opacity: .92; pointer-events: none; }
.article-graph__node text { fill: var(--vp-c-text-1); font-size: 12px; font-weight: 550; text-anchor: middle; pointer-events: none; }
.article-graph__node .article-graph__degree { fill: var(--vp-c-text-2); font-size: 9px; font-weight: 400; }
.article-graph__root-disc { fill: var(--graph-root); stroke: var(--vp-c-bg); stroke-width: 3; filter: drop-shadow(0 0 14px color-mix(in srgb, var(--graph-root), transparent 65%)); }
.article-graph__root-icon { fill: none; stroke: var(--vp-c-bg); stroke-width: 1.2; }
.article-graph__root-joint { fill: var(--vp-c-bg); }
.article-graph__node.root text { font-size: 13px; font-weight: 600; }
.article-graph__node.root .article-graph__root-subtitle { font: 7px var(--vp-font-family-mono); letter-spacing: 1.5px; fill: var(--vp-c-text-2); }
.article-graph__hit { display: block; width: 100%; height: 100%; border-radius: 50%; }
.article-graph__article-label rect { stroke: var(--blog-border); stroke-width: .7; }
.article-graph__article-label path { fill: none; stroke: var(--blog-muted); stroke-width: .7; opacity: .6; pointer-events: none; }
.article-graph__article-label text { font-size: 11px; }
.article-graph__canvas.has-focus .article-graph__node:not(.is-related) { opacity: .16; }
.article-graph__canvas.has-focus .article-graph__edges > g:not(.is-related) { opacity: .13; }
.article-graph__canvas.has-focus .article-graph__edges > .is-related path { stroke: var(--graph-article); opacity: .8; stroke-width: 1.2; }
.article-graph__canvas.has-focus .article-graph__clusters ellipse:not(.is-related) { opacity: .01; }
.article-graph__node.hovered .article-graph__dot, .article-graph__category-button:focus-visible .article-graph__dot { stroke: var(--vp-c-text-1); stroke-width: 2; }
.article-graph__node.hovered .article-graph__halo { opacity: .9; }
.article-graph__bottom { position: absolute; bottom: 45px; left: 22px; right: 22px; display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; pointer-events: none; }
.article-graph__inspector { display: flex; gap: 12px; align-items: center; max-width: 520px; min-width: 0; padding: 10px 14px; background: var(--blog-panel); border: 1px solid var(--blog-border); border-radius: 9px; box-shadow: 0 3px 16px #00000005; }
.article-graph__inspector-mark { font: 22px/1 var(--vp-font-family-mono); color: var(--vp-c-text-2); }
.article-graph__inspector > div { min-width: 0; }
.article-graph__inspector strong { display: block; font-size: 12px; font-weight: 550; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.article-graph__inspector p { margin: 3px 0 0; font-size: 10px; color: var(--vp-c-text-2); line-height: 1.6; }
.article-graph__view-controls { display: flex; align-items: center; flex-shrink: 0; pointer-events: auto; padding: 4px; border: 1px solid var(--blog-border); border-radius: 8px; background: var(--blog-panel); }
.article-graph__view-controls button { width: 34px; height: 34px; border-radius: 4px; font-size: 19px; }
.article-graph__view-controls button:hover, .article-graph__view-controls button[aria-pressed='true'] { background: var(--vp-c-bg-soft); }
.article-graph__view-controls button:disabled { opacity: .3; cursor: default; }
.article-graph__view-controls > span:not(.article-graph__control-separator) { width: 40px; text-align: center; color: var(--vp-c-text-2); font: 10px var(--vp-font-family-mono); }
.article-graph__control-separator { width: 1px; height: 16px; margin: 0 4px; background: var(--blog-border); }
.article-graph__utility { position: absolute; bottom: 14px; left: 22px; right: 22px; display: flex; align-items: center; gap: 16px; color: var(--vp-c-text-2); font-size: 10px; }
.article-graph__utility button { font-size: 10px; color: var(--vp-c-text-2); text-decoration: underline; text-underline-offset: 3px; }
.article-graph__utility button:last-child { margin-left: auto; }
.article-graph__empty { position: absolute; inset: 30% 10% auto; text-align: center; font-size: 14px; }
.article-graph__empty p { color: var(--vp-c-text-2); font-size: 12px; }
.article-graph__empty button { border: 1px solid var(--blog-border); border-radius: 6px; padding: 6px 15px; font-size: 12px; }
.article-graph__results { display: flex; flex-direction: column; min-width: 0; min-height: 0; border-left: 1px solid var(--blog-border); background: var(--blog-panel); }
.article-graph__results > header { display: flex; justify-content: space-between; align-items: center; padding: 22px 18px 12px; }
.article-graph__results header p { margin: 0 0 6px; font: 9px var(--vp-font-family-mono); letter-spacing: 1.5px; color: var(--vp-c-text-2); }
.article-graph__results h2 { margin: 0; font-size: 17px; font-weight: 550; }
.article-graph__results header button { width: 32px; height: 32px; font-size: 23px; color: var(--vp-c-text-2); }
.article-graph__list-count { margin: 0; padding: 0 18px 14px; color: var(--vp-c-text-2); font-size: 11px; border-bottom: 1px solid var(--blog-border); }
.article-graph__results ul { flex: 1; min-height: 0; overflow: auto; list-style: none; margin: 0; padding: 8px; }
.article-graph__results li { margin: 0; border-bottom: 1px solid var(--blog-border); }
.article-graph__results a { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 11px 10px; border-radius: 6px; font-size: 12px; line-height: 1.7; text-decoration: none; color: var(--vp-c-text-2); }
.article-graph__results a:hover { background: var(--vp-c-bg-soft); color: var(--vp-c-text-1); }
.article-graph__results a > span:last-child { flex-shrink: 0; }
.is-paused :is(.article-graph__flow, .article-graph__orbit, .article-graph__pulse) { animation-play-state: paused; }
@media (max-width: 1100px) { .article-graph__heading h1 span { display: none; } .article-graph__heading h1 { font-size: 20px; } .article-graph__search { width: 230px; } .article-graph__category { width: 150px; } .article-graph__body.has-list { grid-template-columns: minmax(0, 1fr) 270px; } .article-graph__body.has-list .article-graph__inspector { display: none; } }
@media (max-width: 767px) {
    .article-graph { height: auto; min-height: calc(100dvh - var(--vp-nav-height)); padding-top: 18px; gap: 16px; }
    .article-graph__header { flex-direction: column; align-items: stretch; gap: 14px; }
    .article-graph__heading h1 { font-size: 21px; }
    .article-graph__filters { flex-wrap: wrap; gap: 8px; }
    .article-graph__search { width: 100%; }
    .article-graph__category { flex: 1; min-width: 0; }
    .article-graph__body, .article-graph__body.has-list { flex: none; grid-template-columns: minmax(0, 1fr); }
    .article-graph__canvas { height: 540px; }
    .article-graph__canvas-top { top: 16px; left: 14px; right: 14px; align-items: flex-start; }
    .article-graph__legend { gap: 10px; font-size: 9px; }
    .article-graph__legend span { gap: 4px; }
    .article-graph__count { font-size: 9px; text-align: right; }
    .article-graph__count strong { font-size: 12px; }
    .article-graph__count span { padding: 0 3px; }
    .article-graph__bottom { left: 14px; right: 14px; bottom: 51px; flex-direction: column; gap: 12px; align-items: stretch; }
    .article-graph__inspector { max-width: 100%; padding: 9px 10px; }
    .article-graph__inspector p { font-size: 9px; }
    .article-graph__view-controls { align-self: flex-end; }
    .article-graph__body.has-list .article-graph__inspector { display: flex; }
    .article-graph__utility { left: 14px; right: 14px; bottom: 13px; gap: 8px; flex-wrap: wrap; font-size: 9px; }
    .article-graph__utility button { font-size: 9px; }
    .article-graph__results { border-left: 0; border-top: 1px solid var(--blog-border); }
    .article-graph__results ul { flex: auto; max-height: 360px; }
}
@media (prefers-reduced-motion: reduce) { .article-graph *, .article-graph *::before { animation: none !important; transition: none !important; } .article-graph__flow, .article-graph__pulse { display: none; } }
@media (forced-colors: active) { .article-graph__dot, .article-graph__root-disc, .article-graph__root-joint { fill: CanvasText; stroke: Canvas; } .article-graph__node text { fill: CanvasText; } .article-graph__edges path, .article-graph__halo, .article-graph__root-icon { stroke: CanvasText; } .article-graph__clusters, .article-graph__flow { display: none; } .article-graph__node rect { fill: Canvas; } }
@keyframes graph-signal { to { stroke-dashoffset: -100; } }
@keyframes graph-orbit { to { transform: rotate(360deg); } }
@keyframes graph-pulse { from { transform: scale(.65); opacity: .3; } to { transform: scale(1.2); opacity: 0; } }
</style>
