import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { test } from 'node:test'

function example(file, name, occurrence = 0) {
  const source = readFileSync(new URL(`../docs/articles/算法/${file}.md`, import.meta.url), 'utf8')
  const blocks = [...source.matchAll(/^```js\n([\s\S]*?)^```/gm)]
    .map(match => match[1]).filter(code => code.includes(`function ${name}(`) || code.includes(`function ${name} (`))
  assert.ok(blocks[occurrence], `Missing example: ${file}/${name}`)
  return runInNewContext(`${blocks[occurrence]}\n${name}`, {})
}

test('binary search checks the last candidate, including singletons and endpoints', () => {
  const search = example('算法之查找', 'binarySearch')
  for (const values of [[], [7], [-5, 0, 3, 8], [1, 2, 2, 4]]) {
    for (const target of [-6, -5, 0, 1, 2, 3, 4, 7, 8, 9]) {
      const before = [...values]
      const index = search(values, target)
      if (values.includes(target)) {
        assert.ok(index >= 0 && index < values.length)
        assert.equal(values[index], target)
      } else assert.equal(index, -1)
      assert.deepEqual(values, before)
    }
  }
})

test('flat and grouped breadth-first traversal preserve left-to-right level order', () => {
  const leaf = val => ({ val, left: null, right: null })
  const tree = { val: 1, left: { val: 2, left: null, right: leaf(4) }, right: { val: 3, left: leaf(5), right: null } }
  for (const [occurrence, expected] of [[0, [1, 2, 3, 4, 5]], [1, [[1], [2, 3], [4, 5]]]]) {
    const traverse = example('leetcode之树专题', 'levelOrder', occurrence)
    const before = JSON.stringify(tree)
    assert.deepEqual(Array.from(traverse(null)), [])
    assert.equal(JSON.stringify(traverse(leaf(7))), JSON.stringify(occurrence ? [[7]] : [7]))
    assert.equal(JSON.stringify(traverse(tree)), JSON.stringify(expected))
    assert.equal(JSON.stringify(tree), before)
  }
})

test('lower bound finds the left boundary among duplicates or the insertion position', () => {
  const search = example('算法之查找', 'lowerBound')
  for (const values of [[], [2], [2, 2, 2], [-5, -1, 0, 0, 3, 8]]) {
    for (let target = -6; target <= 9; target++) {
      const expected = values.findIndex(value => value >= target)
      assert.equal(search(values, target), expected === -1 ? values.length : expected)
    }
  }
})

test('sequential lookup and extrema handle empty, negative and repeated values without mutation', () => {
  const search = example('算法之查找', 'seqSearch')
  const min = example('算法之查找', 'findMin')
  const max = example('算法之查找', 'findMax')
  for (const values of [[], [7], [-4, -2, -9], [3, 3, 1], [1, 5, 2]]) {
    const before = [...values]
    assert.equal(min(values), values.length ? Math.min(...values) : null)
    assert.equal(max(values), values.length ? Math.max(...values) : null)
    for (const target of [-9, -2, 0, 3, 7]) assert.equal(search(values, target), values.includes(target))
    assert.deepEqual(values, before)
  }
})

test('complexity examples produce the stated sums and pair counts', () => {
  const sum = example('数据结构和算法基础知识总结', 'sumTwoArrays')
  const pairs = example('数据结构和算法基础知识总结', 'countPairs')
  assert.equal(sum([], []), 0)
  assert.equal(sum([-2, 3], [4, 1, 5]), 11)
  for (const [n, expected] of [[0, 0], [1, 0], [2, 1], [4, 6], [10, 45]]) assert.equal(pairs(n), expected)
})
