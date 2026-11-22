import type { BlogPost } from '../../src/types/blog'
import { createContentLoader } from 'vitepress'
import { mapPosts } from './theme/blog'
import { articleRoute } from './articleCategories.mjs'
import { loadArticleTimestamps, resolveArticleTimestamp } from './articleTimestamps.mjs'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../', import.meta.url))

export declare const data: BlogPost[]

export default createContentLoader('articles/*/**/*.md', {
  includeSrc: true,
  transform: pages => {
    const timestamps = loadArticleTimestamps(root)
    return mapPosts(pages.map(page => {
      const url = `/${articleRoute(page.url.replace(/^\//, ''))}`
      const record = resolveArticleTimestamp(url, page.frontmatter.date, timestamps, root)
      return { ...page, url, gitDateTime: record?.value, recordTimeSource: record?.source }
    }))
  }
})
