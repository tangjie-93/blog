---
title: 阶段四：Spring Boot
date: '2026-10-19'
type: 技术
tags: Java|Spring Boot
note: Spring Boot 配置、Web 开发、数据访问和工程实践。
---

# 阶段四：Spring Boot（2-3周）

> 现代Java开发的事实标准，类比前端从jQuery到React/Vue的进化。Spring Boot让Java开发变得简单高效，就像Vue/React让前端开发变得组件化、工程化一样。

---

## 4.1 Spring Boot核心（第1-7天）

### 4.1.1 Spring Boot概述

#### 什么是Spring Boot

Spring Boot是Pivotal团队提供的全新框架，其设计目的是**简化Spring应用的初始搭建和开发过程**。Spring Boot通过大量的默认配置，让开发者可以快速创建一个独立运行的、生产级别的Spring应用。

**与前端框架类比：**

| 前端演进 | Java后端演进 |
|---------|-------------|
| 原生JS → jQuery | 原生Servlet → Spring MVC |
| jQuery → Angular/React/Vue | Spring MVC → Spring Boot |
| 手动管理DOM → 声明式渲染 | 手动配置XML → 自动配置 |
| Webpack/Vite开箱即用 | Spring Boot开箱即用 |
| npm生态 | Maven/Gradle生态 |
| Vue CLI / Create React App | Spring Initializr |

#### Spring Boot核心优势

1. **自动配置**：根据引入的依赖自动配置Bean（类比Vue CLI自动配置Webpack）
2. **起步依赖**：简化Maven依赖配置（类比npm install一键安装）
3. **内嵌服务器**：无需部署到外部Tomcat（类比`npm run dev`自带开发服务器）
4. **Actuator**：生产级别的应用监控（类比前端性能监控）
5. **开箱即用**：零配置即可运行（类比Vue CLI `vue create` 即可开发）

### 4.1.2 创建第一个Spring Boot项目

#### 方式一：Spring Initializr（推荐）

