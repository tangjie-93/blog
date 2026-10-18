import type { Theme } from 'vitepress'
import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import BlogList from './components/BlogList.vue'
import Tags from './components/Tags.vue'
import Valine from './components/Valine.vue'
import HomePage from './components/HomePage.vue'
import './style.css'

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

export default {
    extends: DefaultTheme,
    Layout: () => h(DefaultTheme.Layout, null, {
        'doc-after': () => h(Valine),
    }),
    /** 保留旧文章中的组件标签，使迁移无需修改正文。 */
    enhanceApp({ app, router }) {
        app.component('BlogList', BlogList)
        app.component('Tags', Tags)
        app.component('Valine', Valine)
        app.component('HomePage', HomePage)
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
            }, 0)
        }
    },
} satisfies Theme
