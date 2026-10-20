package com.example.stage3.exception;

/**
 * 业务异常 — 带 HTTP 状态码的 RuntimeException
 *
 * Service 层遇到无效状态统一抛这个，由 GlobalExceptionHandler 捕获后转为 JSON 响应。
 *
 * 使用示例：
 *   throw new BusinessException(404, "user not found");
 *   throw new BusinessException(409, "username already exists");
 *   throw new BusinessException(401, "invalid username or password");
 */
public class BusinessException extends RuntimeException {
    private final int code;   // HTTP 状态码（404/401/409/500 等）

    public BusinessException(int code, String message) {
        super(message);
        this.code = code;
    }

    public int getCode() { return code; }
}
