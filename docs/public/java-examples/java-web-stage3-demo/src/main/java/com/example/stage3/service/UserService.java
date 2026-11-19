package com.example.stage3.service;

import com.example.stage3.dto.LoginRequest;
import com.example.stage3.dto.UserRequest;
import com.example.stage3.model.User;
import com.example.stage3.support.PageResult;

import java.util.Map;

/**
 * 用户业务接口 — 定义业务契约，Controller 只依赖这个接口
 *
 * 实现类 UserServiceImpl 用 @Service 注册，Spring 自动注入
 */
public interface UserService {
    /** 分页查询 */
    PageResult<User> findByPage(int page, int size);

    /** 按 ID 查 */
    User findById(Long id);

    /** 注册 */
    User create(UserRequest request);

    /** 全量更新（PUT） */
    User update(Long id, UserRequest request);

    /** 部分更新（PATCH），只更新传入的字段 */
    User patch(Long id, Map<String, Object> updates);

    /** 按 ID 删除 */
    void deleteById(Long id);

    /** 登录，成功返回用户 */
    User login(LoginRequest request);
}
