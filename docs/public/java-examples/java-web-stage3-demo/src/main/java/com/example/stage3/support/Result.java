package com.example.stage3.support;

/**
 * 统一响应体 — 所有接口返回都包装成这个类，前端统一解析
 *
 * 序列化后的 JSON 格式：
 * {"code":200, "message":"success", "data":{...}, "timestamp":1700000000000}
 *
 * 使用方式：
 *   Result.success(user)      → {code:200, message:"success", data:user}
 *   Result.error(404, "xxx")  → {code:404, message:"xxx", data:null}
 */
public class Result<T> {
    private final int code;        // HTTP 风格状态码
    private final String message;  // 提示信息
    private final T data;          // 负载数据（泛型，可以是 User、List、PageResult 等）
    private final long timestamp;  // 响应时间戳

    /** 私有构造函数，外部统一通过静态工厂方法创建 */
    private Result(int code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
        this.timestamp = System.currentTimeMillis();
    }

    /** 成功响应（带数据） */
    public static <T> Result<T> success(T data) {
        return new Result<>(200, "success", data);
    }

    /** 成功响应（自定义 message + 数据） */
    public static <T> Result<T> success(String message, T data) {
        return new Result<>(200, message, data);
    }

    /** 成功响应（无数据，如删除操作） */
    public static <T> Result<T> success() {
        return new Result<>(200, "success", null);
    }

    /** 失败响应（自定义状态码 + message） */
    public static <T> Result<T> error(int code, String message) {
        return new Result<>(code, message, null);
    }

    public int getCode() { return code; }
    public String getMessage() { return message; }
    public T getData() { return data; }
    public long getTimestamp() { return timestamp; }
}
