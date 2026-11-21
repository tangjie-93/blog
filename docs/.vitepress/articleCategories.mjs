import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { articleGroups } from './articleTaxonomy.mjs'
export { articleGroups } from './articleTaxonomy.mjs'

export function articleSourcePath(category) {
  const group = articleGroups.find(group => group.categories.includes(category))
  return group ? `${group.directory}/${category}` : category
}

/** 仅去掉已知的“分组 / 专题”前缀，不吞掉示例目录等后续路径。 */
export function articleRoute(path) {
  const normalized = path.replaceAll('\\', '/')
  for (const group of articleGroups) {
    for (const category of group.categories) {
      const prefix = `articles/${group.directory}/${category}/`
      if (normalized.startsWith(prefix)) return `articles/${category}/${normalized.slice(prefix.length)}`
    }
  }
  return normalized
}

export function rewriteArticlePath(path) {
  return articleRoute(path).replace(/(^|\/)README\.md$/, '$1index.md')
}

/** 兼容平铺测试夹具；实际文章只从清晰的二级专题目录读取。 */
export function discoverArticleCategories(root) {
  const result = []
  const add = category => {
    if (result.some(item => item.name === category.name)) throw new Error(`重复专题目录：${category.name}`)
    result.push(category)
  }
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const group = articleGroups.find(group => group.directory === entry.name)
    if (group) {
      for (const child of readdirSync(join(root, entry.name), { withFileTypes: true })) {
        if (!child.isDirectory()) continue
        if (!group.categories.includes(child.name)) throw new Error(`未登记的专题：${entry.name}/${child.name}，请更新 articleCategories.mjs`)
        add({ name: child.name, directory: join(root, entry.name, child.name) })
      }
    } else {
      add({ name: entry.name, directory: join(root, entry.name) })
    }
  }
  return result.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
}
