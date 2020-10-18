---
title: leetcode之排序专题
date: '2020-07-12'
type: 技术
tags: 算法
note: leetcode之排序专题
---
## 1、重构字符串[767题](重构字符串)
给定一个字符串 `S`，检查是否能重新排布其中的字母，使得两相邻的字符不同。
若可行，输出任意可行的结果。若不可行，返回空字符串。
**示例**
```js
输入: S = "aab"
输出: "aba"

输入: S = "aaab"
输出: ""
```
**题解**
```js
/**
 * @param {string} S
 * @return {string}
 */
var reorganizeString = function(S) {
     const len=S.length;
    if(len===0) return ""
    //用于存放字符及其数量
    let hashArr = new Array(26).fill(0);
    for(let i=0;i<S.length;i++){
        let item = hashArr[S[i].charCodeAt()-97];
        if(item){
            item.count++;
        }else{
            hashArr[S[i].charCodeAt()-97] = {name:S[i],count:1}
        }
    }
    hashArr = hashArr.filter((v)=>v!=0); //，过滤，把没出现的数字去掉，减少后面遍历次数
    hashArr.sort((a,b)=>(b.count-a.count)); //按count大小降序排列
    if(hashArr[0].count>Math.ceil(S.length/2)){
        //这里是无法构造的情况
        return ""
    }else{
        //这里是可以构造的
        let res=new Array(hashArr[0].count).fill(hashArr[0].name)
        // let cur = 1;//表示hashArr的索引
        let i = 1;
        //开始构造输出的数据，隔一个插入一个
        for(let cur=1;cur<hashArr.length;){
            res.splice(i,0,hashArr[cur].name);
            hashArr[cur].count--;
            if(hashArr[cur].count===0){
                cur++;
            }
            //隔一个插入
            i=i+2>res.length?1:i+2
        }
         return res.join('');
    }
   
};
```
## 2、车队[853题](https://leetcode-cn.com/problems/car-fleet/)
`N` 辆车沿着一条车道驶向位于 `target` 英里之外的共同目的地。每辆车 `i` 以恒定的速度 `speed[i]` （英里/小时），从初始位置 `position[i]` （英里） 沿车道驶向目的地。一辆车永远不会超过前面的另一辆车，但它可以追上去，并与前车以相同的速度紧接着行驶。此时，我们会忽略这两辆车之间的距离，也就是说，它们被假定处于相同的位置。车队 是一些由行驶在相同位置、具有相同速度的车组成的非空集合。注意，一辆车也可以是一个车队。即便一辆车在目的地才赶上了一个车队，它们仍然会被视作是同一个车队。会有多少车队到达目的地?
**示例**
```js
输入：target = 12, position = [10,8,0,5,3], speed = [2,4,1,1,3]
输出：3
解释：
从 10 和 8 开始的车会组成一个车队，它们在 12 处相遇。
从 0 处开始的车无法追上其它车，所以它自己就是一个车队。
从 5 和 3 开始的车会组成一个车队，它们在 6 处相遇。
请注意，在到达目的地之前没有其它车会遇到这些车队，所以答案是 3。
```
**题解**
```js
/**
 * @param {number} target
 * @param {number[]} position
 * @param {number[]} speed
 * @return {number}
 */
var carFleet = function(target, position, speed) {
   const len=position.length
    if(len===1) return 1;
    //初始化数组
    const arr=new Array(len);
    //构造数组
    for(let i=0;i<len;i++){
        arr[i]=[position[i],(target-position[i])/speed[i]]
    }
    //对数组按位置进行降序排序
    arr.sort((a,b)=>b[0]-a[0]);
    let count=0;
   let group = null
    while(arr.length){
        let item = arr.shift()
        // item起始位置一定小于group(逆序排的),如果它的时间不大于group那就是从后面追上，就是一个车队了
        if(group && (item[1] <= group[1])) continue
        // 否则，追不上就说明拉开了差距，产生一个新的车队
        group = item
        count++
    }
    return count
};
```
## 3、餐厅过滤器[1333题](https://leetcode-cn.com/problems/filter-restaurants-by-vegan-friendly-price-and-distance/)
给你一个餐馆信息数组 `restaurants`，其中  `restaurants[i]` = `[idi, ratingi, veganFriendlyi, pricei, distancei]`。你必须使用以下三个过滤器来过滤这些餐馆信息。

