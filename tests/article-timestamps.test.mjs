import assert from 'node:assert/strict'
import test from 'node:test'
import { mkdtempSync, mkdirSync, writeFileSync, utimesSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { parseArticleTimestamps, resolveArticleTimestamp } from '../docs/.vitepress/articleTimestamps.mjs'

test('article history resolves earliest same-day record across physical directory migration', () => {
  const history = [
    '@@DATE@@2026-11-22T23:30:45+08:00', 'docs/articles/人工智能/ai/demo.md',
    '@@DATE@@2026-11-21T20:22:11+08:00', 'docs/articles/人工智能/ai/demo.md',
    '@@DATE@@2026-11-21T01:02:03+08:00', 'docs/articles/ai/demo.md',
  ].join('\n')
  const timestamps = parseArticleTimestamps(history)
  assert.deepEqual(resolveArticleTimestamp('/articles/ai/demo.html', '2026-11-21', timestamps), { value: '2026-11-21T01:02:03+08:00', source: 'git' })
  assert.deepEqual(resolveArticleTimestamp('/articles/ai/demo.html', '2026-11-22', timestamps), { value: '2026-11-22T23:30:45+08:00', source: 'git' })
  assert.deepEqual(resolveArticleTimestamp('/articles/ai/demo.html', '2020-01-01', timestamps), { value: '2026-11-22T23:30:45+08:00', source: 'git-edit' })
  assert.deepEqual(resolveArticleTimestamp('/articles/ai/demo.html', '2026-11-21T14:30:00+08:00', timestamps), undefined)
})

test('untracked articles fall back to file edits without overriding Git history', () => {
  const root = mkdtempSync(join(tmpdir(), 'blog-timestamps-'))
  try {
    const folder = join(root, 'docs/articles/人工智能/ai')
    mkdirSync(folder, { recursive: true })
    const file = join(folder, 'draft.md')
    writeFileSync(file, '# draft')
    const modified = new Date('2026-11-22T01:02:03Z')
    utimesSync(file, modified, modified)
    assert.deepEqual(resolveArticleTimestamp('/articles/ai/draft.html', '2020-01-01', new Map(), root), { value: modified.toISOString(), source: 'file-edit' })
    const history = parseArticleTimestamps('@@DATE@@2020-02-01T01:00:00Z\ndocs/articles/ai/draft.md')
    assert.equal(resolveArticleTimestamp('/articles/ai/draft.html', '2020-01-01', history, root).source, 'git-edit')
    assert.equal(resolveArticleTimestamp('/articles/ai/missing.html', '2020-01-01', new Map(), root), undefined)
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('Git timestamps crossing UTC midnight use the Beijing calendar day', () => {
  const timestamps = parseArticleTimestamps('@@DATE@@2026-11-21T20:00:01Z\ndocs/articles/ai/demo.md')
  assert.deepEqual(resolveArticleTimestamp('/articles/ai/demo.html', '2026-11-22', timestamps), { value: '2026-11-21T20:00:01Z', source: 'git' })
  assert.deepEqual(resolveArticleTimestamp('/articles/ai/demo.html', '2026-11-21', timestamps), { value: '2026-11-21T20:00:01Z', source: 'git-edit' })
})
