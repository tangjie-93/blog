---
title: Redis 详细介绍与使用
date: '2026-10-19'
type: 技术
tags: Java|Redis
note: Redis 基础概念、数据结构、Java 集成、持久化和高可用实践。
---

# Redis详细介绍与使用文档

> Redis 是后端开发、缓存设计、分布式系统和高性能架构中非常常用的中间件。本文从基础概念、安装使用、数据结构、Java 集成、缓存实战、持久化、高可用、性能优化和生产规范等角度系统介绍 Redis。

---

## 目录

1. Redis 概述
2. Redis 适合解决什么问题
3. Redis 安装与启动
4. redis-cli 基础使用
5. Redis 常用数据类型
6. Key 设计规范
7. 过期时间与内存淘汰
8. Redis 持久化机制
9. Redis 事务、Pipeline 和 Lua
10. 发布订阅与 Stream
11. Java 与 Spring Boot 集成
12. Redis 常见业务场景
13. 缓存常见问题与解决方案
14. 分布式锁
15. Redis 高可用与集群
16. Redis 安全配置
17. 监控、排查与性能优化
18. 常见面试题
19. 学习建议与练习任务

---

## 1. Redis 概述

### 1.1 什么是 Redis

Redis，全称 Remote Dictionary Server，是一个基于内存的高性能键值数据库。它通常被称为 NoSQL 数据库，也可以理解为一个功能丰富的内存数据结构服务器。

Redis 的核心特点：

- 数据主要存放在内存中，读写速度非常快。
- 使用 Key-Value 模型存储数据。
- 支持 String、Hash、List、Set、Sorted Set、Bitmap、HyperLogLog、Geo、Stream 等多种数据结构。
- 支持数据持久化，可以将内存数据保存到磁盘。
- 支持主从复制、哨兵、集群等高可用能力。
- 支持 Lua 脚本，能够保证一组操作的原子性。
- 单线程处理命令为主，避免了大量线程上下文切换。

### 1.2 Redis 和传统数据库的区别

| 对比项 | Redis | MySQL 等关系型数据库 |
| --- | --- | --- |
| 存储位置 | 以内存为主 | 以磁盘为主 |
| 数据模型 | Key-Value 和多种数据结构 | 表、行、列 |
| 查询方式 | 按 Key 访问为主 | SQL 查询 |
| 性能 | 极高，适合高频读写 | 稳定，适合复杂查询和事务 |
| 持久化 | RDB、AOF | WAL、Redo Log、Binlog 等 |
| 典型用途 | 缓存、计数器、排行榜、分布式锁、消息队列 | 业务主数据存储 |

Redis 不是用来完全替代 MySQL 的。常见架构是：MySQL 负责可靠存储业务数据，Redis 负责提升高频访问数据的性能。

### 1.3 Redis 为什么快

Redis 快的主要原因：

1. 数据在内存中，避免频繁磁盘 IO。
2. 基于高效的数据结构实现。
3. 网络 IO 使用事件驱动模型。
4. 命令执行通常是单线程，减少锁竞争和线程切换。
5. 命令设计简单，大多数操作时间复杂度较低。

需要注意：Redis 并不是所有场景都快。如果使用大 Key、慢命令、阻塞操作或者网络延迟较高，也会导致性能下降。

---

## 2. Redis 适合解决什么问题

### 2.1 典型使用场景

| 场景 | Redis 方案 |
| --- | --- |
| 热点数据缓存 | String、Hash |
| 登录 Token / Session | String + TTL |
| 手机验证码 | String + TTL |
| 访问计数 | INCR、INCRBY |
| 点赞、收藏 | Set |
| 排行榜 | Sorted Set |
| 最新动态列表 | List、Sorted Set |
| 秒杀库存 | String 原子递减、Lua |
| 分布式锁 | SET NX EX、Redisson |
| 消息队列 | Stream、List |
| 去重统计 | Set、Bitmap、HyperLogLog |
| 地理位置查询 | Geo |

### 2.2 不适合 Redis 的场景

以下场景不建议直接使用 Redis 作为主要方案：

- 需要复杂 SQL 查询、Join、事务一致性的核心数据。
- 单个 Value 特别大，比如几 MB 到几十 MB 的对象。
- 数据规模远大于内存，且没有冷热分层策略。
- 不能接受缓存丢失或短时间不一致的核心账务数据。
- 需要强一致跨多节点事务的业务。

