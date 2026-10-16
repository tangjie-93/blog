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
}

export interface CommentSettings {
    serverURL: string
}
