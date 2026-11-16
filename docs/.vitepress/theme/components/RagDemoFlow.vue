<script setup lang="ts">
import { computed, useId } from 'vue'

const props = withDefaults(defineProps<{ mode?: 'entry' | 'ingest' | 'ask' }>(), { mode: 'entry' })
const markerId = `demo-arrow-${useId().replace(/[^a-zA-Z0-9_-]/g, '-')}`
type Node = { id: string; x: number; y: number; w: number; h: number; kind?: 'terminal' | 'decision'; lines: string[] }
type Edge = { from: string; to: string; path: string; label?: string; x?: number; y?: number }
type Diagram = { title: string; height: number; nodes: Node[]; edges: Edge[]; note: string; description: string }
const diagrams: Record<'entry' | 'ingest' | 'ask', Diagram> = {
    entry: {
        title: '命令入口：从启动到结束', height: 850,
        description: '开始 → main() 解析参数 → 创建客户端 → 判断子命令。ingest 分支建索引后打印片段数；ask 分支先加载索引，再调用 ask，最后打印 JSON。两条正常路径汇合后结束。',
        nodes: [
            { id: 'start', x: 365, y: 20, w: 170, h: 48, kind: 'terminal', lines: ['开始：执行脚本'] },
            { id: 'main', x: 295, y: 105, w: 310, h: 70, lines: ['main()', '解析命令行参数'] },
            { id: 'client', x: 295, y: 215, w: 310, h: 70, lines: ['创建 OpenAICompatible 客户端', '读取两个端点地址与 Key，不发请求'] },
            { id: 'command', x: 330, y: 330, w: 240, h: 110, kind: 'decision', lines: ['子命令', '是什么？'] },
            { id: 'ingest', x: 65, y: 490, w: 300, h: 80, lines: ['ingest()', '读文档 → 切块 → 嵌入 → 写索引'] },
            { id: 'load', x: 535, y: 490, w: 300, h: 80, lines: ['load_index()', '读取 index.json，检查模型名'] },
            { id: 'print-count', x: 65, y: 620, w: 300, h: 70, lines: ['打印片段数量', '「已写入 N 个片段」'] },
            { id: 'ask', x: 535, y: 605, w: 300, h: 70, lines: ['ask()', '检索 → 证据 / 拒答 / 回答'] },
            { id: 'print-json', x: 535, y: 710, w: 300, h: 60, lines: ['打印 JSON', 'answer + evidence'] },
            { id: 'end', x: 365, y: 790, w: 170, h: 44, kind: 'terminal', lines: ['结束'] },
        ],
        edges: [
            { from: 'start', to: 'main', path: 'M450 68 V105' },
            { from: 'main', to: 'client', path: 'M450 175 V215' },
            { from: 'client', to: 'command', path: 'M450 285 V330' },
            { from: 'command', to: 'ingest', path: 'M330 385 H215 V490', label: 'ingest', x: 252, y: 371 },
            { from: 'command', to: 'load', path: 'M570 385 H685 V490', label: 'ask', x: 647, y: 371 },
            { from: 'ingest', to: 'print-count', path: 'M215 570 V620' },
            { from: 'load', to: 'ask', path: 'M685 570 V605' },
            { from: 'ask', to: 'print-json', path: 'M685 675 V710' },
            { from: 'print-count', to: 'end', path: 'M215 690 V812 H365' },
            { from: 'print-json', to: 'end', path: 'M685 770 V812 H535' },
        ],
        note: '两条命令分别运行，通过磁盘上的 index.json 衔接。ask 不会自动重新切块或给文档计算向量。图中是正常路径；异常会中断执行，不会汇合到正常结束。',
    },
    ingest: {
        title: 'ingest：切块、循环嵌入、检查、写入', height: 1110,
        description: '进入 ingest，make_chunks 调用 read_markdown 切块。只要还有未嵌入的块，就取下一个块调用 embed，再回到循环判断。全部完成后检查维度；不一致抛异常，一致则原子写入并返回块数。',
        nodes: [
            { id: 'start', x: 320, y: 20, w: 260, h: 48, kind: 'terminal', lines: ['进入 ingest()'] },
            { id: 'chunks', x: 255, y: 105, w: 390, h: 80, lines: ['make_chunks() → read_markdown()', '读 *.md → 按行切块 → 编号 C0001…'] },
            { id: 'more', x: 310, y: 235, w: 280, h: 120, kind: 'decision', lines: ['还有块', '没有嵌入？'] },
            { id: 'embed', x: 50, y: 425, w: 320, h: 100, lines: ['取下一个块 → client.embed()', '_post(\'/embeddings\')', '把返回向量加入 vectors'] },
            { id: 'dimension', x: 500, y: 425, w: 340, h: 80, lines: ['dimension = 第一条向量长度', '没有块时，dimension = 0'] },
            { id: 'valid', x: 530, y: 555, w: 280, h: 120, kind: 'decision', lines: ['所有向量', '维度一致？'] },
            { id: 'error', x: 60, y: 750, w: 320, h: 90, kind: 'terminal', lines: ['抛 ValueError → 中断', '不写入，不覆盖旧索引'] },
            { id: 'write', x: 500, y: 750, w: 340, h: 100, lines: ['atomic_write()', '写同目录临时 JSON', 'os.replace() 替换 index.json'] },
            { id: 'return', x: 500, y: 900, w: 340, h: 70, lines: ['return len(chunks)', '把片段数量交回 main()'] },
            { id: 'end', x: 550, y: 1020, w: 240, h: 48, kind: 'terminal', lines: ['返回调用方'] },
        ],
        edges: [
            { from: 'start', to: 'chunks', path: 'M450 68 V105' },
            { from: 'chunks', to: 'more', path: 'M450 185 V235' },
            { from: 'more', to: 'embed', path: 'M310 295 H210 V425', label: '是：继续循环', x: 210, y: 380 },
            { from: 'embed', to: 'more', path: 'M50 475 H25 V205 H450 V235', label: '处理下一块', x: 170, y: 196 },
            { from: 'more', to: 'dimension', path: 'M590 295 H670 V425', label: '否：循环完成', x: 720, y: 380 },
            { from: 'dimension', to: 'valid', path: 'M670 505 V555' },
            { from: 'valid', to: 'error', path: 'M530 615 H220 V750', label: '否', x: 400, y: 600 },
            { from: 'valid', to: 'write', path: 'M670 675 V750', label: '是', x: 696, y: 716 },
            { from: 'write', to: 'return', path: 'M670 850 V900' },
            { from: 'return', to: 'end', path: 'M670 970 V1020' },
        ],
        note: '串行、全量重建，不是并发嵌入。嵌入请求失败时立即抛异常，不进入后续写入。空目录跳过循环，仍可写入 dimension=0、chunks=[] 的空索引。',
    },
    ask: {
        title: 'ask：先检索，再按条件选择返回路径', height: 1210,
        description: '先 load_index，再进入 ask 并调用 retrieve：问题嵌入、余弦算分、排序取 top_k。过滤并编号后，先判断 retrieval_only，为真直接返回 answer=null；否则判断证据是否为空，空则固定拒答，非空则组装 Prompt 调用 chat。三条正常返回路径汇合到 main 打印结果。',
        nodes: [
            { id: 'load', x: 255, y: 20, w: 390, h: 80, lines: ['load_index() → 进入 ask()', '读 JSON、检查 embedding_model'] },
            { id: 'retrieve', x: 235, y: 145, w: 430, h: 100, lines: ['retrieve()', 'embed(问题) → 逐块 cosine()', '降序排序 → 取前 top_k 条'] },
            { id: 'filter', x: 235, y: 290, w: 430, h: 80, lines: ['阈值过滤并编号', '保留 score ≥ min_score → 副本 id 改为 E1…'] },
            { id: 'only', x: 310, y: 415, w: 280, h: 120, kind: 'decision', lines: ['retrieval_only', '为真？'] },
            { id: 'retrieval-return', x: 40, y: 590, w: 300, h: 90, kind: 'terminal', lines: ['返回检索结果', 'answer=null，evidence 可为空', '不调用 chat'] },
            { id: 'empty', x: 530, y: 570, w: 280, h: 120, kind: 'decision', lines: ['evidence', '为空？'] },
            { id: 'refuse', x: 390, y: 755, w: 250, h: 100, kind: 'terminal', lines: ['返回固定拒答', '「没有足够证据回答。」', 'evidence=[]；不调用 chat'] },
            { id: 'prompt', x: 660, y: 755, w: 220, h: 85, lines: ['拼 context + prompt', '编号、来源、正文、问题'] },
            { id: 'chat', x: 660, y: 885, w: 220, h: 85, lines: ['client.chat()', '/chat/completions，stream=False'] },
            { id: 'answer', x: 660, y: 1010, w: 220, h: 60, kind: 'terminal', lines: ['返回结果', 'answer + evidence'] },
            { id: 'end', x: 290, y: 1135, w: 320, h: 48, kind: 'terminal', lines: ['回到 main()，打印 JSON，结束'] },
        ],
        edges: [
            { from: 'load', to: 'retrieve', path: 'M450 100 V145' },
            { from: 'retrieve', to: 'filter', path: 'M450 245 V290' },
            { from: 'filter', to: 'only', path: 'M450 370 V415' },
            { from: 'only', to: 'retrieval-return', path: 'M310 475 H190 V590', label: '是：只检索', x: 190, y: 545 },
            { from: 'only', to: 'empty', path: 'M590 475 H670 V570', label: '否：普通问答', x: 744, y: 525 },
            { from: 'empty', to: 'refuse', path: 'M530 630 H480 V715 H515 V755', label: '是', x: 452, y: 705 },
            { from: 'empty', to: 'prompt', path: 'M810 630 H850 V715 H770 V755', label: '否', x: 828, y: 705 },
            { from: 'prompt', to: 'chat', path: 'M770 840 V885' },
            { from: 'chat', to: 'answer', path: 'M770 970 V1010' },
            { from: 'retrieval-return', to: 'end', path: 'M190 680 V1159 H290' },
            { from: 'refuse', to: 'end', path: 'M515 855 V1100 H450 V1135' },
            { from: 'answer', to: 'end', path: 'M770 1070 V1159 H610' },
        ],
        note: '按箭头顺序，先判断 retrieval_only，再判断空证据。只检索仍会调用 embed，空索引也会先计算问题向量。异常不是拒答：文件、网络、JSON 或维度错误会向外抛出，当前 main() 没有统一捕获。',
    },
}
const diagram = computed(() => diagrams[props.mode])
function diamond(node: Node): string {
    return `${node.x + node.w / 2},${node.y} ${node.x + node.w},${node.y + node.h / 2} ${node.x + node.w / 2},${node.y + node.h} ${node.x},${node.y + node.h / 2}`
}
</script>

