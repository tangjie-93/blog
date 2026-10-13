import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, normalize } from 'node:path'
import { test } from 'node:test'

test('article image references match filename casing on Linux', () => {
  const files = new Set(readdirSync('docs', { recursive: true }))
  const folded = new Set([...files].map(file => file.toLowerCase()))
  const missing = []
  for (const file of files) {
    if (!file.startsWith('articles/') || !file.endsWith('.md')) continue
    const text = readFileSync(join('docs', file), 'utf8')
    for (const [link] of text.matchAll(/(?:\.\.\/)+images\/[^\s)"'<>]+/g)) {
      const target = normalize(join(dirname(file), link))
      if (folded.has(target.toLowerCase()) && !files.has(target)) missing.push(`${file}: ${link}`)
    }
  }
  assert.deepEqual(missing, [], 'Image paths must match exact on-disk filenames')
})
