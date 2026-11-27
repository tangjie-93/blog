import assert from 'node:assert/strict'
import test from 'node:test'
import { encodePostPath, filterPosts, getCommentPath, getPostPageUrl, mapPosts, formatPostDateTime, postYearCounts, renderInlineMarkdown, sortPostsByDate, summarizeMarkdown } from './blog.ts'
import { createCommentDocument } from './comments.ts'

test('article paths encode reserved filename characters once and map README to directories', () => {
    const [post] = mapPosts([{ url: '/articles/其他/什么? 100%.html', frontmatter: {} }])
    assert.equal(decodeURIComponent(post.url), '/articles/其他/什么? 100%.html')
    assert.ok(post.url.includes('%3F%20100%25.html'))
    assert.equal(mapPosts([{ url: '/articles/vue/README.html', frontmatter: {} }])[0].url, '/articles/vue/')
    assert.equal(encodePostPath('/a/b.html'), '/a/b.html')
    assert.equal(getPostPageUrl('articles/其他/什么? 100%.md'), post.url)
    assert.equal(getPostPageUrl('articles/vue/index.md'), '/articles/vue/')
})

test('comment keys preserve old base, encoded titles and README directory URLs', () => {
    assert.equal(getCommentPath('articles/vue/README.md'), '/blog/articles/vue/')
    assert.equal(getCommentPath('articles/vue/index.md'), '/blog/articles/vue/')
    assert.equal(getCommentPath('comments/index.md'), '/blog/comments/')
    assert.equal(getCommentPath('articles/vue/vm.$set,@test.md'), '/blog/articles/vue/vm.$set,@test.html')
    assert.equal(getCommentPath('articles/中文/带 空格.md'), '/blog/articles/%E4%B8%AD%E6%96%87/%E5%B8%A6%20%E7%A9%BA%E6%A0%BC.html')
})

test('posts sort newest first and support pipe/array tags and combined filters', () => {
    const posts = mapPosts([
        { url: '/old.html', frontmatter: { title: '旧文章', date: '2020-01-01', tags: 'vue | js |vue', type: '技术' } },
        { url: '/undated.html', frontmatter: { tags: ['notes'] } },
        { url: '/new.html', frontmatter: { date: new Date('2024-01-01'), tags: ['vue'], type: '笔记', note: '摘要' } },
    ])
    assert.deepEqual(posts.map(post => post.url), ['/new.html', '/old.html', '/undated.html'])
    assert.deepEqual(posts[1].tags, ['Vue', 'JavaScript'])
    assert.equal(posts[0].date, '2024-01-01')
    assert.equal(posts[0].note, '摘要')
    assert.equal(filterPosts(posts, { tag: 'vue' }).length, 2)
    assert.equal(filterPosts(posts, { tag: 'vue', type: '技术' })[0].title, '旧文章')
    assert.equal(filterPosts(posts, { tag: 'missing' }).length, 0)
})

test('example documents stay out of article feeds while nested articles remain', () => {
    const posts = mapPosts([
        { url: '/articles/rag/examples/data/hr-policy.html', frontmatter: {} },
        { url: '/articles/rag/examples/data/security-policy.html', frontmatter: {} },
        { url: '/articles/ai/examples/README.html', frontmatter: {} },
        { url: '/articles/rag/01-introduction.html', frontmatter: {} },
        { url: '/articles/vue/nested/component.html', frontmatter: {} },
        { url: '/articles/ai/06-examples.html', frontmatter: {} },
    ])
    assert.deepEqual(posts.map(post => post.url), [
        '/articles/rag/01-introduction.html',
        '/articles/vue/nested/component.html',
        '/articles/ai/06-examples.html',
    ])
})