其中素食者友好过滤器 `veganFriendly` 的值可以为 `true` 或者 `false`，如果为 `true` 就意味着你应该只包括 `veganFriendlyi` 为 `true` 的餐馆，为 `false` 则意味着可以包括任何餐馆。此外，我们还有最大价格 `maxPrice` 和最大距离 `maxDistance` 两个过滤器，它们分别考虑餐厅的价格因素和距离因素的最大值。

过滤后返回餐馆的 `id`，按照 `rating` 从高到低排序。如果 `rating` 相同，那么按 `id` 从高到低排序。简单起见， `veganFriendlyi` 和 `veganFriendly` 为 `true` 时取值为 `1`，为 `false` 时，取值为 `0` 。
**示例**
```js
输入：restaurants = [[1,4,1,40,10],[2,8,0,50,5],[3,8,1,30,4],[4,10,0,10,3],[5,1,1,15,1]], veganFriendly = 1, maxPrice = 50, maxDistance = 10
输出：[3,1,5] 
解释： 
这些餐馆为：
餐馆 1 [id=1, rating=4, veganFriendly=1, price=40, distance=10]
餐馆 2 [id=2, rating=8, veganFriendly=0, price=50, distance=5]
餐馆 3 [id=3, rating=8, veganFriendly=1, price=30, distance=4]
餐馆 4 [id=4, rating=10, veganFriendly=0, price=10, distance=3]
餐馆 5 [id=5, rating=1, veganFriendly=1, price=15, distance=1] 
在按照 veganFriendly = 1, maxPrice = 50 和 maxDistance = 10 进行过滤后，我们得到了餐馆 3, 餐馆 1 和 餐馆 5（按评分从高到低排序）。 
```
**题解**
```js
/**
 * @param {number[][]} restaurants
 * @param {number} veganFriendly
 * @param {number} maxPrice
 * @param {number} maxDistance
 * @return {number[]}
 */
var filterRestaurants = function(restaurants, veganFriendly, maxPrice, maxDistance) {
    //过滤，排序，求值
    return restaurants
    .filter(restaurant=>restaurant[2]>=veganFriendly&&restaurant[3]<=maxPrice&&restaurant[4]<=maxDistance)
    .sort((a,b)=>a[1]===b[1]?b[0]-a[0]:b[1]-a[1])
    .map(restaurant=>restaurant[0])
};
```
## 4、重新排列句子中的单词[1451题](https://leetcode-cn.com/problems/rearrange-words-in-a-sentence/)
「句子」是一个用空格分隔单词的字符串。给你一个满足下述格式的句子 `text` :句子的首字母大写`text` 中的每个单词都用单个空格分隔。请你重新排列 `text` 中的单词，使所有单词按其长度的升序排列。如果两个单词的长度相同，则保留其在原句子中的相对顺序。请同样按上述格式返回新的句子。
**示例**
```js
输入：text = "Keep calm and code on"
输出："On and keep calm code"
解释：输出的排序情况如下：
"On" 2 个字母。
"and" 3 个字母。
"keep" 4 个字母，因为存在长度相同的其他单词，所以它们之间需要保留在原句子中的相对顺序。
"calm" 4 个字母。
"code" 4 个字母。
```
**题解**
```js
/**
 * @param {string} text
 * @return {string}
 */
var arrangeWords = function(text) {
    const segments=text.split(" ")
    .map(str=>str.toLowerCase())
    .sort((a,b)=>a.length-b.length);
    segments[0]=segments[0][0].toUpperCase()+segments[0].slice(1);
    return segments.join(" ");
};
```
## 5、按奇偶排序数组 II[922题](https://leetcode-cn.com/problems/sort-array-by-parity-ii/)
给定一个非负整数数组 `A`， `A` 中一半整数是奇数，一半整数是偶数。
对数组进行排序，以便当 `A[i]` 为奇数时，`i` 也是奇数；当 `A[i]` 为偶数时， `i` 也是偶数。你可以返回任何满足上述条件的数组作为答案。
**示例**
```js
输入：[4,2,5,7]
输出：[4,5,2,7]
解释：[4,7,2,5]，[2,5,4,7]，[2,7,4,5] 也会被接受。
```
**题解**
```js
/**
 * @param {number[]} A
 * @return {number[]}
 */
//方法2 双指针
var sortArrayByParityII=function(A){
    let j = 1;
    for (let i = 0; i < A.length; i += 2)
        //此位置是应该放置偶数
        if (A[i] % 2 == 1) {
            while (j<A.length&&A[j] % 2 == 1){
                 j += 2;
            }
            //交换位置
            [A[i],A[j]]=[A[j],A[i]]
        }
    return A;
}
```
## 6、上升下降字符串[1370题](https://leetcode-cn.com/problems/increasing-decreasing-string/)
给你一个字符串 s ，请你根据下面的算法重新构造字符串：

