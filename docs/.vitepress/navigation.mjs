import { readdirSync } from 'node:fs'
import { relative } from 'node:path'
import { discoverArticleCategories } from './articleCategories.mjs'
import { categoryLabels as labels } from './articleTaxonomy.mjs'

const articleLabels = {
  'OpenAI Agent 机制知识字典': 'Agent 架构全景',
  '10、前端跨域的9种解决方案': '前端跨域的8种解决方案'
}

const agentGroups = [
  ['基础与工具', file => /^(?:01-|01、|02、|21、)/u.test(file)],
  ['安全与运行时', file => /^(?:03、|04、|10、|11、|23、)/u.test(file)],
  ['状态、任务与可靠性', file => /^(?:05、|08、|09、|12、|24、|25、)/u.test(file)],
  ['多 Agent 与外部协作', file => /^(?:06、|15、|16、|17、|18、|19、)/u.test(file)],
  ['评测与产品交互', file => /^(?:22、|26、|27、)/u.test(file)],
  ['调度与综合', file => /^(?:07、|13、|14、|20、)/u.test(file)]
]

/** 根据文章目录生成分类入口和侧栏，保留中文及特殊字符的原始文件路径。 */
export function createNavigation(articlesDir) {
  const nav = []
  const sidebar = {}
  const categories = discoverArticleCategories(articlesDir)
  for (const category of categories) {
    const text = labels[category.name] || category.name
    const link = `/articles/${encodeURIComponent(category.name)}/`
    const files = readdirSync(category.directory, { withFileTypes: true })
      .filter(entry => entry.isFile() && entry.name.endsWith('.md'))
      .map(entry => entry.name)
      .sort((a, b) => a === b ? 0 : a === 'README.md' ? -1 : b === 'README.md' ? 1 : a.localeCompare(b, 'zh-CN', { numeric: true }))
    nav.push({ text, link: files.includes('README.md') ? link : `${link}${encodeURIComponent(files[0].slice(0, -3))}.html` })
    // 可点击链接使用公开路径；下方同时注册开发源码路径的侧栏匹配。
    const articleFiles = files.filter(file => file !== 'README.md')
    const articleItems = articleFiles.map((file, index) => ({
      text: `${index + 1}、${(articleLabels[file.slice(0, -3)] || file.slice(0, -3)).replace(/^\d+(?:、|-)\s*/, '').split(/\s*—+\s*/)[0]}`,
      link: `${link}${encodeURIComponent(file.slice(0, -3))}.html`
    }))
    sidebar[`/articles/${category.name}/`] = category.name === 'agent'
      ? [{ text: `${text} 专题`, ...(files.includes('README.md') ? { link } : {}) },
        ...agentGroups.map(([group, matches]) => ({ text: group,
          items: articleItems.filter((_, index) => matches(articleFiles[index])).map((item, index) => ({
            ...item,
            text: `${index + 1}、${item.text.replace(/^\d+、/, '')}`
          }))
        })).filter(group => group.items.length)]
      : [{ text: `${text} 专题`, ...(files.includes('README.md') ? { link } : {}), items: articleItems }]
    const sourcePath = relative(articlesDir, category.directory).replaceAll('\\', '/')
    sidebar[`/articles/${sourcePath}/`] = sidebar[`/articles/${category.name}/`]
  }
  return { nav, sidebar }
}
