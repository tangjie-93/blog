<script setup lang="ts">
import { ref, useId } from 'vue'

const id = `embedding-${useId().replace(/[^a-zA-Z0-9_-]/g, '-')}`
const dimensions = [384, 768, 1536]
const selectedDimension = ref(768)
const blockCount = ref(1_000_000)
const activeBar = ref<number | null>(null)
const storage = (dimension: number) => blockCount.value * dimension * 4
const formatSize = (bytes: number) => bytes >= 1_000_000_000
    ? `${(bytes / 1_000_000_000).toFixed(2)} GB`
    : `${(bytes / 1_000_000).toFixed(2)} MB`
</script>

<template>
    <div class="embedding-viz">
        <figure class="ev-panel" aria-label="维度就是向量里的数字个数">
            <header><span>01</span><strong>几个数字，就是几维</strong></header>
            <div class="ev-encoding"><span>“忘记密码”</span><span aria-hidden="true">→</span><span class="ev-model">嵌入模型</span><span aria-hidden="true">→</span><code>[0.12, −0.35, …]</code></div>
            <div class="ev-controls" role="group" aria-label="选择示例输出维度">
                <button v-for="dimension in dimensions" :key="dimension" type="button" :aria-pressed="selectedDimension === dimension" @click="selectedDimension = dimension">{{ dimension }} 维</button>
                <span aria-live="polite">= {{ selectedDimension }} 个数字</span>
            </div>
            <div class="ev-cells" aria-hidden="true"><span v-for="cell in 16" :key="cell" :class="{ 'is-filled': cell <= selectedDimension / 96 }"></span></div>
            <figcaption>一格代表 96 个数字。文字更长，不代表维度更多。</figcaption>
        </figure>

        <figure class="ev-panel" aria-label="用二维方向理解语义相似度">
            <header><span>02</span><strong>这些数字，用来比较“意思像不像”</strong></header>
            <svg viewBox="0 0 400 180" role="img" :aria-labelledby="`${id}-title ${id}-desc`">
                <title :id="`${id}-title`">相关文本方向接近的二维示意</title>
                <desc :id="`${id}-desc`">查询“忘记密码”和文档“重置密码”的夹角较小，文档“明天天气”方向较远。人为示意，不是真实模型输出。真实语义由多个坐标共同表达。</desc>
                <defs><marker :id="`${id}-arrow`" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M1 1 L9 5 L1 9 Z" fill="context-stroke" /></marker></defs>
                <path class="ev-axis" d="M35 150 H370 M45 160 V15" />
                <path class="ev-ray" d="M45 150 L265 40" :marker-end="`url(#${id}-arrow)`" />
                <path class="ev-ray ev-document" d="M45 150 L300 95" :marker-end="`url(#${id}-arrow)`" />
                <path class="ev-ray ev-unrelated" d="M45 150 L95 30" :marker-end="`url(#${id}-arrow)`" />
                <circle class="ev-point" cx="265" cy="40" r="5" />
                <path class="ev-point" d="M300 89 l6 6 -6 6 -6 -6 Z" />
                <rect class="ev-point ev-unrelated-point" x="90" y="25" width="10" height="10" />
                <text x="270" y="30">忘记密码</text><text x="300" y="118">重置密码</text><text x="106" y="27">明天天气</text>
                <text class="ev-muted" x="20" y="176">原点</text>
            </svg>
            <div class="ev-legend" aria-label="图例"><span>● 查询</span><span>◆ 相关文档</span><span>■ 无关文档</span></div>
            <figcaption>夹角越小，方向越近（余弦）。此图仅为示意，高维也能这样计算。</figcaption>
        </figure>

        <section class="ev-cost" aria-label="向量存储计算器">
            <header><span>03</span><strong>维度翻倍，原始向量存储翻倍</strong></header>
            <div class="ev-controls">
                <label :for="`${id}-blocks`">块数</label>
                <select :id="`${id}-blocks`" v-model.number="blockCount"><option :value="10000">1 万</option><option :value="100000">10 万</option><option :value="1000000">100 万</option></select>
                <span>× 维度 × 4 字节（float32）</span>
            </div>
            <figure aria-label="不同维度的原始向量存储对比">
                <div v-for="dimension in dimensions" :key="dimension" class="ev-bar-row" :class="{ 'is-selected': dimension === selectedDimension }">
                    <span>{{ dimension }} 维</span>
                    <div class="ev-bar-area" tabindex="0" :aria-label="`${dimension} 维，${formatSize(storage(dimension))}，单个向量 ${dimension * 4} 字节`" @mouseenter="activeBar = dimension" @mouseleave="activeBar = null" @focus="activeBar = dimension" @blur="activeBar = null" @keydown.esc="activeBar = null">
                        <span class="ev-bar" :style="{ width: `${dimension / 1536 * 100}%` }"></span>
                        <span v-if="activeBar === dimension" class="ev-tooltip" role="tooltip">{{ dimension }} 维 · {{ formatSize(storage(dimension)) }}</span>
                    </div>
                    <strong>{{ formatSize(storage(dimension)) }}</strong>
                </div>
                <figcaption>十进制容量；仅算原始向量，不含索引、原文和副本。</figcaption>
                <details class="ev-data"><summary>数据表</summary><div class="ev-table-scroll"><table><thead><tr><th scope="col">维度</th><th scope="col">单向量 / 字节</th><th scope="col">总量 / 字节</th></tr></thead><tbody><tr v-for="dimension in dimensions" :key="dimension"><th scope="row">{{ dimension }}</th><td>{{ dimension * 4 }}</td><td>{{ storage(dimension).toLocaleString('en-US') }}</td></tr></tbody></table></div></details>
            </figure>
        </section>

        <div class="ev-bottom">
            <p><strong>怎么选？</strong>不是越高越准；用自己的问题测，够用就好。</p>
            <p><strong>能降维吗？</strong>按模型说明或统一降维方法处理，再重建索引；别随手删数字。</p>
            <p><strong>能混用吗？</strong>查询与文档须使用兼容模型、版本、维度和处理规则。</p>
        </div>
    </div>
