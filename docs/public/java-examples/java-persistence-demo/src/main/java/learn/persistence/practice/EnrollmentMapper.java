package learn.persistence.practice;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 选课 Mapper — 继承 BaseMapper 获得基础 CRUD，额外提供 JOIN 查询方法
 */
public interface EnrollmentMapper extends BaseMapper<EnrollmentEntity> {

    /** 查询某个学生选了哪些课（JOIN 三表） */
    @Select("""
            SELECT s.name AS studentName, c.name AS courseName, e.score
            FROM enrollments e
            JOIN students s ON e.student_id = s.id
            JOIN courses  c ON e.course_id  = c.id
            WHERE e.student_id = #{studentId}
            """)
    List<StudentCourseView> findCoursesByStudent(@Param("studentId") Long studentId);

    /** 查询某门课有哪些学生选（JOIN 三表） */
    @Select("""
            SELECT s.name AS studentName, c.name AS courseName, e.score
            FROM enrollments e
            JOIN students s ON e.student_id = s.id
            JOIN courses  c ON e.course_id  = c.id
            WHERE e.course_id = #{courseId}
            """)
    List<StudentCourseView> findStudentsByCourse(@Param("courseId") Long courseId);
}