---

## 3. Redis 安装与启动

### 3.1 使用 Docker 启动 Redis

开发环境推荐使用 Docker，简单、干净、便于重建。

```bash
docker run -d \
  --name redis \
  -p 6379:6379 \
  redis
```

带密码启动：

```bash
docker run -d \
  --name redis \
  -p 6379:6379 \
  redis \
  redis-server --requirepass 123456
```

进入容器：

```bash
docker exec -it redis redis-cli
```

如果设置了密码：

```bash
docker exec -it redis redis-cli -a 123456
```

### 3.2 Windows 本地使用建议

Windows 环境可以选择：

- 使用 Docker Desktop 运行 Redis。
- 使用 WSL 安装 Linux 版 Redis。
- 使用兼容的 Windows Redis 发行包，仅建议本地学习使用。

### 3.3 Linux 安装 Redis

以常见 Linux 环境为例：

```bash
sudo apt update
sudo apt install redis-server
redis-server --version
```

启动服务：

```bash
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

连接测试：

```bash
redis-cli ping
```

返回：

```text
PONG
```

---

## 4. redis-cli 基础使用

### 4.1 连接 Redis

```bash
redis-cli
```

指定主机和端口：

```bash
redis-cli -h 127.0.0.1 -p 6379
```

指定密码：

```bash
redis-cli -h 127.0.0.1 -p 6379 -a 123456
```

### 4.2 基础命令

```bash
PING
SELECT 0
DBSIZE
INFO
CLIENT LIST
CONFIG GET maxmemory
```

### 4.3 Key 通用命令

```bash
SET name "Tom"
GET name
EXISTS name
TYPE name
DEL name
EXPIRE name 60
TTL name
PERSIST name
RENAME name username
```

注意：

- `KEYS *` 会阻塞 Redis，生产环境慎用。
- 生产环境遍历 Key 推荐使用 `SCAN`。

```bash
SCAN 0 MATCH user:* COUNT 100
```

---

## 5. Redis 常用数据类型

### 5.1 String

String 是最基础的数据类型，可以存字符串、数字、JSON 字符串、二进制数据等。

常用命令：

```bash
SET user:1:name "Alice"
GET user:1:name
SETEX login:token:abc 3600 "user-1"
SETNX lock:order:1001 "request-001"
MSET k1 v1 k2 v2
MGET k1 k2
INCR counter
INCRBY counter 10
DECR counter
```

常见场景：

- 缓存对象 JSON。
- 登录 Token。
- 短信验证码。
- 计数器。
- 分布式锁基础实现。

示例：验证码

```bash
SETEX sms:code:13800000000 300 9527
GET sms:code:13800000000
```

### 5.2 Hash

Hash 适合存储对象字段，类似 Java 中的 `Map<String, String>`。

常用命令：

```bash
HSET user:1 name "Alice" age 20 city "Shanghai"
HGET user:1 name
HMGET user:1 name age
HGETALL user:1
HINCRBY user:1 age 1
HDEL user:1 city
HEXISTS user:1 name
HLEN user:1
```

常见场景：

- 用户信息。
- 商品详情。
- 配置信息。

String 存对象和 Hash 存对象的区别：

| 方式 | 优点 | 缺点 |
| --- | --- | --- |
| String + JSON | 结构直观，适合整体读写 | 修改单个字段需要反序列化后整体写回 |
| Hash | 可以单字段读写 | 复杂嵌套对象不太方便 |

### 5.3 List

List 是有序列表，可以从两端插入和弹出。

常用命令：

```bash
LPUSH messages "msg1"
RPUSH messages "msg2"
LPOP messages
RPOP messages
LRANGE messages 0 -1
LLEN messages
BLPOP messages 10
```

常见场景：

- 简单队列。
- 最近访问列表。
- 时间线列表。

### 5.4 Set

Set 是无序、不重复集合。

常用命令：

```bash
SADD user:1:roles admin editor
SMEMBERS user:1:roles
SISMEMBER user:1:roles admin
SREM user:1:roles editor
SCARD user:1:roles
SINTER set1 set2
SUNION set1 set2
SDIFF set1 set2
```

常见场景：

- 用户标签。
- 点赞用户集合。
- 黑名单。
- 好友共同关注。
- 数据去重。

示例：文章点赞

```bash
SADD article:1001:likes user:1
SADD article:1001:likes user:2
SCARD article:1001:likes
SISMEMBER article:1001:likes user:1
```

### 5.5 Sorted Set

Sorted Set 是带分数的有序集合，适合排序场景。

常用命令：

```bash
ZADD rank:score 100 user:1
ZADD rank:score 80 user:2
ZINCRBY rank:score 20 user:2
ZRANGE rank:score 0 -1 WITHSCORES
ZREVRANGE rank:score 0 9 WITHSCORES
ZRANK rank:score user:1
ZREVRANK rank:score user:1
ZSCORE rank:score user:1
```

常见场景：

- 排行榜。
- 热门文章。
- 延迟队列。
- 按时间排序的 Feed。

### 5.6 Bitmap

Bitmap 本质上是对 String 的位操作，适合大量布尔状态统计。

常用命令：

```bash
SETBIT sign:2026-07 userId 1
GETBIT sign:2026-07 userId
BITCOUNT sign:2026-07
```

常见场景：

- 用户签到。
- 活跃状态统计。
- 布尔标记集合。

### 5.7 HyperLogLog

HyperLogLog 用于基数统计，适合统计 UV，优点是占用内存很小，缺点是有少量误差。

常用命令：

```bash
PFADD uv:2026-07-09 user:1 user:2 user:3
PFCOUNT uv:2026-07-09
PFMERGE uv:2026-07 uv:2026-07-01 uv:2026-07-02
```

### 5.8 Geo

Geo 用于存储地理位置并计算距离。

常用命令：

```bash
GEOADD shop:geo 121.4737 31.2304 shop:1
GEOADD shop:geo 116.4074 39.9042 shop:2
GEODIST shop:geo shop:1 shop:2 km
GEOPOS shop:geo shop:1
```

常见场景：

- 附近门店。
- 附近的人。
- 同城配送距离计算。

### 5.9 Stream

Stream 是 Redis 提供的日志型消息结构，适合比 List 更可靠的消息队列场景。

常用命令：

```bash
XADD order:stream * orderId 1001 userId 1
XRANGE order:stream - +
XGROUP CREATE order:stream group1 0 MKSTREAM
XREADGROUP GROUP group1 consumer1 COUNT 10 BLOCK 5000 STREAMS order:stream >
XACK order:stream group1 messageId
```

常见场景：

- 异步任务。
- 订单事件流。
- 消息消费确认。
- 简单消息队列。

---

## 6. Key 设计规范

良好的 Key 设计可以提升可读性、可维护性和排查效率。

### 6.1 命名格式

推荐格式：

```text
业务模块:对象类型:对象ID:属性
```

示例：

```text
user:1001:profile
user:1001:token
article:2001:likes
product:3001:stock
order:4001:status
```

### 6.2 设计建议

- 使用小写字母和冒号分隔。
- Key 不要太长，避免浪费内存。
- Key 要能表达业务含义。
- 不同业务模块加前缀，避免冲突。
- 临时数据必须设置过期时间。
- 不要在生产环境创建不可控数量的 Key。

### 6.3 常见反例

不推荐：

```text
token
user
data
cache
aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
```

原因：

- 语义不清晰。
- 容易冲突。
- 不方便排查。
- 无法按业务维度管理。

---

## 7. 过期时间与内存淘汰

### 7.1 设置过期时间

```bash
SET token:abc user:1 EX 3600
EXPIRE token:abc 3600
TTL token:abc
```

过期时间常用场景：

- 验证码：1 到 5 分钟。
- 登录 Token：几小时到几天。
- 热点缓存：几分钟到几小时。
- 分布式锁：几秒到几十秒。

### 7.2 Redis 删除过期 Key 的方式

Redis 删除过期 Key 主要依赖：

- 惰性删除：访问 Key 时检查是否过期，过期则删除。
- 定期删除：后台定期扫描一部分设置了过期时间的 Key。

### 7.3 内存淘汰策略

当 Redis 达到 `maxmemory` 限制时，会根据配置的淘汰策略处理数据。

常见策略：

| 策略 | 说明 |
| --- | --- |
| noeviction | 不淘汰，写入时报错 |
| allkeys-lru | 从所有 Key 中淘汰最近最少使用的 |
| volatile-lru | 从设置了过期时间的 Key 中淘汰最近最少使用的 |
| allkeys-random | 从所有 Key 中随机淘汰 |
| volatile-random | 从设置了过期时间的 Key 中随机淘汰 |
| volatile-ttl | 优先淘汰 TTL 更短的 Key |
| allkeys-lfu | 从所有 Key 中淘汰使用频率最低的 |
| volatile-lfu | 从设置了过期时间的 Key 中淘汰使用频率最低的 |

缓存型 Redis 常用：

```text
allkeys-lru
allkeys-lfu
```

---

## 8. Redis 持久化机制

Redis 是内存数据库，但可以通过持久化把数据保存到磁盘。

### 8.1 RDB

RDB 是快照持久化，会在某个时间点把内存数据生成快照文件。

优点：

- 文件紧凑，适合备份。
- 恢复速度较快。
- 对 Redis 主线程影响相对较小。

缺点：

- 两次快照之间的数据可能丢失。
- 大数据量 fork 子进程时可能造成短暂压力。

常见配置：

```conf
save 900 1
save 300 10
save 60 10000
dbfilename dump.rdb
dir /data
```

### 8.2 AOF

AOF 会记录 Redis 写命令，通过重放命令恢复数据。

优点：

- 数据安全性通常高于 RDB。
- 可读性相对更好，便于分析。

缺点：

- 文件通常比 RDB 大。
- 恢复速度可能慢于 RDB。
- 需要 AOF 重写来压缩文件。

常见配置：

```conf
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
```

`appendfsync` 常见取值：

| 配置 | 说明 |
| --- | --- |
| always | 每次写入都刷盘，最安全但最慢 |
| everysec | 每秒刷盘，性能和安全性折中 |
| no | 交给操作系统决定，性能好但风险更高 |

### 8.3 如何选择

开发环境：

- 可以只开 RDB。

缓存场景：

- 数据可以从数据库重建，持久化要求不高。

重要数据场景：

- 开启 AOF。
- 必要时同时开启 RDB 和 AOF。
- Redis 仍然不建议作为唯一可靠数据源。

---

## 9. Redis 事务、Pipeline 和 Lua

### 9.1 Redis 事务

Redis 事务通过 `MULTI`、`EXEC`、`DISCARD` 实现。

```bash
MULTI
SET account:1 100
DECRBY account:1 10
INCRBY account:2 10
EXEC
```

特点：

- 事务中的命令会按顺序执行。
- Redis 事务不支持传统数据库那种自动回滚。
- 命令入队错误会导致事务失败。
- 执行时某条命令运行错误，不会回滚已执行命令。

### 9.2 乐观锁 WATCH

`WATCH` 可以监视 Key，在事务执行前如果 Key 被修改，则事务失败。

```bash
WATCH stock:1001
MULTI
DECR stock:1001
EXEC
```

### 9.3 Pipeline

Pipeline 可以把多条命令一次性发送给 Redis，减少网络往返时间。

适合：

- 批量写入缓存。
- 批量读取数据。
- 批量删除 Key。

不适合：

- 后一条命令依赖前一条命令结果的复杂逻辑。

### 9.4 Lua 脚本

Lua 脚本可以把多条 Redis 命令作为一个整体执行，保证脚本执行过程中的原子性。

示例：库存扣减

```lua
local stock = tonumber(redis.call('GET', KEYS[1]))
if stock == nil then
  return -1
