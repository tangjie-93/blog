import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { parse, compileScript } from 'vue/compiler-sfc'
import { createSSRApp } from 'vue'
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
