<template>
    <section class="article-graph" aria-label="全站文章脑图">
        <div class="article-graph__body">
            <div class="article-graph__canvas" :class="{ 'is-paused': motionPaused }">
                <svg ref="canvas" viewBox="-470 -470 940 940" aria-label="文章关系图，点击分类筛选，点击文章阅读" @wheel.prevent="onWheel" @pointerdown="startPan" @pointermove="movePan" @pointerup="endPan" @pointercancel="endPan" @lostpointercapture="endPan" @dblclick.self="resetViewport">
                    <g :transform="`translate(${pan.x} ${pan.y}) scale(${zoom})`">
                        <g aria-hidden="true">
                            <g v-for="(edge, index) in graph.edges" :key="edge.id">
                                <line :x1="edge.source.x" :y1="edge.source.y" :x2="edge.target.x" :y2="edge.target.y" :class="{ highlighted: hovered === edge.target.id || hovered === edge.source.id }" />
                                <line v-if="graph.articles.length <= 60 || edge.target.kind === 'category' || hovered === edge.target.id || hovered === edge.source.id" class="article-graph__flow" pathLength="100" :style="{ animationDelay: `${-(index % 7) * 0.4}s` }" :x1="edge.source.x" :y1="edge.source.y" :x2="edge.target.x" :y2="edge.target.y" />
                            </g>
                        </g>
                        <g v-if="graph.nodes.length" class="article-graph__core" aria-hidden="true">
                            <circle class="article-graph__orbit" r="36" />
                            <circle class="article-graph__orbit article-graph__orbit--outer" r="47" />
                            <circle class="article-graph__pulse" r="32" />
                            <circle class="article-graph__pulse article-graph__pulse--echo" r="32" />
                        </g>
                        <g v-for="node in graph.nodes" :key="node.id" :transform="`translate(${node.x} ${node.y})`" class="article-graph__node" :class="[node.kind, { hovered: hovered === node.id }]" @mouseenter="hovered = node.id" @mouseleave="hovered = ''" @focusin="hovered = node.id" @focusout="hovered = ''">
                            <g v-if="node.kind === 'article'">
                                <circle r="5" /><text v-if="showLabels || hovered === node.id" y="-16">{{ shortLabel(node.label) }}</text>
                                <!-- VitePress 预加载读取 HTMLAnchorElement.pathname，SVG 链接没有此属性。 -->
                                <foreignObject x="-14" y="-14" width="28" height="28"><a class="article-graph__hit" :href="withBase(node.url!)" :aria-label="node.label" :title="node.label"></a></foreignObject>
                            </g>
                            <g v-else-if="node.kind === 'category'" role="button" tabindex="0" :aria-label="`${node.label}，${node.count} 篇文章，点击筛选`" @click="category = node.category!" @keydown.enter.prevent="category = node.category!" @keydown.space.prevent="category = node.category!"><title>{{ node.label }} · {{ node.count }} 篇</title><circle class="article-graph__halo" r="20" aria-hidden="true" /><circle r="13" /><text y="-24">{{ node.label }}</text></g>
                            <g v-else aria-hidden="true"><circle r="25" /><text y="68">前端技术积累</text></g>
                        </g>
                    </g>
                </svg>
                <p v-if="!graph.articles.length" class="article-graph__empty">没有匹配的文章，试试其他关键词。</p>
                <div class="article-graph__legend" aria-hidden="true"><span>● 博客</span><span>● 分类</span><span>● 文章</span></div>
                <p class="article-graph__hint">拖动画布 · 滚轮缩放 · 点击节点探索</p>
            </div>
            <aside class="article-graph__results" aria-label="脑图中的文章">
                <div class="article-graph__toolbar">
                    <ElInput v-model="query" class="article-graph__search" type="search" aria-label="搜索文章、标签或分类" placeholder="搜索文章、标签或分类…" />
                    <ElSelect v-model="category" :empty-values="[null, undefined]" class="article-graph__category" aria-label="筛选技术分类"><ElOption value="" label="全部技术分类" /><ElOption v-for="item in graph.categories" :key="item.id" :value="item.id" :label="`${item.label} · ${item.count}`" /></ElSelect>
                    <div class="article-graph__controls"><ElButton native-type="button" aria-label="缩小脑图" :disabled="zoom <= 0.5" @click="changeZoom(1 / 1.25)">−</ElButton><ElButton native-type="button" aria-label="放大脑图" :disabled="zoom >= 4" @click="changeZoom(1.25)">＋</ElButton><ElButton native-type="button" @click="resetViewport">适应屏幕</ElButton><ElButton native-type="button" :aria-pressed="showLabels" @click="showLabels = !showLabels">{{ showLabels ? '隐藏标签' : '显示标签' }}</ElButton><ElButton native-type="button" :aria-pressed="motionPaused" @click="motionPaused = !motionPaused">{{ motionPaused ? '播放动画' : '暂停动画' }}</ElButton><ElButton v-if="query || category" native-type="button" @click="clearFilters">清除筛选</ElButton></div>
                </div>
                <p role="status" aria-live="polite">{{ category ? categoryLabels[category] || category : '全部分类' }} <strong>{{ graph.articles.length }}</strong> 篇文章</p>
                <ul><li v-for="post in graph.articles" :key="post.url"><a :href="withBase(post.url)" @mouseenter="hovered = `article:${post.url}`" @mouseleave="hovered = ''" @focus="hovered = `article:${post.url}`" @blur="hovered = ''">{{ post.title }}</a></li></ul>
            </aside>
        </div>
    </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElButton, ElInput, ElSelect, ElOption } from 'element-plus'
