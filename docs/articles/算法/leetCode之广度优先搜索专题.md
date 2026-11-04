---
title: 网格搜索：连通块与被围绕的区域
date: '2020-05-01'
type: 技术
tags: 算法
note: 网格搜索：连通块与被围绕的区域
---

## 1. 把格子视为图节点

网格中每个格子是一个顶点，上下左右是候选邻居。本篇不允许斜向连接。输入为矩形字符数组，各行长度相等；空数组和空行可以处理。输入结构由题目保证，先确认函数是否允许修改原网格。

访问标记在入队时写入，不能等出队才标记，否则多个邻居可能把同一格子重复入队。实现使用读取下标避免反复移动队首。

## 2. 岛屿数量：统计陆地连通块

字符 `'1'` 是陆地，`'0'` 是水。从每个未访问陆地发起一次搜索，它能到达的陆地属于同一岛屿。此版本用集合记录访问，保留输入。

```js
function numIslands(grid) {
    if (grid.length === 0 || grid[0].length === 0) return 0;
    const rows = grid.length;
    const cols = grid[0].length;
    const seen = new Set();
    const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    let count = 0;
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const key = row * cols + col;
            if (grid[row][col] !== '1' || seen.has(key)) continue;
            count++;
            seen.add(key);
            const queue = [[row, col]];
            for (let head = 0; head < queue.length; head++) {
                const [r, c] = queue[head];
                for (const [dr, dc] of directions) {
                    const nr = r + dr;
                    const nc = c + dc;
                    const next = nr * cols + nc;
                    if (nr < 0 || nr >= rows || nc < 0 || nc >= cols ||
                        grid[nr][nc] !== '1' || seen.has(next)) continue;
                    seen.add(next);
                    queue.push([nr, nc]);
                }
            }
        }
    }
    return count;
}
```

平均时间为 `O(rows × cols)`，访问集合与队列空间最坏相同量级，按集合平均常数操作分析。对角相邻的陆地仍是两座岛。

## 3. 被围绕的区域：从不能翻转的地方出发

输入只含 `'O'` 和 `'X'`。与边界 `'O'` 四向连通的区域不能翻转；其他 `'O'` 全部替换为 `'X'`。与其从每个内部格子搜索能否逃出，不如一次从所有边界陆地向内扩散。

```js
function solve(board) {
    if (board.length === 0 || board[0].length === 0) return;
    const rows = board.length;
    const cols = board[0].length;
    const queue = [];
    function enqueue(r, c) {
        if (r < 0 || r >= rows || c < 0 || c >= cols || board[r][c] !== 'O') return;
        board[r][c] = '#';
        queue.push([r, c]);
    }
    for (let r = 0; r < rows; r++) {
        enqueue(r, 0);
        enqueue(r, cols - 1);
    }
    for (let c = 0; c < cols; c++) {
        enqueue(0, c);
        enqueue(rows - 1, c);
    }
    for (let head = 0; head < queue.length; head++) {
        const [r, c] = queue[head];
        enqueue(r - 1, c);
        enqueue(r + 1, c);
        enqueue(r, c - 1);
        enqueue(r, c + 1);
    }
    for (const row of board) {
        for (let c = 0; c < cols; c++) {
            if (row[c] === 'O') row[c] = 'X';
            else if (row[c] === '#') row[c] = 'O';
        }
    }
}
```

此函数原地修改输入，返回 `undefined`。临时字符 `'#'` 只用于标记，最后恢复；契约排除输入原本包含该字符。单行、单列所有格子都是边界，不能误翻转。

时间为 `O(rows × cols)`，队列最坏为同等规模；原地修改并不代表辅助空间为常数。

## 4. 图像渲染：给一个连通块换颜色

输入为矩形数值网格及合法起点，新颜色也是有限数值。原地将起点四向连通、颜色相同的格子改色，返回原网格。空网格直接返回；非空网格要求起点有效。

```js
function floodFill(image, startRow, startCol, color) {
    if (image.length === 0 || image[0].length === 0) return image;
    const oldColor = image[startRow][startCol];
    if (oldColor === color) return image;
    const queue = [[startRow, startCol]];
    image[startRow][startCol] = color;
    for (let head = 0; head < queue.length; head++) {
        const [row, col] = queue[head];
        for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const r = row + dr;
            const c = col + dc;
            if (r < 0 || r >= image.length || c < 0 || c >= image[0].length ||
                image[r][c] !== oldColor) continue;
            image[r][c] = color;
            queue.push([r, c]);
        }
    }
    return image;
}
```

改色同时承担访问标记，因此新旧颜色相同时必须直接返回。时间与队列空间均与访问的连通块大小成正比，最坏为 `O(rows × cols)`。

## 5. 手推与验证

先画一块包围区域和一条通往边界的细通道，再按入队顺序标记。覆盖空网格、全水、全陆地、对角连接、单行列和内部孤岛。尝试图像渲染变式时特别处理新旧颜色相同的情况，避免失去访问标记效果。

```sh
node --test tests/algorithm-tree-graph-examples.test.mjs
```

返回[图专题](./数据结构之图.md)比较一般邻接表与网格邻居的生成方式；两者核心访问规则相同。
