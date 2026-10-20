package com.example.stage3.controller;

import com.example.stage3.dto.LoginRequest;
import com.example.stage3.dto.UserRequest;
import com.example.stage3.model.User;
import com.example.stage3.service.UserService;
import com.example.stage3.support.PageResult;
import com.example.stage3.support.Result;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpSession;
import javax.validation.Valid;
import java.util.Map;

/**
 * 用户 REST 接口 — 负责接收 HTTP 请求、校验参数、调用 Service、统一返回 Result
 *
 * 依赖注入：Spring 容器自动将唯一实现 UserServiceImpl 注入到构造函数
 */
@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    /** 构造函数注入（推荐方式，比 @Autowired 更清晰） */
    public UserController(UserService userService) {
        this.userService = userService;
    }

    /** 分页查询：GET /api/users?page=1&size=10 */
    @GetMapping
    public Result<PageResult<User>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return Result.success(userService.findByPage(page, size));
    }

    /** 按 ID 查询：GET /api/users/1 */
    @GetMapping("/{id}")
    public Result<User> getById(@PathVariable Long id) {
        return Result.success(userService.findById(id));
    }

    /**
     * 注册：POST /api/users/register
     * - @Valid 触发 UserRequest 上的 @NotBlank/@Email 等校验
     * - @ResponseStatus(HttpStatus.CREATED) 返回 HTTP 201 而不是默认 200
     */
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public Result<User> register(@Valid @RequestBody UserRequest request) {
        return Result.success("created", userService.create(request));
    }

    /**
     * 登录：POST /api/users/login
     * - 登录成功后把用户信息存入 HttpSession，后续 AuthInterceptor 据此放行
     */
    @PostMapping("/login")
    public Result<User> login(@Valid @RequestBody LoginRequest request, HttpSession session) {
        User user = userService.login(request);
        session.setAttribute("loginUser", user);
        return Result.success("login success", user);
    }

    /** 全量更新：PUT /api/users/1  请求体包含所有字段 */
    @PutMapping("/{id}")
    public Result<User> update(@PathVariable Long id, @Valid @RequestBody UserRequest request) {
        return Result.success(userService.update(id, request));
    }

    /**
     * 部分更新：PATCH /api/users/1  只传要改的字段
     * 与 PUT 的区别：PATCH 不要求传全部字段，只更新传入的字段
     */
    @PatchMapping("/{id}")
    public Result<User> patch(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        return Result.success(userService.patch(id, updates));
    }

    /** 删除：DELETE /api/users/1 */
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        userService.deleteById(id);
        return Result.success();
    }
}
