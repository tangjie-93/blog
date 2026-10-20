package com.example.stage3.dto;

import javax.validation.constraints.Email;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

/**
 * 注册 / 全量更新 入参 DTO — 前端 JSON → Jackson 反序列化 → @Valid 校验
 *
 * 为什么不用 User 类接收参数？
 * - 防止客户端传 id、createdAt 等不应由外部设置的字段（mass assignment 攻击）
 * - 校验注解与业务 Model 解耦，Model 可以纯数据
 */
public class UserRequest {
    @NotBlank(message = "username cannot be blank")
    private String username;

    @NotBlank(message = "password cannot be blank")
    private String password;

    @Email(message = "email format is invalid")
    @NotBlank(message = "email cannot be blank")
    private String email;

    @NotNull(message = "age cannot be null")
    @Min(value = 1, message = "age must be greater than 0")
    @Max(value = 120, message = "age must be less than or equal to 120")
    private Integer age;

    private String role = "USER";   // 默认角色，前端不传时自动设为 USER

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
