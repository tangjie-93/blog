import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { createNavigation } from '../docs/.vitepress/navigation.mjs'

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
