# Java 持久层 Demo（java-persistence-demo）

一个覆盖**数据库 → JDBC → 连接池 → MyBatis → MyBatis-Plus → JPA → 实战综合练习**全链路的学习演示项目。

所有 Demo 都可以通过入口类的菜单交互式运行，无需额外依赖数据库（代码中已解释原理，实际执行时只需启动 MySQL 并导入 SQL 即可）。

---

## 快速开始

入口类：`learn.persistence.PersistenceApplication`

```bash
# 运行后会出现菜单，输入数字 1~8 运行对应 Demo
1. MySQL schema and SQL basics        — SQL 建表和基础语句
2. JDBC CRUD workflow                 — JDBC 增删改查
3. JDBC transaction workflow          — JDBC 事务（转账示例）
4. Connection pool concept            — 连接池原理
5. MyBatis concept and dynamic SQL    — MyBatis 接口 + 动态 SQL
6. MyBatis-Plus concept               — MyBatis-Plus BaseMapper + QueryWrapper
7. JPA/Hibernate concept              — JPA 实体 + Repository 命名查询
8. Practice: student-course system    — 学生选课系统综合练习
```

---

## 项目结构

```
learn/
└── persistence/
    ├── PersistenceApplication.java          ← 入口：菜单调度所有 Demo
    │
    ├── sql/                                 ← 第一步：SQL 基础
    │   └── SqlBasicsDemo.java               建表语句 / CRUD / 连接查询 / 分组聚合 / 索引 / 视图 / 事务
    │
    ├── jdbc/                                ← 第二步：JDBC 原生 API
    │   ├── DatabaseConfig.java              数据库连接配置（URL / 用户名 / 密码）
    │   ├── JdbcCrudDemo.java                DriverManager + PreparedStatement + ResultSet 实现 CRUD
    │   └── JdbcTransactionDemo.java         setAutoCommit(false) → 操作 → commit / rollback
    │
    ├── pool/                                ← 第三步：连接池原理
    │   └── ConnectionPoolConceptDemo.java   简化版连接池：预先创建连接 → borrow → return
    │
    ├── mybatis/                             ← 第四步：MyBatis
    │   ├── MybatisConceptDemo.java          Mapper 接口 + XML + 动态 SQL 思路
    │   ├── UserMapper.java                  DAO 接口：findById / findAll / insert / update / delete
    │   ├── UserQuery.java                   动态查询条件对象（username / email / age / status）
    │   └── DynamicSqlBuilder.java           用 Java 代码模拟 `<if>` 标签拼接动态 SQL
    │
    ├── mybatisplus/                         ← 第五步：MyBatis-Plus
    │   └── MybatisPlusConceptDemo.java      BaseMapper + QueryWrapper 链式条件构造器
    │
    ├── jpa/                                 ← 第六步：JPA / Hibernate
    │   └── JpaConceptDemo.java              Entity 映射 + Repository 方法命名查询 + @Query
    │
    ├── model/                               ← 数据模型（ORM 对象）
    │   ├── User.java                        用户实体（对应 users 表）
    │   └── Order.java                       订单实体（对应 orders 表）
    │
    └── practice/                            ← 第七步：学生选课系统综合练习
        ├── StudentCoursePracticeDemo.java   入口：保存学生、保存课程、选课、双向查询
        ├── StudentCourseRepository.java    仓储层：内存中模拟三张表 + JOIN 查询
        ├── Student.java                    学生实体（id / name / age）
        ├── Course.java                     课程实体（id / name / credit 学分）
        ├── Enrollment.java                 选课记录（studentId + courseId + score）
        └── StudentCourseView.java          视图对象：学生名 - 课程名 - 成绩
```

---

## 各目录详解

### 1. `sql/` — SQL 基础

