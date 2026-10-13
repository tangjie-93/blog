import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { test } from 'node:test'
import { createMarkdownRenderer } from 'vitepress'

test('every article exposes an anchored section for the default outline', async () => {
  const root = resolve('docs/articles')
  const markdown = await createMarkdownRenderer(resolve('docs'))
  const articles = readdirSync(root, { recursive: true }).filter(file => file.endsWith('.md'))
  const missing = []
  for (const file of articles) {
    const source = readFileSync(resolve(root, file), 'utf8')
      .replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, '')
    const tokens = markdown.parse(source, {})
    if (!tokens.some(token => token.type === 'heading_open' &&
      ['h2', 'h3'].includes(token.tag) && token.attrGet('id'))) missing.push(file)
  }
  assert.ok(articles.length > 0)
  assert.deepEqual(missing, [], 'Articles need Markdown ##/### sections with anchors')
})
