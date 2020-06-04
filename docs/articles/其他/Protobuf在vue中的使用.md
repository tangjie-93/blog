---
title: Protobuf在vue中的使用
date: '2020-01-14'
type: 技术
tags: Protobuf
note: Protobuf在vue中的使用
---

##  rpc简介
所谓 `RPC` (`remote procedure call` 远程过程调用)。
它是一种通过网络从远程计算机程序上请求服务，而不需要了解底层网络技术的协议。在 `OSI` 网络通信模型中，`RPC` 跨越了传输层和应用层。RPC使得开发包括网络分布式多程序在内的应用程序更加容易。

该框架实际是提供了一套机制，使得应用程序之间可以进行通信，而且也遵从`server/client` 模型。使用的时候客户端调用 `server` 端提供的接口就像是调用本地的函数一样。

## grpc简介
`grpc` 一开始由 `Google` 开发，是一款语言中立、平台中立、开源的远程过程调用(`RPC`)系统。

## grpc的优势
`gRPC` 和 `Restful API` 而且它们都使用 `http` 作为底层的传输协议(严格地说, `gRPC` 使用的 `http2.0` ，而 `restful api`则不一定。
+  语言中立，支持多种语言
+  通信协议基于标准的 `HTTP/2` 设计，支持双向流、消息头压缩、单 `TCP` 的多路复用、服务端推送等特性，这些特性使得 `gRPC` 在移动端设备上更加省电和节省网络流量;
+ `gRPC` 可以通过 `protobuf` 来定义接口，从而可以有更加严格的接口约束条件。
+ `protobuf` 可以将数据序列化为二进制编码，这会大幅减少需要传输的数据量，从而大幅提高性能。
+ 序列化支持 `PB（Protocol Buffer）`和 `JSON`，`PB` 是一种语言无关的高性能序列化框架，基于 `HTTP/2 + PB`, 保障了 `RPC` 调用的高性能。
+ `gRPC` 可以方便地支持流式通信(理论上通过`http2.0`就可以使用`streaming` 模式, 但是通常 `web` 服务的 `restful api` 似乎很少这么用，通常的流式数据应用如视频流，一般都会使用专门的协议如 `HLS，RTMP` 等，这些就不是我们通常 `web` 服务了，而是有专门的服务器应用。）

## grpc的不足
+ 在生产环境，我们面对大并发的情况下，需要使用分布式系统来去处理，而gRPC并没有提供分布式系统相关的一些必要组件。而且，真正的线上服务还需要提供包括负载均衡，限流熔断，监控报警，服务注册和发现等等必要的组件。
+ `GRPC` 尚未提供连接池，需要自行实现
+ 尚未提供“服务发现”、“负载均衡”机制
+ 因为基于 `HTTP2`，绝大部多数`HTTP Server、Nginx`都尚不支持，即Nginx不能将GRPC请求作为`HTTP` 请求来负载均衡，而是作为普通的 `TCP` 请求。
+ Protobuf二进制可读性差。

## grpc可以定义4种类型的 `service` 方法
+ 简单的 `RPC`, 客户端使用存根发送请求到服务器并等待响应返回，就像平常的函数调用一样。
```js
rpc GetFeature(Point) returns (Feature) {}
```
+ 一个服务器端流式 `RPC` ， 客户端发送请求到服务器，拿到一个流去读取返回的消息序列。 客户端读取返回的流，直到里面没有任何消息。
```js
 rpc ListFeatures(Rectangle) returns (stream Feature) {}
```
+ 一个 客户端流式 `RPC` ， 客户端写入一个消息序列并将其发送到服务器，同样也是使用流。一旦客户端完成写入消息，它等待服务器完成读取返回它的响应。
```js
rpc RecordRoute(stream Point) returns (RouteSummary) {}
```
+ 一个 双向流式 RPC 是双方使用读写流去发送一个消息序列。
```js
rpc RouteChat(stream RouteNote) returns (stream RouteNote) {}
```

# Protobuf

## 简介
`Protobuf(Google Protocol Buffer)` 是一种轻便高效的结构化数据存储格式,与 `XML、JSON` 类似，在一些高性能且对响应速度有要求的数据传输场景非常适用。。与**平台无关、语言无关、可扩展**，可用于通讯协议和数据存储领域。

**优点**
+ 与平台无关，语言无关，可扩展。
+ 提供了友好的动态库，使用简单
+ 解析速度快，比对应的XML快约20—100倍。
+ 序列化数据非常简洁、紧凑。与xml相比，其序列化之后的数据量约为1/3到1/10。
+ 前后端都可以直接在项目中使用protobuf，不用再额外去定义model。
+ protobuf可以直接作为前后端数据和接口的文档，大大减少了沟通成本。
### Protoco Buffers在gRPC的框架中主要有三个作用
+ 定义数据结构
+ 定义服务接口

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

参考文档
+ https://www.jianshu.com/p/9e57da13b737

+ https://baijiahao.baidu.com/s?id=1633335936037018920&wfr=spider&for=pc

