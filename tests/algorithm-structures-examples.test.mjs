import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { test } from 'node:test'

const covered = new Map()
function load(file, name) {
  const source = readFileSync(new URL(`../docs/articles/算法/${file}.md`, import.meta.url), 'utf8')
  const blocks = [...source.matchAll(/^```js\n([\s\S]*?)^```/gm)].map(match => match[1])
  const found = blocks.findIndex(code => code.includes(`function ${name}(`) || code.includes(`class ${name} `))
  assert.notEqual(found, -1)
  if (!covered.has(file)) covered.set(file, { total: blocks.length, seen: new Set() })
  covered.get(file).seen.add(found)
  return runInNewContext(`'use strict';\n${blocks[found]}\n${name}`, {}, { timeout: 1000 })
}
const list = values => values.reduceRight((next, val) => ({ val, next }), null)
function nodes(head) {
  const result = []
  const seen = new Set()
  while (head !== null) {
    assert.ok(!seen.has(head), 'unexpected cycle')
    seen.add(head)
    result.push(head)
    head = head.next
  }
  return result
}

test('linked-list reversal and odd-even rearrangement preserve every original node', () => {
  const reverse = load('leetcode之链表专题', 'reverseList')
  const oddEven = load('leetcode之链表专题', 'oddEvenList')
  for (const values of [[], [1], [1, 2], [2, 1, 3, 5, 6, 4, 7], [1, 1, 1, 1]]) {
    for (const [fn, expected] of [[reverse, ns => ns.toReversed()], [oddEven, ns => [...ns.filter((_, i) => i % 2 === 0), ...ns.filter((_, i) => i % 2 === 1)]]]) {
      const head = list(values)
      const original = nodes(head)
      const actualNodes = nodes(fn(head))
      const expectedNodes = expected(original)
      assert.equal(actualNodes.length, expectedNodes.length)
      actualNodes.forEach((node, index) => assert.equal(node, expectedNodes[index]))
    }
  }
})

test('merge reuses disjoint nodes in sorted and stable order; cycle detection compares identity', () => {
  const merge = load('leetcode之链表专题', 'mergeTwoLists')
  const cycle = load('leetcode之链表专题', 'hasCycle')
  for (const [a, b] of [[[], []], [[1], []], [[], [1]], [[1, 2, 2], [1, 2, 3]]]) {
    const left = list(a), right = list(b)
    const all = [...nodes(left), ...nodes(right)]
    const expected = all.slice().sort((x, y) => x.val - y.val)
    const actualNodes = nodes(merge(left, right))
    assert.equal(actualNodes.length, expected.length)
    actualNodes.forEach((node, index) => assert.equal(node, expected[index]))
  }
  assert.equal(cycle(null), false)
  const acyclic = list([1, 1, 1])
  assert.equal(cycle(acyclic), false)
  const self = list([1]); self.next = self
  assert.equal(cycle(self), true)
  const head = list([1, 2, 3, 4]), ns = nodes(head)
  ns[3].next = ns[1]
  assert.equal(cycle(head), true)
  assert.equal(ns[3].next, ns[1])
})

const samples = [[]]
let layer = [[]]
for (let size = 1; size <= 4; size++) {
  layer = layer.flatMap(a => [-1, 0, 2].map(x => [...a, x]))
  samples.push(...layer)
}

