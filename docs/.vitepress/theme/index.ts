import type { Theme } from 'vitepress'
import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import BlogList from './components/BlogList.vue'
import Tags from './components/Tags.vue'
import Valine from './components/Valine.vue'
import HomePage from './components/HomePage.vue'
import './style.css'

export default {
    extends: DefaultTheme,
    Layout: () => h(DefaultTheme.Layout, null, {
        'doc-after': () => h(Valine),
    }),
    /** 保留旧文章中的组件标签，使迁移无需修改正文。 */
    enhanceApp({ app }) {
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
    },
} satisfies Theme
