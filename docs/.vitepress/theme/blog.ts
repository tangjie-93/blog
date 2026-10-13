import type { BlogListProps, BlogPost, BlogSourcePost } from '../../../src/types/blog.ts'

/** 将原始文件路径编码为 URL，保留目录分隔符；输入必须是未编码路径。 */
export function encodePostPath(path: string): string {
    return path.split('/').map(encodeURIComponent).join('/')
}

/** 从源文件路径恢复旧站评论标识，避免部署平台的 URL 规范化拆分评论。 */
export function getCommentPath(relativePath: string): string {
    const path = relativePath.replace(/(^|\/)(?:README|index)\.md$/, '$1').replace(/\.md$/, '.html')
    return `/blog/${encodeURI(path.replace(/^\//, '')).replace(/\?/g, '%3F').replace(/#/g, '%23')}`
}

/** 规范化文章元数据并按日期倒序排列，保留无日期文章。 */
export function mapPosts(pages: BlogSourcePost[]): BlogPost[] {
    return pages.map(({ url, frontmatter }) => {
        const tags = Array.isArray(frontmatter.tags) ? frontmatter.tags : String(frontmatter.tags ?? '').split('|')
        const date = frontmatter.date instanceof Date ? frontmatter.date.toISOString().slice(0, 10) : String(frontmatter.date ?? '')
        return {
            url: encodePostPath(url.replace(/\/README(?:\.html)?$/, '/')),
            title: String(frontmatter.title || url.split('/').pop()?.replace(/\.html$/, '') || '未命名文章'),
            date,
            tags: [...new Set(tags.map(tag => String(tag).trim()).filter(Boolean))],
            type: String(frontmatter.type ?? ''),
            note: String(frontmatter.note ?? ''),
        }
    }).sort((a, b) => (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0))
}

/** 根据组件筛选条件返回文章，保持构建时的时间顺序。 */
export function filterPosts(posts: BlogPost[], filters: BlogListProps): BlogPost[] {
    return posts.filter(post => (!filters.type || post.type === filters.type) && (!filters.tag || post.tags.includes(filters.tag)))
}
