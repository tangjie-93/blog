---
title: leetcode之树专题
date: '2020-10-27'
type: 技术
tags: 算法
note: leetcode之树专题
---
## 1、树的定义
&#8195;&#8195;结点拥有的子树称为结点的度，度为 `0` 的结点称为叶结点，度不为 `0`的称为分支节点。树的度是树内各节点的度的最大值。树中结点的最大层次称为树的深度或高度。

**1.1、二叉树**
+ 每个结点最多有两棵子树。
+ 左子树和右子树是有顺序的。
+ 即使树中某节点只有一颗子树，也要区分是左子树还是右子树。


**1.2、特殊二叉树**
+ 斜树

&#8195;&#8195;所有的结点都只有左子树的二叉树叫左斜树，所有的结点都只有右子树的二叉树叫右斜树。
+ 满二叉树

&#8195;&#8195;所有分支结点都存在左子树和右子树，并且所有叶子都在同一层上，这样的二叉树称为满二叉树。

&#8195;&#8195;**特点：1、叶子只能出现在最下一层；2、非叶子结点的度一定是2；3、在同样深度的二叉树中，满二叉树的结点个数最多，叶子数最多。**

+ 完全二叉树

&#8195;&#8195;对一棵具有n个结点的二叉树按层序编号，如果编号为`i(i≤i≤n)`的结点与同样深度的满二叉树中编号为`i`的结点在二叉树中位置完全相同。判断是否是完全二叉树的最简单方法就是按满二叉树的结构给结点编号，看是否连续，连续则是完全二叉树，否则不是。

&#8195;&#8195;**特点： 1、叶子结点只能出现在最下两层；2、最下层的叶子一定集中在左部连续位置；3、如果结点度为1，则该结点只有左孩子，即不存在只有右子树的情况。4、同样结点的二叉树，完全二叉树的深度最小。5、给定的某个节点下标`i`,可以很容易的计算出此结点的父结点和孩子结点的下标。**
```js
Parent(i)=Math.floor(i/2);//父结点的下标
Left(i)=2i;//左子结点的下标
Right(i)=2i+1;//右子结点的下标
```

**1.3、二叉树的性质**
+ 在二叉树的第i层上至多有`2^i-1`个结点。
+ 深度为k的二叉树至多有 `2^k-1` 个结点（`k≥1`）。
+ 对任何一棵二叉树，如果其终端节点树为 `n0`,度为2的结点数为 `n2`，则 `n0=n2+1`。
```js
//数的结点总数 n0为终端节点个数，n1位度为1的结点个数，n2位度为2额结点个数，
n=n0+n1+n2
n-1=n1+2n2
n0=n2+1
```
+ 具有n个结点的完全二叉树的深度为`|log2n|+1`。
+ 如果对一棵有n个结点的完全二叉树的结点按层序编号对任一节点i有：
    + 如果`i=1`，则结点是二叉树的根，无双亲；如果`i>1`,则其双亲是节点`|i/2|`。  
    + 如果 `2i>n` ,则结点 i 无左孩子（结点i是叶子结点）；否则其左孩子是叶子结点。
    + 如果 `2i+1>n`,则结点i无右孩子；否则其右孩子是结点 `2i+1`。

**1.4、遍历二叉树**

<img src="../../images/二叉树遍历.jpg" height="300px" >

> 1、前序遍历

&#8195;&#8195;先访问根节点，然后前序遍历左子树，再前序遍历右子树。简称为**根左右**。 遍历顺序为`ABDGHCEIF`。


> 2、中序遍历

&#8195;&#8195;中序遍历根节点的左子树，然后访问根节点，最后中序遍历右子树。简称**左内右**。遍历顺序为`GDHBAEICF`

> 3、后序遍历

&#8195;&#8195;从左到右先叶子后节点的方式遍历访问左右子树，**最后是根节点**。简称**左右内**。遍历顺序为`GHDBIEFCA`

> 4、层序遍历
&#8195;&#8195;从树的第一层，从根节点开始访问，从上而下逐层遍历，在同一层中，按从左到右的顺序对结点逐个访问。遍历顺序为`ABCDEFGHI`。

**1.5 树、森林、和二叉树的转换**

