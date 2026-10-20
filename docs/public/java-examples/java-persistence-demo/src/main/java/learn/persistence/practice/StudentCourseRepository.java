package learn.persistence.practice;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 内存"数据库"层 — 用内存 List 模拟数据存储和关联查询
 *
 * 模拟的数据表关系：
 * ┌──────────┐    ┌─────────────┐    ┌──────────┐
 * │ Student  │    │ Enrollment  │    │  Course  │
 * │──────────│    │─────────────│    │──────────│
 * │ id (PK)  │◄───│ studentId   │───►│ id (PK)  │
 * │ name     │    │ courseId    │    │ name     │
 * │ age      │    │ score       │    │ credit   │
 * └──────────┘    └─────────────┘    └──────────┘
 *
 * 查询逻辑：
 * - findCoursesByStudent: 学生 → 选课记录 → 过滤 → 关联课程名 → 返回视图
 * - findStudentsByCourse: 课程 → 选课记录 → 过滤 → 关联学生名 → 返回视图
 */
public class StudentCourseRepository {
    private final List<Student> students = new ArrayList<>();
    private final List<Course> courses = new ArrayList<>();
    private final List<Enrollment> enrollments = new ArrayList<>();

    public void saveStudent(Student student) {
        students.add(student);
    }

    public void saveCourse(Course course) {
        courses.add(course);
    }

    public void enroll(Long studentId, Long courseId, Integer score) {
        ensureExists(findStudentById(studentId), "student", studentId);
        ensureExists(findCourseById(courseId), "course", courseId);
        enrollments.add(new Enrollment(studentId, courseId, score));
    }

    public List<StudentCourseView> findCoursesByStudent(Long studentId) {
        Student student = ensureExists(findStudentById(studentId), "student", studentId);
        Map<Long, Course> courseById = courses.stream().collect(Collectors.toMap(Course::getId, course -> course));

        return enrollments.stream()
                .filter(enrollment -> enrollment.getStudentId().equals(studentId))
                .map(enrollment -> {
                    Course course = courseById.get(enrollment.getCourseId());
                    return new StudentCourseView(student.getName(), course.getName(), enrollment.getScore());
                })
                .toList();
    }

    public List<StudentCourseView> findStudentsByCourse(Long courseId) {
        Course course = ensureExists(findCourseById(courseId), "course", courseId);
        Map<Long, Student> studentById = students.stream().collect(Collectors.toMap(Student::getId, student -> student));

        return enrollments.stream()
                .filter(enrollment -> enrollment.getCourseId().equals(courseId))
                .map(enrollment -> {
                    Student student = studentById.get(enrollment.getStudentId());
                    return new StudentCourseView(student.getName(), course.getName(), enrollment.getScore());
                })
                .toList();
    }

    private Optional<Student> findStudentById(Long id) {
        return students.stream().filter(student -> student.getId().equals(id)).findFirst();
    }

    private Optional<Course> findCourseById(Long id) {
        return courses.stream().filter(course -> course.getId().equals(id)).findFirst();
    }

    private <T> T ensureExists(Optional<T> value, String type, Long id) {
        return value.orElseThrow(() -> new IllegalArgumentException(type + " not found: " + id));
    }
}