从 s 中选出 最小 的字符，将它 接在 结果字符串的后面。
从 s 剩余字符中选出 最小 的字符，且该字符比上一个添加的字符大，将它 接在 结果字符串后面。
重复步骤 2 ，直到你没法从 s 中选择字符。
从 s 中选出 最大 的字符，将它 接在 结果字符串的后面。
从 s 剩余字符中选出 最大 的字符，且该字符比上一个添加的字符小，将它 接在 结果字符串后面。
重复步骤 5 ，直到你没法从 s 中选择字符。
重复步骤 1 到 6 ，直到 s 中所有字符都已经被选过。
在任何一步中，如果最小或者最大字符不止一个 ，你可以选择其中任意一个，并将其添加到结果字符串。

请你返回将 s 中字符重新排序后的 结果字符串 。
**示例**
```js
输入：s = "aaaabbbbcccc"
输出："abccbaabccba"
解释：第一轮的步骤 1，2，3 后，结果字符串为 result = "abc"
第一轮的步骤 4，5，6 后，结果字符串为 result = "abccba"
第一轮结束，现在 s = "aabbcc" ，我们再次回到步骤 1
第二轮的步骤 1，2，3 后，结果字符串为 result = "abccbaabc"
第二轮的步骤 4，5，6 后，结果字符串为 result = "abccbaabccba"
```
**题解**
```js
/**
 * @param {string} s
 * @return {string}
 */
var sortString = function(s) {
    let h=new Array(26).fill(0);
    for (let i=0;i<s.length;i++){
        //计算字符串总各字母的数量，将字母转换成数字并统计
        h[s.charCodeAt(i) - 97]++;
    } 
    let ret='';
    const appendChar =p=> {
        if (h[p]) {
            h[p]--;
            ret+=(String.fromCharCode(p + 97));
        }
    };

    while (true) {
        //直到字符串被添加完毕
        if (!haveChar(h)) break;
        //从小到大添加一遍
        for (let i = 0; i < 26; ++i) appendChar(i);
        //从大到小添加一遍
        for (let i = 25; i >= 0; --i) appendChar(i);
    }

    return ret;
};
function  haveChar(h) {
    for (let i = 0; i < 26; ++i) {
        if (h[i]) {
            return true;
        }
    }
    return false;
}
```
## 7、将矩阵按对角线排序[1329题](https://leetcode-cn.com/problems/sort-the-matrix-diagonally/)
给你一个 m * n 的整数矩阵 mat ，请你将同一条对角线上的元素（从左上到右下）按升序排序后，返回排好序的矩阵。
**题解**
```js
/**
 * @param {number[][]} mat
 * @return {number[][]}
 */
var diagonalSort = function(mat) {
    const m=mat.length;
    const n=mat[0].length;
    //Math.min(m,n)为对角线的长度最大值，用于对角线上数据比较次数
    for(let k=0;k<Math.min(m,n);k++){
        //行数
        for(let i=0;i<m-1;i++){
            //列数
            for(let j=0;j<n-1;j++){
                if(mat[i][j]>mat[i+1][j+1])
                [mat[i][j],mat[i+1][j+1]]=[mat[i+1][j+1],mat[i][j]];
            }
        }
    } 
    return mat;
};
```
## 8、根据数字二进制下 1 的数目排序[1356题](https://leetcode-cn.com/problems/sort-integers-by-the-number-of-1-bits/)
给你一个整数数组 arr 。请你将数组中的元素按照其二进制表示中数字 1 的数目升序排序。
如果存在多个数字二进制中 1 的数目相同，则必须将它们按照数值大小升序排列。
请你返回排序后的数组。
**示例**
```js
输入：arr = [0,1,2,3,4,5,6,7,8]
输出：[0,1,2,4,8,3,5,6,7]
解释：[0] 是唯一一个有 0 个 1 的数。
[1,2,4,8] 都有 1 个 1 。
[3,5,6] 有 2 个 1 。
[7] 有 3 个 1 。
按照 1 的个数排序得到的结果数组为 [0,1,2,4,8,3,5,6,7]
```
**题解**
```js
/**
 * @param {number[]} arr
 * @return {number[]}
 */
var sortByBits = function(arr) {
    //升序排列
    arr.sort((a,b)=>a-b)
    return arr.sort((a,b)=>calcCount
    (a)-calcCount(b))
};
function calcCount(num){
   const count=num.toString(2).split("").filter(char=>char==="1").length;
   return count
}
```
## 9、不同整数的最少数目[1481题](https://leetcode-cn.com/problems/least-number-of-unique-integers-after-k-removals/)
给你一个整数数组 arr 和一个整数 k 。现需要从数组中恰好移除 k 个元素，请找出移除后数组中不同整数的最少数目。
**示例**
```js
输入：arr = [4,3,1,1,3,3,2], k = 3
输出：2
解释：先移除 4、2 ，然后再移除两个 1 中的任意 1 个或者三个 3 中的任意 1 个，最后剩下 1 和 3 两种整数。
```
**题解**
```js
/**
 * @param {number[]} arr
 * @param {number} k
 * @return {number}
 */
var findLeastNumOfUniqueInts = function(arr, k) {
    const obj={};
    arr.forEach(char=>{
        obj[char]=obj[char]?obj[char]+1:1;
    });
    //按数量进行升序排序
    const sortedKey=Object.keys(obj).sort((a,b)=>obj[a]-obj[b]);
    let count=0;
    const len=sortedKey.length;
    for(let i=0;i<len;i++){
        //统计个数
        count+=obj[sortedKey[i]]
        if(count===k) return len-i-1;
        if(count>k) return len-i
    }
};
```
## 10、交换和[16题](https://leetcode-cn.com/problems/sum-swap-lcci/)
给定两个整数数组，请交换一对数值（每个数组中取一个数值），使得两个数组所有元素的和相等。

