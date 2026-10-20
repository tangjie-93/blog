import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'

const source = resolve('docs')
const output = resolve('docs/.vitepress/dist')
const base = process.env.VITEPRESS_BASE || '/'
const pages = readdirSync(source, { recursive: true }).filter(path =>
  path.endsWith('.md') && !path.startsWith('.') && !path.startsWith('public/'))
const failures = []
for (const page of pages) {
  const route = page.replace(/(^|\/)README\.md$/, '$1index.md').replace(/\.md$/, '.html')
  const path = resolve(output, route)
  if (!existsSync(path)) { failures.push(`${page}: missing HTML`); continue }
  const html = readFileSync(path, 'utf8')
  if (!html.includes('vp-doc') && !html.includes('VPHome') && !html.includes('class="home-page"')) failures.push(`${page}: missing rendered content`)
  if (!/<link\b[^>]*rel="[^"]*stylesheet[^"]*"[^>]*href="[^"]*\/assets\/style\.[^"]+\.css"/.test(html)) failures.push(`${page}: missing site theme stylesheet`)
  for (const match of html.matchAll(/<(?:a|img|script|link|embed)\b[^>]*?\s(?:href|src)="([^"]+)"/g)) {
    const url = new URL(match[1].replaceAll('&amp;', '&'), `https://blog.local${base}${route}`)
    if (url.origin !== 'https://blog.local') continue
    if (!url.pathname.startsWith(base)) {
      failures.push(`${page}: outside base ${url.pathname}`)
      continue
    }
    const target = resolve(output, decodeURIComponent(url.pathname.slice(base.length)) || '.')
    if (![target, `${target}.html`, `${target}/index.html`].some(file => existsSync(file) && statSync(file).isFile())) {
      failures.push(`${page}: missing ${url.pathname}`)
    }
  }
}
assert(pages.length > 0, 'No source pages found')
assert.deepEqual([...new Set(failures)], [], 'Built pages must contain content and resolve local links/assets')
console.log(`Verified ${pages.length} rendered pages and their local links/assets.`)
