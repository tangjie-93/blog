import type { BlogListProps, BlogPost, BlogSourcePost } from '../../../src/types/blog.ts'
import { normalizeTag, normalizeTags } from './tags.ts'

/** 将原始文件路径编码为 URL，保留目录分隔符；输入必须是未编码路径。 */
export function encodePostPath(path: string): string {
    return path.split('/').map(encodeURIComponent).join('/')
}

function articlePagePath(relativePath: string): string {
    return relativePath.replace(/^\//, '').replace(/(^|\/)(?:README|index)\.md$/, '$1').replace(/\.md$/, '.html')
}

/** 正文相对路径与归档数据使用同一个逻辑 URL，不带部署 base。 */
export function getPostPageUrl(relativePath: string): string {
    return encodePostPath(`/${articlePagePath(relativePath)}`)
}

/** 从重写后的逻辑页面路径恢复旧站评论标识，不使用物理分组路径。 */
export function getCommentPath(relativePath: string): string {
    return `/blog/${encodeURI(articlePagePath(relativePath)).replace(/\?/g, '%3F').replace(/#/g, '%23')}`
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

function preciseTimestamp(value: string): string | undefined {
    if (!/^\d{4}-\d{2}-\d{2}[T ](?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?$/.test(value) || !calendarDate(value.slice(0, 10))) return undefined
    const zoned = value.replace(' ', 'T') + (/(?:Z|[+-]\d{2}:?\d{2})$/.test(value) ? '' : '+08:00')
    const date = new Date(zoned)
    return Number.isFinite(date.getTime()) ? date.toISOString() : undefined
}

function calendarDate(value: string): string | undefined {
    const parts = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(value)
    if (!parts) return undefined
    const [, year, month, day] = parts
    const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    const date = new Date(isoDate)
    return Number.isFinite(date.getTime()) && date.toISOString().startsWith(isoDate) ? isoDate : undefined
}

type PostDate = { date: string, time?: string, source: 'frontmatter' | 'git' }

function timestampDate(value: string, source: PostDate['source']): PostDate | undefined {
    const time = preciseTimestamp(value)
    return time ? { date: formatPostDateTime(time).slice(0, 10), time, source } : undefined
}

function declaredPostDate(value: unknown): PostDate | undefined {
    if (value instanceof Date && !Number.isFinite(value.getTime())) return undefined
    const raw = value instanceof Date ? value.toISOString().replace(/T00:00:00\.000Z$/, '') : String(value ?? '').trim()
    const date = calendarDate(raw)
    return date ? { date, source: 'frontmatter' } : timestampDate(raw, 'frontmatter')
}

/** 任一侧仅有日期时，只比较北京时间自然日。 */
function comparePostDates(a: PostDate, b: PostDate): number {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1
    return a.time && b.time ? Date.parse(a.time) - Date.parse(b.time) : 0
}

function resolvePostDates(frontmatter: BlogSourcePost['frontmatter'], gitDates: BlogSourcePost['gitDates']) {
    const declared = declaredPostDate(frontmatter.date)
    const matching = declared && !declared.time ? gitDates?.byDay[declared.date] : undefined
    const gitCreation = matching || (!declared ? gitDates?.first : undefined)
    const created = (gitCreation ? timestampDate(gitCreation, 'git') : undefined) ?? declared
    const declaredUpdate = declaredPostDate(frontmatter.updated)
    const gitUpdate = gitDates?.updated ? timestampDate(gitDates.updated, 'git') : undefined
    const updated = declaredUpdate && (!gitUpdate || comparePostDates(declaredUpdate, gitUpdate) > 0) ? declaredUpdate : gitUpdate
    return {
        created,
        updated: updated && (!created || comparePostDates(updated, created) >= 0)
            ? updated
            : created && { ...created, source: 'creation' as const },
    }
}

/**
 * 规范化正式文章元数据并按日期倒序排列，排除教程示例资料。
 * @param pages 使用逻辑页面路径的原始文章数据。
 * @returns 保留无日期文章、排除 examples 目录后的文章列表。
 */
export function mapPosts(pages: BlogSourcePost[]): BlogPost[] {
    const posts = pages.filter(page => !/^\/articles\/[^/]+\/examples(?:\/|$)/u.test(page.url)).map(({ url, src, frontmatter, gitDates }) => {
        const isCategoryIndex = /(?:\/README(?:\.html)?|\/)$/u.test(url)
        const tags = Array.isArray(frontmatter.tags) ? frontmatter.tags : String(frontmatter.tags ?? '').split('|')
        const { created, updated } = resolvePostDates(frontmatter, gitDates)
        return {
            url: encodePostPath(url.replace(/\/README(?:\.html)?$/, '/')),
            title: String(frontmatter.title || url.split('/').pop()?.replace(/\.html$/, '') || '未命名文章'),
            date: created?.date ?? '',
            createdYear: created ? Number(created.date.slice(0, 4)) : undefined,
            dateTime: created?.time,
            dateSource: created?.source,
            updated: updated?.date,
            updatedTime: updated?.time,
            updatedSource: updated?.source,
            tags: normalizeTags(tags),
            type: String(frontmatter.type ?? ''),
            note: isCategoryIndex ? summarizeMarkdown(src) || String(frontmatter.note ?? '') : String(frontmatter.note ?? ''),
        }
    })
    return sortPostsByDate(posts, 'newest')
}

/** 根据组件筛选条件返回文章，保持构建时的时间顺序。 */
export function filterPosts(posts: BlogPost[], filters: BlogListProps): BlogPost[] {
    return posts.filter(post => (!filters.type || post.type === filters.type) && (!filters.tag || !/\/$|\/(?:README|index)\.html$/.test(post.url) && post.tags.includes(normalizeTag(filters.tag))))
}

export type PostYearFilter = 'all' | number | 'unknown'
export type PostDateOrder = 'newest' | 'oldest'

/** 按当前归档范围统计年份，未注明的单独计数。 */
export function postYearCounts(posts: readonly BlogPost[]): { value: PostYearFilter, count: number }[] {
    const counts = new Map<number, number>()
    let unknown = 0
    for (const { createdYear } of posts) {
        if (createdYear === undefined) unknown++
        else counts.set(createdYear, (counts.get(createdYear) ?? 0) + 1)
    }
    const options: { value: PostYearFilter, count: number }[] = [{ value: 'all', count: posts.length }]
    for (const [year, count] of [...counts].sort(([a], [b]) => b - a)) options.push({ value: year, count })
    if (unknown) options.push({ value: 'unknown', count: unknown })
    return options
}

/** 按显示时间排序，保留相同时间的原顺序，无有效时间的文章置后。 */
export function sortPostsByDate(posts: readonly BlogPost[], order: PostDateOrder): BlogPost[] {
    return posts.map(post => ({ post, time: Date.parse(post.dateTime || calendarDate(post.date) || '') }))
        .sort((a, b) => {
            if (!Number.isFinite(a.time)) return Number.isFinite(b.time) ? 1 : 0
            if (!Number.isFinite(b.time)) return -1
            return order === 'newest' ? b.time - a.time : a.time - b.time
        })
        .map(({ post }) => post)
}
