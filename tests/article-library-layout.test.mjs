import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const source = readFileSync(new URL('../docs/.vitepress/theme/components/ArticleLibrary.vue', import.meta.url), 'utf8')

test('article library avoids a duplicate heading strip while retaining accessible category context', () => {
  assert.ok(!source.includes('library-heading'))
  assert.ok(!source.includes('图谱浏览'))
  assert.ok(!source.includes('topicHome'))
  assert.match(source, /:aria-label="`\$\{title\} · 文章浏览`"/)
  assert.match(source, /aria-label="选择文章大类"/)
  for (const group of ['languages', 'engineering', 'ai', 'backend', 'graphics', 'source', 'indie']) {
    assert.match(source, new RegExp(`\\b${group}: '`), `${group} needs a distinct icon`)
  }
  assert.match(source, /:d="groupIcons\[group.id\]"/)
  assert.match(source, /class="library-group-icon"[^>]+aria-hidden="true"/)
  assert.match(source, /aria-label="选择具体专题"/)
  assert.match(source, /<BlogList fit-screen :group="selectedGroup" :category="selectedCategory"/)
})

test('each topic offers an independent homepage link using real configured navigation', () => {
  assert.match(source, /function categoryHome\(category: string\): string/)
  assert.match(source, /theme\.value\.sidebar/)
  assert.match(source, /class="library-topic__home" :href="withBase\(categoryHome\(category\)\)"/)
  assert.match(source, /:aria-label="`\$\{categoryLabels\[category\] \|\| category\} 专题首页`"/)
  assert.match(source, /@click="select\(selectedGroup, category\)"/)
})
