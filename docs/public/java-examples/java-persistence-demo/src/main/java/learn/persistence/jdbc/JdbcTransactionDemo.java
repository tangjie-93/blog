package learn.persistence.jdbc;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;

/**
 * JDBC 事务 Demo（转账示例）
 *
 * 【核心总结】
 * 事务三步：关闭自动提交 → 执行业务 → 提交/回滚
 *
 * 【高频要点】
 * - 事务四大特性 ACID：原子性、一致性、隔离性、持久性
 * - conn.setAutoCommit(false)：关闭自动提交，手动控制事务
 * - conn.commit()：所有 SQL 都成功后提交
 * - conn.rollback()：任一失败就回滚，保证数据一致性
 * - finally 中恢复 conn.setAutoCommit(true)：归还连接池前的标配操作
 * - 金额必须用 BigDecimal，float/double 有精度丢失
 * - 事务内所有操作必须共用同一个 Connection
 */
public class JdbcTransactionDemo {

    public static void main(String[] args) {
        System.out.println("JDBC transaction workflow");
        System.out.println("conn.setAutoCommit(false) -> execute all statements -> commit");
        System.out.println("Any exception should rollback before the connection is closed.");
    }

    /**
     * 转账：A 扣钱 + B 加钱，要么都成功，要么都失败
     * 关键：所有操作共用一个 Connection，否则不是同一事务
     */
    public void transfer(Long fromId, Long toId, BigDecimal amount) throws SQLException {
        try (Connection conn = DriverManager.getConnection(DatabaseConfig.URL, DatabaseConfig.USER, DatabaseConfig.PASSWORD)) {
            // 1. 关闭自动提交 — 开启事务
            conn.setAutoCommit(false);

            try {
                // 2. 执行业务操作
                decreaseBalance(conn, fromId, amount);   // 扣钱
                increaseBalance(conn, toId, amount);     // 加钱
                // 3. 都成功 → 提交
                conn.commit();
            } catch (Exception e) {
                // 4. 任一失败 → 回滚（余额不变）
                conn.rollback();
                throw e;
            } finally {
                // 5. 恢复自动提交（避免影响下次使用同一连接）
                conn.setAutoCommit(true);
            }
        }
    }

    /**
     * 减余额
     */
    private void decreaseBalance(Connection conn, Long accountId, BigDecimal amount) throws SQLException {
        String sql = "UPDATE accounts SET balance = balance - ? WHERE id = ?";
        try (PreparedStatement statement = conn.prepareStatement(sql)) {
            statement.setBigDecimal(1, amount);
            statement.setLong(2, accountId);
            statement.executeUpdate();
        }
    }

    /**
     * 加余额
     */
    private void increaseBalance(Connection conn, Long accountId, BigDecimal amount) throws SQLException {
        String sql = "UPDATE accounts SET balance = balance + ? WHERE id = ?";
        try (PreparedStatement statement = conn.prepareStatement(sql)) {
            statement.setBigDecimal(1, amount);
            statement.setLong(2, accountId);
            statement.executeUpdate();
        }
    }
}