test('article timestamps retain seconds and sort by exact time without inventing missing precision', () => {
    const posts = mapPosts([
        { url: '/early.html', frontmatter: { date: '2026-11-22 08:09:10' } },
        { url: '/later.html', frontmatter: { date: '2026-11-22' }, gitDates: { first: '2026-01-01T04:34:56Z', byDay: { '2026-11-22': '2026-11-22T04:34:56Z' } } },
        { url: '/unknown.html', frontmatter: { date: '2026-11-21' } },
    ])
    assert.deepEqual(posts.map(post => post.url), ['/later.html', '/early.html', '/unknown.html'])
    assert.equal(formatPostDateTime(posts[0].dateTime!), '2026-11-22 12:34:56')
    assert.equal(posts[0].dateSource, 'git')
    assert.equal(posts[1].dateSource, 'frontmatter')
    assert.equal(formatPostDateTime(posts[1].dateTime!), '2026-11-22 08:09:10')
    assert.equal(posts[2].dateTime, undefined)
    assert.equal(formatPostDateTime(posts[2].date), '2026-11-21')
    assert.equal(formatPostDateTime('2026-11-21T20:00:01Z'), '2026-11-22 04:00:01')
})

test('archive years use creation, with earliest Git history only as a fallback', () => {
    const gitDates = { first: '2021-01-01T02:00:00Z', byDay: {}, updated: '2026-06-05T02:00:00Z' }
    const posts = mapPosts([
        { url: '/old.html', frontmatter: { date: '2020-1-4' }, gitDates },
        { url: '/undated.html', frontmatter: {}, gitDates },
        { url: '/bad-day.html', frontmatter: { date: '2023-2-29' } },
        { url: '/bad-datetime.html', frontmatter: { date: '2023-02-29T12:00:00Z' }, gitDates },
        { url: '/invalid.html', frontmatter: { date: new Date(NaN) } },
        { url: '/calendar.html', frontmatter: { date: new Date('2024-02-29') } },
        { url: '/zoned.html', frontmatter: { date: '2024-12-31T16:00:00Z' } },
    ])
    const byUrl = new Map(posts.map(post => [post.url, post]))
    assert.equal(byUrl.get('/old.html')?.date, '2020-01-04')
    assert.equal(byUrl.get('/old.html')?.createdYear, 2020)
    assert.equal(byUrl.get('/old.html')?.updated, '2026-06-05')
    assert.equal(byUrl.get('/undated.html')?.createdYear, 2021)
    assert.equal(byUrl.get('/bad-datetime.html')?.createdYear, 2021)
    assert.equal(byUrl.get('/calendar.html')?.createdYear, 2024)
    assert.equal(byUrl.get('/zoned.html')?.createdYear, 2025)
    for (const url of ['/bad-day.html', '/invalid.html']) assert.equal(byUrl.get(url)?.createdYear, undefined)
})

test('updates use the newer declared or Git date without inventing time or preceding creation', () => {
    const gitDates = { first: '2020-01-01T04:00:00Z', byDay: {}, updated: '2026-06-04T23:00:00Z' }
    const posts = mapPosts([
        { url: '/same-day.html', frontmatter: { updated: '2026-06-05' }, gitDates },
        { url: '/later.html', frontmatter: { updated: '2026-06-06' }, gitDates },
        { url: '/fallback.html', frontmatter: { date: '2026-06-01', updated: '2026-06-02' } },
        { url: '/invalid.html', frontmatter: { date: '2026-06-01', updated: '2026-02-30' } },
        { url: '/earlier.html', frontmatter: { date: '2026-06-05T08:00:00+08:00' }, gitDates },
        { url: '/absent.html', frontmatter: { date: '2026-06-01' } },
    ])
    const byUrl = new Map(posts.map(post => [post.url, post]))
    assert.equal(byUrl.get('/same-day.html')?.updated, '2026-06-05')
    assert.equal(byUrl.get('/same-day.html')?.updatedSource, 'git')
    assert.equal(formatPostDateTime(byUrl.get('/same-day.html')!.updatedTime!), '2026-06-05 07:00:00')
    assert.equal(byUrl.get('/later.html')?.updated, '2026-06-06')
    assert.equal(byUrl.get('/later.html')?.updatedTime, undefined)
    assert.equal(byUrl.get('/fallback.html')?.updatedSource, 'frontmatter')
    for (const url of ['/invalid.html', '/earlier.html', '/absent.html']) {
        const post = byUrl.get(url)!
        assert.equal(post.updated, post.date)
        assert.equal(post.updatedTime, post.dateTime)
        assert.equal(post.updatedSource, 'creation')
    }
})

