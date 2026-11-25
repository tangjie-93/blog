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
  assert.match(source, /minCardHeight:\s*\(\) => viewMode\.value === 'list' \? 64 : 216/)
  assert.match(source, /maxCardHeight:\s*\(\) => viewMode\.value === 'list' \? 68 : 232/)
  for (const block of ['eyebrow', 'title', 'note', 'meta']) {
    assert.match(source, new RegExp(`\\.blog-list__${block} \\{ flex-shrink: 0;`))
  }
  assert.match(source, /\.blog-list__title-text \{ display: -webkit-box; overflow: hidden;/)
  assert.match(source, /<footer class="blog-list__pagination">[\s\S]*<\/footer>/)
})

test('article summaries and metadata remain readable without tiny narrow-screen overrides', () => {
  assert.match(source, /\.blog-list__title \{ grid-column: 2; font-size: 17px/)
  assert.match(source, /\.blog-list__note \{ grid-column: 2; margin: 0; font-size: 14px/)
  assert.match(source, /\.blog-list__meta time \{ font-size: 13px/)
  assert.doesNotMatch(source, /font-size: 10px/)
})

test('entire article cards and list rows are native links with one keyboard stop', () => {
  assert.match(source, /<a v-for="\(post, index\) in visiblePosts"[^>]+class="blog-list__card"[^>]+:href="withBase\(post.url\)"/)
  assert.match(source, /:aria-label="displayTitle\(post.title\)"/)
  assert.doesNotMatch(source, /<h2 class="blog-list__title"><a/)
  assert.match(source, /&:focus-visible \{ outline: 2px solid var\(--blog-focus-ring\)/)
  for (const [file, pattern] of [
    ['HomePage.vue', /<a v-for="(?:post|\(post,\s*index\)) in recentPosts"[^>]+class="home-page__post"[^>]+:href="withBase\(post\.url\)"/],
    ['Tags.vue', /<a :href="withBase\(post.url\)">/],
    ['components/HomeReadingPaths.vue', /<a v-for="path in paths"[^>]+class="home-reading-paths__card"[^>]+:href=/],
  ]) assert.match(readFileSync(new URL(`../docs/.vitepress/theme/components/${file}`, import.meta.url), 'utf8'), pattern)
})

test('list rows omit navigation arrows and reclaim the title spacing', () => {
  assert.match(source, /<span v-if="viewMode === 'cards'" class="blog-list__arrow" aria-hidden="true">↗<\/span>/)
  const rows = source.slice(source.indexOf('&.blog-list--rows {'))
  assert.match(rows, /\.blog-list__title-text \{ display: block; padding-right: 0;/)
})

test('all-articles toolbar balances a short description with the view switch', () => {
  assert.match(source, /<p v-if="!props.group" class="blog-list__description">记录前端、AI 与工程实践，让零散知识沉淀为可复用的经验。<\/p>/)
  assert.match(source, /\.blog-list__view-toolbar \{ display: flex; align-items: center; justify-content: space-between/)
  assert.match(source, /\.blog-list__description \{ margin: 0; color: var\(--vp-c-text-2\); font-size: 14px/)
})

test('article view switches between cards and rows with safe persisted preferences', () => {
  assert.deepEqual(parse(source).errors, [])
  assert.match(source, /role="group" aria-label="文章展示形式"/)
  for (const mode of ['cards', 'list']) {
    assert.ok(source.includes(`:aria-pressed="viewMode === '${mode}'"`))
    assert.ok(source.includes(`@click="setViewMode('${mode}')"`))
  }
  assert.match(source, /ref<ViewMode>\('cards'\)/)
  assert.match(source, /localStorage\.getItem\(viewStorageKey\) === 'list'/)
  assert.match(source, /try \{ localStorage\.setItem\(viewStorageKey, mode\) \} catch/)
  assert.match(source, /viewMode\.value = mode\s+page\.value = 1/)
  assert.match(source, /minCardWidth: \(\) => viewMode\.value === 'list' \? Number\.MAX_SAFE_INTEGER : 300/)
  assert.match(source, /&\.blog-list--rows[\s\S]*grid-template-columns: 1fr/)
})

test('article topics and resources use the same toolbar as the view switch', () => {
  assert.deepEqual(parse(library).errors, [])
  const toolbar = library.indexOf('<template v-if="activeGroup" #toolbar>')
  assert.match(source, /class="blog-list__view-toolbar">\s*<slot name="toolbar">[\s\S]*?<\/slot>\s*<div class="blog-list__view-switch"/)
  assert.ok(library.indexOf('<BlogList') < toolbar)
  const topics = library.indexOf('class="library-topics"', toolbar)
  const resources = library.indexOf('class="library-resources"', topics)
  const toolbarEnd = library.indexOf('</template>', resources)
  assert.ok(toolbar > -1 && topics > toolbar && resources > topics && toolbarEnd > resources)
  assert.match(library, /:title="resource.description"/)
  assert.match(library, /margin-left: auto/)
  assert.ok(!library.includes('<strong>{{ resource.text }}</strong>'))
})
