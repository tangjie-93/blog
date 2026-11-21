import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { parse } = require('vue/compiler-sfc')
const source = readFileSync(new URL('../docs/.vitepress/theme/components/BlogList.vue', import.meta.url), 'utf8')
const library = readFileSync(new URL('../docs/.vitepress/theme/components/ArticleLibrary.vue', import.meta.url), 'utf8')

test('article cards keep full text line heights rather than shrinking title and summary', () => {
  assert.deepEqual(parse(source).errors, [])
  assert.match(source, /minCardHeight:\s*216/)
  for (const block of ['eyebrow', 'title', 'note', 'meta']) {
    assert.match(source, new RegExp(`\\.blog-list__${block} \\{ flex-shrink: 0;`))
  }
  assert.match(source, /\.blog-list__title a \{ display: -webkit-box; overflow: hidden;/)
  assert.match(source, /<footer class="blog-list__pagination">[\s\S]*<\/footer>/)
})

test('resource links share the topic toolbar instead of occupying a full-width banner', () => {
  assert.deepEqual(parse(library).errors, [])
  const toolbar = library.indexOf('class="library-toolbar"')
  const topics = library.indexOf('class="library-topics"', toolbar)
  const resources = library.indexOf('class="library-resources"', topics)
  const list = library.indexOf('<BlogList', resources)
  assert.ok(toolbar > -1 && topics > toolbar && resources > topics && list > resources)
  assert.match(library, /:title="resource.description"/)
  assert.match(library, /margin-left: auto/)
  assert.ok(!library.includes('<strong>{{ resource.text }}</strong>'))
})
