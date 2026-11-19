package learn.persistence.mybatis;

import learn.persistence.model.User;
import org.apache.ibatis.io.Resources;
import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.session.SqlSessionFactoryBuilder;

import java.io.IOException;
import java.io.Reader;
import java.util.List;

public class RealMybatisDynamicSqlDemo {

    public static void main(String[] args) throws IOException {
        System.out.println("Real MyBatis dynamic SQL demo");

        UserQuery query = new UserQuery();
        query.setUsername("zhang");
        query.setMinAge(20);
        query.setMaxAge(30);
        query.setStatus(1);

        // 这段只是打印“动态 SQL 最终大概长什么样”，方便和 XML 对照学习。
        // 真正执行 SQL 的不是 DynamicSqlBuilder，而是下面的 mapper.findByCondition(query)。
        String previewSql = new DynamicSqlBuilder().buildFindByConditionSql(query);
        System.out.println("Preview SQL:");
        System.out.println(previewSql);

        // 读取 MyBatis 总配置文件：里面配置数据库连接和 mapper XML 文件位置。
        try (Reader reader = Resources.getResourceAsReader("mybatis-config.xml")) {
            SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(reader);

            // SqlSession 代表一次数据库会话，用完必须关闭。
            // openSession(true) 表示自动提交事务；查询场景影响不大，写入时会自动 commit。
            try (SqlSession sqlSession = sqlSessionFactory.openSession(true)) {
                // MyBatis 会根据 UserMapper 接口 + UserMapper.xml 生成代理对象。
                UserMapper mapper = sqlSession.getMapper(UserMapper.class);

                // 这里才是真实执行 UserMapper.xml 中 <select id="findByCondition"> 的地方。
                // query 中哪些字段不为空，XML 里的哪些 <if> 条件就会加入 SQL。
                List<User> users = mapper.findByCondition(query);

                System.out.println("Query result:");
                for (User user : users) {
                    System.out.println(user);
                }
            }
        }
    }
}
