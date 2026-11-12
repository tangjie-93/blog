import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { test } from 'node:test'

const moved = {
  'docs/articles/git/README.md': 'docs/public/articles/其他/index.html',
  'docs/articles/javascript/正则表达式总结.md': 'docs/public/articles/其他/正则表达式总结.html',
  'docs/articles/webgl/canvas基础api总结.md': 'docs/public/articles/其他/canvas基础api总结.html',
  'docs/articles/linux/docker学习总结.md': 'docs/public/articles/其他/docker学习总结.html',
  'docs/articles/linux/nginx.md': 'docs/public/articles/其他/nginx.html',
  'docs/articles/http/Protobuf在vue中的使用.md': 'docs/public/articles/其他/Protobuf在vue中的使用.html',
  'docs/articles/webpack/性能优化总结.md': 'docs/public/articles/其他/性能优化总结.html',
}

test('legacy 其他 articles keep redirect files after category migration', () => {
  for (const [article, redirect] of Object.entries(moved)) {
    assert.equal(existsSync(article), true, `${article} should exist`)
    assert.equal(existsSync(redirect), true, `${redirect} should exist`)
  }
  assert.equal(existsSync('docs/articles/其他'), false)
  assert.match(readFileSync('docs/public/_redirects', 'utf8'), /\/articles\/%E5%85%B6%E4%BB%96\//)
})
