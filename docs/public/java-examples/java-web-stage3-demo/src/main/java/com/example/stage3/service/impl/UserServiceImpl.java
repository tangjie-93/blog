package com.example.stage3.service.impl;

import com.example.stage3.dao.UserDao;
import com.example.stage3.dto.LoginRequest;
import com.example.stage3.dto.UserRequest;
import com.example.stage3.exception.BusinessException;
import com.example.stage3.model.User;
import com.example.stage3.service.UserService;
import com.example.stage3.support.PageResult;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * 用户业务实现 — Controller 不直接操作 DAO，业务逻辑统一放在这里
 *
 * 调用链：@ServiceLogAspect(AOP) 织入 → UserServiceImpl → InMemoryUserDao
 * 依赖注入：构造函数注入 UserDao（Spring 自动找到唯一实现 InMemoryUserDao）
 */
@Service
public class UserServiceImpl implements UserService {
    private final UserDao userDao;

    public UserServiceImpl(UserDao userDao) {
        this.userDao = userDao;
    }

    /** 分页查询：全量取 → 内存切片 → 返回 PageResult（真实项目应改为 SQL LIMIT） */
    @Override
    public PageResult<User> findByPage(int page, int size) {
        List<User> users = userDao.findAll();
        int safePage = Math.max(page, 1);
        int safeSize = Math.max(size, 1);
        int fromIndex = Math.min((safePage - 1) * safeSize, users.size());
        int toIndex = Math.min(fromIndex + safeSize, users.size());
        return new PageResult<>(users.subList(fromIndex, toIndex), users.size(), safePage, safeSize);
    }

    /** 按 ID 查，找不到抛 404 */
    @Override
    public User findById(Long id) {
        return userDao.findById(id)
                .orElseThrow(() -> new BusinessException(404, "user not found"));
    }

    /** 注册：先校验用户名唯一 → new User → save → 返回 */
    @Override
    public User create(UserRequest request) {
        userDao.findByUsername(request.getUsername()).ifPresent(user -> {
            throw new BusinessException(409, "username already exists");
        });
        return userDao.save(new User(
                null,                              // id 为 null，DAO 会自动生成
                request.getUsername(),
                request.getPassword(),
                request.getEmail(),
                request.getAge(),
                normalizeRole(request.getRole())
        ));
    }

    /** 全量更新（PUT）：覆盖所有字段 */
    @Override
    public User update(Long id, UserRequest request) {
        User user = findById(id);
        user.setUsername(request.getUsername());
        user.setPassword(request.getPassword());
        user.setEmail(request.getEmail());
        user.setAge(request.getAge());
        user.setRole(normalizeRole(request.getRole()));
        return userDao.save(user);
    }

    /**
     * 部分更新（PATCH）：只更新传入的字段
     * 用 Map 接收参数，containsKey 判断哪些字段传了
     */
    @Override
    public User patch(Long id, Map<String, Object> updates) {
        User user = findById(id);
        if (updates.containsKey("email")) {
            user.setEmail(String.valueOf(updates.get("email")));
        }
        if (updates.containsKey("age")) {
            user.setAge(Integer.valueOf(String.valueOf(updates.get("age"))));
        }
        if (updates.containsKey("role")) {
            user.setRole(normalizeRole(String.valueOf(updates.get("role"))));
        }
        return userDao.save(user);
    }

    /** 删除：先查（确认存在），再删 */
    @Override
    public void deleteById(Long id) {
        findById(id);
        userDao.deleteById(id);
    }

    /** 登录：按用户名查 → 比对密码 → 返回用户 （安全提示：生产环境密码应 BCrypt 加密） */
    @Override
    public User login(LoginRequest request) {
        User user = userDao.findByUsername(request.getUsername())
                .orElseThrow(() -> new BusinessException(401, "invalid username or password"));
        if (!user.getPassword().equals(request.getPassword())) {
            throw new BusinessException(401, "invalid username or password");
        }
        return user;
    }

    /** 规范化角色：null 或空白 → "USER"，否则转大写 */
    private String normalizeRole(String role) {
        return role == null || role.isBlank() ? "USER" : role.toUpperCase();
    }
}
