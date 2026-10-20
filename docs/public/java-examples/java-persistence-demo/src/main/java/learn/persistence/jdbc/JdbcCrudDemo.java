package learn.persistence.jdbc;

import learn.persistence.model.User;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

/**
 * JDBC 增删改查（CRUD）Demo
 *
 * 【核心总结】
 * JDBC 四步走：获取连接 → 创建 PreparedStatement → 执行 SQL → 映射结果集
 *
 * 【高频要点】
 * - DriverManager.getConnection() 获取数据库连接
 * - PreparedStatement：预编译 SQL，用 ? 占位，防 SQL 注入
 * - executeUpdate()：INSERT/UPDATE/DELETE，返回影响行数
 * - executeQuery()：SELECT，返回 ResultSet
 * - ResultSet 映射：resultSet.next() 逐行读取，resultSet.getXxx("列名") 取值
 * - try-with-resources 自动关闭连接、Statement、ResultSet
 * - SQL 注入防御：绝不用字符串拼接 SQL，必须用 ? 占位符
 */
public class JdbcCrudDemo {

    public static void main(String[] args) {
        System.out.println("JDBC CRUD workflow");
        System.out.println("This demo shows real JDBC code. It is not executed automatically because no MySQL driver is bundled.");
        System.out.println("1. DriverManager.getConnection(url, user, password)");
        System.out.println("2. PreparedStatement with ? placeholders");
        System.out.println("3. executeUpdate for insert/update/delete");
        System.out.println("4. executeQuery and ResultSet mapping for select");
    }

    /**
     * INSERT 示例：? 占位符，setXxx 设值，executeUpdate 执行
     */
    public int insert(User user) throws SQLException {
        String sql = "INSERT INTO users (username, password, email, age, status) VALUES (?, ?, ?, ?, ?)";

        // try-with-resources：conn 和 statement 用完自动关闭
        try (Connection conn = DriverManager.getConnection(DatabaseConfig.URL, DatabaseConfig.USER, DatabaseConfig.PASSWORD);
             PreparedStatement statement = conn.prepareStatement(sql)) {
            // 参数索引从 1 开始（不是 0！）
            statement.setString(1, user.getUsername());
            statement.setString(2, user.getPassword());
            statement.setString(3, user.getEmail());
            statement.setInt(4, user.getAge());
            statement.setInt(5, user.getStatus());
            return statement.executeUpdate();  // 返回影响行数
        }
    }

    /**
     * UPDATE 示例
     */
    public int updateEmail(Long id, String email) throws SQLException {
        String sql = "UPDATE users SET email = ? WHERE id = ?";

        try (Connection conn = DriverManager.getConnection(DatabaseConfig.URL, DatabaseConfig.USER, DatabaseConfig.PASSWORD);
             PreparedStatement statement = conn.prepareStatement(sql)) {
            statement.setString(1, email);
            statement.setLong(2, id);
            return statement.executeUpdate();
        }
    }

    /**
     * DELETE 示例
     */
    public int deleteById(Long id) throws SQLException {
        String sql = "DELETE FROM users WHERE id = ?";

        try (Connection conn = DriverManager.getConnection(DatabaseConfig.URL, DatabaseConfig.USER, DatabaseConfig.PASSWORD);
             PreparedStatement statement = conn.prepareStatement(sql)) {
            statement.setLong(1, id);
            return statement.executeUpdate();
        }
    }

    /**
     * SELECT 单条：先 executeQuery，再 resultSet.next() 移动游标，然后 mapUser 映射
     */
    public User findById(Long id) throws SQLException {
        String sql = "SELECT id, username, password, email, age, status FROM users WHERE id = ?";

        try (Connection conn = DriverManager.getConnection(DatabaseConfig.URL, DatabaseConfig.USER, DatabaseConfig.PASSWORD);
             PreparedStatement statement = conn.prepareStatement(sql)) {
            statement.setLong(1, id);

            try (ResultSet resultSet = statement.executeQuery()) {  // ResultSet 也要 try-with-resources
                if (resultSet.next()) {  // next() 将游标移到下一行，false = 没数据
                    return mapUser(resultSet);
                }
            }
        }

        return null;
    }

    /**
     * SELECT 多条：while(resultSet.next()) 循环读取，每条映射后加入 List
     */
    public List<User> findActiveUsers(int minAge) throws SQLException {
        String sql = "SELECT id, username, password, email, age, status FROM users WHERE status = 1 AND age >= ? ORDER BY id DESC";
        List<User> users = new ArrayList<>();

        try (Connection conn = DriverManager.getConnection(DatabaseConfig.URL, DatabaseConfig.USER, DatabaseConfig.PASSWORD);
             PreparedStatement statement = conn.prepareStatement(sql)) {
            statement.setInt(1, minAge);

            try (ResultSet resultSet = statement.executeQuery()) {
                while (resultSet.next()) {  // 循环读每一行
                    users.add(mapUser(resultSet));
                }
            }
        }

        return users;
    }

    /**
     * ResultSet → User 对象映射
     * 核心：resultSet.getXxx("数据库列名") → user.setXxx(value)
     * 注意：列名建议与字段名一致，但类型必须匹配（如 age 是 int 用 getInt）
     */
    private User mapUser(ResultSet resultSet) throws SQLException {
        User user = new User();
        user.setId(resultSet.getLong("id"));
        user.setUsername(resultSet.getString("username"));
        user.setPassword(resultSet.getString("password"));
        user.setEmail(resultSet.getString("email"));
        user.setAge(resultSet.getInt("age"));
        user.setStatus(resultSet.getInt("status"));
        return user;
    }
}