> 1、树转换为二叉树
+ 加线。在**所有兄弟结点之间加一条连线**。
+ 去线。对树中每个结点，只保留它与第一个孩子结点的连线，删除它与其他孩子结点之间的连线。
+ 层次调整。以树的根节点为轴心，将整棵树顺时针旋转一定的角度，使之结构层次分明。第一个孩子是二叉树结点的左孩子，兄弟转换过来的孩子是结点的右孩子。

> 2、森林转换为二叉树

&#8195;&#8195;森林是由若干棵树组成。
+ 把每个树转换为二叉树。
+ 第一棵树不动，从第二棵树开始，依次把后一棵二叉树的根结点作为前一棵二叉树的根结点的右孩子，用线连起来。当所有的二叉树连接起来后就得到了由森林转换而来的二叉树。

> 3、二叉树转换为树
+ 加线。若某节点的左孩子结点存在，**则将这个孩子的右孩子结点、右孩子的右孩子结点，反正就是左孩子的n个右孩子都作为此结点的孩子。。将该结点与这些右孩子用线连接起来。**
+ 去线。删除原二叉树中所有结点与其右孩子结点的连线。
+ 层次调整。
> 4、二叉树转换为森林
+ 从根节点开始，若右孩子存在，则把右孩子结点的连线删除，再查看分离后的二叉树，若右孩子存在，则连线删除。。。，直到所有右孩子都删除为止，得到分离的二叉树。
+ 再将每棵分离后的二叉树转换为树即可。

**1.7、赫夫曼树及其应用**

&#8195;&#8195;从树中一个结点到另一个结点之间的分支构成两个结点之间的路径，路径上的分支数目称作**路径长度**。**树的路径长度**就是从根结点到每一结点的路径长度总和。树的带权路径长度为树中所有子结点的带权路径长度之和。**带权路径长度WPL最小的二叉树称作赫夫曼树。**

规定赫夫曼树的左分支代表`0`，右分支代表`1`，则从根结点到叶子结点所经过的路径分支组成的`0`和`1`的序列便为该结点对应字符的编码，这就是**赫夫曼编码**。

**下面是javascript创建树的方法**
```js
//树构造函数
function TreeNode (val) {
    this.val = val;
    this.left = this.right = null;
}
//构造树的函数
function createTree (arr) {
    let level = 0;
    const root = new TreeNode(arr.shift());
    let tempNode = root;
    let res = [];
    while (arr.length) {
        if (tempNode.val) {
            tempNode.left = new TreeNode(arr.shift());
            res.push(tempNode.left);
            tempNode.right = new TreeNode(arr.shift());
            res.push(tempNode.right);
        }
        tempNode = res.shift();

    }
    return root;
}
//[5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1]是层序遍历的结果
createTree([5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1])
```
## 2`leetcode`树相关算法题总结。
#### 1、输的层序遍历1——[从上到下打印二叉树 II](https://leetcode-cn.com/problems/cong-shang-dao-xia-da-yin-er-cha-shu-ii-lcof/)
从上到下打印出二叉树的每个节点，同一层的节点按照从左到右的顺序打印。
**解题思路:**利用栈来存储结点。每次遍历时，将当前结点的左右结点入栈，循环时依次出栈。
```js
/**
 * @param {TreeNode} root
 * @return {number[]}
 */
//层序遍历 利用栈来存储节点
function levelOrder(root){
    if(!node) return [];
    const res=[],nodeQueue=[root];
    let curNode=null;
    while(nodeQueue.length){
        curNode=nodeQueue.pop();
        res.push(curNode.val);
        curNode.left&&nodeQueue.push(curNode.left);
        curNode.right&&nodeQUeue.push(curNode.right)
    }
    return res;
}
```

