import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { filterSkills, skillCategories, skillInvocation, skills, skillSnapshot } from './skillCatalog.ts'

test('every discovered skill has exactly one complete public explanation', () => {
    const content = ['personal', 'cloud', 'plugins'].flatMap(name => JSON.parse(readFileSync(new URL(`./data/skills/${name}.json`, import.meta.url), 'utf8')))
    assert.equal(content.length, skillSnapshot.entries.length)
    assert.equal(new Set(content.map(item => item.id)).size, content.length)
    assert.deepEqual(new Set(content.map(item => item.id)), new Set(skillSnapshot.entries.map(item => item.id)))
    assert.equal(skills.length, 146)
    assert.equal(skills.filter(item => item.kind === 'plugin').length, 91)
    assert.equal(skills.filter(item => item.status === 'local-only').length, 2)
    for (const skill of skills) {
        for (const key of ['title', 'summary', 'inputs', 'output', 'prompt', 'requirements'] as const) {
            assert.ok(skill[key]?.trim().length > 5, `${skill.id}: missing ${key}`)
        }
        assert.ok(skillCategories.some(category => category.id === skill.category), skill.id)
        assert.ok(skill.scenarios.length >= 2, skill.id)
        assert.ok(skill.prompt.includes(skillInvocation(skill)), `${skill.id}: wrong invocation`)
        assert.match(skill.sourceHash, /^[a-f0-9]{64}$/)
    }
    assert.doesNotMatch(JSON.stringify(skills), /\/Users\/|\/home\/|sk-[a-zA-Z0-9]{20,}|AIza[a-zA-Z0-9_-]{30,}/)
})

test('search combines words, category and source and keeps same-name skills distinct', () => {
    assert.equal(filterSkills(skills, '  PLAYWRIGHT ').some(item => item.id === 'personal:playwright'), true)
    assert.ok(filterSkills(skills, '财报').length > 0)
    assert.ok(filterSkills(skills, 'Vue', 'development', 'personal').every(item => item.source === 'personal' && item.category === 'development'))
    assert.ok(filterSkills(skills, 'Vue', 'development', 'personal').length > 0)
    assert.equal(filterSkills(skills, 'no-such-skill-9284').length, 0)
    assert.equal(filterSkills(skills, ' ').length, skills.length)
    assert.ok(filterSkills(skills, 'pdf').some(item => item.id === 'personal:pdf'))
    assert.ok(filterSkills(skills, 'pdf:pdf').some(item => item.id === 'pdf:pdf'))
    assert.ok(filterSkills(skills, 'vue impossible-9284').length === 0)
})
