package learn.persistence.pool;

import java.util.ArrayDeque;
import java.util.Queue;

public class ConnectionPoolConceptDemo {

    public static void main(String[] args) {
        System.out.println("Connection pool concept");

        // 手写连接池只用于演示原理：提前准备 3 个“连接对象”，用完后再放回池中复用。
        SimpleConnectionPool pool = new SimpleConnectionPool(3);
        PooledConnection c1 = pool.borrowConnection();
        PooledConnection c2 = pool.borrowConnection();

        System.out.println("Borrowed: " + c1 + ", " + c2);
        System.out.println("Available after borrow: " + pool.availableCount());

        pool.returnConnection(c1);
        pool.returnConnection(c2);

        System.out.println("Available after return: " + pool.availableCount());
        System.out.println("Real projects usually use HikariCP instead of writing a pool by hand.");
        System.out.println();
        // 真实项目通常直接使用成熟连接池，例如 HikariCP。
        HikariConnectionPoolDemo.main(new String[]{});
    }
}

class SimpleConnectionPool {
    // 队列中保存当前空闲的连接；借出时出队，归还时入队。
    private final Queue<PooledConnection> availableConnections = new ArrayDeque<>();

    SimpleConnectionPool(int size) {
        // 模拟应用启动时预先创建连接，避免每次访问数据库都重新建立连接。
        for (int i = 1; i <= size; i++) {
            availableConnections.add(new PooledConnection(i));
        }
    }

    PooledConnection borrowConnection() {
        // poll 会取出并移除队头元素；返回 null 表示当前没有可用连接。
        PooledConnection connection = availableConnections.poll();
        if (connection == null) {
            throw new IllegalStateException("No connection available.");
        }
        return connection;
    }

    void returnConnection(PooledConnection connection) {
        // 真实连接池中，Connection.close() 通常不是关闭物理连接，而是把连接归还给池。
        availableConnections.offer(connection);
    }

    int availableCount() {
        return availableConnections.size();
    }
}

class PooledConnection {
    // 这里的 id 只是为了打印区分不同连接，不代表真实数据库连接属性。
    private final int id;

    PooledConnection(int id) {
        this.id = id;
    }

    @Override
    public String toString() {
        return "connection-" + id;
    }
}