end
if stock <= 0 then
  return 0
end
redis.call('DECR', KEYS[1])
return 1
```

执行：

```bash
EVAL "local stock = tonumber(redis.call('GET', KEYS[1])); if stock == nil then return -1 end; if stock <= 0 then return 0 end; redis.call('DECR', KEYS[1]); return 1" 1 product:1001:stock
```

---

## 10. 发布订阅与 Stream

### 10.1 Pub/Sub

发布订阅适合实时通知，但不保证消息持久化。

订阅：

```bash
SUBSCRIBE news
```

发布：

```bash
PUBLISH news "hello redis"
```

特点：

- 实时性好。
- 订阅者不在线时收不到消息。
- 不适合重要业务消息。

### 10.2 Stream

Stream 更适合可靠消息处理。

生产消息：

```bash
XADD order:events * type created orderId 1001
```

创建消费者组：

```bash
XGROUP CREATE order:events order-group 0 MKSTREAM
```

消费消息：

```bash
XREADGROUP GROUP order-group consumer-1 COUNT 10 BLOCK 5000 STREAMS order:events >
```

确认消息：

```bash
XACK order:events order-group 1690000000000-0
```

如果系统已经使用 Kafka、RabbitMQ、RocketMQ 等专业消息中间件，核心消息链路仍建议优先使用这些成熟 MQ。

---

## 11. Java 与 Spring Boot 集成

### 11.1 常见 Java 客户端

| 客户端 | 说明 |
| --- | --- |
| Jedis | 老牌客户端，API 接近 Redis 命令 |
| Lettuce | 基于 Netty，线程安全，Spring Boot 默认常用 |
| Redisson | 提供分布式锁、集合、队列等高级能力 |

### 11.2 Spring Boot 配置

Maven 依赖：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

配置示例：

```yaml
spring:
  data:
    redis:
      host: 127.0.0.1
      port: 6379
      password: 123456
      database: 0
      timeout: 3s