访问 [https://start.spring.io](https://start.spring.io) 在线创建项目。

**配置选项：**
- **Project**：Maven（类比npm）或 Gradle
- **Language**：Java
- **Spring Boot**：3.2.x（最新稳定版）
- **Group**：com.example（类比npm的scope）
- **Artifact**：demo（类比npm的package name）
- **Packaging**：Jar
- **Java**：17

**Dependencies（类比npm dependencies）：**
- Spring Web
- Lombok
- Spring Boot DevTools
- Spring Boot Configuration Processor

#### 方式二：IDEA创建

1. File → New → Project
2. 选择 Spring Initializr
3. 按向导配置项目信息
4. 选择依赖

#### 方式三：命令行创建

```bash
# 使用curl调用Spring Initializr API
curl https://start.spring.io/starter.zip \
  -d type=maven-project \
  -d language=java \
  -d bootVersion=3.2.0 \
  -d baseDir=demo \
  -d groupId=com.example \
  -d artifactId=demo \
  -d name=demo \
  -d packageName=com.example.demo \
  -d javaVersion=17 \
  -d dependencies=web,lombok,devtools \
  -o demo.zip
```

### 4.1.3 项目结构解析

```
demo/
├── pom.xml                          # Maven配置（类比package.json）
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/example/demo/
│   │   │       ├── DemoApplication.java      # 启动类（入口文件）
│   │   │       ├── controller/               # 控制器层（类比前端路由处理）
│   │   │       ├── service/                  # 业务逻辑层（类比前端store/composable）
│   │   │       │   └── impl/
│   │   │       ├── mapper/                   # 数据访问层（类比前端API请求层）
│   │   │       ├── entity/                   # 实体类（类比前端TypeScript类型定义）
│   │   │       ├── dto/                      # 数据传输对象（类比前端请求/响应类型）
│   │   │       ├── vo/                       # 视图对象（类比前端页面展示数据）
│   │   │       ├── config/                   # 配置类（类比前端全局配置）
│   │   │       ├── common/                   # 公共模块（类比前端utils）
│   │   │       └── exception/                # 异常处理（类比前端错误边界）
│   │   └── resources/
│   │       ├── application.yml               # 主配置文件（类比.env）
│   │       ├── application-dev.yml           # 开发环境配置（类比.env.development）
│   │       ├── application-prod.yml          # 生产环境配置（类比.env.production）
│   │       ├── static/                       # 静态资源（类比public/）
│   │       ├── templates/                    # 模板文件
│   │       └── mapper/                       # MyBatis映射文件
│   └── test/
│       └── java/
│           └── com/example/demo/
│               └── DemoApplicationTests.java # 测试类
└── target/                                   # 编译输出（类比dist/）
```

**与前端项目结构对比：**

| 前端（Vue/React） | Spring Boot |
|-------------------|-------------|
| `package.json` | `pom.xml` |
| `src/main.js` | `DemoApplication.java` |
| `src/router/` | `controller/` |
| `src/store/` | `service/` |
| `src/api/` | `mapper/` |
| `src/types/` | `entity/` / `dto/` |
| `src/utils/` | `common/` |
| `.env` | `application.yml` |
| `.env.development` | `application-dev.yml` |
| `.env.production` | `application-prod.yml` |
| `public/` | `static/` |
| `dist/` | `target/` |

### 4.1.4 pom.xml核心配置

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <!-- 继承Spring Boot父项目（类比Vue CLI的预设配置） -->
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
        <relativePath/>
    </parent>

    <!-- 项目坐标 -->
    <groupId>com.example</groupId>
    <artifactId>demo</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>demo</name>
    <description>Demo project for Spring Boot</description>

    <!-- 属性配置（类比package.json的config字段） -->
    <properties>
        <java.version>17</java.version>
    </properties>

    <!-- 依赖管理（类比package.json的dependencies） -->
    <dependencies>
        <!-- Spring Boot Web Starter（包含Spring MVC + 内嵌Tomcat） -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- Lombok：简化代码（自动生成getter/setter等） -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>

        <!-- 热部署工具（修改代码自动重启，类比前端HMR） -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-devtools</artifactId>
            <scope>runtime</scope>
            <optional>true</optional>
        </dependency>

        <!-- 单元测试 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <!-- 构建配置 -->
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

### 4.1.5 启动类与自动配置原理

#### 启动类

```java
package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// 这是一个复合注解，包含以下三个注解：
// @Configuration：标识这是一个配置类（类比Vue的全局配置）
// @EnableAutoConfiguration：开启自动配置（核心！）
// @ComponentScan：组件扫描，扫描当前包及子包
@SpringBootApplication
public class DemoApplication {

    public static void main(String[] args) {
        // 启动Spring Boot应用（类比Vue的createApp().mount()）
        SpringApplication.run(DemoApplication.class, args);
    }
}
```

#### 自动配置原理详解

```
启动流程：
1. @SpringBootApplication
   └── @EnableAutoConfiguration
       └── @Import(AutoConfigurationImportSelector.class)
           └── 读取 META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports
               └── 加载所有自动配置类（如WebMvcAutoConfiguration、DataSourceAutoConfiguration等）
                   └── 每个自动配置类都有 @Conditional 条件注解
                       └── 根据classpath中的jar包和配置决定是否生效

举例：
- classpath中有Tomcat → 自动配置内嵌Tomcat
- classpath中有MySQL驱动 + 配置了数据源 → 自动配置DataSource
- classpath中有MyBatis → 自动配置SqlSessionFactory
```

**与前端对比理解：**

| 概念 | 前端类比 |
|------|---------|
| `@SpringBootApplication` | `createApp()` 创建应用实例 |
| `@EnableAutoConfiguration` | Vite/Webpack 自动识别文件类型并加载对应loader |
| `@ComponentScan` | Vite的 `import.meta.glob` 自动导入模块 |
| `@Conditional` | Vite插件的 `apply` 条件判断 |
| 自动配置类 | Vite/Webpack插件 |

#### 自定义自动配置示例

```java
// 1. 定义配置属性类
@Data
@ConfigurationProperties(prefix = "my.service")
public class MyServiceProperties {
    private String prefix = "[MyService]";
    private String suffix = "";
    private boolean enabled = true;
}

// 2. 定义服务类
public class MyService {
    private final MyServiceProperties properties;

    public MyService(MyServiceProperties properties) {
        this.properties = properties;
    }

    public String wrap(String message) {
        return properties.getPrefix() + message + properties.getSuffix();
    }
}

// 3. 定义自动配置类
@AutoConfiguration
@ConditionalOnClass(MyService.class)  // classpath中有这个类才生效
@EnableConfigurationProperties(MyServiceProperties.class)
public class MyServiceAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean  // 容器中没有这个Bean才创建
    public MyService myService(MyServiceProperties properties) {
        return new MyService(properties);
    }
}

// 4. 注册自动配置（在resources/META-INF/spring/目录下创建文件）
// 文件名：org.springframework.boot.autoconfigure.AutoConfiguration.imports
// 内容：com.example.demo.config.MyServiceAutoConfiguration
```

### 4.1.6 Starter依赖管理

#### 什么是Starter

Starter是Spring Boot的核心概念之一，它是一组预定义的依赖集合，类似于前端的"脚手架模板"或"预设配置包"。

**常见Starter一览：**

| Starter | 功能 | 前端类比 |
|---------|------|---------|
| `spring-boot-starter-web` | Web开发（Spring MVC + Tomcat） | Express.js |
| `spring-boot-starter-data-jpa` | JPA数据访问 | Prisma / TypeORM |
| `spring-boot-starter-data-redis` | Redis缓存 | ioredis |
| `spring-boot-starter-security` | 安全框架 | Passport.js |
| `spring-boot-starter-validation` | 参数校验 | Zod / Yup |
| `spring-boot-starter-test` | 测试（JUnit + Mockito） | Jest / Vitest |
| `spring-boot-starter-actuator` | 应用监控 | 前端性能监控 |
| `spring-boot-starter-aop` | 面向切面编程 | 前端拦截器 |
| `spring-boot-starter-mail` | 邮件发送 | Nodemailer |
| `spring-boot-starter-websocket` | WebSocket | Socket.io |

#### 自定义Starter

```xml
<!-- 自定义Starter的pom.xml -->
<project>
    <groupId>com.example</groupId>
    <artifactId>my-spring-boot-starter</artifactId>
    <version>1.0.0</version>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-autoconfigure</artifactId>
        </dependency>
    </dependencies>
</project>
```

```java
// 自动配置类
@AutoConfiguration
@EnableConfigurationProperties(MyStarterProperties.class)
public class MyStarterAutoConfiguration {

    @Bean
    @ConditionalOnProperty(prefix = "my.starter", name = "enabled", havingValue = "true", matchIfMissing = true)
    public MyComponent myComponent(MyStarterProperties properties) {
        return new MyComponent(properties);
    }
}
```

### 4.1.7 配置文件详解

#### application.properties vs application.yml

**application.properties（Properties格式）：**
```properties
# 服务器配置
server.port=8080
server.servlet.context-path=/api

# 数据源配置
spring.datasource.url=jdbc:mysql://localhost:3306/test_db
spring.datasource.username=root
spring.datasource.password=123456
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# MyBatis配置
mybatis.mapper-locations=classpath:mapper/*.xml
mybatis.type-aliases-package=com.example.demo.entity
```

**application.yml（YAML格式，推荐）：**
```yaml
# YAML使用缩进表示层级关系，更直观
server:
  port: 8080
  servlet:
    context-path: /api

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/test_db
    username: root
    password: 123456
    driver-class-name: com.mysql.cj.jdbc.Driver

mybatis:
  mapper-locations: classpath:mapper/*.xml
  type-aliases-package: com.example.demo.entity
```

**与前端配置对比：**

| 前端 | Spring Boot |
|------|-------------|
| `.env` 键值对 | `application.properties` |
| `vite.config.ts` 对象配置 | `application.yml` |
| `process.env.VITE_API_URL` | `@Value("${server.port}")` |
| `import.meta.env` | `@ConfigurationProperties` |

#### 自定义配置属性

```java
// 方式一：@Value注入单个属性（类比前端的process.env）
@RestController
public class ConfigController {

    @Value("${server.port}")
    private Integer port;

    @Value("${custom.message:Hello Default}")  // 带默认值
    private String message;

    @GetMapping("/config")
    public String getConfig() {
        return "Port: " + port + ", Message: " + message;
    }
}

// 方式二：@ConfigurationProperties批量注入（推荐，类比前端的配置对象）
@Data
@Component
@ConfigurationProperties(prefix = "app")
public class AppProperties {
    private String name;
    private String version;
    private String description;
    private Cors cors;
    private List<String> allowedOrigins;

    @Data
    public static class Cors {
        private boolean enabled;
        private String allowedMethods;
        private int maxAge;
    }
}
```

**对应的yml配置：**
```yaml
app:
  name: My Application
  version: 1.0.0
  description: A demo Spring Boot application
  cors:
    enabled: true
    allowed-methods: GET,POST,PUT,DELETE
    max-age: 3600
  allowed-origins:
    - http://localhost:3000
    - http://localhost:8080
```

#### 配置提示功能

```java
// 添加配置处理器依赖后，可以生成spring-configuration-metadata.json
// 在yml中编写配置时会有自动提示（类比TypeScript的类型提示）
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-configuration-processor</artifactId>
    <optional>true</optional>
</dependency>
```

### 4.1.8 Profile多环境管理

#### 配置文件命名规则

```
application.yml           # 主配置（公共配置）
application-dev.yml       # 开发环境
application-test.yml      # 测试环境
application-staging.yml   # 预发布环境
application-prod.yml      # 生产环境
```

#### 激活Profile的方式

```yaml
# 方式一：在application.yml中指定
spring:
  profiles:
    active: dev  # 激活dev环境
```

```bash
# 方式二：命令行参数
java -jar demo.jar --spring.profiles.active=prod

# 方式三：环境变量
export SPRING_PROFILES_ACTIVE=prod

# 方式四：JVM参数
java -Dspring.profiles.active=prod -jar demo.jar
```

#### 多环境配置示例

**application.yml（公共配置）：**
```yaml
spring:
  application:
    name: demo-app

# 公共的MyBatis配置
mybatis-plus:
  mapper-locations: classpath:mapper/*.xml
  type-aliases-package: com.example.demo.entity
  configuration:
    map-underscore-to-camel-case: true
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
```

**application-dev.yml（开发环境）：**
```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/test_db?useSSL=false&serverTimezone=Asia/Shanghai
    username: root
    password: 123456
  data:
    redis:
      host: localhost
      port: 6379

# 开发环境开启SQL日志
logging:
  level:
    com.example.demo: debug
    org.springframework.web: debug
```

**application-prod.yml（生产环境）：**
```yaml
server:
  port: 80
  compression:
    enabled: true
    mime-types: application/json,text/html

spring:
  datasource:
    url: jdbc:mysql://prod-db:3306/test_db?useSSL=true&serverTimezone=Asia/Shanghai
    username: ${DB_USERNAME}  # 使用环境变量，避免硬编码密码
    password: ${DB_PASSWORD}
  data:
    redis:
      host: prod-redis
      port: 6379
      password: ${REDIS_PASSWORD}

# 生产环境关闭SQL日志，只记录错误
logging:
  level:
    root: warn
    com.example.demo: info
```

#### 分组Profile（Spring Boot 2.4+）

```yaml
spring:
  profiles:
    active: dev
    group:
      # 可以将多个profile组合在一起
      local: dev,local-db,local-redis
      cloud: prod,cloud-db,cloud-redis
```

### 4.1.9 内嵌Web服务器

#### 切换内嵌服务器

Spring Boot支持三种内嵌Web服务器：
- **Tomcat**（默认，类比前端默认的Webpack Dev Server）
- **Jetty**（轻量级，适合长连接场景）
- **Undertow**（高性能，Red Hat开发）

```xml
<!-- 排除默认Tomcat，引入Undertow -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <exclusions>
        <exclusion>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-tomcat</artifactId>
        </exclusion>
    </exclusions>
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-undertow</artifactId>
</dependency>
```

#### 内嵌服务器配置

```yaml
server:
  port: 8080                          # 端口号
  servlet:
    context-path: /api                # 上下文路径
    session:
      timeout: 30m                    # Session超时时间
      cookie:
        http-only: true               # HttpOnly Cookie
        secure: true                  # 仅HTTPS传输
  compression:
    enabled: true                     # 开启Gzip压缩
    min-response-size: 1024           # 最小压缩大小
    mime-types:                       # 压缩类型
      - application/json
      - application/xml
      - text/html
      - text/plain
  tomcat:
    threads:
      max: 200                        # 最大工作线程数
      min-spare: 10                   # 最小空闲线程数
    max-connections: 8192             # 最大连接数
    accept-count: 100                 # 等待队列长度
    uri-encoding: UTF-8               # URI编码
```

### 4.1.10 第一个RESTful API

#### Hello World控制器

```java
package com.example.demo.controller;

import org.springframework.web.bind.annotation.*;

// @RestController = @Controller + @ResponseBody
// 表示这是一个REST控制器，所有方法返回值直接作为HTTP响应体
// 类比前端Express.js的Router
@RestController
@RequestMapping("/api")
public class HelloController {

    // GET请求（类比前端的路由GET处理）
    @GetMapping("/hello")
    public String hello(@RequestParam(defaultValue = "World") String name) {
        return "Hello, " + name + "!";
    }

    // 返回JSON对象（Spring Boot自动序列化）
    @GetMapping("/user")
    public User getUser() {
        return new User(1L, "张三", 25);
    }

    // POST请求（类比前端的fetch POST）
    @PostMapping("/user")
    public User createUser(@RequestBody User user) {
        // 处理创建逻辑
        user.setId(1L);
        return user;
    }

    // 路径变量（类比前端路由的 :id 参数）
    @GetMapping("/user/{id}")
    public User getUserById(@PathVariable Long id) {
        return new User(id, "张三", 25);
    }
}
```

#### 实体类

```java
package com.example.demo.entity;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data                   // 自动生成getter/setter/toString/equals/hashCode
@AllArgsConstructor     // 自动生成全参构造方法
@NoArgsConstructor      // 自动生成无参构造方法
public class User {
    private Long id;
    private String username;
    private Integer age;
}
```

#### 完整的CRUD控制器

```java
package com.example.demo.controller;

import com.example.demo.entity.User;
import com.example.demo.common.Result;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@RestController
@RequestMapping("/api/users")
public class UserController {

    // 模拟数据存储（实际项目中使用数据库）
    private final Map<Long, User> userStore = new ConcurrentHashMap<>();
    private final AtomicLong idGenerator = new AtomicLong(1);

    // 查询所有用户
    // GET /api/users
    @GetMapping
    public Result<List<User>> list() {
        List<User> users = List.copyOf(userStore.values());
        return Result.success(users);
    }

    // 根据ID查询
    // GET /api/users/1
    @GetMapping("/{id}")
    public Result<User> getById(@PathVariable Long id) {
        User user = userStore.get(id);
        if (user == null) {
            return Result.error(404, "用户不存在");
        }
        return Result.success(user);
    }

    // 创建用户
    // POST /api/users
    @PostMapping
    public Result<User> create(@RequestBody User user) {
        user.setId(idGenerator.getAndIncrement());
        userStore.put(user.getId(), user);
        return Result.success(user);
    }

    // 更新用户
    // PUT /api/users/1
    @PutMapping("/{id}")
    public Result<User> update(@PathVariable Long id, @RequestBody User user) {
        if (!userStore.containsKey(id)) {
            return Result.error(404, "用户不存在");
        }
        user.setId(id);
        userStore.put(id, user);
        return Result.success(user);
    }

    // 删除用户
    // DELETE /api/users/1
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        if (!userStore.containsKey(id)) {
            return Result.error(404, "用户不存在");
        }
        userStore.remove(id);
        return Result.success(null);
    }
}
```

#### 统一响应封装

```java
package com.example.demo.common;

import lombok.Data;

/**
 * 统一响应结果封装
 * 类比前端axios响应拦截器中的统一数据结构
 */
@Data
public class Result<T> {
    private int code;       // 状态码
    private String message; // 提示信息
    private T data;         // 数据

    public static <T> Result<T> success(T data) {
        Result<T> result = new Result<>();
        result.setCode(200);
        result.setMessage("success");
        result.setData(data);
        return result;
    }

    public static <T> Result<T> success() {
        return success(null);
    }

    public static <T> Result<T> error(int code, String message) {
        Result<T> result = new Result<>();
        result.setCode(code);
        result.setMessage(message);
        return result;
    }

    public static <T> Result<T> error(String message) {
        return error(500, message);
    }
}
```

### 4.1.11 分层架构详解

#### 标准三层架构

```
请求流程（类比前端数据流）：

HTTP请求 → Controller（路由层）→ Service（业务层）→ Mapper/DAO（数据层）→ 数据库
                                                                          ↓
HTTP响应 ← Controller（路由层）← Service（业务层）← Mapper/DAO（数据层）← 查询结果
```

**与前端对比：**

| 后端分层 | 前端类比 | 职责 |
|---------|---------|------|
| Controller | Router + API层 | 接收请求、参数校验、返回响应 |
| Service | Store/Composable | 业务逻辑处理 |
| Mapper/DAO | Axios请求层 | 数据库操作 |
| Entity | TypeScript Interface | 数据模型定义 |
| DTO | Request Type | 请求参数类型 |
| VO | Response Type | 响应数据类型 |

#### Controller层

```java
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor  // Lombok：自动生成包含所有final字段的构造方法
public class UserController {

    private final UserService userService;  // 依赖注入Service

    @GetMapping("/{id}")
    public Result<UserVO> getById(@PathVariable Long id) {
        UserVO user = userService.findById(id);
        return Result.success(user);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)  // 返回201状态码
    public Result<UserVO> create(@RequestBody @Valid UserCreateDTO dto) {
        UserVO user = userService.create(dto);
        return Result.success(user);
    }

    @PutMapping("/{id}")
    public Result<UserVO> update(@PathVariable Long id,
                                  @RequestBody @Valid UserUpdateDTO dto) {
        UserVO user = userService.update(id, dto);
        return Result.success(user);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        userService.delete(id);
        return Result.success();
    }

    @GetMapping
    public Result<PageResult<UserVO>> list(@Valid UserQueryDTO query) {
        PageResult<UserVO> page = userService.findByPage(query);
        return Result.success(page);
    }
}
```

#### Service层

```java
// 接口定义（面向接口编程，类比前端的TypeScript接口）
public interface UserService {
    UserVO findById(Long id);
    UserVO create(UserCreateDTO dto);
    UserVO update(Long id, UserUpdateDTO dto);
    void delete(Long id);
    PageResult<UserVO> findByPage(UserQueryDTO query);
}

// 实现类
@Service  // 标识为Spring Bean，会被自动注入到需要的地方
@RequiredArgsConstructor
@Slf4j    // Lombok：自动生成log变量
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;

    @Override
    public UserVO findById(Long id) {
        User user = userMapper.selectById(id);
        if (user == null) {
            throw new BusinessException(404, "用户不存在");
        }
        return convertToVO(user);
    }

    @Override
    @Transactional  // 声明式事务（类比前端的乐观锁/悲观锁更新）
    public UserVO create(UserCreateDTO dto) {
        // 检查用户名是否已存在
        User existing = userMapper.findByUsername(dto.getUsername());
        if (existing != null) {
            throw new BusinessException(400, "用户名已存在");
        }

        User user = new User();
        user.setUsername(dto.getUsername());
        user.setPassword(dto.getPassword());  // 实际应该加密
        user.setEmail(dto.getEmail());
        user.setAge(dto.getAge());

        userMapper.insert(user);
        log.info("创建用户成功，ID：{}", user.getId());

        return convertToVO(user);
    }

    @Override
    @Transactional
    public UserVO update(Long id, UserUpdateDTO dto) {
        User user = userMapper.selectById(id);
        if (user == null) {
            throw new BusinessException(404, "用户不存在");
        }

        // 只更新非空字段
        if (dto.getEmail() != null) {
            user.setEmail(dto.getEmail());
        }
        if (dto.getAge() != null) {
            user.setAge(dto.getAge());
        }

        userMapper.updateById(user);
        return convertToVO(user);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        User user = userMapper.selectById(id);
        if (user == null) {
            throw new BusinessException(404, "用户不存在");
        }
        userMapper.deleteById(id);
    }

    @Override
    public PageResult<UserVO> findByPage(UserQueryDTO query) {
        Page<User> page = new Page<>(query.getPageNum(), query.getPageSize());
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();

        if (query.getUsername() != null) {
            wrapper.like(User::getUsername, query.getUsername());
        }
        if (query.getMinAge() != null) {
            wrapper.ge(User::getAge, query.getMinAge());
        }

        Page<User> result = userMapper.selectPage(page, wrapper);

        List<UserVO> voList = result.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());

        return new PageResult<>(voList, result.getTotal());
    }

    // Entity → VO转换
    private UserVO convertToVO(User user) {
        UserVO vo = new UserVO();
        vo.setId(user.getId());
        vo.setUsername(user.getUsername());
        vo.setEmail(user.getEmail());
        vo.setAge(user.getAge());
        vo.setCreatedAt(user.getCreatedAt());
        return vo;
    }
}
```

#### DTO与VO定义

```java
// 创建用户DTO（请求参数）
@Data
public class UserCreateDTO {
    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 20, message = "用户名长度3-20")
    private String username;

    @NotBlank(message = "密码不能为空")
    @Size(min = 6, max = 50, message = "密码长度6-50")
    private String password;

    @Email(message = "邮箱格式不正确")
    private String email;

    @Min(value = 1, message = "年龄最小1岁")
    @Max(value = 150, message = "年龄最大150岁")
    private Integer age;
}

// 更新用户DTO
@Data
public class UserUpdateDTO {
    @Email(message = "邮箱格式不正确")
    private String email;

    @Min(value = 1, message = "年龄最小1岁")
    @Max(value = 150, message = "年龄最大150岁")
    private Integer age;
}

// 查询参数DTO
@Data
public class UserQueryDTO {
    private String username;
    private Integer minAge;
    private Integer maxAge;

    @Min(value = 1, message = "页码最小为1")
    private Integer pageNum = 1;

    @Min(value = 1, message = "每页条数最小为1")
    @Max(value = 100, message = "每页条数最大为100")
    private Integer pageSize = 10;
}

// 用户VO（返回给前端的数据，不包含密码等敏感信息）
@Data
public class UserVO {
    private Long id;
    private String username;
    private String email;
    private Integer age;
    private Date createdAt;
}

// 分页结果
@Data
@AllArgsConstructor
public class PageResult<T> {
    private List<T> list;
    private Long total;
}
```

---

## 4.2 常用集成（第8-14天）

### 4.2.1 Spring Boot + MyBatis

#### Maven依赖

```xml
<dependencies>
    <!-- Spring Boot MyBatis Starter -->
    <dependency>
        <groupId>org.mybatis.spring.boot</groupId>
        <artifactId>mybatis-spring-boot-starter</artifactId>
        <version>3.0.3</version>
    </dependency>

    <!-- MySQL驱动 -->
    <dependency>
        <groupId>com.mysql</groupId>
        <artifactId>mysql-connector-j</artifactId>
        <scope>runtime</scope>
    </dependency>

    <!-- 或使用MyBatis-Plus（推荐） -->
    <!--
    <dependency>
        <groupId>com.baomidou</groupId>
        <artifactId>mybatis-plus-spring-boot3-starter</artifactId>
        <version>3.5.5</version>
    </dependency>
    -->
</dependencies>
```

#### application.yml配置

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/test_db?useSSL=false&serverTimezone=Asia/Shanghai&characterEncoding=utf8mb4
    username: root
    password: 123456
    driver-class-name: com.mysql.cj.jdbc.Driver
    # HikariCP连接池配置
    hikari:
      minimum-idle: 5                     # 最小空闲连接
      maximum-pool-size: 15               # 最大连接数
      idle-timeout: 300000                # 空闲超时（5分钟）
      max-lifetime: 1800000               # 连接最大存活时间（30分钟）
      connection-timeout: 30000           # 连接超时（30秒）

mybatis:
  mapper-locations: classpath:mapper/*.xml    # Mapper XML位置
  type-aliases-package: com.example.demo.entity  # 实体类别名包
  configuration:
    map-underscore-to-camel-case: true        # 下划线转驼峰
    cache-enabled: true                       # 开启二级缓存
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl  # SQL日志
```

#### 实体类

```java
@Data
@TableName("users")  // MyBatis-Plus注解，指定表名
public class User {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String username;
    private String password;
    private String email;
    private Integer age;
    private Integer status;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
```

#### Mapper接口

```java
@Mapper  // 标识MyBatis Mapper接口
public interface UserMapper extends BaseMapper<User> {

    // 自定义查询方法（使用注解方式）
    @Select("SELECT * FROM users WHERE username = #{username}")
    User findByUsername(@Param("username") String username);

    // 复杂查询使用XML方式
    List<UserVO> findUserWithOrders(@Param("userId") Long userId);

    // 分页查询（MyBatis-Plus自带分页）
    Page<User> selectUserPage(Page<User> page, @Param("status") Integer status);
}
```

#### Mapper XML

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
    "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.example.demo.mapper.UserMapper">

    <!-- 关联查询：用户及其订单 -->
    <select id="findUserWithOrders" resultType="com.example.demo.vo.UserVO">
        SELECT
            u.id,
            u.username,
            u.email,
            u.age,
            COUNT(o.id) AS orderCount,
            IFNULL(SUM(o.amount), 0) AS totalAmount
        FROM users u
        LEFT JOIN orders o ON u.id = o.user_id
        WHERE u.id = #{userId}
        GROUP BY u.id
    </select>

    <!-- 分页查询 -->
    <select id="selectUserPage" resultType="com.example.demo.entity.User">
        SELECT * FROM users
        <where>
            <if test="status != null">
                AND status = #{status}
            </if>
        </where>
        ORDER BY created_at DESC
    </select>

</mapper>
```

#### MyBatis-Plus分页配置

```java
@Configuration
public class MybatisPlusConfig {

    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        // 分页插件
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));
        return interceptor;
    }
}
```

#### 使用分页

```java
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;

    public PageResult<UserVO> findByPage(int pageNum, int pageSize) {
        // 创建分页对象
        Page<User> page = new Page<>(pageNum, pageSize);

        // 执行分页查询
        Page<User> result = userMapper.selectPage(page, null);

        // 转换VO
        List<UserVO> voList = result.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());

        return new PageResult<>(voList, result.getTotal());
    }
}
```

### 4.2.2 Spring Boot + Redis（缓存）

#### 什么是Redis

Redis是一个高性能的键值对数据库，常用于缓存、会话管理、消息队列等场景。

**与前端对比：**

| Redis概念 | 前端类比 |
|-----------|---------|
| Key-Value存储 | `localStorage` / `sessionStorage` |
| Hash | JavaScript Object |
| List | Array |
| Set | JavaScript Set |
| TTL（过期时间） | `setTimeout` 清理缓存 |
| 缓存穿透 | 前端请求穿透缓存直达后端 |

#### Maven依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>

<!-- 连接池（可选） -->
<dependency>
    <groupId>org.apache.commons</groupId>
    <artifactId>commons-pool2</artifactId>
</dependency>
```

#### application.yml配置

```yaml
spring:
  data:
    redis:
      host: localhost
      port: 6379
      password:           # 无密码留空
      database: 0         # 数据库索引（0-15）
      timeout: 5000ms     # 连接超时
      lettuce:
        pool:
          max-active: 8       # 最大连接数
          max-idle: 8         # 最大空闲连接
          min-idle: 0         # 最小空闲连接
          max-wait: -1ms      # 连接等待超时
```

#### Redis配置类

```java
@Configuration
public class RedisConfig {

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(factory);

        // Key使用String序列化
        template.setKeySerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());

        // Value使用JSON序列化
        GenericJackson2JsonRedisSerializer jsonSerializer =
                new GenericJackson2JsonRedisSerializer();
        template.setValueSerializer(jsonSerializer);
        template.setHashValueSerializer(jsonSerializer);

        template.afterPropertiesSet();
        return template;
    }
}
```

#### Redis工具类

```java
@Component
@RequiredArgsConstructor
public class RedisUtils {

    private final StringRedisTemplate stringRedisTemplate;

    // ==================== String操作 ====================

    // 设置值
    public void set(String key, Object value) {
        stringRedisTemplate.opsForValue().set(key, JSON.toJSONString(value));
    }

    // 设置值并指定过期时间
    public void set(String key, Object value, long timeout, TimeUnit unit) {
        stringRedisTemplate.opsForValue().set(key, JSON.toJSONString(value), timeout, unit);
    }

    // 设置值并指定过期时间（秒）
    public void setExpire(String key, Object value, long seconds) {
        set(key, value, seconds, TimeUnit.SECONDS);
    }

    // 获取值
    public <T> T get(String key, Class<T> clazz) {
        String json = stringRedisTemplate.opsForValue().get(key);
        if (json == null) {
            return null;
        }
        return JSON.parseObject(json, clazz);
    }

    // 删除
    public Boolean delete(String key) {
        return stringRedisTemplate.delete(key);
    }

    // 判断key是否存在
    public Boolean hasKey(String key) {
        return stringRedisTemplate.hasKey(key);
    }

    // 设置过期时间
    public Boolean expire(String key, long timeout, TimeUnit unit) {
        return stringRedisTemplate.expire(key, timeout, unit);
    }

    // 自增
    public Long increment(String key) {
        return stringRedisTemplate.opsForValue().increment(key);
    }

    // ==================== Hash操作 ====================

    public void hSet(String key, String field, Object value) {
        stringRedisTemplate.opsForHash().put(key, field, JSON.toJSONString(value));
    }

    public <T> T hGet(String key, String field, Class<T> clazz) {
        Object value = stringRedisTemplate.opsForHash().get(key, field);
        if (value == null) {
            return null;
        }
        return JSON.parseObject(value.toString(), clazz);
    }

    public <T> Map<String, T> hGetAll(String key, Class<T> clazz) {
        Map<Object, Object> entries = stringRedisTemplate.opsForHash().entries(key);
        Map<String, T> result = new HashMap<>();
        entries.forEach((k, v) ->
                result.put(k.toString(), JSON.parseObject(v.toString(), clazz)));
        return result;
    }

    // ==================== List操作 ====================

    public void lPush(String key, Object value) {
        stringRedisTemplate.opsForList().leftPush(key, JSON.toJSONString(value));
    }

    public <T> List<T> lRange(String key, long start, long end, Class<T> clazz) {
        List<String> list = stringRedisTemplate.opsForList().range(key, start, end);
        if (list == null) {
            return Collections.emptyList();
        }
        return list.stream()
                .map(s -> JSON.parseObject(s, clazz))
                .collect(Collectors.toList());
    }
}
```

#### 使用Spring Cache注解（推荐方式）

```java
@Configuration
@EnableCaching  // 开启缓存支持
public class CacheConfig {

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory factory) {
        // 配置缓存序列化
        GenericJackson2JsonRedisSerializer jsonSerializer =
                new GenericJackson2JsonRedisSerializer();

        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(30))  // 默认缓存30分钟
                .serializeKeysWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(jsonSerializer))
                .disableCachingNullValues();  // 不缓存null值

        return RedisCacheManager.builder(factory)
                .cacheDefaults(config)
                .build();
    }
}
```

```java
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;

    // @Cacheable：先查缓存，缓存没有再查数据库，结果存入缓存
    @Cacheable(value = "user", key = "#id")
    @Override
    public UserVO findById(Long id) {
        log.info("查询用户，ID：{}（从数据库查询）", id);
        User user = userMapper.selectById(id);
        if (user == null) {
            throw new BusinessException(404, "用户不存在");
        }
        return convertToVO(user);
    }

    // @CachePut：更新数据库，同时更新缓存
    @CachePut(value = "user", key = "#id")
    @Override
    public UserVO update(Long id, UserUpdateDTO dto) {
        User user = userMapper.selectById(id);
        if (user == null) {
            throw new BusinessException(404, "用户不存在");
        }
        if (dto.getEmail() != null) {
            user.setEmail(dto.getEmail());
        }
        userMapper.updateById(user);
        return convertToVO(user);
    }

    // @CacheEvict：删除缓存
    @CacheEvict(value = "user", key = "#id")
    @Override
    public void delete(Long id) {
        userMapper.deleteById(id);
        log.info("删除用户及缓存，ID：{}", id);
    }

    // 自定义缓存key
    @Cacheable(value = "user", key = "'username:' + #username")
    public UserVO findByUsername(String username) {
        User user = userMapper.findByUsername(username);
        if (user == null) {
            throw new BusinessException(404, "用户不存在");
        }
        return convertToVO(user);
    }

    // 清除整个user命名空间的缓存
    @CacheEvict(value = "user", allEntries = true)
    public void clearAllCache() {
        log.info("清除所有用户缓存");
    }
}
```

#### 缓存常见问题处理

```java
// 缓存穿透：查询不存在的数据，每次都穿透到数据库
// 解决方案：缓存空值
@Cacheable(value = "user", key = "#id", condition = "#id != null")
public UserVO findById(Long id) {
    User user = userMapper.selectById(id);
    if (user == null) {
        // 缓存空值，设置较短的过期时间
        // 使用@CachePut缓存一个特殊标记
        throw new BusinessException(404, "用户不存在");
    }
    return convertToVO(user);
}

// 缓存雪崩：大量缓存同时过期
// 解决方案：给过期时间加随机值
@Bean
public RedisCacheManager cacheManager(RedisConnectionFactory factory) {
    RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(30 + new Random().nextInt(10)));
    // ...
}

// 缓存击穿：热点key过期，大量请求同时打到数据库
// 解决方案：使用分布式锁
@Cacheable(value = "hotUser", key = "#id")
public UserVO findHotUser(Long id) {
    // 配合Redisson等分布式锁框架使用
    return convertToVO(userMapper.selectById(id));
}
```

### 4.2.3 Spring Boot + 文件上传/下载

#### Maven依赖

```xml
<!-- 文件上传已包含在spring-boot-starter-web中 -->
```

#### application.yml配置

```yaml
spring:
  servlet:
    multipart:
      max-file-size: 10MB           # 单个文件最大大小
      max-request-size: 50MB        # 请求最大大小
      enabled: true

# 自定义文件上传配置
file:
  upload-path: D:/uploads/          # 文件上传目录
  allowed-types:                    # 允许的文件类型
    - image/jpeg
    - image/png
    - image/gif
    - application/pdf
  max-size: 10485760                # 10MB
```

#### 文件上传控制器

```java
@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Slf4j
public class FileController {

    @Value("${file.upload-path}")
    private String uploadPath;

    // 单文件上传
    // 前端：const formData = new FormData(); formData.append('file', file);
    @PostMapping("/upload")
    public Result<FileVO> upload(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return Result.error(400, "文件不能为空");
        }

        try {
            // 生成唯一文件名
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String newFilename = UUID.randomUUID().toString().replace("-", "") + extension;

            // 按日期分目录存储
            String datePath = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
            String dirPath = uploadPath + datePath;

            // 创建目录
            File dir = new File(dirPath);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            // 保存文件
            File destFile = new File(dirPath + "/" + newFilename);
            file.transferTo(destFile);

            // 返回文件信息
            FileVO fileVO = new FileVO();
            fileVO.setOriginalName(originalFilename);
            fileVO.setNewName(newFilename);
            fileVO.setPath(datePath + "/" + newFilename);
            fileVO.setSize(file.getSize());
            fileVO.setType(file.getContentType());
            fileVO.setUrl("/api/files/" + datePath + "/" + newFilename);

            log.info("文件上传成功：{}", originalFilename);
            return Result.success(fileVO);

        } catch (IOException e) {
            log.error("文件上传失败", e);
            return Result.error(500, "文件上传失败");
        }
    }

    // 多文件上传
    @PostMapping("/upload/batch")
    public Result<List<FileVO>> uploadBatch(@RequestParam("files") MultipartFile[] files) {
        List<FileVO> fileList = new ArrayList<>();
        for (MultipartFile file : files) {
            Result<FileVO> result = upload(file);
            if (result.getCode() == 200) {
                fileList.add(result.getData());
            }
        }
        return Result.success(fileList);
    }

    // 文件下载
    @GetMapping("/{datePath}/{filename}")
    public ResponseEntity<Resource> download(
            @PathVariable String datePath,
            @PathVariable String filename) {

        try {
            Path filePath = Paths.get(uploadPath, datePath, filename);
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            // 获取文件名（处理中文编码）
            String originalName = filename;
            String encodedName = URLEncoder.encode(originalName, StandardCharsets.UTF_8);

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename*=UTF-8''" + encodedName)
                    .body(resource);

        } catch (Exception e) {
            log.error("文件下载失败", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // 文件预览（直接返回，不下载）
    @GetMapping("/preview/{datePath}/{filename}")
    public ResponseEntity<Resource> preview(
            @PathVariable String datePath,
            @PathVariable String filename) {

        try {
            Path filePath = Paths.get(uploadPath, datePath, filename);
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            // 根据文件类型设置Content-Type
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(resource);

        } catch (Exception e) {
            log.error("文件预览失败", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
```

#### 文件VO

```java
@Data
public class FileVO {
    private String originalName;  // 原始文件名
    private String newName;       // 新文件名
    private String path;          // 存储路径
    private Long size;            // 文件大小（字节）
    private String type;          // 文件MIME类型
    private String url;           // 访问URL
}
```

#### 前端上传示例（Vue）

```vue
<template>
  <div>
    <input type="file" @change="handleFileChange" />
    <button @click="handleUpload" :disabled="uploading">
      {{ uploading ? '上传中...' : '上传' }}
    </button>
    <div v-if="progress > 0">上传进度：{{ progress }}%</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const file = ref(null)
const uploading = ref(false)
const progress = ref(0)

const handleFileChange = (e) => {
  file.value = e.target.files[0]
}

const handleUpload = async () => {
  if (!file.value) return

  uploading.value = true
  const formData = new FormData()
  formData.append('file', file.value)

  try {
    const { data } = await axios.post('/api/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        progress.value = Math.round((e.loaded / e.total) * 100)
      }
    })
    console.log('上传成功', data)
  } catch (error) {
    console.error('上传失败', error)
  } finally {
    uploading.value = false
  }
}
</script>
```

### 4.2.4 Spring Boot + 日志（Logback/Log4j2）

#### 日志框架对比

| 特性 | Logback（默认） | Log4j2 |
|------|----------------|--------|
| 性能 | 高 | 更高（异步日志） |
| 配置 | XML/YAML | XML/JSON/YAML |
| 默认集成 | Spring Boot默认 | 需手动切换 |
| 适用场景 | 一般应用 | 高并发应用 |

#### 使用Lombok简化日志

```java
@Slf4j  // Lombok自动生成log变量
@RestController
public class UserController {

    @GetMapping("/users/{id}")
    public Result<UserVO> getById(@PathVariable Long id) {
        // 日志级别：TRACE < DEBUG < INFO < WARN < ERROR
        log.trace("这是TRACE日志，最详细");
        log.debug("查询用户，ID：{}", id);  // 使用占位符，性能更好
        log.info("开始处理用户查询请求");
        log.warn("用户年龄超过100岁，请确认");
        log.error("查询用户失败，ID：{}", id);

        // 记录异常堆栈
        try {
            // 业务逻辑
        } catch (Exception e) {
            log.error("处理异常", e);  // 第二个参数传异常对象
        }

        return Result.success(null);
    }
}
```

#### Logback配置（logback-spring.xml）

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>

    <!-- 从Spring配置中读取属性 -->
    <springProperty scope="context" name="APP_NAME" source="spring.application.name"/>

    <!-- 日志输出路径 -->
    <property name="LOG_PATH" value="./logs"/>
    <property name="LOG_PATTERN" value="%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n"/>

    <!-- 控制台输出（开发环境） -->
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>${LOG_PATTERN}</pattern>
            <charset>UTF-8</charset>
        </encoder>
    </appender>

    <!-- 文件输出（所有级别） -->
    <appender name="FILE_ALL" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${LOG_PATH}/all.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
            <fileNamePattern>${LOG_PATH}/all.%d{yyyy-MM-dd}.%i.log</fileNamePattern>
            <maxFileSize>50MB</maxFileSize>
            <maxHistory>30</maxHistory>
            <totalSizeCap>1GB</totalSizeCap>
        </rollingPolicy>
        <encoder>
            <pattern>${LOG_PATTERN}</pattern>
            <charset>UTF-8</charset>
        </encoder>
    </appender>

    <!-- 文件输出（仅ERROR级别） -->
    <appender name="FILE_ERROR" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${LOG_PATH}/error.log</file>
        <filter class="ch.qos.logback.classic.filter.LevelFilter">
            <level>ERROR</level>
            <onMatch>ACCEPT</onMatch>
            <onMismatch>DENY</onMismatch>
        </filter>
        <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
            <fileNamePattern>${LOG_PATH}/error.%d{yyyy-MM-dd}.%i.log</fileNamePattern>
            <maxFileSize>50MB</maxFileSize>
            <maxHistory>30</maxHistory>
        </rollingPolicy>
        <encoder>
            <pattern>${LOG_PATTERN}</pattern>
            <charset>UTF-8</charset>
        </encoder>
    </appender>

    <!-- 开发环境：只输出到控制台 -->
    <springProfile name="dev">
        <root level="INFO">
            <appender-ref ref="CONSOLE"/>
        </root>
        <!-- 自定义包路径的日志级别 -->
        <logger name="com.example.demo" level="DEBUG"/>
    </springProfile>

    <!-- 生产环境：输出到文件 -->
    <springProfile name="prod">
        <root level="WARN">
            <appender-ref ref="FILE_ALL"/>
            <appender-ref ref="FILE_ERROR"/>
        </root>
        <logger name="com.example.demo" level="INFO"/>
    </springProfile>

</configuration>
```

#### application.yml中的日志配置

```yaml
logging:
  level:
    root: info                          # 根日志级别
    com.example.demo: debug             # 项目日志级别
    org.springframework.web: info       # Spring Web日志级别
    com.baomidou.mybatisplus: debug     # MyBatis-Plus日志级别
  pattern:
    console: "%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n"
    file: "%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n"
  file:
    name: logs/app.log                  # 日志文件名
    max-size: 50MB                      # 单个文件最大大小
    max-history: 30                     # 保留天数
```

### 4.2.5 Spring Boot + 单元测试（JUnit 5 + Mockito）

#### Maven依赖

```xml
<!-- spring-boot-starter-test已包含以下依赖： -->
<!-- JUnit 5：测试框架 -->
<!-- Mockito：Mock框架 -->
<!-- AssertJ：流式断言 -->
<!-- Hamcrest：匹配器 -->
<!-- JsonPath：JSON断言 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
```

#### JUnit 5基础测试

```java
// 基础单元测试（不启动Spring容器）
class UserServiceTest {

    private UserService userService;
    private UserMapper userMapper;

    @BeforeEach  // 每个测试方法执行前（类比beforeEach）
    void setUp() {
        userMapper = Mockito.mock(UserMapper.class);
        userService = new UserServiceImpl(userMapper);
    }

    @Test  // 测试方法（类比it/test）
    void testFindById_Success() {
        // Given（准备测试数据，类比Arrange）
        Long userId = 1L;
        User mockUser = new User();
        mockUser.setId(userId);
        mockUser.setUsername("张三");
        mockUser.setEmail("zhangsan@example.com");
        mockUser.setAge(25);

        // 配置Mock行为（类比jest.fn().mockReturnValue()）
        when(userMapper.selectById(userId)).thenReturn(mockUser);

        // When（执行被测方法，类比Act）
        UserVO result = userService.findById(userId);

        // Then（验证结果，类比Assert/Expect）
        assertNotNull(result);
        assertEquals(userId, result.getId());
        assertEquals("张三", result.getUsername());
        assertEquals("zhangsan@example.com", result.getEmail());

        // 验证Mock方法被调用
        verify(userMapper, times(1)).selectById(userId);
    }

    @Test
    void testFindById_NotFound() {
        // Given
        Long userId = 999L;
        when(userMapper.selectById(userId)).thenReturn(null);

        // When & Then
        BusinessException exception = assertThrows(BusinessException.class, () -> {
            userService.findById(userId);
        });

        assertEquals(404, exception.getCode());
        assertEquals("用户不存在", exception.getMessage());
    }

    @Test
    void testCreate_Success() {
        // Given
        UserCreateDTO dto = new UserCreateDTO();
        dto.setUsername("新用户");
        dto.setPassword("123456");
        dto.setEmail("new@example.com");
        dto.setAge(20);

        when(userMapper.findByUsername("新用户")).thenReturn(null);
        when(userMapper.insert(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(100L);  // 模拟自增ID
            return 1;
        });

        // When
        UserVO result = userService.create(dto);

        // Then
        assertNotNull(result);
        assertEquals("新用户", result.getUsername());
        verify(userMapper).insert(any(User.class));
    }

    @Test
    @DisplayName("测试用户名重复时抛出异常")  // 测试描述
    void testCreate_DuplicateUsername() {
        // Given
        UserCreateDTO dto = new UserCreateDTO();
        dto.setUsername("已存在用户");
        dto.setPassword("123456");

        User existingUser = new User();
        existingUser.setUsername("已存在用户");
        when(userMapper.findByUsername("已存在用户")).thenReturn(existingUser);

        // When & Then
        assertThrows(BusinessException.class, () -> userService.create(dto));
    }

    @ParameterizedTest  // 参数化测试
    @ValueSource(strings = {"", "  ", "ab"})  // 多组参数
    @DisplayName("用户名长度校验")
    void testUsernameValidation(String username) {
        UserCreateDTO dto = new UserCreateDTO();
        dto.setUsername(username);
        dto.setPassword("123456");

        assertThrows(BusinessException.class, () -> userService.create(dto));
    }
}
```

#### Spring Boot集成测试

```java
// 启动Spring容器的集成测试
@SpringBootTest
@AutoConfigureMockMvc  // 自动配置MockMvc
@Transactional         // 测试完成后自动回滚数据库
class UserControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;  // 模拟HTTP请求

    @Autowired
    private ObjectMapper objectMapper;  // JSON序列化

    @Test
    void testGetUserById() throws Exception {
        mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.username").value("张三"))
                .andExpect(jsonPath("$.data.email").exists());
    }

    @Test
    void testCreateUser() throws Exception {
        UserCreateDTO dto = new UserCreateDTO();
        dto.setUsername("testuser");
        dto.setPassword("123456");
        dto.setEmail("test@example.com");
        dto.setAge(25);

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.username").value("testuser"))
                .andExpect(jsonPath("$.data.id").exists());
    }

    @Test
    void testCreateUser_InvalidData() throws Exception {
        UserCreateDTO dto = new UserCreateDTO();
        dto.setUsername("");  // 空用户名
        dto.setPassword("123");  // 密码太短

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));
    }

    @Test
    void testUpdateUser() throws Exception {
        UserUpdateDTO dto = new UserUpdateDTO();
        dto.setEmail("updated@example.com");
        dto.setAge(30);

        mockMvc.perform(put("/api/users/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value("updated@example.com"))
                .andExpect(jsonPath("$.data.age").value(30));
    }

    @Test
    void testDeleteUser() throws Exception {
        mockMvc.perform(delete("/api/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    void testListUsers_WithPagination() throws Exception {
        mockMvc.perform(get("/api/users")
                        .param("pageNum", "1")
                        .param("pageSize", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.list").isArray())
                .andExpect(jsonPath("$.data.total").isNumber());
    }
}
```

#### Mock测试（使用Mockito）

```java
// 使用Mockito进行单元测试
@ExtendWith(MockitoExtension.class)  // JUnit 5扩展
class OrderServiceTest {

    @Mock  // 自动创建Mock对象
    private OrderMapper orderMapper;

    @Mock
    private UserMapper userMapper;

    @Mock
    private ProductMapper productMapper;

    @InjectMocks  // 自动注入Mock对象到被测对象
    private OrderServiceImpl orderService;

    @Test
    void testCreateOrder() {
        // Given
        User mockUser = new User();
        mockUser.setId(1L);
        mockUser.setUsername("张三");

        Product mockProduct = new Product();
        mockProduct.setId(1L);
        mockProduct.setName("Java编程思想");
        mockProduct.setPrice(new BigDecimal("99.00"));
        mockProduct.setStock(100);

        when(userMapper.selectById(1L)).thenReturn(mockUser);
        when(productMapper.selectById(1L)).thenReturn(mockProduct);
        when(orderMapper.insert(any(Order.class))).thenReturn(1);

        // 使用ArgumentCaptor捕获参数
        ArgumentCaptor<Order> orderCaptor = ArgumentCaptor.forClass(Order.class);

        // When
        OrderVO result = orderService.createOrder(1L, 1L, 2);

        // Then
        verify(orderMapper).insert(orderCaptor.capture());
        Order capturedOrder = orderCaptor.getValue();
        assertEquals(1L, capturedOrder.getUserId());
        assertEquals(new BigDecimal("198.00"), capturedOrder.getAmount());
    }

    // 使用verify验证交互
    @Test
    void testVerifyInteraction() {
        // When
        orderService.createOrder(1L, 1L, 1);

        // Then - 验证方法调用
        verify(userMapper).selectById(1L);
        verify(productMapper).selectById(1L);
        verify(orderMapper).insert(any(Order.class));

        // 验证没有更多交互
        verifyNoMoreInteractions(userMapper, productMapper);
    }
}
```

---

## 4.3 安全框架（第15-19天）

### 4.3.1 Spring Security核心概念

#### 什么是Spring Security

Spring Security是一个功能强大且可高度自定义的身份验证和授权框架。它是保护Spring应用程序安全的标准。

**与前端安全概念对比：**

| Spring Security | 前端类比 |
|----------------|---------|
| Authentication（认证） | 登录验证（用户名密码校验） |
| Authorization（授权） | 路由守卫（判断是否有权限访问） |
| SecurityContext | 前端全局状态中的用户信息 |
| SecurityFilterChain | Express中间件链 / Axios拦截器 |
| JWT Token | localStorage中的token |
| RBAC | 前端角色权限菜单控制 |
| CSRF Token | 表单防重复提交的token |

#### 核心架构

```
请求 → SecurityFilterChain（过滤器链）
       ├── UsernamePasswordAuthenticationFilter（用户名密码认证）
       ├── BasicAuthenticationFilter（Basic认证）
       ├── BearerTokenAuthenticationFilter（JWT/Bearer Token认证）
       ├── ExceptionTranslationFilter（异常处理）
       └── FilterSecurityInterceptor（授权检查）
           ↓
       通过 → Controller
       拒绝 → 403 Forbidden
       未认证 → 401 Unauthorized
```

### 4.3.2 Maven依赖

```xml
<dependencies>
    <!-- Spring Security -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>

    <!-- JWT -->
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.12.3</version>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-impl</artifactId>
        <version>0.12.3</version>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-jackson</artifactId>
        <version>0.12.3</version>
        <scope>runtime</scope>
    </dependency>
</dependencies>
```

### 4.3.3 基础配置

```java
@Configuration
@EnableWebSecurity  // 启用Web安全
@EnableMethodSecurity  // 启用方法级安全（@PreAuthorize等）
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 禁用CSRF（前后端分离项目通常禁用）
            .csrf(csrf -> csrf.disable())
            // 配置跨域
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // 配置请求授权
            .authorizeHttpRequests(auth -> auth
                // 放行登录、注册接口
                .requestMatchers("/api/auth/**").permitAll()
                // 放行Swagger文档
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                // 放行静态资源
                .requestMatchers("/static/**", "/favicon.ico").permitAll()
                // 管理员接口需要ADMIN角色
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                // 其他所有请求需要认证
                .anyRequest().authenticated()
            )
            // 禁用Session（使用JWT无需Session）
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            // 添加JWT过滤器
            .addFilterBefore(jwtAuthenticationFilter(),
                UsernamePasswordAuthenticationFilter.class)
            // 配置异常处理
            .exceptionHandling(exceptions -> exceptions
                // 未认证处理（401）
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setContentType("application/json;charset=UTF-8");
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write(
                        "{\"code\":401,\"message\":\"未登录或token已过期\"}");
                })
                // 未授权处理（403）
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setContentType("application/json;charset=UTF-8");
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.getWriter().write(
                        "{\"code\":403,\"message\":\"权限不足\"}");
                })
            );

        return http.build();
    }

    // 密码编码器
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();  // BCrypt加密
    }

    // 认证管理器
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    // CORS配置
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:3000"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
```

### 4.3.4 认证与授权

#### 用户实体与权限模型

```java
// 用户实体
@Data
@TableName("sys_user")
public class SysUser {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String username;
    private String password;
    private String nickname;
    private String email;
    private Integer status;  // 0-禁用，1-启用
    private LocalDateTime createdAt;
}

// 角色实体
@Data
@TableName("sys_role")
public class SysRole {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String roleCode;   // 角色编码：ROLE_ADMIN, ROLE_USER
    private String roleName;   // 角色名称：管理员，普通用户
}

// 权限实体
@Data
@TableName("sys_permission")
public class SysPermission {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String permCode;    // 权限编码：user:list, user:create
    private String permName;    // 权限名称：用户列表，创建用户
    private String url;         // 对应URL
    private String method;      // HTTP方法
}

// 用户-角色关联表
@Data
@TableName("sys_user_role")
public class SysUserRole {
    private Long userId;
    private Long roleId;
}

// 角色-权限关联表
@Data
@TableName("sys_role_permission")
public class SysRolePermission {
    private Long roleId;
    private Long permissionId;
}
```

#### UserDetailsService实现

```java
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final SysUserMapper userMapper;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // 1. 查询用户
        SysUser user = userMapper.findByUsername(username);
        if (user == null) {
            throw new UsernameNotFoundException("用户不存在：" + username);
        }

        // 2. 检查用户状态
        if (user.getStatus() == 0) {
            throw new DisabledException("用户已被禁用");
        }

        // 3. 查询用户角色和权限
        List<String> roles = userMapper.findRolesByUserId(user.getId());
        List<String> permissions = userMapper.findPermissionsByUserId(user.getId());

        // 4. 构建 authorities（角色和权限）
        List<GrantedAuthority> authorities = new ArrayList<>();
        roles.forEach(role ->
            authorities.add(new SimpleGrantedAuthority(role)));
        permissions.forEach(perm ->
            authorities.add(new SimpleGrantedAuthority(perm)));

        // 5. 返回Spring Security的UserDetails
        return new LoginUser(user, authorities);
    }
}
```

#### 自定义LoginUser

```java
@Data
@AllArgsConstructor
public class LoginUser implements UserDetails {

    private final SysUser user;
    private final Collection<? extends GrantedAuthority> authorities;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getUsername();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return user.getStatus() == 1;
    }
}
```

### 4.3.5 JWT集成

#### JWT工具类

```java
@Component
public class JwtUtils {

    // 密钥（生产环境应该使用配置文件或环境变量）
    @Value("${jwt.secret}")
    private String secret;

    // 过期时间（毫秒）
    @Value("${jwt.expiration:86400000}")  // 默认24小时
    private long expiration;

    // 生成密钥对象
    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // 生成Token
    public String generateToken(LoginUser loginUser) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", loginUser.getUser().getId());
        claims.put("username", loginUser.getUsername());

        return Jwts.builder()
                .claims(claims)
                .subject(loginUser.getUsername())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }

    // 从Token中获取用户名
    public String getUsernameFromToken(String token) {
        return parseToken(token).getSubject();
    }

    // 从Token中获取用户ID
    public Long getUserIdFromToken(String token) {
        return parseToken(token).get("userId", Long.class);
    }

    // 验证Token
    public boolean validateToken(String token) {
        try {
            parseToken(token);
            return !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }

    // 判断Token是否过期
    private boolean isTokenExpired(String token) {
        return parseToken(token).getExpiration().before(new Date());
    }

    // 解析Token
    private Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
```

#### JWT认证过滤器

```java
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                     HttpServletResponse response,
                                     FilterChain filterChain)
            throws ServletException, IOException {

        // 1. 从请求头获取Token
        String authHeader = request.getHeader("Authorization");

        // 2. 检查Token格式（Bearer xxx）
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3. 提取Token
        String token = authHeader.substring(7);

        // 4. 验证Token
        if (!jwtUtils.validateToken(token)) {
            filterChain.doFilter(request, response);
            return;
        }

        // 5. 获取用户名
        String username = jwtUtils.getUsernameFromToken(token);

        // 6. 检查是否已经认证
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            // 7. 加载用户信息
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            // 8. 创建认证对象并放入SecurityContext
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());

            // 将用户信息存入Token的details中（方便后续获取）
            authentication.setDetails(
                    new WebAuthenticationDetailsSource().buildDetails(request));

            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        // 9. 继续过滤器链
        filterChain.doFilter(request, response);
    }
}
```

#### 认证控制器

```java
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserService userService;

    // 登录
    @PostMapping("/login")
    public Result<LoginVO> login(@RequestBody @Valid LoginDTO dto) {
        // 1. 认证
        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(
                        dto.getUsername(), dto.getPassword());

        Authentication authentication = authenticationManager.authenticate(authToken);

        // 2. 生成JWT
        LoginUser loginUser = (LoginUser) authentication.getPrincipal();
        String token = jwtUtils.generateToken(loginUser);

        // 3. 返回结果
        LoginVO vo = new LoginVO();
        vo.setToken(token);
        vo.setUsername(loginUser.getUsername());
        vo.setNickname(loginUser.getUser().getNickname());

        return Result.success(vo);
    }

    // 注册
    @PostMapping("/register")
    public Result<Void> register(@RequestBody @Valid RegisterDTO dto) {
        userService.register(dto);
        return Result.success();
    }

    // 获取当前用户信息
    @GetMapping("/me")
    public Result<UserInfoVO> getCurrentUser() {
        LoginUser loginUser = getCurrentLoginUser();
        UserInfoVO vo = new UserInfoVO();
        vo.setId(loginUser.getUser().getId());
        vo.setUsername(loginUser.getUsername());
        vo.setNickname(loginUser.getUser().getNickname());
        vo.setRoles(loginUser.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(a -> a.startsWith("ROLE_"))
                .collect(Collectors.toList()));
        vo.setPermissions(loginUser.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(a -> !a.startsWith("ROLE_"))
                .collect(Collectors.toList()));
        return Result.success(vo);
    }

    // 获取当前登录用户
    public static LoginUser getCurrentLoginUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BusinessException(401, "未登录");
        }
        return (LoginUser) authentication.getPrincipal();
    }
}
```

#### 相关DTO和VO

```java
@Data
public class LoginDTO {
    @NotBlank(message = "用户名不能为空")
    private String username;

    @NotBlank(message = "密码不能为空")
    private String password;
}

@Data
public class RegisterDTO {
    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 20)
    private String username;

    @NotBlank(message = "密码不能为空")
    @Size(min = 6, max = 50)
    private String password;

    private String nickname;
    private String email;
}

@Data
public class LoginVO {
    private String token;
    private String username;
    private String nickname;
}

@Data
public class UserInfoVO {
    private Long id;
    private String username;
    private String nickname;
    private List<String> roles;
    private List<String> permissions;
}
```

#### JWT配置

```yaml
jwt:
  secret: Y2hhbmdlLXRoaXMtdG8tYS1sb25nLXNlY3VyZS1rZXktaW4tcHJvZHVjdGlvbi1lbnZpcm9ubWVudA==
  expiration: 86400000  # 24小时（毫秒）
```

### 4.3.6 OAuth2.0

#### OAuth2.0核心概念

```
OAuth2.0授权流程（类比前端第三方登录）：

1. 用户在客户端点击"使用GitHub登录"
2. 客户端重定向到GitHub授权页面
3. 用户在GitHub页面同意授权
4. GitHub重定向回客户端，携带授权码（code）
5. 客户端用授权码换取访问令牌（access_token）
6. 客户端用令牌获取用户信息

角色：
- Resource Owner（资源所有者）：用户
- Client（客户端）：你的应用
- Authorization Server（授权服务器）：GitHub/Google等
- Resource Server（资源服务器）：GitHub API等
```

#### Spring Boot OAuth2 Client配置

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-oauth2-client</artifactId>
</dependency>
```

```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          github:
            client-id: ${GITHUB_CLIENT_ID}
            client-secret: ${GITHUB_CLIENT_SECRET}
            scope: user:email,read:user
          google:
            client-id: ${GOOGLE_CLIENT_ID}
            client-secret: ${GOOGLE_CLIENT_SECRET}
            scope: profile,email
        provider:
          github:
            authorization-uri: https://github.com/login/oauth/authorize
            token-uri: https://github.com/login/oauth/access_token
            user-info-uri: https://api.github.com/user
```

### 4.3.7 权限控制（RBAC模型）

#### RBAC模型说明

```
RBAC（Role-Based Access Control）基于角色的访问控制：

用户（User） ←→ 角色（Role） ←→ 权限（Permission）

关系：
- 一个用户可以有多个角色（多对多）
- 一个角色可以有多个权限（多对多）
- 用户通过角色间接获得权限

示例：
- 用户张三 → [管理员] → [用户管理, 订单管理, 系统设置]
- 用户李四 → [普通用户] → [查看订单, 个人信息]
- 用户王五 → [管理员, 运营] → [用户管理, 订单管理, 数据分析]
```

#### 方法级权限控制

```java
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    // 需要ADMIN角色
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/users")
    public Result<List<UserVO>> listUsers() {
        return Result.success(userService.findAll());
    }

    // 需要user:delete权限
    @PreAuthorize("hasAuthority('user:delete')")
    @DeleteMapping("/users/{id}")
    public Result<Void> deleteUser(@PathVariable Long id) {
        userService.delete(id);
        return Result.success();
    }

    // 需要ADMIN或MODERATOR角色
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR')")
    @GetMapping("/reports")
    public Result<ReportVO> getReport() {
        return Result.success(reportService.generate());
    }

    // 自定义权限表达式
    @PreAuthorize("@permissionService.canAccess(#userId)")
    @GetMapping("/users/{userId}/detail")
    public Result<UserDetailVO> getUserDetail(@PathVariable Long userId) {
        return Result.success(userService.findDetail(userId));
    }
}
```

#### 自定义权限服务

```java
@Service("permissionService")
@RequiredArgsConstructor
public class PermissionService {

    private final UserMapper userMapper;

    /**
     * 判断当前用户是否可以访问指定用户的数据
     * 规则：管理员可以访问所有，普通用户只能访问自己的
     */
    public boolean canAccess(Long userId) {
        LoginUser loginUser = AuthController.getCurrentLoginUser();
        Long currentUserId = loginUser.getUser().getId();

        // 管理员可以访问所有
        boolean isAdmin = loginUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        return isAdmin || currentUserId.equals(userId);
    }
}
```

#### 权限注解说明

| 注解 | 说明 | 示例 |
|------|------|------|
| `@PreAuthorize` | 方法执行前检查权限 | `@PreAuthorize("hasRole('ADMIN')")` |
| `@PostAuthorize` | 方法执行后检查权限 | `@PostAuthorize("returnObject.owner == authentication.name")` |
| `@PreFilter` | 过滤方法参数集合 | `@PreFilter("filterObject.owner == authentication.name")` |
| `@PostFilter` | 过滤方法返回集合 | `@PostFilter("filterObject.owner == authentication.name")` |
| `@Secured` | 简单的角色检查 | `@Secured("ROLE_ADMIN")` |

**常用表达式：**

| 表达式 | 说明 |
|--------|------|
| `hasRole('ADMIN')` | 拥有ADMIN角色 |
| `hasAnyRole('ADMIN', 'USER')` | 拥有任一角色 |
| `hasAuthority('user:list')` | 拥有指定权限 |
| `hasAnyAuthority('user:list', 'user:create')` | 拥有任一权限 |
| `authenticated` | 已认证 |
| `permitAll` | 允许所有 |
| `denyAll` | 拒绝所有 |
| `#userId == authentication.principal.id` | 自定义条件 |

