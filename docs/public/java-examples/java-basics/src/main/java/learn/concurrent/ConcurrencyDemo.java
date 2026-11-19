package learn.concurrent;

import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.concurrent.locks.*;

/**
 * 并发编程 Demo
 *
 * 【核心总结】
 * 三种创建线程方式：extends Thread、implements Runnable、Lambda 表达式。
 * 并发三大问题：原子性、可见性、有序性。
 *
 * 【高频要点】
 * - 线程生命周期：NEW → RUNNABLE → BLOCKED/WAITING/TIMED_WAITING → TERMINATED
 * - 线程方法：start() 启动，sleep() 休眠，join() 等待，yield() 让步
 * - 同步：
 * synchronized（互斥锁，方法/代码块），Lock（ReentrantLock，可中断、tryLock）
 * - 线程池（ExecutorService）：避免频繁创建销毁线程，用 submit 提交任务
 * - 原子类（AtomicInteger 等）：CAS 无锁，比 synchronized 轻量
 * - volatile：保证可见性、禁止指令重排，但不保证原子性
 * - 线程安全集合：ConcurrentHashMap（分段锁）、CopyOnWriteArrayList（写时复制）
 */
public class ConcurrencyDemo {

    public static void main(String[] args) throws Exception {
        System.out.println("========== 1. 创建线程 ==========");

        Thread thread1 = new MyThread();
        thread1.start();

        Thread thread2 = new Thread(new MyRunnable());
        thread2.start();

        Thread thread3 = new Thread(() -> {
            System.out.println("Lambda线程: " + Thread.currentThread().getName());
        });
        thread3.start();

        thread1.join();
        thread2.join();
        thread3.join();

        System.out.println("\n========== 2. 线程常用方法 ==========");

        Thread current = Thread.currentThread();
        System.out.println("当前线程名: " + current.getName());
        System.out.println("线程ID: " + current.getId());
        System.out.println("线程优先级: " + current.getPriority());
        System.out.println("是否存活: " + current.isAlive());

        System.out.println("休眠前: " + System.currentTimeMillis());
        Thread.sleep(100);
        System.out.println("休眠后: " + System.currentTimeMillis());

        System.out.println("\n========== 3. 线程安全问题 ==========");

        UnsafeCounter unsafeCounter = new UnsafeCounter();
        Thread[] threads1 = new Thread[100];
        for (int i = 0; i < 100; i++) {
            threads1[i] = new Thread(unsafeCounter::increment);
            // 等价：new Thread(() -> unsafeCounter.increment());
            // 等价传统写法：new Thread(new Runnable() { public void run() { unsafeCounter.increment(); } });
            threads1[i].start();
        }
        for (Thread t : threads1)
            t.join();
        System.out.println("不安全计数器结果: " + unsafeCounter.getCount() + " (期望100)");

        SafeCounter safeCounter = new SafeCounter();
        Thread[] threads2 = new Thread[100];
        for (int i = 0; i < 100; i++) {
            threads2[i] = new Thread(safeCounter::increment);
            // 等价：new Thread(() -> safeCounter.increment());
            // 等价传统写法：new Thread(new Runnable() { public void run() { safeCounter.increment(); } });
            threads2[i].start();
        }
        for (Thread t : threads2)
            t.join();
        System.out.println("synchronized计数器结果: " + safeCounter.getCount() + " (期望100)");

        AtomicCounter atomicCounter = new AtomicCounter();
        Thread[] threads3 = new Thread[100];
        for (int i = 0; i < 100; i++) {
            threads3[i] = new Thread(atomicCounter::increment);
            // 等价：new Thread(() -> atomicCounter.increment());
            // 等价传统写法：new Thread(new Runnable() { public void run() { atomicCounter.increment(); } });
            threads3[i].start();
        }
        for (Thread t : threads3)
            t.join();
        System.out.println("Atomic计数器结果: " + atomicCounter.getCount() + " (期望100)");

        System.out.println("\n========== 4. synchronized ==========");

        SyncDemo syncDemo = new SyncDemo();
        Thread t1 = new Thread(() -> {
            for (int i = 0; i < 5; i++) {
                syncDemo.syncMethod("A" + i);
            }
        });
        Thread t2 = new Thread(() -> {
            for (int i = 0; i < 5; i++) {
                syncDemo.syncMethod("B" + i);
            }
        });
        t1.start();
        t2.start();
        t1.join();
        t2.join();

        System.out.println("\n========== 5. Lock（ReentrantLock） ==========");

        LockDemo lockDemo = new LockDemo();
        Thread lt1 = new Thread(() -> {
            lockDemo.increment();
            System.out.println("线程1完成");
        });
        Thread lt2 = new Thread(() -> {
            lockDemo.increment();
            System.out.println("线程2完成");
        });
        lt1.start();
        lt2.start();
        lt1.join();
        lt2.join();
        System.out.println("Lock计数器: " + lockDemo.getCount());

        System.out.println("\n========== 6. 线程池 ==========");
        // 固定线程池
        // 1. 固定线程数，所有任务按顺序执行，超出线程数的任务等待 
        ExecutorService fixedPool = Executors.newFixedThreadPool(3);
        for (int i = 0; i < 5; i++) {
            final int taskId = i;
            fixedPool.submit(() -> {
                System.out.println("任务" + taskId + " 由 " + Thread.currentThread().getName() + " 执行");
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                }
            });
        }
        // 关闭线程池，等待所有任务完成
        // 注意：shutdown() 方法不会阻塞，awaitTermination() 方法会阻塞，直到所有任务完成或超时
        fixedPool.shutdown();
        // 等待所有任务完成
        // 注意：awaitTermination() 方法会阻塞，直到所有任务完成或超时
        // 超时时间：5 秒
        fixedPool.awaitTermination(5, TimeUnit.SECONDS);

