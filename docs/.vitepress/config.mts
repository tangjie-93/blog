import { defineConfig } from 'vitepress'
import { fileURLToPath } from 'node:url'
import { createNavigation } from './navigation.mjs'

const { nav, sidebar } = createNavigation(fileURLToPath(new URL('../articles', import.meta.url)))

export default defineConfig({
  lang: 'zh-CN',
  title: '前端技术积累',
  description: '记录前端学习与实践，分享 JavaScript、Vue、WebGL、工程化和算法的深入思考。',
  base: '/',
  cleanUrls: false,
  rewrites: (path) => path.replace(/(^|\/)README\.md$/, '$1index.md'),
  head: [['link', { rel: 'icon', href: '/image/logo.png' }]],
  markdown: { lineNumbers: true },
  themeConfig: {
    logo: '/image/logo.png',
    nav: [
      { text: '首页', link: '/' },
      { text: '文章', link: '/timeline/' },
      { text: '技术栈', items: nav },
      { text: '标签', link: '/tags/' },
      { text: '充电站', link: '/summarize/' },
      { text: '关于', link: '/about/' },
      { text: '留言', link: '/comments/' }
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
    footer: { message: '记录 · 实践 · 分享', copyright: '前端技术积累 · tangjie-93' }
  }
})
