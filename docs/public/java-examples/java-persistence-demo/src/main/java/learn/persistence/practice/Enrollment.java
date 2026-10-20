package learn.persistence.practice;

/**
 * 选课/成绩实体 — 关联学生和课程（多对多关系），记录选课成绩
 * 这是一个"关联表"模型：通过 studentId + courseId 连接 Student 和 Course
 */
public class Enrollment {
    private final Long studentId;
    private final Long courseId;
    private final Integer score;

    public Enrollment(Long studentId, Long courseId, Integer score) {
        this.studentId = studentId;
        this.courseId = courseId;
        this.score = score;
    }

    public Long getStudentId() {
        return studentId;
    }

    public Long getCourseId() {
        return courseId;
    }

    public Integer getScore() {
        return score;
    }
}