        System.out.println("\n========== 7. Callable和Future ==========");
        // Callable和Future 示例
        // 1. Callable 接口：返回值，可抛出异常
        // 2. Future 接口：获取任务执行结果，可取消任务
        ExecutorService pool = Executors.newFixedThreadPool(2);
        Future<String> future = pool.submit(() -> {
            Thread.sleep(500);
            return "任务完成: " + Thread.currentThread().getName();
        });
        String result = future.get();
        System.out.println("Future结果: " + result);
        pool.shutdown();

        System.out.println("\n========== 8. CompletableFuture ==========");
        // CompletableFuture = 异步任务的流水线，每一步完成自动走下一步，不用自己手动 get() 等。
        CompletableFuture<String> cf1 = CompletableFuture.supplyAsync(() -> {
            try {
                Thread.sleep(200);
            } catch (InterruptedException e) {
            }
            return "Hello";
        });
        CompletableFuture<String> cf2 = CompletableFuture.supplyAsync(() -> {
            try {
                Thread.sleep(300);
            } catch (InterruptedException e) {
            }
            return "World";
        });

        CompletableFuture<String> cf3 = cf1.thenApply(s -> s + " Java");
        System.out.println("thenApply: " + cf3.get());

        cf1.thenAccept(s -> System.out.println("thenAccept: " + s));

        CompletableFuture<String> combined = cf1.thenCombine(cf2, (s1, s2) -> s1 + " " + s2);
        System.out.println("thenCombine: " + combined.get());

        CompletableFuture.supplyAsync(() -> "Hello")
                .thenApply(s -> s + " World")
                .thenApply(String::toUpperCase)
                .thenAccept(System.out::println);

