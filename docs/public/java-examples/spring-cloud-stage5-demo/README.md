# Spring Cloud Stage 5 Demo

这是根据 `阶段5：微服务架构.md` 创建的微服务电商示例，重点对应练习 1：

- `gateway`：统一 API 入口，端口 `9000`
- `service-user`：用户服务，端口 `8081`
- `service-product`：商品服务，端口 `8083`
- `service-order`：订单服务，端口 `8082`
- `common`：公共响应结构和 DTO

更详细的入门说明见：[项目小白说明文档.md](./项目小白说明文档.md)

## 快速运行

默认模式不强依赖 Nacos、RabbitMQ、Seata，适合先理解服务拆分和接口调用。

```powershell
cd D:\personal\study\code\spring-cloud-stage5-demo
mvn test
mvn -pl service-user spring-boot:run
mvn -pl service-product spring-boot:run
mvn -pl service-order spring-boot:run
mvn -pl gateway spring-boot:run
```

上面 4 个 `spring-boot:run` 命令需要分别在 4 个 PowerShell 窗口中执行。

启动后可以通过网关访问：

```powershell
curl http://127.0.0.1:9000/api/users
curl http://127.0.0.1:9000/api/products
curl -Method POST http://127.0.0.1:9000/api/orders -ContentType 'application/json' -Body '{"userId":1,"productId":1,"quantity":2}'
curl http://127.0.0.1:9000/api/orders
```

## 前端页面

前端代码位于 `frontend` 目录，使用 Vue 3 + TypeScript + Vite。默认开发服务端口是 `5175`，通过 Vite 代理把 `/api` 转发到网关 `http://127.0.0.1:9000`。

```powershell
cd D:\personal\study\code\spring-cloud-stage5-demo\frontend
pnpm.cmd install
pnpm.cmd run dev
```

浏览器访问：

```text
http://127.0.0.1:5175/
```

页面会调用：

- `GET /api/users`
- `POST /api/users`
- `GET /api/products`
- `GET /api/orders`
- `POST /api/orders`

如果网关地址不是 `9000`，可以修改 `frontend/.env.development` 里的 `VITE_GATEWAY_TARGET`。

## 模块关系

```text
client
  |
  v
gateway:9000
  |------------> service-user:8081
  |------------> service-product:8083
  |------------> service-order:8082
                       |
                       | OpenFeign
                       v
              service-user / service-product
```

## 与阶段 5 文档的对应关系

- Nacos：各服务已引入 `spring-cloud-starter-alibaba-nacos-discovery`，默认关闭注册，使用 `nacos` profile 可开启。
- OpenFeign：订单服务通过 `UserClient`、`ProductClient` 调用用户和商品服务。
- Sentinel：控制器方法使用 `@SentinelResource`，Feign 开启 Sentinel fallback。
- Gateway：`gateway` 模块配置统一路由、跨域、响应头、日志过滤器和演示鉴权过滤器。
- RabbitMQ：订单服务定义了订单创建交换机、队列和消费者；默认不发送，设置 `RABBITMQ_ENABLED=true` 后启用。
- Seata：订单创建方法标注 `@GlobalTransactional`；默认 `SEATA_ENABLED=false`，避免本地未启动 Seata Server 时无法体验基础流程。

## 开启 Nacos 模式

先启动 Nacos，然后用 `nacos` profile 启动服务：

```powershell
$env:NACOS_ENABLED='true'
$env:SPRING_PROFILES_ACTIVE='nacos'
```

然后分别启动 `service-user`、`service-product`、`service-order`、`gateway` 四个模块。

`nacos` profile 下：

- 网关路由使用 `lb://service-user`、`lb://service-product`、`lb://service-order`
- 订单服务 Feign URL 置空，改走服务名发现

## 开启 RabbitMQ 订单事件

先启动 RabbitMQ，然后：

```powershell
$env:RABBITMQ_ENABLED='true'
```

再次创建订单时，订单服务会向 `stage5.order.exchange` 发送 `order.created` 事件，并由消费者打印日志。

## 开启网关鉴权

```powershell
$env:GATEWAY_AUTH_ENABLED='true'
```

请求需要加：

```text
Authorization: Bearer stage5-demo-token
```

## 后续练习方向

当前示例为了学习微服务主流程，数据先放在内存中。继续扩展时可以按阶段 5 文档补：

- 每个服务独立 MySQL 库
- 商品库存扣减改为数据库事务
- RabbitMQ 消息确认、重试、死信队列
- Sentinel Dashboard 动态流控规则
- Seata Server + undo_log 表 + 真实跨服务事务
