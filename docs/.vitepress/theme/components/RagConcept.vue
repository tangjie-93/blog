<script setup lang="ts">
import { computed, ref, useId } from 'vue'

const props = defineProps<{ mode: 'contract' | 'context' | 'citation' | 'finalize' | 'lifecycle' | 'diagnose' }>()
const id = `rag-concept-${useId().replace(/[^a-zA-Z0-9_-]/g, '-')}`
const step = ref(0)
const citation = ref('valid')
const titles = {
    contract: '同一段资料怎样变成回答', context: '上下文在什么时候补进去',
    citation: '有引用，不一定有依据', finalize: '可检索不等于后台工作已结束',
    lifecycle: '蓝绿发布：切换的是当前版本指针', diagnose: '追踪正确块 C17，找到它消失的那一步',
}
const citationCases = [
    { key: 'unknown', label: '600 元 [E9]', identity: false, supported: false },
    { key: 'wrong', label: '650 元 [E1]', identity: true, supported: false },
    { key: 'valid', label: '600 元 [E1]', identity: true, supported: true },
]
const selected = computed(() => citationCases.find(item => item.key === citation.value)!)
const lifecycleSteps = ['旧版服务', '构建与追增量', '验证后切换', '必要时回滚']
const finalSteps = ['先登记 2 个任务', '摘要成功', '问题生成终态失败']
const descriptions = computed(() => ({
    contract: '文档块 chunk 记录正文和来源；命中 hit 增加本次排名；证据 evidence 增加本轮引用 E1；answer 引用 E1。找到的候选不一定全部交给模型。',
    context: '标题或生成说明在嵌入前补充；后期切分先算长窗口的 token 表示再按块池化；父子块是在命中子块后取父段。',
    citation: `当前回答 ${selected.value.label}。编号检查${selected.value.identity ? '通过' : '失败'}；支持检查${!selected.value.identity ? '未执行' : selected.value.supported ? '通过' : '失败'}。`,
    finalize: `先进入 finalizing 并登记两个任务，再分发。当前剩余任务 ${2 - step.value}，状态 ${step.value === 2 ? 'completed' : 'finalizing'}，全文一直 enabled。`,
    lifecycle: `当前阶段：${lifecycleSteps[step.value]}。查询指针 current 指向 ${step.value === 2 ? 'v8' : 'v7'}。切换要同时匹配查询配置，回滚前检查旧版数据是否仍然新鲜。`,
    diagnose: 'C17 在索引里存在，召回排12，重排排2，却因上下文预算未进最终证据。应检查上下文组装，不是先换嵌入模型。',
})[props.mode])
</script>

