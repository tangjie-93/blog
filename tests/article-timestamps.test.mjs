import assert from 'node:assert/strict'
import test from 'node:test'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, renameSync, writeFileSync, appendFileSync, copyFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { loadArticleTimestamps, writeArticleTimestampSnapshot } from '../docs/.vitepress/articleTimestamps.mjs'

test('Git records keep creation and content updates across renames and support build snapshots', () => {
  const root = mkdtempSync(join(tmpdir(), 'blog-timestamps-'))
  try {
    const repo = join(root, 'repo')
    const oldFolder = join(repo, 'docs/articles/ai')
    const newFolder = join(repo, 'docs/articles/人工智能/ai')
    mkdirSync(oldFolder, { recursive: true })
    mkdirSync(newFolder, { recursive: true })
    mkdirSync(join(repo, 'docs/.vitepress'))
    const git = (args, env = {}) => execFileSync('git', args, { cwd: repo, env: { ...process.env, ...env }, stdio: 'pipe' })
    const commit = (timestamp, message) => {
      git(['add', '-A'])
      git(['-c', 'commit.gpgsign=false', 'commit', '-m', message], { GIT_AUTHOR_DATE: timestamp, GIT_COMMITTER_DATE: timestamp })
    }
    git(['init'])
    git(['config', 'user.name', 'Blog test'])
    git(['config', 'user.email', 'blog-test@example.com'])
    const original = join(oldFolder, '旧名.md')
    const grouped = join(newFolder, '旧名.md')
    const renamed = join(newFolder, '现 名.md')
    writeFileSync(original, '# 文章\n' + '同一段内容\n'.repeat(30))
    writeFileSync(join(oldFolder, 'index.md'), '# 专题\n')
    const first = '2020-01-01T21:00:01+01:00'
    commit(first, 'add articles')
    appendFileSync(original, '早间编辑\n')
    commit('2020-01-02T08:00:00+08:00', 'edit article')
    renameSync(original, grouped)
    commit('2020-01-03T08:00:00+08:00', 'move article only')
    renameSync(grouped, renamed)
    appendFileSync(renamed, '改名并更新\n')
    const updated = '2020-01-04T08:00:00+08:00'
    commit(updated, 'rename with edits')
    const finalFile = join(newFolder, '最终 名.md')
    renameSync(renamed, finalFile)
    commit('2020-01-05T08:00:00+08:00', 'rename without edits')
    appendFileSync(finalFile, '未提交内容\n')

    const history = loadArticleTimestamps(repo)
    assert.deepEqual(history.get('/articles/ai/最终 名.html'), {
      first, updated, byDay: { '2020-01-02': first, '2020-01-04': updated },
    })
    assert.equal(history.has('/articles/ai/旧名.html'), false)
    assert.deepEqual(history.get('/articles/ai/'), { first, byDay: { '2020-01-02': first } })

    const upload = join(root, 'upload')
    mkdirSync(join(upload, 'docs/.vitepress'), { recursive: true })
    const snapshot = 'docs/.vitepress/article-history.generated.json'
    const cleanup = writeArticleTimestampSnapshot(repo)
    try {
      assert.throws(() => writeArticleTimestampSnapshot(repo), { code: 'EEXIST' })
      copyFileSync(join(repo, snapshot), join(upload, snapshot))
      assert.deepEqual(loadArticleTimestamps(upload), history)
    } finally {
      cleanup()
    }
    const cleanupAgain = writeArticleTimestampSnapshot(repo)
    cleanupAgain()
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
