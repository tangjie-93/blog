export interface BlogPost {
    url: string
    title: string
    date: string
    tags: string[]
    type: string
    note: string
}

export interface BlogSourcePost {
    url: string
    src?: string
    frontmatter: Record<string, unknown>
}

export interface BlogListProps {
    tag?: string
    type?: string
    /** 铺满一屏：按容器可用空间计算每页数量，由调用页负责提供固定高度。 */
    fitScreen?: boolean
}

export interface CommentSettings {
    serverURL: string
}
