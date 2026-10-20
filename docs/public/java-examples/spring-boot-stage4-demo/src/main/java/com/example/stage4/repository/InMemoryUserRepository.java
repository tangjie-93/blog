package com.example.stage4.repository;

import com.example.stage4.entity.User;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * 用户内存仓库。
 *
 * Repository 负责“数据从哪里来”。当前用 Map 模拟数据库，后续可以替换成 MyBatis/JPA。
 */
@Repository
@Profile("memory")
public class InMemoryUserRepository implements UserRepository {

    private final Map<Long, User> users = new ConcurrentHashMap<>();
    private final AtomicLong idGenerator = new AtomicLong(0);

    @PostConstruct
    public void initData() {
        User admin = new User();
        admin.setUsername("admin");
        admin.setPassword("123456");
        admin.setNickname("管理员");
        admin.setEmail("admin@example.com");
        save(admin);
    }

    @Override
    public List<User> findAll() {
        return users.values()
                .stream()
                .sorted(Comparator.comparing(User::getId))
                .toList();
    }

    @Override
    public Optional<User> findById(Long id) {
        return Optional.ofNullable(users.get(id));
    }

    @Override
    public Optional<User> findByUsername(String username) {
        return users.values()
                .stream()
                .filter(user -> user.getUsername().equals(username))
                .findFirst();
    }

    @Override
    public User save(User user) {
        LocalDateTime now = LocalDateTime.now();
        if (user.getId() == null) {
            user.setId(idGenerator.incrementAndGet());
            user.setCreatedAt(now);
        }
        user.setUpdatedAt(now);
        users.put(user.getId(), copy(user));
        return copy(user);
    }

    @Override
    public void deleteById(Long id) {
        users.remove(id);
    }

    private User copy(User source) {
        User target = new User();
        target.setId(source.getId());
        target.setUsername(source.getUsername());
        target.setPassword(source.getPassword());
        target.setNickname(source.getNickname());
        target.setEmail(source.getEmail());
        target.setCreatedAt(source.getCreatedAt());
        target.setUpdatedAt(source.getUpdatedAt());
        return target;
    }
}
