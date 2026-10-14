import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'

const script = fileURLToPath(new URL('../scripts/check-build.mjs', import.meta.url))

for (const base of ['/', '/blog/']) {
  test(`build check resolves links under ${base} and rejects broken paths`, () => {
    const root = mkdtempSync(join(tmpdir(), 'blog-build-'))
    try {
      const output = join(root, 'docs/.vitepress/dist')
      mkdirSync(join(output, 'articles'), { recursive: true })
      writeFileSync(join(root, 'docs/README.md'), '# Home')
      writeFileSync(join(output, 'articles/中文.html'), '<div class="vp-doc">Article</div>')
      mkdirSync(join(output, 'assets'))
      writeFileSync(join(output, 'assets/style.test.css'), '.VPNav{display:flex}')
      writeFileSync(join(output, 'assets/waline.test.css'), '.wl-panel{display:flex}')
      const check = (href, stylesheet = 'style.test.css') => {
        writeFileSync(join(output, 'index.html'), `<link rel="stylesheet" href="${base}assets/${stylesheet}"><div class="vp-doc"><a href="${href}">Article</a></div>`)
        return spawnSync(process.execPath, [script], {
          cwd: root, env: { ...process.env, VITEPRESS_BASE: base }, encoding: 'utf8'
        })
      }
      for (const href of [`${base}articles/%E4%B8%AD%E6%96%87.html`, 'articles/中文.html']) {
        const result = check(href)
        assert.equal(result.status, 0, result.stderr)
      }
      assert.notEqual(check(`${base}articles/中文.html`, 'waline.test.css').status, 0)
      assert.notEqual(check(`${base}missing.html`).status, 0)
      if (base !== '/') assert.notEqual(check('/articles/中文.html').status, 0)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
}
