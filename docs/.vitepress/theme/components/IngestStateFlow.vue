<script setup lang="ts">
import { useId } from 'vue'

const markerId = `state-arrow-${useId().replace(/[^a-zA-Z0-9_-]/g, '-')}`
type Node = { id: string; x: number; y: number; w: number; h: number; terminal?: boolean; label: string }
type Edge = { from: string; to: string; path: string; label?: string; x?: number; y?: number }

const title = '文档摄取状态机：从 pending 到 deleted'
const description = 'pending 进入 processing，依次经过 indexing、finalizing 到达 completed。processing、indexing、finalizing 任一阶段失败进入 failed；processing 和 indexing 还可以取消进入 cancelled。completed 或 failed 都进入 deleting，清理完成后到达 deleted。'
const note = 'pending 是入口，cancelled 与 deleted 是终态。状态名是示意图，不是某个框架的固定枚举；enabled、index_version、attempt 等等正交字段不在图中。图中不画重试：failed 由任务系统重新排队，不会自己回到 pending。'

const nodes: Node[] = [
    { id: 'pending', x: 350, y: 20, w: 200, h: 56, terminal: true, label: 'pending' },
    { id: 'processing', x: 350, y: 116, w: 200, h: 56, label: 'processing' },
    { id: 'indexing', x: 350, y: 212, w: 200, h: 56, label: 'indexing' },
    { id: 'finalizing', x: 350, y: 308, w: 200, h: 56, label: 'finalizing' },
    { id: 'completed', x: 350, y: 404, w: 200, h: 56, label: 'completed' },
    { id: 'cancelled', x: 60, y: 212, w: 180, h: 56, terminal: true, label: 'cancelled' },
    { id: 'failed', x: 660, y: 212, w: 180, h: 56, label: 'failed' },
    { id: 'deleting', x: 350, y: 520, w: 200, h: 56, label: 'deleting' },
    { id: 'deleted', x: 350, y: 616, w: 200, h: 56, terminal: true, label: 'deleted' },
]

const edges: Edge[] = [
    { from: 'pending', to: 'processing', path: 'M450 76 V116' },
    { from: 'processing', to: 'indexing', path: 'M450 172 V212' },
    { from: 'indexing', to: 'finalizing', path: 'M450 268 V308' },
    { from: 'finalizing', to: 'completed', path: 'M450 364 V404' },
    { from: 'processing', to: 'failed', path: 'M550 144 H610 V220 H660', label: '失败', x: 580, y: 132 },
    { from: 'indexing', to: 'failed', path: 'M550 240 H660' },
    { from: 'finalizing', to: 'failed', path: 'M550 336 H620 V260 H660' },
    { from: 'processing', to: 'cancelled', path: 'M350 144 H290 V218 H240', label: '取消', x: 320, y: 132 },
    { from: 'indexing', to: 'cancelled', path: 'M350 240 H240' },
    { from: 'completed', to: 'deleting', path: 'M450 460 V520' },
    { from: 'failed', to: 'deleting', path: 'M750 268 V548 H550' },
    { from: 'deleting', to: 'deleted', path: 'M450 576 V616' },
]
</script>

<template>
    <figure class="state-flow" :aria-label="title">
        <header class="state-flow__heading"><strong>{{ title }}</strong><span>圆角为入口或终态 · 沿箭头阅读</span></header>
        <div class="state-flow__canvas" tabindex="0" role="region" :aria-label="`${title}，窄屏可左右滚动查看`">
            <svg viewBox="0 0 900 700" role="img" :aria-label="title">
                <title>{{ title }}</title>
                <desc>{{ description }}</desc>
                <defs><marker :id="markerId" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M1 1 L9 5 L1 9 Z" class="state-flow__arrowhead" /></marker></defs>
                <g v-for="edge in edges" :key="`${edge.from}-${edge.to}`" class="state-flow__edge" :data-from="edge.from" :data-to="edge.to">
                    <path :d="edge.path" :marker-end="`url(#${markerId})`" />
                    <text v-if="edge.label" :x="edge.x" :y="edge.y">{{ edge.label }}</text>
                </g>
                <g v-for="node in nodes" :key="node.id" :data-node="node.id" class="state-flow__node">
                    <title>{{ node.label }}</title>
                    <rect :x="node.x" :y="node.y" :width="node.w" :height="node.h" :rx="node.terminal ? 24 : 5" />
                    <text :x="node.x + node.w / 2" :y="node.y + node.h / 2 + 7">{{ node.label }}</text>
                </g>
            </svg>
        </div>
        <figcaption>{{ note }}</figcaption>
        <details class="state-flow__text"><summary>文字版状态变化（方便复制与辅助阅读）</summary><p>{{ description }}</p></details>
    </figure>
</template>

<style scoped>
.state-flow { margin: 20px 0; padding: 16px; border: 1px solid var(--blog-border); border-radius: 10px; background: var(--blog-panel); color: var(--vp-c-text-1); }
.state-flow__heading { display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px 16px; font-size: 14px; }
.state-flow__heading span { font-size: 12px; color: var(--vp-c-text-2); }
.state-flow__canvas { overflow-x: auto; margin-top: 12px; border-radius: 6px; }
.state-flow__canvas:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 2px; }
.state-flow svg { display: block; width: 100%; min-width: 650px; max-width: 800px; height: auto; margin-inline: auto; }
.state-flow__edge > path { fill: none; stroke: var(--vp-c-text-2); stroke-width: 2; stroke-linejoin: round; }
.state-flow__arrowhead { fill: var(--vp-c-text-2); }
.state-flow__edge text { font-size: 15px; font-weight: 600; fill: var(--vp-c-text-2); stroke: var(--blog-panel); stroke-width: 5px; paint-order: stroke; text-anchor: middle; }
.state-flow__node rect { fill: var(--blog-panel); stroke: var(--vp-c-text-2); stroke-width: 1.5; }
.state-flow__node text { text-anchor: middle; fill: var(--vp-c-text-1); font-size: 19px; font-weight: 600; }
.state-flow figcaption, .state-flow__text { margin-top: 12px; color: var(--vp-c-text-2); font-size: 12px; line-height: 1.7; }
.state-flow__text summary { cursor: pointer; }
.state-flow .state-flow__text p { margin: 8px 0 0; font-size: 13px; }
@media (forced-colors: active) {
    .state-flow__node rect { fill: Canvas; stroke: CanvasText; }
    .state-flow__edge > path { stroke: CanvasText; }
    .state-flow__arrowhead, .state-flow__node text, .state-flow__edge text { fill: CanvasText; }
    .state-flow__edge text { stroke: Canvas; }
}
</style>
