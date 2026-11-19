import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { parse, compileScript } from 'vue/compiler-sfc'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import ts from 'typescript'

async function loadComponent(name) {
  const source = readFileSync(new URL(`../docs/.vitepress/theme/components/${name}.vue`, import.meta.url), 'utf8')
  const { descriptor } = parse(source)
  const compiled = compileScript(descriptor, { id: `test-${name}`, inlineTemplate: true })
  const { outputText } = ts.transpileModule(compiled.content, {
    compilerOptions: { target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext },
  })
  const moduleCode = outputText.replace(/from ["']vue["']/g, `from ${JSON.stringify(import.meta.resolve('vue'))}`)
  return (await import(`data:text/javascript;base64,${Buffer.from(moduleCode).toString('base64')}`)).default
}

const RagFlow = await loadComponent('RagFlow')
const RagDemoFlow = await loadComponent('RagDemoFlow')
const IngestStateFlow = await loadComponent('IngestStateFlow')
const EmbeddingDimensions = await loadComponent('EmbeddingDimensions')
const RetrievalFusion = await loadComponent('RetrievalFusion')
const RagConcept = await loadComponent('RagConcept')
const RetrievalMetrics = await loadComponent('RetrievalMetrics')
const VectorIndexDemo = await loadComponent('VectorIndexDemo')

for (const mode of ['contract', 'context', 'citation', 'finalize', 'lifecycle', 'diagnose']) {
  test(`compact RAG diagram renders meaningful accessible content (${mode})`, async () => {
    const html = await renderToString(createSSRApp(RagConcept, { mode }))
    assert.match(html, /<svg[^>]+role="img"/)
    assert.match(html, /<desc id=/)
    const expected = {
      contract: ['hr-v2-c003', '工作日加班', 'E1 仅本轮有效'],
      context: ['token 表示', '按块池化', '原文与定位坐标独立保留'],
      citation: ['600 元有原文依据', '点击来源仍要鉴权', '第 2 关'],
      finalize: ['pending = 2', '重试途中不结算', '剩余 2 个'],
      lifecycle: ['查询入口 current', '当前提供查询', '保留旧索引 ≠'],
      diagnose: ['C17 排第 12', 'C17 消失', '上下文预算不足'],
    }
    for (const text of expected[mode]) assert.ok(html.includes(text), `missing ${text}`)
    assert.ok(html.replace(/<[^>]+>/g, '').length < 1100, 'avoid long text walls')
  })
}

test('retrieval metric example has a correct denominator and distinguishes RR from MRR', async () => {
  const html = await renderToString(createSSRApp(RetrievalMetrics))
  assert.match(html, /Recall@3 = 1\/2 = 0.5/)
  assert.match(html, /单题倒数排名 = 1\/2 = 0.5/)
  assert.match(html, /多题倒数排名取平均才叫 MRR/)
  assert.match(html, /把 A 移到第 1 位/)
})

test('index routes are illustrative, not measured ANN performance', async () => {
  const html = await renderToString(createSSRApp(VectorIndexDemo))
  assert.match(html, /aria-pressed="true">HNSW：沿图找/)
  assert.match(html, /不是实际算法运行结果/)
  assert.match(html, /近似搜索可能漏掉/)
  assert.match(html, /只画一层示意/)
  assert.match(html, /<svg[^>]+role="img"/)
})

test('retrieval fusion shows deduplication, RRF arithmetic and joint reranker inputs', async () => {
  const html = await renderToString(createSSRApp(RetrievalFusion))
  assert.match(html, /\[A, B\] \+ \[B, C\]/)
  assert.match(html, /B 只留一份，合成 3 条/)
  assert.match(html, /B = 1\/\(60\+2\) \+ 1\/\(60\+1\)/)
  const ids = [...html.matchAll(/data-id="([ABC])"/g)].map(match => match[1])
  assert.deepEqual(ids, ['B', 'A', 'C', 'B', 'A', 'C'])
  for (const score of ['0.0325', '0.0164', '0.0161', '0.95', '0.18', '0.08']) assert.ok(html.includes(score))
  for (const label of ['分词、拼接', '联合编码', '评分层', '调整模型权重', '不是各算一个向量再比距离']) assert.ok(html.includes(label))
  assert.match(html, /不是判断真假/)
  assert.match(html, /示意，不是正确概率/)
  assert.match(html, /住宿报销需提交发票，由主管审批/)
  assert.match(html, /出差住宿报销上限为每晚 600 元/)
})

test('embedding dimensions renders diagrams, correct storage and accessible controls', async () => {
  const html = await renderToString(createSSRApp(EmbeddingDimensions))
  assert.equal((html.match(/class="ev-panel/g) || []).length, 2)
  assert.match(html, /<svg[^>]+role="img"/)
  assert.match(html, /不是真实模型输出/)
  assert.match(html, /aria-pressed="true">768 维/)
  assert.match(html, /= 768 个数字/)
  assert.equal((html.match(/class="is-filled"/g) || []).length, 8)
  for (const size of ['1.54 GB', '3.07 GB', '6.14 GB']) assert.ok(html.includes(size))
  for (const bytes of ['1,536,000,000', '3,072,000,000', '6,144,000,000']) assert.ok(html.includes(bytes))
  assert.match(html, /数据表/)
  assert.match(html, /tabindex="0"[^>]+aria-label="768 维，3.07 GB/)
  assert.match(html, /兼容模型、版本、维度和处理规则/)
  assert.match(html, /按模型说明或统一降维方法处理/)
  assert.match(html, /别随手删数字/)
  assert.ok(html.replace(/<[^>]+>/g, '').length < 1200, 'keep the explanation compact, including accessible text')
  const secondHtml = await renderToString(createSSRApp({ render: () => [h(EmbeddingDimensions), h(EmbeddingDimensions)] }))
  const ids = [...secondHtml.matchAll(/\bid="([^"]+)"/g)].map(match => match[1])
  assert.equal(ids.length, new Set(ids).size, 'multiple instances have unique SVG and input IDs')
})

for (const mode of ['entry', 'ingest', 'ask']) {
  test(`demo flow renders actual function order and labeled branches (${mode})`, async () => {
    const html = await renderToString(createSSRApp(RagDemoFlow, { mode }))
    assert.match(html, /<figure[^>]+aria-label=/)
    assert.match(html, /<svg[^>]+role="img"/)
    assert.match(html, /<polygon/)
    assert.match(html, /marker-end="url\(#demo-arrow-/)
    const nodes = [...html.matchAll(/data-node="([^"]+)"/g)].map(match => match[1])
    const edges = [...html.matchAll(/data-from="([^"]+)" data-to="([^"]+)"/g)].map(match => [match[1], match[2]])
    for (const [from, to] of edges) {
      assert.ok(nodes.includes(from), `missing source ${from}`)
      assert.ok(nodes.includes(to), `missing target ${to}`)
    }
    const reachable = new Set([nodes[0]])
    for (let i = 0; i < nodes.length; i++) {
      for (const [from, to] of edges) if (reachable.has(from)) reachable.add(to)
    }
    assert.equal(reachable.size, nodes.length, 'all nodes are connected to the entry')
    const hasEdge = (from, to) => edges.some(edge => edge[0] === from && edge[1] === to)
    if (mode === 'entry') {
      assert.ok(hasEdge('command', 'ingest'))
      assert.ok(hasEdge('command', 'load'))
      assert.ok(hasEdge('load', 'ask'))
      assert.ok(hasEdge('print-json', 'end'))
    } else if (mode === 'ingest') {
      assert.ok(hasEdge('embed', 'more'), 'embedding has a loop-back arrow')
      assert.ok(hasEdge('valid', 'error'))
      assert.ok(hasEdge('valid', 'write'))
      assert.match(html, /dimension=0、chunks=\[\]/)
    } else {
      assert.ok(hasEdge('only', 'retrieval-return'))
      assert.ok(hasEdge('only', 'empty'))
      assert.ok(hasEdge('empty', 'refuse'))
      assert.ok(hasEdge('empty', 'prompt'))
      assert.match(html, /answer=null/)
      assert.match(html, /没有足够证据回答/)
      assert.match(html, /stream=False/)
      assert.match(html, /异常不是拒答/)
    }
  })
}

test('ingest state flow renders every state and transition', async () => {
  const html = await renderToString(createSSRApp(IngestStateFlow))
  assert.match(html, /<figure[^>]+aria-label=/)
  assert.match(html, /<svg[^>]+role="img"/)
  assert.match(html, /marker-end="url\(#state-arrow-/)
  const nodes = [...html.matchAll(/data-node="([^"]+)"/g)].map(match => match[1])
  const edges = [...html.matchAll(/data-from="([^"]+)" data-to="([^"]+)"/g)].map(match => [match[1], match[2]])
  assert.equal(nodes[0], 'pending')
  for (const [from, to] of edges) {
    assert.ok(nodes.includes(from), `missing source ${from}`)
    assert.ok(nodes.includes(to), `missing target ${to}`)
  }
  const reachable = new Set([nodes[0]])
  for (let i = 0; i < nodes.length; i++) {
    for (const [from, to] of edges) if (reachable.has(from)) reachable.add(to)
  }
  assert.equal(reachable.size, nodes.length, 'all states are connected to pending')
  const hasEdge = (from, to) => edges.some(edge => edge[0] === from && edge[1] === to)
  assert.ok(hasEdge('pending', 'processing'))
  assert.ok(hasEdge('finalizing', 'completed'))
  for (const stage of ['processing', 'indexing', 'finalizing']) assert.ok(hasEdge(stage, 'failed'))
  for (const stage of ['processing', 'indexing']) assert.ok(hasEdge(stage, 'cancelled'))
  assert.ok(hasEdge('completed', 'deleting'))
  assert.ok(hasEdge('failed', 'deleting'))
  assert.ok(hasEdge('deleting', 'deleted'))
  assert.match(html, /cancelled 与 deleted 是终态/)
  assert.match(html, /不会自己回到 pending/)
})

for (const detailed of [false, true]) {
  test(`RAG flow renders ordered, accessible lanes on the server (detailed=${detailed})`, async () => {
    const html = await renderToString(createSSRApp(RagFlow, { detailed }))
    assert.equal((html.match(/<ol\b/g) || []).length, 2)
    assert.equal((html.match(/<li\b/g) || []).length, 10)
    assert.match(html, /离线摄取流程/)
    assert.match(html, /在线问答流程/)
    assert.match(html, /离线写入 ↓ 在线召回时读取/)
    assert.match(html, /引用 \/ 拒答/)
    assert.match(html, detailed ? /检查权限 → 理解 \/ 改写/ : /理解 \/ 改写问题/)
    assert.ok(html.indexOf('向量化与索引') < html.indexOf('持久化索引'))
    assert.ok(html.indexOf('持久化索引') < html.indexOf('从索引取候选片段'))
  })
}
