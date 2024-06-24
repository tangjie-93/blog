---
title: 34、WebGL之上下响应文丢失
date: '2024-06-20'
lastmodifydate: '2024-06-20'
type: 技术
tags: WebGL
note: WebGL之上下响应文丢失
---

## 1.响应上下文丢失
`WebGL`使用了计算机的图形硬件，这部分资源是被操作系统管理的，由包括浏览器在内的多个应用程序共享。在某些特殊情况下，如另一个程序接管了图形硬件，或者是操作系统进入休眠,又或者是图形资源耗尽或浏览器资源管理导致`WebGL`上下文被迫释放时，浏览器就会失去使用这些资源的权利，同时导致存储在硬件中的数据丢失，同时`WebGL`上下文就会丢失。

上下文丢失后, `WebGL` 绘图表面变为空白，需要重新初始化上下文并重新加载所有的图形资源。

## 2.如何处理响应上下文丢失
`WebGL`提供了两个事件来处理这种情况。上下文丢失事件`(webglcontextlost)`和上下文恢复事件`(webglcontextrestored)`。

当`WebGl`上下文丢失的时候,`gl`对象就会失效，在`gl`上面的所有操作也都会失效，当浏览器重置`WebGL`系统后，就会触发上下文恢复事件。

具体的代码如下所示。
```js
...
function main() {
  // Retrieve <canvas> element
  const canvas = document.getElementById('webgl');

  // Register event handler for context lost and context restored events
  canvas.addEventListener('webglcontextlost', contextLost, false);
  canvas.addEventListener('webglcontextrestored', function(ev) { start(canvas); }, false);

  start(canvas);   // Perform WebGL related processes
}
...
function contextLost(ev) { // Event Handler for context lost event
  cancelAnimationFrame(g_requestID); //  停止动画
  ev.preventDefault();  // 阻止默认行文
}
```
上下文丢失事件的响应函数只有短短的两行，一个是停止调用产生动画的函数，停止物体的绘制。第二个是阻止浏览器对该事件的默认处理行为。因为浏览器对于上下文丢失的默认处理行为是，不再触发上下文恢复行为。
[demo地址](https://github.com/tangjie-93/WebGL/blob/main/%E8%B7%9F%E7%9D%80%E5%AE%98%E7%BD%91%E5%AD%A6WebGL%2BWebGL%E7%BC%96%E7%A8%8B%E6%8C%87%E5%8D%97/%E9%AB%98%E7%BA%A7%E6%8A%80%E6%9C%AF/%E5%93%8D%E5%BA%94%E4%B8%8A%E4%B8%8B%E6%96%87%E4%B8%A2%E5%A4%B1/%E4%B8%8A%E4%B8%8B%E6%96%87%E4%B8%A2%E5%A4%B1.html)

<Valine></Valine>