```

不同 Spring Boot 版本中 Redis 配置前缀可能略有差异，使用时以当前项目版本的配置提示为准。

### 11.3 RedisTemplate 使用示例

```java
@Service
public class UserCacheService {

    private final StringRedisTemplate stringRedisTemplate;

    public UserCacheService(StringRedisTemplate stringRedisTemplate) {
        this.stringRedisTemplate = stringRedisTemplate;
    }

    public void cacheUserName(Long userId, String name) {
        String key = "user:" + userId + ":name";
        stringRedisTemplate.opsForValue().set(key, name, Duration.ofHours(1));
    }

    public String getUserName(Long userId) {
        String key = "user:" + userId + ":name";
        return stringRedisTemplate.opsForValue().get(key);
    }

    public void deleteUserName(Long userId) {
        String key = "user:" + userId + ":name";
        stringRedisTemplate.delete(key);
    }
}
```

### 11.4 缓存对象 JSON

```java
@Service
public class ProductCacheService {

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    public ProductCacheService(StringRedisTemplate redisTemplate, ObjectMapper objectMapper) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    public void cacheProduct(ProductDTO product) throws JsonProcessingException {
        String key = "product:" + product.getId() + ":detail";
        String json = objectMapper.writeValueAsString(product);
        redisTemplate.opsForValue().set(key, json, Duration.ofMinutes(30));
    }

