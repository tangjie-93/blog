import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { createNavigation } from '../docs/.vitepress/navigation.mjs'
import { postCategory } from '../docs/.vitepress/articleTaxonomy.mjs'
import { articleGroups, articleRoute, articleSourcePath, rewriteArticlePath, discoverArticleCategories } from '../docs/.vitepress/articleCategories.mjs'

test('article filters classify logical routes without confusing nested examples or encoded topics', () => {
  assert.equal(postCategory('/articles/rag/examples/data/hr-policy.html'), 'rag')
  assert.equal(postCategory('/articles/%E7%AE%97%E6%B3%95/排序算法.html'), '算法')
  assert.equal(postCategory('/skills/'), '')
})

test('AI toolbox belongs to AI and the global header stays compact', () => {
  const ai = articleGroups.find(group => group.id === 'ai')
  assert.deepEqual(ai.categories, ['ai', 'agent', 'agent-projects', 'rag', 'jev'])
  assert.deepEqual(ai.resources.map(resource => resource.link), ['/skills/'])
  assert.equal(articleGroups.length, 6)
  assert.equal(articleSourcePath('rag'), '人工智能/rag')
  const config = readFileSync(new URL('../docs/.vitepress/config.mts', import.meta.url), 'utf8')
  const nav = config.slice(config.indexOf('    nav: ['), config.indexOf('    sidebar,'))
  assert.match(nav, /text: '标签', link: '\/tags\/'/)
  assert.match(nav, /text: '留言板', link: '\/comments\/'/)
  assert.ok(!nav.includes("text: '更多'"))
  assert.ok(!nav.includes('充电站'))
  assert.ok(!nav.includes('/summarize/'))
  for (const label of ['语言与标准', '框架与工程', 'AI 工具箱']) assert.ok(!nav.includes(`text: '${label}'`))
})

test('grouped article sources keep legacy routes, nested paths and README indexes', () => {
  assert.equal(rewriteArticlePath('articles/人工智能/rag/README.md'), 'articles/rag/index.md')
  assert.equal(rewriteArticlePath('articles/语言与标准/javascript/中文 & 示例.md'), 'articles/javascript/中文 & 示例.md')
  assert.equal(rewriteArticlePath('articles/人工智能/ai/examples/README.md'), 'articles/ai/examples/index.md')
  assert.equal(articleRoute('articles/人工智能/ai/examples/demo.py'), 'articles/ai/examples/demo.py')
  assert.equal(articleRoute('articles/ai/README.html'), 'articles/ai/README.html')
  assert.equal(articleSourcePath('ai'), '人工智能/ai')
  assert.equal(rewriteArticlePath('skills/README.md'), 'skills/index.md')
  const categories = articleGroups.flatMap(group => group.categories)
  assert.equal(categories.length, new Set(categories).size, 'each topic belongs to exactly one group')
})

