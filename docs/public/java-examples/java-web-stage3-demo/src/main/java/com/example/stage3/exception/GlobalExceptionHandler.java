package com.example.stage3.exception;

import com.example.stage3.support.Result;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

/**
 * 全局异常处理器 — 捕获所有 Controller 层抛出的异常，转为统一 JSON 响应
 *
 * @RestControllerAdvice = @ControllerAdvice + @ResponseBody
 * Spring 扫描到后自动对所有 @Controller 生效
 *
 * 三个 @ExceptionHandler 按异常类型精确匹配（像 try-catch 的 catch 块顺序）
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /** 捕获业务异常 → 返回对应的状态码和消息 */
    @ExceptionHandler(BusinessException.class)
    public Result<Void> handleBusinessException(BusinessException ex) {
        return Result.error(ex.getCode(), ex.getMessage());
    }

    /** 捕获 @Valid 校验失败 → 拼合所有字段的错误信息 */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result<String> handleValidationException(MethodArgumentNotValidException ex) {
        String errors = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining("; "));
        return Result.error(400, errors);
    }

    /** 兜底：捕获未预料的异常 → 500，同时打印堆栈便于排查 */
    @ExceptionHandler(Exception.class)
    public Result<Void> handleException(Exception ex) {
        ex.printStackTrace();
        return Result.error(500, "internal server error");
    }
}