<template>
    <figure class="demo-flow" :aria-label="diagram.title">
        <header class="demo-flow__heading"><strong>{{ diagram.title }}</strong><span>沿箭头阅读 · 菱形为判断 · 圆角为开始 / 返回 / 结束</span></header>
        <div class="demo-flow__canvas" tabindex="0" role="region" :aria-label="`${diagram.title}，窄屏可左右滚动查看`">
            <svg :viewBox="`0 0 900 ${diagram.height}`" role="img" :aria-label="diagram.title">
                <title>{{ diagram.title }}</title>
                <desc>{{ diagram.description }}</desc>
                <defs><marker :id="markerId" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M1 1 L9 5 L1 9 Z" class="demo-flow__arrowhead" /></marker></defs>
                <g v-for="edge in diagram.edges" :key="`${edge.from}-${edge.to}`" class="demo-flow__edge" :data-from="edge.from" :data-to="edge.to">
                    <path :d="edge.path" :marker-end="`url(#${markerId})`" />
                    <text v-if="edge.label" :x="edge.x" :y="edge.y">{{ edge.label }}</text>
                </g>
                <g v-for="node in diagram.nodes" :key="node.id" :data-node="node.id" class="demo-flow__node">
                    <title>{{ node.lines.join('；') }}</title>
                    <polygon v-if="node.kind === 'decision'" :points="diamond(node)" />
                    <rect v-else :x="node.x" :y="node.y" :width="node.w" :height="node.h" :rx="node.kind === 'terminal' ? 24 : 5" />
                    <text :x="node.x + node.w / 2" :y="node.y + node.h / 2 - (node.lines.length - 1) * 14 + 6">
                        <tspan v-for="(line, index) in node.lines" :key="index" :x="node.x + node.w / 2" :dy="index ? 28 : 0" :class="{ 'demo-flow__detail': index > 0 }">{{ line }}</tspan>
                    </text>
                </g>
            </svg>
        </div>
        <figcaption>{{ diagram.note }}</figcaption>
        <details class="demo-flow__text"><summary>文字版流程（方便复制与辅助阅读）</summary><p>{{ diagram.description }}</p></details>
    </figure>
