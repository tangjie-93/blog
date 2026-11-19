# spring-boot-stage4-demo

阶段 4：Spring Boot 小白友好示例项目。

这个项目根据 `doc/阶段4：Spring Boot.md` 创建，重点演示：

- Spring Boot 启动类与自动配置
- `application.yml`、`application-dev.yml`、`application-prod.yml` 多环境配置
- Controller / Service / Repository 三层架构
- Entity / DTO / VO 的区别
- 统一响应 `Result<T>`
- 全局异常处理
- 参数校验 `@Valid`
- AOP 请求日志
- Actuator 健康检查
- Knife4j / OpenAPI 接口文档
- MySQL 版博客 API：用户注册/登录、文章 CRUD、评论

## 快速启动

先确认本机 MySQL 已启动，默认连接配置如下：

```text
url: jdbc:mysql://localhost:3306/stage4_blog
username: root
password: Jamestang93!
```

如果你的 MySQL 用户名或密码不同，可以通过环境变量覆盖：

```powershell
$env:DB_USERNAME="root"
$env:DB_PASSWORD="你的密码"
```

项目启动时会自动创建 `stage4_blog` 数据库、博客表结构和默认数据。

```bash
cd D:/personal/study/code/spring-boot-stage4-demo
mvn spring-boot:run
```

也可以用脚本同时启动前后端。脚本会先检查后端 `8080` 端口，如果已被占用，会自动改用 `8081`、`8082` 等后续可用端口：

```bash
cd D:\personal\study\code\spring-boot-stage4-demo
C:\Progra~1\Git\bin\bash.exe ./start-fullstack.sh
```

脚本不会生成日志文件，启动成功后会在终端突出显示可点击的前端和后端地址。
启动后请保持终端打开；需要停止前后端时按 `Ctrl+C`。

如果习惯使用 npm 命令，也可以在项目根目录执行：

```bash
npm run start
```

启动后访问：

- 首页：http://localhost:8080/stage4/
- 前端页面：http://localhost:5173/
- 接口文档：http://localhost:8080/stage4/doc.html
- Swagger UI：http://localhost:8080/stage4/swagger-ui.html
- 健康检查：http://localhost:8080/stage4/actuator/health

默认内置一个用户：

```text
username: admin
password: 123456
```

## 推荐阅读顺序

1. `pom.xml`：看 Spring Boot 项目需要哪些 starter。
2. `Stage4Application.java`：看项目入口。
3. `resources/application.yml`：看端口、路径、Profile、接口文档配置。
4. `controller`：看 HTTP 接口怎么写。
5. `service`：看业务逻辑放在哪里。
6. `repository`：看当前示例如何用 JDBC 连接 MySQL。
7. `common/Result.java` 和 `exception/GlobalExceptionHandler.java`：看统一响应和统一异常。
8. `config/RequestLogAspect.java`：看 AOP 日志。

## 目录结构

```text
src/main/java/com/example/stage4/
├── Stage4Application.java          启动类
├── common/                         通用响应、分页对象
├── config/                         全局配置、AOP、YAML 配置映射
├── controller/                     接收 HTTP 请求
├── dto/                            请求入参对象
├── entity/                         业务实体
├── exception/                      业务异常和全局异常处理
├── repository/                     数据访问层，当前默认使用 JDBC + MySQL
├── service/                        业务接口
├── service/impl/                   业务实现
└── vo/                             返回给前端的展示对象
```

## 常用接口

```bash
# 查看首页
curl http://localhost:8080/stage4/

# 用户列表
curl http://localhost:8080/stage4/api/users

# 登录
curl -X POST http://localhost:8080/stage4/api/users/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"123456\"}"

# 文章列表
curl http://localhost:8080/stage4/api/articles

# 创建文章
curl -X POST http://localhost:8080/stage4/api/articles \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"我的第一篇文章\",\"content\":\"Spring Boot 很适合入门后端。\",\"category\":\"Java\",\"tags\":[\"Spring Boot\",\"学习\"],\"authorId\":1}"

# 创建评论
curl -X POST http://localhost:8080/stage4/api/articles/1/comments \
  -H "Content-Type: application/json" \
  -d "{\"userId\":1,\"content\":\"这篇文章不错\"}"
```

## 后续练习方向

当前项目默认使用 MySQL 持久化数据。保留了内存 Repository 作为备用学习实现，如需临时切换到内存版，可用 `memory` profile 启动。

下一步可以按文档继续改造：

1. 用 MyBatis-Plus 或 JPA 替换当前 JDBC Repository。
2. 扩展 `src/main/resources/sql/blog-schema.sql`，增加更多业务表。
3. 用 Spring Security + JWT 替换示例 token。
4. 用 Redis 缓存文章详情或热门文章。
5. 给 Service 和 Controller 增加更多单元测试。
