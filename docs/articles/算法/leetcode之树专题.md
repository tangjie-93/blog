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

## 2`leetcode`树相关算法题总结。
#### 1、输的层序遍历——面试题32 - [II. 从上到下打印二叉树 II](https://leetcode-cn.com/problems/cong-shang-dao-xia-da-yin-er-cha-shu-ii-lcof/)
从上到下打印出二叉树的每个节点，同一层的节点按照从左到右的顺序打印。
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

#### 2、树的层序遍历——剑指 Offer 32 - [II. 从上到下打印二叉树 II](https://leetcode-cn.com/problems/cong-shang-dao-xia-da-yin-er-cha-shu-ii-lcof/)
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
#### 3、[二叉树的深度](https://leetcode-cn.com/problems/er-cha-shu-de-shen-du-lcof/submissions/)
输入一棵二叉树的根节点，求该树的深度。从根节点到叶节点依次经过的节点（含根、叶节点）形成树的一条路径，最长路径的长度为树的深度。
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
#### 4、剑指 Offer [27. 二叉树的镜像](https://leetcode-cn.com/problems/er-cha-shu-de-jing-xiang-lcof/)
请完成一个函数，输入一个二叉树，该函数输出它的镜像。
```js
/**
 * @param {TreeNode} root
 * @return {TreeNode}
 */
function mirrorTree(root){
    function levelOrder(node){
        if(!node) return;
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

#### 5、129. [求根到叶子节点数字之和](https://leetcode-cn.com/problems/sum-root-to-leaf-numbers/)
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
#### 6、剑指 Offer 28. [对称的二叉树](https://leetcode-cn.com/problems/dui-cheng-de-er-cha-shu-lcof/)
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
#### 7、[平衡二叉树](https://leetcode-cn.com/problems/ping-heng-er-cha-shu-lcof/)
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
