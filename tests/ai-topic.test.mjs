import assert from 'node:assert/strict'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import test from 'node:test'
import { parse, compileScript } from 'vue/compiler-sfc'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import ts from 'typescript'
import { createMarkdownRenderer } from 'vitepress'
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

const visualSource = readFileSync(resolve('docs/.vitepress/theme/components/AiVisual.vue'), 'utf8')
const visualDescriptor = parse(visualSource).descriptor
const visualScript = compileScript(visualDescriptor, { id: 'test-ai-visual', inlineTemplate: true })
const visualCode = ts.transpileModule(visualScript.content, {
  compilerOptions: { target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext },
}).outputText.replace(/from ["']vue["']/g, `from ${JSON.stringify(import.meta.resolve('vue'))}`)
const AiVisual = (await import(`data:text/javascript;base64,${Buffer.from(visualCode).toString('base64')}`)).default

for (const kind of ['flow', 'compare', 'layers']) {
  test(`AI instructional diagram renders complete explanations and keyboard controls (${kind})`, async () => {
    const html = await renderToString(createSSRApp(AiVisual, {
      title: '职责示意', kind, caption: '概念示意，不代表性能数据',
      nodes: [{ label: '请求', detail: '模型提出动作' }, { label: '授权', detail: '服务检查身份' }, { label: '结果', detail: '返回真实执行状态' }],
    }))
    assert.equal((html.match(/<button /g) || []).length, 3)
    assert.equal((html.match(/aria-pressed="false"/g) || []).length, 3)
    assert.match(html, /<figure[^>]+aria-labelledby=/)
    assert.match(html, /aria-live="polite"/)
    for (const text of ['模型提出动作', '服务检查身份', '返回真实执行状态', '概念示意，不代表性能数据']) assert.ok(html.includes(text))
    assert.equal((html.match(/class="ai-visual__connector"/g) || []).length, kind === 'flow' ? 2 : 0)
  })
}

test('every main AI article teaches with at least two diagrams and an early visual entry', () => {
  for (const file of readdirSync(root).filter(file => file.endsWith('.md'))) {
    const content = readFileSync(resolve(root, file), 'utf8')
    assert.ok((content.match(/<AiVisual\b/g) || []).length >= 2, `${file}: needs two instructional diagrams`)
    const firstDiagram = content.search(/<Ai(?:Visual|Concept)\b/)
    assert.ok(firstDiagram >= 0 && firstDiagram < 2000, `${file}: first diagram should come before long prose`)
    assert.match(content, /import AiVisual from/)
    assert.ok(existsSync(resolve(root, content.match(/import AiVisual from '([^']+)'/)[1])))
  }
  assert.match(visualSource, /:focus-visible/)
  assert.match(visualSource, /max-width: 640px/)
  assert.doesNotMatch(visualSource, /overflow:\s*hidden/)
})

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

test('AI terminology emphasis renders without raw Markdown delimiters', async () => {
  const markdown = await createMarkdownRenderer(resolve('docs'))
  const content = readFileSync(resolve(root, '15-AI助手与Agent生态术语全景.md'), 'utf8')
  const html = markdown.render(content.replace(/^---\n[\s\S]*?\n---/, ''))
  assert.match(html, /<strong>Assistant \/ Copilot（助手）<\/strong>/)
  assert.match(html, /<strong>Agent（智能体）<\/strong>/)
  assert.doesNotMatch(html, /\*\*(?:Assistant|Agent|Precedence)/)
})

test('AI ecosystem terminology guide covers distinct layers and is discoverable from related pages', () => {
  const file = '15-AI助手与Agent生态术语全景.md'
  const guide = readFileSync(resolve(root, file), 'utf8')
  for (const term of ['Prompt', 'Rule', 'Skill', 'Tool', 'Function Calling', 'MCP', 'Plugin', 'Extension', 'Command', 'Hook', 'Agent', 'Subagent', 'Workflow', 'Harness', 'Runtime', 'Memory', 'RAG', 'Guardrail', 'Eval', 'A2A']) {
    assert.ok(guide.includes(term), `${term} should be explained in the ecosystem guide`)
  }
  assert.match(guide, /未成功获取正文/)
  assert.match(guide, /复制文件可迁移知识，不一定迁移运行能力/)
  for (const entry of ['README.md', '12-Agent扩展生态知识图谱.md']) {
    assert.ok(readFileSync(resolve(root, entry), 'utf8').includes(`./${file}`))
  }
})

test('AI article links, downloadable examples and diagram modes resolve', () => {
  const files = readdirSync(root, { recursive: true }).filter(file => file.endsWith('.md'))
  assert.equal(files.length, 17)
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

