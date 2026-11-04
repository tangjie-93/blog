import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { test } from 'node:test'

function example(file, name) {
  const source = readFileSync(new URL(`../docs/articles/算法/${file}.md`, import.meta.url), 'utf8')
  const blocks = [...source.matchAll(/^```js\n([\s\S]*?)^```/gm)]
    .map(match => match[1]).filter(code => code.includes(`function ${name}(`))
  assert.equal(blocks.length, 1)
  return runInNewContext(`'use strict';\n${blocks[0]}\n${name}`, {}, { timeout: 1000 })
}

const arrays = [[]]
let layer = [[]]
for (let length = 1; length <= 4; length++) {
  layer = layer.flatMap(values => [-1, 0, 1].map(value => [...values, value]))
  arrays.push(...layer)
}

test('duplicate detection matches pairwise comparison and never changes input', () => {
  const solve = example('数组与哈希', 'containsDuplicate')
  for (const values of arrays) {
    const expected = values.some((value, i) => values.slice(i + 1).includes(value))
    assert.equal(solve(Object.freeze([...values])), expected)
  }
})

test('two sum returns distinct valid indices, including duplicates and index zero', () => {
  const solve = example('数组与哈希', 'twoSum')
  for (const values of arrays) {
    for (let target = -3; target <= 3; target++) {
      const exists = values.some((value, i) => values.slice(i + 1).some(other => value + other === target))
      const result = Array.from(solve(Object.freeze([...values]), target))
      if (!exists) assert.deepEqual(result, [])
      else {
        assert.equal(result.length, 2)
        const [a, b] = result
        assert.ok(Number.isInteger(a) && Number.isInteger(b) && a >= 0 && b < values.length && a < b)
        assert.equal(values[a] + values[b], target)
      }
    }
  }
})

test('anagram counting respects multiplicity, case and Unicode code points', () => {
  const solve = example('数组与哈希', 'isAnagram')
  for (const [a, b, expected] of [
    ['', '', true], ['', 'a', false], ['aa', 'a', false], ['aab', 'abb', false],
    ['ab', 'ba', true], ['A', 'a', false], ['a b', 'ba ', true],
    ['😀a😀', '😀😀a', true], ['😀', '😁', false], ['é', 'e\u0301', false]
  ]) assert.equal(solve(a, b), expected, `${a}/${b}`)
})

test('prefix queries match direct sums for every valid interval', () => {
  const build = example('前缀和', 'buildPrefix')
  const query = example('前缀和', 'rangeSum')
  for (const values of arrays) {
    const prefix = build(Object.freeze([...values]))
    assert.equal(prefix.length, values.length + 1)
    assert.equal(prefix[0], 0)
    Object.freeze(prefix)
    for (let left = 0; left <= values.length; left++) {
      for (let right = left; right <= values.length; right++) {
        assert.equal(query(prefix, left, right), values.slice(left, right).reduce((sum, value) => sum + value, 0))
      }
    }
  }
  for (const [left, right] of [[-1, 1], [2, 1], [0, 4], [0.5, 1], [0, NaN], [0, Infinity]]) {
    assert.throws(() => query([0, 2, 1, 4], left, right), { name: 'RangeError' })
  }
})

test('subarray counting matches exhaustive enumeration with negatives and repeated prefixes', () => {
  const solve = example('前缀和', 'countSubarrays')
  for (const values of arrays) {
    for (let target = -3; target <= 3; target++) {
      let expected = 0
      for (let left = 0; left < values.length; left++) {
        let sum = 0
        for (let right = left; right < values.length; right++) {
          sum += values[right]
          if (sum === target) expected++
        }
      }
      assert.equal(solve(Object.freeze([...values]), target), expected, `${values}/${target}`)
    }
  }
})


test('difference updates match direct mutation, preserve inputs and validate boundaries', () => {
  const solve = example('前缀和', 'applyRangeAdds')
  for (const values of arrays) {
    const n = values.length
    for (let left = 0; left <= n; left++) {
      for (let right = left; right <= n; right++) {
        const updates = [[0, n, 2], [left, right, -1], [n, n, 5]].map(Object.freeze)
        const expected = [...values]
        for (const [a, b, delta] of updates) {
          for (let i = a; i < b; i++) expected[i] += delta
        }
        assert.deepEqual(Array.from(solve(Object.freeze([...values]), Object.freeze(updates))), expected)
      }
    }
  }
  for (const update of [[-1, 1, 2], [1, 0, 2], [0, 3, 2], [0.5, 1, 2]]) {
    assert.throws(() => solve([1, 2], [update]), { name: 'RangeError' })
  }
})
