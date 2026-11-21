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

/** 无共享随机状态，同一节点的每个扰动通道始终返回相同的 [0, 1) 值。 */
function jitter(id: string, channel: string): number {
    let hash = 2166136261
    for (const char of `${id}:${channel}`) {
        hash = Math.imul(hash ^ char.charCodeAt(0), 16777619)
    }
    hash = Math.imul(hash ^ (hash >>> 16), 0x7feb352d)
    hash = Math.imul(hash ^ (hash >>> 15), 0x846ca68b)
    return ((hash ^ (hash >>> 16)) >>> 0) / 4294967296
}

function clamp(value: number, limit: number): number {
    return Math.max(-limit, Math.min(limit, value))
}

/** 将节点推出椭圆保护区；重合时也使用确定性方向，而不是随机逃逸。 */
function exclude(node: ArticleGraphNode, center: ArticleGraphNode, rx: number, ry: number): void {
    let dx = (node.x - center.x) / rx
    let dy = (node.y - center.y) / ry
    let distance = Math.hypot(dx, dy)
    if (distance >= 1) return
    if (distance < 1e-9) {
        const angle = jitter(node.id, center.id) * Math.PI * 2
        dx = Math.cos(angle)
        dy = Math.sin(angle)
        distance = 1
    }
    node.x = center.x + dx / distance * rx
    node.y = center.y + dy / distance * ry
}

/** 标签近似宽度用于预留空间；拉丁字符较窄，中文按完整字宽估算。 */
function labelWidth(label: string): number {
    return [...label].reduce((width, char) => width + (char.codePointAt(0)! > 255 ? 14 : 8), 0)
}

/** 固定轮数的静态约束投影：分类标签互相留白，根节点始终保留中心空间。 */
function spaceCategories(parents: ArticleGraphNode[], root: ArticleGraphNode): void {
    for (let step = 0; step < 160; step++) {
        for (let i = 0; i < parents.length; i++) {
            const left = parents[i]
            for (let j = i + 1; j < parents.length; j++) {
                const right = parents[j]
                const beforeX = right.x
                const beforeY = right.y
                exclude(right, left, 90, 90)
                const labelGap = Math.max(120, (labelWidth(left.label) + labelWidth(right.label)) / 2 + 24)
                exclude(right, left, labelGap, 78)
                // 两个分类各承担一半位移，避免按顺序把后面的分类挤到边缘。
                const dx = (right.x - beforeX) / 2
                const dy = (right.y - beforeY) / 2
                left.x -= dx
                left.y -= dy
                right.x -= dx
                right.y -= dy
            }
            exclude(left, root, 155, 115)
            left.x = clamp(left.x, 420)
            left.y = clamp(left.y, 265)
        }
    }
}

/**
 * 先在局部簇内寻找无碰撞位置，再做固定轮数的短程排斥松弛。
 * 每次移动都同时满足边界与全部保护区，避免逐个推出重叠保护区时来回震荡。
 * 所有计算只发生在构图时，没有客户端计时器或持续模拟。
 */
