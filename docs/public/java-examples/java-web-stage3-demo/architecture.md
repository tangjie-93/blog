# Java Web Stage3 项目架构说明

## 入口文件

`web.xml` 是整个项目的唯一入口。`mvn jetty:run` 启动后，Jetty 先读它。

---

## 启动阶段（项目启动时，只执行一次）

```
mvn jetty:run
  │
  ├─1. Jetty 启动，扫描整个项目
  │    ├─ 发现 @WebFilter("/*")      → 实例化 CorsFilter，拦截所有请求
  │    └─ 发现 @WebServlet("/servlet/hello") → 实例化 HelloServlet
  │
  ├─2. Jetty 读取 web.xml，看到 DispatcherServlet + load-on-startup=1
  │    │
  │    ├─3. DispatcherServlet 读取 contextConfigLocation = WebConfig
  │    │    │
  │    │    ├─4. WebConfig 上的 @ComponentScan("com.example.stage3") 开始扫描
  │    │    │    发现以下注解并实例化：
  │    │    │    ├─ @RestController    → HomeController, UserController
  │    │    │    ├─ @Repository       → MybatisUserDao（当前激活的实现）
  │    │    │    ├─ @Service          → UserServiceImpl
  │    │    │    ├─ @Aspect           → ServiceLogAspect  (AOP 切面)
  │    │    │    └─ @Configuration    → WebConfig 本身也是 Bean
  │    │    │
  │    │    ├─4.5 WebConfig 上的 @MapperScan("com.example.stage3.dao.mapper") 执行
  │    │    │    └─ 扫描 UserMapper 接口，生成 MyBatis 动态代理（基于 BaseMapper<User>）
  │    │    │
  │    │    ├─5. WebConfig 中的 @Bean 方法执行：
  │    │    │    ├─ dataSource()      → 创建 HikariCP 连接池（连接 test_db）
  │    │    │    └─ sqlSessionFactory() → 读取 mybatis-config.xml，构建 SqlSessionFactory
  │    │    │
  │    │    ├─6. Spring 注入链解析：
  │    │    │    ├─ UserController 构造函数需要 UserService
  │    │    │    ├─ UserServiceImpl 构造函数需要 UserDao
  │    │    │    ├─ UserDao 有两个实现：MybatisUserDao（@Repository 激活）、InMemoryUserDao（@Repository 注释掉）
  │    │    │    ├─ MybatisUserDao 构造函数需要 UserMapper
  │    │    │    ├─ UserMapper 是 MyBatis 代理（由 @MapperScan 创建）
  │    │    │    └─ → 注入链：UserController → UserServiceImpl → MybatisUserDao → UserMapper → SqlSessionFactory → DataSource → MySQL
  │    │    │
  │    │    └─7. WebConfig.addInterceptors() 注册 LogInterceptor + AuthInterceptor
  │    │
  │    └─8. 启动完成，监听 8081 端口
```

> **关键点**：`CorsFilter` 和 `HelloServlet` 是 Jetty 通过 `@WebFilter` / `@WebServlet` 扫描到并管理的，**不由 Spring 管理**。而 `Interceptor`、`Controller`、`Service`、`DAO`、`UserMapper` 是 Spring 通过 `@ComponentScan` + `@MapperScan` 扫描到的。

---

## 请求阶段（每次 HTTP 请求进来）

### 场景 A：访问 `/stage3/servlet/hello`（走原生 Servlet，绕开 Spring）

```
浏览器 GET /stage3/servlet/hello
  │
  ├─1. CorsFilter.doFilter()                         ← filter/CorsFilter.java
  │     ├─ 加 CORS 响应头（Access-Control-Allow-Origin: *）
  │     ├─ 不是 OPTIONS 请求 → chain.doFilter() 放行
  │     │
  ├─2. URL 匹配 @WebServlet("/servlet/hello")        ← servlet/HelloServlet.java
  │     └─ HelloServlet.doGet()
  │          └─ resp.getWriter().write(HTML字符串)    直接输出，不走 Spring
  │
  └─3. 浏览器收到 HTML
```

> **重点**：这个请求**完全绕过了 Spring MVC**，没有经过 DispatcherServlet、Interceptor、Controller。

### 场景 B：访问 `/stage3/api/users?page=1`（走完整 Spring MVC 链路，MySQL 版）

这是理解项目的核心链路，用一个具体请求串起所有文件夹：

