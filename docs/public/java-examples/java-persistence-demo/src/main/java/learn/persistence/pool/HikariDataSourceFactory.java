package learn.persistence.pool;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import learn.persistence.jdbc.DatabaseConfig;

public final class HikariDataSourceFactory {

    private HikariDataSourceFactory() {
    }

    public static HikariDataSource createDataSource() {
        // HikariConfig 用来集中描述连接池如何连接数据库、池子大小以及超时策略。
        HikariConfig config = new HikariConfig();

        // 复用 JDBC 章节中的数据库配置，避免在多个地方维护 URL、用户名和密码。
        config.setJdbcUrl(DatabaseConfig.URL);
        config.setUsername(DatabaseConfig.USER);
        config.setPassword(DatabaseConfig.PASSWORD);
        config.setDriverClassName("com.mysql.cj.jdbc.Driver");

        // 连接池基础参数：真实项目需要根据数据库容量和应用并发量调整。
        config.setPoolName("persistence-demo-pool");
        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);

        // 超时和生命周期参数，防止线程长期等待连接或连接无限期存活。
        config.setConnectionTimeout(30_000);    // 等连接最多 30 秒，超时抛异常
        config.setIdleTimeout(600_000);         // 空闲连接 10 分钟没人用就回收
        config.setMaxLifetime(1_800_000);       // 连接最长活 30 分钟，必须 < MySQL wait_timeout，防止"死连接"

        // Keep the teaching demo startable even when local MySQL is not running.
        config.setInitializationFailTimeout(-1);  // -1 = 连接失败也不抛异常，让 Demo 在无 MySQL 时也能启动

        return new HikariDataSource(config);
    }
}
