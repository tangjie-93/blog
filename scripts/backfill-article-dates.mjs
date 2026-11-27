import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createContentLoader } from 'vitepress'
import { articleRoute } from '../docs/.vitepress/articleCategories.mjs'
import { splitArticleFrontmatter } from '../docs/.vitepress/articleFrontmatter.mjs'
import { loadArticleTimestamps } from '../docs/.vitepress/articleTimestamps.mjs'
import { mapPosts } from '../docs/.vitepress/theme/blog.ts'

const root = fileURLToPath(new URL('../', import.meta.url))
const srcDir = resolve(root, 'docs')
const args = process.argv.slice(2)
if (args.some(arg => arg !== '--write')) throw new Error('用法：node scripts/backfill-article-dates.mjs [--write]')
const write = args.includes('--write')

// 使用与 posts.data.ts 相同的 Markdown 解析器与路径范围。
globalThis.VITEPRESS_CONFIG = { srcDir, site: { base: '/' }, logger: console }
const pages = await createContentLoader('articles/*/**/*.md', { includeSrc: true }).load()
const history = loadArticleTimestamps(root)
const patches = []
let count = 0
let datesAdded = 0
let updatesAdded = 0
for (const page of pages) {
  const url = `/${articleRoute(page.url.slice(1))}`
  const [post] = mapPosts([{ ...page, url, gitDates: history.get(url) }])
  if (!post) continue
  count++
  if (!post.date || !post.updated) throw new Error(`${page.url} 没有可用的创建或更新日期`)

  const path = resolve(srcDir, page.url.slice(1).replace(/\/$/, '/index.html').replace(/\.html$/, '.md'))
  const header = splitArticleFrontmatter(page.src)
  if (!header) throw new Error(`${page.url} 缺少 YAML 头部`)
  const hasDate = Object.hasOwn(page.frontmatter, 'date')
  const hasUpdated = Object.hasOwn(page.frontmatter, 'updated')
  const [declared] = mapPosts([{ url, frontmatter: page.frontmatter }])
  if ((hasDate && !declared.date) || (hasUpdated && declared.updatedSource !== 'frontmatter')) {
    throw new Error(`${page.url} 声明的日期无效或更新早于创建，请先核对`)
  }
  if (hasDate && hasUpdated) continue

  const { opening, newline, fields, closing, body } = header
  const dateLine = /^date:[\t ]*([^\r\n]*)(?:\r?\n|$)/m.exec(fields)
  if (hasDate && !dateLine) throw new Error(`${page.url} 的 date 不在独立的顶层字段行`)
  const quote = dateLine?.[1].startsWith('"') ? '"' : "'"
  const newDate = `date: ${quote}${post.date}${quote}${newline}`
  const newUpdated = `updated: ${quote}${post.updated}${quote}${newline}`
  const insertAt = dateLine ? dateLine.index + dateLine[0].length : 0
  const inserted = (hasDate ? '' : newDate) + (hasUpdated ? '' : newUpdated)
  const next = opening + fields.slice(0, insertAt) + inserted + fields.slice(insertAt) + closing + body
  patches.push({ path, original: page.src, next, inserted })
  if (!hasDate) datesAdded++
  if (!hasUpdated) updatesAdded++
}

console.log(`${count} 篇文章，${patches.length} 篇${write ? '需要修改' : '待回填'}：date ${datesAdded} 项，updated ${updatesAdded} 项。`)
if (write) {
  for (const { path, original } of patches) {
    if (!readFileSync(path).equals(Buffer.from(original))) throw new Error(`${path} 在扫描后已变化，未写入任何文件`)
  }
  for (const { path, next } of patches) writeFileSync(path, next)
  console.log(`已回填 ${patches.length} 个文件。`)
} else {
  for (const { path, inserted } of patches.slice(0, 5)) console.log(`${path}: ${inserted.trim()}`)
}
