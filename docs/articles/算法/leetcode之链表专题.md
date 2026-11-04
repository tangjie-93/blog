---
title: 链表专题：先保存连接，再修改连接
date: '2020-11-13'
type: 技术
tags: 算法
note: 通过反转、合并、环检测与奇偶重排理解引用变化。
---

## 1. 输入约定与学习顺序

先读[基础知识](./数据结构和算法基础知识总结.md)。普通节点表示为 `{ val, next }`，空链表为 `null`。除环检测外，本文输入都是有限无环单链表；合并的两条链表不能共享节点，且节点值为有限数值。示例函数不负责验证任意外部对象。

数组可以按下标访问，链表必须顺着连接访问。修改连接通常只需常数操作，但找到对应节点可能需要线性时间。先画节点和箭头，再写赋值，避免用“指针移动”掩盖实际修改。

## 2. 反转：保护尚未处理的后缀

朴素做法可以把节点放进数组，再倒序连接，需要 `O(n)` 额外空间。原地方法只保存三个引用：已经反转的前缀头、当前节点、旧的下一节点。

```js
function reverseList(head) {
    let previous = null;
    let current = head;
    while (current !== null) {
        const next = current.next;
        current.next = previous;
        previous = current;
        current = next;
    }
    return previous;
}
```

每轮开始时，`previous` 指向已经反转的前缀，`current` 指向尚未处理的后缀。保存旧 `next` 后才能改箭头，否则剩余节点可能失联。结束时后缀为空，返回反转后的头。

时间为 `O(n)`，辅助空间为 `O(1)`，会修改原节点连接。空链表返回 `null`。手推 `1 → 2 → 3`，每次只画一条被改变的箭头；原来的 `head` 最终会成为尾节点。

## 3. 合并有序链表：维护结果尾部

输入两条非降序链表；重复值允许。可以复制所有值后排序，但没有利用已有顺序。直接比较两个头节点，每次连接较小者，剩余部分仍然有序。

```js
function mergeTwoLists(a, b) {
    const dummy = { next: null };
    let tail = dummy;
    while (a !== null && b !== null) {
        if (a.val <= b.val) {
            tail.next = a;
            a = a.next;
        } else {
            tail.next = b;
            b = b.next;
        }
        tail = tail.next;
    }
    tail.next = a === null ? b : a;
    return dummy.next;
}
```

`tail` 指向已合并部分的末尾；相等时先取第一条链表的节点，保持各链内部顺序。一条耗尽后，另一条可整体接上。

时间为 `O(m + n)`，辅助空间为 `O(1)`；一个哨兵节点让“插入第一个节点”不需要特殊分支。函数重用并修改节点连接，调用者不能继续把两条旧链当成互相独立的数据。若原数据必须保留，需要明确改成复制节点的版本。

## 4. 环检测：快慢指针为何会相遇

用集合记录节点身份可以检测重复访问，但需要 `O(n)` 空间。另一种方法让慢指针每轮一步、快指针每轮两步；若无环，快指针先遇到空引用。若有环，两者进入环后，每轮相对距离改变一步，最终会在环内相遇。

```js
function hasCycle(head) {
    let slow = head;
    let fast = head;
    while (fast !== null && fast.next !== null) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow === fast) return true;
    }
    return false;
}
```

比较节点引用，不是比较 `val`。多个节点值相等并不代表有环。时间为 `O(n)`，辅助空间为 `O(1)`，不修改链表。这里 `n` 是从头可达的不同节点数。

练习：画一个尾节点连回第二个节点的链表；解释为什么相遇节点不一定是入环节点。定位入环点可作为后续变式，本篇先掌握检测。

## 5. 奇偶链表：按位置拆成两条链

原专题中的奇偶链表保留为进阶练习。奇偶指从 `1` 开始的位置编号，不是数值奇偶；两个分组内部顺序都应保持。

```js
function oddEvenList(head) {
    if (head === null) return null;
    let odd = head;
    let even = head.next;
    const evenHead = even;
    while (even !== null && even.next !== null) {
        odd.next = even.next;
        odd = odd.next;
        even.next = odd.next;
        even = even.next;
    }
    odd.next = evenHead;
    return head;
}
```

把奇数位置接到奇链尾部、偶数位置接到偶链尾部，最后连接奇链尾和偶链头。`evenHead` 必须单独保留，因为遍历结束时 `even` 可能已经为空。

时间为 `O(n)`，辅助空间为 `O(1)`；原地修改连接。例如 `2 → 1 → 3 → 5 → 6 → 4 → 7` 变成 `2 → 3 → 6 → 7 → 1 → 5 → 4`。

## 6. 验收与复习

```sh
node --test tests/algorithm-structures-examples.test.mjs
```

测试不只比较值，还检查是否保留原节点身份、是否意外成环、合并后是否遗漏节点。覆盖空链、单节点、奇偶长度、重复值、单节点自环和尾部入环。

闭卷完成反转后，再做合并；快慢指针稳定后再做奇偶重排。每道题解释“这次赋值会改变谁看到的连接”，并在至少间隔 `3` 天后重写。链表操作仍不熟时，不急着写多种递归版本。
