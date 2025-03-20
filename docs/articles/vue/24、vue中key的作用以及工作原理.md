---
title: 25.vue中key的作用以及工作原理
date: '2020-06-20'
type: 技术
tags: vue
note: vue中key的作用以及工作原理
---

工作原理可以在源码中找到。源码地址为[src\core\vdom\patch.js](https://github.com/vuejs/vue/blob/dev/src/core/vdom/patch.js) 中的 `updateChildren()` 方法和 `sameNode()`方法。
```js
//updateChildren源码如下
function updateChildren (parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
    let oldStartIdx = 0
    let newStartIdx = 0
    let oldEndIdx = oldCh.length - 1
    //老的开始节点
    let oldStartVnode = oldCh[0]
    //老的结束节点
    let oldEndVnode = oldCh[oldEndIdx]
    //新的结束节点额索引值
    let newEndIdx = newCh.length - 1
    //新的开始节点
    let newStartVnode = newCh[0]
    //新的结束索引节点
    let newEndVnode = newCh[newEndIdx]
    let oldKeyToIdx, idxInOld, vnodeToMove, refElm
    const canMove = !removeOnly
    if (process.env.NODE_ENV !== 'production') {
      //检查重复节点
      checkDuplicateKeys(newCh)
    }
    //循环条件
    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (isUndef(oldStartVnode)) {
        oldStartVnode = oldCh[++oldStartIdx] // Vnode has been moved left
      } else if (isUndef(oldEndVnode)) {
        oldEndVnode = oldCh[--oldEndIdx]
        //1、判断新老虚拟dom开始节点是否一样
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
        oldStartVnode = oldCh[++oldStartIdx]
        newStartVnode = newCh[++newStartIdx]
        //2、判断新老虚拟dom结束节点是否一样
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx)
        oldEndVnode = oldCh[--oldEndIdx]
        newEndVnode = newCh[--newEndIdx]
        //3、判断old开始节点和new结束节点是否一样
      } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx)
        canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm))
        oldStartVnode = oldCh[++oldStartIdx]
        newEndVnode = newCh[--newEndIdx]
        //4、判断老的虚拟dom结束节点和新的虚拟dom开始节点是否一样
      } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
        canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm)
        oldEndVnode = oldCh[--oldEndIdx]
        newStartVnode = newCh[++newStartIdx]
      } else {
        if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
        idxInOld = isDef(newStartVnode.key)
          ? oldKeyToIdx[newStartVnode.key]
          : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx)
        if (isUndef(idxInOld)) { // New element
          createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
        } else {
          vnodeToMove = oldCh[idxInOld]
          if (sameVnode(vnodeToMove, newStartVnode)) {
            patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
            oldCh[idxInOld] = undefined
            canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm)
          } else {
            // same key but different element. treat as new element
            createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
          }
        }
        newStartVnode = newCh[++newStartIdx]
      }
    }
    //判断老虚拟dom的开始节点是否大于新的虚拟dom结束节点
    if (oldStartIdx > oldEndIdx) {
      refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm
      addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue)
    } else if (newStartIdx > newEndIdx) {
      removeVnodes(oldCh, oldStartIdx, oldEndIdx)
    }
}
//sameNode
function sameVnode (a, b) {
  return (
    //没有定义key时，key为undefined，不同的节点也会认为是同一个节点，所以也会执行patch操作。
    a.key === b.key && (
      (
        a.tag === b.tag &&
        a.isComment === b.isComment &&
        isDef(a.data) === isDef(b.data) &&
        sameInputType(a, b)
      ) || (
        isTrue(a.isAsyncPlaceholder) &&
        a.asyncFactory === b.asyncFactory &&
        isUndef(b.asyncFactory.error)
      )
    )
  )
}
```
```html
<div id="demo"> 
    <p v-for="item in items">{{item}}</p>     
</div> 
<script src="../../dist/vue.js"></script> 
<script> 
    // 创建实例 
    const app = new Vue({ 
        el: '#demo', 
        data: { items: ['a', 'b', 'c', 'd', 'e'] }, 
        mounted () { 
            setTimeout(() => { 
                this.items.splice(2, 0, 'f') 
            }, 2000); 
        }, 
    }); 
</script> 
``` 
### 1、没有key的情况
`'a', 'b', 'c', 'd', 'e'` 变成 `'a', 'b', 'f','c', 'd', 'e'` ,会经历`'f','c', 'd'`替换`'c', 'd', 'e'` 的操作。然后将 `e` 创建添加到最后面。总共经历了`5`次 `patchNode`操作，一次 `addNode` 操作。**因为没有`key`，** 所以在 `sameNode()` 方法中比较 两个节点的`key`时，会把不同节点认为是同一个节点(因为 `key` 为 `undefined` )。因而对不同节点进行 `patch` 操作。
### 2、有key的情况
`'a', 'b', 'c', 'd', 'e'` 变成 `'a', 'b', 'f','c', 'd', 'e'` ,也会经历`5`次 `patch`操作，但是在`patch` 操作中什么都没干，只会经历 `f` 插入到 `c` 之前的操作。因为`key` 相同，则这两个节点一定是同一个节点。


结论：
&#8195;&#8195;`key` 是 `Vue` 中 `vnode` 的唯一标记，通过这个 `key`，我们的 `diff` 操作可以更准确、更快速。
+ 1、更准确：因为带 `key` 就不是原地复用（**如果数据项的顺序被改变，Vue 将不会移动 DOM 元素来匹配数据项的顺序， 而是简单复用此处每个元素(),会导致之前节点的状态被保留下来从而产生一些问题**）了，在比较是否是同一个节点的 `sameNode` 函数 `a.key === b.key` 对比中可以避免就地复用的情况，所以会更加准确。同时避免频繁更新不同元素，从而使得整个 `patch` 过程更加高效，减少 `DOM` 操作量，提高性能。
+ 2、更快速：利用 `key` 的唯一性生成 `map` 对象来获取对应节点，比遍历方式更快。

注意事项:
+ 1、如果不设置 `key` 的话在列表更新时可能会引发一些隐藏的 `bug`。
+ 2、`vue` 中使用相同签名元素的过渡切换时，也会使用到 `key` 属性，其目的也是为了让 `vue` 可以区分。
+ 3、在渲染时不要用数组的索引去设置 `key` 的值，不然在对数组做删除操作时，会对索引之后的数组元素做 `patch` 操作。应该使用其他唯一值去设置 `key`。  