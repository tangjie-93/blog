---
title: 怎么获取客户端的ip地址？
date: '2020-09-04'
type: 技术
tags: node
note: 怎么获取客户端的ip地址？
---
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