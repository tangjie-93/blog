import type { BlogPost } from '../../src/types/blog'
import { createContentLoader } from 'vitepress'
import { mapPosts } from './theme/blog'

export declare const data: BlogPost[]

export default createContentLoader('articles/**/*.md', { transform: mapPosts })
