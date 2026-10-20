package com.example.stage3.dao;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.stage3.dao.mapper.UserMapper;
import com.example.stage3.model.User;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 用户 DAO 数据库实现 — 底层使用 MyBatis-Plus 操作 MySQL
 *
 * 替换了 InMemoryUserDao，对外接口 UserDao 完全不变，Service 层零改动
 * 注入 UserMapper（MyBatis-Plus 通过 @MapperScan 自动生成的代理对象）
 */
@Repository
public class MybatisUserDao implements UserDao {

    private final UserMapper userMapper;

    /** 构造函数注入 UserMapper（MyBatis-Plus 自动创建的代理实现） */
    public MybatisUserDao(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    /** 查询全部用户，按 ID 降序 */
    @Override
    public List<User> findAll() {
        return userMapper.selectList(
                new LambdaQueryWrapper<User>().orderByDesc(User::getId)
        );
    }

    /** 按 ID 查，找不到返回 Optional.empty() */
    @Override
    public Optional<User> findById(Long id) {
        return Optional.ofNullable(userMapper.selectById(id));
    }

    /** 按用户名精确查询（用于注册唯一性校验和登录） */
    @Override
    public Optional<User> findByUsername(String username) {
        return Optional.ofNullable(
                userMapper.selectOne(
                        new LambdaQueryWrapper<User>().eq(User::getUsername, username)
                )
        );
    }

    /**
     * 保存 / 更新：
     * - id == null → insert（数据库自增，MyBatis-Plus 自动回填 id）
     * - id != null → updateById（按 id 更新全部字段）
     */
    @Override
    public User save(User user) {
        if (user.getId() == null) {
            userMapper.insert(user);        // 自增 ID 执行后自动回填到 user.id
        } else {
            userMapper.updateById(user);
        }
        return user;
    }

    /** 按 ID 删除 */
    @Override
    public void deleteById(Long id) {
        userMapper.deleteById(id);
    }
}
