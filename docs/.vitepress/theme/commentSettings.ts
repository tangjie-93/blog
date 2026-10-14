import type { CommentSettings } from '../../../src/types/blog'

export const commentSettings: CommentSettings = {
    serverURL: (import.meta.env.VITE_WALINE_SERVER_URL || 'https://tangjie-blog-comments.vercel.app').trim(),
}
