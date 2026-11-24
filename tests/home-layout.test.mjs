import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const source = readFileSync(new URL('../docs/.vitepress/theme/components/HomePage.vue', import.meta.url), 'utf8')

test('home topics cover all seven categories with compact navigation links', () => {
  for (const group of ['languages', 'engineering', 'ai', 'backend', 'graphics', 'source', 'indie']) {
    assert.ok(source.includes(`/articles/?group=${group}`), `${group} should be reachable from home`)
  }
  assert.equal((source.match(/url: '\/articles\/\?group=/g) || []).length, 7)
})

test('home fits the viewport and keeps overflow reachable in the content region', () => {
  const styles = readFileSync(new URL('../docs/.vitepress/theme/style.css', import.meta.url), 'utf8')
  assert.match(styles, /\.Layout:is\(\.tech-home, \.blog-tags-page\)\s*\{[^}]*height: 100dvh/)
  assert.match(source, /\.home-page__workspace\s*\{[^}]*min-height: 0;[^}]*overflow: auto;[^}]*scrollbar-width: none/)
  assert.match(source, /ref="workspace"[^>]*tabindex="0"/)
})

test('home cards fill the remaining height within a centered width limit', () => {
  assert.match(source, /\.home-page\s*\{[^}]*width: 100%;[^}]*max-width: var\(--blog-page-max-width\);[^}]*margin-inline: auto;/)
  assert.match(source, /grid-template-rows: minmax\(min-content, 3fr\) minmax\(min-content, 2fr\)/)
  const readingPaths = readFileSync(new URL('../docs/.vitepress/theme/components/components/HomeReadingPaths.vue', import.meta.url), 'utf8')
  assert.match(readingPaths, /\.home-reading-paths__grid\s*\{[^}]*flex: 1/)
})

test('home topic rows fill their width without vertically centering card titles', () => {
  assert.match(source, /\.home-page__topics\s*\{[^}]*display: flex;[^}]*flex-wrap: wrap;/)
  assert.match(source, /\.home-page__topic\s*\{[^}]*flex: 1 0 calc\(/)
  assert.doesNotMatch(source, /\.home-page__topic\s*\{[^}]*justify-content: center/)
})

test('compact home exposes a switch for every content panel', () => {
  assert.match(source, /@media \(width < 1280px\), \(height < 800px\)/)
  assert.match(source, /:aria-controls="panel.id"/)
  for (const id of ['home-topics', 'home-latest', 'home-paths']) {
    assert.ok(source.includes(`{ id: '${id}',`))
    assert.ok(source.includes(`id="${id}"`))
  }
  assert.match(source, /\.home-page__panel:not\(\.is-active\)\s*\{ display: none/)
})

test('home offers compact categories, six recent notes and expanded reading routes', () => {
  assert.equal((source.match(/summary: '/g) || []).length, 7)
  assert.match(source, /posts\.slice\(0, 6\)/)
  assert.match(source, /<HomeReadingPaths\s+id="home-paths"/)
  const readingPaths = readFileSync(new URL('../docs/.vitepress/theme/components/components/HomeReadingPaths.vue', import.meta.url), 'utf8')
  for (const url of ['/articles/?group=languages&topic=javascript', '/articles/rag/', '/articles/?group=graphics&topic=webgl', '/articles/going-global/']) {
    assert.ok(readingPaths.includes(url), `${url} should be reachable from reading paths`)
  }
  assert.match(readingPaths, /:href="withBase\(path.url\)"/)
  assert.equal((readingPaths.match(/stages: \[/g) || []).length, 4)
  assert.match(readingPaths, /v-for="\(step, index\) in path.stages"/)
  assert.ok(!/home-reading-paths__(?:description|action) \{ display: none/.test(readingPaths))
  assert.match(readingPaths, /grid-template-columns: minmax\(0, 1fr\)/)
  assert.match(readingPaths, /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/)
  assert.match(readingPaths, /grid-template-columns: repeat\(4, minmax\(0, 1fr\)\)/)
})
