package com.example.stage4.controller;

import com.example.stage4.common.Result;
import com.example.stage4.dto.LoginRequest;
import com.example.stage4.dto.UserCreateRequest;
import com.example.stage4.dto.UserUpdateRequest;
import com.example.stage4.service.UserService;
import com.example.stage4.vo.UserVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 用户 Controller。
 *
 * Controller 只负责接收 HTTP 请求、调用 Service、返回 Result。
 */
@Tag(name = "用户管理")
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @Operation(summary = "用户列表")
    @GetMapping
    public Result<List<UserVO>> listUsers() {
        return Result.success(userService.listUsers());
    }

    @Operation(summary = "用户详情")
    @GetMapping("/{id}")
    public Result<UserVO> getUser(@PathVariable Long id) {
        return Result.success(userService.getUser(id));
    }

    @Operation(summary = "注册用户")
    @PostMapping("/register")
    public Result<UserVO> register(@Valid @RequestBody UserCreateRequest request) {
        return Result.success("注册成功", userService.register(request));
    }

    @Operation(summary = "更新用户资料")
    @PutMapping("/{id}")
    public Result<UserVO> updateUser(@PathVariable Long id, @Valid @RequestBody UserUpdateRequest request) {
        return Result.success("用户资料更新成功", userService.updateUser(id, request));
    }

    @Operation(summary = "删除用户")
    @DeleteMapping("/{id}")
    public Result<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return Result.success("用户删除成功", null);
    }

    @Operation(summary = "用户登录")
    @PostMapping("/login")
    public Result<Map<String, String>> login(@Valid @RequestBody LoginRequest request) {
        Map<String, String> data = new LinkedHashMap<>();
        data.put("token", userService.login(request));
        data.put("tokenType", "Bearer");
        return Result.success("登录成功", data);
    }
}
