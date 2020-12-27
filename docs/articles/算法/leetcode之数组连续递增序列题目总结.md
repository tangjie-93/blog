---
title: leetcode之数组连续递增序列题目总结
date: '2020-12-14'
type: 技术
tags: 算法
note: leetcode之数组连续递增序列题目总结
---
## [1、最长连续递增子序列](https://leetcode-cn.com/problems/longest-continuous-increasing-subsequence/)

给定一个未经排序的整数数组，找到最长且 **连续递增的子序列**，并返回该序列的长度。
 **连续递增的子序列：** 可以由两个下标 `l` 和 `r（l < r）` 确定，如果对于每个 `l <= i < r`，都有 `nums[i] < nums[i + 1]` ，那么子序列 `[nums[l], nums[l + 1], ..., nums[r - 1], nums[r]]` 就是连续递增子序列。

**示例1**
```js
输入：nums = [1,3,5,4,7]
输出：3
解释：最长连续递增序列是 [1,3,5], 长度为3。
尽管 [1,3,5,7] 也是升序的子序列, 但它不是连续的，因为 5 和 7 在原数组里被 4 隔开。
```
**题解**
```js
//使用动态规划
const findLengthOfLCIS=function(nums) {
    const len=nums.length;
    if(len<2) return len;
    //动态规划初始化 设置值为1 因为至少可以与其自身形成递增子序列
    const dp=new Array(len).fill(1);
    let max=1;
    for(let i=1;i<len;i++){
        //如果存在当前值的大小大于上一个值，则初始位置到当前位置的序列长度加1，否则序列长度不变
        if(nums[i]>nums[i-1]){
            dp[i]=dp[i-1]+1;
            max=Math.max(max,dp[i]);
        }
    }
    return max;
}
```

## [2、最长递增子序列的个数](https://leetcode-cn.com/problems/number-of-longest-increasing-subsequence/)
给定一个未排序的整数数组，找到最长递增子序列的个数。

**示例1**
```js
输入: [1,3,5,4,7]
输出: 2
解释: 有两个最长递增子序列，分别是 [1, 3, 4, 7] 和[1, 3, 5, 7]。
```
**示例2**
```js
输入: [2,2,2,2,2]
输出: 5
解释: 最长递增子序列的长度是1，并且存在5个子序列的长度为1，因此输出5。
```
**题解**
```js
var findNumberOfLIS = function(nums) {
   const len=nums.length;
   if(len<2) return len;
   //dp[i] 表示初始位置到i位置的最大递增序列的长度
   const dp=new Array(len).fill(1);
   //counter[i]表示初始位置到i位置的最大递增序列的个数
   const counter=new Array(len).fill(1);
   let max=0;
    for(let i=1;i<len;i++){
      for(let j=0;j<i;j++){
        if(nums[i]>nums[j]){
          if(dp[i]<dp[j]+1){
            /**
             * 当i=1时 num[1]>num[0]
             * 	j=0;dp[1]<dp[0]+1=2,dp[1]=2 counter[1]=counter[0]=1
             * 	循环结束
             * 当i=2时 num[2]>num[0],num[1]
			 * 	j=0;dp[2]<dp[0]+1=2,dp[2]=2 counter[2]=counter[0]=1
			 * 	j=1;dp[2]<dp[1]+1=3,dp[2]=3 counter[2]=counter[1]=1
			 * 当i=3,num[3]>num[0],num[1]
			 * 	j=0;dp[3]<dp[0]+1=2,dp[3]=2 counter[3]=counter[0]=1
			 * 	j=1;dp[3]<dp[1]+1=3,dp[3]=3 counter[3]=counter[1]=1
			 * 当i=4,num[4]>num[3],num[2],num[1],num[0]
			 * 	j=0，dp[4]<dp[0]+1=2,dp[4]=2 counter[4]=counter[0]=1
			 * 	j=1，dp[4]<dp[1]+1=3,counter[4]=counter[1]=1
			 * 	j=2，dp[4]<dp[2]+1=4,counter[4]=counter[2]=1
			 * 	j=3, dp[4]=dp[3]+1=4,counter[4]+=counter[3]=2
             */	
            dp[i]=dp[j]+1;
            counter[i]=counter[j];
          }else if(dp[i]===dp[j]+1){
            //表示j位置的
            counter[i]+=counter[j];
          }
        }
      }
      max=Math.max(max,dp[i]);
    }
    let count=0;
    for(let i=0;i<len;i++){
      if(dp[i]===max) count+=counter[i];
    }
    return count;

};
findNumberOfLIS( [1,3,5,4,7])
```