test('grouped physical directories produce unchanged navigation and sidebar URLs', () => {
  const root = mkdtempSync(join(tmpdir(), 'blog-nav-'))
  try {
    mkdirSync(join(root, '人工智能/rag'), { recursive: true })
    writeFileSync(join(root, '人工智能/rag/README.md'), '# RAG')
    writeFileSync(join(root, '人工智能/rag/01-中文 入门.md'), '# 入门')
    const { nav, sidebar } = createNavigation(root)
    assert.deepEqual(nav, [{ text: 'RAG', link: '/articles/rag/' }])
    assert.equal(sidebar['/articles/rag/'][0].items[0].link, '/articles/rag/01-%E4%B8%AD%E6%96%87%20%E5%85%A5%E9%97%A8.html')
    assert.equal(sidebar['/articles/人工智能/'], undefined)
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('unknown grouped topics and duplicate legacy routes fail explicitly', () => {
  const root = mkdtempSync(join(tmpdir(), 'blog-nav-'))
  try {
    mkdirSync(join(root, '人工智能/new-topic'), { recursive: true })
    assert.throws(() => discoverArticleCategories(root), /未登记的专题/)
    rmSync(join(root, '人工智能/new-topic'), { recursive: true })
    mkdirSync(join(root, '人工智能/rag'))
    mkdirSync(join(root, 'rag'))
    assert.throws(() => discoverArticleCategories(root), /重复专题目录/)
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('category navigation preserves index and encoded article URLs in natural order', () => {
  const root = mkdtempSync(join(tmpdir(), 'blog-nav-'))
  try {
    mkdirSync(join(root, 'vue'))
    for (const name of ['README.md', '10、响应式.md', '2、this & that.md', 'note.txt']) {
      writeFileSync(join(root, 'vue', name), '# Article')
    }
    const { nav, sidebar } = createNavigation(root)
    assert.deepEqual(nav, [{ text: 'Vue', link: '/articles/vue/' }])
    const group = sidebar['/articles/vue/'][0]
    assert.equal(group.text, 'Vue 专题')
    assert.equal(group.link, '/articles/vue/')
    const items = group.items
    assert.deepEqual(items.map(item => item.link), [
      '/articles/vue/2%E3%80%81this%20%26%20that.html',
      '/articles/vue/10%E3%80%81%E5%93%8D%E5%BA%94%E5%BC%8F.html'
    ])
    assert.deepEqual(items.map(item => item.text), ['1、this & that', '2、响应式'])
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('categories without README link to their first real article', () => {
  const root = mkdtempSync(join(tmpdir(), 'blog-nav-'))
  try {
    mkdirSync(join(root, 'jquery-source-analysis'))
    writeFileSync(join(root, 'jquery-source-analysis', 'READEME.md'), '# jQuery')
    const { nav, sidebar } = createNavigation(root)
    assert.equal(nav[0].link, '/articles/jquery-source-analysis/READEME.html')
    assert.equal(sidebar['/articles/jquery-source-analysis/'][0].link, undefined)
    assert.equal(sidebar['/articles/jquery-source-analysis/'][0].items[0].text, '1、READEME')
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('sidebar removes numeric prefixes from English slugs', () => {
  const root = mkdtempSync(join(tmpdir(), 'blog-nav-'))
  try {
    mkdirSync(join(root, 'langchain'))
    writeFileSync(join(root, 'langchain', 'README.md'), '# LangChain')
    writeFileSync(join(root, 'langchain', '05-agent-and-tools.md'), '# Agent')
    const { sidebar } = createNavigation(root)
    assert.equal(sidebar['/articles/langchain/'][0].items[0].text, '1、agent-and-tools')
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('Chinese categories match source paths while navigation links remain URL encoded', () => {
  const root = mkdtempSync(join(tmpdir(), 'blog-nav-'))
  try {
    for (const category of ['其他', '算法']) {
      mkdirSync(join(root, category))
      for (const file of ['README.md', '1、入门 & 实践.md', '数据结构之堆.md']) {
        writeFileSync(join(root, category, file), '# Article')
      }
    }
    const { nav, sidebar } = createNavigation(root)
    for (const category of ['其他', '算法']) {
      const group = sidebar[`/articles/${category}/`]?.[0]
      assert.ok(group, `${category} must have a sidebar matching its source path`)
      assert.equal(group.text, `${category} 专题`)
      assert.deepEqual(group.items.map(item => item.text), ['1、入门 & 实践', '2、数据结构之堆'])
      const link = `/articles/${encodeURIComponent(category)}/`
      assert.equal(group.link, link)
      assert.equal(nav.find(item => item.text === category).link, link)
      assert.deepEqual(group.items.map(item => item.link), [
        `${link}${encodeURIComponent('1、入门 & 实践')}.html`, `${link}${encodeURIComponent('数据结构之堆')}.html`
      ])
    }
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('sidebar omits subtitles while preserving complete article URLs', () => {
  const root = mkdtempSync(join(tmpdir(), 'blog-nav-'))
  try {
    mkdirSync(join(root, 'agent'))
    const names = ['01、Hooks — 挂在循环上.md', '02、Task System——目标太大.md']
    for (const name of names) writeFileSync(join(root, 'agent', name), '# Article')
    const items = createNavigation(root).sidebar['/articles/agent/'].find(group => group.text === '基础与工具').items
    assert.deepEqual(items.map(item => item.text), ['1、Hooks', '2、Task System'])
    assert.deepEqual(items.map(item => item.link), names.map(name => `/articles/agent/${encodeURIComponent(name.slice(0, -3))}.html`))
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('agent sidebar numbers each topic group independently', () => {
  const root = mkdtempSync(join(tmpdir(), 'blog-nav-'))
  try {
    mkdirSync(join(root, 'agent'))
    for (const name of ['01、Loop.md', '02、Tools.md', '21、Patterns.md', '03、Permission.md']) {
      writeFileSync(join(root, 'agent', name), '# Article')
    }
    const { sidebar } = createNavigation(root)
    const groups = sidebar['/articles/agent/']
    assert.deepEqual(groups.find(group => group.text === '基础与工具').items.map(item => item.text), [
      '1、Loop', '2、Tools', '3、Patterns'
    ])
    assert.deepEqual(groups.find(group => group.text === '安全与运行时').items.map(item => item.text), [
      '1、Permission'
    ])
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
