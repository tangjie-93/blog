export interface BlogPost {
    url: string
    title: string
    date: string
    /** 有依据的完整时间；旧文章无记录时不捏造时分秒。 */
    dateTime?: string
    dateTimeSource?: 'frontmatter' | 'git' | 'git-edit' | 'file-edit'
    tags: string[]
    type: string
    note: string
}

export interface BlogSourcePost {
    url: string
    src?: string
    gitDateTime?: string
    recordTimeSource?: 'git' | 'git-edit' | 'file-edit'
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
