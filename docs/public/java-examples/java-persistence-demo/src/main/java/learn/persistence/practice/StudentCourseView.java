package learn.persistence.practice;

/**
 * 查询结果视图 — 组装学生名、课程名、成绩，用于展示交叉查询结果
 * 特点：不可变（final 字段 + 无 setter），只用于读展示
 */
public class StudentCourseView {
    private String studentName;
    private String courseName;
    private Integer score;

    /** MyBatis 自动映射所需的无参构造（包私有，外部不可见） */
    @SuppressWarnings("unused")
    private StudentCourseView() {
    }

    public StudentCourseView(String studentName, String courseName, Integer score) {
        this.studentName = studentName;
        this.courseName = courseName;
        this.score = score;
    }

    @Override
    public String toString() {
        return studentName + " -> " + courseName + ", score=" + score;
    }
}