| 文件 | 内容 |
|---|---|
| [SqlBasicsDemo.java](file:///d:/personal/study/code/java-persistence-demo/src/main/java/learn/persistence/sql/SqlBasicsDemo.java) | 打印完整建表语句（users + orders）、DML（INSERT/SELECT/UPDATE/DELETE）、高级查询（LEFT JOIN / GROUP BY HAVING / 索引 / 视图）、事务（START TRANSACTION + COMMIT） |

### 2. `jdbc/` — JDBC 原生 API

| 文件 | 核心知识点 |
|---|---|
| [DatabaseConfig.java](file:///d:/personal/study/code/java-persistence-demo/src/main/java/learn/persistence/jdbc/DatabaseConfig.java) | JDBC URL 参数：useSSL / serverTimezone / characterEncoding；私有构造禁止实例化 |
| [JdbcCrudDemo.java](file:///d:/personal/study/code/java-persistence-demo/src/main/java/learn/persistence/jdbc/JdbcCrudDemo.java) | 五步走：DriverManager 获取连接 → PreparedStatement 用 `?` 占位 → setXxx 设值（索引从 1 开始！）→ executeUpdate（写）/ executeQuery（读）→ ResultSet next() + getXxx() 映射；全部使用 try-with-resources 自动关闭 |
| [JdbcTransactionDemo.java](file:///d:/personal/study/code/java-persistence-demo/src/main/java/learn/persistence/jdbc/JdbcTransactionDemo.java) | 转账案例：setAutoCommit(false) → 减余额 + 加余额 → commit；异常则 rollback；finally 恢复 setAutoCommit(true)；所有操作共用同一个 Connection |

### 3. `pool/` — 连接池原理

| 文件 | 核心知识点 |
|---|---|
| [ConnectionPoolConceptDemo.java](file:///d:/personal/study/code/java-persistence-demo/src/main/java/learn/persistence/pool/ConnectionPoolConceptDemo.java) | 简化版连接池实现：预先初始化 N 个连接放入队列；borrowConnection 出队拿连接，returnConnection 入队归还；实际项目使用 HikariCP |

### 4. `mybatis/` — MyBatis

| 文件 | 核心知识点 |
|---|---|
| [MybatisConceptDemo.java](file:///d:/personal/study/code/java-persistence-demo/src/main/java/learn/persistence/mybatis/MybatisConceptDemo.java) | 核心三大件：Mapper 接口声明方法 → Mapper XML 绑定 SQL → SqlSession 创建代理；演示 UserQuery 传参 → DynamicSqlBuilder 动态拼接 |
| [UserMapper.java](file:///d:/personal/study/code/java-persistence-demo/src/main/java/learn/persistence/mybatis/UserMapper.java) | 标准 DAO 接口：findById / findAll / findByCondition（动态条件）/ insert / update / deleteById |
| [UserQuery.java](file:///d:/personal/study/code/java-persistence-demo/src/main/java/learn/persistence/mybatis/UserQuery.java) | 查询条件对象（DTO）：用户名模糊、邮箱精确、年龄范围、状态 |
| [DynamicSqlBuilder.java](file:///d:/personal/study/code/java-persistence-demo/src/main/java/learn/persistence/mybatis/DynamicSqlBuilder.java) | 用 Java if 判断动态拼接 SQL，等价于 MyBatis XML `<if>` 标签的思路 |

### 5. `mybatisplus/` — MyBatis-Plus

| 文件 | 核心知识点 |
|---|---|
| [MybatisPlusConceptDemo.java](file:///d:/personal/study/code/java-persistence-demo/src/main/java/learn/persistence/mybatisplus/MybatisPlusConceptDemo.java) | 继承 BaseMapper 自动获得 insert / selectById / updateById / deleteById 等通用方法；QueryWrapper 链式 `eq().like().between().orderByDesc().select()` 构造条件并生成 SQL |

### 6. `jpa/` — JPA / Hibernate

| 文件 | 核心知识点 |
|---|---|
| [JpaConceptDemo.java](file:///d:/personal/study/code/java-persistence-demo/src/main/java/learn/persistence/jpa/JpaConceptDemo.java) | Entity 注解把类映射到表；Repository 方法命名派生查询（findByAgeGreaterThan、findByUsernameLike）；@Query 写 JPQL 自定义查询 |

### 7. `model/` — 数据模型

| 文件 | 对应表 | 核心字段 |
|---|---|---|
| [User.java](file:///d:/personal/study/code/java-persistence-demo/src/main/java/learn/persistence/model/User.java) | users | id / username / password / email / age / status / createdAt / updatedAt |
| [Order.java](file:///d:/personal/study/code/java-persistence-demo/src/main/java/learn/persistence/model/Order.java) | orders | id / orderNo / userId（外键）/ amount（BigDecimal！）/ status / createdAt |

### 8. `practice/` — 学生选课系统实战

演示**多对多关系**的完整设计：一张中间表连接两张主表 + JOIN 查询。

| 文件 | 作用 |
|---|---|
| [StudentCoursePracticeDemo.java](file:///d:/personal/study/code/java-persistence-demo/src/main/java/learn/persistence/practice/StudentCoursePracticeDemo.java) | 完整流程：新增 Alice 和 Bob 两个学生 → 新增 Java Basics / Database 两门课 → 三人选课（Alice 同时选两门，Bob 选 Database）→ 按学生查课、按课查学生 |
| [StudentCourseRepository.java](file:///d:/personal/study/code/java-persistence-demo/src/main/java/learn/persistence/practice/StudentCourseRepository.java) | 仓储层：内存中三张 List 模拟数据库；findCoursesByStudent / findStudentsByCourse 用 Stream 模拟 JOIN；ensureExists 校验外键存在性 |
| [Student.java](file:///d:/personal/study/code/java-persistence-demo/src/main/java/learn/persistence/practice/Student.java) | 学生：id、name、age |
| [Course.java](file:///d:/personal/study/code/java-persistence-demo/src/main/java/learn/persistence/practice/Course.java) | 课程：id、name、credit（学分） |
| [Enrollment.java](file:///d:/personal/study/code/java-persistence-demo/src/main/java/learn/persistence/practice/Enrollment.java) | 选课中间表：studentId + courseId + score（分数） |
| [StudentCourseView.java](file:///d:/personal/study/code/java-persistence-demo/src/main/java/learn/persistence/practice/StudentCourseView.java) | 视图对象：把三表 JOIN 后展示的"学生名-课程名-分数"封装为可读字符串 |

---

## 推荐学习顺序

```
sql/ (基础)
  ↓
jdbc/ (最底层，掌握原理)
  ↓
pool/ (为什么要连接池)
  ↓
mybatis/ (半自动 ORM，手工写 SQL)
  ↓
mybatisplus/ (MyBatis 增强，少写 SQL)
  ↓
jpa/ (全自动 ORM，不用写 SQL)
  ↓
practice/ (多对多综合练习)
```

---

## 实际运行 MySQL 版的准备

1. 启动本地 MySQL，创建数据库：
   ```sql
   CREATE DATABASE test_db DEFAULT CHARACTER SET utf8mb4;
   ```
2. 运行 `SqlBasicsDemo` 的输出，依次执行两张建表语句
3. 修改 `DatabaseConfig.java` 的 `USER` 和 `PASSWORD` 为你本地配置
4. 在 `pom.xml` 加入 MySQL Connector/J 依赖：
   ```xml
   <dependency>
       <groupId>mysql</groupId>
       <artifactId>mysql-connector-java</artifactId>
       <version>8.0.33</version>
   </dependency>
   ```
5. 启动 `PersistenceApplication` 即可真实执行 JDBC 部分的代码
