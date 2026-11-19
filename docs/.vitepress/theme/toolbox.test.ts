import assert from 'node:assert/strict'
import test from 'node:test'
import { pluginEntries, mcpEntries, filterTools } from './toolbox.ts'
import { skillSnapshot } from './skillCatalog.ts'

test('plugin coverage includes tool-only plugins and reconciles every skill count', () => {
    assert.equal(pluginEntries.length, 13)
    assert.equal(pluginEntries.reduce((sum, entry) => sum + (entry.skillCount || 0), 0), 91)
    for (const entry of pluginEntries) {
        assert.equal(entry.kind, 'plugin')
        assert.equal(entry.skillCount, skillSnapshot.entries.filter(skill => skill.kind === 'plugin' && skill.source === entry.source).length, entry.name)
    }
    assert.ok(pluginEntries.some(entry => entry.skillCount === 0))
})

test('public connection descriptions have complete content and contain no private configuration', () => {
    const entries = [...pluginEntries, ...mcpEntries]
    assert.equal(new Set(entries.map(entry => entry.id)).size, entries.length)
    assert.equal(mcpEntries.length, 6)
    for (const entry of entries) {
        for (const key of ['name', 'summary', 'requirements', 'setup', 'prompt', 'status', 'source'] as const) assert.ok(entry[key]?.trim(), `${entry.id}: ${key}`)
        assert.ok(entry.scenarios.length >= 1)
        assert.doesNotMatch(JSON.stringify(entry), /\/Users\/|\/home\/|Bearer\s+[a-zA-Z0-9_-]{15,}|sk-[a-zA-Z0-9]{20,}|https?:\/\/(?:localhost|127\.|10\.|192\.168\.)/)
    }
    assert.ok(mcpEntries.some(entry => entry.status.includes('未启用') || entry.status.includes('禁用')))
    assert.ok(mcpEntries.some(entry => entry.status.includes('未验证')))
})

test('tool search supports names, Chinese tasks, multiple words and source filters', () => {
    assert.ok(filterTools(pluginEntries, ' GITHUB ').length > 0)
    assert.ok(filterTools(pluginEntries, '文档').length > 0)
    assert.equal(filterTools(mcpEntries, 'no-such-connection-9284').length, 0)
    const first = mcpEntries[0]
    assert.ok(filterTools(mcpEntries, first.name, first.source).some(entry => entry.id === first.id))
    assert.equal(filterTools(pluginEntries, 'github impossible-9284').length, 0)
})
