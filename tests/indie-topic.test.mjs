import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'
import { createMarkdownRenderer } from 'vitepress'

const root = resolve('docs/articles/独立开发与出海/going-global')
const articles = readdirSync(root).filter(file => /^\d{2}-.+\.md$/.test(file)).sort()
const index = readFileSync(resolve(root, 'README.md'), 'utf8')
const overview = readFileSync(resolve(root, articles[0]), 'utf8')

test('indie series has ten ordered articles linked from both entry pages', () => {
  assert.equal(articles.length, 10)
  for (const [position, file] of articles.entries()) {
    assert.equal(file.slice(0, 2), String(position + 1).padStart(2, '0'))
    assert.ok(index.includes(`./${file}`), `${file}: missing index entry`)
    if (position > 0) assert.ok(overview.includes(`./${file}`), `${file}: missing overview entry`)
  }
})

test('indie series relative links and local source anchors resolve', async () => {
  const markdown = await createMarkdownRenderer(resolve('docs'))
  for (const file of ['README.md', ...articles]) {
    const content = readFileSync(resolve(root, file), 'utf8')
    assert.doesNotMatch(content, /\]\(\.\/README(?:\.md)?(?:#[^)]*)?\)/, `${file}: use the rewritten topic index route`)
    const html = markdown.render(content.replace(/^---\r?\n[\s\S]*?\r?\n---/, ''))
    for (const match of content.matchAll(/\]\((\.[^\s)]+|#[^\s)]+)\)/g)) {
      const target = decodeURIComponent(match[1])
      if (target.startsWith('#')) {
        assert.ok(html.includes(`id="${target.slice(1)}"`), `${file}: missing anchor ${target}`)
      } else {
        const [path, fragment] = target.split('#')
        const destination = resolve(root, path)
        assert.ok(existsSync(destination), `${file}: missing ${target}`)
        if (fragment && path.endsWith('.md')) {
          const destinationHtml = markdown.render(readFileSync(destination, 'utf8').replace(/^---\r?\n[\s\S]*?\r?\n---/, ''))
          assert.ok(destinationHtml.includes(`id="${fragment}"`), `${file}: missing destination anchor ${target}`)
        }
      }
    }
    assert.doesNotMatch(html, /\*\*/, `${file}: raw bold markers`)
  }
})

test('video lab renders opt-in platform links with intact episode and timestamp targets', async () => {
  const markdown = await createMarkdownRenderer(resolve('docs'))
  const content = readFileSync(resolve(root, articles.at(-1)), 'utf8')
  const html = markdown.render(content.replace(/^---\r?\n[\s\S]*?\r?\n---/, ''))
  assert.doesNotMatch(html, /<(?:iframe|video)\b/i)
  for (const target of [
    'https://www.bilibili.com/video/BV1GD7GzUExH/?p=3',
    'https://www.bilibili.com/video/BV1GD7GzUExH/?p=4',
    'https://www.bilibili.com/video/BV1GD7GzUExH/?p=5',
    'https://www.youtube.com/watch?v=ot5BrFCjo8c&amp;t=31s',
    'https://www.youtube.com/watch?v=ot5BrFCjo8c&amp;t=2070s'
  ]) assert.ok(html.includes(`href="${target}"`), `missing rendered video target: ${target}`)
})

test('video lab provides direct video links, actionable exercises and verification boundaries', () => {
  const file = articles.at(-1)
  const content = readFileSync(resolve(root, file), 'utf8')
  assert.match(file, /^10-/)
  const videoIds = new Set([...content.matchAll(/https:\/\/(?:www\.bilibili\.com\/video\/(BV[\w]+)|www\.youtube\.com\/watch\?v=([\w-]+))/g)]
    .map(match => match[1] || match[2]))
  assert.equal(videoIds.size, 11)
  assert.match(content, /平台元数据已核对/)
  assert.match(content, /视频官方页搜索索引已核对/)
  assert.match(content, /没有完整观看视频/)
  assert.match(content, /测试环境/)
  assert.match(content, /分集时长/)
  assert.match(content, /34:30/)
  for (const chapter of articles.slice(1, -1)) {
    const text = readFileSync(resolve(root, chapter), 'utf8')
    const videoEntry = text.indexOf('**视频跟练**')
    assert.ok(videoEntry >= 0 && videoEntry < text.indexOf('## 1.'), `${chapter}: video lab should appear before the first section`)
    assert.ok(text.includes(`./${file}#`), `${chapter}: missing focused video exercise link`)
    assert.match(text, /https:\/\/www\.(?:bilibili\.com\/video|youtube\.com\/watch)/)
  }
})

test('social video resources distinguish verified Douyin pages from unverified Xiaohongshu leads', async () => {
  const markdown = await createMarkdownRenderer(resolve('docs'))
  const content = readFileSync(resolve(root, articles.at(-1)), 'utf8')
  const html = markdown.render(content.replace(/^---\r?\n[\s\S]*?\r?\n---/, ''))
  const douyinIds = new Set([...content.matchAll(/https:\/\/www\.douyin\.com\/video\/(\d+)/g)].map(match => match[1]))
  assert.deepEqual([...douyinIds].sort(), ['7501171626013117696', '7569067873889574591'])
  for (const id of douyinIds) assert.ok(html.includes(`href="https://www.douyin.com/video/${id}"`))
  for (const text of ['外贸独立站白帽子', '快跑啊小卢_', '09:39', '06:31', '浏览器公开页已核对', '安全限制', '仅聚合索引线索']) {
    assert.ok(content.includes(text), `missing social verification detail: ${text}`)
  }
  assert.match(content, /没有完整观看视频/)
  assert.match(content, /不是已审阅推荐，也不计入本页具体视频数量/)
  assert.doesNotMatch(content, /https:\/\/www\.xiaohongshu\.com\/(?:explore|discovery\/item)\//)
  assert.doesNotMatch(html, /<(?:iframe|video)\b/i)
})

test('new indie chapters expose metadata, an example, an acceptance checklist and source boundaries', () => {
  for (const [position, file] of articles.entries()) {
    if (position === 0) continue
    const content = readFileSync(resolve(root, file), 'utf8')
    const metadata = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
    assert.ok(metadata, `${file}: missing frontmatter`)
    for (const key of ['title', 'date', 'updated', 'type', 'tags', 'note']) {
      assert.match(metadata[1], new RegExp(`^${key}: .+`, 'm'), `${file}: missing ${key}`)
    }
    assert.ok(content.includes('客户反馈整理器'), `${file}: missing shared example`)
    assert.match(content, /教学|假设/, `${file}: missing example boundary`)
    assert.match(content, /验收清单/, `${file}: missing checklist`)
    assert.ok((content.match(/^- \[ \]/gm) || []).length >= 5, `${file}: incomplete checklist`)
    assert.match(content, /来源与核验边界/, `${file}: missing source boundary`)
    assert.match(content, /2026-11-25/, `${file}: missing research date`)
    assert.ok((content.match(/\]\(https:\/\//g) || []).length >= 3, `${file}: missing sources`)
    assert.ok(content.includes(`./${articles[position - 1]}`), `${file}: missing previous chapter`)
    if (position < articles.length - 1) {
      assert.ok(content.includes(`./${articles[position + 1]}`), `${file}: missing next chapter`)
    } else {
      assert.ok(content.includes('/articles/going-global/'), `${file}: missing return to index`)
    }
  }
})
