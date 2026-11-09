import type { BlogPost } from '../../../src/types/blog.ts'
import type { ArticleGraph, ArticleGraphNode } from '../../../src/types/articleGraph.ts'

/** 从文章 URL 提取分类，忽略目录入口；无效编码不进入图谱。 */
function getCategory(url: string): string | undefined {
    const match = /^\/articles\/([^/]+)\/(.+\.html)$/.exec(url)
    if (!match || /(?:^|\/)(?:README|index)\.html$/.test(match[2])) return
    try {
        return decodeURIComponent(match[1])
    } catch {
        return
    }
}

/** 按分类和标题自然排序，保证过滤前后的节点顺序可预测。 */
function compareText(left: string, right: string): number {
    return left.localeCompare(right, 'zh-CN', { numeric: true })
}

/**
 * 将已有文章索引转为固定径向导航，搜索不修改原文章或 URL。
 * @param posts 站点文章索引。
 * @param categoryLabels 分类显示名称。
 * @param query 匹配标题、标签和分类名称的关键词。
 * @param category 限定的原始分类名，空字符串表示全部分类。
 * @returns 全量分类、筛选文章和可直接绘制的节点与连线。
 */
export function createArticleGraph(posts: BlogPost[], categoryLabels: Record<string, string>, query = '', category = ''): ArticleGraph {
    const groups = new Map<string, BlogPost[]>()
    const seen = new Set<string>()
    for (const post of posts) {
        const id = getCategory(post.url)
        if (!id || seen.has(post.url)) continue
        seen.add(post.url)
        if (!groups.has(id)) groups.set(id, [])
        groups.get(id)!.push(post)
    }
    const categories = [...groups].map(([id, articles]) => ({ id, label: categoryLabels[id] || id, count: articles.length }))
        .sort((left, right) => compareText(left.label, right.label) || compareText(left.id, right.id))
    const keyword = query.trim().toLocaleLowerCase()
    const visible = categories.filter(item => !category || item.id === category).map(item => ({
        ...item,
        articles: groups.get(item.id)!.filter(post =>
            [post.title, item.label, item.id, ...post.tags].some(text => text.toLocaleLowerCase().includes(keyword)))
            .sort((left, right) => compareText(left.title, right.title) || compareText(left.url, right.url)),
    })).filter(item => item.articles.length)
    const articles = visible.flatMap(item => item.articles)
    const graph: ArticleGraph = { nodes: [], edges: [], categories, articles }
    if (!articles.length) return graph
    const root: ArticleGraphNode = { id: 'root', label: '博客', kind: 'root', x: 0, y: 0, count: articles.length }
    graph.nodes.push(root)
    const categoryGap = 8
    const slots = articles.length + visible.length * categoryGap
    let offset = 0
    for (const [groupIndex, group] of visible.entries()) {
        const angle = (offset + (group.articles.length + categoryGap) / 2) / slots * Math.PI * 2 - Math.PI / 2
        const categoryRadius = 220 + (groupIndex % 2) * 50
        const parent: ArticleGraphNode = {
            id: `category:${group.id}`, label: group.label, kind: 'category', category: group.id,
            count: group.articles.length, x: Math.cos(angle) * categoryRadius, y: Math.sin(angle) * categoryRadius,
        }
        graph.nodes.push(parent)
        graph.edges.push({ id: parent.id, source: root, target: parent })
        group.articles.forEach((post, index) => {
            const angle = (offset + index + categoryGap / 2 + 0.5) / slots * Math.PI * 2 - Math.PI / 2
            const radius = 340 + (index % 3) * 50
            const node: ArticleGraphNode = {
                id: `article:${post.url}`, label: post.title, kind: 'article', url: post.url, category: group.id,
                x: Math.cos(angle) * radius, y: Math.sin(angle) * radius,
            }
            graph.nodes.push(node)
            graph.edges.push({ id: node.id, source: parent, target: node })
        })
        offset += group.articles.length + categoryGap
    }
    return graph
}