#### 2、树的层序遍历2——[II. 从上到下打印二叉树 II](https://leetcode-cn.com/problems/cong-shang-dao-xia-da-yin-er-cha-shu-ii-lcof/)
从上到下按层打印二叉树，同一层的节点按从左到右的顺序打印，每一层打印到一行。
```js
/**
 * @param {TreeNode} root
 * @return {number[][]}
 */
//层序遍历
function levelOrder(root){
    if(!root) return [];
    const res=[],nodeQueue=[root];
    let level=0,curNode=null,levelNodeNum;
    //表示有多少层
    while(nodeQueue.length){
        res[level]=[];
        levelNodeNum=nodeQueue.length;//第level层的节点个数
        while(levelNodeNum--){
            curNode=nodeQueue.pop();
            res[level].push(curNode.val);
            curNode.left&&nodeQueue.unshift(curNode.left);
            curNode.right&&nodeQueue.unshift(curNode.right);
        }
        level++;
    }
    return res;
}
```
#### 3、前序遍历[二叉树的深度](https://leetcode-cn.com/problems/er-cha-shu-de-shen-du-lcof/submissions/)
输入一棵二叉树的根节点，求该树的深度。从根节点到叶节点依次经过的节点（含根、叶节点）形成树的一条路径，最长路径的长度为树的深度。
**解题思路：** 递归比较左右支树的深度，每次递归时深度加1.
```js
/**
 * @param {TreeNode} root
 * @return {number}
 */
var maxDepth = function(root) {
    if(!root) return 0;
    //获当前左右子树的深度的较大值 并且+1
    return Math.max(maxDepth(root.left),maxDepth(root.right))+1;
};
```
#### 4、前序遍历[ 二叉树的镜像](https://leetcode-cn.com/problems/er-cha-shu-de-jing-xiang-lcof/)
请完成一个函数，输入一个二叉树，该函数输出它的镜像。
**解题思路：** 递归遍历整棵树,在递归时交换左右结点的位置。本质上是前序遍历。
```js
/**
 * @param {TreeNode} root
 * @return {TreeNode}
 */
function mirrorTree(root){
    function levelOrder(node){
        if(!node) return;
        //前序遍历 跟左右
        //交换左右节点的位置
        const tempNode=node.left;
        node.left=node.right;
        node.right=tempNode;
        //递归左右节点
        levelOrder(node.left);
        levelOrder(node.right);
    }
    levelOrder(root);
    return root;
}
```

#### 5、前序遍历[求根到叶子节点数字之和](https://leetcode-cn.com/problems/sum-root-to-leaf-numbers/)
给定一个二叉树，它的每个结点都存放一个 0-9 的数字，每条从根到叶子节点的路径都代表一个数字。
例如，从根到叶子节点路径 1->2->3 代表数字 123。
计算从根到叶子节点生成的所有数字之和。
**说明:** 叶子节点是指没有子节点的节点。
```js
/*
 * @param {TreeNode} root
 * @return {number}
 */
function sumNumbers(root){
    const dfs=(node,sum)=>{
        //表示该叶子节点不存在,则返回0
        if(!node) return 0;
        //树深度每加深一层，sum乘以10再加上当前节点的值
        sum=sum*10+node.val;
        if(!node.left&&!node.right){
            //没有叶子节点了
            return sum;
        }else{
            return dfs(node.left,sum)+dfs(node.right,sum)
        }
    }
    return dfs(root,0);
}
```
#### 6、前序遍历[对称的二叉树](https://leetcode-cn.com/problems/dui-cheng-de-er-cha-shu-lcof/)
请实现一个函数，用来判断一棵二叉树是不是对称的。如果一棵二叉树和它的镜像一样，那么它是对称的。
例如，二叉树 [1,2,2,3,4,4,3] 是对称的。
    1
   / \
  2   2
 / \ / \
3  4 4  3
```js
function symmetricTree(root){
    return root===null?true:dfs(root,left,root.right);
    function dfs(l,r){
        //没有左右节点的情况
        if(l===null&&r===null) return true
        /*
         * 情况1 l=null,r!=null 
         * 情况2 l!=null,r===null
         * 情况3 l!=null,r!=null l.val!=r.val
         */
        if(l===null||r===null||l.val!==r.val) return false;
        //递归左右子节点
        return dfs(l.left,r.right)&&dfs(l.right,r.left);
    }
}
```
#### 7、前序遍历[平衡二叉树](https://leetcode-cn.com/problems/ping-heng-er-cha-shu-lcof/)
输入一棵二叉树的根节点，判断该树是不是平衡二叉树。如果某二叉树中任意节点的左右子树的深度相差不超过1，那么它就是一棵平衡二叉树。
**示例 1:**
给定二叉树 [3,9,20,null,null,15,7]
    3
   / \
  9  20
    /  \
   15   7
返回 true 。
**示例 2:**
给定二叉树 [1,2,2,3,3,null,null,4,4]

       1
      / \
     2   2
    / \
   3   3
  / \
 4   4
