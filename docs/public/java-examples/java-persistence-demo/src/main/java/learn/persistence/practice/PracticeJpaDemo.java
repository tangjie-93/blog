package learn.persistence.practice;

import jakarta.persistence.*;
import java.util.List;

/**
 * 学生选课系统 — JPA 版本（@ManyToMany 自动关联）
 *
 * 与 MyBatis-Plus 版本的核心差异：
 * ┌────────────────────┬──────────────────────────────┐
 * │ MyBatis-Plus       │ JPA                          │
 * ├────────────────────┼──────────────────────────────┤
 * │ 手动管理 Enrollment │ @ManyToMany 自动维护中间表   │
 * │ 写 JOIN SQL        │ 操作 Java 集合即可查询        │
 * │ 3 个 Mapper        │ 只需 StudentJpaRepository    │
 * │ 3 个 Entity        │ 只需 Student + Course 实体   │
 * │ SQL 完全可控       │ SQL 自动生成，不透明          │
 * └────────────────────┴──────────────────────────────┘
 */
public class PracticeJpaDemo {

    public static void main(String[] args) {
        EntityManagerFactory emf = Persistence.createEntityManagerFactory("jpa-demo");

        try {
            demoManyToMany(emf);
        } finally {
            emf.close();
        }
    }

    static void demoManyToMany(EntityManagerFactory emf) {
        System.out.println("===== JPA @ManyToMany 自动关联 =====");

        EntityManager em = emf.createEntityManager();
        EntityTransaction tx = em.getTransaction();
        tx.begin();
        try {
            // 1. 创建学生和课程（不需要创建 Enrollment！）
            StudentJpaEntity alice = new StudentJpaEntity("Alice", 20);
            StudentJpaEntity bob = new StudentJpaEntity("Bob", 21);
            CourseJpaEntity javaCourse = new CourseJpaEntity("Java Basics", 3);
            CourseJpaEntity dbCourse = new CourseJpaEntity("Database", 4);

            em.persist(alice);
            em.persist(bob);
            em.persist(javaCourse);
            em.persist(dbCourse);

            // 2. 选课 —— 只需操作 Java 集合，JPA 自动写入 enrollments 表！
            alice.enroll(javaCourse);
            alice.enroll(dbCourse);
            bob.enroll(dbCourse);
            // 不需要 em.persist(enrollment)！事务提交时 JPA 自动同步

            tx.commit();

            // 3. 查询 —— 直接访问集合
            System.out.println("Alice 选的课:");
            alice.getCourses().forEach(c ->
                    System.out.println("  " + c.getName())
            );

            // 4. JPQL 跨表查询
            System.out.println("\n选了 Database 课的学生:");
            List<StudentJpaEntity> students = em.createQuery(
                            "SELECT s FROM StudentJpaEntity s JOIN s.courses c WHERE c.name = :courseName",
                            StudentJpaEntity.class)
                    .setParameter("courseName", "Database")
                    .getResultList();
            students.forEach(s -> System.out.println("  " + s.getName()));

            // 清理
            tx = em.getTransaction();
            tx.begin();
            students.forEach(em::remove);
            em.remove(javaCourse);
            em.remove(dbCourse);
            tx.commit();
        } catch (Exception e) {
            if (tx.isActive()) tx.rollback();
            throw new RuntimeException(e);
        } finally {
            em.close();
        }
    }
}