<template>
    <figure class="rag-concept" :aria-label="titles[mode]">
        <header><strong>{{ titles[mode] }}</strong></header>
        <div v-if="mode === 'citation'" class="rc-controls" role="group" aria-label="选择待检查的回答"><button v-for="item in citationCases" :key="item.key" type="button" :aria-pressed="citation === item.key" @click="citation = item.key">{{ item.label }}</button></div>
        <div v-if="mode === 'finalize' || mode === 'lifecycle'" class="rc-controls" role="group" aria-label="选择执行阶段"><button v-for="(label, index) in mode === 'finalize' ? finalSteps : lifecycleSteps" :key="label" type="button" :aria-pressed="step === index" @click="step = index">{{ index + 1 }} {{ label }}</button></div>
        <svg viewBox="0 0 420 280" role="img" :aria-labelledby="`${id}-title ${id}-desc`">
            <title :id="`${id}-title`">{{ titles[mode] }}</title><desc :id="`${id}-desc`">{{ descriptions }}</desc>
            <defs><marker :id="`${id}-arrow`" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M1 1 L9 5 L1 9 Z" class="rc-arrowhead" /></marker></defs>

            <g v-if="mode === 'contract'">
                <path class="rc-edge" d="M172 54 V75 M172 117 V138 M172 182 V203" :marker-end="`url(#${id}-arrow)`" />
                <g class="rc-node"><rect x="22" y="10" width="300" height="44" rx="7"/><text x="36" y="28">chunk · 原文块 hr-v2-c003</text><text class="rc-small" x="36" y="45">工作日加班，每餐补贴 30 元</text></g>
                <g class="rc-node"><rect x="22" y="75" width="300" height="42" rx="7"/><text x="36" y="100">hit · 本次命中，rank = 1</text></g>
                <path class="rc-edge rc-branch" d="M322 95 H350 V153" :marker-end="`url(#${id}-arrow)`"/><text class="rc-small" x="332" y="174">其他候选</text><text class="rc-small" x="332" y="191">可被筛掉</text>
                <g class="rc-node"><rect x="22" y="138" width="300" height="44" rx="7"/><text x="36" y="157">evidence · 选给模型的资料</text><text class="rc-small" x="36" y="174">本轮 E1 → hr-v2-c003 → v2 / 第 3 页</text></g>
                <g class="rc-node rc-emphasis"><rect x="22" y="203" width="370" height="50" rx="7"/><text x="36" y="223">answer · 工作日加班，每餐补贴 30 元 [E1]</text><text class="rc-small" x="36" y="242">保留条件、金额和引用</text></g>
            </g>

            <g v-else-if="mode === 'context'">
                <g class="rc-node"><rect x="15" y="12" width="390" height="42" rx="7"/><text x="28" y="31">原文：差旅管理 › 住宿标准 › 一线城市每晚 600 元</text><text class="rc-small" x="28" y="47">短块只有“每晚 600 元”，不知道在说什么</text></g>
                <text class="rc-label" x="18" y="83">嵌入前补</text><g class="rc-node"><rect x="106" y="64" width="296" height="44" rx="7"/><text x="117" y="83">标题 / 生成说明 + 短块 → 向量</text><text class="rc-small" x="117" y="100">“这是住宿标准” + “每晚 600 元”</text></g>
                <text class="rc-label" x="18" y="146">编码时补</text><g class="rc-node"><rect x="106" y="127" width="296" height="44" rx="7"/><text x="117" y="146">长窗口 → token 表示 → 按块池化</text><text class="rc-small" x="117" y="163">后期切分，不是切开一个全文向量</text></g>
                <text class="rc-label" x="18" y="209">命中后补</text><g class="rc-node"><rect x="106" y="190" width="296" height="44" rx="7"/><text x="117" y="209">子块命中 → 取父段 → 交给生成模型</text><text class="rc-small" x="117" y="226">父子块：小块找得准，大段保留条件</text></g>
                <path class="rc-edge" d="M22 255 H399"/><text class="rc-small" x="62" y="274">原文与定位坐标独立保留，不被增强文本覆盖</text>
            </g>

            <g v-else-if="mode === 'citation'">
                <g class="rc-node"><rect x="20" y="10" width="380" height="42" rx="7"/><text x="34" y="29">本轮证据：E1 → doc_42 / v3 / 第 12 页</text><text class="rc-small" x="34" y="45">原文：“住宿报销上限为每晚 600 元”</text></g>
                <path class="rc-edge" d="M210 52 V73 M210 127 V150 M210 202 V224" :marker-end="`url(#${id}-arrow)`"/>
                <g class="rc-node" :class="{ 'rc-emphasis': !selected.identity }"><rect x="65" y="73" width="290" height="54" rx="7"/><text x="80" y="95">第 1 关：编号属于本轮证据吗？</text><text x="80" y="115">{{ selected.identity ? '✓ E1 存在，继续检查' : '× E9 不存在，拦截引用' }}</text></g>
                <g class="rc-node" :class="{ 'rc-emphasis': selected.identity && !selected.supported }"><rect x="65" y="150" width="290" height="52" rx="7"/><text x="80" y="172">第 2 关：原文支持这个结论吗？</text><text x="80" y="192">{{ !selected.identity ? '— 上一关失败，不继续' : selected.supported ? '✓ 600 元有原文依据' : '× 原文没有说 650 元' }}</text></g>
                <text class="rc-label" x="52" y="247">{{ selected.identity && selected.supported ? '✓ 展示回答与来源；点击来源仍要鉴权' : '不放行这条引用 / 结论，修正或明确说明不足' }}</text>
            </g>

            <g v-else-if="mode === 'finalize'">
                <g class="rc-node"><rect x="65" y="10" width="290" height="42" rx="7"/><text x="81" y="36">正文已索引：enabled，可供检索</text></g>
                <path class="rc-edge" d="M210 52 V76 M150 120 V145 H105 V164 M270 120 V145 H316 V164 M105 210 V233 H210 M316 210 V233 H210" :marker-end="`url(#${id}-arrow)`"/>
                <g class="rc-node rc-emphasis"><rect x="65" y="76" width="290" height="44" rx="7"/><text x="81" y="95">先登记名额，再分发任务</text><text class="rc-small" x="81" y="112">finalizing · pending = 2</text></g>
                <g class="rc-node"><rect x="20" y="164" width="170" height="46" rx="7"/><text x="34" y="184">摘要任务</text><text class="rc-small" x="34" y="201">{{ step >= 1 ? '✓ 成功，结算 1 个名额' : '处理中，不扣名额' }}</text></g>
                <g class="rc-node"><rect x="230" y="164" width="170" height="46" rx="7"/><text x="244" y="184">问题生成任务</text><text class="rc-small" x="244" y="201">{{ step >= 2 ? '× 最终失败，仍结算名额' : '处理中 / 重试，不扣名额' }}</text></g>
                <text class="rc-label" x="60" y="258">剩余 {{ 2 - step }} 个 → {{ step === 2 ? 'completed（工作结束，不等于全部成功）' : '仍是 finalizing（正文仍可检索）' }}</text>
            </g>

            <g v-else-if="mode === 'lifecycle'">
                <g class="rc-node"><rect x="137" y="12" width="146" height="42" rx="7"/><text x="159" y="39">查询入口 current</text></g>
                <path class="rc-edge rc-selected-edge" :d="step === 2 ? 'M210 54 V77 H316 V102' : 'M210 54 V77 H105 V102'" :marker-end="`url(#${id}-arrow)`"/>
                <g class="rc-node" :class="{ 'rc-emphasis': step !== 2 }"><rect x="20" y="102" width="170" height="70" rx="7"/><text x="35" y="126">旧索引 v7</text><text class="rc-small" x="35" y="146">{{ step === 2 ? '保留，供回滚使用' : '当前提供查询' }}</text><text class="rc-small" x="35" y="162">{{ step >= 2 ? '回滚前核对增量和删除' : '构建期间继续服务' }}</text></g>
                <g class="rc-node" :class="{ 'rc-emphasis': step === 2 }"><rect x="230" y="102" width="170" height="70" rx="7"/><text x="245" y="126">新索引 v8</text><text class="rc-small" x="245" y="146">{{ step === 0 ? '尚未构建' : step === 1 ? '快照 100 + 变更 101–108' : step === 2 ? '评估通过，当前提供查询' : '保留排查，不再接查询' }}</text><text class="rc-small" x="245" y="162">{{ step === 1 ? '包括删除事件' : '模型与查询配置要匹配' }}</text></g>
                <text class="rc-label" x="25" y="209">{{ step === 0 ? '① 查询只认入口，不在代码里写死 v7' : step === 1 ? '② 补齐增量并评估，不只看“构建成功”' : step === 2 ? '③ 切指针到 v8，不是覆盖或删除 v7' : '④ 确认 v7 数据新鲜后，才安全回切' }}</text>
                <text class="rc-small" x="25" y="246">别名原子切换 ≠ 跨存储原子切换</text><text class="rc-small" x="25" y="267">保留旧索引 ≠ 它自动拥有最新数据</text>
            </g>

            <g v-else>
                <g class="rc-node"><rect x="70" y="8" width="280" height="34" rx="7"/><text x="87" y="30">索引：正确块 C17 存在</text></g>
                <path class="rc-edge" d="M210 42 V62 M210 96 V116 M210 150 V170 M210 214 V237" :marker-end="`url(#${id}-arrow)`"/>
                <g class="rc-node"><rect x="70" y="62" width="280" height="34" rx="7"/><text x="87" y="84">召回 30 条：C17 排第 12</text></g>
                <g class="rc-node"><rect x="70" y="116" width="280" height="34" rx="7"/><text x="87" y="138">重排留 8 条：C17 排第 2</text></g>
                <g class="rc-node rc-emphasis"><rect x="35" y="170" width="350" height="44" rx="7"/><text x="50" y="188">× 最终证据 3 条：C17 消失</text><text class="rc-small" x="50" y="205">日志原因：上下文预算不足，被跳过</text></g>
                <text class="rc-label" x="46" y="259">先检查上下文组装，不要先换嵌入模型</text>
            </g>
        </svg>
        <figcaption v-if="mode === 'contract'">命中不等于给模型看了；E1 仅本轮有效。对象是环节约定，不强制对应四张表。</figcaption>
        <figcaption v-else-if="mode === 'context'">生成说明可能有误，不是原文事实；后期切分需要模型提供 token 级表示。</figcaption>
        <figcaption v-else-if="mode === 'citation'" aria-live="polite">{{ selected.identity && selected.supported ? '本例两关通过；检查“支持结论”不能只匹配数字，出处本身也可能有错。' : !selected.identity ? '编号不存在，即使金额碰巧正确，也不能伪造出处。' : '编号合法，但结论不受证据支持，仍不能放行。' }}</figcaption>
        <figcaption v-else-if="mode === 'finalize'" aria-live="polite">结算与条件提升须在同一 SQL 事务内；重试途中不结算。示例仅含两项增强，不代表全部任务。</figcaption>
        <figcaption v-else-if="mode === 'lifecycle'">示意版本与变更序号；回滚、同步、鉴权都要单独验证，不承诺零停机或零数据丢失。</figcaption>
        <figcaption v-else>示例 run_id=r017。数量减少本身不是故障；关键是正确证据在哪一步被丢掉。</figcaption>
    </figure>
