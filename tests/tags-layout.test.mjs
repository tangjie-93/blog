import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const source = readFileSync(new URL('../docs/.vitepress/theme/components/Tags.vue', import.meta.url), 'utf8')

test('sci-fi tag index keeps searchable groups and article results instead of decorative dashboards', () => {
  assert.match(source, /aria-label="搜索标签"/)
  assert.match(source, /v-for="group in visibleGroups"/)
  assert.match(source, /v-for="tag in group.entries"/)
  assert.match(source, /aria-label="标签相关文章"/)
  assert.match(source, /class="tag-index__core" aria-hidden="true"/)
  assert.match(source, /class="tag-index__tag-mark" aria-hidden="true"/)
})

test('tag layout uses desktop width and compact short-screen spacing without disabling document scroll', () => {
  assert.match(source, /max-width:\s*1680px/)
  assert.match(source, /@media \(min-width: 900px\) and \(max-height: 850px\)/)
  assert.ok(!/overflow(?:-y)?:\s*(?:hidden|clip)/.test(source.replace(/overflow: hidden;/, '')), 'only the decorative panel may clip its background')
  assert.ok(!/height:\s*100(?:d?vh|%)/.test(source))
  assert.match(source, /prefers-reduced-motion: reduce[\s\S]*?i:nth-child\(2\)\s*\{\s*animation: none/)
})