返回 false 。
```js
function isBalanced(root){
    return recur(root)!==-1;
    //深度递归
    function recur(root){
        if(!root) return 0;
        //左子树的深度
        const left=recur(root.left);
        if(left===-1) return -1;
        //右子树的深度
        const right=recur(root.right);
        if(right===-1) return -1;
        //当节点root 左 / 右子树的深度差 \leq 1≤1 ：则返回当前子树的深度，
        return Math.abs(left-right)<2?Math.max(left,right)+1:-1;
    }
}
```
#### 8、[二叉搜索树的最近公共祖先](https://leetcode-cn.com/problems/er-cha-sou-suo-shu-de-zui-jin-gong-gong-zu-xian-lcof/)
**二叉搜索树具有以下性质**:若它的左子树不为空，则左树上所有结点的值均小于它的根节点的值;若它右子树不为空，则右子树上所有结点的值均大于它的根节点的值；它的左、右子树也分别为二叉搜索树。
给定一个二叉搜索树, 找到该树中两个指定节点的最近公共祖先。

百度百科中最近公共祖先的定义为：“对于有根树 T 的两个结点 p、q，最近公共祖先表示为一个结点 x，满足 x 是 p、q 的祖先且 x 的深度尽可能大（一个节点也可以是它自己的祖先）。”

例如，给定如下二叉搜索树:  root = [6,2,8,0,4,7,9,null,null,3,5]
<img src="../../images/binarysearchtree_improved.png">
示例 1:

输入: root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 8
输出: 6 
解释: 节点 2 和节点 8 的最近公共祖先是 6。
示例 2:

输入: root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 4
输出: 2
解释: 节点 2 和节点 4 的最近公共祖先是 2, 因为根据定义最近公共祖先节点可以为节点本身。

```js
function lowestCommonAncestor(root, p,q) {
    if(!root) return root;
    if(p===q) return new TreeNode(p);
    //根据题目条件 要么p,q在同侧，要么再异侧。在同侧则则p或q的值对应的结点是祖先结点，在异侧则根节点是它们的最近公共祖先。
    while(root){
        //根值大于给定值，则它的根植只可能在右边
        if (root.val < q && root.val < p) {
            root = root.right
        }
        //根值大于给定值，则它的根植只可能在左边
        if (root.val > q && root.val > p) {
            root = root.left
        }
        else {
            return root
        }
    }
}
```
#### 9、[路径总和](https://leetcode-cn.com/problems/path-sum/)

给定一个二叉树和一个目标和，判断该树中是否存在根节点到叶子节点的路径，这条路径上所有节点值相加等于目标和。
说明: 叶子节点是指没有子节点的节点。
示例: 
给定如下二叉树，以及目标和 sum = 22，
              5
             / \
            4   8
           /   / \
          11  13  4
         /  \      \
        7    2      1
返回 true, 因为存在目标和为 22 的根节点到叶子节点的路径 5->4->11->2。

```js
//方法 1 广度优先遍历
function hasPathSum(root,sum){
    if(!root) return false;
    const queueNode=[root];//存结点
    const queueVal=[root.val];//存结点和
    let tempNode,tempVal;
    while(queueVal.length){
        tempNode=queueNode.shift();//当前结点
        tempVal=queueVal.shift();//当前结点对应的根节点到当前结点的路径和
        if(!tempNode.left&&!tempNode.right){
            if(tempVal===sum) return true;
        }
        if(tempNode.left){
            queueNode.push(tempNode.left);
            queueVal.push(tempVal+tempNode.left.val);
        }
        if(tempNode.right){
            queueNode.push(tempNode.right);
            queueVal.push(tempVal+ tempNode.right.val);
        }
    }
    return false;
}
//方法 2 深度优先遍历
function hasPathSum(root,sum){
    //表示该结点是空节点 此时sum的值肯定不等于它父节点的值，所以返回false
    if(!root) return false;
    //表示当前结点是叶子结点
    if(!root.left&&!root.right){
        return root.val===sum;
    }
    //先深度递归左子树
    return hasPathSum(root.left,sum-root.val)||hasPathSum(root.right,sum-root.val);
}
```
#### 10、[二叉搜索树的最近公共祖先](https://leetcode-cn.com/problems/lowest-common-ancestor-of-a-binary-search-tree)
给定一个二叉搜索树, 找到该树中两个指定节点的最近公共祖先。
百度百科中最近公共祖先的定义为："对于有根树 T 的两个结点 p、q，最近公共祖先表示为一个结点 x，满足 x 是 p、q 的祖先且 x 的深度尽可能大（一个节点也可以是它自己的祖先）。"
例如，给定如下二叉搜索树:  root = [6,2,8,0,4,7,9,null,null,3,5]
<img src="../../images/binarysearchtree_improved.png" />