返回一个数组，第一个元素是第一个数组中要交换的元素，第二个元素是第二个数组中要交换的元素。若有多个答案，返回任意一个均可。若无满足条件的数值，返回空数组。
**示例**
```js
输入: array1 = [4, 1, 2, 1, 1, 2], array2 = [3, 6, 3, 3]
输出: [1, 3]
```
**题解**
```js
/**
 * @param {number[]} array1
 * @param {number[]} array2
 * @return {number[]}
 */
var findSwapValues = function(array1, array2) {
    const total1=array1.reduce((cur,next)=>{
        return cur+next
    })
    const total2=array2.reduce((cur,next)=>{
        return cur+next
    })
    array1.sort();
    array2.sort();
    //求差
    const dif=total1-total2
    //判断奇偶
    if(dif%2) return [];
    let dif2;
    for(let i=0;i<array1.length;i++){
        dif2=array1[i]-dif/2
        if(array2.includes(dif2)){
            return [array1[i],dif2]
        }
    }
    return [];
};
```
## 11、收藏清单[1452题](https://leetcode-cn.com/problems/people-whose-list-of-favorite-companies-is-not-a-subset-of-another-list/)
给你一个数组 favoriteCompanies ，其中 favoriteCompanies[i] 是第 i 名用户收藏的公司清单（下标从 0 开始）。
请找出不是其他任何人收藏的公司清单的子集的收藏清单，并返回该清单下标。下标需要按升序排列。
**示例**
```js
输入：favoriteCompanies = [["leetcode","google","facebook"],["leetcode","amazon"],["facebook","google"]]
输出：[0,1] 
解释：favoriteCompanies[2]=["facebook","google"] 是 favoriteCompanies[0]=["leetcode","google","facebook"] 的子集，因此，答案为 [0,1] 。
```
**题解**
```js
/**
 * @param {string[][]} favoriteCompanies
 * @return {number[]}
 */
var peopleIndexes = function(favoriteCompanies) {
   const res=[]
    const copy=favoriteCompanies.slice();
    //升序排序
    favoriteCompanies.sort((a,b)=>a.length-b.length)
    for(let i=0,len=favoriteCompanies.length;i<len-1;i++){
        for(let j=i+1;j<len;j++){
          const bool= favoriteCompanies[i].every(num=>favoriteCompanies[j].includes(num));
          if(bool){
              res.push(copy.indexOf(favoriteCompanies[i]))
              break;
          }
        }
    }
    const result=Object.keys(copy).filter(index=>!res.includes(Number(index))).map(Number)
    return result;
};
```
## 12、距离相等的条形码[1054题](https://leetcode-cn.com/problems/distant-barcodes/)
在一个仓库里，有一排条形码，其中第 i 个条形码为 barcodes[i]。

