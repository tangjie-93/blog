package learn.persistence.jdbc;

/**
 * 数据库连接配置
 * 
 * 【核心】5 个 JDBC URL 参数：
 * - useSSL=false     → 关闭 SSL（本地开发不需要加密连接）
 * - serverTimezone   → 必须指定时区，否则 MySQL 8+ 报错
 * - characterEncoding → UTF-8 防止中文乱码
 * - ? 表示参数开始，& 连接多个参数
 */
public final class DatabaseConfig {
    public static final String URL = "jdbc:mysql://localhost:3306/test_db?useSSL=false&serverTimezone=UTC&characterEncoding=utf8";
    public static final String USER = "root";
    public static final String PASSWORD = "Jamestang93!";

    private DatabaseConfig() {
    }
}
