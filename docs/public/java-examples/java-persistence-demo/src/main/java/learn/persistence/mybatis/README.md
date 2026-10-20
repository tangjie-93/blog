# MyBatis 结构说明

## 必备要素

MyBatis 的核心是 **"接口 + XML"** ，Java 接口定义方法名，XML 定义对应的 SQL，框架在运行时生成代理实现。

| 要素 | 说明 |
|---|---|
| Mapper 接口 | 声明增删改查方法 |
| Mapper XML | SQL 绑定，`namespace` 对应接口全限定名，`id` 对应方法名 |
| SqlSession | MyBatis 核心对象，打开 → 执行 → 提交/回滚 → 关闭 |
| 查询对象 | 封装查询条件，传给 `where` / `<if>` 动态 SQL |
| 实体 | 数据库表对应的 POJO |

## 文件说明

### [UserMapper.java](file:///d:/personal/study/code/java-persistence-demo/src/main/java/learn/persistence/mybatis/UserMapper.java)
Mapper 接口，定义 6 个方法：

| 方法 | 说明 |
|---|---|
| `findById(Long id)` | 按主键查单条 |
| `findAll()` | 查全表 |
| `findByCondition(UserQuery)` | 多条件动态查询 |
| `insert(User)` | 插入 |
| `update(User)` | 更新 |
| `deleteById(Long id)` | 按主键删除 |

### [UserQuery.java](file:///d:/personal/study/code/java-persistence-demo/src/main/java/learn/persistence/mybatis/UserQuery.java)
查询条件封装对象，5 个可选字段：

- `username` → 模糊匹配
- `email` → 精确匹配
- `minAge` / `maxAge` → 年龄范围（BETWEEN）
- `status` → 状态过滤

所有字段都用 `Integer`（包装类）而非 `int`，因为 `null` 表示"不过滤"，`0` 是合法值。

### [DynamicSqlBuilder.java](file:///d:/personal/study/code/java-persistence-demo/src/main/java/learn/persistence/mybatis/DynamicSqlBuilder.java)
模拟 MyBatis `<if>` / `<where>` 标签的原理：根据 Query 对象的字段是否为空，动态拼接 WHERE 条件。最终生成类似：

```sql
SELECT * FROM users
WHERE username LIKE CONCAT('%', #{username}, '%')
  AND age BETWEEN #{minAge} AND #{maxAge}
  AND status = #{status}
ORDER BY id DESC
```

### [MybatisConceptDemo.java](file:///d:/personal/study/code/java-persistence-demo/src/main/java/learn/persistence/mybatis/MybatisConceptDemo.java)
演示入口，创建 `UserQuery` 填充条件，调用 `DynamicSqlBuilder` 输出动态 SQL。

## MyBatis 工作流程

```
UserMapper.java                         UserMapper.xml
┌─────────────────────┐                 ┌──────────────────────────┐
│ findById(Long id)   │  ── 映射 ──→    │ <select id="findById">  │
│ findByCondition(...) │                │   SELECT * FROM users   │
│ insert(User)        │                │   WHERE id = #{id}      │
│ ...                 │                │ </select>               │
└─────────────────────┘                 └──────────────────────────┘
        ↑                                        │
        │  SqlSession.getMapper(UserMapper.class) │
        │  ──→ 生成代理对象，拦截方法调用 ──→     │
        │                    ←── 执行 SQL 返回结果 ←──
        ↓
   调用者拿到代理对象，调用方法就像调普通 Java 方法
```

## !" 参数占位符

```xml
#{xxx}   →  预编译占位符，防 SQL 注入，底层是 PreparedStatement 的 ?
${xxx}   →  直接拼接字符串，有注入风险，只用于表名/列名等无法预编译的场景
```

## `<if>` / `<where>` 动态 SQL（真 MyBatis XML 写法）

在真实项目中，`DynamicSqlBuilder` 的逻辑对应 Mapper XML 的 `<if>` 标签：

```xml
<select id="findByCondition" resultType="User">
    SELECT * FROM users
    <where>
        <if test="username != null and username != ''">
            username LIKE CONCAT('%', #{username}, '%')
        </if>
        <if test="email != null and email != ''">
            AND email = #{email}
        </if>
        <if test="minAge != null and maxAge != null">
            AND age BETWEEN #{minAge} AND #{maxAge}
        </if>
        <if test="status != null">
            AND status = #{status}
        </if>
    </where>
    ORDER BY id DESC
</select>
```

`<where>` 标签自动处理开头的 `AND`——有内容时才输出 `WHERE`，第一个条件的 `AND` 自动去掉。
