import { execFileSync } from 'node:child_process'

const run = (command, args) => {
  console.log(`\n$ ${command} ${args.join(' ')}`)
  execFileSync(command, args, { stdio: 'inherit' })
}

const branch = execFileSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).trim()
const status = execFileSync('git', ['status', '--short'], { encoding: 'utf8' }).trim()
if (branch !== 'dev') throw new Error(`统一发布必须在 dev 分支执行，当前是 ${branch || 'detached HEAD'}`)
if (status) throw new Error('统一发布要求工作区干净，请先提交当前改动')

const commit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
console.log(`Publishing commit ${commit.slice(0, 7)} from ${branch}`)

// GitHub Pages is published by the repository workflow after this push.
run('git', ['push', 'origin', 'dev'])
run('pnpm', ['run', 'build'])
run('pnpm', ['exec', 'wrangler', 'pages', 'deploy', 'docs/.vitepress/dist', '--project-name', 'tangjie-blog', '--branch', 'dev', '--commit-hash', commit])
run('vercel', ['--prod', '--yes'])

console.log(`\nPublished commit ${commit.slice(0, 7)} to GitHub Pages, Cloudflare Pages and Vercel.`)
