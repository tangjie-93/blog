# java-web-stage3-demo

传统 Spring MVC 全栈 Demo，从 Servlet → Filter → Interceptor → Controller → Service → AOP → DAO → MySQL，完整展示 Web 项目的标准分层架构。

DAO 层提供两种实现：**内存版**（`InMemoryUserDao`，零依赖直接跑）和 **MySQL 版**（`MybatisUserDao`，基于 MyBatis-Plus，持久化存储）。

## 快速启动

```bash
cd code/java-web-stage3-demo

# 内存版（无需数据库，直接启动）
mvn jetty:run

# MySQL 版（需要先建表）
mysql -u root -p test_db < src/main/resources/sql/stage3-schema.sql
mvn jetty:run
```

启动后访问：
- 首页：http://localhost:8081/stage3/
- 原生 Servlet：http://localhost:8081/stage3/servlet/hello
- API 接口：`/stage3/api/users/*`

## 请求处理链路

```
浏览器
  │
  ▼
web.xml ─► CorsFilter（@WebFilter，跨域处理）
  │
  ▼
DispatcherServlet（Spring MVC 前端控制器）
  │
  ▼
LogInterceptor.pre ─► AuthInterceptor.pre（鉴权）
  │
  ▼
Controller（@RestController）
  │
  ▼
Service（@Service）
  │ ◄── AOP: ServiceLogAspect 织入，记录耗时
  ▼
DAO — UserDao 接口
  │ ├── InMemoryUserDao（内存版，@PostConstruct 预置数据）
  │ └── MybatisUserDao（MySQL 版，基于 MyBatis-Plus）
  │
  ▼
Controller 返回 Result<T> ─► Jackson 序列化 ─► JSON
  │
  ▼
LogInterceptor.after（记录耗时 + 状态码）
  │
  ▼
浏览器收到 JSON
```

## 目录结构

```
src/main/java/com/example/stage3/
├── config/
│   └── WebConfig.java              Spring MVC + MyBatis 配置（扫描、拦截器、Jackson、校验、数据源）
├── controller/
│   ├── HomeController.java         首页 / 健康检查
│   └── UserController.java         用户 CRUD REST 接口（7 个端点）
├── dto/
│   ├── LoginRequest.java           登录入参（@NotBlank 校验）
│   └── UserRequest.java            注册/更新入参（@NotBlank/Email/Min/Max）
├── model/
│   └── User.java                   用户实体 POJO（@TableName 映射 users 表）
├── service/
│   ├── UserService.java            业务接口
│   └── impl/UserServiceImpl.java   业务实现（分页/注册/登录/全量更新/部分更新）
├── dao/
│   ├── UserDao.java                DAO 接口（5 个方法，面向接口编程）
│   ├── InMemoryUserDao.java        内存实现（ConcurrentHashMap + AtomicLong，启动即用）
│   ├── MybatisUserDao.java         MySQL 实现（注入 UserMapper，持久化存储）
│   └── mapper/
│       └── UserMapper.java          MyBatis-Plus 映射器（继承 BaseMapper<User>）
├── interceptor/
│   ├── LogInterceptor.java         请求日志 + 耗时统计
│   └── AuthInterceptor.java        登录鉴权（Session + Bearer Token）
├── filter/
│   └── CorsFilter.java             Servlet 跨域过滤器
├── exception/
│   ├── BusinessException.java      业务异常（带 HTTP 状态码）
│   └── GlobalExceptionHandler.java 全局异常捕获（@RestControllerAdvice）
├── servlet/
│   └── HelloServlet.java           原生 Servlet（对比 Spring MVC 写法）
└── support/
    ├── Result.java                 统一响应体 {code, message, data, timestamp}
    ├── PageResult.java             分页结果 {list, total, page, size, totalPages}
    └── ServiceLogAspect.java       AOP 切面（记录 Service 方法耗时）

src/main/resources/
├── mybatis-config.xml              MyBatis 全局配置（驼峰映射 + SQL 日志）
└── sql/
    └── stage3-schema.sql           MySQL 建表脚本（users 表）

src/main/webapp/WEB-INF/
└── web.xml                         Servlet 容器入口（启动 DispatcherServlet）
```

## 分层详解

### Servlet 层（纯 Java EE，不依赖 Spring）

| 文件 | 说明 |
|------|------|
| **HelloServlet** | `@WebServlet` 注册，`doGet` 直接输出 HTML，`doPost` 模拟 Session 登录 |
| **CorsFilter** | `@WebFilter("/*")` 拦截所有请求，添加 CORS 头，放行 OPTIONS |

> Filter 在 DispatcherServlet 之前执行，Interceptor 在 Controller 之前执行。

### Spring MVC + MyBatis 配置层