```js
示例 1:
输入: root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 8
输出: 6 
解释: 节点 2 和节点 8 的最近公共祖先是 6。
示例 2:
输入: root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 4
输出: 2
解释: 节点 2 和节点 4 的最近公共祖先是 2, 因为根据定义最近公共祖先节点可以为节点本身。
```

```js
/**
 * @param {TreeNode} root
 * @param {TreeNode} p
 * @param {TreeNode} q
 * @return {TreeNode}
 */
//迭代法
function lowestCommonAncestor(root, p, q) {
    let node=root;
    while(true){
        if(node.val>p.val&&node.val>q.val){
            node=node.left;
        }else if(p.val>node.val&&q.val>node.val){
            node=node.right;
        }else{
            break;
        }
    }
    return node;
};
// 递归 
function lowestCommonAncestor(root, p, q) {
    const val=root.val;
    if((p.val-val)*(q.val-val)<=0) return root;
    if(p.val<val){
       return lowestCommonAncestor(root.left,p,q);
    }else{
       return lowestCommonAncestor(root.right,p,q);
    }
};
```
#### 11、中序遍历[ 二叉搜索树的最小绝对差](https://leetcode-cn.com/problems/minimum-absolute-difference-in-bst/)
给你一棵所有节点为非负值的二叉搜索树，请你计算树中任意两节点的差的绝对值的最小值。
```js
var getMinimumDifference = function(root) {
    //因为是二叉搜索树，所以任意两节点的差的最小值。肯定是两个相邻节点差的最小值。
    //中序遍历来遍历二叉搜索树，前一个值总是大于后面一个值
    let prevValue=-1,res=Math.pow(2,31)-1;
    const recursive=(node)=>{
        if(!node) return;
        //中序遍历 左根右
        recursive(node.left);
        if(prevValue!==-1){
            //比较当前值与前一个值根的差与上一个最小差的大小
            res=Math.min(res,node.val-prevValue);
        }
        prevValue=node.val;
        recursive(node.right);
    }
    recursive(root);
    return res;
};
```
#### 12、前序遍历[左叶子之和](https://leetcode-cn.com/problems/sum-of-left-leaves/)
```js
/**
 * @param {TreeNode} root
 * @return {number}
 */
var sumOfLeftLeaves = function(root) {
    let res=0;
    /**
     * @param {TreeNode} node
     * @return {boolean} flag 用于标识是否是左子节点
     */
    const recursive=(node,flag)=>{
        if(!node) return;
        //前序遍历
        //判断是否是左子节点
        if(flag&&!node.left&&!node.right) res+=node.val;
        recursive(node.left,true);
        recursive(node.right);
    }
    recursive(root);
    return res;
};
```
#### 13、前序遍历[单值二叉树](https://leetcode-cn.com/problems/univalued-binary-tree/)
如果二叉树每个节点都具有相同的值，那么该二叉树就是单值二叉树。
只有给定的树是单值二叉树时，才返回 `true`；否则返回 `false`。
```js
/**
 * @param {TreeNode} root
 * @return {boolean}
 */
var isUnivalTree = function(root) {
    let prevValue=-1;
    const recursive=node=>{
        if(!node) return true;
        if(prevValue!==-1){
            //判断当前节点的值根上一个节点的值是否相等
            if(prevValue!==node.val) return false;
        }
        prevValue=node.val;
        //前序遍历(根左右) 先遍历左子树，后遍历右子树
        return recursive(node.left)&& recursive(node.right);
    }
   return recursive(root);
};
```

