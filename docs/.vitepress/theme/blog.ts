import type { BlogListProps, BlogPost, BlogSourcePost } from '../../../src/types/blog.ts'
import { normalizeTag, normalizeTags } from './tags.ts'

/** 将原始文件路径编码为 URL，保留目录分隔符；输入必须是未编码路径。 */
export function encodePostPath(path: string): string {
    return path.split('/').map(encodeURIComponent).join('/')
}

/** 从重写后的逻辑页面路径恢复旧站评论标识，不使用物理分组路径。 */
export function getCommentPath(relativePath: string): string {
    const path = relativePath.replace(/(^|\/)(?:README|index)\.md$/, '$1').replace(/\.md$/, '.html')
    return `/blog/${encodeURI(path.replace(/^\//, '')).replace(/\?/g, '%3F').replace(/#/g, '%23')}`
}

/** 从目录 README 的正文提取短摘要，避免卡片重复显示标题。 */
export function summarizeMarkdown(source = ''): string {
    const content = source
        .replace(/^---[\s\S]*?---\s*/u, '')
        .replace(/<!--[\s\S]*?-->/gu, '')
        .replace(/<(?:script|style)\b[^>]*>[\s\S]*?<\/(?:script|style)>/giu, '')
        .replace(/```[\s\S]*?```/gu, '')
    const headings = [...content.matchAll(/^#{1,6}\s+(.+)$/gmu)]
        .map(match => match[1].replace(/[`*_~]/g, '').replace(/^\s*\d+[、.)]\s*/u, '').trim())
        .filter(Boolean)
        .slice(0, 2)
    const paragraph = content.split(/\r?\n/)
        .map(line => line.trim())
        .find(line => line.length > 8 && !/^(?:[#>|+*-]|\d+[.)、])\s*/u.test(line) && !/^\|/.test(line))
    const summary = paragraph || headings.join('；')
    return summary ? `${summary.replace(/\s+/gu, ' ').slice(0, 100)}${summary.length > 100 ? '…' : ''}` : ''
}

/** 将摘要中的有限行内 Markdown 转成安全 HTML，供文章卡片展示。 */
export function renderInlineMarkdown(source = ''): string {
    const htmlEntities: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    }
    const escaped = source.replace(/[&<>"']/gu, character => htmlEntities[character] ?? character)
    const codeSpans: string[] = []
    const protectedSource = escaped.replace(/`([^`\n]+)`/gu, (_, code: string) => {
        const index = codeSpans.push(`<code>${code}</code>`) - 1
        return `\u0000${index}\u0000`
    })
    const rendered = protectedSource
        .replace(/\*\*([^*\n]+)\*\*/gu, '<strong>$1</strong>')
        .replace(/__([^_\n]+)__/gu, '<strong>$1</strong>')
    return rendered.replace(/\u0000(\d+)\u0000/gu, (_, index: string) => codeSpans[Number(index)] ?? '')
}

/** 明确时区的秒级显示，避免构建端与浏览器使用不同本地时区。 */
export function formatPostDateTime(value: string): string {
    if (!value || !value.includes('T')) return value
    const date = new Date(value)
    if (!Number.isFinite(date.getTime())) return ''
    return new Intl.DateTimeFormat('sv-SE', {
        timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
    }).format(date)
}

function preciseTimestamp(value: unknown): string | undefined {
    const raw = value instanceof Date ? (value.toISOString().endsWith('T00:00:00.000Z') ? '' : value.toISOString()) : String(value ?? '')
    if (!/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?$/.test(raw)) return undefined
    const zoned = raw.replace(' ', 'T') + (/(?:Z|[+-]\d{2}:?\d{2})$/.test(raw) ? '' : '+08:00')
    const date = new Date(zoned)
    return Number.isFinite(date.getTime()) ? date.toISOString() : undefined
}

/** 规范化文章元数据并按日期倒序排列，保留无日期文章。 */
export function mapPosts(pages: BlogSourcePost[]): BlogPost[] {
    return pages.map(({ url, src, frontmatter, gitDateTime, recordTimeSource }) => {
        const isCategoryIndex = /(?:\/README(?:\.html)?|\/)$/u.test(url)
        const tags = Array.isArray(frontmatter.tags) ? frontmatter.tags : String(frontmatter.tags ?? '').split('|')
        const date = frontmatter.date instanceof Date ? frontmatter.date.toISOString().slice(0, 10) : String(frontmatter.date ?? '')
        const declaredTime = preciseTimestamp(frontmatter.date)
        const dateTime = declaredTime || preciseTimestamp(gitDateTime)
        return {
            url: encodePostPath(url.replace(/\/README(?:\.html)?$/, '/')),
            title: String(frontmatter.title || url.split('/').pop()?.replace(/\.html$/, '') || '未命名文章'),
            date: dateTime ? formatPostDateTime(dateTime).slice(0, 10) : date,
            dateTime,
            dateTimeSource: dateTime ? (declaredTime ? 'frontmatter' as const : recordTimeSource || 'git' as const) : undefined,
            tags: normalizeTags(tags),
            type: String(frontmatter.type ?? ''),
            note: isCategoryIndex ? summarizeMarkdown(src) || String(frontmatter.note ?? '') : String(frontmatter.note ?? ''),
        }
    }).sort((a, b) => (Date.parse(b.dateTime || b.date) || 0) - (Date.parse(a.dateTime || a.date) || 0))
}

/** 根据组件筛选条件返回文章，保持构建时的时间顺序。 */
export function filterPosts(posts: BlogPost[], filters: BlogListProps): BlogPost[] {
    return posts.filter(post => (!filters.type || post.type === filters.type) && (!filters.tag || !/\/$|\/(?:README|index)\.html$/.test(post.url) && post.tags.includes(normalizeTag(filters.tag))))
}
