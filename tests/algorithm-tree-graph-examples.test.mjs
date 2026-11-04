import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { test } from 'node:test'
function load(file, name, index = 0) {
  const source = readFileSync(new URL(`../docs/articles/算法/${file}.md`, import.meta.url), 'utf8')
  const blocks = [...source.matchAll(/^```js\n([\s\S]*?)^```/gm)].map(x => x[1]).filter(code => code.includes(`function ${name}(`))
  assert.ok(blocks[index], name)
  return runInNewContext(`'use strict';\n${blocks[index]}\n${name}`, {})
}
const treeFile = 'leetcode之树专题'
const graphFile = '数据结构之图'
const gridFile = 'leetCode之广度优先搜索专题'
const plain = value => JSON.parse(JSON.stringify(value))
const node = (val, left = null, right = null) => ({ val, left, right })

test('tree construction preserves zero, compact level positions and detects unreachable nodes', () => {
  const create = load('数据结构之树', 'createTree')
  assert.equal(create([]), null)
  assert.equal(create([null, null]), null)
  const input = Object.freeze([0, null, 2, 1])
  assert.deepEqual(plain(create(input)), node(0, null, node(2, node(1))))
  assert.deepEqual(plain(create([1, null, null, null])), node(1))
  for (const invalid of [[null, 1], [1, null, null, 2]]) assert.throws(() => create(invalid), { name: 'RangeError' })
})

test('tree representative methods cover empty, skewed, invalid ancestor bounds and leaf-only paths', () => {
  const root = node(5, node(2, node(-1), node(3)), node(8))
  const before = JSON.stringify(root)
  for (const i of [0, 1]) {
    const level = load(treeFile, 'levelOrder', i)
    assert.deepEqual(plain(level(null)), [])
    assert.deepEqual(plain(level(root)), i ? [[5], [2, 8], [-1, 3]] : [5, 2, 8, -1, 3])
  }
  const depth = load(treeFile, 'maxDepth')
  assert.equal(depth(null), 0)
  assert.equal(depth(root), 3)
  const balanced = load(treeFile, 'isBalanced')
  assert.equal(balanced(null), true)
  assert.equal(balanced(root), true)
  assert.equal(balanced(node(1, node(2, node(3)))), false)
  const path = load(treeFile, 'hasPathSum')
  assert.equal(path(null, 0), false)
  assert.equal(path(root, 6), true)
  assert.equal(path(root, 7), false)
  assert.equal(path(node(1, node(2)), 1), false)
  const valid = load(treeFile, 'isValidBST')
  assert.equal(valid(null), true)
  assert.equal(valid(root), true)
  assert.equal(valid(node(5, null, node(7, node(4)))), false)
  assert.equal(valid(node(1, node(1))), false)
  const lca = load(treeFile, 'lowestCommonAncestor')
  assert.equal(lca(root, root.left.left, root.left.right), root.left)
  assert.equal(lca(root, root.left, root.right), root)
  assert.equal(lca(root, root.left, root.left), root.left)
  assert.equal(JSON.stringify(root), before)
})

test('multiway traversals differ in order without modifying input', () => {
  const leaf = value => ({ value, children: [] })
  const root = { value: 'A', children: [{ value: 'B', children: [leaf('D')] }, leaf('C')] }
  for (const [name, expected] of [['depthFirst', ['A', 'B', 'D', 'C']], ['breadthFirst', ['A', 'B', 'C', 'D']]]) {
    const walk = load('遍历之深度优先遍历和广度优先遍历的区别', name)
    assert.deepEqual(plain(walk(null)), [])
    const before = JSON.stringify(root)
    assert.deepEqual(plain(walk(root)), expected)
    assert.equal(JSON.stringify(root), before)
  }
})