### 4.3.8 全局异常处理

```java
@RestControllerAdvice  // 全局异常处理（类比前端的全局错误处理）
@Slf4j
public class GlobalExceptionHandler {

    // 处理业务异常
    @ExceptionHandler(BusinessException.class)
    public Result<Void> handleBusinessException(BusinessException e) {
        log.warn("业务异常：{}", e.getMessage());
        return Result.error(e.getCode(), e.getMessage());
    }

    // 处理参数校验异常
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result<Map<String, String>> handleValidationException(
            MethodArgumentNotValidException e) {
        Map<String, String> errors = new HashMap<>();
        e.getBindingResult().getFieldErrors()
                .forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));
        log.warn("参数校验失败：{}", errors);
        return Result.error(400, "参数校验失败");
    }

    // 处理Spring Security认证异常
    @ExceptionHandler(AuthenticationException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public Result<Void> handleAuthenticationException(AuthenticationException e) {
        return Result.error(401, e.getMessage());
    }

    // 处理权限不足异常
    @ExceptionHandler(AccessDeniedException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public Result<Void> handleAccessDeniedException(AccessDeniedException e) {
        return Result.error(403, "权限不足");
    }

    // 处理所有未捕获的异常
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public Result<Void> handleException(Exception e) {
        log.error("系统异常", e);
        return Result.error(500, "系统内部错误");
    }
}
```

