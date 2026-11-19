package learn.persistence.pool;

import com.zaxxer.hikari.HikariDataSource;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class HikariConnectionPoolDemo {

    public static void main(String[] args) {
        System.out.println("HikariCP connection pool");
        System.out.println("1. Create one HikariDataSource when the application starts.");
        System.out.println("2. Use dataSource.getConnection() instead of DriverManager.getConnection().");
        System.out.println("3. connection.close() returns the connection to the pool.");
        System.out.println();

        showImplicitDataSourceClose();
        System.out.println();
        showExplicitDataSourceClose();
    }

    private static void showImplicitDataSourceClose() {
        System.out.println("Implicit close with try-with-resources:");

        // 隐式关闭写法：HikariDataSource 放在 try (...) 中。
        // 代码块结束时，Java 会自动调用 dataSource.close()。
        // 所以这里虽然看不到 close() 代码，控制台仍然会出现 HikariCP 的关闭日志。
        try (HikariDataSource dataSource = HikariDataSourceFactory.createDataSource()) {
            printPoolInfo(dataSource);
        }
    }

    private static void showExplicitDataSourceClose() {
        System.out.println("Explicit close with finally:");

        // 显式关闭写法：先创建连接池，再在 finally 中手动关闭。
        // 这种写法更容易看清楚“关闭整个连接池”的实际代码。
        HikariDataSource dataSource = HikariDataSourceFactory.createDataSource();
        try {
            printPoolInfo(dataSource);
        } finally {
            // 这里是“关闭整个连接池”的实际代码。
            // close() 会释放池中的物理数据库连接，所以控制台会看到
            // HikariCP 打印 "Shutdown initiated/completed" 日志。
            dataSource.close();
        }
    }

    private static void printPoolInfo(HikariDataSource dataSource) {
        System.out.println("Pool name: " + dataSource.getPoolName());
        System.out.println("Maximum pool size: " + dataSource.getMaximumPoolSize());
        System.out.println("Minimum idle: " + dataSource.getMinimumIdle());
    }

    public int countUsers() throws SQLException {
        String sql = "SELECT COUNT(*) FROM users";

        // 示例写法：先创建连接池，再从连接池中获取 JDBC Connection。
        // 教学项目里为了看清生命周期，把 dataSource.close() 写在 finally 中。
        HikariDataSource dataSource = HikariDataSourceFactory.createDataSource();
        try (Connection conn = dataSource.getConnection();
             PreparedStatement statement = conn.prepareStatement(sql);
             ResultSet resultSet = statement.executeQuery()) {
            // try-with-resources 会自动关闭 ResultSet、PreparedStatement、Connection。
            // 这里关闭 Connection 时，HikariCP 会把连接归还到池中，而不是断开物理连接。
            if (resultSet.next()) {
                return resultSet.getInt(1);
            }
            return 0;
        } finally {
            // 这里才是关闭整个连接池。
            // 真实项目中 HikariDataSource 通常是应用级单例，只在应用退出时关闭。
            dataSource.close();
        }
    }
}
