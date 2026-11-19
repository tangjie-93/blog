package learn.persistence.mybatis;

public class MybatisConceptDemo {

    public static void main(String[] args) {
        System.out.println("MyBatis concept");
        System.out.println("Mapper interface declares Java methods.");
        System.out.println("Mapper XML binds method names to SQL statements.");
        System.out.println("SqlSession creates mapper proxies and controls commit/rollback.");

        UserQuery query = new UserQuery();
        query.setUsername("zhang");
        query.setMinAge(20);
        query.setMaxAge(30);
        query.setStatus(1);

        String sql = new DynamicSqlBuilder().buildFindByConditionSql(query);
        System.out.println("\nDynamic SQL idea:");
        System.out.println(sql);
    }
}