| 文件 | 关键内容 |
|------|----------|
| **WebConfig** | `@Configuration` + `@EnableWebMvc` + `@ComponentScan("com.example.stage3")` + `@MapperScan("com.example.stage3.dao.mapper")` + `@EnableAspectJAutoProxy` |
| **WebConfig.dataSource()** | `@Bean` 定义 HikariCP 连接池（MySQL `test_db`） |
| **WebConfig.sqlSessionFactory()** | `@Bean` 构建 MyBatis SqlSessionFactory |
| **mybatis-config.xml** | `mapUnderscoreToCamelCase=true` 驼峰映射 + SQL 日志 |
| **LogInterceptor** | 记录 URL + 耗时 + 状态码 |
| **AuthInterceptor** | Session 登录态 或 `Authorization: Bearer xxx` 两种鉴权方式 |

### Controller 层

| 端点 | 方法 | 说明 |
|------|------|------|
| `GET /` | Index | 健康检查 + API 列表 |
| `GET /api/users?page=1&size=10` | list | 分页查询 |
| `GET /api/users/{id}` | getById | 按 ID 查 |
| `POST /api/users/register` | register | 注册（201, `@Valid` 校验） |
| `POST /api/users/login` | login | 登录（Session 维持状态） |
| `PUT /api/users/{id}` | update | 全量更新 |
| `PATCH /api/users/{id}` | patch | 部分更新（只改传入字段） |
| `DELETE /api/users/{id}` | delete | 删除 |

### Service 层

`UserServiceImpl` 实现全部业务逻辑：

- `findByPage` — 全量取 → 截取分页 → 返回 `PageResult`
- `create` — 先校验用户名唯一，再保存
- `patch` — `Map.containsKey` 判断哪些字段需要更新
- `login` — 用户名不存在 / 密码错误 → `BusinessException(401)`

### DAO 层 — 接口 + 两种实现

接口 `UserDao` 定义 5 个方法，面向接口编程，Service 层只依赖接口：

```java
// UserServiceImpl 构造函数只依赖接口，不关心具体实现
public UserServiceImpl(UserDao userDao) { ... }
```

#### 内存版：InMemoryUserDao

| 特性 | 实现 |
|------|------|
| 存储 | `ConcurrentHashMap<Long, User>` |
| ID 生成 | `AtomicLong` 自增 |
| 初始化 | `@PostConstruct initData()` 预置 admin + demo |
| 优点 | 零依赖、零配置、直接启动 |
| 缺点 | 重启丢失数据 |

#### MySQL 版：MybatisUserDao

| 特性 | 实现 |
|------|------|
| 存储 | MySQL `test_db.users` 表 |
| ID 生成 | 数据库 `AUTO_INCREMENT` |
| 操作 | 注入 `UserMapper`（MyBatis-Plus `BaseMapper<User>`），5 个方法分别对应 `insert` / `selectById` / `selectList` / `updateById` / `deleteById` |
| 优点 | 数据持久化、支持并发、可扩展 |
| 缺点 | 需安装 MySQL + 建表 |

#### 如何切换

在 `WebConfig` 扫描到的实现中，确保只有一个加了 `@Repository`：
- 内存版：启用 `InMemoryUserDao` 的 `@Repository`，去掉 `MybatisUserDao` 的 `@Repository`
- MySQL 版：启用 `MybatisUserDao` 的 `@Repository`，去掉 `InMemoryUserDao` 的 `@Repository`

### 横切关注点

| 文件 | 作用 |
|------|------|
| **Result\<T\>** | 统一 JSON 响应：`{code, message, data, timestamp}` |
| **PageResult\<T\>** | 分页结果：`{list, total, page, size, totalPages}` |
| **BusinessException** | 业务异常（带 code，如 404/401/409） |
| **GlobalExceptionHandler** | `@RestControllerAdvice` 捕获三类异常 → 统一 JSON 错误响应 |
| **ServiceLogAspect** | `@Aspect` + `@Around`，拦截 Service 方法记录耗时 |

## 默认测试用户

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | admin123 | ADMIN |
| demo | demo123 | USER |

## 常见 API 调用示例

```bash
# 首页
curl http://localhost:8081/stage3/

# 注册
curl -X POST http://localhost:8081/stage3/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"123456","email":"test@test.com","age":25}'

# 登录
curl -X POST http://localhost:8081/stage3/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 分页查询（需鉴权）
curl http://localhost:8081/stage3/api/users?page=1 \
  -H "Authorization: Bearer demo-token"

# 部分更新
curl -X PATCH http://localhost:8081/stage3/api/users/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer demo-token" \
  -d '{"age":31}'
```

## 与 Spring Boot 的对比

| | 传统 Spring MVC（本项目） | Spring Boot |
|------|--------------------------|-------------|
| 入口 | `web.xml` + `DispatcherServlet` | `main()` + `@SpringBootApplication` |
| 配置 | 手动 `WebConfig` | 自动配置 + `application.yml` |
| 服务器 | 需 Jetty Maven Plugin | 内嵌 Tomcat，开箱即用 |
| Servlet | `@WebServlet` 手动注册 | 几乎不需要手写 |
| 依赖版本 | 手动管理 | `spring-boot-starter-*` 自动管理 |
| 数据源配置 | 手动 `@Bean` DataSource | `spring.datasource.url=...` 一行配置 |
| MyBatis 配置 | 手动 `@Bean` SqlSessionFactory | `mybatis-plus-boot-starter` 自动配置 |