    public ProductDTO getProduct(Long productId) throws JsonProcessingException {
        String key = "product:" + productId + ":detail";
        String json = redisTemplate.opsForValue().get(key);
        if (json == null) {
            return null;
        }
        return objectMapper.readValue(json, ProductDTO.class);
    }
}
```

### 11.5 Spring Cache 集成

开启缓存：

```java
@EnableCaching
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

使用注解：

```java
@Cacheable(cacheNames = "product", key = "#id")
public ProductDTO getProductById(Long id) {
    return productRepository.findById(id);
}

@CacheEvict(cacheNames = "product", key = "#id")
public void deleteProduct(Long id) {
    productRepository.deleteById(id);
}
```

适合简单缓存场景。复杂业务缓存建议手写缓存逻辑，便于控制空值缓存、互斥锁、过期时间和降级策略。

---

## 12. Redis 常见业务场景

### 12.1 缓存商品详情

基本流程：

1. 先查 Redis。
2. Redis 命中则直接返回。
3. Redis 未命中则查 MySQL。
4. MySQL 有数据则写入 Redis。
5. MySQL 无数据则缓存空值，防止缓存穿透。

伪代码：

```java
public ProductDTO getProduct(Long id) {
    String key = "product:" + id + ":detail";
    String json = redis.get(key);
    if (json != null) {
        if ("null".equals(json)) {
            return null;
        }
        return parse(json);
    }

    ProductDTO product = productMapper.selectById(id);
    if (product == null) {
        redis.set(key, "null", Duration.ofMinutes(5));
        return null;
    }

    redis.set(key, toJson(product), Duration.ofMinutes(30));
    return product;
}
```

### 12.2 登录 Token

```bash
SETEX login:token:abc123 7200 user:1001
GET login:token:abc123
DEL login:token:abc123
```

建议：

- Token Key 设置合理过期时间。
- 退出登录时删除 Token。
- 敏感信息不要直接放入 Redis Value。
- 线上 Redis 必须设置密码和网络隔离。