```
浏览器 GET /stage3/api/users?page=1&size=10
  │
  │  ═══ Servlet 容器层面 ═══
  │
  ├─1. CorsFilter.doFilter()                         ← filter/CorsFilter.java
  │     ├─ 加 CORS 响应头
  │     └─ chain.doFilter() 放行
  │     │
  │     └─ CorsFilter 的职责到此结束，下面交给 DispatcherServlet
  │
  │  ═══ Spring MVC 层面 ═══
  │
  ├─2. DispatcherServlet 收到请求
  │     │
  ├─3. LogInterceptor.preHandle()                    ← interceptor/LogInterceptor.java
  │     ├─ request.setAttribute("startTime", 当前毫秒)
  │     └─ System.out.println("[MVC] GET /stage3/api/users")
  │     └─ return true（放行）
  │     │
  ├─4. AuthInterceptor.preHandle()                   ← interceptor/AuthInterceptor.java
  │     ├─ 不是 OPTIONS → 进入鉴权
  │     ├─ 检查 session.getAttribute("loginUser")？  没有
  │     ├─ 检查 request.getHeader("Authorization") 以 "Bearer " 开头？ 没有
  │     ├─ 两个都没有 → response.setStatus(401)
  │     └─ return false（拦截！不再往下走）
  │
  └─5. 浏览器收到 401 JSON
```

如果带了 `Authorization: Bearer demo-token`，AuthInterceptor 放行，继续往下：

```
  ├─4. AuthInterceptor 放行（有 Token 或已登录）
  │     │
  ├─5. DispatcherServlet 查 HandlerMapping
  │     ├─ URL = /api/users、方法 = GET
  │     └─ 匹配到 UserController.list()              ← controller/UserController.java
  │     │
  ├─6. UserController.list(page=1, size=10)
  │     └─ Result.success(userService.findByPage(1, 10))
  │                        │
  │                        ▼
  ├─7. UserServiceImpl.findByPage(1, 10)             ← service/impl/UserServiceImpl.java
  │     │                  ▲
  │     │  ┌───────────────┘
  │     │  │  AOP 织入！ServiceLogAspect 拦截：      ← support/ServiceLogAspect.java
  │     │  │    记录 start 时间
  │     │  │    → joinPoint.proceed() 执行真正的 findByPage
  │     │  │    执行完后打印 "cost XXms"
  │     │  │
  │     ├─8. List<User> users = userDao.findAll()    ← dao/MybatisUserDao.java
  │     │     └─ userMapper.selectList(null)          ← dao/mapper/UserMapper.java
  │     │        └─ MyBatis 生成 SQL：               ← 依据 model/User.java @TableName
  │     │             SELECT id,username,password,email,age,role,created_at,updated_at
  │     │             FROM users ORDER BY id DESC
  │     │             连接池来自 @Bean DataSource     ← config/WebConfig.java
  │     │             配置来自 mybatis-config.xml     ← resources/mybatis-config.xml
  │     │             表结构来自 stage3-schema.sql    ← resources/sql/stage3-schema.sql
  │     │
  │     └─9. 计算 fromIndex/toIndex，截取分页 → 返回 PageResult
  │                                         ← support/PageResult.java
  │
  ├─10. Controller 拿到 Service 返回结果
  │     └─ Result.success(pageResult)                ← support/Result.java
  │        返回：{code:200, message:"success", data:{list:[...], total:2}}
  │
  ├─11. DispatcherServlet 用 Jackson 把 Result 序列化为 JSON 字符串
  │     （Jackson 配置来自 WebConfig.configureMessageConverters）  ← config/WebConfig.java
  │
  ├─12. LogInterceptor.afterCompletion()             ← interceptor/LogInterceptor.java
  │     └─ System.out.println("[MVC] completed in 5ms, status=200")
  │
  └─13. JSON 响应发给浏览器
```

### 场景 C：注册请求 `POST /stage3/api/users/register`

```
POST /stage3/api/users/register
  Body: {"username":"test","password":"123","email":"a@b.com","age":25}
  │
  ├─ CorsFilter → DispatcherServlet → LogInterceptor
  │
  ├─ AuthInterceptor.preHandle()
  │     └─ URL 匹配 /api/users/register → excludePathPatterns 排除 → 放行！
  │       （注册和登录不需要鉴权，由 WebConfig.java 配置）
  │
  ├─ UserController.register(@Valid @RequestBody UserRequest request)
  │                           ← controller/UserController.java
  │     │
  │     ├─ @RequestBody → Jackson 把 JSON 字符串反序列化为 UserRequest 对象
  │     │                 ← dto/UserRequest.java
  │     │
  │     ├─ @Valid → 触发校验：
  │     │   ├─ username 是 @NotBlank  → 不能为空
  │     │   ├─ email 是 @NotBlank + @Email → 不能为空且格式正确
  │     │   └─ age 是 @NotNull + @Min(1) + @Max(120) → 1~120
  │     │   （校验器来自 WebConfig.getValidator() → config/WebConfig.java）
  │     │
  │     ├─ 如果校验失败 → 抛 MethodArgumentNotValidException
  │     │   └─ GlobalExceptionHandler.handleValidationException() 捕获
  │     │       ← exception/GlobalExceptionHandler.java
  │     │       └─ 返回 {code:400, message:"username: cannot be blank; ..."}
  │     │
  │     └─ 校验通过 → userService.create(request)
  │
  ├─ UserServiceImpl.create()                        ← service/impl/UserServiceImpl.java
  │     ├─ userDao.findByUsername("test") → 已存在？
  │     │   ├─ 存在 → throw new BusinessException(409, "username already exists")
  │     │   │   └─ GlobalExceptionHandler.handleBusinessException() 捕获
  │     │   │       ← exception/GlobalExceptionHandler.java
  │     │   │       └─ 返回 {code:409, message:"username already exists"}
  │     │   │
  │     │   └─ 不存在 → new User(null, "test", "123", "a@b.com", 25, "USER")
  │     │              ← model/User.java
  │     │
  │     └─ userDao.save(user)
  │          └─ MybatisUserDao: userMapper.insert(user)  ← dao/mapper/UserMapper.java
  │                MySQL 自增 ID 回填到 user.id
  │
  ├─ @ResponseStatus(HttpStatus.CREATED) → HTTP 状态码 201
  └─ Result.success("created", user)
       → Jackson 序列化 → JSON 返回
```

