---
title: 递增序列：连续、非连续与方案计数
date: '2020-12-14'
type: 技术
tags: 算法
note: 明确以某位置结尾的状态，比较扫描与动态规划。
---

## 1. 连续与非连续先分清

输入为有限数值数组，所有比较严格使用“大于”，不修改输入。连续区间不能跳过元素；子序列可以跳过但不能改变顺序。`[1,3,5,4,7]` 的最长连续递增长度为 `3`，最长递增子序列长度为 `4`。

## 2. 连续递增：只看前一个位置

处理当前位置时，`current` 表示**以当前位置结尾**的连续递增长度；当前值大于前一个值则延长，否则重新开始。全局答案另存，不能把局部状态解释为“到目前为止的最大值”。

```js
function findLengthOfLCIS(nums) {
    let current = 0;
    let best = 0;
    for (let i = 0; i < nums.length; i++) {
        current = i > 0 && nums[i] > nums[i - 1] ? current + 1 : 1;
        best = Math.max(best, current);
    }
    return best;
}
```

空数组返回 `0`，全相等非空数组返回 `1`。时间为 `O(n)`，辅助空间为 `O(1)`。扫描足够时不必建立整张状态表。

## 3. 非连续递增：考虑所有可接的前驱

定义 `length[i]` 为以 `i` 结尾的最长严格递增子序列长度。所有满足 `j < i` 且 `nums[j] < nums[i]` 的位置都可能是前驱；每个元素自身至少形成长度为一的序列。

```js
function lengthOfLIS(nums) {
    const length = new Array(nums.length).fill(1);
    let best = 0;
    for (let i = 0; i < nums.length; i++) {
        for (let j = 0; j < i; j++) {
            if (nums[j] < nums[i]) length[i] = Math.max(length[i], length[j] + 1);
        }
        best = Math.max(best, length[i]);
    }
    return best;
}
```

时间为 `O(n²)`，辅助空间为 `O(n)`。先掌握状态，再选学二分维护最小结尾的 `O(n log n)` 方法；那份最小结尾数组本身不一定是一条真实子序列。

## 4. 最长方案有多少条

再定义 `count[i]` 为以 `i` 结尾且达到 `length[i]` 的方案数。发现更长的候选时替换计数；发现同样长的候选时累加；更短的候选不贡献。

```js
function findNumberOfLIS(nums) {
    const length = new Array(nums.length).fill(1);
    const count = new Array(nums.length).fill(1);
    let best = 0;
    for (let i = 0; i < nums.length; i++) {
        for (let j = 0; j < i; j++) {
            if (nums[j] >= nums[i]) continue;
            if (length[j] + 1 > length[i]) {
                length[i] = length[j] + 1;
                count[i] = count[j];
            } else if (length[j] + 1 === length[i]) count[i] += count[j];
        }
        best = Math.max(best, length[i]);
    }
    let total = 0;
    for (let i = 0; i < nums.length; i++) {
        if (length[i] === best) total += count[i];
    }
    return total;
}
```

按下标选择不同算不同方案，故 `[2,2,2]` 的答案为 `3`，不是 `1`；空数组约定返回 `0`。输入规模须保证计数在安全整数范围内。时间为 `O(n²)`，辅助空间为 `O(n)`。

## 5. 验证与复盘

运行 `node --test tests/algorithm-strategies-examples.test.mjs`。用空数组、全等、下降、重复前驱和 `[1,3,5,4,7]` 核对；小输入枚举所有下标子集可作为计数的独立对照。

闭卷追问：为什么连续版本只看相邻位置，而非连续版本要看所有前驱？为什么找到更长序列时必须覆盖旧计数？动态规划原理见[主文](./算法基本思想之动态规划.md)。
