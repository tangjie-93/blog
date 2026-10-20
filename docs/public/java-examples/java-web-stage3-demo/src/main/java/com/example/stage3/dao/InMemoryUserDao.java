package com.example.stage3.dao;

import com.example.stage3.model.User;
import org.springframework.stereotype.Repository;

import javax.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * 用户 DAO 内存实现 — 用 ConcurrentHashMap 模拟数据库存储（学习用）
 *
 * 切换方式：去掉下面 @Repository 的注释，同时给 MybatisUserDao 的 @Repository 加注释
 * 或使用 @Profile("memory") / @Profile("db") 按环境切换
 */
//@Repository    // 已切换到 MybatisUserDao，需要内存版时取消此行注释
public class InMemoryUserDao implements UserDao {
    private final Map<Long, User> users = new ConcurrentHashMap<>();  // 线程安全的存储
    private final AtomicLong idSequence = new AtomicLong(0);          // 自增 ID 生成器

    /** 启动时预置两个测试用户（admin + demo） */
    @PostConstruct
    public void initData() {
        save(new User(null, "admin", "admin123", "admin@example.com", 30, "ADMIN"));
        save(new User(null, "demo", "demo123", "demo@example.com", 22, "USER"));
    }

    /** 查询全部用户，按 ID 排序 */
    @Override
    public List<User> findAll() {
        List<User> result = new ArrayList<>(users.values());
        result.sort(Comparator.comparing(User::getId));
        return result;
    }

    /** 按 ID 查，找不到返回 Optional.empty() */
    @Override
    public Optional<User> findById(Long id) {
        return Optional.ofNullable(users.get(id));
    }

    /** 按用户名查（遍历 map，数据量大时需要索引） */
    @Override
    public Optional<User> findByUsername(String username) {
        return users.values().stream()
                .filter(user -> user.getUsername().equals(username))
                .findFirst();
    }

    /**
     * 保存 / 更新：
     * - id == null → 新增，idSequence 自增分配 ID
     * - id != null → 更新已有记录（覆盖键）
     */
    @Override
    public User save(User user) {
        if (user.getId() == null) {
            user.setId(idSequence.incrementAndGet());
        }
        users.put(user.getId(), user);
        return user;
    }

    /** 按 ID 删除 */
    @Override
    public void deleteById(Long id) {
        users.remove(id);
    }
}