请你重新排列这些条形码，使其中两个相邻的条形码 不能 相等。 你可以返回任何满足该要求的答案，此题保证存在答案。
**示例**
```js
输入：[1,1,1,1,2,2,3,3]
输出：[1,3,1,3,2,1,2,1]
```
**题解**
```js
/**
 * @param {number[]} barcodes
 * @return {number[]}
 */
var rearrangeBarcodes = function(barcodes) {
   const obj = {};
    const len = barcodes.length;
    for (let i = 0; i < len; i++) {
        obj[barcodes[i]] ? ++obj[barcodes[i]] : obj[barcodes[i]] = 1
    }
    //按数量降序排序，数量相同，数字大的排在前面
    barcodes.sort((a, b) => obj[b] === obj[a] ? b - a : obj[b] - obj[a]);
    const mid = Math.floor(len / 2);
    //考虑奇偶情况，奇数的话在1位置开始插入，偶数的时候在0位置开始插入
    const num = len % 2 ? 1 : 0
    for (let i = 0, j = num; i < mid; i++, j = j + 2) {
        barcodes.splice(j, 0, barcodes.splice(mid+num+ i, 1)[0])
    }
    return barcodes
};
```
## 13、数组的相对排序[1122题](https://leetcode-cn.com/problems/relative-sort-array/)
给你两个数组，`arr1` 和 `arr2`，
+ `arr2` 中的元素各不相同
+ `arr2` 中的每个元素都出现在 `arr1` 中
对 `arr1` 中的元素进行排序，使 `arr1` 中项的相对顺序和 `arr2` 中的相对顺序相同。未在 `arr2` 中出现过的元素需要按照升序放在 `arr1` 的末尾。
**示例**
```js
输入：arr1 = [2,3,1,3,2,4,6,7,9,2,19], arr2 = [2,1,4,3,9,6]
输出：[2,2,2,1,4,3,3,9,6,7,19]
```
**题解**
```js
/**
 * @param {number[]} arr1
 * @param {number[]} arr2
 * @return {number[]}
 */
var relativeSortArray = function(arr1, arr2) {
    const res=[];
    let index;
    for(let i=0;i<arr2.length;i++){
        index=arr1.indexOf(arr2[i]);
        while(index>-1){
            res.push(arr1.splice(index,1)[0])
            index=arr1.indexOf(arr2[i]);
        }
    }
    arr1.sort((a,b)=>a-b)
    return [...res,...arr1]
};
```
## 14、存在重复元素[220题](https://leetcode-cn.com/problems/contains-duplicate-iii/)
在整数数组 nums 中，是否存在两个下标 i 和 j，使得 nums [i] 和 nums [j] 的差的绝对值小于等于 t ，且满足 i 和 j 的差的绝对值也小于等于 ķ 。
如果存在则返回 true，不存在返回 false。
**实例**
```js
输入: nums = [1,2,3,1], k = 3, t = 0
输出: true
```
**题解**
```js
/**
 * @param {number[]} nums
 * @param {number} k
 * @param {number} t
 * @return {boolean}
 */
var containsNearbyAlmostDuplicate = function(nums, k, t) {
    const len=nums.length;
    const abs=Math.abs;
    for(let i=0;i<len-1;i++){
        for(let j=i+1;j<len;j++){
            if(abs(nums[i]-nums[j])<=t&&abs(i-j)<=k){
                return true;
            }
        }
    }
    return false
};
```
## 15、最大数[179题](https://leetcode-cn.com/problems/largest-number/)
给定一组非负整数，重新排列它们的顺序使之组成一个最大的整数。
**示例**
```js
输入: [3,30,34,5,9]
输出: 9534330
```
**题解**
```js
/**
 * @param {number[]} nums
 * @return {string}
 */
var largestNumber = function(nums) {
    if(Number(nums.join(""))){

        return nums.map(a=>a.toString()).sort((a,b)=>(b+a)-(a+b)).join("")
    }
    return "0"
   
};
```
## 16、H 指数[274题](https://leetcode-cn.com/problems/h-index/)
给定一位研究者论文被引用次数的数组（被引用次数是非负整数）。编写一个方法，计算出研究者的 h 指数。

