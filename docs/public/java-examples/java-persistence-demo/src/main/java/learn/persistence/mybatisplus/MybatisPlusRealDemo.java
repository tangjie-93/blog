package learn.persistence.mybatisplus;

import com.baomidou.mybatisplus.core.MybatisSqlSessionFactoryBuilder;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import learn.persistence.model.User;
import org.apache.ibatis.io.Resources;
import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.session.SqlSessionFactory;

import java.io.Reader;
import java.util.List;

/**
 * MyBatis-Plus 实际使用 Demo，演示与原生 MyBatis（UserMapper.xml）的核心差异：
 * 1. BaseMapper：零 XML 即可完成增删改查
 * 2. QueryWrapper：链式 API 构建查询条件，替代 XML 中的 &lt;if&gt; 标签
 * 3. 分页插件：IPage + Page 完成物理分页
 */
public class MybatisPlusRealDemo {

    public static void main(String[] args) throws Exception {
        // ---- 1. 使用 MP 的 SqlSessionFactoryBuilder（兼容 MyBatis 原生配置） ----
        try (Reader reader = Resources.getResourceAsReader("mybatis-config.xml")) {
            // MybatisSqlSessionFactoryBuilder 是 MP 提供的增强版，会自动注入分页等插件
            SqlSessionFactory sqlSessionFactory = new MybatisSqlSessionFactoryBuilder().build(reader);

            try (SqlSession sqlSession = sqlSessionFactory.openSession(true)) {
                // MP 的 getMapper：返回的代理不仅支持自定义方法，还自动拥有 BaseMapper 的全部方法
                UserMapperMP mapper = sqlSession.getMapper(UserMapperMP.class);

                demoBaseMapper(mapper);
                demoQueryWrapper(mapper);
                demoLambdaQueryWrapper(mapper);
                demoUpdateWrapper(mapper);
                demoPagination(mapper);
            }
        }
    }

    // ======================== 1. BaseMapper 基础 CRUD ========================
    static void demoBaseMapper(UserMapperMP mapper) {
        System.out.println("===== BaseMapper 零 XML 的 CRUD =====");

        // 插入（主键自动回填，id 从 NULL 变为数据库自增值）
        User newUser = new User(null, "mp_user", "123456", "mp@test.com", 25, 1);
        mapper.insert(newUser); // 一行代码，无需写 <insert>
        System.out.println("插入后主键: " + newUser.getId());

        // 按主键查询
        User user = mapper.selectById(newUser.getId());
        System.out.println("按 ID 查:  " + user);

        // 更新（按主键更新全部字段）
        user.setEmail("mp_updated@test.com");
        mapper.updateById(user);
        System.out.println("更新后:     " + mapper.selectById(user.getId()));

        // 删除
        mapper.deleteById(user.getId());
        System.out.println("删除后查询: " + mapper.selectById(user.getId())); // null
    }

    // ======================== 2. QueryWrapper 条件查询 ========================
    static void demoQueryWrapper(UserMapperMP mapper) {
        System.out.println("\n===== QueryWrapper 条件构造 =====");

        // 等价于 XML: <where><if test="username != null">...</if></where>
        // 但用链式 API，更直观
        QueryWrapper<User> qw = new QueryWrapper<User>()
                .eq("status", 1)                         // status = 1
                .like("username", "zhang")               // username LIKE '%zhang%'
                .between("age", 18, 60)                  // age BETWEEN 18 AND 60
                .orderByDesc("id");                      // ORDER BY id DESC

        List<User> users = mapper.selectList(qw);
        System.out.println("条件查询结果数: " + users.size());
        users.forEach(u -> System.out.println("  " + u));
    }

    // ======================== 3. LambdaQueryWrapper 类型安全查询 ===============
    static void demoLambdaQueryWrapper(UserMapperMP mapper) {
        System.out.println("\n===== LambdaQueryWrapper（类型安全） =====");

        // LambdaQueryWrapper 用 User::getXxx 代替字符串列名，编译期就能发现拼写错误
        List<User> users = mapper.selectList(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<User>()
                        .eq(User::getStatus, 1)
                        .ge(User::getAge, 18)            // age >= 18
                        .le(User::getAge, 60)            // age <= 60
                        .orderByDesc(User::getId)
        );
        System.out.println("Lambda 条件查询结果数: " + users.size());
        users.forEach(u -> System.out.println("  " + u));
    }

    // ======================== 4. UpdateWrapper 条件更新 ========================
    static void demoUpdateWrapper(UserMapperMP mapper) {
        System.out.println("\n===== UpdateWrapper（按条件更新） =====");

        // 先插入一条测试数据
        User testUser = new User(null, "test_update", "pwd", "test@test.com", 20, 1);
        mapper.insert(testUser);

        // 按条件更新：将 status=0 的用户邮箱改为 null（批量更新，无需逐条查询）
        UpdateWrapper<User> uw = new UpdateWrapper<User>()
                .eq("username", "test_update")
                .set("email", null)
                .set("status", 0);
        int rows = mapper.update(uw); // 不需要传实体，条件在 UpdateWrapper 中
        System.out.println("更新行数: " + rows);

        // 验证
        User updated = mapper.selectById(testUser.getId());
        System.out.println("更新后: " + updated);

        // 清理
        mapper.deleteById(testUser.getId());
    }

    // ======================== 5. 分页查询 ========================
    static void demoPagination(UserMapperMP mapper) {
        System.out.println("\n===== 分页查询 =====");

        // Page(currentPage, pageSize) — 第1页，每页2条
        IPage<User> page = mapper.selectPage(
                new Page<>(1, 2),
                new QueryWrapper<User>().orderByDesc("id")
        );
        System.out.println("总记录数: " + page.getTotal());
        System.out.println("总页数:   " + page.getPages());
        System.out.println("当前页:   " + page.getCurrent());
        System.out.println("每页条数: " + page.getSize());
        page.getRecords().forEach(u -> System.out.println("  " + u));
    }
}