---

## 文件调用关系图（架构总览）

```
                    ┌─────────────────────────┐
                    │     web.xml (入口!)       │
                    │  DispatcherServlet        │
                    │  contextConfigLocation =  │
                    │  WebConfig                │
                    └───────────┬─────────────┘
                                │ 加载
                    ┌───────────▼─────────────┐
                    │    config/WebConfig      │
                    │  @ComponentScan          │
                    │  ("com.example.stage3")   │──── 扫描并实例化 ────┐
                    │  @MapperScan             │                      │
                    │  ("...dao.mapper")        │── @MapperScan ────┐ │
                    │  + addInterceptors()     │                    │ │
                    │  + @Bean dataSource()    │                    │ │
                    │  + @Bean sqlSessionFactory│                   │ │
                    └─────┬──────┬─────────────┘                   │ │
                          │      │ 注册                             │ │
        ┌─────────────────┘      └──────────────┐                  │ │
        ▼                                        ▼                  ▼ ▼
┌──────────────────┐              ┌──────────────────────┐   ┌───────────────────┐
│  interceptor/    │              │  Jetty 扫描层         │   │  Spring 扫描层    │
│  LogInterceptor  │              │  (Servlet 规范)       │   │  (@Component等)   │
│  AuthInterceptor │              │                      │   │                   │
└──────────────────┘              │  @WebFilter("/*")     │   │  @RestController  │
        │                         │    → CorsFilter      │   │    HomeController │
        │ 请求到达时执行           │                      │   │    UserController │
        │                         │  @WebServlet(        │   │       ↓ 构造注入  │
        │                         │    "/servlet/hello") │   │  @Service         │
        │                         │    → HelloServlet    │   │    UserServiceImpl│
        │                         │                      │   │       ↓ 构造注入  │
        │                         └──────────────────────┘   │  @Repository      │
        │                                                    │    MybatisUserDao │
        │                                                    │       ↓ 构造注入  │
        │                                                    │  UserMapper(代理) │
        │                                                    │       ↓ 配置      │
        │                                                    │  SqlSessionFactory│
        │                                                    │       ↓ 连接      │
        │                                                    │  DataSource(Hikari)│
        │                                                    │       ↓ TCP       │
        │                                                    │  MySQL (test_db)  │
        │                                                    │                   │
        │                                                    │  @Aspect          │
        │                                                    │    ServiceLog     │
        │                                                    │    Aspect         │
        │                                                    │                   │
        │                                                    │  model/User       │
        │                                                    │   (@TableName)    │
        └────────────┬───────────────────────────────────────┴───────────────────┘
                     │  所有请求都按这个顺序经过
                     ▼
        ┌────────────────────────────┐
        │  exception/                │
        │    GlobalExceptionHandler  │  ← 任何层抛异常，统一到这里处理
        │    BusinessException       │
        ├────────────────────────────┤
        │  support/                  │
        │    Result<T>               │  ← 所有返回都包装成统一 JSON
        │    PageResult<T>           │
        │    ServiceLogAspect        │  ← AOP 织入 Service 层
        ├────────────────────────────┤
        │  dto/                      │
        │    UserRequest(@Valid校验)  │  ← 前端传来的数据
        │    LoginRequest(@Valid校验) │
        ├────────────────────────────┤
        │  resources/                │
        │    mybatis-config.xml      │  ← MyBatis 全局配置
        │    sql/stage3-schema.sql   │  ← 数据库建表脚本
        └────────────────────────────┘
```

---

## 每个文件 "被谁调用、何时调用" 速查表

