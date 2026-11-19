package learn.persistence.jpa;

import jakarta.persistence.*;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

import java.util.ArrayList;
import java.util.List;

/**
 * JPA/Hibernate 实战 Demo（Java SE 独立运行，不依赖 Spring）。
 *
 * 核心对比：
 * ┌──────────┬─────────────────────┬─────────────────────┐
 * │          │ JPA/Hibernate       │ MyBatis-Plus        │
 * ├──────────┼─────────────────────┼─────────────────────┤
 * │ 映射     │ 实体注解 (@Entity)   │ XML / @TableName    │
 * │ CRUD     │ entityManager.persist│ BaseMapper.insert   │
 * │ 查询     │ JPQL / Criteria API │ QueryWrapper        │
 * │ 事务     │ JTA / RESOURCE_LOCAL│ SqlSession          │
 * │ 缓存     │ 一级/二级缓存内置   │ 需额外配置          │
 * │ SQL 控制 │ 自动生成，不直观    │ 手写，完全可控      │
 * └──────────┴─────────────────────┴─────────────────────┘
 */
public class JpaRealDemo {

    public static void main(String[] args) {
        // ---- 1. 创建 EntityManagerFactory（读取 META-INF/persistence.xml） ----
        EntityManagerFactory emf = Persistence.createEntityManagerFactory("jpa-demo");

        try {
            demoBasicCrud(emf);
            demoPersistContext(emf);
            demoJpql(emf);
            demoCriteriaApi(emf);
            demoPagination(emf);
        } finally {
            emf.close();
        }
    }

    // ======================== 1. 基础 CRUD ========================
    static void demoBasicCrud(EntityManagerFactory emf) {
        System.out.println("===== 基础 CRUD（EntityManager） =====");

        EntityManager em = emf.createEntityManager();
        EntityTransaction tx = em.getTransaction();
        tx.begin();
        try {
            // 插入：persist()
            UserEntity user = new UserEntity("jpa_user", "123456", "jpa@test.com", 30, 1);
            em.persist(user); // 此时 user.id 已被回填（得益于 @GeneratedValue）
            System.out.println("插入后主键: " + user.getId());

            // 按主键查询：find()
            UserEntity found = em.find(UserEntity.class, user.getId());
            System.out.println("按 ID 查:  " + found);

            // 更新：直接修改托管对象，事务提交时自动 UPDATE
            found.setEmail("jpa_updated@test.com");
            // 不需要显式调用 update()，JPA 的脏检查会自动生成 UPDATE SQL
            System.out.println("更新后:     " + em.find(UserEntity.class, user.getId()));

            // 删除：remove()
            em.remove(found);
            System.out.println("删除后查询: " + em.find(UserEntity.class, user.getId())); // null

            tx.commit();
        } catch (Exception e) {
            tx.rollback();
            throw new RuntimeException(e);
        } finally {
            em.close();
        }
    }

    // ======================== 2. 持久化上下文（一级缓存） ========================
    static void demoPersistContext(EntityManagerFactory emf) {
        System.out.println("\n===== 持久化上下文（Persistence Context） =====");

        EntityManager em = emf.createEntityManager();
        EntityTransaction tx = em.getTransaction();
        tx.begin();
        try {
            UserEntity user = new UserEntity("cache_test", "pwd", "cache@test.com", 25, 1);
            em.persist(user);

            // JPA 一级缓存：同一 EntityManager 内重复查询不会发 SQL
            UserEntity a = em.find(UserEntity.class, user.getId());
            UserEntity b = em.find(UserEntity.class, user.getId());
            System.out.println("同一 ID 两次查询：只有一个 SELECT SQL，第二次走缓存");
            System.out.println("是同一个对象吗？ " + (a == b)); // true

            em.remove(user);
            tx.commit();
        } catch (Exception e) {
            tx.rollback();
            throw new RuntimeException(e);
        } finally {
            em.close();
        }
    }