### 12.3 计数器

```bash
INCR article:1001:read-count
INCRBY article:1001:read-count 10
GET article:1001:read-count
```

应用：

- 阅读量。
- 点赞数。
- 接口访问量。
- 限流计数。

### 12.4 排行榜

```bash
ZINCRBY article:hot 1 article:1001
ZINCRBY article:hot 5 article:1002
ZREVRANGE article:hot 0 9 WITHSCORES
```

### 12.5 简单限流

固定窗口限流示例：

```bash
INCR rate:user:1001:202607091030
EXPIRE rate:user:1001:202607091030 60
```

判断逻辑：

- 每分钟使用一个 Key。
- 第一次访问设置 60 秒过期。
- 计数超过阈值则拒绝。

更严格的限流可使用 Lua 脚本、滑动窗口或令牌桶算法。

---

## 13. 缓存常见问题与解决方案

### 13.1 缓存穿透

缓存穿透指查询一个数据库中也不存在的数据，导致每次请求都打到数据库。

常见原因：

- 恶意请求不存在的 ID。
- 业务参数错误。
- 缓存没有保存空值。

解决方案：

1. 缓存空值，但过期时间要短。
2. 参数校验，非法参数直接拒绝。
3. 使用布隆过滤器判断数据是否可能存在。

### 13.2 缓存击穿

缓存击穿指某个热点 Key 过期瞬间，大量请求同时查询数据库。

解决方案：

1. 热点 Key 设置较长过期时间。
2. 使用互斥锁，只允许一个请求回源数据库。
3. 提前异步刷新缓存。
4. 热点数据不过期，使用逻辑过期时间。

互斥锁思路：

```text
请求发现缓存未命中
尝试获取 lock:product:1001
获取成功：查询数据库并重建缓存
获取失败：短暂等待后重试查询缓存
```

### 13.3 缓存雪崩

缓存雪崩指大量 Key 在同一时间过期，导致请求集中打到数据库。

解决方案：

1. 过期时间增加随机值。
2. 热点数据分批预热。
3. 使用多级缓存。
4. 数据库限流和降级。
5. Redis 高可用部署。

示例：

```java
Duration ttl = Duration.ofMinutes(30 + ThreadLocalRandom.current().nextInt(10));
```

### 13.4 缓存与数据库一致性

常见策略：

1. 先更新数据库，再删除缓存。
2. 删除缓存失败时使用重试机制。
3. 对一致性要求高的场景，引入消息队列或订阅数据库变更日志。

推荐基础方案：

```text
更新数据库成功后，删除缓存。
下一次查询缓存未命中，再从数据库加载新数据。
```

不推荐简单地先删缓存再更新数据库，因为并发场景下可能读到旧数据并重新写入缓存。

---

## 14. 分布式锁

### 14.1 基础实现

加锁：

```bash
SET lock:order:1001 request-001 NX EX 30
```

释放锁需要判断锁的值，不能直接删除：

```lua
if redis.call('GET', KEYS[1]) == ARGV[1] then
  return redis.call('DEL', KEYS[1])
else
  return 0
end
```

为什么要判断 Value：

- 防止删除其他线程或其他服务实例持有的锁。
- 锁过期后，可能已经被新的请求获得。

### 14.2 分布式锁注意事项

- 必须设置过期时间，避免死锁。
- Value 使用唯一请求 ID。
- 释放锁必须使用 Lua 保证原子性。
- 业务执行时间可能超过锁时间，需要续期机制。
- 复杂场景建议使用 Redisson。

### 14.3 Redisson 示例

```java
RLock lock = redissonClient.getLock("lock:order:" + orderId);
boolean locked = lock.tryLock(3, 30, TimeUnit.SECONDS);
if (!locked) {
    throw new RuntimeException("系统繁忙，请稍后重试");
}
try {
    // 执行业务逻辑
} finally {
    if (lock.isHeldByCurrentThread()) {
        lock.unlock();
    }
}
```

---

## 15. Redis 高可用与集群

### 15.1 主从复制

主从复制用于把主节点数据同步到从节点。

作用：

- 读写分离。
- 数据备份。
- 提升读能力。

限制：

- 主节点故障后，需要故障转移机制。
- 主从复制存在延迟。

### 15.2 Sentinel 哨兵

Sentinel 用于监控 Redis 主从节点，并在主节点故障时自动选举新的主节点。

