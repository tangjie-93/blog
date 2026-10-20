package learn.persistence.sql;

public class SqlBasicsDemo {

    public static void main(String[] args) {
        System.out.println("MySQL schema and SQL basics");
        printSchema();
        printCrudExamples();
        printAdvancedQueryExamples();
        printTransactionExamples();
    }

    private static void printSchema() {
        System.out.println("\n-- users table");
        System.out.println("""
                CREATE TABLE users (
                    id BIGINT PRIMARY KEY AUTO_INCREMENT,
                    username VARCHAR(50) NOT NULL UNIQUE,
                    password VARCHAR(100) NOT NULL,
                    email VARCHAR(100),
                    age INT,
                    status TINYINT DEFAULT 1,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
                """);

        System.out.println("-- orders table");
        System.out.println("""
                CREATE TABLE orders (
                    id BIGINT PRIMARY KEY AUTO_INCREMENT,
                    order_no VARCHAR(50) NOT NULL UNIQUE,
                    user_id BIGINT NOT NULL,
                    amount DECIMAL(10,2) NOT NULL,
                    status TINYINT DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
                """);
    }

    private static void printCrudExamples() {
        System.out.println("-- CRUD");
        System.out.println("INSERT INTO users (username, password, email, age) VALUES ('zhangsan', '123456', 'zhangsan@example.com', 25);");
        System.out.println("SELECT id, username, email FROM users WHERE age BETWEEN 20 AND 30 ORDER BY id DESC LIMIT 10;");
        System.out.println("UPDATE users SET email = 'new@example.com' WHERE id = 1;");
        System.out.println("DELETE FROM users WHERE id = 1;");
    }

    private static void printAdvancedQueryExamples() {
        System.out.println("\n-- joins, grouping, indexes, views");
        System.out.println("""
                SELECT u.username, o.order_no, o.amount
                FROM users u
                LEFT JOIN orders o ON u.id = o.user_id;

                SELECT user_id, SUM(amount) AS total_amount
                FROM orders
                GROUP BY user_id
                HAVING total_amount > 1000;

                CREATE INDEX idx_users_email ON users(email);

                CREATE VIEW user_orders AS
                SELECT u.username, o.order_no, o.amount
                FROM users u
                JOIN orders o ON u.id = o.user_id;
                """);
    }

    private static void printTransactionExamples() {
        System.out.println("-- transaction");
        System.out.println("""
                START TRANSACTION;
                UPDATE accounts SET balance = balance - 100 WHERE id = 1;
                UPDATE accounts SET balance = balance + 100 WHERE id = 2;
                COMMIT;
                """);
    }
}
