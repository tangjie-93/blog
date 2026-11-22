import { execFileSync } from 'node:child_process'
import { statSync } from 'node:fs'
import { resolve } from 'node:path'
import { articleSourcePath } from './articleCategories.mjs'
import { articleRoute } from './articleCategories.mjs'

/** 只采纳文章声明日期当天的最早 Git 记录；不把后续迁移或修改时间当发布时间。 */
export function parseArticleTimestamps(history) {
  const timestamps = new Map()
  let timestamp = ''
  for (const line of history.split(/\r?\n/)) {
    if (line.startsWith('@@DATE@@')) {
      timestamp = line.slice(8)
      continue
    }
    if (!timestamp || !line.startsWith('docs/articles/') || !line.endsWith('.md')) continue
    const route = `/${articleRoute(line.slice(5)).replace(/\.md$/, '.html')}`
    const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(timestamp))
    const key = `${route}|${day}`
    const previous = timestamps.get(key)
    if (!previous || Date.parse(timestamp) < Date.parse(previous)) timestamps.set(key, timestamp)
    const latestKey = `${route}|latest`
    const latest = timestamps.get(latestKey)
    if (!latest || Date.parse(timestamp) > Date.parse(latest)) timestamps.set(latestKey, timestamp)
  }
  return timestamps
}

export function loadArticleTimestamps(root) {
  try {
    return parseArticleTimestamps(execFileSync('git', ['-c', 'core.quotepath=false', 'log', '--format=@@DATE@@%aI', '--name-only', '--no-renames', '--', 'docs/articles'], { cwd: root, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 }))
  } catch {
    // 无 Git 历史的发布环境仍能构建；没有依据就保留日期精度。
    return new Map()
  }
}

export function resolveArticleTimestamp(url, date, timestamps, root) {
  const day = date instanceof Date ? date.toISOString().slice(0, 10) : String(date ?? '')
  if (day && !/^\d{4}-\d{2}-\d{2}$/.test(day)) return undefined
  const sameDay = timestamps.get(`${url}|${day}`)
  if (sameDay) return { value: sameDay, source: 'git' }
  const latest = timestamps.get(`${url}|latest`)
  if (latest) return { value: latest, source: 'git-edit' }
  if (!root) return undefined
  // 仅无 Git 记录的文件使用工作区修改时间，不能把构建机 checkout 时间覆盖真实历史。
  const segments = decodeURIComponent(url).replace(/^\/articles\//, '').split('/')
  const category = segments.shift()
  const relative = segments.join('/').replace(/\.html$/, '.md')
  if (!category || !relative || segments.includes('..')) return undefined
  const file = resolve(root, 'docs/articles', articleSourcePath(category), relative)
  try {
    return { value: statSync(file).mtime.toISOString(), source: 'file-edit' }
  } catch {
    return undefined
  }
}
