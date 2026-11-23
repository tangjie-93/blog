import { defineConfig } from 'vitepress'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { createNavigation } from './navigation.mjs'
import { rewriteArticlePath } from './articleCategories.mjs'

const { sidebar } = createNavigation(fileURLToPath(new URL('../articles', import.meta.url)))
const base = process.env.VITEPRESS_BASE || '/'

export default defineConfig({
  lang: 'zh-CN',
  title: '前端技术积累',
  description: '记录前端学习与实践，分享 JavaScript、Vue、WebGL、工程化和算法的深入思考。',
  base,
  srcExclude: ['public/**'],
  postRender(context) {
    // VitePress 只自动输出 body teleport，补上 Element Plus 下拉浮层的 SSR 容器。
    for (const [target, content] of Object.entries(context.teleports ?? {})) {
      if (/^#el-popper-container-\d+$/.test(target)) {
        context.teleports!.body = `${context.teleports!.body ?? ''}<div id="${target.slice(1)}">${content}</div>`
      }
    }
  },
  vite: {
    optimizeDeps: { exclude: ['waline-script-asset?url', 'waline-style-asset?inline'] },
    envDir: fileURLToPath(new URL('../../', import.meta.url)),
    resolve: {
      // iframe 使用自包含 UMD 文件，避免浏览器解析外部模块依赖。
      alias: {
        'waline-script-asset?url': createRequire(import.meta.url).resolve('@waline/client/full') + '?url',
        'waline-style-asset?inline': createRequire(import.meta.url).resolve('@waline/client/style') + '?inline'
      }
    }
  },
  appearance: 'dark',
  cleanUrls: false,
  rewrites: rewriteArticlePath,
  head: [['link', { rel: 'icon', href: `${base}image/blog-mark.svg` }]],
  markdown: { lineNumbers: true },
  themeConfig: {
    logo: '/image/blog-mark.svg',
    nav: [
      { text: '首页', link: '/' },
      { text: '文章', link: '/articles/' },
      { text: 'AI 工具箱', link: '/skills/' },
      { text: '脑图', link: '/mindmap/' },
      { text: '标签', link: '/tags/' },
      { text: '留言板', link: '/comments/' }
    ],
    sidebar,
    socialLinks: [{ icon: 'github', link: 'https://github.com/tangjie-93/blog' }],
    search: { provider: 'local', options: { locales: { root: { translations: {
      button: { buttonText: '搜索文章', buttonAriaLabel: '搜索文章' },
      modal: { noResultsText: '没有找到相关内容', resetButtonTitle: '清空搜索',
        footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' } }
    } } } } },
    outline: { level: [2, 3], label: '文章目录' },
    docFooter: { prev: '上一篇', next: '下一篇' },
    returnToTopLabel: '返回顶部',
    sidebarMenuLabel: '文章导航',
    darkModeSwitchLabel: '外观',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
  }
})
