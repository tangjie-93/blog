<script setup lang="ts">
withDefaults(defineProps<{ detailed?: boolean }>(), { detailed: false })
</script>

<template>
    <figure class="rag-flow" aria-label="RAG 离线摄取与在线问答流程图">
        <section class="rag-flow__lane" aria-label="离线摄取流程">
            <header class="rag-flow__heading"><strong>离线 · 文档进来</strong><span>准备可检索的资料</span></header>
            <ol class="rag-flow__steps">
                <li><strong>上传文档</strong><span>{{ detailed ? '暂存原文件 · 创建异步任务' : '保存原文件' }}</span></li>
                <li><strong>解析与切块</strong><span>解析 → 清洗 → 切分</span></li>
                <li><strong>向量化与索引</strong><span>向量 / 关键词 → 写索引</span></li>
                <li><strong>状态收敛</strong><span>校验处理结果</span></li>
                <li><strong>可检索</strong><span>文档就绪</span></li>
            </ol>
        </section>
        <div class="rag-flow__index" role="note"><strong>持久化索引</strong><span>离线写入 ↓ 在线召回时读取</span></div>
        <section class="rag-flow__lane" aria-label="在线问答流程">
            <header class="rag-flow__heading"><strong>在线 · 问题进来</strong><span>根据证据组织回答</span></header>
            <ol class="rag-flow__steps">
                <li><strong>{{ detailed ? '鉴权与理解' : '提问与理解' }}</strong><span>{{ detailed ? '检查权限 → 理解 / 改写' : '理解 / 改写问题' }}</span></li>
                <li><strong>{{ detailed ? '多路召回' : '召回' }}</strong><span>从索引取候选片段</span></li>
                <li><strong>融合与重排</strong><span>合并候选 → 排序</span></li>
                <li><strong>组装证据</strong><span>证据 → Prompt</span></li>
                <li><strong>生成与引用</strong><span>流式回答 → 引用 / 拒答</span></li>
            </ol>
        </section>
        <figcaption>两条独立链路通过索引衔接，不是每次提问都重新处理文档。</figcaption>
    </figure>
</template>

<style scoped>
.rag-flow {
    container-type: inline-size;
    margin: 20px 0;
    padding: 16px;
    border: 1px solid var(--blog-border);
    border-radius: 10px;
    background: var(--blog-panel);
    color: var(--vp-c-text-1);
}
.rag-flow__heading { display: flex; align-items: baseline; gap: 12px; margin-bottom: 10px; font-size: 14px; }
.rag-flow__heading span { color: var(--vp-c-text-2); font-size: 12px; }
.rag-flow .rag-flow__steps { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 20px; margin: 0; padding: 0; list-style: none; }
.rag-flow .rag-flow__steps > li { position: relative; display: flex; flex-direction: column; justify-content: center; gap: 4px; margin: 0; padding: 10px 6px; border: 1px solid var(--blog-border); border-radius: 6px; text-align: center; line-height: 1.5; }
.rag-flow__steps > li + li::before { content: '→'; position: absolute; left: -19px; top: 50%; width: 18px; transform: translateY(-50%); color: var(--vp-c-text-2); }
.rag-flow__steps strong { font-size: 13px; }
.rag-flow__steps span { font-size: 11px; color: var(--vp-c-text-2); }
.rag-flow__index { display: flex; justify-content: center; align-items: baseline; gap: 12px; margin: 12px 0; padding: 6px 10px; border-block: 1px dashed var(--blog-border); font-size: 12px; }
.rag-flow__index span { color: var(--vp-c-text-2); }
.rag-flow figcaption { margin-top: 10px; color: var(--vp-c-text-2); font-size: 12px; line-height: 1.6; }
@container (max-width: 560px) {
    .rag-flow .rag-flow__steps { grid-template-columns: minmax(0, 1fr); gap: 20px; }
    .rag-flow .rag-flow__steps > li { flex-direction: row; align-items: baseline; justify-content: space-between; padding: 8px 12px; text-align: left; }
    .rag-flow__steps > li + li::before { content: '↓'; left: 50%; top: -20px; transform: translateX(-50%); text-align: center; }
    .rag-flow__index { flex-wrap: wrap; gap: 4px 12px; }
}
@media (forced-colors: active) {
    .rag-flow, .rag-flow .rag-flow__steps > li, .rag-flow__index { border-color: CanvasText; }
}
</style>
