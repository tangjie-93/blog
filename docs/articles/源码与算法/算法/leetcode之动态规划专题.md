---
title: 动态规划练习：从状态定义到迁移
date: '2020-07-12'
type: 技术
tags: 算法
note: 保留网格、字符串与序列题型，用代表实现和验收问题串联练习。
---

## 1. 先用题单找状态，不重复背模板

先读[动态规划主文](./算法基本思想之动态规划.md)。以下按难度递进，每次只选择一道题，先写状态、初始化、转移与顺序，再实现。数值与中间结果须在安全整数范围内，输入规模须可分配，所有实现不修改输入。

| 顺序 | 题型 | 状态与验收 |
| --- | --- | --- |
| 第一组 | 爬楼梯、打家劫舍 | 见主文；解释空方案与选/不选，不混淆初始值 |
| 第二组 | 不同路径、障碍路径 | 见主文；无障碍网格可全部填零，检查单行与起点障碍 |
| 第三组 | 礼物最大价值 | 下节实现；说明为什么先处理上方与左方 |
| 第四组 | 连续递增、最长递增及其数量 | 见[序列专题](./leetcode之数组连续递增序列题目总结.md)，区分以某位置结尾与全局答案 |
| 第五组 | 零一背包、零钱最少数量、硬币组合 | 见[背包专题](./动态规划之背包问题总结.md)，解释初始化与循环顺序 |
| 第六组 | 公共子串、单词拆分 | 本文后半部分；先讲清连续性与前缀可达性 |

## 2. 礼物最大价值：计数改成最优化

矩形网格保存非负整数礼物价值，只能向右或向下。`dp[col]` 更新前表示上方最大值，`dp[col - 1]` 更新后表示左方最大值；当前结果取两者最大再加本格。非负前提使边缘的零初始化可行，负数版不能照搬。

```js
function maxGiftValue(grid) {
    if (grid.length === 0 || grid[0].length === 0) return 0;
    const dp = new Array(grid[0].length).fill(0);
    for (const row of grid) {
        for (let col = 0; col < row.length; col++) {
            dp[col] = Math.max(dp[col], col > 0 ? dp[col - 1] : 0) + row[col];
        }
    }
    return dp[dp.length - 1];
}
```

空网格返回 `0`，时间为 `O(mn)`，辅助空间为 `O(n)`。手推 `[[1,3,1],[1,5,1],[4,2,1]]`，答案为 `12`。检查只有一行、一列和全零。

## 3. 最长公共子串：不相等就断开

子串必须连续，不能与最长公共子序列混淆。状态 `dp[i][j]` 表示分别以两个字符串前缀末尾结束的最长公共后缀长度；相等时接上对角线，不等时保持零。答案是整张表的最大值，不一定在右下角。

本例以 `Unicode` 代码点比较，返回长度；不做规范化，不将组合字符当作一个字素。

```js
function longestCommonSubstring(a, b) {
    const x = Array.from(a);
    const y = Array.from(b);
    const dp = Array.from({ length: x.length + 1 }, () => new Array(y.length + 1).fill(0));
    let best = 0;
    for (let i = 1; i <= x.length; i++) {
        for (let j = 1; j <= y.length; j++) {
            if (x[i - 1] === y[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
            best = Math.max(best, dp[i][j]);
        }
    }
    return best;
}
```

时间与空间均为 `O((m + 1)(n + 1))`，包含转换数组和边界行列；两个字符串都非空时通常简写为 `O(mn)`。对 `abc` 与 `ac`，公共子序列长度为 `2`，但本题答案为 `1`。原笔记的越界下标与相邻字符双重判断已移除；需要返回子串时，另记录最大值的结束下标。

## 4. 单词拆分：整个前缀能否组成

约定字符串和非空字典单词只含小写英文字母，单词可重复使用；空字符串可由空方案组成。`dp[i]` 表示前 `i` 个字符能否完整拆分，并不是这整个前缀必须直接出现在字典中。

```js
function wordBreak(s, wordDict) {
    const words = new Set(wordDict);
    const dp = new Array(s.length + 1).fill(false);
    dp[0] = true;
    for (let end = 1; end <= s.length; end++) {
        for (let start = 0; start < end; start++) {
            if (dp[start] && words.has(s.slice(start, end))) {
                dp[end] = true;
                break;
            }
        }
    }
    return dp[s.length];
}
```

枚举切分点，左前缀可达且右段是单词即可。状态空间为 `O(n)`，另有字典存储；按子串复制/哈希线性计费的保守模型，时间最坏为 `O(n³ + D)`，其中 `D` 是字典总字符数，不应仅数双循环就宣称二次时间。峰值额外存储为 `O(n + D)`。

`catsandog` 配合 `cat、cats、and、sand、dog` 返回 `false`；能匹配几个词不等于整串都可拆。

## 5. 每道题的交付

留下自己的状态定义、一个边界失败用例、运行结果和隔几天重做的记录。运行 `node --test tests/algorithm-strategies-examples.test.mjs` 可验证本文示例，但不会自动证明你已独立掌握。

扩展顺序：先尝试恢复一条最优路径，再比较最长公共子序列，最后研究编辑距离。每新增维度都解释它保存了哪一种以前丢失的信息。
