import { defineConfig } from 'vitepress'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { createNavigation } from './navigation.mjs'

const { nav, sidebar } = createNavigation(fileURLToPath(new URL('../articles', import.meta.url)))
const base = process.env.VITEPRESS_BASE || '/'

const navGroups = [
  { text: '语言与标准', categories: ['javascript', 'es6', 'typescript', 'css', 'http'] },
  { text: '框架与工程', categories: ['vue', 'vue3', 'react', 'node', 'webpack', 'linux'] },
  { text: 'AI', categories: ['agent', 'rag', 'ai-coding'] },
  { text: '后端', categories: ['python', 'java', 'langchain'] },
  { text: '图形与交互', categories: ['webgl', 'threejs'] },
  { text: '源码与算法', categories: ['jquery-source-analysis', '算法', '其他'] }
]
const navByCategory = new Map(nav.map(item => [decodeURIComponent(item.link.split('/')[2] || ''), item]))
const groupedNav = navGroups.flatMap(({ text, categories }) => {
  const items = categories.flatMap(category => {
    const item = navByCategory.get(category)
    return item ? [item] : []
  })
  return items.length ? [{ text, items }] : []
})
const groupedCategories = new Set(navGroups.flatMap(group => group.categories))
const remainingNav = nav.filter(item => !groupedCategories.has(decodeURIComponent(item.link.split('/')[2] || '')))
if (remainingNav.length) groupedNav.push({ text: '更多专题', items: remainingNav })

export default defineConfig({
  lang: 'zh-CN',
  title: '前端技术积累',
  description: '记录前端学习与实践，分享 JavaScript、Vue、WebGL、工程化和算法的深入思考。',
  base,
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
  rewrites: (path) => path.replace(/(^|\/)README\.md$/, '$1index.md'),
  head: [['link', { rel: 'icon', href: `${base}image/blog-mark.svg` }]],
  markdown: { lineNumbers: true },
  themeConfig: {
    logo: '/image/blog-mark.svg',
    nav: [
      { text: '首页', link: '/' },
      { text: '文章', link: '/timeline/' },
      { text: '技术栈', items: groupedNav },
      { text: '标签', link: '/tags/' },
      { text: '充电站', link: '/summarize/' },
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
  }
})
