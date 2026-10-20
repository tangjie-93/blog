package learn.persistence.practice;

import com.baomidou.mybatisplus.core.MybatisSqlSessionFactoryBuilder;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.apache.ibatis.io.Resources;
import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.session.SqlSessionFactory;

import java.io.Reader;
import java.util.List;

/**
 * 学生选课系统 — 真实数据库版本（MyBatis-Plus）
 *
 * 对比内存版 StudentCoursePracticeDemo，主要变化：
 * 1. 实体类加上 @TableName 注解 → 映射到数据库表
 * 2. StudentCourseRepository → StudentMapper / CourseMapper / EnrollmentMapper
 * 3. List.add() → mapper.insert()
 * 4. Stream 过滤 → SQL JOIN 查询
 */
public class PracticeRealDemo {

    public static void main(String[] args) throws Exception {
        try (Reader reader = Resources.getResourceAsReader("mybatis-config.xml")) {
            SqlSessionFactory sqlSessionFactory = new MybatisSqlSessionFactoryBuilder().build(reader);

            try (SqlSession sqlSession = sqlSessionFactory.openSession(true)) {
                StudentMapper studentMapper = sqlSession.getMapper(StudentMapper.class);
                CourseMapper courseMapper = sqlSession.getMapper(CourseMapper.class);
                EnrollmentMapper enrollmentMapper = sqlSession.getMapper(EnrollmentMapper.class);

                demoRawCrud(studentMapper, courseMapper, enrollmentMapper);
                demoJoinQuery(studentMapper, courseMapper, enrollmentMapper);
                demoStepByStepQuery(studentMapper, courseMapper, enrollmentMapper);
            }
        }
    }

    // ==================== 1. 基础 CRUD（等同于内存版的 save + enroll） ====================
    static void demoRawCrud(StudentMapper sm, CourseMapper cm, EnrollmentMapper em) {
        System.out.println("===== 基础 CRUD =====");

        // 插入学生
        StudentEntity alice = new StudentEntity("Alice", 20);
        StudentEntity bob = new StudentEntity("Bob", 21);
        sm.insert(alice);
        sm.insert(bob);

        // 插入课程
        CourseEntity javaCourse = new CourseEntity("Java Basics", 3);
        CourseEntity dbCourse = new CourseEntity("Database", 4);
        cm.insert(javaCourse);
        cm.insert(dbCourse);

        // 选课（插入关联记录）
        em.insert(new EnrollmentEntity(alice.getId(), javaCourse.getId(), 95));
        em.insert(new EnrollmentEntity(alice.getId(), dbCourse.getId(), 88));
        em.insert(new EnrollmentEntity(bob.getId(), dbCourse.getId(), 91));

        System.out.println("Alice 选了: Java Basics(95), Database(88)");
        System.out.println("Bob   选了:            Database(91)");
    }

    // ==================== 2. JOIN 查询（真实 SQL，等价于内存版的 Stream 过滤） =================
    static void demoJoinQuery(StudentMapper sm, CourseMapper cm, EnrollmentMapper em) {
        System.out.println("\n===== JOIN 查询（一条 SQL 搞定三表关联） =====");

        // 通过名称查 Alice 的 ID（避免硬编码，适应数据库已有数据的情况）
        StudentEntity alice = sm.selectOne(
                new LambdaQueryWrapper<StudentEntity>().eq(StudentEntity::getName, "Alice"));
        CourseEntity dbCourse = cm.selectOne(
                new LambdaQueryWrapper<CourseEntity>().eq(CourseEntity::getName, "Database"));

        // 查 Alice 选了哪些课 → 等价于内存版 findCoursesByStudent()
        List<StudentCourseView> coursesByStudent = em.findCoursesByStudent(alice.getId());
        System.out.println("Alice 的选课（按 student_id JOIN）:");
        coursesByStudent.forEach(System.out::println);

        // 查 Database 课有哪些学生 → 等价于内存版 findStudentsByCourse()
        List<StudentCourseView> studentsByCourse = em.findStudentsByCourse(dbCourse.getId());
        System.out.println("\nDatabase 课的学生（按 course_id JOIN）:");
        studentsByCourse.forEach(System.out::println);
    }

    // ==================== 3. 分步查询（MyBatis-Plus 风格，不写 JOIN） ===============
    static void demoStepByStepQuery(StudentMapper sm, CourseMapper cm, EnrollmentMapper em) {
        System.out.println("\n===== 分步查询（不写 JOIN，用 BaseMapper 分步取） =====");

        // 通过名称查 Alice（避免硬编码 ID）
        StudentEntity alice = sm.selectOne(
                new LambdaQueryWrapper<StudentEntity>().eq(StudentEntity::getName, "Alice"));

        // 第一步：查出 Alice 的所有选课记录
        List<EnrollmentEntity> enrollments = em.selectList(
                new LambdaQueryWrapper<EnrollmentEntity>()
                        .eq(EnrollmentEntity::getStudentId, alice.getId())
        );

        // 第二步：批量查出对应的课程
        for (EnrollmentEntity e : enrollments) {
            CourseEntity course = cm.selectById(e.getCourseId());
            StudentEntity student = sm.selectById(e.getStudentId());
            System.out.println(new StudentCourseView(
                    student.getName(), course.getName(), e.getScore()
            ));
        }
        System.out.println("（分步查询：N+1 问题，数据量小时可以接受）");

        // 清理测试数据
        enrollments.forEach(e -> em.deleteById(e.getId()));
        sm.delete(new LambdaQueryWrapper<>());
        cm.delete(new LambdaQueryWrapper<>());
    }
}