import { useData, withBase } from 'vitepress'
import { data as posts } from '../../posts.data'
import { createArticleGraph } from '../articleGraph'

const { theme } = useData()
const query = ref('')
const category = ref('')
const hovered = ref('')
const showLabels = ref(false)
const motionPaused = ref(false)
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

/** 长标题在图上保留短预览，完整标题由链接提示及文章列表提供。 */
function shortLabel(label: string): string {
    return label.length > 22 ? `${label.slice(0, 22)}…` : label
}

/** 恢复当前筛选结果的完整视图。 */
function resetViewport(): void {
    zoom.value = 1
    pan.value = { x: 0, y: 0 }
}

/** 清除搜索及分类，同时恢复视口。 */
function clearFilters(): void {
    query.value = ''
    category.value = ''
    resetViewport()
}

/** 将屏幕坐标转换成 SVG 坐标，兼容不同宽高比的留白。 */
function svgPoint(clientX: number, clientY: number): DOMPoint | null {
    const matrix = canvas.value?.getScreenCTM()
    return matrix ? new DOMPoint(clientX, clientY).matrixTransform(matrix.inverse()) : null
}

/** 围绕指定坐标缩放，按钮操作默认以画布中心为基准。 */
function changeZoom(factor: number, x = 0, y = 0): void {
    const next = Math.max(0.5, Math.min(4, zoom.value * factor))
    const ratio = next / zoom.value
    pan.value = { x: x - (x - pan.value.x) * ratio, y: y - (y - pan.value.y) * ratio }
    zoom.value = next
}

/** 滚轮围绕鼠标位置缩放，并限制单次缩放幅度。 */
function onWheel(event: WheelEvent): void {
    const point = svgPoint(event.clientX, event.clientY)
    if (point) changeZoom(event.deltaY > 0 ? 1 / 1.1 : 1.1, point.x, point.y)
}

/** 仅拖动背景，保留文章链接的点击及浏览器新标签行为。 */
function startPan(event: PointerEvent): void {
    if (event.button !== 0 || pointerId !== null || (event.target as Element).closest('.article-graph__node')) return
    const point = svgPoint(event.clientX, event.clientY)
    if (!point) return
    pointerId = event.pointerId
    lastPoint = point
    canvas.value?.setPointerCapture(event.pointerId)
}

/** 使用指针捕获，让鼠标和触屏在移出画布时仍能完成拖动。 */
function movePan(event: PointerEvent): void {
    if (pointerId !== event.pointerId) return
    const point = svgPoint(event.clientX, event.clientY)
    if (!point) return
    pan.value = { x: pan.value.x + point.x - lastPoint.x, y: pan.value.y + point.y - lastPoint.y }
    lastPoint = point
}

/** 释放当前拖动指针，取消触控也执行同样的收尾。 */
function endPan(event: PointerEvent): void {
    if (pointerId !== event.pointerId) return
    if (canvas.value?.hasPointerCapture(event.pointerId)) canvas.value.releasePointerCapture(event.pointerId)
    pointerId = null
}

watch([query, category], () => { hovered.value = ''; resetViewport() })
</script>