</template>

<style scoped>
.rag-concept { max-width: 540px; margin: 16px auto; padding: 14px; border: 1px solid var(--blog-border); border-radius: 10px; background: var(--blog-panel); color: var(--vp-c-text-1); }
.rag-concept header { font-size: 14px; line-height: 1.6; }
.rc-controls { display: flex; flex-wrap: wrap; gap: 6px; margin: 10px 0; }
.rc-controls button { min-height: 32px; padding: 4px 8px; background: transparent; color: var(--vp-c-text-1); border: 1px solid var(--blog-border); border-radius: 6px; font-size: 11px; cursor: pointer; }
.rc-controls button[aria-pressed="true"] { border: 2px solid var(--vp-c-brand-1); padding: 3px 7px; font-weight: 700; }
.rc-controls button:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 3px; }
.rag-concept svg { display: block; width: 100%; max-width: 440px; height: auto; margin: 10px auto 0; }
.rc-node rect { fill: var(--blog-panel); stroke: var(--blog-border); stroke-width: 1.5; }
.rc-emphasis rect { stroke: var(--vp-c-text-1); stroke-width: 2; }
.rag-concept svg text { fill: var(--vp-c-text-1); font-size: 13px; }
.rag-concept svg .rc-small { font-size: 11px; fill: var(--vp-c-text-2); }
.rag-concept svg .rc-label { font-size: 13px; font-weight: 600; }
.rc-edge { stroke: var(--vp-c-text-2); fill: none; stroke-width: 2; stroke-linejoin: round; }
.rc-branch { stroke-dasharray: 4 4; }
.rc-arrowhead { fill: var(--vp-c-text-2); }
.rc-selected-edge { stroke: var(--vp-c-text-1); }
.rag-concept figcaption { margin-top: 8px; font-size: 12px; line-height: 1.7; color: var(--vp-c-text-2); }
@media (max-width: 420px) { .rag-concept { padding: 10px; } }
@media (forced-colors: active) { .rc-node rect { fill: Canvas; stroke: CanvasText; } .rc-edge { stroke: CanvasText; } .rc-arrowhead, .rag-concept svg text { fill: CanvasText; } }
</style>