---

## 4.4 接口文档（第20-21天）

### 4.4.1 Swagger/OpenAPI 3

#### 什么是Swagger

Swagger（现更名为OpenAPI）是RESTful API的标准文档规范。类比前端的Storybook或组件文档工具。

**与前端文档工具对比：**

| 后端 | 前端 |
|------|------|
| Swagger/OpenAPI | Storybook |
| 自动生成API文档 | 自动生成组件文档 |
| 在线测试接口 | 在线预览组件 |
| 生成客户端SDK | 生成TypeScript类型 |

#### Maven依赖

```xml
<!-- SpringDoc OpenAPI 3（推荐，Spring Boot 3.x使用） -->
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.3.0</version>
</dependency>
```

#### application.yml配置

```yaml
springdoc:
  api-docs:
    enabled: true
    path: /v3/api-docs          # API文档JSON路径
  swagger-ui:
    enabled: true
    path: /swagger-ui.html      # Swagger UI路径
    tags-sorter: alpha          # 标签排序
    operations-sorter: alpha    # 接口排序
  default-produces-media-type: application/json
  default-consumes-media-type: application/json
```

#### OpenAPI全局配置

```java
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new io.swagger.v3.oas.models.info.Info()
                        .title("Demo API文档")
                        .version("1.0.0")
                        .description("Spring Boot Demo项目的API文档")
                        .contact(new io.swagger.v3.oas.models.info.Contact()
                                .name("开发团队")
                                .email("dev@example.com"))
                        .license(new io.swagger.v3.oas.models.info.License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0")))
                .addSecurityItem(new SecurityRequirement().addList("Bearer"))
                .components(new Components()
                        .addSecuritySchemes("Bearer",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("JWT认证")));
    }
}
```

