import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { test } from 'node:test'

const source = readFileSync(new URL('../docs/articles/算法/双指针与滑动窗口.md', import.meta.url), 'utf8')
const blocks = [...source.matchAll(/^```js\n([\s\S]*?)^```/gm)].map(match => match[1])

function example(name) {
  const matches = blocks.filter(code => code.includes(`function ${name}(`))
  assert.equal(matches.length, 1, `Expected one self-contained ${name} example`)
  return runInNewContext(`'use strict';\n${matches[0]}\n${name}`, {}, { timeout: 1000 })
}

const strings = ['']
let layer = ['']
for (let length = 1; length <= 5; length++) {
  layer = layer.flatMap(prefix => ['a', 'b', '😀'].map(char => prefix + char))
  strings.push(...layer)
}

test('palindrome compares exact code points, preserving case and whitespace', () => {
  const palindrome = example('isPalindrome')
  for (const text of [...strings, 'Aa', 'a a', 'abca', '😀a😀', 'e\u0301']) {
    const chars = Array.from(text)
    assert.equal(palindrome(text), chars.join('') === chars.toReversed().join(''), text)
  }
})

test('moving zeros is in-place, keeps length and preserves nonzero order', () => {
  const move = example('moveZeroes')
  const inputs = [[], [0], [1], [-0, 1, 0], [0, 1, 0, 3, 12], [-2, 0, -1, 0]]
  let layer = [[]]
  for (let length = 1; length <= 5; length++) {
    layer = layer.flatMap(prefix => [0, -1, 2].map(value => [...prefix, value]))
    inputs.push(...layer)
  }
  for (const original of inputs) {
    const values = original.slice()
    const expected = [...original.filter(value => value !== 0), ...original.filter(value => value === 0).map(() => 0)]
    assert.equal(move(values), values)
    assert.deepEqual(values, expected)
    assert.equal(values.length, original.length)
  }
})

test('longest substring agrees with exhaustive interval checking on small code-point inputs', () => {
  const longest = example('lengthOfLongestSubstring')
  for (const text of [...strings, 'abba', 'pwwkew', 'tmmzuxt', '😀a😀b', 'e\u0301e']) {
    const chars = Array.from(text)
    let expected = 0
    for (let left = 0; left < chars.length; left++) {
      for (let right = left + 1; right <= chars.length; right++) {
        const interval = chars.slice(left, right)
        if (new Set(interval).size === interval.length) expected = Math.max(expected, interval.length)
      }
    }
    assert.equal(longest(text), expected, text)
  }
  assert.equal(longest('abba'), 2)
  assert.equal(longest('😀a😀b'), 3)
})
