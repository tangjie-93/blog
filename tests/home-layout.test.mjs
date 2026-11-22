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

test('desktop home uses available viewport height with equal aligned panels and no clipping', () => {
  assert.match(source, /@media \(min-width: 960px\)/)
  assert.match(source, /min-height: calc\(100svh - var\(--vp-nav-height\) - var\(--vp-layout-top-height, 0px\)\)/)
  assert.match(source, /grid-template-rows: auto auto auto minmax\(230px, 1fr\) auto/)
  assert.ok(!/overflow(?:-y)?:\s*(hidden|clip)/.test(source))
  assert.ok(!source.includes('<HeroOrbit'))
  assert.match(source, /align-content: start/)
  assert.match(source, /\.home-page__dashboard\s*\{[^}]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);[^}]*align-items: stretch/)
  assert.match(source, /\.home-page__topics\s*\{[^}]*flex: 1/)
  assert.match(source, /\.home-page__posts\s*\{[^}]*flex: 1/)
})

test('desktop banner keeps the title on one line and welcome content horizontal', () => {
  assert.match(source, /h1 br\s*\{ display: none/)
  assert.match(source, /h1\s*\{[^}]*white-space: nowrap/)
  assert.match(source, /\.home-page__welcome\s*\{ display: flex; align-items: center/)
  assert.match(source, /@media \(min-width: 960px\) and \(max-height: 800px\)/)
})

test('home offers compact categories, six recent notes and expanded reading routes', () => {
  assert.equal((source.match(/summary: '/g) || []).length, 7)
  assert.match(source, /posts\.slice\(0, 6\)/)
  assert.match(source, /<HomeReadingPaths\s*\/>/)
  const readingPaths = readFileSync(new URL('../docs/.vitepress/theme/components/components/HomeReadingPaths.vue', import.meta.url), 'utf8')
  for (const url of ['/articles/?group=languages&topic=javascript', '/articles/rag/', '/articles/?group=graphics&topic=webgl']) {
    assert.ok(readingPaths.includes(url), `${url} should be reachable from reading paths`)
  }
  assert.match(readingPaths, /:href="withBase\(path.url\)"/)
  assert.equal((readingPaths.match(/stages: \[/g) || []).length, 3)
  assert.match(readingPaths, /v-for="\(step, index\) in path.stages"/)
  assert.ok(!/home-reading-paths__(?:description|action) \{ display: none/.test(readingPaths))
  assert.match(readingPaths, /@media \(max-width: 767px\)/)
  assert.match(readingPaths, /grid-template-columns: minmax\(0, 1fr\)/)
})
