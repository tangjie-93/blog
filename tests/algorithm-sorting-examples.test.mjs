import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { runInNewContext } from 'node:vm'

const source = readFileSync(new URL('../docs/articles/算法/排序算法.md', import.meta.url), 'utf8')
const blocks = [...source.matchAll(/^```js\n([\s\S]*?)^```/gm)].map(match => match[1])
const names = ['insertSort', 'mergeSort', 'quickSort', 'bubbleSort', 'selectSort', 'shellSort', 'heapSort', 'countSort', 'radixSort', 'bucketSort']
const copying = new Set(['mergeSort', 'countSort', 'bucketSort'])

function load(name) {
  const matches = blocks.filter(block => block.includes(`function ${name}(`))
  assert.equal(matches.length, 1, `${name} must have one self-contained code block`)
  return runInNewContext(`'use strict';\n${matches[0]}\n${name}`, {}, { timeout: 1000 })
}

const examples = [[], [7], [0], [0, 0, 0], [3, 1, 2], [1, 2, 3], [3, 2, 1], [3, 3, 1, 2, 3]]
const generated = [[]]
let layer = [[]]
for (let length = 1; length <= 5; length++) {
  layer = layer.flatMap(values => [0, 1, 2].map(value => [...values, value]))
  generated.push(...layer)
}

for (const name of names) {
  test(`${name}: document code sorts without losing values and respects mutation contract`, () => {
    const sort = load(name)
    const cases = [...examples, ...generated]
    if (name !== 'radixSort') cases.push([-5, -1, -8], [-1, 0, 2, -1])
    if (!['radixSort', 'countSort'].includes(name)) cases.push([0.5, -1.25, 0, 0.5])
    for (const values of cases) {
      const input = values.slice()
      const result = sort(input)
      assert.deepEqual(Array.from(result), values.slice().sort((a, b) => a - b), `${name}: ${values}`)
      if (copying.has(name)) {
        assert.notEqual(result, input)
        assert.deepEqual(input, values)
      } else {
        assert.equal(result, input)
      }
    }
  })
}

test('stable comparison implementations preserve equal-key record order', () => {
  const records = [2, 1, 2, 1, 2].map((key, index) => ({
    key, index, valueOf() { return this.key }
  }))
  for (const name of ['insertSort', 'mergeSort', 'bubbleSort']) {
    const result = load(name)(records.slice())
    assert.deepEqual(Array.from(result, record => record.index), [1, 3, 0, 2, 4], name)
  }
})

test('radix sorting retains zeros across digit passes and supports safe integers', () => {
  const input = [Number.MAX_SAFE_INTEGER, 0, 10, 100, 1, 0, 90, 2147483648]
  const expected = input.slice().sort((a, b) => a - b)
  assert.deepEqual(Array.from(load('radixSort')(input)), expected)
})

test('bucket boundaries include the maximum and reject invalid widths', () => {
  const sort = load('bucketSort')
  assert.deepEqual(Array.from(sort([10, 5, 0, 10], 5)), [0, 5, 10, 10])
  assert.deepEqual(Array.from(sort([4, 4, 4], 5)), [4, 4, 4])
  for (const width of [0, -1, Infinity, NaN, '5']) {
    assert.throws(() => sort([1, 2], width), { name: 'RangeError' })
  }
})
