package com.example.stage3.filter;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Servlet 层面 CORS 跨域过滤器 — 所有请求最先到达这里
 *
 * @WebFilter("/*")：Jetty 扫描到后拦截全部请求，在 DispatcherServlet 之前执行
 *
 * 为什么有两层 CORS（这里 + WebConfig.addCorsMappings）？
 * - Filter 是 Servlet 层，拦截所有请求（包括非 Spring 的 Servlet）
 * - WebConfig 是 Spring 层，拦截 Spring MVC 处理的请求
 * - 两层防御，确保跨域问题不会因为某个层面失效而出现
 */
@WebFilter("/*")
public class CorsFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) {
        System.out.println("CorsFilter init");
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse resp = (HttpServletResponse) response;

        // 添加 CORS 响应头
        resp.setHeader("Access-Control-Allow-Origin", "*");
        resp.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
        resp.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

        // OPTIONS 预检请求直接返回 200，不继续执行后续逻辑
        if ("OPTIONS".equalsIgnoreCase(req.getMethod())) {
            resp.setStatus(HttpServletResponse.SC_OK);
            return;
        }
        // 普通请求放行，交给下一个 Filter 或 DispatcherServlet
        chain.doFilter(request, response);
    }

    @Override
    public void destroy() {
        System.out.println("CorsFilter destroy");
    }
}
