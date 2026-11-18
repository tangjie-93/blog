<script setup lang="ts">
import { computed, ref } from 'vue'
const moved = ref(false)
const k = ref(3)
const ranking = computed(() => moved.value ? ['A', 'B', 'D', 'C'] : ['B', 'A', 'D', 'C'])
const relevant = ['A', 'C']
const hits = computed(() => ranking.value.slice(0, k.value).filter(id => relevant.includes(id)).length)
const firstRank = computed(() => ranking.value.findIndex(id => relevant.includes(id)) + 1)
</script>

<template>
    <figure class="retrieval-metrics" aria-label="用同一份排名计算召回率和倒数排名">
        <header><strong>标准相关块：A、C</strong><span>实心边框 + ✓ 表示相关，不靠颜色判断</span></header>
        <div class="rm-controls"><label>看前几条 <select v-model.number="k"><option :value="1">前 1 条</option><option :value="3">前 3 条</option><option :value="4">前 4 条</option></select></label><button type="button" :aria-pressed="moved" @click="moved = !moved">{{ moved ? '恢复原排名' : '把 A 移到第 1 位' }}</button></div>
        <ol class="rm-ranking" aria-label="检索返回的排名"><li v-for="(id, index) in ranking" :key="id" :class="{ 'is-relevant': relevant.includes(id), 'is-outside': index >= k }"><small>第 {{ index + 1 }}</small><strong>{{ id }} {{ relevant.includes(id) ? '✓' : '' }}</strong><span>{{ index < k ? '计入 top-k' : '超出 top-k' }}</span></li></ol>
        <div class="rm-results" aria-live="polite"><div><strong>Recall@{{ k }} = {{ hits }}/2 = {{ hits / 2 }}</strong><span>前 {{ k }} 条找回 {{ hits }} 个 / 应找到 2 个</span></div><div><strong>单题倒数排名 = 1/{{ firstRank }} = {{ 1 / firstRank }}</strong><span>第一个相关结果在第 {{ firstRank }} 位</span></div></div>
        <figcaption>多题倒数排名取平均才叫 MRR。移动 A 可以改善排序，但在 k=3 时召回率不变。</figcaption>
    </figure>
</template>

<style scoped>
.retrieval-metrics { max-width: 560px; margin: 16px auto; padding: 14px; background: var(--blog-panel); color: var(--vp-c-text-1); border: 1px solid var(--blog-border); border-radius: 10px; font-size: 12px; }
.retrieval-metrics header { display: grid; gap: 4px; }
.retrieval-metrics header strong { font-size: 14px; }
.retrieval-metrics header > span, .rm-results span, .retrieval-metrics figcaption { color: var(--vp-c-text-2); }
.rm-controls { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin: 12px 0; }
.rm-controls select, .rm-controls button { min-height: 32px; padding: 4px 8px; background: transparent; color: var(--vp-c-text-1); border: 1px solid var(--blog-border); border-radius: 6px; font: inherit; cursor: pointer; }
.rm-controls button:focus-visible, .rm-controls select:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 3px; }
.retrieval-metrics .rm-ranking { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; list-style: none; padding: 0; margin: 0; }
.rm-ranking li { display: grid; gap: 5px; text-align: center; padding: 8px 4px; border: 1px dashed var(--vp-c-text-2); border-radius: 7px; }
.rm-ranking li.is-relevant { border: 2px solid var(--vp-c-text-1); padding: 7px 3px; }
.rm-ranking li.is-outside { opacity: .55; }
.rm-ranking strong { font-size: 21px; }
.rm-ranking small, .rm-ranking span { font-size: 10px; }
.rm-results { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 14px; }
.rm-results > div { display: grid; gap: 4px; }
.retrieval-metrics figcaption { margin-top: 10px; font-size: 12px; line-height: 1.7; }
@media (max-width: 420px) { .rm-results { grid-template-columns: 1fr; } .rm-ranking { gap: 5px; } }
</style>
