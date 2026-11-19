import assert from 'node:assert/strict'
import test from 'node:test'
import { encodePostPath, filterPosts, getCommentPath, mapPosts, summarizeMarkdown } from './blog.ts'
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
    assert.deepEqual(posts[1].tags, ['vue', 'js'])
    assert.equal(posts[0].date, '2024-01-01')
    assert.equal(posts[0].note, '摘要')
    assert.equal(filterPosts(posts, { tag: 'vue' }).length, 2)
    assert.equal(filterPosts(posts, { tag: 'vue', type: '技术' })[0].title, '旧文章')
    assert.equal(filterPosts(posts, { tag: 'missing' }).length, 0)
})

test('category README cards use a body summary instead of duplicate frontmatter notes', () => {
    const summary = summarizeMarkdown('---\ntitle: 重复标题\n---\n\n## 一、状态管理\n\n本文介绍状态更新和组件通信的常见方式。')
    assert.equal(summary, '本文介绍状态更新和组件通信的常见方式。')
    const [post] = mapPosts([{ url: '/articles/react/README.html', src: '\n## 一、状态管理\n\n本文介绍状态更新。', frontmatter: { title: '重复标题', note: '重复标题' } }])
    assert.equal(post.note, '本文介绍状态更新。')
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