| 文件 | 被谁调用 | 何时调用 |
|------|---------|---------|
| **web.xml** | Jetty | **启动时**读一次，决定加载哪些 Servlet |
| **WebConfig.java** | DispatcherServlet | **启动时**通过 `web.xml` 指定加载，扫描所有 Spring Bean + 创建 DataSource/SqlSessionFactory |
| **mybatis-config.xml** | WebConfig.sqlSessionFactory() | **启动时**读取，配置驼峰映射 + SQL 日志 |
| **stage3-schema.sql** | DBA / 开发者手动执行 | **部署时**执行一次，创建 `users` 表 |
| **CorsFilter.java** | Jetty（`@WebFilter` 扫描到） | **每个请求**最先执行 |
| **HelloServlet.java** | Jetty（`@WebServlet` 扫描到） | 访问 `/servlet/hello` 时，绕过 Spring 直接执行 |
| **LogInterceptor.java** | WebConfig `addInterceptors()` 注册 | **每个 Spring 请求**，在 Controller 之前/后执行 |
| **AuthInterceptor.java** | WebConfig `addInterceptors()` 注册 | Spring 请求到 Controller 之前，检查登录状态 |
| **UserController.java** | DispatcherServlet（URL 路由匹配） | 匹配到 `/api/users/**` 时，调用对应方法 |
| **HomeController.java** | DispatcherServlet（URL 路由匹配） | 匹配到 `/` 时 |
| **UserServiceImpl.java** | UserController | Controller 每个方法都调用它 |
| **UserDao.java** | UserServiceImpl（类型声明） | Spring 注入时找到带 `@Repository` 的实现类 |
| **MybatisUserDao.java** | UserServiceImpl | MySQL 版 DAO，注入 UserMapper 操作数据库 |
| **InMemoryUserDao.java** | UserServiceImpl | 内存版 DAO（@Repository 当前注释掉，不生效） |
| **UserMapper.java** | MybatisUserDao | MyBatis-Plus 代理，继承 `BaseMapper<User>`，由 `@MapperScan` 创建 |
| **User.java** | MybatisUserDao / InMemoryUserDao / UserServiceImpl | 数据载体，`@TableName("users")` 映射数据库表 |
| **UserRequest.java** | UserController (`@RequestBody`) | 前端 JSON → Jackson 反序列化 → 校验 |
| **LoginRequest.java** | UserController.login() | 登录请求的 JSON 参数 |
| **Result.java** | Controller 的返回 | 每个 Controller 方法都包装成 Result |
| **PageResult.java** | UserServiceImpl.findByPage() | 分页查询结果的包装 |
| **ServiceLogAspect.java** | Spring AOP 自动织入 | Service 方法执行前后自动拦截 |
| **BusinessException.java** | UserServiceImpl（throw 抛出） | 业务异常（404/401/409） |
| **GlobalExceptionHandler.java** | Spring（`@RestControllerAdvice`） | 任何 Controller 抛异常都自动调用 |

---

## DAO 双实现切换

```
UserDao (接口)
  │
  ├── InMemoryUserDao (@Repository 注释掉时 → Spring 不管理)
  │     └─ ConcurrentHashMap + AtomicLong，零依赖
  │
  └── MybatisUserDao (@Repository 激活时 → Spring 注入)
        └─ UserMapper (BaseMapper<User>)
              └─ HikariCP → MySQL test_db.users
```

切换方式：只有一个类带 `@Repository` 注解，另一个注释掉。

---

## Filter vs Interceptor 对比

| | CorsFilter（Filter） | AuthInterceptor（Interceptor） |
|------|-----|-----|
| 管理层 | **Jetty/Servlet 容器** | **Spring MVC** |
| 扫描方式 | `@WebFilter` | WebConfig 中手动注册 |
| 作用范围 | **所有**请求（包括 Servlet） | 只对 **Spring 处理的请求**生效 |
| 执行时机 | DispatcherServlet 之前 | DispatcherServlet 之后、Controller 之前 |
| 适用场景 | 跨域、编码、安全过滤 | 鉴权、日志、权限控制 |

> 简单说：Filter 是 Servlet 层面的，比 Spring 更底层；Interceptor 是 Spring 层面的，能拿到 Spring 上下文信息。

---

## MyBatis 相关组件依赖链

```
WebConfig.java
  ├─ @MapperScan("...dao.mapper")
  │     └─ UserMapper.java  ← 空接口，继承 BaseMapper<User>
  │           └─ 自动实现：insert/selectById/selectList/updateById/deleteById...
  │
  ├─ @Bean dataSource()
  │     └─ HikariCP 连接池 → MySQL test_db
  │
  └─ @Bean sqlSessionFactory(dataSource)
        └─ 读取 mybatis-config.xml
              └─ mapUnderscoreToCamelCase=true（created_at → createdAt）
              └─ logImpl=STDOUT_LOGGING（打印 SQL）
```