        System.out.println("\n========== 9. 并发集合 ==========");
        // ConcurrentHashMap = 线程安全的 HashMap，支持并发操作
        ConcurrentHashMap<String, Integer> concurrentMap = new ConcurrentHashMap<>();
        concurrentMap.put("A", 1);
        concurrentMap.put("B", 2);
        concurrentMap.putIfAbsent("C", 3);
        System.out.println("ConcurrentHashMap: " + concurrentMap);
        // CopyOnWriteArrayList = 线程安全的 ArrayList，支持并发操作
        // 写时复制：每次 add/remove 都复制整个数组，写操作昂贵
        CopyOnWriteArrayList<String> cowList = new CopyOnWriteArrayList<>();
        cowList.add("A");
        cowList.add("B");
        cowList.add("C");
        System.out.println("CopyOnWriteArrayList: " + cowList);

        BlockingQueue<String> queue = new LinkedBlockingQueue<>(5);
        Thread producer = new Thread(() -> {
            try {
                for (int i = 0; i < 5; i++) {
                    queue.put("消息" + i);
                    System.out.println("生产: 消息" + i);
                    Thread.sleep(50);
                }
            } catch (InterruptedException e) {
            }
        });
        Thread consumer = new Thread(() -> {
            try {
                for (int i = 0; i < 5; i++) {
                    String msg = queue.take();
                    System.out.println("消费: " + msg);
                    Thread.sleep(100);
                }
            } catch (InterruptedException e) {
            }
        });
        producer.start();
        consumer.start();
        producer.join();
        consumer.join();

        System.out.println("\n========== 10. 实战示例：模拟抢票 ==========");

        TicketSystem ticketSystem = new TicketSystem(10);
        Thread[] buyers = new Thread[10];
        for (int i = 0; i < 10; i++) {
            final int buyerId = i + 1;
            buyers[i] = new Thread(() -> {
                boolean success = ticketSystem.buyTicket("用户" + buyerId);
                if (!success)
                    System.out.println("用户" + buyerId + " 抢票失败");
            });
        }
        for (Thread t : buyers)
            t.start();
        for (Thread t : buyers)
            t.join();
        System.out.println("剩余票数: " + ticketSystem.getRemaining());
    }
}

class MyThread extends Thread {
    @Override
    public void run() {
        System.out.println("MyThread: " + Thread.currentThread().getName());
    }
}

class MyRunnable implements Runnable {
    @Override
    public void run() {
        System.out.println("MyRunnable: " + Thread.currentThread().getName());
    }
}

class UnsafeCounter {
    private int count = 0;

    public void increment() {
        count++;
    }

    public int getCount() {
        return count;
    }
}

class SafeCounter {
    private int count = 0;

    public synchronized void increment() {
        count++;
    }

    public int getCount() {
        return count;
    }
}

class AtomicCounter {
    private AtomicInteger count = new AtomicInteger(0);

    public void increment() {
        count.incrementAndGet();
    }

    public int getCount() {
        return count.get();
    }
}

class SyncDemo {
    public synchronized void syncMethod(String message) {
        System.out.println(message + " -> " + Thread.currentThread().getName());
        try {
            Thread.sleep(50);
        } catch (InterruptedException e) {
        }
    }
}

class LockDemo {
    private final Lock lock = new ReentrantLock();
    private int count = 0;

    public void increment() {
        lock.lock();
        try {
            count++;
            Thread.sleep(50);
        } catch (InterruptedException e) {
            e.printStackTrace();
        } finally {
            lock.unlock();
        }
    }

    public int getCount() {
        return count;
    }
}

class TicketSystem {
    private int tickets;
    private final Lock lock = new ReentrantLock();

    public TicketSystem(int tickets) {
        this.tickets = tickets;
    }

    public boolean buyTicket(String buyer) {
        lock.lock();
        try {
            if (tickets > 0) {
                tickets--;
                System.out.println(buyer + " 抢票成功！剩余: " + tickets);
                return true;
            }
            return false;
        } finally {
            lock.unlock();
        }
    }

    public int getRemaining() {
        return tickets;
    }
}
