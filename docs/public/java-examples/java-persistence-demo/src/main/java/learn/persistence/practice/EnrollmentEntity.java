package learn.persistence.practice;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

/**
 * 选课实体（MyBatis-Plus 版）— 映射 enrollments 关联表
 *
 * 多对多中间表：通过 student_id + course_id 连接 Student 和 Course
 * uk_student_course 唯一约束保证同一学生不重复选同一门课
 */
@TableName("enrollments")
public class EnrollmentEntity {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long studentId;

    private Long courseId;

    private Integer score;

    public EnrollmentEntity() {
    }

    public EnrollmentEntity(Long studentId, Long courseId, Integer score) {
        this.studentId = studentId;
        this.courseId = courseId;
        this.score = score;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }

    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
}