function spaceArticles(nodes: ArticleGraphNode[], parents: ArticleGraphNode[], root: ArticleGraphNode): void {
    const gap = 26
    const placed: ArticleGraphNode[] = []
    const anchors = new Map(nodes.map(node => [node, { x: clamp(node.x, 550), y: clamp(node.y, 360) }]))
    const available = (node: ArticleGraphNode, x: number, y: number): boolean => {
        if (Math.abs(x) > 550 || Math.abs(y) > 360 || Math.hypot(x - root.x, y - root.y) < 120) return false
        for (const parent of parents) {
            const own = node.category === parent.category
            if (Math.hypot((x - parent.x) / (own ? 58 : 82), (y - parent.y) / (own ? 48 : 58)) < 1) return false
        }
        return placed.every(other => other === node || (x - other.x) ** 2 + (y - other.y) ** 2 >= gap * gap)
    }
    // 按 URL hash 分配落点优先级，避免排序靠前的分类独占相邻空间；输出顺序不变。
    const ordered = [...nodes].sort((left, right) => jitter(left.id, 'order') - jitter(right.id, 'order') || compareText(left.id, right.id))
    for (const node of ordered) {
        const anchor = anchors.get(node)!
        const phase = jitter(node.id, 'placement') * Math.PI * 2
        let found = false
        // 连续扩展的低差异采样，只修复碰撞，不把所有文章排成统一的螺旋。
        for (let attempt = 0; attempt < 65536; attempt++) {
            const radius = 4 * Math.sqrt(attempt)
            const angle = phase + attempt * 2.399963229728653
            const x = anchor.x + Math.cos(angle) * radius
            const y = anchor.y + Math.sin(angle) * radius
            if (!available(node, x, y)) continue
            node.x = x
            node.y = y
            found = true
            break
        }
        // 超出固定画布容量时仍保留全部文章和有限坐标，不改变图谱数据语义。
        if (!found) {
            node.x = anchor.x
            node.y = anchor.y
        }
        placed.push(node)
    }
    for (let step = 0; step < 24; step++) {
        for (const node of ordered) {
            const anchor = anchors.get(node)!
            let dx = (anchor.x - node.x) * 0.015
            let dy = (anchor.y - node.y) * 0.015
            for (const other of placed) {
                if (other === node) continue
                const x = node.x - other.x
                const y = node.y - other.y
                const distance = Math.hypot(x, y)
                if (distance < gap || distance >= 40) continue
                const force = (40 - distance) * 0.035 / distance
                dx += x * force
                dy += y * force
            }
            const length = Math.hypot(dx, dy)
            const scale = length > 2 ? 2 / length : 1
            const x = node.x + dx * scale
            const y = node.y + dy * scale
            if (available(node, x, y)) {
                node.x = x
                node.y = y
            }
        }
    }
}

/**
 * 将已有文章索引转为确定性的有机聚类导航，搜索不修改原文章或 URL。
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
    const single = visible.length === 1
    const parents = visible.map((group, index): ArticleGraphNode => {
        const id = `category:${group.id}`
        // 等份角度而非按文章数分配扇区，叠加角度及径向扰动，避免完美同心圆。
        const angle = (index + (jitter(id, 'angle') - 0.5) * 0.36) / visible.length * Math.PI * 2 - Math.PI / 2
        const depth = 0.82 + jitter(id, 'depth') * 0.28
        return {
            id, label: group.label, kind: 'category', category: group.id, count: group.articles.length,
            x: single ? -175 : Math.cos(angle) * 345 * depth,
            y: single ? -20 : Math.sin(angle) * 215 * depth,
        }
    })
    spaceCategories(parents, root)
    const leaves: ArticleGraphNode[] = []
    for (const [groupIndex, group] of visible.entries()) {
        const parent = parents[groupIndex]
        graph.nodes.push(parent)
        graph.edges.push({ id: parent.id, source: root, target: parent })
        const direction = Math.atan2(parent.y / 215, parent.x / 345)
        const spread = Math.min(160, 48 + Math.sqrt(group.articles.length) * 15)
        // 大簇的中心更靠内，预留边缘呼吸空间；最终碰撞修复仍可利用完整画布。
        const centerX = clamp(parent.x + Math.cos(direction) * 55, 480 - spread)
        const centerY = clamp(parent.y + Math.sin(direction) * 35, 310 - spread * 0.8)
        for (const post of group.articles) {
            const id = `article:${post.url}`
            const angle = jitter(id, 'angle') * Math.PI * 2
            const radius = Math.sqrt(0.06 + jitter(id, 'radius') * 0.94)
            // 偏向分类外侧，但覆盖完整局部椭圆；半径连续，不存在固定三层扇面。
            const node: ArticleGraphNode = {
                id, label: post.title, kind: 'article', url: post.url, category: group.id,
                x: single ? 105 + Math.cos(angle) * radius * 390
                    : centerX + Math.cos(angle) * radius * spread,
                y: single ? Math.sin(angle) * radius * 295
                    : centerY + Math.sin(angle) * radius * spread * 0.8,
            }
            graph.nodes.push(node)
            leaves.push(node)
            graph.edges.push({ id: node.id, source: parent, target: node })
        }
    }
    spaceArticles(leaves, parents, root)
    return graph
}
