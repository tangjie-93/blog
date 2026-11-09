import assert from 'node:assert/strict'
import test from 'node:test'
import type { BlogPost } from '../../../src/types/blog.ts'
import { createArticleGraph } from './articleGraph.ts'

/** 创建测试文章，保留实际索引使用的完整字段。 */
function post(url: string, title = url, tags: string[] = []): BlogPost {
    return { url, title, tags, date: '', type: '', note: '' }
}

test('graph preserves encoded article URLs and excludes category and nested indexes', () => {
    const url = '/articles/%E5%85%B6%E4%BB%96/%E4%BB%80%E4%B9%88%3F%20100%25.html'
    const nested = '/articles/vue/nested/component.html'
    const graph = createArticleGraph([
        post('/articles/vue/'), post('/articles/vue/README.html'), post('/articles/vue/index.html'),
        post('/articles/vue/nested/index.html'), post('/timeline/'), post('/articles/%broken/a.html'),
        post(url), post(nested), post(url),
    ], { vue: 'Vue' })
    assert.deepEqual(new Set(graph.articles.map(item => item.url)), new Set([url, nested]))
    assert.ok(graph.categories.some(item => item.id === '其他' && item.label === '其他'))
    assert.equal(graph.nodes.filter(item => item.kind === 'article').find(item => item.url === url)?.category, '其他')
    assert.equal(graph.categories.reduce((sum, item) => sum + item.count, 0), 2)
})

test('search matches titles, tags and category names case-insensitively with category filters', () => {
    const posts = [post('/articles/vue/one.html', '组件通信', ['Props']), post('/articles/js/two.html', 'Promise')]
    const labels = { vue: 'Vue 3', js: 'JavaScript' }
    assert.equal(createArticleGraph(posts, labels, ' PROPS ').articles[0].title, '组件通信')
    assert.equal(createArticleGraph(posts, labels, 'promise').articles[0].title, 'Promise')
    assert.equal(createArticleGraph(posts, labels, 'VUE 3').articles[0].title, '组件通信')
    const empty = createArticleGraph(posts, labels, 'promise', 'vue')
    assert.deepEqual(empty.nodes, [])
    assert.deepEqual(empty.edges, [])
    assert.deepEqual(empty.articles, [])
    assert.equal(empty.categories.length, 2)
    assert.deepEqual(createArticleGraph([], {}), { nodes: [], edges: [], categories: [], articles: [] })
})

test('layout is deterministic, finite and connects every unique article to its category', () => {
    const posts = [post('/articles/vue/10.html', '10、组件'), post('/articles/js/1.html', 'JS'), post('/articles/vue/2.html', '2、组件')]
    const before = JSON.stringify(posts)
    const graph = createArticleGraph(posts, { vue: 'Vue', js: 'JavaScript' })
    assert.deepEqual(graph, createArticleGraph([...posts].reverse(), { vue: 'Vue', js: 'JavaScript' }))
    assert.equal(JSON.stringify(posts), before)
    assert.deepEqual(graph.articles.map(item => item.title), ['JS', '2、组件', '10、组件'])
    assert.equal(new Set(graph.nodes.map(node => node.id)).size, graph.nodes.length)
    assert.equal(graph.edges.length, graph.nodes.length - 1)
    for (const node of graph.nodes) assert.ok(Number.isFinite(node.x) && Number.isFinite(node.y))
    for (const edge of graph.edges) {
        assert.ok(graph.nodes.includes(edge.source) && graph.nodes.includes(edge.target))
        assert.equal(edge.source.kind, edge.target.kind === 'category' ? 'root' : 'category')
        if (edge.target.kind === 'article') assert.equal(edge.source.category, edge.target.category)
    }
})
