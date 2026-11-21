import type { BlogPost } from '../../src/types/blog'
import { createContentLoader } from 'vitepress'
import { mapPosts } from './theme/blog'
import { articleRoute } from './articleCategories.mjs'

export declare const data: BlogPost[]

export default createContentLoader('articles/*/**/*.md', {
  includeSrc: true,
  transform: pages => mapPosts(pages.map(page => ({ ...page, url: `/${articleRoute(page.url.replace(/^\//, ''))}` })))
})
