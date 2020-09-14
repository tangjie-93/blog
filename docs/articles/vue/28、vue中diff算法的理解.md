---
title: vue中diff算法的理解
date: '2020-06-21'
type: 技术
tags: vue
note: vue中diff算法的理解
---
`diff` 算法主要与以下的几个函数有关。
+ [patchVnode](https://github.com/vuejs/vue/blob/dev/src/core/vdom/patch.js)
```js
//正真的替换节点操作
  function patchVnode (
    oldVnode,
    vnode,
    insertedVnodeQueue,
    ownerArray,
    index,
    removeOnly
  ) {
    if (oldVnode === vnode) {
      return
    }
    ...
    //下面是新老虚拟dom替换的核心代码
    let i
    const data = vnode.data
    if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {
      i(oldVnode, vnode)
    }
    //孩子结点
    const oldCh = oldVnode.children
    const ch = vnode.children
    if (isDef(data) && isPatchable(vnode)) {
      //更新attrs,class,domlisteners,props,ref,style,drirective
      for (i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode)
      if (isDef(i = data.hook) && isDef(i = i.update)) i(oldVnode, vnode)
    }
    //新的虚拟dom节点没有text结点
    if (isUndef(vnode.text)) {
      //判断是否有子节点
      if (isDef(oldCh) && isDef(ch)) {
        //有的话就更新子节点
        if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly)
      } else if (isDef(ch)) {
        //新虚拟dom有子节点
        if (process.env.NODE_ENV !== 'production') {
          checkDuplicateKeys(ch)
        }
        //老的虚拟dom有文本节点，而新的虚拟都没没有文本节点，则老的虚拟dom的文本置空
        if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, '')
        addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)
      } else if (isDef(oldCh)) {
        //老的虚拟dom有子节点，而新的虚拟dom没有子节点，则老的虚拟dom直接删除子节点
        removeVnodes(oldCh, 0, oldCh.length - 1)
      } else if (isDef(oldVnode.text)) {
        //新的虚拟dom没有文本节点，而老的虚拟dom有文本节点，则将老的虚拟虚拟dom的文本节点置空。
        nodeOps.setTextContent(elm, '')
      }
    } else if (oldVnode.text !== vnode.text) {
      //新老寻你dom都有文本节点，且他们的文本节点不同，则直接替换
      nodeOps.setTextContent(elm, vnode.text)
    }
  }
```
+ [updateChildren](https://github.com/vuejs/vue/blob/dev/src/core/vdom/patch.js)
```js
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
    // removeOnly is a special flag used only by <transition-group>
    // to ensure removed elements stay in correct relative positions
    // during leaving transitions
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
        //接下里是新老虚拟dom的四次比较。
        //1、判断新老虚拟dom的开始节点是否一样
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
        oldStartVnode = oldCh[++oldStartIdx]
        newStartVnode = newCh[++newStartIdx]
        //2、判断新老虚拟dom的结束节点是否一样
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx)
        oldEndVnode = oldCh[--oldEndIdx]
        newEndVnode = newCh[--newEndIdx]
        //3、判断新虚拟dom的开始节点和老虚拟dom的结束节点是否一样
      } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx)
        canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm))
        oldStartVnode = oldCh[++oldStartIdx]
        newEndVnode = newCh[--newEndIdx]
        //4、判断老的虚拟dom结束节点和新的虚拟dom的开始节点是否一样
      } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
        canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm)
        oldEndVnode = oldCh[--oldEndIdx]
        newStartVnode = newCh[++newStartIdx]
      } else {
        //如果以上4中条件都不满足，则执行下面的操作
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
    //判断老的虚拟dom开始节点的索引是否大于新的虚拟dom结束节点的索引，如果是，则添加
    if (oldStartIdx > oldEndIdx) {
      refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm
      addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue)
    } else if (newStartIdx > newEndIdx) {
      //如果新的虚拟dom的开始结点大于结束结点的索引(新节点先遍历完)，则删除老的虚拟dom中剩下的结点。
      removeVnodes(oldCh, oldStartIdx, oldEndIdx)
    }
  }
```
主要可以从以下几个方面来讲述。
+ 1、`diff`算法是虚拟 `DOM` 技术的必然产物：通过新旧虚拟 `DOM` 做对比(`diff`),将变化的地方更新在真实 `DOM` 上；也需要 `diff` 高效的执行对比过程，从而降低时间复杂度为`O(n)`。(**定义**)
+ 2、vue2.x 中为了降低 `watcher` 粒度，每个组件只有一个 `watcher` 与之对应，只有引入 `diff` 才能精确的找到发生变化的地方。（`watch`和`computed` 创建的 `watcher` 不算，它们都没有 `updateComponent()` 操作。）(**必要性**)
+ 3、`vue` 中的 `diff` 执行的时刻是在组件实例执行其更新函数时(`updateComponent`),会对比上一次渲染结果 `oldVnode`和新的渲染结果 `newVnode`,此过程称为`patch` (`patchNode()`)。(**执行方式**)

+ 4、`diff`过程整体遵循**深度优先、同层比较**的策略；两个节点之间的比较会根据它们是否拥有子节点或者文本节点做不同的操作；在比较两组子节点时，首先假设首位节点可能相同做4次对比尝试(**首首比较，尾尾比较，首尾比较，尾首比较**——`updateChildren`)，如果没有找到相同节点才按照通用方式遍历查找，查找结束再按情况处理剩下的节点；借助 `key` 通常可以很快速的找到相同节点，因此整个patch过程非常高效。(**高效性**)