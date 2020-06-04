---
title: leetCode之广度优先搜索题目总结
date: '2020-05-01'
type: 技术
tags: 算法
note: leetCode之广度优先搜索题目总结
---
## 题目1 [被围绕的区域_leetCode 130](https://leetcode-cn.com/problems/surrounded-regions/)
>给定一个二维的矩阵，包含 'X' 和 'O'（字母 O）。
找到所有被 'X' 围绕的区域，并将这些区域里所有的 'O' 用 'X' 填充。
```js
/**
 * @param {character[][]} board
 * @return {void} Do not return anything, modify board in-place instead.
 */
function solve (board) {
    const m=board.length;
    if(m===0) return;
    const n=board[0].length;
    let queue = [];
    let bfs = () => {
        while(queue.length > 0){
            let [I,J] = queue.shift();
            board[I][J] = '#';//表示将不会被修改为 X 的位置
            //判断上一行的同位置是否为O
            I - 1 >= 0 && board[I-1][J] == 'O'&&queue.push([I-1,J]);
            //判断下一行的同位置是否为O
            I + 1 < m && board[I+1][J] == 'O'&&queue.push([I+1,J]);
            //判断上一列的同位置是否为O
            J - 1 >= 0 && board[I][J-1] == 'O'&&queue.push([I,J-1]);
            //判断下一列的同位置是否为O
            J + 1 < n && board[I][J+1] == 'O'&&queue.push([I,J+1]);
        }
    }
    //将所有边界为 'O'的存起来
    for(let i = 0;i < m;i++){
        for(let j = 0;j < n;j++){
            if((i == 0 || j == 0 || i == m-1 || j == n-1) && board[i][j] == 'O'){
                queue.push([i,j]);
            }
        }
    }
    bfs();
    //替换
    for(let i = 0;i < m;i++){
        for(let j = 0;j < n;j++){
            board[i][j] == 'O'&&(board[i][j] = 'X')
            board[i][j] == '#'&&(board[i][j] = 'O')
        }
    }
};
```