#### 控制器注解

```java
@Tag(name = "用户管理", description = "用户CRUD操作接口")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @Operation(summary = "查询用户列表", description = "支持分页和条件查询")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "查询成功"),
            @ApiResponse(responseCode = "400", description = "参数错误")
    })
    @GetMapping
    public Result<PageResult<UserVO>> list(
            @Parameter(description = "查询参数") @Valid UserQueryDTO query) {
        return Result.success(userService.findByPage(query));
    }

    @Operation(summary = "根据ID查询用户")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "查询成功"),
            @ApiResponse(responseCode = "404", description = "用户不存在")
    })
    @GetMapping("/{id}")
    public Result<UserVO> getById(
            @Parameter(description = "用户ID", required = true)
            @PathVariable Long id) {
        return Result.success(userService.findById(id));
    }

    @Operation(summary = "创建用户")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "创建成功"),
            @ApiResponse(responseCode = "400", description = "参数错误"),
            @ApiResponse(responseCode = "409", description = "用户名已存在")
    })
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Result<UserVO> create(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "用户创建信息", required = true)
            @RequestBody @Valid UserCreateDTO dto) {
        return Result.success(userService.create(dto));
    }

    @Operation(summary = "更新用户")
    @PutMapping("/{id}")
    public Result<UserVO> update(
            @Parameter(description = "用户ID") @PathVariable Long id,
            @RequestBody @Valid UserUpdateDTO dto) {
        return Result.success(userService.update(id, dto));
    }

    @Operation(summary = "删除用户")
    @DeleteMapping("/{id}")
    public Result<Void> delete(
            @Parameter(description = "用户ID") @PathVariable Long id) {
        userService.delete(id);
        return Result.success();
    }
}
```