    // ======================== 3. JPQL 查询 ========================
    static void demoJpql(EntityManagerFactory emf) {
        System.out.println("\n===== JPQL（面向实体的查询语言） =====");

        EntityManager em = emf.createEntityManager();
        EntityTransaction tx = em.getTransaction();
        tx.begin();
        try {
            // 插入测试数据
            em.persist(new UserEntity("jpa_zhang", "pwd1", "zhang@test.com", 22, 1));
            em.persist(new UserEntity("jpa_li", "pwd2", "li@test.com", 28, 1));
            em.persist(new UserEntity("jpa_wang", "pwd3", "wang@test.com", 35, 0));

            // JPQL 语法类似 SQL，但操作的是实体和属性，不是表和列
            // 按条件查询
            List<UserEntity> result1 = em.createQuery(
                            "SELECT u FROM UserEntity u WHERE u.age BETWEEN :min AND :max ORDER BY u.id DESC",
                            UserEntity.class)
                    .setParameter("min", 20)
                    .setParameter("max", 30)
                    .getResultList();
            System.out.println("age BETWEEN 20 AND 30: " + result1.size() + " 条");

            // 模糊查询
            List<UserEntity> result2 = em.createQuery(
                            "SELECT u FROM UserEntity u WHERE u.username LIKE :keyword",
                            UserEntity.class)
                    .setParameter("keyword", "%zhang%")
                    .getResultList();
            System.out.println("username LIKE '%zhang%': " + result2.size() + " 条");

            // 聚合查询
            Long count = em.createQuery(
                            "SELECT COUNT(u) FROM UserEntity u WHERE u.status = :status",
                            Long.class)
                    .setParameter("status", 1)
                    .getSingleResult();
            System.out.println("status=1 的用户数: " + count);

            // 清理
            em.createQuery("DELETE FROM UserEntity u WHERE u.username LIKE 'jpa_%'").executeUpdate();
            tx.commit();
        } catch (Exception e) {
            tx.rollback();
            throw new RuntimeException(e);
        } finally {
            em.close();
        }
    }

    // ======================== 4. Criteria API（类型安全查询） =====================
    static void demoCriteriaApi(EntityManagerFactory emf) {
        System.out.println("\n===== Criteria API（类型安全，等价于 LambdaQueryWrapper） =====");

        EntityManager em = emf.createEntityManager();
        EntityTransaction tx = em.getTransaction();
        tx.begin();
        try {
            em.persist(new UserEntity("criteria_1", "pwd", "c1@test.com", 18, 1));
            em.persist(new UserEntity("criteria_2", "pwd", "c2@test.com", 40, 1));

            CriteriaBuilder cb = em.getCriteriaBuilder();
            CriteriaQuery<UserEntity> cq = cb.createQuery(UserEntity.class);
            Root<UserEntity> root = cq.from(UserEntity.class);

            // 动态条件拼装
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("status"), 1));           // status = 1
            predicates.add(cb.between(root.get("age"), 18, 35));       // age BETWEEN 18 AND 35
            cq.where(predicates.toArray(new Predicate[0]));
            cq.orderBy(cb.desc(root.get("id")));

            List<UserEntity> result = em.createQuery(cq).getResultList();
            System.out.println("Criteria 查询结果数: " + result.size());
            result.forEach(u -> System.out.println("  " + u));

            // 清理
            em.createQuery("DELETE FROM UserEntity u WHERE u.username LIKE 'criteria_%'").executeUpdate();
            tx.commit();
        } catch (Exception e) {
            tx.rollback();
            throw new RuntimeException(e);
        } finally {
            em.close();
        }
    }

    // ======================== 5. 分页查询 ========================
    static void demoPagination(EntityManagerFactory emf) {
        System.out.println("\n===== 分页查询 =====");

        EntityManager em = emf.createEntityManager();
        EntityTransaction tx = em.getTransaction();
        tx.begin();
        try {
            // 插入一批数据
            for (int i = 1; i <= 5; i++) {
                em.persist(new UserEntity("page_user" + i, "pwd", "page" + i + "@test.com", 20 + i, 1));
            }

            int page = 0;   // JPA 页码从 0 开始！
            int size = 2;
            List<UserEntity> users = em.createQuery(
                            "SELECT u FROM UserEntity u WHERE u.username LIKE :kw ORDER BY u.id DESC",
                            UserEntity.class)
                    .setParameter("kw", "page_%")
                    .setFirstResult(page * size) // 偏移量
                    .setMaxResults(size)         // 每页条数
                    .getResultList();
            System.out.println("第" + (page + 1) + "页（每页" + size + "条）:");
            users.forEach(u -> System.out.println("  " + u));

            // 清理
            em.createQuery("DELETE FROM UserEntity u WHERE u.username LIKE 'page_%'").executeUpdate();
            tx.commit();
        } catch (Exception e) {
            tx.rollback();
            throw new RuntimeException(e);
        } finally {
            em.close();
        }
    }
}