#### 14、层序遍历(广度优先遍历)[ 二叉树的层平均值](https://leetcode-cn.com/problems/average-of-levels-in-binary-tree/)
```js
/**
 * @param {TreeNode} root
 * @return {number[]}
 */
var averageOfLevels = function(root) {
    if(!root) return []
    const res=[];
    let queueNode=[root];
    let sum,levelNum;
    while(queueNode.length){
        levelNum=queueNode.length;
        sum=0;
        res.push(levelNum);
        while(levelNum--){
            const tempNode=queueNode.shift();
            sum+=tempNode.val;
            tempNode.left&&queueNode.push(tempNode.left);
            tempNode.right&&queueNode.push(tempNode.right);
        }
        res.push(sum/res.pop());
    }
    return res;
};
```
#### 15、层序遍历(广度优先遍历)[N叉树的最大深度](https://leetcode-cn.com/problems/maximum-depth-of-n-ary-tree/)
给定一个 N 叉树，找到其最大深度。
最大深度是指从根节点到最远叶子节点的最长路径上的节点总数。
例如，给定一个 3叉树 :
<img src="../../images/narytreeexample.png" />
我们应返回其最大深度，3。

```js
var maxDepth = function(root) {
    if(!root) return 0;
    const recursive=(node,depth)=>{
        if(!node) return depth;
        if(node.children&&node.children.length){          
            return  Math.max(...node.children.map(children=>{
                return recursive(children,depth+1);
            }))
        }
        return depth+1;
       
    }
    return recursive(root,0);
};
```
#### 16、前序遍历(深度优先遍历)[ 二叉树的直径](给定一棵二叉树，你需要计算它的直径长度。一棵二叉树的直径长度是任意两个结点路径长度中的最大值。这条路径可能穿过也可能不穿过根结点。)
示例 :
给定二叉树
          1
         / \
        2   3
       / \     
      4   5    
返回 3, 它的长度是路径 [4,2,1,3] 或者 [5,2,1,3]。
**注意：两结点之间的路径长度是以它们之间边的数目表示。**
```js
/**
 * @param {TreeNode} root
 * @return {number}
 */
//这道题其实是一道求树中最长路径的问题
//而任意一条路径均可以被看作由某个节点为起点，从其左儿子和右儿子向下遍历的路径拼接得到。
var diameterOfBinaryTree = function(root) {
    let res=0;
    const recursive=node=>{
        //该结点不存在,返回0
        if(!node) return 0;
        const Ldepth=recursive(node.left);
        const Rdepth=recursive(node.right);
        //获取路径最大值
        res=Math.max(res,Ldepth+Rdepth);
        //每递归一次，深度+1;
        return Math.max(Ldepth,Rdepth)+1;
    }
    recursive(root);
    return res;
};
```
#### 17、前序遍历[二叉树中第二小的节点](https://leetcode-cn.com/problems/second-minimum-node-in-a-binary-tree/)
给定一个非空特殊的二叉树，每个节点都是正数，并且每个节点的子节点数量只能为 2 或 0。如果一个节点有两个子节点的话，那么该节点的值等于两个子节点中较小的一个。
更正式地说，`root.val = min(root.left.val, root.right.val)` 总成立。
给出这样的一个二叉树，你需要输出所有节点中的第二小的值。如果第二小的值不存在的话，输出 -1 。
示例 1：

<img src="../../images/smbt1.jpg" />
输入：root = [2,2,5,null,null,5,7]
输出：5
解释：最小的值是 2 ，第二小的值是 5 。

```js
/**
 * @param {TreeNode} root
 * @return {number}
 */
//暴力法
var findSecondMinimumValue = function(root) {
    const res=new Set();
    const recursive=node=>{
        if(!node) return;
        res.add(node.val);
        recursive(node.left);
        recursive(node.right);
    }
    recursive(root);
    return [...res].sort((a,b)=>a-b)[1]||-1;
};
//方法 2 找规律
var findSecondMinimumValue = function(root) {
    if(!root) return -1;
    const recursive=(node,min)=>{
        if(!node) return -1;
        //根左右 判断当前结点跟最小值的关系
        if(node.val>min) return node.val;
        //遍历左子树 判断左子节点跟最小值的关系
        const left=recursive(node.left,min);
        //遍历右子树 判断左子节点跟最小值的关系
        const right=recursive(node.right,min);
        //没有左子树
        if(left===-1) return right;
        //没有右子树
        if(right===-1) return left;
        return Math.min(left,right);
    }
    return recursive(root,root.val);
};
```
#### 18 、前序遍历[ 二叉树的堂兄弟节点](https://leetcode-cn.com/problems/cousins-in-binary-tree/)
在二叉树中，根节点位于深度 0 处，每个深度为` k `的节点的子节点位于深度` k+1 `处。如果二叉树的两个节点深度相同，但父节点不同，则它们是一对堂兄弟节点。我们给出了具有唯一值的二叉树的根节点 `root`，以及树中两个不同节点的值 `x` 和` y`。只有与值 `x` 和 `y `对应的节点是堂兄弟节点时，才返回 `true`。否则，返回 `false`。
示例 2：
<img src="../../images/cousins.png" />

