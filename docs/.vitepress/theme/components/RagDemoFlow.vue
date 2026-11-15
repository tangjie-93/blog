<script setup lang="ts">
withDefaults(defineProps<{ mode?: 'entry' | 'ingest' | 'ask' }>(), { mode: 'entry' })
</script>

<template>
    <figure class="demo-flow" :aria-label="mode === 'entry' ? 'rag_demo.py 命令入口流程图' : mode === 'ingest' ? 'ingest 建索引执行流程图' : 'ask 检索与问答分支流程图'">
        <template v-if="mode === 'entry'">
            <div class="demo-flow__node"><strong>执行脚本 → main()</strong><span>解析参数 → 创建 Ollama 客户端（此时不发请求）</span></div>
            <div class="demo-flow__arrow" aria-hidden="true">↓</div>
            <div class="demo-flow__decision">选择子命令</div>
            <div class="demo-flow__branches">
                <section><p class="demo-flow__label">command = ingest ↙</p><div class="demo-flow__node"><strong>ingest()</strong><span>Markdown → 切块 → 嵌入 → 写 index.json</span></div><p class="demo-flow__outcome">打印「已写入 N 个片段」</p></section>
                <section><p class="demo-flow__label">↘ command = ask</p><div class="demo-flow__node"><strong>load_index() → ask()</strong><span>读 index.json → 检索 → 返回证据 / 拒答 / 回答</span></div><p class="demo-flow__outcome">打印 JSON：answer + evidence</p></section>
            </div>
            <figcaption>两条命令分别运行，通过磁盘上的 index.json 衔接；ask 不会自动重新切块或给文档计算向量。</figcaption>
        </template>
        <template v-else-if="mode === 'ingest'">
            <ol class="demo-flow__steps">
                <li class="demo-flow__node"><strong>make_chunks()</strong><span>遍历 *.md → read_markdown() 读取标题与正文行 → 每段最多 500 字符 → 编号 C0001…</span></li>
                <li class="demo-flow__node"><strong>逐块 client.embed()</strong><span>每个块的 text → _post('/api/embed') → 取第一条向量并转成 float 列表</span></li>
                <li class="demo-flow__node"><strong>检查向量维度</strong><span>dimension = 第一条向量长度；任何一条长度不同 → 抛 ValueError，停止写入</span></li>
                <li class="demo-flow__node"><strong>atomic_write()</strong><span>块 + 向量 + 模型名 → 同目录临时 JSON → os.replace() 替换目标索引</span></li>
                <li class="demo-flow__node"><strong>return len(chunks)</strong><span>main() 打印数量；空目录会写入 dimension=0、chunks=[] 的空索引</span></li>
            </ol>
            <figcaption>这是串行、全量重建。任一嵌入请求或维度检查失败，尚未执行 atomic_write()，不会用部分结果覆盖旧索引。</figcaption>
        </template>
        <template v-else>
            <ol class="demo-flow__steps">
                <li class="demo-flow__node"><strong>load_index()</strong><span>读取 JSON → 对比 embedding_model；模型名不同 → 抛 ValueError，不进入 ask()</span></li>
                <li class="demo-flow__node"><strong>retrieve()</strong><span>问题 → client.embed() → 与每个块算 cosine() → 降序排列 → 取前 top_k 条</span></li>
                <li class="demo-flow__node"><strong>过滤并编号</strong><span>保留 score ≥ min_score → 将结果副本的 id 改为 E1、E2…</span></li>
            </ol>
            <div class="demo-flow__arrow" aria-hidden="true">↓</div>
            <div class="demo-flow__decision">retrieval_only 为真？（先判断）</div>
            <div class="demo-flow__branches">
                <section><p class="demo-flow__label">是 ↙</p><div class="demo-flow__node"><strong>只返回检索结果</strong><span>answer=null，evidence 可为空</span></div><p class="demo-flow__outcome">不调用 chat；仍调用了 embed</p></section>
                <section><p class="demo-flow__label">↘ 否</p><div class="demo-flow__decision">evidence 为空？</div><div class="demo-flow__branches">
                    <section><p class="demo-flow__label">是 ↙</p><div class="demo-flow__node"><strong>固定拒答</strong><span>「没有足够证据回答。」</span></div><p class="demo-flow__outcome">evidence=[]；不调用 chat</p></section>
                    <section><p class="demo-flow__label">↘ 否</p><div class="demo-flow__node"><strong>拼 context 与 prompt</strong><span>编号 + 来源 + 标题 + 正文 + 问题</span></div><div class="demo-flow__arrow" aria-hidden="true">↓</div><div class="demo-flow__node"><strong>client.chat() → 返回</strong><span>/api/chat，stream=False → answer + evidence</span></div></section>
                </div></section>
            </div>
            <figcaption>异常不是拒答：网络、文件、JSON 或维度错误会向外抛出，当前 main() 没有统一捕获。空索引的查询也会先请求问题向量。</figcaption>
        </template>
    </figure>
</template>

<style scoped>
.demo-flow { container-type: inline-size; margin: 20px 0; padding: 16px; border: 1px solid var(--blog-border); border-radius: 10px; background: var(--blog-panel); color: var(--vp-c-text-1); }
.demo-flow__node, .demo-flow__decision { padding: 10px 12px; border: 1px solid var(--blog-border); border-radius: 6px; font-size: 13px; line-height: 1.6; overflow-wrap: anywhere; }
.demo-flow__node { display: flex; flex-direction: column; gap: 3px; }
.demo-flow__node span, .demo-flow figcaption { color: var(--vp-c-text-2); font-size: 12px; }
.demo-flow__decision { border-style: dashed; font-weight: 600; text-align: center; }
.demo-flow__arrow { text-align: center; color: var(--vp-c-text-2); line-height: 24px; }
.demo-flow__branches { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 2fr); gap: 16px; }
.demo-flow__branches > section { min-width: 0; }
.demo-flow .demo-flow__label, .demo-flow .demo-flow__outcome { margin: 6px 0; font-size: 12px; line-height: 1.6; }
.demo-flow__outcome { color: var(--vp-c-text-2); }
.demo-flow .demo-flow__steps { display: grid; gap: 24px; margin: 0; padding: 0; list-style: none; }
.demo-flow .demo-flow__steps > li { position: relative; margin: 0; }
.demo-flow__steps > li + li::before { content: '↓'; position: absolute; top: -24px; left: 50%; transform: translateX(-50%); height: 24px; color: var(--vp-c-text-2); }
.demo-flow figcaption { margin-top: 12px; line-height: 1.7; }
@container (max-width: 600px) {
    .demo-flow__branches { grid-template-columns: minmax(0, 1fr); gap: 6px; }
    .demo-flow__branches .demo-flow__branches { margin-left: 12px; padding-left: 12px; border-left: 1px solid var(--blog-border); }
}
@media (forced-colors: active) {
    .demo-flow, .demo-flow__node, .demo-flow__decision { border-color: CanvasText; }
}
</style>
