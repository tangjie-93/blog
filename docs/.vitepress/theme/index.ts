import { useData, type Theme } from 'vitepress'
import { h } from 'vue'
import { ElConfigProvider, ID_INJECTION_KEY, ZINDEX_INJECTION_KEY } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import DefaultTheme from 'vitepress/theme'
import BlogList from './components/BlogList.vue'
import ArticleDates from './components/ArticleDates.vue'
import { data as posts } from '../posts.data'
import { getPostPageUrl } from './blog'
import Tags from './components/Tags.vue'
import Valine from './components/Valine.vue'
import HomePage from './components/HomePage.vue'
import RunnableExample from './components/RunnableExample.vue'
import './style.css'
import './element.css'

function numberDocumentOutline() {
    const links = document.querySelectorAll<HTMLElement>('.VPDocOutlineItem.root > li > .outline-link')
    links.forEach((link, index) => {
        const text = link.textContent?.trim() || ''
        if (/^(?:\d+[.、)）]|[一二三四五六七八九十]+、)/u.test(text)) return
        link.textContent = `${index + 1}、${text}`
    })
}

function numberDocumentHeadings() {
    const headings = document.querySelectorAll<HTMLElement>('.vp-doc h2, .vp-doc h3')
    let section = 0
    let subsection = 0
    headings.forEach((heading) => {
        const text = heading.textContent?.trim() || ''
        const isSubsection = heading.tagName === 'H3'
        if (!isSubsection) {
            section += 1
            subsection = 0
        } else {
            subsection += 1
        }
        if (/^(?:\d+(?:[.、)）]|\s+)|[一二三四五六七八九十]+、)/u.test(text)) return
        const prefix = isSubsection ? `${section}.${subsection} ` : `${section}、`
        heading.insertBefore(document.createTextNode(prefix), heading.firstChild)
    })
}

/** pageClass 可同时声明多个类名，逐项匹配以免归档页误挂评论区。 */
function hasPageClass(pageClass: unknown, name: string): boolean {
    return String(pageClass ?? '').split(/\s+/).includes(name)
}

export default {
    extends: DefaultTheme,
    Layout: () => {
        const { page } = useData()
        return h(ElConfigProvider, { locale: zhCn }, () => h(DefaultTheme.Layout, null, {
            'doc-before': () => {
                if (!page.value.relativePath.startsWith('articles/')) return null
                const url = getPostPageUrl(page.value.relativePath)
                const post = posts.find(post => post.url === url)
                return post ? h(ArticleDates, { post }) : null
            },
            'doc-after': () => page.value.relativePath.startsWith('articles/') && !hasPageClass(page.value.frontmatter.pageClass, 'blog-archive') ? h(Valine) : null,
        }))
    },
    /** 保留旧文章中的组件标签，使迁移无需修改正文。 */
    enhanceApp({ app, router }) {
        app.provide(ID_INJECTION_KEY, { prefix: 1024, current: 0 })
        app.provide(ZINDEX_INJECTION_KEY, { current: 0 })
        app.component('BlogList', BlogList)
        app.component('Tags', Tags)
        app.component('Valine', Valine)
        app.component('HomePage', HomePage)
        app.component('RunnableExample', RunnableExample)
        if (import.meta.env.PROD && typeof window !== 'undefined') {
            Object.defineProperty(window, '__GIT_INFO__', {
                value: Object.freeze({
                    id: import.meta.env.VITE_GIT_COMMIT_ID || 'unknown',
                    shortId: (import.meta.env.VITE_GIT_COMMIT_ID || 'unknown').slice(0, 7),
                    branch: import.meta.env.VITE_GIT_BRANCH || 'unknown',
                    commitTime: import.meta.env.VITE_GIT_COMMIT_TIME || 'unknown',
                    buildTime: import.meta.env.VITE_BUILD_TIME || 'unknown',
                    version: import.meta.env.VITE_APP_VERSION || 'unknown',
                }),
                configurable: false,
                enumerable: false,
                writable: false,
            })
        }
        router.onAfterRouteChanged = () => {
            if (typeof window !== 'undefined') window.setTimeout(() => {
                numberDocumentHeadings()
                numberDocumentOutline()
                document.querySelectorAll<HTMLElement>('.VPSidebarItem .text').forEach((title) => {
                    title.title = title.textContent?.trim() || ''
                })
            }, 0)
        }
    },
} satisfies Theme
