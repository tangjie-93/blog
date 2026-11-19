package com.example.stage4.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

@Schema(description = "用户资料更新请求")
public class UserUpdateRequest {

    @Schema(description = "密码", example = "123456")
    @Size(min = 6, max = 50, message = "密码长度必须是 6-50 个字符")
    private String password;

    @Schema(description = "昵称", example = "张三")
    @Size(max = 30, message = "昵称最多 30 个字符")
    private String nickname;

    @Schema(description = "邮箱", example = "zhangsan@example.com")
    @Email(message = "邮箱格式不正确")
    private String email;

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
