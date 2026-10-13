import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import BlogList from './components/BlogList.vue'
import Tags from './components/Tags.vue'
import Valine from './components/Valine.vue'
import HomePage from './components/HomePage.vue'
import './style.css'

export default {
    extends: DefaultTheme,
    /** 保留旧文章中的组件标签，使迁移无需修改正文。 */
    enhanceApp({ app }) {
        app.component('BlogList', BlogList)
        app.component('Tags', Tags)
        app.component('Valine', Valine)
        app.component('HomePage', HomePage)
    },
} satisfies Theme