</template>

<style scoped>
.embedding-viz { --ev-surface: #fcfcfb; --ev-ink: #0b0b0b; --ev-secondary: #52514e; --ev-accent: #2a78d6; --ev-line: #e1e0d9; --ev-context: #898781; max-width: 620px; margin: 18px auto; color: var(--ev-ink); font-size: 13px; line-height: 1.6; }
.dark .embedding-viz { --ev-surface: #1a1a19; --ev-ink: #f0efec; --ev-secondary: #c3c2b7; --ev-accent: #3987e5; --ev-line: #383835; }
.ev-panel, .ev-cost { margin: 0 0 12px; padding: 14px 18px; border: 1px solid var(--ev-line); border-radius: 10px; background: var(--ev-surface); }
.embedding-viz header { display: flex; align-items: baseline; gap: 9px; margin-bottom: 12px; }
.embedding-viz header > span { color: var(--ev-secondary); font-size: 11px; }
.embedding-viz header > strong { font-size: 14px; }
.ev-encoding { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 8px; padding: 6px 0; font-size: 12px; }
.ev-model { padding: 4px 8px; border: 1px solid var(--ev-line); border-radius: 5px; }
.embedding-viz .ev-encoding code { background: transparent; color: var(--ev-ink); font-size: 12px; padding: 0; }
.ev-controls { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin: 12px 0 10px; font-size: 12px; }
.ev-controls > span { color: var(--ev-secondary); }
.ev-controls button, .ev-controls select { min-height: 32px; padding: 4px 9px; border: 1px solid var(--ev-line); border-radius: 6px; color: var(--ev-ink); background: var(--ev-surface); font: inherit; cursor: pointer; }
.ev-controls button[aria-pressed="true"] { border: 2px solid var(--ev-accent); padding: 3px 8px; font-weight: 700; }
.ev-controls button:hover { outline: 1px solid var(--ev-accent); }
.ev-controls button:focus-visible, .ev-controls select:focus-visible, .ev-bar-area:focus-visible, .ev-data summary:focus-visible { outline: 2px solid var(--ev-accent); outline-offset: 3px; }
.ev-cells { display: grid; grid-template-columns: repeat(16, 1fr); gap: 3px; max-width: 400px; }
.ev-cells > span { height: 12px; border: 1px solid var(--ev-line); border-radius: 2px; }
.ev-cells > .is-filled { background: var(--ev-accent); border-color: transparent; }
.embedding-viz figcaption { margin-top: 8px; color: var(--ev-secondary); font-size: 12px; line-height: 1.6; }
.ev-panel svg { display: block; width: 100%; max-width: 360px; height: auto; margin: 0 auto; }
.ev-axis { fill: none; stroke: var(--ev-line); stroke-width: 1; }
.ev-ray { fill: none; stroke: var(--ev-accent); stroke-width: 2; }
.ev-document { stroke-dasharray: 5 4; }
.ev-unrelated { stroke: var(--ev-context); }
.ev-point { fill: var(--ev-accent); stroke: var(--ev-surface); stroke-width: 2; }
.ev-unrelated-point { fill: var(--ev-context); }
.ev-panel svg text { fill: var(--ev-ink); font-size: 14px; }
.ev-panel svg .ev-muted { fill: var(--ev-secondary); font-size: 12px; }
.ev-legend { display: flex; flex-wrap: wrap; justify-content: center; gap: 14px; font-size: 11px; color: var(--ev-secondary); }
.ev-cost figure { margin: 0; }
.ev-bar-row { display: grid; grid-template-columns: 55px minmax(0, 1fr) 80px; gap: 10px; align-items: center; min-height: 36px; font-size: 12px; font-variant-numeric: tabular-nums; }
.ev-bar-row > strong { text-align: right; font-weight: 400; }
.ev-bar-row.is-selected > strong, .ev-bar-row.is-selected > span { font-weight: 700; }
.ev-bar-area { display: flex; align-items: center; position: relative; min-height: 30px; border-left: 1px solid var(--ev-line); cursor: help; }
.ev-bar { display: block; height: 12px; background: var(--ev-accent); border-radius: 0 4px 4px 0; }
.ev-bar-area:hover .ev-bar, .ev-bar-area:focus .ev-bar { outline: 1px solid var(--ev-ink); outline-offset: 2px; }
.ev-tooltip { position: absolute; z-index: 2; bottom: 100%; left: 0; width: max-content; max-width: 100%; padding: 5px 8px; border: 1px solid var(--ev-line); border-radius: 5px; background: var(--ev-surface); font-size: 11px; pointer-events: none; }
.ev-data { margin-top: 6px; font-size: 11px; color: var(--ev-secondary); }
.ev-data summary { cursor: pointer; }
.ev-table-scroll { overflow-x: auto; }
.ev-data table { font-size: 11px; white-space: nowrap; }
.ev-bottom { color: var(--vp-c-text-2); }
.embedding-viz .ev-bottom p { margin: 6px 0; font-size: 12px; line-height: 1.7; }
.ev-bottom strong { color: var(--vp-c-text-1); }
@media (max-width: 420px) {
    .ev-panel, .ev-cost { padding: 12px; }
    .ev-controls { gap: 6px; }
    .ev-controls > span { font-size: 11px; }
    .ev-encoding { column-gap: 6px; }
    .ev-bar-row { grid-template-columns: 50px minmax(0, 1fr) 74px; gap: 7px; }
}
@media print, (forced-colors: active) {
    .ev-bar, .ev-cells .is-filled { background: repeating-linear-gradient(45deg, var(--ev-ink) 0 1px, var(--ev-surface) 1px 5px); forced-color-adjust: none; }
    .ev-panel, .ev-cost { break-inside: avoid; }
}
@media (forced-colors: active) {
    .embedding-viz { --ev-surface: Canvas; --ev-ink: CanvasText; --ev-secondary: CanvasText; --ev-accent: Highlight; --ev-line: CanvasText; --ev-context: CanvasText; }
}
</style>