能力：

- 监控节点状态。
- 主观下线和客观下线判断。
- 自动故障转移。
- 通知客户端新的主节点地址。

适合：

- 数据量不大，但需要高可用的 Redis 服务。

### 15.3 Redis Cluster

Redis Cluster 用于分片存储数据，将 Key 分散到多个主节点上。

特点：

- 使用 16384 个哈希槽。
- 每个主节点负责一部分槽。
- 支持自动重定向。
- 可以横向扩展容量和吞吐。

适合：

- 数据量大。
- 单机内存不足。
- QPS 高，需要分片扩展。

### 15.4 选择建议

| 场景 | 推荐方案 |
| --- | --- |
| 本地学习 | 单机 Redis |
| 小型项目缓存 | 单机 + RDB/AOF |
| 生产高可用 | 主从 + Sentinel |
| 大容量和高并发 | Redis Cluster |
| 分布式锁复杂场景 | Redisson + 合理部署 |

---

## 16. Redis 安全配置

### 16.1 必做配置

生产环境建议：

- 设置访问密码。
- 绑定内网地址。
- 禁止直接暴露到公网。
- 开启防火墙或安全组限制。
- 禁用危险命令或重命名危险命令。
- 使用专用账号和最小权限配置。

### 16.2 常见配置

```conf
bind 127.0.0.1
protected-mode yes
requirepass strong_password
```

Redis 6 以后支持 ACL，可以为不同用户配置权限。

示例：

```bash
ACL SETUSER app-user on >app-password ~app:* +get +set +del +expire
ACL LIST
```

### 16.3 危险命令

生产环境慎用或禁用：

```text
FLUSHDB
FLUSHALL
CONFIG
KEYS
SHUTDOWN
EVAL
```

是否禁用 `EVAL` 要结合业务判断，因为很多客户端和分布式锁实现会使用 Lua。

---

## 17. 监控、排查与性能优化

### 17.1 常用排查命令

```bash
INFO
INFO memory
INFO stats
INFO clients
INFO replication
SLOWLOG GET 10
CLIENT LIST
MONITOR
```

注意：`MONITOR` 会输出所有命令，生产环境慎用，可能明显影响性能。

### 17.2 重点监控指标

| 指标 | 含义 |
| --- | --- |
| used_memory | Redis 已使用内存 |
| maxmemory | Redis 最大可用内存 |
| connected_clients | 客户端连接数 |
| blocked_clients | 阻塞客户端数 |
| instantaneous_ops_per_sec | 每秒命令数 |
| keyspace_hits | 缓存命中次数 |
| keyspace_misses | 缓存未命中次数 |
| evicted_keys | 被淘汰的 Key 数量 |
| expired_keys | 过期删除的 Key 数量 |
| rejected_connections | 被拒绝连接数 |

缓存命中率：

```text
命中率 = keyspace_hits / (keyspace_hits + keyspace_misses)
```

### 17.3 慢查询

查看慢查询：

```bash
SLOWLOG GET 10
```

配置慢查询阈值：

```conf
slowlog-log-slower-than 10000
slowlog-max-len 128
```

单位是微秒，`10000` 表示 10 毫秒。

### 17.4 大 Key 问题

大 Key 指 Value 特别大或集合元素特别多的 Key。

危害：

- 阻塞 Redis 主线程。
- 网络传输耗时增加。
- 删除时可能阻塞。
- 主从同步压力变大。

排查：

```bash
redis-cli --bigkeys
```

优化：

- 拆分大 Key。
- 控制集合大小。
- 分页读取。
- 删除大 Key 使用 `UNLINK`。

### 17.5 热 Key 问题

热 Key 指访问频率特别高的 Key。

危害：

- 单个 Redis 节点压力过高。
- 集群环境下流量倾斜。

优化：

- 本地缓存。
- 多级缓存。
- 热 Key 拆分。
- 读写分离。
- 提前预热。

### 17.6 性能优化建议

- 避免使用 `KEYS *`。
- 避免大 Key。
- 合理设置过期时间。
- 批量操作使用 Pipeline。
- 高频对象尽量压缩字段。
- 控制连接池大小。
- 业务缓存设置随机过期时间。
- 监控命中率和淘汰情况。
- 使用合适的数据结构，不要所有数据都塞 JSON。

---

