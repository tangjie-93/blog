package com.example.stage3.model;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.time.LocalDateTime;

/**
 * 用户实体 — 贯穿 Controller → Service → DAO 所有层的数据载体
 *
 * 同时支持 Jackson 序列化（靠 getter）和 MyBatis-Plus 持久化（靠 @TableName/@TableId）
 * @Valid 校验在 DTO 层（UserRequest），Model 层不混入校验逻辑
 */
@TableName("users")        // MyBatis-Plus：映射到数据库的 users 表
public class User {
    @TableId(type = IdType.AUTO)  // 主键自增，插入后 id 自动回填
    private Long id;
    private String username;
    private String password;
    private String email;
    private Integer age;
    private String role;
    private LocalDateTime createdAt;

    public User() {
    }

    /** 构造时自动设置创建时间为当前时间 */
    public User(Long id, String username, String password, String email, Integer age, String role) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.email = email;
        this.age = age;
        this.role = role;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
