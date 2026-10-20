# 学生选课系统 (Student Course Practice)

从"内存模拟"到"真实数据库"，循序渐进掌握**多表关联查询**的练习模块。

## 为什么有这个练习

学完 JDBC / MyBatis / JPA 的单表 CRUD 后，真实项目最大的挑战是**多表关联查询**。这个模块用同一个业务场景（学生选课），分别用三种方式实现，让你直观对比它们的差异。

## 数据关系

```
┌──────────┐      ┌─────────────┐      ┌──────────┐
│ Student  │      │ Enrollment  │      │  Course  │
│──────────│      │─────────────│      │──────────│
│ id (PK)  │◄─────│ student_id  │─────►│ id (PK)  │
│ name     │      │ course_id   │      │ name     │
│ age      │      │ score       │      │ credit   │
└──────────┘      └─────────────┘      └──────────┘
      1                  N                   1
  Student ◄──────── Enrollment ────────► Course
          多对多（一个学生选多门课，一门课有多个学生）
```

建表 SQL：[resources/sql/practice-schema.sql](../../../resources/sql/practice-schema.sql)

## 文件结构

### 内存模拟版（零依赖，直接运行）
| 文件 | 角色 |
|------|------|
| `Student.java` | 学生 POJO |
| `Course.java` | 课程 POJO |
| `Enrollment.java` | 选课关联 POJO |
| `StudentCourseView.java` | 查询结果 DTO |
| `StudentCourseRepository.java` | 内存 List 模拟 DAO |
| `StudentCoursePracticeDemo.java` | 入口 |

### MyBatis-Plus 版（真实数据库）
| 文件 | 角色 |
|------|------|
| `StudentEntity.java` | `@TableName("students")` |
| `CourseEntity.java` | `@TableName("courses")` |
| `EnrollmentEntity.java` | `@TableName("enrollments")` |
| `StudentMapper.java` | `extends BaseMapper<StudentEntity>` |
| `CourseMapper.java` | `extends BaseMapper<CourseEntity>` |
| `EnrollmentMapper.java` | `BaseMapper` + `@Select` JOIN 注解 |
| `PracticeRealDemo.java` | 入口：CRUD → JOIN 查询 → 分步查询 |

### JPA 版（真实数据库）
| 文件 | 角色 |
|------|------|
| `StudentJpaEntity.java` | `@ManyToMany` + `@JoinTable` 自动维护中间表 |
| `CourseJpaEntity.java` | 课程实体 |
| `PracticeJpaDemo.java` | 入口：自动关联 + 集合操作 + JPQL 跨表查询 |

## 关键代码对照：查"Alice 选了哪些课"

### 内存版 — Stream 过滤
```java
// StudentCourseRepository.java
enrollments.stream()
    .filter(e -> e.getStudentId().equals(studentId))
    .map(e -> {
        Course course = coursesMap.get(e.getCourseId());
        return new StudentCourseView(student.getName(), course.getName(), e.getScore());
    })
    .toList();
```

### MyBatis-Plus 版 — @Select JOIN
```java
// EnrollmentMapper.java
@Select("""
    SELECT s.name AS studentName, c.name AS courseName, e.score
    FROM enrollments e
    JOIN students s ON e.student_id = s.id
    JOIN courses  c ON e.course_id = c.id
    WHERE e.student_id = #{studentId}
    """)
List<StudentCourseView> findCoursesByStudent(Long studentId);
```
一条 SQL 搞定，数据库完成关联，比 Stream 高效。

### MyBatis-Plus 版 — 分步查（不写 JOIN）
```java
// PracticeRealDemo.java
List<EnrollmentEntity> enrollments = em.selectList(
    new LambdaQueryWrapper<EnrollmentEntity>()
        .eq(EnrollmentEntity::getStudentId, alice.getId())
);
for (EnrollmentEntity e : enrollments) {
    CourseEntity course = cm.selectById(e.getCourseId());
    // 组装 StudentCourseView...
}
```
简单直接，但会触发 **N+1 问题**（先查 N 条选课记录，再逐条查课程）。

### JPA 版 — @ManyToMany 自动关联
```java
// StudentJpaEntity.java
@ManyToMany
@JoinTable(name = "enrollments",
    joinColumns = @JoinColumn(name = "student_id"),
    inverseJoinColumns = @JoinColumn(name = "course_id"))
private Set<CourseJpaEntity> courses = new HashSet<>();

// PracticeJpaDemo.java — 只需操作集合！
alice.getCourses().forEach(c -> System.out.println(c.getName()));
```
JPA 自动生成 JOIN SQL，开发者只需操作 Java 集合，代码最少但 SQL 最不透明。

## 快速开始

```bash
# 0. 先建表（仅 MyBatis-Plus 和 JPA 版需要）
mysql -u root -p test_db < src/main/resources/sql/practice-schema.sql

# 1. 内存版（无需数据库）
mvn exec:java -Dexec.mainClass="learn.persistence.practice.StudentCoursePracticeDemo"

# 2. MyBatis-Plus 版
mvn exec:java -Dexec.mainClass="learn.persistence.practice.PracticeRealDemo"

# 3. JPA 版
mvn exec:java -Dexec.mainClass="learn.persistence.practice.PracticeJpaDemo"
```

## 三种方案对比

| | 内存版 | MyBatis-Plus（JOIN） | MyBatis-Plus（分步） | JPA @ManyToMany |
|------|--------|---------------------|---------------------|----------------|
| 实体数量 | 3 个 POJO | 3 个 `@TableName` | 同左 | 2 个 `@Entity` |
| 中间表管理 | `new Enrollment()` | `mapper.insert(Enrollment)` | 同左 | `courses.add(c)` 自动 |
| 关联查询 | Stream + Map | 手写 JOIN SQL | LambdaQuery + 逐条查 | 自动 JOIN |
| SQL 可控性 | N/A（无 SQL） | 完全可控 | 单表可控 | 不可控 |
| 性能 | 内存操作最快 | 最优（一条 SQL） | N+1 问题 | 自动优化 |
| 代码量 | 中等 | 较少 | 最少（CRUD） | 极少 |
| 适用场景 | 教学理解 | 复杂多表查询 | 简单 CRUD | 实体关系映射 |
