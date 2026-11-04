import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { test } from 'node:test'

const files = ['算法基本思想之动态规划', '动态规划之背包问题总结', 'leetcode之动态规划专题', 'leetcode之数组连续递增序列题目总结', '算法基本思想之回溯算法', '算法基本思想之贪心算法', '算法基本思想之分治算法']
const blocks = files.flatMap(file => [...readFileSync(new URL(`../docs/articles/算法/${file}.md`, import.meta.url), 'utf8').matchAll(/^```js\n([\s\S]*?)^```/gm)].map(match => match[1]))
const exercised = new Set()
function load(name) {
  const matches = blocks.filter(code => code.startsWith(`function ${name}(`))
  assert.equal(matches.length, 1, name)
  exercised.add(matches[0])
  return runInNewContext(`'use strict';\n${matches[0]}\n${name}`, {}, { timeout: 1000 })
}
const plain = value => JSON.parse(JSON.stringify(value))
const small = [[]]
let layer = [[]]
for (let n = 1; n <= 5; n++) {
  layer = layer.flatMap(a => [0, 1, 2].map(v => [...a, v]))
  small.push(...layer)
}

test('stairs share correct boundaries and memoized/iterative counts; robbery matches subset enumeration', () => {
  const memo = load('climbMemo'), stairs = load('climbStairs'), rob = load('rob')
  for (const [n, expected] of [[0,1],[1,1],[2,2],[3,3],[10,89]]) {
    assert.equal(memo(n), expected); assert.equal(stairs(n), expected)
  }
  for (const a of small) {
    let best = 0
    for (let bits = 0; bits < 2 ** a.length; bits++) {
      if (bits & (bits << 1)) continue
      let sum = 0
      a.forEach((v, i) => { if (bits & (1 << i)) sum += v })
      best = Math.max(best, sum)
    }
    assert.equal(rob(Object.freeze(a)), best)
  }
})

test('grid states handle empty input, blocked boundaries and non-square shapes without mutation', () => {
  const paths = load('uniquePathsWithObstacles'), gift = load('maxGiftValue')
  for (const [grid, expected] of [[[],0],[[[]],0],[[[1]],0],[[[0]],1],[[[0,1,0]],0],[[[0],[1],[0]],0],[[[0,0,0],[0,1,0],[0,0,0]],2]]) {
    grid.forEach(Object.freeze); Object.freeze(grid)
    assert.equal(paths(grid), expected)
  }
  for (const [grid, expected] of [[[],0],[[[]],0],[[[0]],0],[[[1,2,3]],6],[[[1],[2],[3]],6],[[[1,3,1],[1,5,1],[4,2,1]],12]]) {
    grid.forEach(Object.freeze); Object.freeze(grid)
    assert.equal(gift(grid), expected)
  }
})

test('knapsack enforces one use while coin problems distinguish minima and combinations', () => {
  const pack = load('knapsack01'), coins = load('coinChange'), ways = load('coinCombinations')
  for (const [w,v,c,e] of [[[],[],4,0],[[2],[3],4,3],[[3,4,7,8,9],[4,5,10,11,13],16,23],[[2,2],[3,4],2,4],[[2],[3],0,0]]) assert.equal(pack(Object.freeze(w),Object.freeze(v),c),e)
  for (const [c,a,e] of [[[],0,0],[[],1,-1],[[2],3,-1],[[1,3,4],6,2],[[1,2,5],11,3]]) assert.equal(coins(Object.freeze(c),a),e)
  for (const [c,a,e] of [[[],0,1],[[],1,0],[[1,2],3,2],[[2],3,0],[[1,5,10,25],10,4]]) assert.equal(ways(Object.freeze(c),a),e)
})

test('sequence lengths and counts match independent subsequence enumeration', () => {
  const continuous = load('findLengthOfLCIS'), lis = load('lengthOfLIS'), count = load('findNumberOfLIS')
  for (const a of small) {
    let best = 0, ways = 0, run = 0
    for (let left = 0; left < a.length; left++) {
      let right = left + 1
      while (right < a.length && a[right] > a[right - 1]) right++
      run = Math.max(run, right - left)
    }
    for (let bits = 1; bits < 2 ** a.length; bits++) {
      const selected = a.filter((_, i) => bits & (1 << i))
      if (!selected.every((v,i) => i === 0 || selected[i-1] < v)) continue
      if (selected.length > best) { best = selected.length; ways = 1 }
      else if (selected.length === best) ways++
    }
    assert.equal(continuous(a), run); assert.equal(lis(a), best); assert.equal(count(a), ways)
  }
  assert.equal(count([1,3,5,4,7]),2)
})

