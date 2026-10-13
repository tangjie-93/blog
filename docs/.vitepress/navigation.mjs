import { readdirSync } from 'node:fs'
import { join } from 'node:path'

const labels = {
  css: 'CSS', es6: 'ES6', http: 'HTTP', javascript: 'JavaScript',
  'jquery-source-analysis': 'jQuery 源码', linux: 'Linux', node: 'Node.js',
  react: 'React', threejs: 'Three.js', typescript: 'TypeScript',
  vue: 'Vue', vue3: 'Vue 3', webgl: 'WebGL', webpack: 'Webpack'
}

/** 根据文章目录生成分类入口和侧栏，保留中文及特殊字符的原始文件路径。 */
export function createNavigation(articlesDir) {
  const nav = []
  const sidebar = {}
  const categories = readdirSync(articlesDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory()).sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
  for (const category of categories) {
    const text = labels[category.name] || category.name
    const link = `/articles/${encodeURIComponent(category.name)}/`
    const files = readdirSync(join(articlesDir, category.name), { withFileTypes: true })
      .filter(entry => entry.isFile() && entry.name.endsWith('.md'))
      .map(entry => entry.name)
      .sort((a, b) => a === b ? 0 : a === 'README.md' ? -1 : b === 'README.md' ? 1 : a.localeCompare(b, 'zh-CN', { numeric: true }))
    nav.push({ text, link: files.includes('README.md') ? link : `${link}${encodeURIComponent(files[0].slice(0, -3))}.html` })
    sidebar[link] = [{ text, items: files.map(file => ({
      text: file === 'README.md' ? '专题首页' : file.slice(0, -3),
      link: file === 'README.md' ? link : `${link}${encodeURIComponent(file.slice(0, -3))}.html`
    })) }]
  }
  return { nav, sidebar }
}