#### DTO注解

```java
@Schema(description = "用户创建请求")
@Data
public class UserCreateDTO {

    @Schema(description = "用户名", example = "zhangsan", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 20, message = "用户名长度3-20")
    private String username;

    @Schema(description = "密码", example = "123456", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "密码不能为空")
    @Size(min = 6, max = 50, message = "密码长度6-50")
    private String password;

    @Schema(description = "邮箱", example = "zhangsan@example.com")
    @Email(message = "邮箱格式不正确")
    private String email;

    @Schema(description = "年龄", example = "25", minimum = "1", maximum = "150")
    @Min(value = 1, message = "年龄最小1岁")
    @Max(value = 150, message = "年龄最大150岁")
    private Integer age;
}

@Schema(description = "用户信息")
@Data
public class UserVO {

    @Schema(description = "用户ID", example = "1")
    private Long id;

    @Schema(description = "用户名", example = "zhangsan")
    private String username;

    @Schema(description = "邮箱", example = "zhangsan@example.com")
    private String email;

    @Schema(description = "年龄", example = "25")
    private Integer age;

    @Schema(description = "创建时间")
    private LocalDateTime createdAt;
}
```

### 4.4.2 Knife4j（增强UI）

#### 什么是Knife4j

Knife4j是Swagger的增强UI，提供了更美观、更易用的接口文档界面。类比前端从原生HTML到Element UI的升级。

