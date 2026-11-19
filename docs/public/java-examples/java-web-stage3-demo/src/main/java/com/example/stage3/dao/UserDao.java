package com.example.stage3.dao;

import com.example.stage3.model.User;

import java.util.List;
import java.util.Optional;

/**
 * 用户 DAO 接口 — 定义数据访问契约，与具体存储（内存/MySQL/MongoDB）解耦
 *
 * 实现类 InMemoryUserDao 标注 @Repository，Spring 自动注入
 */
public interface UserDao {
    /** 查询全部 */
    List<User> findAll();

    /** 按 ID 查，找不到返回 Optional.empty() */
    Optional<User> findById(Long id);

    /** 按用户名查，用于注册时的唯一性校验和登录 */
    Optional<User> findByUsername(String username);

    /** 保存（id 为 null 则新增，否则更新） */
    User save(User user);

    /** 按 ID 删除 */
    void deleteById(Long id);
}
