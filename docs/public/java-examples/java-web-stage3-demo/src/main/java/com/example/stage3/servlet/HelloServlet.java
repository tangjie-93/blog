package com.example.stage3.servlet;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDateTime;

/**
 * 原生 Servlet — 演示不使用 Spring MVC 时怎么写
 *
 * 这是 Java Web 最原始的方式，Spring MVC 的 DispatcherServlet 本质上也是 HttpServlet。
 *
 * @WebServlet("/servlet/hello")：Jetty 扫描到后注册，绕开 Spring 直接响应
 * 继承 HttpServlet → 复写 doGet/doPost → 直接 HttpServletResponse 输出
 */
@WebServlet(name = "HelloServlet", urlPatterns = "/servlet/hello", loadOnStartup = 1)
public class HelloServlet extends HttpServlet {

    @Override
    public void init() throws ServletException {
        System.out.println("HelloServlet init");
    }

    /** GET 请求：直接输出 HTML，不用任何模板引擎 */
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("text/html;charset=UTF-8");
        PrintWriter out = resp.getWriter();
        out.println("<!doctype html>");
        out.println("<html><head><title>Hello Servlet</title></head><body>");
        out.println("<h1>Hello Servlet</h1>");
        out.println("<p>method: " + req.getMethod() + "</p>");
        out.println("<p>time: " + LocalDateTime.now() + "</p>");
        out.println("</body></html>");
    }

    /** POST 请求：模拟登录，把用户名存到 Session，返回 JSON */
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        req.setCharacterEncoding("UTF-8");
        HttpSession session = req.getSession();
        session.setAttribute("servletLoginUser", req.getParameter("username"));

        resp.setContentType("application/json;charset=UTF-8");
        resp.getWriter().write("{\"code\":200,\"message\":\"servlet login saved in session\"}");
    }
}
