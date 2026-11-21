import assert from 'node:assert/strict'
import test from 'node:test'
import type { BlogPost } from '../../../src/types/blog.ts'
import type { ArticleGraph, ArticleGraphNode } from '../../../src/types/articleGraph.ts'
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
        assert.equal(edge.id, edge.target.id)
        if (edge.target.kind === 'article') {
            assert.equal(edge.source.category, edge.target.category)
            assert.equal(edge.target.id, `article:${edge.target.url}`)
        } else {
            assert.equal(edge.target.id, `category:${edge.target.category}`)
        }
    }
})

function fixture(counts: number[]): BlogPost[] {
    return counts.flatMap((count, category) => Array.from({ length: count }, (_, index) =>
        post(`/articles/topic-${category}/${index}.html`, `${index + 1}、文章`, ['图谱'])))
}

function distance(left: ArticleGraphNode, right: ArticleGraphNode): number {
    return Math.hypot(left.x - right.x, left.y - right.y)
}

/** 同时检查所有簇之间的碰撞，而不只是同分类相邻文章。 */
function assertGeometry(graph: ArticleGraph): void {
    const parents = graph.nodes.filter(node => node.kind === 'category')
    const leaves = graph.nodes.filter(node => node.kind === 'article')
    const root = graph.nodes.find(node => node.kind === 'root')!
    assert.equal(root.x, 0)
    assert.equal(root.y, 0)
    assert.equal(graph.edges.length, graph.nodes.length - 1)
    for (const node of graph.nodes) {
        assert.ok(Number.isFinite(node.x) && Number.isFinite(node.y))
        assert.ok(Math.abs(node.x) <= 550 && Math.abs(node.y) <= 360, `${node.id} 超出画布边界`)
    }
    for (const [index, parent] of parents.entries()) {
        assert.ok(Math.hypot(parent.x / 155, parent.y / 115) >= 1 - 1e-6)
        for (const other of parents.slice(index + 1)) {
            assert.ok(distance(parent, other) >= 90 - 1e-6, '分类主节点间距不足')
            const width = (label: string) => [...label].reduce((sum, char) => sum + (char.codePointAt(0)! > 255 ? 14 : 8), 0)
            assert.ok(Math.abs(parent.y - other.y) >= 30 || Math.abs(parent.x - other.x) >= (width(parent.label) + width(other.label)) / 2 + 12,
                '分类标签的估算文本框重叠')
            assert.ok(Math.hypot((parent.x - other.x) / 120, (parent.y - other.y) / 78) >= 1 - 1e-6, '分类标签保护区重叠')
        }
    }
    for (const [index, node] of leaves.entries()) {
        assert.ok(distance(node, root) >= 120 - 1e-6, '文章侵入中心 r=120 保护区')
        for (const other of leaves.slice(index + 1)) {
            assert.ok(distance(node, other) >= 26 - 1e-6, `${node.id} 与 ${other.id} 文章节点间距不足`)
        }
        for (const parent of parents) {
            const own = node.category === parent.category
            assert.ok(Math.hypot((node.x - parent.x) / (own ? 58 : 82), (node.y - parent.y) / (own ? 48 : 58)) >= 1 - 1e-6,
                `${node.id} 覆盖分类 ${parent.id} 的保护区`)
        }
    }
}

test('organic layout keeps dense and uneven category clusters inside bounds with label clearance', () => {
    for (const counts of [Array(24).fill(15), Array.from({ length: 24 }, (_, index) => 4 + index),
        [120, ...Array(23).fill(9)], Array(30).fill(12)]) {
        const posts = fixture(counts)
        const graph = createArticleGraph(posts, {})
        assertGeometry(graph)
        assert.equal(graph.articles.length, posts.length)
        assert.equal(graph.nodes.length, posts.length + counts.length + 1)
    }
})

test('category spacing accounts for mixed Chinese and Latin label widths', () => {
    const posts = fixture(Array(23).fill(15))
    const names = ['Agent 项目', 'JavaScript', 'TypeScript', 'jQuery 源码', '神经网络与工具']
    const labels = Object.fromEntries(Array.from({ length: 23 }, (_, index) => [`topic-${index}`, names[index % names.length] + index]))
    assertGeometry(createArticleGraph(posts, labels))
})

test('dense layout is reproducible across calls, input order and intervening filters', () => {
    const posts = fixture(Array(24).fill(15))
    const before = JSON.stringify(posts)
    const graph = createArticleGraph(posts, {})
    createArticleGraph(posts, {}, '', 'topic-7')
    createArticleGraph(posts, {}, '没有匹配结果')
    assert.deepEqual(createArticleGraph(posts, {}), graph)
    assert.deepEqual(createArticleGraph([...posts].reverse(), {}), graph)
    assert.deepEqual(createArticleGraph([...posts.slice(97), ...posts.slice(0, 97)], {}), graph)
    assert.equal(JSON.stringify(posts), before)
})

test('single-category filters retain a separate root and expand articles into a broad local cluster', () => {
    const posts = fixture([300, 5])
    const graph = createArticleGraph(posts, {}, '', 'topic-0')
    assertGeometry(graph)
    assert.equal(graph.categories.length, 2)
    assert.equal(graph.articles.length, 300)
    assert.deepEqual(graph.articles.map(item => item.title), Array.from({ length: 300 }, (_, index) => `${index + 1}、文章`))
    const parent = graph.nodes.find(node => node.kind === 'category')!
    const leaves = graph.nodes.filter(node => node.kind === 'article')
    assert.ok(parent.x < -100 && Math.abs(parent.y) < 80)
    assert.ok(leaves.reduce((sum, node) => sum + node.x, 0) / leaves.length > parent.x + 150)
    assert.ok(Math.max(...leaves.map(node => node.x)) - Math.min(...leaves.map(node => node.x)) > 600)
    assert.ok(Math.max(...leaves.map(node => node.y)) - Math.min(...leaves.map(node => node.y)) > 450)
    assert.deepEqual(graph, createArticleGraph([...posts].reverse(), {}, '', 'topic-0'))
    // 搜索后仅剩一个分类，以及原本就只有一个分类，均使用相同的布局分支。
    const tagged = posts.map(item => ({ ...item, tags: item.url.includes('/topic-0/') ? ['唯一分类'] : [] }))
    assert.deepEqual(createArticleGraph(tagged, {}, '唯一分类').nodes, graph.nodes)
    assertGeometry(createArticleGraph(fixture([1]), {}))
    assertGeometry(createArticleGraph(fixture([1, 1]), {}))
})

test('organic geometry avoids a perfect category ellipse and repeated article rings', () => {
    const graph = createArticleGraph(fixture(Array(24).fill(15)), {})
    const parents = graph.nodes.filter(node => node.kind === 'category')
    const depths = parents.map(node => Math.hypot(node.x / 345, node.y / 215))
    assert.ok(Math.max(...depths) - Math.min(...depths) > 0.15)
    // 每个象限都有多个分类，不能因一个大分类而挤成单侧扇面。
    for (const x of [-1, 1]) for (const y of [-1, 1]) {
        assert.ok(parents.filter(node => node.x * x > 0 && node.y * y > 0).length >= 3)
    }
    for (const parent of parents) {
        const leaves = graph.nodes.filter(node => node.kind === 'article' && node.category === parent.category)
        const radii = new Set(leaves.map(node => Math.round(distance(node, parent) / 8)))
        assert.ok(radii.size >= 5, '文章应使用连续半径而非固定三层')
        assert.ok(leaves.some(node => node.x < parent.x) && leaves.some(node => node.x > parent.x), '簇应覆盖分类两侧')
    }
})
