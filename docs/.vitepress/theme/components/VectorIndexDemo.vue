<script setup lang="ts">
import { computed, ref, useId } from 'vue'

const id = `vector-index-${useId().replace(/[^a-zA-Z0-9_-]/g, '-')}`
const mode = ref('graph')
const modes = [
    { key: 'scan', label: '全量扫描', note: '逐个比较全部向量，取距离最近的。' },
    { key: 'graph', label: 'HNSW：沿图找', note: '从入口沿邻居连接逐步接近目标；这里只画一层示意。' },
    { key: 'buckets', label: 'IVF：分区找', note: '先选靠近问题的分区，再比较区内向量；示例只搜一个分区。' },
]
const note = computed(() => modes.find(item => item.key === mode.value)!.note)
const points = [
    { x: 55, y: 55 }, { x: 95, y: 95 }, { x: 55, y: 153 }, { x: 130, y: 145 },
    { x: 205, y: 65 }, { x: 255, y: 55 }, { x: 225, y: 120 }, { x: 280, y: 145 },
    { x: 355, y: 65 }, { x: 410, y: 60 }, { x: 370, y: 120 }, { x: 425, y: 150 },
]
const edges = [[0, 1], [1, 3], [3, 6], [6, 8], [8, 10], [10, 11], [0, 2], [4, 5], [5, 6], [6, 7], [8, 9]]
const route = [0, 1, 3, 6, 8, 10]
const visited = computed(() => mode.value === 'scan' ? points.map((_, i) => i) : mode.value === 'graph' ? route : [8, 9, 10, 11])
</script>

<template>
    <figure class="index-demo" aria-label="比较全量扫描、HNSW 和 IVF 的查找路线">
        <div class="index-demo__controls" role="group" aria-label="选择查找方法"><button v-for="item in modes" :key="item.key" type="button" :aria-pressed="mode === item.key" @click="mode = item.key">{{ item.label }}</button></div>
        <svg viewBox="0 0 480 210" role="img" :aria-labelledby="`${id}-title ${id}-desc`">
            <title :id="`${id}-title`">{{ modes.find(item => item.key === mode)?.label }}的概念示意</title>
            <desc :id="`${id}-desc`">圆点代表已存文档向量，菱形代表查询，实心圆是示意中参与比较的向量。{{ note }}这是人为路线，不是实际算法运行结果。</desc>
            <g v-if="mode === 'buckets'" class="index-demo__buckets"><rect v-for="(x, i) in [20, 180, 335]" :key="x" :x="x" y="20" width="125" height="160" rx="8" :class="{ 'is-chosen': i === 2 }" /></g>
            <g v-if="mode === 'graph'" class="index-demo__edges"><line v-for="edge in edges" :key="edge.join('-')" :x1="points[edge[0]].x" :y1="points[edge[0]].y" :x2="points[edge[1]].x" :y2="points[edge[1]].y" /><polyline :points="route.map(i => `${points[i].x},${points[i].y}`).join(' ')" /></g>
            <g v-for="(point, i) in points" :key="i"><circle :cx="point.x" :cy="point.y" r="7" :class="{ 'is-visited': visited.includes(i) }" /></g>
            <path class="index-demo__query" d="M393 92 l8 8 -8 8 -8 -8 Z" />
            <text x="407" y="104">问题</text><text v-if="mode === 'graph'" x="26" y="40">入口</text>
        </svg>
        <div class="index-demo__legend"><span>○ 文档向量</span><span>● 参与比较</span><span>◆ 问题向量</span></div>
        <figcaption aria-live="polite">{{ note }}图仅示意：近似搜索可能漏掉真正的最近邻；向量最近也不等于一定含答案。</figcaption>
    </figure>
</template>

<style scoped>
.index-demo { --ix-fill: #2a78d6; --ix-surface: #fcfcfb; --ix-ink: #0b0b0b; --ix-muted: #52514e; --ix-line: #e1e0d9; max-width: 560px; margin: 16px auto; padding: 14px; background: var(--ix-surface); color: var(--ix-ink); border: 1px solid var(--ix-line); border-radius: 10px; }
.dark .index-demo { --ix-fill: #3987e5; --ix-surface: #1a1a19; --ix-ink: #f0efec; --ix-muted: #c3c2b7; --ix-line: #383835; }
.index-demo__controls { display: flex; flex-wrap: wrap; gap: 6px; }
.index-demo button { padding: 5px 9px; min-height: 32px; background: transparent; color: var(--ix-ink); border: 1px solid var(--ix-line); border-radius: 6px; font-size: 12px; cursor: pointer; }
.index-demo button[aria-pressed="true"] { border: 2px solid var(--ix-fill); padding: 4px 8px; font-weight: 700; }
.index-demo button:focus-visible { outline: 2px solid var(--ix-fill); outline-offset: 3px; }
.index-demo svg { width: 100%; height: auto; display: block; max-width: 460px; margin: 8px auto; }
.index-demo circle { fill: var(--ix-surface); stroke: var(--ix-muted); stroke-width: 1.5; }
.index-demo circle.is-visited { fill: var(--ix-fill); stroke: var(--ix-surface); stroke-width: 2; }
.index-demo__query { fill: var(--ix-ink); stroke: var(--ix-surface); stroke-width: 2; }
.index-demo svg text { fill: var(--ix-ink); font-size: 13px; }
.index-demo__edges line { stroke: var(--ix-line); stroke-width: 1; }
.index-demo__edges polyline { fill: none; stroke: var(--ix-fill); stroke-width: 2; }
.index-demo__buckets rect { fill: none; stroke: var(--ix-line); }
.index-demo__buckets rect.is-chosen { stroke: var(--ix-fill); stroke-width: 2; }
.index-demo__legend { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; font-size: 11px; color: var(--ix-muted); }
.index-demo figcaption { margin-top: 8px; font-size: 12px; line-height: 1.7; color: var(--ix-muted); }
@media (forced-colors: active) { .index-demo { --ix-fill: Highlight; --ix-surface: Canvas; --ix-ink: CanvasText; --ix-muted: CanvasText; --ix-line: CanvasText; } }
</style>