test('heap maintains parent order through mixed operations and top-k matches sorting', () => {
  const Heap = load('数据结构之堆', 'MinHeap')
  const kth = load('数据结构之堆', 'findKthLargest')
  const check = h => {
    for (let i = 1; i < h.size; i++) assert.ok(h.values[Math.floor((i - 1) / 2)] <= h.values[i])
  }
  for (const values of samples) {
    const h = new Heap()
    assert.equal(h.pop(), null)
    for (const value of values) { h.push(value); check(h) }
    const sorted = values.slice().sort((a, b) => a - b)
    for (const value of sorted) { assert.equal(h.peek(), value); assert.equal(h.pop(), value); check(h) }
    assert.equal(h.size, 0)
    assert.equal(h.peek(), null)
    for (let k = 1; k <= values.length; k++) assert.equal(kth(Object.freeze([...values]), k), sorted[sorted.length - k])
  }
  const h = new Heap(); h.push(3); h.push(1); assert.equal(h.pop(), 1); h.push(-2); assert.equal(h.pop(), -2); assert.equal(h.pop(), 3)
  for (const k of [0, -1, 4, 1.5, NaN]) assert.throws(() => kth([1, 2, 3], k), { name: 'RangeError' })
  assert.throws(() => kth([], 1), { name: 'RangeError' })
})

test('BF and KMP agree with indexOf, including overlap, empty patterns and UTF-16 indices', () => {
  const bf = load('数据结构之字符串总结', 'bruteForce')
  const kmp = load('数据结构之字符串总结', 'kmp')
  const words = ['']
  let level = ['']
  for (let size = 1; size <= 4; size++) { level = level.flatMap(s => ['a', 'b', '😀'].map(c => s + c)); words.push(...level) }
  for (const text of [...words, 'abababaca', '😀x']) {
    for (const pattern of [...words, 'ababaca', '\ude00']) {
      assert.equal(bf(text, pattern), text.indexOf(pattern))
      assert.equal(kmp(text, pattern), text.indexOf(pattern))
    }
  }
})

test('Trie distinguishes words from prefixes, supports empty word and code-point edges', () => {
  const Trie = load('数据结构之字符串总结', 'TrieTree')
  const trie = new Trie()
  assert.equal(trie.find(''), false)
  assert.equal(trie.startsWith(''), true)
  for (const word of ['apple', 'apple', '😀好', 'é']) trie.insert(word)
  assert.equal(trie.startsWith('app'), true)
  assert.equal(trie.find('app'), false)
  trie.insert('app'); assert.equal(trie.find('app'), true)
  assert.equal(trie.find('apple'), true)
  assert.equal(trie.find('😀好'), true)
  assert.equal(trie.startsWith('😀'), true)
  assert.equal(trie.startsWith('\ud83d'), false)
  assert.equal(trie.find('e\u0301'), false)
  assert.equal(trie.find('banana'), false)
  trie.insert(''); assert.equal(trie.find(''), true)
})

test('brackets and queue respect nesting, FIFO order and empty-state contract', () => {
  const valid = load('栈与队列', 'isValidBrackets')
  for (const [s, result] of [['', true], ['([]){}', true], ['([)]', false], ['(', false], [')', false], ['abc', false]]) assert.equal(valid(s), result)
  const Queue = load('栈与队列', 'Queue')
  const q = new Queue()
  assert.equal(q.dequeue(), undefined)
  q.enqueue(1); q.enqueue(2); assert.equal(q.dequeue(), 1); q.enqueue(3)
  assert.equal(q.size, 2); assert.equal(q.dequeue(), 2); assert.equal(q.dequeue(), 3)
  assert.equal(q.size, 0); assert.equal(q.items.length, 0)
  q.enqueue(null); assert.equal(q.dequeue(), null)
  assert.throws(() => q.enqueue(undefined), { name: 'TypeError' })
})

test('monotonic stack finds first strictly warmer day against direct scanning', () => {
  const daily = load('栈与队列', 'dailyTemperatures')
  for (const values of [...samples, [30, 30, 31], [73, 74, 75, 71, 69, 72, 76, 73]]) {
    const expected = values.map((value, i) => {
      const next = values.findIndex((later, j) => j > i && later > value)
      return next === -1 ? 0 : next - i
    })
    assert.deepEqual(Array.from(daily(Object.freeze([...values]))), expected)
  }
})

test('every executable block in these four tutorials has been exercised', () => {
  assert.equal(covered.size, 4)
  for (const [file, { total, seen }] of covered) assert.equal(seen.size, total, file)
})