输入：root = [1,2,3,null,4,null,5], x = 5, y = 4
输出：true
```js
var isCousins = function(root, x, y) {
    /**
     * 1、他们父节点不同
     * 2、他们的深度一样
    */
    //两个对象来存储当前结点的深度和父节点
    const depthObj=Object.create(null),parentObj=Object.create(null);
    const recursive=(node,parent)=>{
        if(!node) return;
        depthObj[node.val]=parent?depthObj[parent.val]+1:0;
        parentObj[node.val]=parent;
        recursive(node.left,node);
        recursive(node.right,node);
    }
    recursive(root,null);
    return depthObj[x]===depthObj[y]&&(parentObj[x]!==parentObj[y]);
};
```
#### 19、前序遍历(dfs)[求和路径](https://leetcode-cn.com/problems/paths-with-sum-lcci/)
&#8195;&#8195;给定一棵二叉树，其中每个节点都含有一个整数数值(该值或正或负)。设计一个算法，打印节点数值总和等于某个给定值的所有路径的数量。注意，路径不一定非得从二叉树的根节点或叶节点开始或结束，但是其方向必须向下(只能从父节点指向子节点方向)。
示例:
给定如下二叉树，以及目标和 sum = 22，

              5
             / \
            4   8
           /   / \
          11  13  4
         /  \    / \
        7    2  5   1
返回:3
解释：和为 22 的路径有：[5,4,11,2], [5,8,4,5], [4,11,7]
```js
const pathSum=function(root,sum){
    if(!root) return 0;
    const resolve=(node,target)=>{
        if(!node) return 0;
        let res=0;
        if(node.val===target) return res++;
        res+=resolve(node.left,target-node.val);
        res+=resolve(node.right,target-node.val);
        return res;
    }
    const dfs=(node,target)=>{
        let res=0;
        if(!node) return 0;
        //深度递归当前结点
        res+=resolve(node,target);
        //深度递归左结点
        res+=dfs(node.left,target);
        //深度递归右结点
        res+=dfs(node.right,target);
        return res;
    }
    return dfs(root,sum);
}
```
#### 20、[修剪二叉搜索树](https://leetcode-cn.com/problems/trim-a-binary-search-tree/)
&#8195;&#8195;给你二叉搜索树的根节点 `root` ，同时给定最小边界`low `和最大边界 `high`。通过修剪二叉搜索树，使得所有节点的值在`[low, high]`中。修剪树不应该改变保留在树中的元素的相对结构（即，如果没有被移除，原有的父代子代关系都应当保留）。 可以证明，存在唯一的答案。所以结果应当返回修剪好的二叉搜索树的新的根节点。注意，根节点可能会根据给定的边界发生改变。
<img src="../../images/trim2.jpg" />
示例 2：
输入：root = [3,0,4,null,2,null,null,1], low = 1, high = 3
输出：[3,2,null,1]

```js
/**
 * @param {TreeNode} root
 * @param {number} low
 * @param {number} high
 * @return {TreeNode}
 */
var trimBST = function(root, low, high) {
    //返回当前结点
    if(!root) return root;
    //当前结点的值大于最大值，那么它右子树上的所有值都会大于当前值，就不用再考虑
    if(root.val>high) return trimBST(root.left,low,high);
    // //当前结点的值小于最小值，那么它左子树上的所有值都会大于当前值，就不用再考虑
    if(root.val<low) return trimBST(root.right,low,high);
    //递归当前结点的左子树之后的结果赋值给当前结点的左子树
    root.left=trimBST(root.left,low,high);
     //递归当前结点的左子树之后的结果赋值给当前结点的左子树
    root.right=trimBST(root.right,low,high);
    return root;
};
```