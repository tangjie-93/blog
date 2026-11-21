---
title: 树的题型：层序、子树返回值、路径与搜索树
date: '2020-10-27'
type: 技术
tags: 算法
note: 树的题型：层序、子树返回值、路径与搜索树
---

## 1. 层序遍历：返回一维结果

先学[树的结构](./数据结构之树.md)与[递归契约](./leetcode之递归专题.md)。所有示例输入均为有限、无环、无共享节点的二叉树，空孩子用 `null`。节点值为有限数值，求和与差值需保持安全范围。除明确说明外不修改输入。

队列按先进先出处理；先入左孩子，再入右孩子。

```js
function levelOrder(root) {
    if (!root) return [];
    const result = [];
    const queue = [root];
    let head = 0;
    while (head < queue.length) {
        const node = queue[head++];
        result.push(node.val);
        if (node.left) queue.push(node.left);
        if (node.right) queue.push(node.right);
    }
    return result;
}
```

时间为 `O(n)`，本数组队列保留已读引用，因此辅助空间为 `O(n)`，结果也为 `O(n)`。

## 2. 层序遍历：按层分组

先固定本层队尾位置，后面入队的是下一层。两个同名函数为独立示例，分别运行。

```js
function levelOrder(root) {
    if (!root) return [];
    const result = [];
    const queue = [root];
    let head = 0;
    while (head < queue.length) {
        const levelEnd = queue.length;
        const level = [];
        while (head < levelEnd) {
            const node = queue[head++];
            level.push(node.val);
            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }
        result.push(level);
    }
    return result;
}
```

时间为 `O(n)`，队列和输出各占 `O(n)`。检查空树、单节点与左右不对称树。

## 3. 后序返回值：最大深度与平衡性

最大深度返回子树高度，先取得左右结果，再取较大者加一。

```js
function maxDepth(root) {
    if (root === null) return 0;
    return Math.max(maxDepth(root.left), maxDepth(root.right)) + 1;
}
```

平衡判断若在每个节点重新求深度，最坏可能达到二次时间。改为一次后序遍历：返回高度，或用 `-1` 表示已不平衡。

```js
function isBalanced(root) {
    function height(node) {
        if (node === null) return 0;
        const left = height(node.left);
        if (left === -1) return -1;
        const right = height(node.right);
        if (right === -1 || Math.abs(left - right) > 1) return -1;
        return Math.max(left, right) + 1;
    }
    return height(root) !== -1;
}
```

两者时间均为 `O(n)`，辅助空间为 `O(h)`；斜树中 `h` 可以为 `n`。递归示例用于深度受控的练习，极深树应改用显式栈。

## 4. 路径状态：只在叶子验收

判断是否存在根到叶路径和等于目标。目标逐层减去当前节点值，只有真正的叶子才能结束，不可把缺失的一个孩子当成叶子。

```js
function hasPathSum(root, target) {
    if (root === null) return false;
    if (root.left === null && root.right === null) return root.val === target;
    return hasPathSum(root.left, target - root.val) ||
        hasPathSum(root.right, target - root.val);
}
```

最坏时间为 `O(n)`，辅助空间为 `O(h)`。负数时不能因为部分和超过目标就剪枝。

## 5. 搜索树：约束来自所有祖先

只比较直接孩子不够。例如根为 `5`，右孩子为 `7`，但该孩子左侧有 `4`，仍违反搜索树条件。向下传递允许范围，等值也判失败。

```js
function isValidBST(root) {
    function visit(node, low, high) {
        if (node === null) return true;
        return node.val > low && node.val < high &&
            visit(node.left, low, node.val) && visit(node.right, node.val, high);
    }
    return visit(root, -Infinity, Infinity);
}
```

时间为 `O(n)`，辅助空间为 `O(h)`。最近公共祖先则利用搜索树有序性：两节点都在同一侧就继续下降，否则当前节点是分叉点。

```js
function lowestCommonAncestor(root, p, q) {
    while (root !== null) {
        if (p.val < root.val && q.val < root.val) root = root.left;
        else if (p.val > root.val && q.val > root.val) root = root.right;
        else return root;
    }
    return null;
}
```

该函数要求输入已经是无重复键的搜索树，且 `p`、`q` 是树内实际节点，允许两者相同。它不验证节点存在性，时间为 `O(h)`，空间为 `O(1)`。普通二叉树不能套用这种数值分支。

## 6. 原长题单的迁移练习

旧文重复的最近公共祖先实现已合并。其余题目归入以下变式，保留学习目标，删除未验证、重复或误导的代码。表格是完整的练习导航，不代表这些变式提供了可复制答案。

| 题型与旧题 | 推导提示 | 验收重点 |
| --- | --- | --- |
| 镜像、对称树 | 镜像交换孩子；对称需成对比较外侧与内侧 | 区分修改树与只读比较，检查单侧分支 |
| 根到叶数字之和 | 向下传 `前缀 × 10 + 当前数字`，只在叶子累加 | 节点限数字、前导零、空树与数值范围 |
| 左叶子之和 | 通过父子关系识别左孩子，且该孩子没有后代时才累加 | 单节点根不计，右叶子不计，左侧内部节点不计 |
| 最小深度、层平均值、堂兄弟 | 层序统计；最小深度遇首个叶子停止；堂兄弟同时比较层与父节点 | 单侧链、同父兄弟不是堂兄弟 |
| 多叉树深度 | 对所有孩子高度取最大值后加一 | 空孩子列表与长链 |
| 二叉树直径、坡度 | 后序返回高度或子树和，另累计全局答案 | 直径按边数；最长路径可能不经过根 |
| 搜索树最小差、修剪、有序数组建树 | 中序相邻值；区间外跳过整侧；选中点构造 | 负数、边界相等、空树；修剪会修改连接 |
| 单值树、第二小值 | 单值直接比较；第二小值记录严格大于最小值的候选 | 重复值、无答案；特殊树性质须先确认 |
| 向下路径和计数 | 枚举起点作基线，再考虑路径前缀计数 | 不限根叶；找到一次后仍可继续；零、负数 |
| 好叶子对 | 子树返回叶子距离，在父节点合并跨左右的配对 | 距离按边数、同侧配对不能重复计数 |
| 子结构与完整子树 | 成对比较结构；两题的匹配终止条件不同 | 子结构允许主树额外后代，完整子树要求完全一致 |
| 最深节点的最小子树 | 返回候选祖先与高度；左右同高取当前根 | 一条深链与两侧同深 |
| 前序与中序建树 | 前序首项是根，中序定位划分左右，传下标避免切片 | 需无重复且遍历合法；检查重建后两种遍历 |

## 7. 练习节奏与验证

先做层序、最大深度与搜索树验证，再每周选一个表中变式。每题写出输入契约、递归返回值或队列状态、复杂度与三个边界例子；间隔至少 `3` 天闭卷重写。

```sh
node --test tests/algorithm-foundations-examples.test.mjs tests/algorithm-tree-graph-examples.test.mjs
```
