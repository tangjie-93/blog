<script setup lang="ts">
import { computed, ref } from 'vue'

const includeKeyword = ref(true)
const documents = [
    { id: 'A', text: '住宿报销需提交发票，由主管审批。', short: '报销手续', rerank: 0.18 },
    { id: 'B', text: '出差住宿报销上限为每晚 600 元。', short: '住宿上限 600 元', rerank: 0.95 },
    { id: 'C', text: '交通费按实际票价报销。', short: '交通费标准', rerank: 0.08 },
]
const vector = ['A', 'B']
const keyword = ['B', 'C']
const contribution = (list: string[], id: string) => {
    const index = list.indexOf(id)
    return index < 0 ? 0 : 1 / (60 + index + 1)
}
const fused = computed(() => documents
    .map(doc => ({ ...doc, score: contribution(vector, doc.id) + (includeKeyword.value ? contribution(keyword, doc.id) : 0) }))
    .filter(doc => doc.score > 0)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id)))
const reranked = computed(() => [...fused.value].sort((a, b) => b.rerank - a.rerank))
</script>

<template>
    <figure class="retrieval-fusion" aria-label="召回、融合、重排的完整示例">
        <div class="rf-question"><strong>问题：住宿能报多少？</strong><span>以下分数均为示意，不是正确概率</span></div>
        <details class="rf-documents"><summary>查看 A / B / C 的原文</summary><p v-for="doc in documents" :key="doc.id"><b>{{ doc.id }}</b> {{ doc.text }}</p></details>

        <section class="rf-stage" aria-label="第一步召回">
            <header><span>01</span><strong>召回：各找一批候选</strong></header>
            <div class="rf-lanes">
                <div class="rf-lane"><strong>向量路 · 比意思</strong><small>问题 → 向量 → 搜索向量索引</small><ol><li><b>A</b><span>报销手续</span><small>0.86</small></li><li><b>B</b><span>住宿上限 600 元</span><small>0.83</small></li></ol></div>
                <div class="rf-lane" :class="{ 'is-disabled': !includeKeyword }"><strong>关键词路 · 比用词</strong><small>问题 → 分词 → 倒排索引 / BM25</small><ol><li><b>B</b><span>住宿上限 600 元</span><small>12.3</small></li><li><b>C</b><span>交通费标准</span><small>8.1</small></li></ol></div>
            </div>
            <p class="rf-note">入库时先建好索引；提问时搜索。两路分数尺度不同，不能直接相加。</p>
        </section>

        <div class="rf-arrow" aria-hidden="true">↓</div>
        <section class="rf-stage" aria-label="第二步融合">
            <header><span>02</span><strong>融合：多份名单 → 一份名单</strong></header>
            <label class="rf-toggle"><input v-model="includeKeyword" type="checkbox"> 加入关键词路（可切换对比）</label>
            <div class="rf-merge" aria-live="polite"><code>{{ includeKeyword ? '[A, B] + [B, C]' : '[A, B]' }}</code><span aria-hidden="true"> → </span><strong>{{ includeKeyword ? 'B 只留一份，合成 3 条' : '仅向量路，保留 2 条' }}</strong></div>
            <ol class="rf-results" aria-label="融合后的排名">
                <li v-for="(doc, index) in fused" :key="doc.id" :data-id="doc.id"><span class="rf-rank">{{ index + 1 }}</span><b>{{ doc.id }}</b><span>{{ doc.short }}</span><span class="rf-score" :title="`融合分：${doc.score.toFixed(6)}`">{{ doc.score.toFixed(4) }}</span></li>
            </ol>
            <div class="rf-calculation">RRF 按名次计分：<code>{{ includeKeyword ? 'B = 1/(60+2) + 1/(60+1)' : 'B = 1/(60+2)' }}</code></div>
            <p class="rf-note">按块 ID 去重，各路名次换成分数再相加；不是重新读原文，也不是判断真假。</p>
        </section>

        <div class="rf-arrow" aria-hidden="true">↓</div>
        <section class="rf-stage" aria-label="第三步重排">
            <header><span>03</span><strong>重排：问题 + 每条原文 → 新分数</strong></header>
            <div class="rf-inputs">
                <div><b>配对 A</b><span>问：住宿能报多少？</span><span>文：住宿报销需提交发票，由主管审批。</span></div>
                <div><b>配对 B</b><span>问：住宿能报多少？</span><span>文：出差住宿报销上限为每晚 600 元。</span></div>
            </div>
            <ol class="rf-machine" aria-label="cross-encoder 模型内部的打分步骤">
                <li><b>① 分词、拼接</b><span>问题 token + 分隔符 + 原文 token</span></li>
                <li><b>② 联合编码</b><span>Transformer 注意力让问题词与原文词相互关联</span><small>不是各算一个向量再比距离</small></li>
                <li><b>③ 评分层</b><span>联合表示 → 学到的权重变换 → 一个相关性分数</span><small>部分模型还会做 sigmoid 等分数变换</small></li>
            </ol>
            <div class="rf-learning"><b>打分能力从哪来？</b><span>训练示例：（问题，相关段落）应高分；（问题，不相关段落）应低分 → 调整模型权重。</span></div>
            <div class="rf-comparison"><span>A 只讲手续 → 示例分 0.18</span><strong>B 给出金额 → 示例分 0.95</strong></div>
            <p class="rf-note">上面是本例的结果解释，不是“含金额就加分”的固定规则；模型也可能排错。</p>
            <ol class="rf-results" aria-label="重排后的排名"><li v-for="(doc, index) in reranked" :key="doc.id" :data-id="doc.id"><span class="rf-rank">{{ index + 1 }}</span><b>{{ doc.id }}</b><span>{{ doc.short }}</span><span class="rf-score">{{ doc.rerank.toFixed(2) }}</span></li></ol>
            <p class="rf-note">每条候选都配对打分，再排序；不是沿用融合分。未召回的块，重排找不回来。</p>
        </section>
        <div class="rf-output"><span aria-hidden="true">↓</span><strong>选 B 作证据 → 生成模型回答“每晚最高 600 元”，引用 B</strong></div>
        <figcaption>检索是这一整套找资料的过程。融合看“各路排名”，重排看“问题与原文”。</figcaption>
    </figure>
