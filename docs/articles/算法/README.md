---
title: 最长回文数
date: '2020-01-14'
type: 技术
tags: 算法
note: 最长回文数
---

### 解法1 中心扩展法
```js
var longestPalindrome1 = function(s) {
    //将s.length<=2的情况进行判断
    if (!s || !s.trim()) return '';
    if (s.length === 1) return s;
    if (s.length === 2) return s[0] === s[1] ? s[0] + s[1] : s[1];
    let result = '';
    let tempStr=""
    let evenSubStr = '';//有两个中心点的回文数
    let oddSubStr = '';//只有一个中心点的回文数
    //s.length>2的情况
    for(let i = 0,len = s.length;i<len;i++){ 
        //两个相邻的字符相等      
        if(s[i] == s[i+1]){
            //经过当前位与下一位判断已构成回文，扩散位直接从下一位开始，可以提速
            evenSubStr = calPalindromeIndex(i-1,i+2,s);
        }
        oddSubStr = calPalindromeIndex(i-1,i+1,s);

        tempStr = oddSubStr.length>evenSubStr.length?oddSubStr:evenSubStr;
        result=tempStr.length>result.length?tempStr:result;
    }
    return result;
};
```
### 扩散坐标
```js
function calPalindromeIndex(left,right,s){
    let len = s.length;
    while(left>=0&&right<len&&s[left] == s[right]){
        left--;
        right++;
    }
    return s.slice(left+1,right);
}
```

### 解法 2 动态规划
```js
var longestPalindrome2 = function(s) {
    if(!s.length||!s.trim().length){
        return s;
    }
    if(!s || s.length == 0){
		return s;
	}else if(s.length == 1){
        return s[0];
    }
	var s_f = s.split('').reverse().join('');
	var resultStr = s[0];
	var maxLen = 1;
	var tmpLen = 1;
	var maxStrIndex = 0;
	var len = s.length;
	
	//初始化二维数组
	var len = s.length;
	var arr = new Array(len);
	for(var i = 0;i<len;i++){
		arr[i] = [];
		for(var r = 0;r<len;r++){
			arr[i][r] = 0
		}
	}
	for(var i = 0;i<len;i++){
		for(var r=0;r<len;r++){
			if(s[i] == s_f[r]){
				if(i==0 || r==0){
					arr[i][r] = 1
				}else{
					arr[i][r] = arr[i-1][r-1] + 1
					tmpLen = arr[i][r]
				}
				if(tmpLen > maxLen && isPalinerome(i,r)){
                    maxStrIndex = r;
                    maxLen = tmpLen;
                    resultStr =  s.substring(i-tmpLen+1,i+1);
                }
			}
		}
	}
	return resultStr;
};
```
#### 判断字符串是否回文
```js
function isPalinerome(i,r){
    if(len - i - 1 == r -tmpLen + 1){
        //console.log('tmpLen',tmpLen)
        return true
    }
    return false;
}
```
### 使用中心扩展法