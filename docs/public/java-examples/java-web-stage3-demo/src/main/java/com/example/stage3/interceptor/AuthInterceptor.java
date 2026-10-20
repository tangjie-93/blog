package com.example.stage3.interceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * 鉴权拦截器 — Controller 执行前检查登录状态
 *
 * WebConfig 中配置：拦截 /api/users/**，排除 login 和 register
 *
 * 两种放行策略（满足任一即可）：
 * 1. Session 登录态：session.getAttribute("loginUser") != null
 * 2. Token 方式：请求头 Authorization: Bearer xxx（简单判断了前缀，未验证内容）
 */
public class AuthInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // OPTIONS 预检请求直接放行
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        // 检查 Session 登录态
        HttpSession session = request.getSession(false);
        boolean loggedIn = session != null && session.getAttribute("loginUser") != null;
        // 检查 Token 认证（简单版，仅判断前缀）
        boolean hasToken = request.getHeader("Authorization") != null
                && request.getHeader("Authorization").startsWith("Bearer ");

        if (loggedIn || hasToken) {
            return true;    // 放行
        }

        // 未登录：返回 401 JSON
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"code\":401,\"message\":\"please login first\"}");
        return false;       // 拦截
    }
}
