import assert from 'node:assert/strict'
import test from 'node:test'
import { encodePostPath, filterPosts, getCommentPath, mapPosts, formatPostDateTime, renderInlineMarkdown, summarizeMarkdown } from './blog.ts'
import { createCommentDocument } from './comments.ts'

test('article paths encode reserved filename characters once and map README to directories', () => {
    const [post] = mapPosts([{ url: '/articles/其他/什么? 100%.html', frontmatter: {} }])
    assert.equal(decodeURIComponent(post.url), '/articles/其他/什么? 100%.html')
    assert.ok(post.url.includes('%3F%20100%25.html'))
    assert.equal(mapPosts([{ url: '/articles/vue/README.html', frontmatter: {} }])[0].url, '/articles/vue/')
    assert.equal(encodePostPath('/a/b.html'), '/a/b.html')
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

test('article timestamps retain seconds and sort by exact time without inventing missing precision', () => {
    const posts = mapPosts([
        { url: '/early.html', frontmatter: { date: '2026-11-22 08:09:10' } },
        { url: '/later.html', frontmatter: { date: '2026-11-22' }, gitDateTime: '2026-11-22T12:34:56+08:00' },
        { url: '/unknown.html', frontmatter: { date: '2026-11-21' } },
    ])
    assert.deepEqual(posts.map(post => post.url), ['/later.html', '/early.html', '/unknown.html'])
    assert.equal(formatPostDateTime(posts[0].dateTime!), '2026-11-22 12:34:56')
    assert.equal(posts[0].dateTimeSource, 'git')
    assert.equal(posts[1].dateTimeSource, 'frontmatter')
    assert.equal(formatPostDateTime(posts[1].dateTime!), '2026-11-22 08:09:10')
    assert.equal(posts[2].dateTime, undefined)
    assert.equal(formatPostDateTime(posts[2].date), '2026-11-21')
    assert.equal(formatPostDateTime('2026-11-21T20:00:01Z'), '2026-11-22 04:00:01')
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