h 指数的定义：h 代表“高引用次数”（high citations），一名科研人员的 h 指数是指他（她）的 （N 篇论文中）总共有 h 篇论文分别被引用了至少 h 次。（其余的 N - h 篇论文每篇被引用次数 不超过 h 次。）

例如：某人的 h 指数是 20，这表示他已发表的论文中，每篇被引用了至少 20 次的论文总共有 20 篇。
**示例**
```js
输入：citations = [3,0,6,1,5]
输出：3 
解释：给定数组表示研究者总共有 5 篇论文，每篇论文相应的被引用了 3, 0, 6, 1, 5 次。
     由于研究者有 3 篇论文每篇 至少 被引用了 3 次，其余两篇论文每篇被引用 不多于 3 次，所以她的 h 指数是 3。
```
**题解**
```js
/**
 * @param {number[]} citations
 * @return {number}
 */
var hIndex = function(citations) {
    //降序排序
   citations.sort((a,b)=>b-a);
   const len=citations.length;
    for(let i =0;i<len;i++){
        //citations[i]引用次数，i表示论文篇数
        if(i>=citations[i]){
            return i
        }   
    }
    return len?len:0
};
```
## 17、非递增顺序的最小子序列[1403题](https://leetcode-cn.com/problems/minimum-subsequence-in-non-increasing-order/)
给你一个数组 nums，请你从中抽取一个子序列，满足该子序列的元素之和 严格 大于未包含在该子序列中的各元素之和。
如果存在多个解决方案，只需返回 长度最小 的子序列。如果仍然有多个解决方案，则返回 元素之和最大 的子序列。
与子数组不同的地方在于，「数组的子序列」不强调元素在原数组中的连续性，也就是说，它可以通过从数组中分离一些（也可能不分离）元素得到。
注意，题目数据保证满足所有约束条件的解决方案是 唯一 的。同时，返回的答案应当按 非递增顺序 排列。
**示例**
```js
输入：nums = [4,3,10,9,8]
输出：[10,9] 
解释：子序列 [10,9] 和 [10,8] 是最小的、满足元素之和大于其他各元素之和的子序列。但是 [10,9] 的元素之和最大。 
```
**题解**
```js
/**
 * @param {number[]} nums
 * @return {number[]}
 */
var minSubsequence = function(nums) {
    //降序排序
    nums.sort((a,b)=>b-a)
    const sum=nums.reduce((cur,next)=>cur+next,0)
    let res=0;
    for(let i=0;i<nums.length;i++){
        res+=nums[i];
        if(res>sum-res){
            return nums.slice(0,i+1);
        }
    }
};
```
## 18、煎饼排序 [969题](https://leetcode-cn.com/problems/pancake-sorting/)
给定数组 A，我们可以对其进行煎饼翻转：我们选择一些正整数 k <= A.length，然后反转 A 的前 k 个元素的顺序。我们要执行零次或多次煎饼翻转（按顺序一次接一次地进行）以完成对数组 A 的排序。
返回能使 A 排序的煎饼翻转操作所对应的 k 值序列。任何将数组排序且翻转次数在 10 * A.length 范围内的有效答案都将被判断为正确。
**示例**
```js
输入：[3,2,4,1]
输出：[4,2,4,3]
解释：
我们执行 4 次煎饼翻转，k 值分别为 4，2，4，和 3。
初始状态 A = [3, 2, 4, 1]
第一次翻转后 (k=4): A = [1, 4, 2, 3]
第二次翻转后 (k=2): A = [4, 1, 2, 3]
第三次翻转后 (k=4): A = [3, 2, 1, 4]
第四次翻转后 (k=3): A = [1, 2, 3, 4]，此时已完成排序。
```
**[题解](https://leetcode-cn.com/submissions/detail/79866477/)**
## 19、将整数按权重排序[1387题](https://leetcode-cn.com/problems/sort-integers-by-the-power-value/)

我们将整数 x 的 权重 定义为按照下述规则将 x 变成 1 所需要的步数：

如果 x 是偶数，那么 x = x / 2
如果 x 是奇数，那么 x = 3 * x + 1
比方说，x=3 的权重为 7 。因为 3 需要 7 步变成 1 （3 --> 10 --> 5 --> 16 --> 8 --> 4 --> 2 --> 1）。

给你三个整数 lo， hi 和 k 。你的任务是将区间 [lo, hi] 之间的整数按照它们的权重 升序排序 ，如果大于等于 2 个整数有 相同 的权重，那么按照数字自身的数值 升序排序 。

请你返回区间 [lo, hi] 之间的整数按权重排序后的第 k 个数。

注意，题目保证对于任意整数 x （lo <= x <= hi） ，它变成 1 所需要的步数是一个 32 位有符号整数。

**示例**
```js
输入：lo = 12, hi = 15, k = 2
输出：13
解释：12 的权重为 9（12 --> 6 --> 3 --> 10 --> 5 --> 16 --> 8 --> 4 --> 2 --> 1）
13 的权重为 9
14 的权重为 17
15 的权重为 17
区间内的数按权重排序以后的结果为 [12,13,14,15] 。对于 k = 2 ，答案是第二个整数也就是 13 。
注意，12 和 13 有相同的权重，所以我们按照它们本身升序排序。14 和 15 同理。
```
**[题解](https://leetcode-cn.com/submissions/detail/79943575/)**

## 20、数组中的 k 个最强值 [1471题](https://leetcode-cn.com/problems/the-k-strongest-values-in-an-array/)
给你一个整数数组 arr 和一个整数 k 。
设 m 为数组的中位数，只要满足下述两个前提之一，就可以判定 arr[i] 的值比 arr[j] 的值更强：
+ |arr[i] - m| > |arr[j] - m|
+ |arr[i] - m| == |arr[j] - m|，且 arr[i] > arr[j]
请返回由数组中最强的 k 个值组成的列表。答案可以以 任意顺序 返回。

中位数 是一个有序整数列表中处于中间位置的值。形式上，如果列表的长度为 n ，那么中位数就是该有序列表（下标从 0 开始）中位于 ((n - 1) / 2) 的元素。

例如 arr = [6, -3, 7, 2, 11]，n = 5：数组排序后得到 arr = [-3, 2, 6, 7, 11] ，数组的中间位置为 m = ((5 - 1) / 2) = 2 ，中位数 arr[m] 的值为 6 。
例如 arr = [-7, 22, 17, 3]，n = 4：数组排序后得到 arr = [-7, 3, 17, 22] ，数组的中间位置为 m = ((4 - 1) / 2) = 1 ，中位数 arr[m] 的值为 3 。
**示例**
```js
输入：arr = [1,2,3,4,5], k = 2
输出：[5,1]
解释：中位数为 3，按从强到弱顺序排序后，数组变为 [5,1,4,2,3]。最强的两个元素是 [5, 1]。[1, 5] 也是正确答案。
注意，尽管 |5 - 3| == |1 - 3| ，但是 5 比 1 更强，因为 5 > 1 。
```
**[题解](https://leetcode-cn.com/submissions/detail/81381764/)**
## 21、三角形的最大周长[976题](https://leetcode-cn.com/problems/largest-perimeter-triangle/)
**[题解](https://leetcode-cn.com/submissions/detail/75869263/)**
## 22、通过删除字母匹配到字典里最长单词[524题](https://leetcode-cn.com/problems/longest-word-in-dictionary-through-deleting/)
给定一个字符串和一个字符串字典，找到字典里面最长的字符串，该字符串可以通过删除给定字符串的某些字符来得到。如果答案不止一个，返回长度最长且字典顺序最小的字符串。如果答案不存在，则返回空字符串。
**示例**
```js
输入:
s = "abpcplea", d = ["ale","apple","monkey","plea"]
输出: 
"apple"
```
**[题解](https://leetcode-cn.com/submissions/detail/81227776/)**
## 23、把数组排成最小的数 [45题](https://leetcode-cn.com/problems/ba-shu-zu-pai-cheng-zui-xiao-de-shu-lcof/)
输入一个非负整数数组，把数组里所有数字拼接起来排成一个数，打印能拼接出的所有数字中最小的一个。
**示例**
```js
输入: [3,30,34,5,9]
输出: "3033459"
```
**[题解](https://leetcode-cn.com/submissions/detail/81094761/)**
## 24、合并区间[56题](https://leetcode-cn.com/problems/merge-intervals/)
给出一个区间的集合，请合并所有重叠的区间。
**示例**
```js
输入: [[1,3],[2,6],[8,10],[15,18]]
输出: [[1,6],[8,10],[15,18]]
解释: 区间 [1,3] 和 [2,6] 重叠, 将它们合并为 [1,6].
```
**[题解](https://leetcode-cn.com/submissions/detail/85100479/)**
## 25、颜色分类[75题](https://leetcode-cn.com/problems/sort-colors/)
给定一个包含红色、白色和蓝色，一共 n 个元素的数组，原地对它们进行排序，使得相同颜色的元素相邻，并按照红色、白色、蓝色顺序排列。
此题中，我们使用整数 0、 1 和 2 分别表示红色、白色和蓝色。
**示例**
```js
输入: [2,0,2,1,1,0]
输出: [0,0,1,1,2,2]
```
**[题解](https://leetcode-cn.com/submissions/detail/80178401/)**
## 26、两个数组的交集[349题](https://leetcode-cn.com/problems/intersection-of-two-arrays/)
**[题解](https://leetcode-cn.com/submissions/detail/75875179/)**
## 27、距离顺序排列矩阵单元格[1030题](https://leetcode-cn.com/problems/matrix-cells-in-distance-order/)
给出 R 行 C 列的矩阵，其中的单元格的整数坐标为 (r, c)，满足 0 <= r < R 且 0 <= c < C。

另外，我们在该矩阵中给出了一个坐标为 (r0, c0) 的单元格。

返回矩阵中的所有单元格的坐标，并按到 (r0, c0) 的距离从最小到最大的顺序排，其中，两单元格(r1, c1) 和 (r2, c2) 之间的距离是曼哈顿距离，|r1 - r2| + |c1 - c2|。（你可以按任何满足此条件的顺序返回答案。）
**示例**
```js
输入：R = 1, C = 2, r0 = 0, c0 = 0
输出：[[0,0],[0,1]]
解释：从 (r0, c0) 到其他单元格的距离为：[0,1]
```
**[题解](https://leetcode-cn.com/submissions/detail/75993778/)**
## 28、有效的字母异位词[242题](https://leetcode-cn.com/problems/valid-anagram/)
给定两个字符串 s 和 t ，编写一个函数来判断 t 是否是 s 的字母异位词。
**示例**
```js
输入: s = "anagram", t = "nagaram"
输出: true
```
**[题解](https://leetcode-cn.com/submissions/detail/75978734/)**
## 29、部分排序[16题](https://leetcode-cn.com/problems/sub-sort-lcci/)
给定一个整数数组，编写一个函数，找出索引m和n，只要将索引区间[m,n]的元素排好序，整个数组就是有序的。注意：n-m尽量最小，也就是说，找出符合条件的最短序列。函数返回值为[m,n]，若不存在这样的m和n（例如整个数组是有序的），请返回[-1,-1]。
**示例**
```js
输入： [1,2,4,7,10,11,7,12,6,7,16,18,19]
输出： [3,9]
```
**[题解](https://leetcode-cn.com/submissions/detail/84191621/)**
## 30、最接近原点的 K 个点[973题](https://leetcode-cn.com/problems/k-closest-points-to-origin/)
我们有一个由平面上的点组成的列表 points。需要从中找出 K 个距离原点 (0, 0) 最近的点。

（这里，平面上两点之间的距离是欧几里德距离。）

你可以按任何顺序返回答案。除了点坐标的顺序之外，答案确保是唯一的。
**示例**
```js
输入：points = [[1,3],[-2,2]], K = 1
输出：[[-2,2]]
解释： 
(1, 3) 和原点之间的距离为 sqrt(10)，
(-2, 2) 和原点之间的距离为 sqrt(8)，
由于 sqrt(8) < sqrt(10)，(-2, 2) 离原点更近。
我们只需要距离原点最近的 K = 1 个点，所以答案就是 [[-2,2]]。
```
**[题解](https://leetcode-cn.com/submissions/detail/84184475/)**

## 31、最小k个数 [14题](https://leetcode-cn.com/problems/smallest-k-lcci/)
设计一个算法，找出数组中最小的k个数。以任意顺序返回这k个数均可。
**[题解](https://leetcode-cn.com/submissions/detail/84181996/)**

## 32、两个数组的交集 II[350题](https://leetcode-cn.com/problems/intersection-of-two-arrays-ii/)
给定两个数组，编写一个函数来计算它们的交集。
**[题解](https://leetcode-cn.com/submissions/detail/70625880/)**