## 18. 常见面试题

### 18.1 Redis 为什么快？

核心回答：

- 内存存储。
- 高效数据结构。
- 单线程命令执行减少锁竞争。
- IO 多路复用。
- 命令模型简单。

### 18.2 Redis 单线程为什么还能支持高并发？

Redis 命令执行主要是单线程，但网络 IO 使用事件驱动模型，可以高效处理大量连接。由于数据在内存中，大多数命令执行很快，因此单线程也能达到很高吞吐。

### 18.3 Redis 如何保证缓存与数据库一致性？

常见方案是先更新数据库，再删除缓存。删除失败时通过重试、消息队列或订阅数据库变更日志补偿。对于强一致要求高的业务，不应只依赖缓存方案，需要重新设计数据写入链路。

### 18.4 缓存穿透、击穿、雪崩区别？

| 问题 | 含义 | 解决方案 |
| --- | --- | --- |
| 穿透 | 查询不存在数据，每次打到数据库 | 缓存空值、参数校验、布隆过滤器 |
| 击穿 | 热点 Key 过期，大量请求打到数据库 | 互斥锁、逻辑过期、提前刷新 |
| 雪崩 | 大量 Key 同时过期或 Redis 故障 | 随机过期、多级缓存、限流降级、高可用 |

### 18.5 Redis 分布式锁如何实现？

基础方案：

```bash
SET lock:key unique-value NX EX 30
```

释放锁时使用 Lua 判断 Value 后删除。复杂场景使用 Redisson，并关注锁续期、锁超时、业务幂等和异常释放。

### 18.6 RDB 和 AOF 的区别？

| 对比项 | RDB | AOF |
| --- | --- | --- |
| 原理 | 快照 | 记录写命令 |
| 文件大小 | 较小 | 较大 |
| 恢复速度 | 较快 | 通常较慢 |
| 数据安全 | 可能丢失快照间数据 | 通常更安全 |
| 适合场景 | 备份、快速恢复 | 更高数据安全要求 |

---

## 19. 学习建议与练习任务

### 19.1 学习路线

建议按以下顺序学习：

1. 安装 Redis，熟悉 `redis-cli`。
2. 掌握 String、Hash、List、Set、Sorted Set。
3. 学会设置过期时间和设计 Key。
4. 使用 Spring Boot 连接 Redis。
5. 实现商品详情缓存。
6. 理解缓存穿透、击穿、雪崩。
7. 学习分布式锁。
8. 学习 RDB、AOF、主从、哨兵、集群。
9. 做性能排查：慢查询、大 Key、热 Key。

### 19.2 练习任务

任务 1：验证码缓存

- 保存手机号验证码。
- 设置 5 分钟过期。
- 校验后删除验证码。

任务 2：商品详情缓存

- 查询商品时先查 Redis。
- 未命中再查数据库。
- 数据库不存在时缓存空值 5 分钟。
- 正常商品缓存 30 分钟，并增加随机过期时间。

任务 3：文章点赞

- 使用 Set 保存点赞用户。
- 支持点赞、取消点赞、判断是否点赞、统计点赞数。

任务 4：排行榜

- 使用 Sorted Set 记录用户积分。
- 支持积分增加。
- 查询前 10 名。
- 查询某个用户排名。

任务 5：简单分布式锁

- 使用 `SET NX EX` 加锁。
- 使用 Lua 脚本释放锁。
- 模拟多个线程抢同一把锁。

任务 6：缓存问题演示

- 构造不存在 ID，观察缓存穿透。
- 构造热点 Key 过期，观察缓存击穿。
- 批量设置相同过期时间，观察缓存雪崩风险。

---

## 20. 总结

Redis 的核心价值是用高性能内存数据结构解决高频读写问题。实际项目中，Redis 最常见的定位是缓存和分布式协作工具，而不是主数据库。

学习 Redis 时不要只背命令，更要理解以下问题：

- 什么数据适合放进 Redis？
- Key 应该如何设计？
- 过期时间如何设置？
- 缓存和数据库如何保持尽量一致？
- 缓存穿透、击穿、雪崩如何处理？
- 分布式锁如何避免误删和死锁？
- Redis 出现慢查询、大 Key、热 Key 时如何排查？

掌握这些内容后，就可以在 Java Web、Spring Boot、微服务和高并发项目中比较稳妥地使用 Redis。
