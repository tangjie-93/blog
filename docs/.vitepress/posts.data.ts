import type { BlogPost } from '../../src/types/blog'
import { createContentLoader } from 'vitepress'
import { mapPosts } from './theme/blog'
import { articleRoute } from './articleCategories.mjs'
import { loadArticleTimestamps } from './articleTimestamps.mjs'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../', import.meta.url))

export declare const data: BlogPost[]

export default createContentLoader('articles/*/**/*.md', {
  includeSrc: true,
  transform: pages => {
    const timestamps = loadArticleTimestamps(root)
    const posts = mapPosts(pages.map(page => {
      const url = `/${articleRoute(page.url.replace(/^\//, ''))}`
      return { ...page, url, gitDates: timestamps.get(url) }
    }))
    const undated = posts.filter(post => !post.date)
    if (undated.length) {
      throw new Error(`以下文章缺少有效的创建日期且没有 Git 记录，请在 frontmatter 填写 date：\n${undated.map(post => decodeURIComponent(post.url)).join('\n')}`)
    }
    return posts
  }
})