test('string DP respects contiguous matches, code points and entire-prefix segmentation', () => {
  const lcs = load('longestCommonSubstring'), word = load('wordBreak')
  for (const [a,b,e] of [['','',0],['abc','ac',1],['xxabc','abczz',3],['😀a','x😀a',2],['aa','a',1]]) assert.equal(lcs(a,b),e)
  for (const [s,d,e] of [['',[],true],['a',[],false],['leetcode',['leet','code'],true],['aaaa',['a','aa'],true],['catsandog',['cat','cats','and','sand','dog'],false]]) assert.equal(word(s,Object.freeze(d)),e)
})

test('backtracking copies paths, explores siblings and produces legal unique boards', () => {
  const subsets = load('subsets'), permute = load('permute'), queens = load('solveNQueens')
  assert.deepEqual(plain(subsets([])),[[]]); assert.deepEqual(plain(permute([])),[[]])
  for (const a of [[],[1],[1,2],[1,2,3]]) {
    Object.freeze(a)
    const sets = plain(subsets(a)), permutations = plain(permute(a))
    assert.equal(sets.length, 2 ** a.length)
    assert.equal(new Set(sets.map(JSON.stringify)).size,sets.length)
    assert.equal(permutations.length,[1,1,2,6][a.length])
    assert.equal(new Set(permutations.map(JSON.stringify)).size,permutations.length)
    for (const p of permutations) assert.deepEqual(p.slice().sort(),a.slice().sort())
  }
  for (const [n,count] of [[0,1],[1,1],[2,0],[3,0],[4,2],[5,10]]) {
    const boards = plain(queens(n))
    assert.equal(boards.length,count)
    assert.equal(new Set(boards.map(JSON.stringify)).size,count)
    for (const board of boards) {
      assert.equal(board.length,n)
      const columns = board.map(row => { assert.equal(row.length,n); assert.equal([...row].filter(c=>c==='Q').length,1); return row.indexOf('Q') })
      assert.equal(new Set(columns).size,n)
      assert.equal(new Set(columns.map((c,r)=>r-c)).size,n)
      assert.equal(new Set(columns.map((c,r)=>r+c)).size,n)
    }
  }
})

test('greedy activity counts match exhaustive schedules; cookies and fractions respect constraints', () => {
  const activities = load('maxActivities'), cookies = load('findContentChildren'), fractional = load('fractionalKnapsack')
  const candidates = [[0,10],[1,2],[2,3],[0,2],[-2,0],[3,5]]
  for (let mask = 0; mask < 2 ** candidates.length; mask++) {
    const input = candidates.filter((_,i)=>mask & (1<<i))
    let best=0
    for (let bits=0;bits<2**input.length;bits++) {
      const selected=input.filter((_,i)=>bits&(1<<i)).sort((a,b)=>a[0]-b[0])
      if (selected.every((v,i)=>i===0 || selected[i-1][1]<=v[0])) best=Math.max(best,selected.length)
    }
    assert.equal(activities(Object.freeze(input)),best)
  }
  assert.equal(cookies(Object.freeze([1,2,3]), Object.freeze([1,1])),1)
  assert.equal(cookies([], [1]),0); assert.equal(cookies([1,2], [1,2,3]),2)
  const items=Object.freeze([{weight:10,value:60},{weight:20,value:100},{weight:30,value:120}].map(Object.freeze))
  assert.ok(Math.abs(fractional(items,50)-240)<1e-10)
  assert.equal(fractional(items,0),0); assert.equal(fractional([],10),0)
  assert.equal(fractional([{weight:2,value:0}],1),0)
})

test('expression division preserves duplicate results and rejects unsupported syntax', () => {
  const solve = load('diffWaysToCompute')
  assert.deepEqual(plain(solve('2*3-4*5')).sort((a,b)=>a-b),[-34,-14,-10,-10,10])
  assert.deepEqual(plain(solve('2-1-1')).sort((a,b)=>a-b),[0,2])
  assert.deepEqual(plain(solve('123')),[123]); assert.deepEqual(plain(solve('10+2*3')).sort((a,b)=>a-b),[16,36])
  for (const s of ['', '-1', '1+', '1 / 2', '(1+2)', '2.5', '1a']) assert.throws(()=>solve(s),{name:'SyntaxError'})
})

test('every JavaScript block in the strategy articles was exercised', () => {
  assert.equal(exercised.size, blocks.length)
})
