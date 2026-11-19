import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { test } from 'node:test'

const source = readFileSync(new URL('../docs/articles/算法/leetcode之递归专题.md', import.meta.url), 'utf8')
const blocks = [...source.matchAll(/^```js\n([\s\S]*?)^```/gm)].map(match => match[1])

function example(name) {
  const matches = blocks.filter(code => code.includes(`function ${name}(`))
  assert.equal(matches.length, 1, `Expected one self-contained example: ${name}`)
  return runInNewContext(`'use strict';\n${matches[0]}\n${name}`, {})
}

test('suffix sum handles every valid start and preserves the input', () => {
  const sum = example('sumSuffix')
  for (const values of [[], [7], [-4, -2, -9], [0, 0], [2, -1, 4], [3, 3, 1]]) {
    const input = Object.freeze([...values])
    assert.equal(sum(input), values.reduce((total, value) => total + value, 0))
    for (let start = 0; start <= input.length; start++) {
      const expected = values.slice(start).reduce((total, value) => total + value, 0)
      assert.equal(sum(input, start), expected)
    }
    assert.deepEqual(input, values)
  }
})

test('node count handles empty, repeated values, asymmetric trees and one-sided chains', () => {
  const count = example('countNodes')
  const node = (left = null, right = null) => Object.freeze({ val: 1, left, right })
  const cases = [
    [null, 0],
    [node(), 1],
    [node(node(), node()), 3],
    [node(node(null, node()), node(node(), null)), 5],
    [node(node(node())), 3],
    [node(null, node(null, node())), 3]
  ]
  for (const [root, expected] of cases) {
    const before = JSON.stringify(root)
    assert.equal(count(root), expected)
    assert.equal(JSON.stringify(root), before)
  }
})
