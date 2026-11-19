package com.example.stage3.dto;

import javax.validation.constraints.NotBlank;

/**
 * 登录入参 DTO — 仅 username + password，最小权限原则
 */
public class LoginRequest {
    @NotBlank(message = "username cannot be blank")
    private String username;

    @NotBlank(message = "password cannot be blank")
    private String password;

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
}