</template>

<style scoped>
.retrieval-fusion { max-width: 620px; margin: 16px auto; color: var(--vp-c-text-1); font-size: 12px; line-height: 1.65; }
.rf-question { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 4px 12px; }
.rf-question > strong { font-size: 14px; }
.rf-question > span, .rf-note, .rf-documents, .rf-calculation, .rf-score, .rf-rank, .rf-lane > small, .retrieval-fusion figcaption { color: var(--vp-c-text-2); }
.rf-question > span { font-size: 11px; }
.rf-documents { margin: 6px 0 12px; }
.rf-documents summary { cursor: pointer; }
.retrieval-fusion .rf-documents p { margin: 4px 0; font-size: 12px; }
.rf-stage { padding: 14px; border: 1px solid var(--blog-border); border-radius: 10px; background: var(--blog-panel); }
.rf-stage header { display: flex; gap: 9px; align-items: baseline; margin-bottom: 10px; }
.rf-stage header > span { font-size: 11px; color: var(--vp-c-text-2); }
.rf-stage header > strong { font-size: 14px; }
.rf-lanes { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 10px; }
.rf-lane { padding: 10px; border: 1px solid var(--blog-border); border-radius: 6px; }
.rf-lane > strong, .rf-lane > small { display: block; }
.rf-lane > small { font-size: 11px; margin-top: 3px; }
.rf-lane.is-disabled { opacity: .5; }
.retrieval-fusion ol { list-style: none; margin: 8px 0 0; padding: 0; }
.rf-lane li { display: grid; grid-template-columns: 16px minmax(0, 1fr) 32px; gap: 5px; padding: 4px 0; }
.rf-lane li small { text-align: right; color: var(--vp-c-text-2); font-variant-numeric: tabular-nums; }
.retrieval-fusion .rf-note { margin: 8px 0 0; font-size: 12px; line-height: 1.65; }
.rf-arrow { text-align: center; color: var(--vp-c-text-2); height: 26px; line-height: 26px; font-size: 18px; }
.rf-toggle { display: inline-flex; align-items: center; gap: 6px; cursor: pointer; color: var(--vp-c-text-2); }
.rf-toggle input { accent-color: var(--vp-c-brand-1); }
.rf-toggle input:focus-visible, .rf-documents summary:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 3px; }
.rf-merge { margin: 8px 0; display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.retrieval-fusion code { padding: 0; background: transparent; color: var(--vp-c-text-1); font-size: 11px; overflow-wrap: anywhere; }
.rf-results li { display: grid; grid-template-columns: 18px 18px minmax(0, 1fr) 58px; gap: 6px; padding: 6px 0; border-bottom: 1px solid var(--blog-border); }
.rf-results li:last-child { border-bottom: 0; }
.rf-score { text-align: right; font-variant-numeric: tabular-nums; }
.rf-calculation { margin-top: 6px; font-size: 11px; }
.rf-inputs { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 8px; }
.rf-inputs > div { display: grid; gap: 4px; padding: 8px; border: 1px solid var(--blog-border); border-radius: 6px; }
.rf-inputs span { color: var(--vp-c-text-2); }
.retrieval-fusion .rf-machine { margin: 10px 0; padding: 10px; border: 1px solid var(--blog-border); border-radius: 6px; }
.rf-machine li { display: grid; grid-template-columns: 90px minmax(0, 1fr); gap: 3px 8px; padding: 6px 0; }
.rf-machine li + li { border-top: 1px solid var(--blog-border); }
.rf-machine small { grid-column: 2; color: var(--vp-c-text-2); font-size: 11px; }
.rf-learning { display: grid; gap: 4px; font-size: 11px; color: var(--vp-c-text-2); }
.rf-comparison { display: flex; flex-wrap: wrap; gap: 5px 16px; margin-top: 8px; }
@media (max-width: 480px) {
    .rf-inputs { grid-template-columns: minmax(0, 1fr); }
    .rf-machine li { grid-template-columns: 80px minmax(0, 1fr); }
}
.rf-output { display: grid; gap: 5px; justify-items: center; margin-top: 8px; text-align: center; font-size: 12px; }
.retrieval-fusion figcaption { margin-top: 8px; font-size: 12px; }
@media (max-width: 480px) {
    .rf-lanes { grid-template-columns: minmax(0, 1fr); gap: 8px; }
    .rf-stage { padding: 12px; }
    .rf-lane { padding: 8px; }
    .rf-lane li { padding: 2px 0; }
}
@media print { .rf-stage { break-inside: avoid; } }
</style>