test('graph search handles cycles, parallel edges, isolated nodes and path reconstruction', () => {
  const adj = [[1, 2, 1], [0, 3], [0, 3], [1, 2], []]
  const before = JSON.stringify(adj)
  const dfs = load(graphFile, 'dfsAll')
  assert.deepEqual(plain(dfs([])), [])
  assert.deepEqual(plain(dfs(adj)), [0, 1, 3, 2, 4])
  const search = load(graphFile, 'bfs')(adj, 0)
  assert.deepEqual(plain(search.order), [0, 1, 2, 3])
  assert.deepEqual(plain(search.distance), [0, 1, 1, 2, -1])
  const restore = load(graphFile, 'restorePath')
  assert.deepEqual(plain(restore(search.previous, 0, 3)), [0, 1, 3])
  assert.deepEqual(plain(restore(search.previous, 0, 4)), [])
  assert.deepEqual(plain(restore(search.previous, 0, 0)), [0])
  assert.equal(JSON.stringify(adj), before)
})

test('topological order respects every edge and rejects cycles', () => {
  const sort = load(graphFile, 'topologicalSort')
  for (const adj of [[], [[], []], [[1, 1, 2], [3], [3], []]]) {
    const result = Array.from(sort(adj))
    assert.equal(new Set(result).size, adj.length)
    adj.forEach((nexts, vertex) => nexts.forEach(next => assert.ok(result.indexOf(vertex) < result.indexOf(next))))
  }
  assert.equal(sort([[1], [0]]), null)
  assert.equal(sort([[0]]), null)
})

test('union-find counts isolated components and ignores redundant unions', () => {
  const count = load(graphFile, 'countComponents')
  assert.equal(count(0, []), 0)
  assert.equal(count(4, []), 4)
  assert.equal(count(5, [[0, 1], [1, 2], [2, 0], [0, 1], [3, 3]]), 3)
  assert.equal(count(4, [[0, 1], [2, 3], [0, 3]]), 1)
})

test('Dijkstra chooses total weight, allows zero and parallel edges, rejects negative weights', () => {
  const solve = load(graphFile, 'dijkstra')
  const adj = [[[1, 9], [2, 1], [2, 2]], [[3, 0]], [[1, 1], [3, 5]], [], []]
  assert.deepEqual(Array.from(solve(adj, 0)), [0, 2, 1, 2, Infinity])
  assert.deepEqual(Array.from(solve([[]], 0)), [0])
  for (const weight of [-1, NaN, Infinity]) assert.throws(() => solve([[[0, weight]]], 0), { name: 'RangeError' })
})

test('island search preserves input and uses four-way connectivity', () => {
  const count = load(gridFile, 'numIslands')
  for (const [grid, expected] of [[[], 0], [[[]], 0], [[['1']], 1], [[['0']], 0], [[['1', '0'], ['0', '1']], 2], [[['1', '1'], ['1', '1']], 1]]) {
    const before = JSON.stringify(grid)
    assert.equal(count(grid), expected)
    assert.equal(JSON.stringify(grid), before)
  }
})

test('surrounded regions preserve boundary connectivity and capture only interior regions', () => {
  const solve = load(gridFile, 'solve')
  for (const [rows, expected] of [[[], []], [['O'], ['O']], [['OOO'], ['OOO']], [['O', 'O', 'O'], ['O', 'O', 'O']], [['XXXX', 'XOOX', 'XXOX', 'XOXX'], ['XXXX', 'XXXX', 'XXXX', 'XOXX']], [['XOX', 'XOX', 'XXX'], ['XOX', 'XOX', 'XXX']]]) {
    const board = rows.map(row => Array.from(row))
    assert.equal(solve(board), undefined)
    assert.deepEqual(board.map(row => row.join('')), expected)
  }
})


test('flood fill changes only the starting component and handles identical colors', () => {
  const fill = load(gridFile, 'floodFill')
  const grid = [[1, 1, 1], [1, 1, 0], [1, 0, 1]]
  assert.equal(fill(grid, 1, 1, 2), grid)
  assert.deepEqual(grid, [[2, 2, 2], [2, 2, 0], [2, 0, 1]])
  assert.equal(fill(grid, 0, 0, 2), grid)
  const empty = []
  assert.equal(fill(empty, 0, 0, 2), empty)
  const negative = [[-1, 0], [-1, -1]]
  assert.equal(fill(negative, 0, 0, 0), negative)
  assert.deepEqual(negative, [[0, 0], [0, 0]])
})
