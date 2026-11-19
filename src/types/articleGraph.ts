import type { BlogPost } from './blog'

export interface ArticleGraphNode {
    id: string
    label: string
    kind: 'root' | 'category' | 'article'
    x: number
    y: number
    url?: string
    category?: string
    count?: number
}

export interface ArticleGraphEdge {
    id: string
    source: ArticleGraphNode
    target: ArticleGraphNode
}

export interface ArticleGraphCategory {
    id: string
    label: string
    count: number
}

export interface ArticleGraph {
    nodes: ArticleGraphNode[]
    edges: ArticleGraphEdge[]
    categories: ArticleGraphCategory[]
    articles: BlogPost[]
}
