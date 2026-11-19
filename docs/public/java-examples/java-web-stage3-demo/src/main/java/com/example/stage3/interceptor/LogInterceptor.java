package com.example.stage3.interceptor;

import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * 日志拦截器 — 记录每个 Spring 请求的 URL + 耗时 + 响应状态码
 *
 * WebConfig 中配置：拦截所有路径（/**），排除静态资源
 * preHandle：请求到达时记录开始时间
 * afterCompletion：请求结束后计算耗时
 */
public class LogInterceptor implements HandlerInterceptor {

    /** 请求到达 Controller 之前：记录开始时间，打印 URL */
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        request.setAttribute("startTime", System.currentTimeMillis());
        System.out.println("[MVC] " + request.getMethod() + " " + request.getRequestURI());
        return true;
    }

    /** 请求完全结束后（视图渲染完/JSON写完后）：计算并打印耗时 */
    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        Object startTime = request.getAttribute("startTime");
        if (startTime instanceof Long) {
            long cost = System.currentTimeMillis() - (Long) startTime;
            System.out.println("[MVC] completed in " + cost + "ms, status=" + response.getStatus());
        }
    }
}
