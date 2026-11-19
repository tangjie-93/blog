package learn.persistence.practice;

import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;

/**
 * 学生实体（JPA 版）— 使用 @ManyToMany 自动管理多对多关联
 *
 * 与 MyBatis-Plus 版的关键区别：
 * - 不需要手动创建 Enrollment 中间表记录
 * - JPA 自动维护关联表，只操作 Java 集合即可
 */
@Entity
@Table(name = "students")
public class StudentJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 50)
    private String name;

    @Column(name = "age")
    private Integer age;

    /**
     * 多对多关联：一个学生可以选多门课
     * @JoinTable 指定中间表名和外键列
     */
    @ManyToMany
    @JoinTable(
            name = "enrollments",                          // 中间表名
            joinColumns = @JoinColumn(name = "student_id"), // 指向本表的外键
            inverseJoinColumns = @JoinColumn(name = "course_id") // 指向对方表的外键
    )
    private Set<CourseJpaEntity> courses = new HashSet<>();

    public StudentJpaEntity() {
    }

    public StudentJpaEntity(String name, Integer age) {
        this.name = name;
        this.age = age;
    }

    /** 选课（操作 Java 集合，JPA 自动写入中间表） */
    public void enroll(CourseJpaEntity course) {
        courses.add(course);
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public Integer getAge() { return age; }
    public Set<CourseJpaEntity> getCourses() { return courses; }

    @Override
    public String toString() {
        return "StudentJpa{id=" + id + ", name='" + name + "', age=" + age + "}";
    }
}
