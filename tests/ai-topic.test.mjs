import assert from 'node:assert/strict'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import test from 'node:test'
import { parse, compileScript } from 'vue/compiler-sfc'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import ts from 'typescript'
import { articleRoute, articleSourcePath } from '../docs/.vitepress/articleCategories.mjs'

const root = resolve('docs/articles/人工智能/ai')
const source = readFileSync(resolve('docs/.vitepress/theme/components/AiConcept.vue'), 'utf8')
const { descriptor } = parse(source)
const compiled = compileScript(descriptor, { id: 'test-ai-concept', inlineTemplate: true })
const { outputText } = ts.transpileModule(compiled.content, {
  compilerOptions: { target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext },
})
const code = outputText.replace(/from ["']vue["']/g, `from ${JSON.stringify(import.meta.resolve('vue'))}`)
const AiConcept = (await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)).default
const modes = ['learning', 'training', 'transformer', 'generation', 'embedding', 'rag', 'agent', 'multimodal', 'deployment', 'evaluation', 'ecosystem']

for (const mode of modes) {
  test(`AI concept diagram exposes five keyboard controls and text alternative (${mode})`, async () => {
    const html = await renderToString(createSSRApp(AiConcept, { mode }))
    assert.equal((html.match(/<button /g) || []).length, 5)
    assert.equal((html.match(/aria-pressed="true"/g) || []).length, 1)
    assert.match(html, /aria-live="polite"/)
    assert.match(html, /展开完整文字说明/)
    assert.match(html, /概念示意，非性能数据/)
    const detail = html.match(/id="(ai-detail-[^"]+)"/)[1]
    assert.equal((html.match(new RegExp(`aria-controls="${detail}"`, 'g')) || []).length, 5)
  })
}

test('AI article links, downloadable examples and diagram modes resolve', () => {
  const files = readdirSync(root, { recursive: true }).filter(file => file.endsWith('.md'))
  assert.equal(files.length, 16)
  for (const file of files) {
    const fullPath = resolve(root, file)
    const content = readFileSync(fullPath, 'utf8')
    for (const match of content.matchAll(/\]\(([^)]+)\)/g)) {
      const target = match[1].split('#')[0]
      if (!target || /^(https?:|mailto:)/.test(target)) continue
      const decoded = decodeURIComponent(target)
      const logicalSource = articleRoute(fullPath.slice(resolve('docs').length + 1))
      const logicalTarget = new URL(decoded, `https://blog.local/${logicalSource}`).pathname
      const segments = decodeURIComponent(logicalTarget).replace(/^\//, '').split('/')
      const path = segments[0] === 'articles'
        ? resolve('docs/articles', articleSourcePath(segments[1]), ...segments.slice(2))
        : decoded.startsWith('/') ? resolve('docs/public', decoded.slice(1)) : resolve(dirname(fullPath), decoded)
      assert.ok(existsSync(path), `${file}: missing ${target}`)
    }
    for (const match of content.matchAll(/href="(\/ai-examples\/[^"#]+)"/g)) {
      assert.ok(existsSync(resolve('docs/public', match[1].slice(1))), `${file}: missing download`)
    }
    for (const match of content.matchAll(/import AiConcept from '([^']+)'/g)) {
      assert.ok(existsSync(resolve(dirname(fullPath), match[1])), `${file}: missing component import`)
    }
    for (const match of content.matchAll(/<AiConcept mode="([^"]+)"/g)) {
      assert.ok(modes.includes(match[1]), `${file}: unknown diagram mode ${match[1]}`)
    }
  }
})

