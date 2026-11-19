package com.example.stage4.exception;

/**
 * 业务异常。
 *
 * 例如：用户不存在、用户名重复、密码错误。
 * 这些不是程序崩溃，而是业务规则不通过，所以单独定义异常更清晰。
 */
public class BusinessException extends RuntimeException {

    private final int code;

    public BusinessException(int code, String message) {
        super(message);
        this.code = code;
    }

    public int getCode() {
        return code;
    }
}
