---
title: 字符串Z型排列
date: '2020-01-14'
type: 技术
tags: 算法
note: 字符串Z型排列
---

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