export interface BlogPost {
    url: string
    title: string
    /** 文章创建日期（北京时间），用于归档。 */
    date: string
    createdYear?: number
    dateTime?: string
    dateSource?: 'frontmatter' | 'git'
    updated?: string
    updatedTime?: string
    updatedSource?: 'frontmatter' | 'git' | 'creation'
    tags: string[]
    type: string
    note: string
}

export interface BlogSourcePost {
    url: string
    src?: string
    gitDates?: {
        first: string
        byDay: Record<string, string>
        updated?: string
    }
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