#### Maven依赖

```xml
<!-- 替换springdoc-openapi-starter-webmvc-ui -->
<dependency>
    <groupId>com.github.xiaoymin</groupId>
    <artifactId>knife4j-openapi3-jakarta-spring-boot-starter</artifactId>
    <version>4.3.0</version>
</dependency>
```

#### application.yml配置

```yaml
# Knife4j配置
springdoc:
  swagger-ui:
    path: /swagger-ui.html
    tags-sorter: alpha
    operations-sorter: alpha
  api-docs:
    path: /v3/api-docs

# Knife4j增强配置
knife4j:
  enable: true
  setting:
    language: zh_cn           # 中文界面
    enable-swagger-models: true
    enable-document: true
    enable-host: true
    enable-host-annotation: true
  basic:
    enable: true              # 开启Basic认证
    username: admin            # 文档访问用户名
    password: 123456           # 文档访问密码
  openapi:
    title: Demo API文档
    description: Spring Boot Demo项目的API文档
    version: 1.0.0
    group:
      default:
        api-rule: package
        api-rule-resources:
          - com.example.demo.controller
```

#### Knife4j分组配置

```java
@Configuration
public class Knife4jConfig {

    @Bean
    public GroupedOpenApi userApi() {
        return GroupedOpenApi.builder()
                .group("1-用户管理")
                .pathsToMatch("/api/users/**")
                .build();
    }

    @Bean
    public GroupedOpenApi orderApi() {
        return GroupedOpenApi.builder()
                .group("2-订单管理")
                .pathsToMatch("/api/orders/**")
                .build();
    }

    @Bean
    public GroupedOpenApi authApi() {
        return GroupedOpenApi.builder()
                .group("3-认证授权")
                .pathsToMatch("/api/auth/**")
                .build();
    }
}
```

#### 访问文档

启动项目后访问：
- Swagger UI：`http://localhost:8080/swagger-ui.html`
- Knife4j UI：`http://localhost:8080/doc.html`
- OpenAPI JSON：`http://localhost:8080/v3/api-docs`

### 4.4.3 参数校验详解

#### 常用校验注解

```java
@Data
public class ValidationDemo {

    // 空值校验
    @Null           // 必须为null
    @NotNull        // 不能为null
    @NotBlank       // 不能为null且去除空格后长度>0（用于String）
    @NotEmpty       // 不能为null且长度>0（用于String/Collection/Map/Array）

    // 数值校验
    @Min(0)         // 最小值
    @Max(100)       // 最大值
    @DecimalMin("0.01")  // 最小值（支持小数）
    @DecimalMax("99.99") // 最大值（支持小数）
    @Positive       // 正数
    @PositiveOrZero // 正数或零
    @Negative       // 负数
    @NegativeOrZero // 负数或零

    // 字符串校验
    @Size(min = 3, max = 20)    // 长度范围
    @Email                      // 邮箱格式
    @Pattern(regexp = "^1[3-9]\\d{9}$")  // 正则表达式

    // 日期校验
    @Past           // 过去的时间
    @PastOrPresent  // 过去或现在
    @Future         // 未来的时间
    @FutureOrPresent // 未来或现在

    // 其他
    @AssertTrue     // 必须为true
    @AssertFalse    // 必须为false
}
```

