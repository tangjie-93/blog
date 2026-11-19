package learn.persistence.practice;

/**
 * 学生选课系统 — 演示多表关联查询的核心思路
 *
 * 流程：
 * 1. 保存学生（Alice, Bob）和课程（Java Basics, Database）
 * 2. 学生选课并录入成绩（Alice 选了两门，Bob 选了一门）
 * 3. 交叉查询：某个学生选了哪些课 / 某门课有哪些学生选
 *
 * 注意：这里使用内存集合模拟数据库，真实项目中对应的表结构为：
 *   students(id, name, age) / courses(id, name, credit) / enrollments(student_id, course_id, score)
 */
public class StudentCoursePracticeDemo {

    public static void main(String[] args) {
        StudentCourseRepository repository = new StudentCourseRepository();

        repository.saveStudent(new Student(1L, "Alice", 20));
        repository.saveStudent(new Student(2L, "Bob", 21));
        repository.saveCourse(new Course(1L, "Java Basics", 3));
        repository.saveCourse(new Course(2L, "Database", 4));

        repository.enroll(1L, 1L, 95);
        repository.enroll(1L, 2L, 88);
        repository.enroll(2L, 2L, 91);

        System.out.println("Courses selected by Alice:");
        repository.findCoursesByStudent(1L).forEach(System.out::println);

        System.out.println("\nStudents in Database course:");
        repository.findStudentsByCourse(2L).forEach(System.out::println);
    }
}