test('year counts respect the article scope, including topic indexes and excluding examples', () => {
    const posts = mapPosts([
        { url: '/articles/vue/README.html', frontmatter: { date: '2024-01-01', type: 'Vue' } },
        { url: '/articles/vue/entry.html', frontmatter: { date: '2024-12-7', type: 'Vue' } },
        { url: '/articles/vue/examples/demo.html', frontmatter: { date: '2025-01-01', type: 'Vue' } },
        { url: '/articles/vue/old.html', frontmatter: { date: '2020-02-01', type: 'Vue' } },
        { url: '/articles/vue/no-date.html', frontmatter: { type: 'Vue' } },
        { url: '/articles/react/entry.html', frontmatter: { date: '2025-01-01', type: 'React' } },
    ])
    assert.deepEqual(postYearCounts(filterPosts(posts, { type: 'Vue' })), [
        { value: 'all', count: 4 }, { value: 2024, count: 2 }, { value: 2020, count: 1 }, { value: 'unknown', count: 1 },
    ])
    assert.deepEqual(postYearCounts([]), [{ value: 'all', count: 0 }])
})

test('archive sort is stable, does not mutate the source and puts unknown times last', () => {
    const posts = Object.freeze(mapPosts([
        { url: '/early.html', frontmatter: { date: '2020-01-4' } },
        { url: '/same-first.html', frontmatter: { date: '2024-11-02 07:30:00' } },
        { url: '/same-second.html', frontmatter: { date: '2024-11-01T23:30:00Z' } },
        { url: '/invalid.html', frontmatter: { date: '2024-02-30' } },
        { url: '/undated.html', frontmatter: {} },
    ]))
    const urls = posts.map(post => post.url)
    assert.deepEqual(sortPostsByDate(posts, 'newest').map(post => post.url), ['/same-first.html', '/same-second.html', '/early.html', '/invalid.html', '/undated.html'])
    assert.deepEqual(sortPostsByDate(posts, 'oldest').map(post => post.url), ['/early.html', '/same-first.html', '/same-second.html', '/invalid.html', '/undated.html'])
    assert.deepEqual(posts.map(post => post.url), urls)
})

test('category README cards use a body summary instead of duplicate frontmatter notes', () => {
    const summary = summarizeMarkdown('---\ntitle: 重复标题\n---\n\n## 一、状态管理\n\n本文介绍状态更新和组件通信的常见方式。')
    assert.equal(summary, '本文介绍状态更新和组件通信的常见方式。')
    const [post] = mapPosts([{ url: '/articles/react/README.html', src: '\n## 一、状态管理\n\n本文介绍状态更新。', frontmatter: { title: '重复标题', note: '重复标题' } }])
    assert.equal(post.note, '本文介绍状态更新。')
    assert.equal(summarizeMarkdown('<script setup>\nimport Demo from "./Demo.vue"\n</script>\n\n# 实验包\n\n这是不包含组件源码的实验说明。'), '这是不包含组件源码的实验说明。')
})

test('inline Markdown renders emphasis and code while escaping HTML', () => {
    assert.equal(
        renderInlineMarkdown('**文本** 和 `文本` <script>alert(1)</script>'),
        '<strong>文本</strong> 和 <code>文本</code> &lt;script&gt;alert(1)&lt;/script&gt;',
    )
})

test('comment iframe safely escapes path and title script delimiters', () => {
    const html = createCommentDocument('https://example.com/waline.js', 'https://example.com/waline.css', '/blog/a.html', '</script><script>bad()</script>', { serverURL: 'https://comments.example.com' })
    assert.equal((html.match(/<script>/g) ?? []).length, 1)
    assert.ok(!html.includes('<script>bad()'))
    assert.ok(html.includes('\\u003c/script>'))
})

test('comment form keeps only the two optional contact fields', () => {
    const html = createCommentDocument('https://example.com/waline.js', 'https://example.com/waline.css', '/blog/a.html', '文章', { serverURL: 'https://comments.example.com' })
    assert.ok(html.includes("meta:['nick','mail'],requiredMeta:[]"))
    assert.ok(!html.includes('/api/comment-notify'))
    assert.ok(!html.includes('appKey'))
    assert.ok(!html.includes('comment-privacy'))
})
