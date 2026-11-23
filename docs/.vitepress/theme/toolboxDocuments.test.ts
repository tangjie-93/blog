import assert from 'node:assert/strict'
import test from 'node:test'
import { skills } from './skillCatalog.ts'
import { createZipBytes, renderMarkdown, skillDocumentFiles } from './toolboxDocuments.ts'

test('skill documents include a main SKILL.md and a scenario reference', () => {
    const files = skillDocumentFiles(skills[0])
    assert.deepEqual(files.map(file => file.relativePath), ['SKILL.md', 'references/scenarios.md'])
    assert.match(files[0].path, /^skills\/[^/]+\/[^/]+\/SKILL\.md$/)
    assert.match(files[0].content, /^# /)
    assert.match(files[1].content, /## 场景指令/)
})

test('markdown preview renders limited syntax and escapes embedded HTML', () => {
    const html = renderMarkdown('# 标题\n\n`<b>` 与 **加粗**\n\n- 第一项\n- 第二项')
    assert.equal(html, '<h1>标题</h1>\n<p><code>&lt;b&gt;</code> 与 <strong>加粗</strong></p>\n<ul><li>第一项</li><li>第二项</li></ul>')
})

test('skill archive is a valid uncompressed ZIP with UTF-8 entry names', () => {
    const bytes = createZipBytes([{ path: 'SKILL.md', content: '你好' }])
    const view = new DataView(bytes.buffer)
    assert.equal(view.getUint32(0, true), 0x04034b50)
    const nameLength = view.getUint16(26, true)
    assert.equal(new TextDecoder().decode(bytes.slice(30, 30 + nameLength)), 'SKILL.md')
    assert.equal(view.getUint32(18, true), new TextEncoder().encode('你好').length)
    assert.equal(view.getUint32(bytes.length - 22, true), 0x06054b50)
})
