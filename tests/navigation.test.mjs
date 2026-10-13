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
    const items = sidebar['/articles/vue/'][0].items
    assert.deepEqual(items.map(item => item.link), [
      '/articles/vue/',
      '/articles/vue/2%E3%80%81this%20%26%20that.html',
      '/articles/vue/10%E3%80%81%E5%93%8D%E5%BA%94%E5%BC%8F.html'
    ])
    assert.equal(items[0].text, '专题首页')
    assert.equal(items[1].text, '2、this & that')
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('categories without README link to their first real article', () => {
  const root = mkdtempSync(join(tmpdir(), 'blog-nav-'))
  try {
    mkdirSync(join(root, 'jquery-source-analysis'))
    writeFileSync(join(root, 'jquery-source-analysis', 'READEME.md'), '# jQuery')
    const { nav } = createNavigation(root)
    assert.equal(nav[0].link, '/articles/jquery-source-analysis/READEME.html')
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
