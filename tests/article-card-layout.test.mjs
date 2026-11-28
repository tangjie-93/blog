import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { parse } = require('vue/compiler-sfc')
const source = readFileSync(new URL('../docs/.vitepress/theme/components/BlogList.vue', import.meta.url), 'utf8')
const library = readFileSync(new URL('../docs/.vitepress/theme/components/ArticleLibrary.vue', import.meta.url), 'utf8')
const dates = readFileSync(new URL('../docs/.vitepress/theme/components/ArticleDates.vue', import.meta.url), 'utf8')

test('article cards keep full text line heights rather than shrinking title and summary', () => {
  assert.deepEqual(parse(source).errors, [])
  assert.match(source, /minCardHeight:\s*\(\) => viewMode\.value === 'list' \? 60 : 140/)
  assert.match(source, /maxCardHeight:\s*\(\) => viewMode\.value === 'list' \? 64 : undefined/)
  assert.match(source, /maxRows: \(\) => viewMode\.value === 'list' \? Number\.POSITIVE_INFINITY : 4/)
  assert.match(source, /\.blog-list__note \{ display: block; flex: 1; min-height: 0;/)
  assert.match(source, /-webkit-line-clamp: var\(--blog-summary-lines, 3\)/)
  assert.match(source, /\.blog-list__grid \{ grid-auto-rows: 1fr; align-items: stretch; \}/)
  assert.match(source, /\.blog-list__meta \{ margin-top: auto; padding-top: 3px; gap: 3px; font-size: 11px; \}/)
  assert.match(source, /\.blog-list__meta \.article-dates \{ justify-content: space-between; \}/)
  assert.match(source, /\.blog-list__title-text \{ display: -webkit-box; overflow: hidden;/)
})

test('article summaries and metadata remain readable without tiny narrow-screen overrides', () => {
  assert.match(source, /\.blog-list__title \{ grid-column: 2; font-size: 17px/)
  assert.match(source, /\.blog-list__note \{ grid-column: 2; margin: 0; font-size: 14px/)
  assert.match(dates, /font-size: 12px/)
  assert.match(dates, /& time \{[^}]*font-variant-numeric: tabular-nums/)
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

test('article toolbar pairs the active title and result count with time and view controls', () => {
  const template = parse(source).descriptor.template.content
  const toolbar = template.slice(template.indexOf('class="blog-list__view-toolbar"'), template.indexOf('ref="gridViewport"'))
  assert.match(toolbar, /<h1>\{\{ props.title \|\| '全部文章' \}\}<\/h1><span>\{\{ filteredPosts.length \}\} 篇<\/span>/)
  assert.match(toolbar, /class="blog-list__view-controls"[\s\S]*v-model="selectedYear"[^>]+aria-label="筛选创建年份"/)
  assert.match(toolbar, /<template #header><span class="blog-list__year-hint">按创建日期统计<\/span><\/template>/)
  assert.match(toolbar, /v-model="dateOrder"[^>]+aria-label="按创建日期排序"/)
  assert.match(toolbar, /class="blog-list__view-switch"/)
})

test('pagination follows the natural-height grid inside the measured viewport', () => {
  assert.match(source, /ref="gridViewport"[\s\S]*class="blog-list__grid"[\s\S]*<footer ref="pagination" class="blog-list__pagination"/)
  assert.match(source, /\.blog-list__grid \{ flex: none; gap: 8px; \}/)
  assert.match(source, /\.blog-list__pagination \{ flex-shrink: 0; margin-top: auto; \}/)
  assert.match(source, /footer: pagination/)
})

test('fitted cards reserve room for both dates below a single tag row', () => {
  assert.match(source, /\.blog-list__tags \{ flex-wrap: nowrap; overflow: hidden; \}/)
  assert.match(source, /\.blog-list__meta \.article-dates \{ width: 100%; justify-content: flex-end;/)
  assert.match(dates, /\.article-dates \{\s*display: flex;\s*flex-wrap: wrap;/)
  assert.doesNotMatch(source, /\.article-dates \{[^}]*flex-direction: column/)
  assert.match(source, /<ArticleDates :post="post" \/>/)
  assert.deepEqual(parse(dates).errors, [])
  assert.match(dates, /创建 <time[^>]+:datetime="post.dateTime \|\| post.date"/)
  assert.match(dates, /更新 <time[^>]+:datetime="post.updatedTime \|\| post.updated"/)
  assert.match(dates, /无后续修改记录，沿用创建时间/)
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

test('article topics, resources and time controls share one scrollable toolbar row', () => {
  assert.deepEqual(parse(library).errors, [])
  const toolbar = library.indexOf('<template v-if="activeGroup" #toolbar>')
  const template = parse(source).descriptor.template.content
  assert.match(template, /class="blog-list__view-toolbar"[\s\S]*<slot name="toolbar" \/>\s*<div class="blog-list__view-controls">/)
  assert.match(source, /\.blog-list__view-toolbar \{[^}]*overflow-x: auto;/)
  assert.doesNotMatch(source, /\.blog-list__view-toolbar \{[^}]*flex-wrap: wrap/)
  assert.ok(library.indexOf('<BlogList') < toolbar)
  const topics = library.indexOf('class="library-topics"', toolbar)
  const resources = library.indexOf('class="library-resources"', topics)
  const toolbarEnd = library.indexOf('</template>', resources)
  assert.ok(toolbar > -1 && topics > toolbar && resources > topics && toolbarEnd > resources)
  assert.match(library, /:title="resource.description"/)
  assert.match(library, /margin-left: auto/)
  assert.ok(!library.includes('<strong>{{ resource.text }}</strong>'))
})
