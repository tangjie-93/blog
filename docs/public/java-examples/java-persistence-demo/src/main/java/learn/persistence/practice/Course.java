package learn.persistence.practice;

/**
 * 课程实体 — 表示可以选修的课程，包含学分信息
 */
public class Course {
    private final Long id;
    private final String name;
    private final Integer credit;

    public Course(Long id, String name, Integer credit) {
        this.id = id;
        this.name = name;
        this.credit = credit;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public Integer getCredit() {
        return credit;
    }

    @Override
    public String toString() {
        return "Course{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", credit=" + credit +
                '}';
    }
}
