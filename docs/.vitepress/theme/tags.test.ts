import assert from 'node:assert/strict'
import test from 'node:test'
import { createTagCatalog, normalizeTag, normalizeTags, tagGroups } from './tags.ts'
import { mapPosts, filterPosts } from './blog.ts'

test('tag aliases normalize spelling and deduplicate while keeping distinct technologies', () => {
    assert.deepEqual(normalizeTags(['vue', 'Vue', 'vue3', 'js', 'JavaScript', 'AI Agent', 'Agent', '基础', '高级', '']), ['Vue', 'Vue 3', 'JavaScript', 'Agent'])
    assert.deepEqual(normalizeTags(['GitHub', '开源项目', '知识库', 'RAG', '实战', '项目实战']), ['开源生态', 'RAG', '工程实践'])
    assert.equal(normalizeTag(' unknown-domain '), 'unknown-domain')
    assert.equal(normalizeTag(' NODE.JS '), 'Node.js')
})

test('tag catalog counts real unique articles, not directory indexes or repeated aliases', () => {
    const posts = mapPosts([
        { url: '/articles/vue/README.html', frontmatter: { tags: 'Vue|目录标签' } },
        { url: '/articles/vue/a.html', frontmatter: { tags: 'vue|Vue|javascript|js' } },
        { url: '/articles/vue/a.html', frontmatter: { tags: 'vue' } },
        { url: '/articles/ai/b.html', frontmatter: { tags: ['AI Agent', 'Agent', '独立专业词'] } },
    ])
    assert.equal(filterPosts(posts, { tag: '目录标签' }).length, 0)
    const catalog = createTagCatalog(posts)
    assert.equal(catalog.entries.find(tag => tag.name === 'Vue')?.count, 1)
    assert.equal(catalog.entries.find(tag => tag.name === 'JavaScript')?.count, 1)
    assert.equal(catalog.entries.find(tag => tag.name === 'Agent')?.count, 1)
    assert.ok(!catalog.entries.some(tag => tag.name === '目录标签'))
    assert.ok(catalog.groups.find(group => group.id === 'other')?.entries.some(tag => tag.name === '独立专业词'))
    const assigned = tagGroups.flatMap(group => [...group.tags])
    assert.equal(new Set(assigned).size, assigned.length)
})

test('legacy tag filters resolve canonical tags used in article cards', () => {
    const posts = mapPosts([{ url: '/articles/javascript/a.html', frontmatter: { tags: 'javascript|js' } }])
    assert.deepEqual(posts[0].tags, ['JavaScript'])
    assert.equal(filterPosts(posts, { tag: 'js' }).length, 1)
    assert.equal(filterPosts(posts, { tag: 'JavaScript' }).length, 1)
})
