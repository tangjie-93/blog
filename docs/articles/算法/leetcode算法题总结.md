---
title: leetcode算法题总结
date: '2020-04-06'
type: 技术
tags: 算法
note: leetcode算法题总结
---
#### 1、数字 n 代表生成括号的对数，请你设计一个函数，用于能够生成所有可能的并且 有效的 括号组合。
```js
// 深度优先搜索
var generateParenthesis = function (n) {
    const arr = []
    function dfs (str, left, right) {
        //终止条件
        if (right > left || left > n) return
        //得到解之后添加进数组并返回
        if (right === n) {
            arr.push(str)
            return
        }
        //分别遍历左右子树
        dfs(str + '(', left + 1, right)
        dfs(str + ')', left, right + 1)
    }
    //开始时为空字符
    dfs('', 0, 0)
    console.log(arr);
    return arr
};
```
#### 2、字符串Z型排列

```js
function convert(s, numRows) {
  if (numRows == 1) return s;
  let ret="";
  const n = s.length;
  const cycleLen = 2 * numRows - 2;

  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j + i < n; j += cycleLen) {
      ret += s[j + i];
      if (i != 0 && i != numRows - 1 && j + cycleLen - i < n)
        ret += s[j + cycleLen - i];
    }
  }
  console.log(ret);
}
convert("LEETCODEISHIRING", 3);
```