</template>

<style scoped>
.demo-flow { margin: 20px 0; padding: 16px; border: 1px solid var(--blog-border); border-radius: 10px; background: var(--blog-panel); color: var(--vp-c-text-1); }
.demo-flow__heading { display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px 16px; font-size: 14px; }
.demo-flow__heading span { font-size: 12px; color: var(--vp-c-text-2); }
.demo-flow__canvas { overflow-x: auto; margin-top: 12px; border-radius: 6px; }
.demo-flow__canvas:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 2px; }
.demo-flow svg { display: block; width: 100%; min-width: 650px; height: auto; }
.demo-flow__edge > path { fill: none; stroke: var(--vp-c-text-2); stroke-width: 2; stroke-linejoin: round; }
.demo-flow__arrowhead { fill: var(--vp-c-text-2); }
.demo-flow__edge text { font-size: 18px; font-weight: 600; fill: var(--vp-c-text-1); stroke: var(--blog-panel); stroke-width: 6px; paint-order: stroke; text-anchor: middle; }
.demo-flow__node rect, .demo-flow__node polygon { fill: var(--blog-panel); stroke: var(--vp-c-text-2); stroke-width: 1.5; }
.demo-flow__node text { text-anchor: middle; fill: var(--vp-c-text-1); font-size: 19px; font-weight: 600; }
.demo-flow__node .demo-flow__detail { fill: var(--vp-c-text-2); font-size: 16px; font-weight: 400; }
.demo-flow figcaption, .demo-flow__text { margin-top: 12px; color: var(--vp-c-text-2); font-size: 12px; line-height: 1.7; }
.demo-flow__text summary { cursor: pointer; }
.demo-flow .demo-flow__text p { margin: 8px 0 0; font-size: 13px; }
@media (forced-colors: active) {
    .demo-flow__node rect, .demo-flow__node polygon { fill: Canvas; stroke: CanvasText; }
    .demo-flow__edge > path { stroke: CanvasText; }
    .demo-flow__arrowhead, .demo-flow__node text, .demo-flow__node .demo-flow__detail, .demo-flow__edge text { fill: CanvasText; }
    .demo-flow__edge text { stroke: Canvas; }
}
</style>
