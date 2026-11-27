---
title: 怎么获取客户端的ip地址？
date: '2020-09-04'
updated: '2026-11-21'
type: 技术
tags: node
note: "结合服务端请求对象和代理头部，说明在 `Node.js` 中获取客户端 `IP` 的常见写法、兼容场景与可信代理配置注意事项。"
---

## 1、获取客户端 `IP` 的代码示例

```js
/**
@getClientIP
@desc 获取用户 ip 地址
@param {Object} req - 请求
*/
function getClientIP(req) {
    return req.headers['x-forwarded-for'] || // 判断是否有反向代理 IP
    req.connection.remoteAddress || // 判断 connection 的远程 IP
    req.socket.remoteAddress || // 判断后端的 socket 的 IP
    req.connection.socket.remoteAddress;
};
```