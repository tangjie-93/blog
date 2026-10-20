# Java 持久层 Demo

本项目对应 `doc/阶段2：数据库与持久层.md`。

项目有两类示例：

- 只依赖 JDK、可以直接运行的示例：SQL 输出、连接池原理、MyBatis 动态 SQL 思路、MyBatis-Plus QueryWrapper 思路、JPA 概念、学生选课练习。
- 真实 JDBC 方法示例：代码基于 `java.sql` 编写并可编译，但默认不会自动连接 MySQL。要连接真实 MySQL，需要添加 MySQL JDBC 驱动依赖，并修改 `DatabaseConfig`。

## 模块

| 包名 | 主题 |
| --- | --- |
| `learn.persistence.sql` | MySQL 表设计、CRUD、连接查询、索引、视图、事务 |
| `learn.persistence.jdbc` | JDBC CRUD 和事务代码 |
| `learn.persistence.pool` | 连接池原理 |
| `learn.persistence.mybatis` | Mapper 接口和动态 SQL 思路 |
| `learn.persistence.mybatisplus` | QueryWrapper 风格的条件构造 |
| `learn.persistence.jpa` | JPA/Hibernate 概念 |
| `learn.persistence.practice` | 学生-课程多对多练习 |

## 运行

```bash
mvn compile
mvn exec:java
```

运行单个 demo：

```bash
mvn exec:java -Dexec.mainClass="learn.persistence.practice.StudentCoursePracticeDemo"
```

## SQL 文件

`src/main/resources/sql/schema.sql` 包含：

- `users`
- `orders`
- `accounts`
- `students`
- `courses`
- `enrollments`

需要练习真实 SQL 或 JDBC 时，可以先把该脚本导入 MySQL。

## MyBatis 示例

`src/main/resources/mapper/UserMapper.xml` 对应：

```text
learn.persistence.mybatis.UserMapper
```

它包含：

- 结果映射
- CRUD
- 动态 `where`
- 使用 `set` 的选择性更新

如果要改成真实 MyBatis 项目，需要继续添加 MyBatis、MySQL 依赖，并补充 `mybatis-config.xml`。