<style scoped>
.article-graph {
    display: flex; flex-direction: column; height: max(640px, calc(100dvh - var(--vp-nav-height) - var(--vp-layout-top-height, 0px))); padding: 20px var(--blog-page-gutter);
    & .article-graph__toolbar { display: flex; flex-direction: column; flex-shrink: 0; gap: 12px; padding: 16px; border-bottom: 1px solid var(--blog-border); }
    & .article-graph__search, & .article-graph__category { width: 100%; min-width: 0; }
    & .el-button { min-height: 40px; margin: 0; }
    & :deep(.el-input__wrapper), & :deep(.el-select__wrapper) { min-height: 40px; }
    & .article-graph__controls { display: flex; flex-wrap: wrap; gap: 8px; }
    & .article-graph__body { flex: 1; min-height: 0; display: grid; grid-template-columns: minmax(0, 1fr) clamp(340px, 29vw, 480px); border: 1px solid var(--blog-border); border-radius: var(--blog-radius); overflow: hidden; }
    & .article-graph__canvas { position: relative; min-height: 0; overflow: hidden; isolation: isolate; background: radial-gradient(ellipse at center, var(--vp-c-brand-soft), transparent 70%); }
    & .article-graph__canvas::before { content: ''; position: absolute; inset: 0; z-index: -1; pointer-events: none; opacity: .3; background-image: linear-gradient(var(--blog-border) 1px, transparent 1px), linear-gradient(90deg, var(--blog-border) 1px, transparent 1px); background-size: 40px 40px; mask-image: radial-gradient(ellipse, #000, transparent 75%); }
    & svg { display: block; width: 100%; height: 100%; touch-action: none; cursor: grab; }
    & svg:active { cursor: grabbing; }
    & line { stroke: var(--blog-border); stroke-width: 1; pointer-events: none; animation: graph-fade-in 600ms ease-out; transition: stroke 180ms ease, stroke-width 180ms ease; }
    & line.highlighted { stroke: var(--vp-c-brand-1); stroke-width: 2; }
    & line.article-graph__flow { stroke: var(--vp-c-brand-1); stroke-width: 2.5; stroke-linecap: round; stroke-dasharray: 4 96; animation: graph-data-flow 2.8s linear infinite; }
    & .article-graph__core { color: var(--vp-c-brand-1); pointer-events: none; }
    & .article-graph__orbit { fill: none; stroke: currentColor; stroke-width: 2; stroke-dasharray: 42 14 8 14; transform-origin: 0 0; animation: graph-orbit 12s linear infinite; }
    & .article-graph__orbit--outer { stroke: #567de8; stroke-width: 1.5; stroke-dasharray: 70 22 5 22; animation-direction: reverse; animation-duration: 18s; }
    & .article-graph__pulse { fill: none; stroke: currentColor; stroke-width: 2; transform-origin: 0 0; animation: graph-pulse 3.6s ease-out infinite; }
    & .article-graph__pulse--echo { stroke: #567de8; animation-delay: -1.8s; }
    & .article-graph__node { --node-delay: 0ms; cursor: pointer; animation: graph-fade-in 400ms ease-out var(--node-delay) backwards; }
    & .article-graph__node.category { --node-delay: 80ms; }
    & .article-graph__node.article { --node-delay: 160ms; }
    & .article-graph__node circle { fill: var(--vp-c-brand-1); stroke: var(--vp-c-bg); stroke-width: 2; transform-box: fill-box; transform-origin: center; animation: graph-node-in 400ms ease-out var(--node-delay) backwards; transition: transform 180ms ease, stroke 180ms ease, stroke-width 180ms ease; }
    & .article-graph__node.category circle { fill: #d58b21; }
    & .article-graph__node.root circle { fill: #567de8; filter: drop-shadow(0 0 10px #567de8); animation: graph-core-breathe 3.6s ease-in-out infinite; }
    & .article-graph__node.category circle.article-graph__halo { fill: none; stroke: #d58b21; stroke-width: 2; filter: drop-shadow(0 0 4px #d58b21); opacity: .5; pointer-events: none; animation: graph-breathe 3s ease-in-out infinite; }
    & .article-graph__node.hovered circle:not(.article-graph__halo) { filter: drop-shadow(0 0 6px var(--vp-c-brand-1)); }
    & .article-graph__node .article-graph__hit { display: block; width: 100%; height: 100%; border-radius: 50%; }
    & .article-graph__node text { fill: var(--vp-c-text-1); font-size: 13px; font-weight: 500; text-anchor: middle; paint-order: stroke; stroke: var(--vp-c-bg); stroke-width: 5px; stroke-linejoin: round; pointer-events: none; animation: graph-fade-in 180ms ease-out; transition: fill 180ms ease; }
    & .article-graph__node.root text { font-size: 16px; font-weight: 700; }
    & .article-graph__node.hovered text { fill: var(--vp-c-brand-1); font-weight: 700; }
    & .article-graph__node.hovered circle:not(.article-graph__hit):not(.article-graph__halo), & .article-graph__node :focus-visible circle:not(.article-graph__hit):not(.article-graph__halo) { stroke: var(--vp-c-text-1); stroke-width: 3; transform: scale(1.25); }
    & .article-graph__legend { position: absolute; left: 16px; top: 14px; display: flex; gap: 14px; font-size: 12px; pointer-events: none; }
    & .article-graph__legend span:first-child { color: #567de8; }
    & .article-graph__legend span:nth-child(2) { color: #d58b21; }
    & .article-graph__legend span:last-child { color: var(--vp-c-brand-1); }
    & .article-graph__hint { position: absolute; bottom: 10px; left: 16px; margin: 0; font-size: 12px; color: var(--vp-c-text-2); pointer-events: none; }
    & .article-graph__empty { position: absolute; top: 45%; width: 100%; text-align: center; color: var(--vp-c-text-2); }
    & .article-graph__results { display: flex; flex-direction: column; min-width: 0; min-height: 0; border-left: 1px solid var(--blog-border); background: var(--blog-panel); }
    & .article-graph__results > p { flex-shrink: 0; margin: 0; padding: 16px; border-bottom: 1px solid var(--blog-border); font-size: 13px; }
    & .article-graph__results strong { color: var(--vp-c-brand-1); }
    & .article-graph__results ul { flex: 1; min-height: 0; overflow: auto; margin: 0; padding: 8px; list-style: none; }
    & .article-graph__results li { margin: 0; border-bottom: 1px solid var(--blog-border); }
    & .article-graph__results a { display: block; border-radius: 6px; padding: 9px 8px; font-size: 14px; line-height: 1.65; color: var(--vp-c-text-2); text-decoration: none; }
    & .article-graph__results a:hover { color: var(--vp-c-brand-1); background: var(--vp-c-brand-soft); }
    @media (max-width: 767px) {
        height: auto;
        & .article-graph__body { flex: none; grid-template-columns: minmax(0, 1fr); }
        & .article-graph__canvas { height: 440px; }
        & .article-graph__results { border-left: 0; border-top: 1px solid var(--blog-border); }
        & .article-graph__results ul { flex: auto; max-height: 320px; }
    }
    & .article-graph__canvas.is-paused svg :is(.article-graph__flow, .article-graph__orbit, .article-graph__pulse, .article-graph__halo) { animation-play-state: paused; }
    & .article-graph__canvas.is-paused .article-graph__node.root circle { animation-play-state: paused; }
    @media (prefers-reduced-motion: reduce) {
        & .article-graph__canvas * { animation: none !important; transition: none !important; }
        & .article-graph__flow, & .article-graph__pulse { display: none; }
        & line, & .article-graph__node, & .article-graph__node circle, & .article-graph__node text { animation: none; transition: none; }
        & .article-graph__node.hovered circle:not(.article-graph__hit):not(.article-graph__halo), & .article-graph__node :focus-visible circle:not(.article-graph__hit):not(.article-graph__halo) { transform: none; }
    }
}

@keyframes graph-data-flow {
    to { stroke-dashoffset: -100; }
}
@keyframes graph-orbit {
    to { transform: rotate(360deg); }
}
@keyframes graph-pulse {
    from { transform: scale(1); opacity: .85; }
    to { transform: scale(2.8); opacity: 0; }
}
@keyframes graph-core-breathe {
    0%, 100% { transform: scale(.94); filter: drop-shadow(0 0 6px #567de8); }
    50% { transform: scale(1.1); filter: drop-shadow(0 0 18px #567de8); }
}
@keyframes graph-breathe {
    0%, 100% { transform: scale(.85); opacity: .25; }
    50% { transform: scale(1.4); opacity: .85; }
}
@keyframes graph-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes graph-node-in {
    from { transform: scale(.55); }
    to { transform: scale(1); }
}
</style>
