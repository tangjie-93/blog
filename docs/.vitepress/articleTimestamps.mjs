import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs'
import { resolve } from 'node:path'
import { articleRoute } from './articleCategories.mjs'

const snapshotPath = 'docs/.vitepress/article-history.generated.json'
const snapshotVersion = 1
const dayFormat = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' })

function historyKey(path) {
  if (!path.startsWith('docs/articles/') || !path.endsWith('.md')) return undefined
  return `/${articleRoute(path.slice(5)).replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '.html')}`
}

/** Git 按从新到旧的拓扑顺序输出。重命名把较旧的路径映射到文章的新路径。 */
export function parseArticleTimestamps(history) {
  const timestamps = new Map()
  const aliases = new Map()
  const fields = history.split('\0')
  let timestamp = ''
  let time = NaN
  let day = ''
  for (let index = 0; index < fields.length; index++) {
    const field = fields[index].trim()
    if (field.startsWith('@@DATE@@')) {
      timestamp = field.slice(8)
      time = Date.parse(timestamp)
      day = Number.isFinite(time) ? dayFormat.format(time) : ''
      continue
    }
    if (!field.startsWith(':')) continue
    const [, , oldBlob, newBlob, status] = field.split(' ')
    const oldKey = historyKey(fields[++index])
    const renamed = status.startsWith('R')
    const key = renamed ? historyKey(fields[++index]) : oldKey
    if (!day || !key || !/^[AMR]/.test(status)) continue
    const target = aliases.get(key) ?? key
    if (renamed && oldKey && oldKey !== key) aliases.set(oldKey, target)
    // 内容未变的移动或权限变更不参与创建、更新时间计算。
    if (oldBlob === newBlob) continue
    const record = timestamps.get(target) ?? { first: timestamp, byDay: {} }
    if (time < Date.parse(record.first)) record.first = timestamp
    if (!record.byDay[day] || time < Date.parse(record.byDay[day])) record.byDay[day] = timestamp
    if (status !== 'A' && (!record.updated || time > Date.parse(record.updated))) record.updated = timestamp
    timestamps.set(target, record)
  }
  return timestamps
}

function git(root, args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] })
}

function sourceCommit(root) {
  try {
    if (git(root, ['rev-parse', '--is-shallow-repository']).trim() === 'false') {
      return git(root, ['rev-parse', 'HEAD']).trim()
    }
  } catch { /* 发布环境可能没有 Git。 */ }
}

function readHistory(root, commit) {
  return parseArticleTimestamps(git(root, ['log', '--topo-order', '--format=%x00@@DATE@@%aI', '--raw', '--no-abbrev', '-z', '--find-renames', commit, '--', 'docs/articles']))
}

export function loadArticleTimestamps(root) {
  const commit = sourceCommit(root)
  if (commit) return readHistory(root, commit)
  try {
    const snapshot = JSON.parse(readFileSync(resolve(root, snapshotPath), 'utf8'))
    if (snapshot.version === snapshotVersion && /^[a-f0-9]{40,64}$/.test(snapshot.commit) && Array.isArray(snapshot.records)) {
      return new Map(snapshot.records)
    }
    throw new Error('不支持的文章 Git 日期快照格式')
  } catch (error) {
    console.warn(error.code === 'ENOENT'
      ? '[文章日期] 无完整 Git 历史或日期快照，仅使用文章声明的日期。'
      : `[文章日期] 无法读取 Git 日期快照，仅使用文章声明的日期：${error.message}`)
    return new Map()
  }
}

/** Vercel 上传源码时临时附带快照；文件不提交，也不覆盖已有文件。 */
export function writeArticleTimestampSnapshot(root) {
  const commit = sourceCommit(root)
  if (!commit) throw new Error('生成文章日期快照需要完整的 Git 历史')
  const path = resolve(root, snapshotPath)
  const records = [...readHistory(root, commit)]
  writeFileSync(path, JSON.stringify({ version: snapshotVersion, commit, records }), { flag: 'wx' })
  return () => unlinkSync(path)
}
