package com.example.stage5.user.controller;

import com.alibaba.csp.sentinel.annotation.SentinelResource;
import com.alibaba.csp.sentinel.slots.block.BlockException;
import com.example.stage5.common.ApiResult;
import com.example.stage5.common.dto.UserDTO;
import com.example.stage5.user.model.User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final AtomicLong idGenerator = new AtomicLong(2);
    private final Map<Long, User> users = new LinkedHashMap<>();

    public UserController() {
        users.put(1L, new User(1L, "zhangsan", "zhangsan@example.com", 25));
        users.put(2L, new User(2L, "lisi", "lisi@example.com", 28));
    }

    @GetMapping
    public ApiResult<List<UserDTO>> listUsers() {
        return ApiResult.ok(users.values().stream().map(this::toDTO).toList());
    }

    @GetMapping("/{id}")
    @SentinelResource(value = "getUserById", blockHandler = "handleUserBlock")
    public ApiResult<UserDTO> getUser(@PathVariable Long id) {
        User user = users.get(id);
        if (user == null) {
            return ApiResult.fail("user not found: " + id);
        }
        return ApiResult.ok(toDTO(user));
    }

    @PostMapping
    public ApiResult<UserDTO> createUser(@RequestBody User user) {
        long id = idGenerator.incrementAndGet();
        user.setId(id);
        users.put(id, user);
        return ApiResult.ok(toDTO(user));
    }

    public ApiResult<UserDTO> handleUserBlock(Long id, BlockException exception) {
        return ApiResult.fail("user service is limited, id=" + id);
    }

    private UserDTO toDTO(User user) {
        return new UserDTO(user.getId(), user.getUsername(), user.getEmail(), user.getAge());
    }
}
