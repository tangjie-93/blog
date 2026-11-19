package learn.persistence.practice;

import jakarta.persistence.*;

/**
 * 课程实体（JPA 版）— 被 @ManyToMany 反向引用
 */
@Entity
@Table(name = "courses")
public class CourseJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "credit", nullable = false)
    private Integer credit;

    public CourseJpaEntity() {
    }

    public CourseJpaEntity(String name, Integer credit) {
        this.name = name;
        this.credit = credit;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public Integer getCredit() { return credit; }

    @Override
    public String toString() {
        return "CourseJpa{id=" + id + ", name='" + name + "', credit=" + credit + "}";
    }
}
