import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const run = (args, fallback) => {
  try {
    return execFileSync('git', args, { encoding: 'utf8' }).trim() || fallback
  } catch {
    return fallback
  }
}

const first = (...values) => values.find(value => value && value !== 'unknown') || 'unknown'
const commitId = first(
  process.env.VERCEL_GIT_COMMIT_SHA,
  process.env.CF_PAGES_COMMIT_SHA,
  process.env.GITHUB_SHA,
  run(['rev-parse', 'HEAD'], 'unknown')
)
const info = {
  id: commitId,
  shortId: commitId === 'unknown' ? 'unknown' : commitId.slice(0, 7),
  branch: first(
    process.env.VERCEL_GIT_COMMIT_REF,
    process.env.CF_PAGES_BRANCH,
    process.env.GITHUB_REF_NAME,
    run(['branch', '--show-current'], 'unknown')
  ),
  commitTime: first(process.env.VERCEL_GIT_COMMIT_AUTHOR_DATE, run(['show', '-s', '--format=%cI', 'HEAD'], 'unknown')),
  buildTime: new Date().toISOString(),
  version: JSON.parse(readFileSync(resolve('package.json'), 'utf8')).version
}

const envPath = resolve('.env.production.local')
const current = existsSync(envPath) ? readFileSync(envPath, 'utf8') : ''
const values = {
  VITE_GIT_COMMIT_ID: info.id,
  VITE_GIT_BRANCH: info.branch,
  VITE_GIT_COMMIT_TIME: info.commitTime,
  VITE_BUILD_TIME: info.buildTime,
  VITE_APP_VERSION: info.version
}
const lines = current.split(/\r?\n/).filter(Boolean).filter(line => !Object.hasOwn(values, line.split('=', 1)[0]))
lines.push(...Object.entries(values).map(([key, value]) => `${key}=${value}`))
writeFileSync(envPath, `${lines.join('\n')}\n`)
console.log(`Injected Git info: ${info.shortId} (${info.branch})`)