#### 自定义校验注解

```java
// 1. 定义注解
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = PhoneNumberValidator.class)
@Documented
public @interface PhoneNumber {
    String message() default "手机号格式不正确";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

// 2. 实现校验器
public class PhoneNumberValidator implements ConstraintValidator<PhoneNumber, String> {

    private static final Pattern PHONE_PATTERN = Pattern.compile("^1[3-9]\\d{9}$");

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isEmpty()) {
            return true;  // null值由@NotBlank处理
        }
        return PHONE_PATTERN.matcher(value).matches();
    }
}

// 3. 使用自定义注解
@Data
public class UserCreateDTO {
    @PhoneNumber
    private String phone;
}
```

#### 分组校验

```java
// 定义校验分组
public interface CreateGroup {}
public interface UpdateGroup {}

@Data
public class UserDTO {

    // 创建时必须提供
    @NotBlank(groups = CreateGroup.class)
    private String username;

    // 更新时必须提供ID
    @NotNull(groups = UpdateGroup.class)
    private Long id;

    // 两个操作都需要校验
    @Email(groups = {CreateGroup.class, UpdateGroup.class})
    private String email;
}

// 控制器中使用分组
@PostMapping
public Result<Void> create(@RequestBody @Validated(CreateGroup.class) UserDTO dto) {
    // ...
}

@PutMapping
public Result<Void> update(@RequestBody @Validated(UpdateGroup.class) UserDTO dto) {
    // ...
}
```

---

## 4.5 全局配置与最佳实践

### 4.5.1 全局CORS配置

```java
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

### 4.5.2 全局日期格式化

```java
@Configuration
public class JacksonConfig {

    @Bean
    public Jackson2ObjectMapperBuilderCustomizer jsonCustomizer() {
        return builder -> {
            // 全局日期格式
            builder.dateFormat(new StdDateFormat().withTimeZone("Asia/Shanghai"));

            // 序列化配置
            builder.serializerByType(LocalDateTime.class,
                    new LocalDateTimeSerializer(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            builder.serializerByType(LocalDate.class,
                    new LocalDateSerializer(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
            builder.serializerByType(LocalTime.class,
                    new LocalTimeSerializer(DateTimeFormatter.ofPattern("HH:mm:ss")));

            // 反序列化配置
            builder.deserializerByType(LocalDateTime.class,
                    new LocalDateTimeDeserializer(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            builder.deserializerByType(LocalDate.class,
                    new LocalDateDeserializer(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
        };
    }
}
```

### 4.5.3 全局Long类型序列化（解决前端精度问题）

```java
// JavaScript的Number.MAX_SAFE_INTEGER是2^53-1
// Java的Long最大值是2^63-1，超过JS安全范围会丢失精度
// 解决方案：将Long转为String传给前端
@Configuration
public class JacksonConfig {

    @Bean
    public Jackson2ObjectMapperBuilderCustomizer longToStringCustomizer() {
        return builder -> {
            builder.serializerByType(Long.class, ToStringSerializer.instance);
            builder.serializerByType(Long.TYPE, ToStringSerializer.instance);
        };
    }
}
```

### 4.5.4 AOP日志切面

```java
@Aspect     // 切面
@Component  // Spring Bean
@Slf4j
public class LogAspect {

    // 定义切点：所有controller包下的方法
    @Pointcut("execution(* com.example.demo.controller..*(..))")
    public void controllerPointcut() {}

    // 环绕通知
    @Around("controllerPointcut()")
    public Object around(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();

        // 获取请求信息
        ServletRequestAttributes attributes =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        HttpServletRequest request = attributes.getRequest();

        String method = request.getMethod();
        String url = request.getRequestURI();
        String className = joinPoint.getTarget().getClass().getName();
        String methodName = joinPoint.getSignature().getName();

        log.info("请求开始：{} {} -> {}.{}", method, url, className, methodName);

        try {
            // 执行目标方法
            Object result = joinPoint.proceed();

            long costTime = System.currentTimeMillis() - startTime;
            log.info("请求完成：{} {} 耗时：{}ms", method, url, costTime);

            return result;
        } catch (Exception e) {
            long costTime = System.currentTimeMillis() - startTime;
            log.error("请求异常：{} {} 耗时：{}ms 异常：{}", method, url, costTime, e.getMessage());
            throw e;
        }
    }

    // 前置通知：记录请求参数
    @Before("controllerPointcut()")
    public void before(JoinPoint joinPoint) {
        Object[] args = joinPoint.getArgs();
        if (args.length > 0) {
            log.debug("请求参数：{}", Arrays.toString(args));
        }
    }
}
```

### 4.5.5 统一响应封装（ResponseBodyAdvice）

```java
@RestControllerAdvice
public class ResponseAdvice implements ResponseBodyAdvice<Object> {

    @Override
    public boolean supports(MethodParameter returnType,
                             Class<? extends HttpMessageConverter<?>> converterType) {
        // 只处理返回Result类型的方法
        return returnType.getParameterType().equals(Result.class);
    }

    @Override
    public Object beforeBodyWrite(Object body,
                                   MethodParameter returnType,
                                   MediaType selectedContentType,
                                   Class<? extends HttpMessageConverter<?>> selectedConverterType,
                                   ServerHttpRequest request,
                                   ServerHttpResponse response) {
        // 可以在这里统一处理响应
        return body;
    }
}
```

---

## 4.6 部署与运维

### 4.6.1 打包与运行

```bash
# 打包（类比npm run build）
mvn clean package -DskipTests

# 运行jar包
java -jar target/demo-0.0.1-SNAPSHOT.jar

# 指定环境运行
java -jar target/demo-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod

# 后台运行（Linux）
nohup java -jar demo.jar --spring.profiles.active=prod > app.log 2>&1 &

# 查看运行状态
ps -ef | grep demo.jar
```

### 4.6.2 Actuator监控

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,env  # 暴露的端点
  endpoint:
    health:
      show-details: always
  info:
    env:
      enabled: true
```

**常用Actuator端点：**

| 端点 | 说明 | 前端类比 |
|------|------|---------|
| `/actuator/health` | 健康检查 | 前端性能监控 |
| `/actuator/info` | 应用信息 | package.json信息 |
| `/actuator/metrics` | 性能指标 | Performance API |
| `/actuator/env` | 环境变量 | process.env |
| `/actuator/beans` | 所有Bean | Vue DevTools |

### 4.6.3 Docker部署

```dockerfile
# Dockerfile
FROM eclipse-temurin:17-jre-alpine

LABEL maintainer="dev@example.com"

WORKDIR /app

COPY target/demo-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENV JAVA_OPTS="-Xms256m -Xmx512m"
ENV SPRING_PROFILES_ACTIVE=prod

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/test_db
      - SPRING_DATA_REDIS_HOST=redis
    depends_on:
      - mysql
      - redis

  mysql:
    image: mysql:8.0
    ports:
      - "3306:3306"
    environment:
      - MYSQL_ROOT_PASSWORD=123456
      - MYSQL_DATABASE=test_db
    volumes:
      - mysql-data:/var/lib/mysql

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

volumes:
  mysql-data:
  redis-data:
```

---

## 4.7 练习任务

### 练习1：博客系统API

**需求：**
- 用户注册/登录（JWT认证）
- 文章CRUD（标题、内容、分类、标签）
- 评论功能
- 文章分页查询（支持按分类、标签筛选）
- 接口文档（Knife4j）

**技术栈：**
- Spring Boot 3.x
- Spring Security + JWT
- MyBatis-Plus
- MySQL
- Redis（文章缓存）
- Knife4j

**数据库设计：**
```sql
-- 用户表
CREATE TABLE sys_user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    nickname VARCHAR(50),
    email VARCHAR(100),
    avatar VARCHAR(255),
    status TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 文章表
CREATE TABLE article (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    summary VARCHAR(500),
    cover_image VARCHAR(255),
    user_id BIGINT NOT NULL,
    category_id BIGINT,
    status TINYINT DEFAULT 1 COMMENT '0-草稿，1-发布',
    view_count INT DEFAULT 0,
    like_count INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 分类表
CREATE TABLE category (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    sort_order INT DEFAULT 0
);

-- 标签表
CREATE TABLE tag (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL
);

-- 文章标签关联表
CREATE TABLE article_tag (
    article_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,
    PRIMARY KEY (article_id, tag_id)
);

-- 评论表
CREATE TABLE comment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    content TEXT NOT NULL,
    article_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    parent_id BIGINT DEFAULT 0 COMMENT '父评论ID，0为顶级评论',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 练习2：电商购物车API

**需求：**
- 商品列表/详情
- 购物车增删改查
- 下单流程（库存扣减、订单生成）
- 订单查询
- 接口文档

**重点练习：**
- 事务管理（下单流程）
- Redis缓存（商品信息、购物车）
- 分布式锁（库存扣减）
- 参数校验

### 练习3：权限管理系统

**需求：**
- 用户管理（CRUD、分配角色）
- 角色管理（CRUD、分配权限）
- 菜单管理（树形结构）
- 动态权限控制
- 操作日志记录

**重点练习：**
- Spring Security完整集成
- RBAC权限模型
- AOP日志切面
- 树形数据处理

---

## 4.8 学习检查清单

### Spring Boot核心
- [ ] 能使用Spring Initializr创建项目
- [ ] 理解项目结构和各目录的作用
- [ ] 理解`@SpringBootApplication`自动配置原理
- [ ] 掌握Starter依赖管理
- [ ] 熟练使用application.yml配置
- [ ] 掌握Profile多环境管理
- [ ] 理解内嵌Web服务器配置
- [ ] 能编写RESTful API

### 分层架构
- [ ] 理解Controller/Service/Mapper三层架构
- [ ] 掌握DTO/VO/Entity的区别和使用
- [ ] 能实现统一响应封装
- [ ] 能实现全局异常处理
- [ ] 掌握参数校验（@Valid/@Validated）

### 常用集成
- [ ] 掌握Spring Boot + MyBatis/MyBatis-Plus集成
- [ ] 掌握Spring Boot + Redis集成（缓存注解）
- [ ] 掌握文件上传/下载实现
- [ ] 掌握日志配置（Logback）
- [ ] 掌握JUnit 5 + Mockito单元测试

### 安全框架
- [ ] 理解Spring Security核心概念
- [ ] 掌握认证与授权流程
- [ ] 能集成JWT实现无状态认证
- [ ] 理解OAuth2.0授权流程
- [ ] 掌握RBAC权限模型实现
- [ ] 掌握方法级权限控制

### 接口文档
- [ ] 掌握Swagger/OpenAPI 3注解使用
- [ ] 掌握Knife4j配置和使用
- [ ] 能生成完整的API文档

### 部署运维
- [ ] 掌握Maven打包
- [ ] 了解Actuator监控
- [ ] 了解Docker部署

---

*完成本阶段后，你应该能够独立开发一个完整的Spring Boot后端项目，包含用户认证、权限控制、数据缓存、接口文档等功能，具备企业级Java开发的基本能力。*
