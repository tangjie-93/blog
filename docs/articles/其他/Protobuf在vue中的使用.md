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

### protobuf在客户端上运行需要安装的两个程序。

+ [protoc编译工具](https://github.com/protocolbuffers/protobuf/releases)
+ [protoc-gen-grpc-web](https://github.com/grpc/grpc-web/releases)

这两个程序会将后台定义的`proto`文件编译成前端可以直接用的`js`脚本。

**注意：** 这两个程序下载后要把他们的存放路径添加到系统环境变量中去，同时要记得将他们的版本号都去掉。以便在项目中直接使用。

可以将`proto`文件编译成`js`的脚本直接放到`package.json`的`scripts`字段中。如`protoc -I=device -I=/device/service devicw.proto --js_out=import_style=commonjs:device/client  --grpc-web_out=import_style=commonjs,mode=grpcwebtext:device/client`
+ 其中`-I`表示的是`proto`文件的存放目录。
+ `--js_out=import_style=commonjs:device/client`表示编译后的`js`的引用格式是`commonjs`,输出后的文件存放在`device/client`文件夹内。输入文件为`device.proto`输出文件为`device_pb.js`，这里面存放的是一些接口。在组件中的引入方式如下：
```js
import {
  DevicePageQuery,
  Device,
  QueryDeviceBySnRequest,
  DeviceType,
  DeleteDeviceRequest
} from '../grpc-web-protobuf/device/client/Device_pb'
//这些接口名称在device.proto文件中都能找到。

```
+ --grpc-web_out=import_style=commonjs,mode=grpcwebtext:device/client`。表示编译后的`js`的引用格式是`commonjs`,输出后的文件存放在`device/client`文件夹内。输入文件为`device.proto`输出文件为`Device_grpc_web_pb.js`，这里面存放的是连接服务器的。在组件中的引入方式如下：
```js
import {
  DeviceServerClient
} from '../grpc-web-protobuf/device/client/Device_grpc_web_pb'
```
具体项目可以参考我最近做的一个项目。[项目地址为](https://github.com/tangjie-93/vue/web-protobuf-grpc)

