---
title: Protobuf在vue中的使用
date: '2020-01-14'
type: 技术
tags: Protobuf
note: Protobuf在vue中的使用
---
# Protobuf在vue中的使用

## 简介
Protobuf(Google Protocol Buffer)是一种轻便高效的结构化数据存储格式。与平台无关、语言无关、可扩展，可用于通讯协议和数据存储领域。
**优点**
+ 与平台无关，语言无关，可扩展。
+ 提供了友好的动态库，使用简单
+ 解析速度快，比对应的XML快约20—100倍。
+ 序列化数据非常简洁、紧凑。与xml相比，其序列化之后的数据量约为1/3到1/10。
+ 前后端都可以直接在项目中使用protobuf，不用再额外去定义model。
+ protobuf可以直接作为前后端数据和接口的文档，大大减少了沟通成本。