-- ============================================================
-- java-web-stage3-demo 数据库建表脚本
--
-- 执行方式：mysql -u root -p test_db < stage3-schema.sql
-- ============================================================

USE test_db;

-- 创建 users 表（如果已存在则跳过）
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    age INT,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',     -- stage3 特有的角色字段
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_age (age)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
