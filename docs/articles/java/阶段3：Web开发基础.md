---
title: 阶段三：Web 开发基础
date: '2026-10-19'
type: 技术
tags: Java|Web
note: Java Web、Spring Framework 和 Spring MVC 基础。
---

# 阶段三：Web开发基础（1-2周）

> 虽然前端开发者对Web很熟悉，但需要了解Java服务端的处理方式。本阶段将学习Java Web基础、Spring Framework核心以及Spring MVC，建立服务端开发思维。

---

## 3.1 Java Web基础（快速了解）

### 3.1.1 HTTP协议在Java中的处理

#### 前端视角的HTTP
作为前端开发者，你已经非常熟悉HTTP协议：
```javascript
// 前端发起请求
fetch('/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ name: '张三', age: 25 })
})
.then(response => response.json())
.then(data => console.log(data));
```

#### Java服务端的HTTP处理
在Java服务端，我们需要接收和处理这些HTTP请求。

**HttpServletRequest - 请求对象**
```java
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class RequestDemo {
    public void handleRequest(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        // 1. 获取请求方法
        String method = request.getMethod();  // GET, POST, PUT, DELETE等
        System.out.println("请求方法: " + method);
        
        // 2. 获取请求URL
        StringBuffer url = request.getRequestURL();
        System.out.println("请求URL: " + url);
        
        // 3. 获取请求URI
        String uri = request.getRequestURI();
        System.out.println("请求URI: " + uri);
        
        // 4. 获取查询参数（URL中的?后面的参数）
        String username = request.getParameter("username");
        String age = request.getParameter("age");
        System.out.println("用户名: " + username + ", 年龄: " + age);
        
        // 5. 获取请求头
        String contentType = request.getHeader("Content-Type");
        String userAgent = request.getHeader("User-Agent");
        System.out.println("Content-Type: " + contentType);
        System.out.println("User-Agent: " + userAgent);
        
        // 6. 获取请求体（POST请求的JSON数据）
        // 需要使用BufferedReader读取
        BufferedReader reader = request.getReader();
        StringBuilder requestBody = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            requestBody.append(line);
        }
        System.out.println("请求体: " + requestBody.toString());
        
        // 7. 获取客户端IP
        String clientIP = request.getRemoteAddr();
        System.out.println("客户端IP: " + clientIP);
        
        // 8. 获取Session
        HttpSession session = request.getSession();
        String sessionId = session.getId();
        Object user = session.getAttribute("user");
        System.out.println("Session ID: " + sessionId);
    }
}
```

**HttpServletResponse - 响应对象**
```java
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

public class ResponseDemo {
    public void handleResponse(HttpServletResponse response) throws IOException {
        
        // 1. 设置响应状态码
        response.setStatus(200);  // 200 OK
        // response.setStatus(404);  // 404 Not Found
        // response.setStatus(500);  // 500 Internal Server Error
        
        // 2. 设置响应头
        response.setContentType("application/json;charset=UTF-8");
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Cache-Control", "no-cache");
        
        // 3. 设置字符编码
        response.setCharacterEncoding("UTF-8");
        
        // 4. 返回JSON数据
        PrintWriter writer = response.getWriter();
        String json = "{\"code\":200,\"message\":\"success\",\"data\":{\"name\":\"张三\",\"age\":25}}";
        writer.write(json);
        writer.flush();
        writer.close();
        
        // 5. 重定向
        // response.sendRedirect("/login.html");
        
        // 6. 转发（内部跳转，URL不变）
        // request.getRequestDispatcher("/WEB-INF/views/result.jsp").forward(request, response);
    }
}
```

**对比说明：**
| 前端概念 | Java服务端对应 |
|---------|--------------|
| `fetch` / `axios` | `HttpServletRequest` |
| `Response` 对象 | `HttpServletResponse` |
| `req.query` / `req.params` | `request.getParameter()` |
| `req.body` | `request.getReader()` |
| `res.json()` | `response.getWriter().write()` |
| `res.redirect()` | `response.sendRedirect()` |
| `localStorage` / `sessionStorage` | `HttpSession` |

### 3.1.2 Servlet生命周期与核心API

#### 什么是Servlet
Servlet是Java Web的核心技术，用于处理HTTP请求。可以理解为Java版的"路由处理器"。

**前端对比：**
```javascript
// 前端路由（Express.js）
app.get('/api/users', (req, res) => {
  res.json({ users: [] });
});

// Java Servlet
@WebServlet("/api/users")
public class UserServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) {
        // 处理GET请求
    }
}
```

#### 创建第一个Servlet
```java
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

// 方式1：注解配置（推荐）
@WebServlet(name = "HelloServlet", urlPatterns = "/hello", loadOnStartup = 1)
public class HelloServlet extends HttpServlet {
    
    // 1. 构造方法 - Servlet实例化时调用（只执行一次）
    public HelloServlet() {
        System.out.println("HelloServlet 构造方法被调用");
    }
    
    // 2. init方法 - 初始化时调用（只执行一次）
    @Override
    public void init() throws ServletException {
        System.out.println("HelloServlet init() 被调用 - 初始化资源");
        // 可以在这里初始化数据库连接、读取配置文件等
    }
    
    // 3. service方法 - 每次请求都会调用
    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) 
            throws ServletException, IOException {
        System.out.println("HelloServlet service() 被调用 - 处理请求");
        
        // 根据请求方法分发到doGet、doPost等
        super.service(req, resp);
    }
    
    // 4. doGet方法 - 处理GET请求
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) 
            throws ServletException, IOException {
        System.out.println("处理GET请求");
        
        // 设置响应类型
        resp.setContentType("text/html;charset=UTF-8");
        
        // 获取输出流
        PrintWriter out = resp.getWriter();
        
        // 返回HTML
        out.println("<!DOCTYPE html>");
        out.println("<html>");
        out.println("<head><title>Hello Servlet</title></head>");
        out.println("<body>");
        out.println("<h1>Hello, World!</h1>");
        out.println("<p>当前时间: " + new java.util.Date() + "</p>");
        out.println("</body>");
        out.println("</html>");
    }
    
    // 5. doPost方法 - 处理POST请求
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) 
            throws ServletException, IOException {
        System.out.println("处理POST请求");
        
        // 设置请求编码（处理中文参数）
        req.setCharacterEncoding("UTF-8");
        
        // 获取参数
        String username = req.getParameter("username");
        String password = req.getParameter("password");
        
        System.out.println("用户名: " + username + ", 密码: " + password);
        
        // 返回JSON
        resp.setContentType("application/json;charset=UTF-8");
        PrintWriter out = resp.getWriter();
        out.println("{\"code\":200,\"message\":\"登录成功\"}");
    }
    
    // 6. destroy方法 - Servlet销毁时调用（只执行一次）
    @Override
    public void destroy() {
        System.out.println("HelloServlet destroy() 被调用 - 释放资源");
        // 可以在这里关闭数据库连接、释放资源等
    }
}
```

#### Servlet生命周期详解
```
1. 加载和实例化
   - 容器（Tomcat）加载Servlet类
   - 调用构造方法创建实例
   - 默认第一次请求时创建，可通过loadOnStartup=1设置启动时创建

2. 初始化
   - 调用init()方法
   - 只执行一次
   - 用于初始化资源（数据库连接、配置文件等）

3. 请求处理
   - 每次请求都会调用service()方法
   - service()根据请求类型调用doGet()、doPost()、doPut()、doDelete()等
   - 多线程并发执行

4. 销毁
   - 容器关闭或重新加载时调用destroy()方法
   - 只执行一次
   - 用于释放资源
```

**与前端对比：**
| 前端概念 | Servlet对应 |
|---------|------------|
| 路由注册 | `@WebServlet` 注解 |
| 中间件 | `service()` 方法 |
| GET/POST处理 | `doGet()` / `doPost()` |
| 应用启动时执行 | `init()` 方法 |
| 应用关闭时执行 | `destroy()` 方法 |

#### Servlet配置方式

**方式1：注解配置（推荐）**
```java
@WebServlet(
    name = "UserServlet",
    urlPatterns = {"/api/users", "/api/users/*"},
    loadOnStartup = 1,
    initParams = {
        @WebInitParam(name = "pageSize", value = "10")
    }
)
public class UserServlet extends HttpServlet {
    // ...
}
```

**方式2：XML配置（传统方式）**
```xml
<!-- web.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee
         http://xmlns.jcp.org/xml/ns/javaee/web-app_4_0.xsd"
         version="4.0">
    
    <!-- Servlet配置 -->
    <servlet>
        <servlet-name>UserServlet</servlet-name>
        <servlet-class>com.example.servlet.UserServlet</servlet-class>
        <load-on-startup>1</load-on-startup>
        <init-param>
            <param-name>pageSize</param-name>
            <param-value>10</param-value>
        </init-param>
    </servlet>
    
    <!-- URL映射 -->
    <servlet-mapping>
        <servlet-name>UserServlet</servlet-name>
        <url-pattern>/api/users</url-pattern>
    </servlet-mapping>
    
</web-app>
```

#### 完整的用户管理Servlet示例
```java
@WebServlet("/api/users/*")
public class UserServlet extends HttpServlet {
    
    private UserService userService;
    
    @Override
    public void init() throws ServletException {
        // 初始化Service层
        userService = new UserServiceImpl();
    }
    
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) 
            throws ServletException, IOException {
        String uri = req.getRequestURI();
        String path = uri.substring(uri.lastIndexOf("/") + 1);
        
        resp.setContentType("application/json;charset=UTF-8");
        PrintWriter out = resp.getWriter();
        
        try {
            if (path.equals("users")) {
                // 获取用户列表
                List<User> users = userService.findAll();
                String json = JSON.toJSONString(users);
                out.write("{\"code\":200,\"data\":" + json + "}");
                
            } else if (path.matches("\\d+")) {
                // 获取单个用户
                Long id = Long.parseLong(path);
                User user = userService.findById(id);
                if (user != null) {
                    String json = JSON.toJSONString(user);
                    out.write("{\"code\":200,\"data\":" + json + "}");
                } else {
                    out.write("{\"code\":404,\"message\":\"用户不存在\"}");
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            out.write("{\"code\":500,\"message\":\"服务器内部错误\"}");
        }
    }
    
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) 
            throws ServletException, IOException {
        req.setCharacterEncoding("UTF-8");
        resp.setContentType("application/json;charset=UTF-8");
        PrintWriter out = resp.getWriter();
        
        try {
            // 读取请求体
            BufferedReader reader = req.getReader();
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
            
            // 解析JSON
            User user = JSON.parseObject(sb.toString(), User.class);
            
            // 调用Service层
            boolean success = userService.save(user);
            
            if (success) {
                out.write("{\"code\":200,\"message\":\"创建成功\"}");
            } else {
                out.write("{\"code\":500,\"message\":\"创建失败\"}");
            }
        } catch (Exception e) {
            e.printStackTrace();
            out.write("{\"code\":500,\"message\":\"参数错误\"}");
        }
    }
    
    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) 
            throws ServletException, IOException {
        // 更新用户
    }
    
    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) 
            throws ServletException, IOException {
        // 删除用户
    }
}
```

### 3.1.3 Filter与Listener

#### Filter（过滤器）

**什么是Filter**
Filter用于在请求到达Servlet之前进行预处理，可以理解为"中间件"。

**前端对比：**
```javascript
// Express中间件
app.use((req, res, next) => {
  console.log('Time:', Date.now());
  next();
});

// Java Filter
@WebFilter("/*")
public class LogFilter implements Filter {
    public void doFilter(ServletRequest req, ServletResponse resp, FilterChain chain) {
        System.out.println("Time: " + System.currentTimeMillis());
        chain.doFilter(req, resp);
    }
}
```

**创建Filter**
```java
import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

// 日志过滤器
@WebFilter(filterName = "LogFilter", urlPatterns = "/*")
public class LogFilter implements Filter {
    
    // 初始化方法
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        System.out.println("LogFilter 初始化");
    }
    
    // 过滤方法（核心）
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) 
            throws IOException, ServletException {
        
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse resp = (HttpServletResponse) response;
        
        // 1. 请求前处理
        long startTime = System.currentTimeMillis();
        String uri = req.getRequestURI();
        String method = req.getMethod();
        String clientIP = req.getRemoteAddr();
        
        System.out.println("[" + method + "] " + uri + " - IP: " + clientIP);
        
        // 2. 设置编码
        req.setCharacterEncoding("UTF-8");
        resp.setCharacterEncoding("UTF-8");
        resp.setContentType("application/json;charset=UTF-8");
        
        // 3. 放行（继续执行下一个Filter或Servlet）
        chain.doFilter(request, response);
        
        // 4. 响应后处理
        long endTime = System.currentTimeMillis();
        System.out.println("请求处理耗时: " + (endTime - startTime) + "ms");
    }
    
    // 销毁方法
    @Override
    public void destroy() {
        System.out.println("LogFilter 销毁");
    }
}
```

**常用Filter示例**

**1. 跨域过滤器（CORS Filter）**
```java
@WebFilter("/*")
public class CorsFilter implements Filter {
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) 
            throws IOException, ServletException {
        
        HttpServletResponse resp = (HttpServletResponse) response;
        
        // 设置CORS头
        resp.setHeader("Access-Control-Allow-Origin", "*");
        resp.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        resp.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        resp.setHeader("Access-Control-Max-Age", "3600");
        
        // 处理预检请求
        HttpServletRequest req = (HttpServletRequest) request;
        if ("OPTIONS".equalsIgnoreCase(req.getMethod())) {
            resp.setStatus(HttpServletResponse.SC_OK);
            return;
        }
        
        chain.doFilter(request, response);
    }
}
```

**2. 登录验证过滤器**
```java
@WebFilter(urlPatterns = {"/api/*"}, 
           dispatcherTypes = {DispatcherType.REQUEST})
public class AuthFilter implements Filter {
    
    // 不需要验证的路径
    private static final Set<String> EXCLUDE_PATHS = Set.of(
        "/api/login",
        "/api/register",
        "/api/captcha"
    );
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) 
            throws IOException, ServletException {
        
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse resp = (HttpServletResponse) response;
        
        String uri = req.getRequestURI();
        
        // 排除不需要验证的路径
        if (EXCLUDE_PATHS.contains(uri)) {
            chain.doFilter(request, response);
            return;
        }
        
        // 从Session或Token中获取用户信息
        HttpSession session = req.getSession(false);
        Object user = session != null ? session.getAttribute("user") : null;
        
        // 或者从Header中获取Token
        String token = req.getHeader("Authorization");
        
        if (user == null && (token == null || !validateToken(token))) {
            // 未登录，返回401
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            resp.getWriter().write("{\"code\":401,\"message\":\"未登录或登录已过期\"}");
            return;
        }
        
        // 验证通过，放行
        chain.doFilter(request, response);
    }
    
    private boolean validateToken(String token) {
        // 验证Token逻辑
        return token != null && token.startsWith("Bearer ");
    }
}
```

**3. 字符编码过滤器**
```java
@WebFilter("/*")
public class EncodingFilter implements Filter {
    
    private String encoding = "UTF-8";
    
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        // 从配置中读取编码
        String encodingParam = filterConfig.getInitParameter("encoding");
        if (encodingParam != null) {
            this.encoding = encodingParam;
        }
    }
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) 
            throws IOException, ServletException {
        
        request.setCharacterEncoding(encoding);
        response.setCharacterEncoding(encoding);
        
        chain.doFilter(request, response);
    }
}
```

**Filter配置（XML方式）**
```xml
<web-app>
    <!-- Filter定义 -->
    <filter>
        <filter-name>logFilter</filter-name>
        <filter-class>com.example.filter.LogFilter</filter-class>
        <init-param>
            <param-name>logLevel</param-name>
            <param-value>INFO</param-value>
        </init-param>
    </filter>
    
    <!-- Filter映射 -->
    <filter-mapping>
        <filter-name>logFilter</filter-name>
        <url-pattern>/*</url-pattern>
        <!-- 指定 dispatcher 类型 -->
        <dispatcher>REQUEST</dispatcher>
        <dispatcher>FORWARD</dispatcher>
    </filter-mapping>
</web-app>
```

**Filter链执行顺序**
```
请求 → Filter1 → Filter2 → Filter3 → Servlet
                                      ↓
响应 ← Filter1 ← Filter2 ← Filter3 ←
```

#### Listener（监听器）

**什么是Listener**
Listener用于监听Web应用中的事件（如应用启动、Session创建等），可以理解为"事件监听器"。

**前端对比：**
```javascript
// 前端事件监听
window.addEventListener('load', () => {
  console.log('页面加载完成');
});

sessionStorage.setItem('key', 'value');
window.addEventListener('storage', (e) => {
  console.log('Storage变化:', e);
});

// Java Listener
@WebListener
public class AppListener implements ServletContextListener {
    public void contextInitialized(ServletContextEvent sce) {
        System.out.println("应用启动");
    }
}
```

**常用Listener类型**

**1. ServletContextListener - 应用启动/销毁监听**
```java
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;

@WebListener
public class ApplicationListener implements ServletContextListener {
    
    // 应用启动时调用
    @Override
    public void contextInitialized(ServletContextEvent sce) {
        System.out.println("====== 应用启动 ======");
        
        // 1. 初始化全局配置
        ServletContext context = sce.getServletContext();
        context.setAttribute("appName", "我的Web应用");
        context.setAttribute("version", "1.0.0");
        
        // 2. 初始化数据库连接池
        try {
            DataSource dataSource = createDataSource();
            context.setAttribute("dataSource", dataSource);
            System.out.println("数据库连接池初始化成功");
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        // 3. 加载缓存数据
        loadCacheData();
        
        // 4. 启动定时任务
        startScheduledTasks();
    }
    
    // 应用销毁时调用
    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        System.out.println("====== 应用销毁 ======");
        
        // 1. 关闭数据库连接池
        ServletContext context = sce.getServletContext();
        DataSource dataSource = (DataSource) context.getAttribute("dataSource");
        if (dataSource != null) {
            closeDataSource(dataSource);
            System.out.println("数据库连接池已关闭");
        }
        
        // 2. 停止定时任务
        stopScheduledTasks();
        
        // 3. 清理缓存
        clearCache();
    }
    
    private DataSource createDataSource() {
        // 创建数据源
        return null;
    }
    
    private void loadCacheData() {
        // 加载缓存
    }
    
    private void startScheduledTasks() {
        // 启动定时任务
    }
    
    private void stopScheduledTasks() {
        // 停止定时任务
    }
    
    private void clearCache() {
        // 清理缓存
    }
    
    private void closeDataSource(DataSource dataSource) {
        // 关闭数据源
    }
}
```

**2. HttpSessionListener - Session创建/销毁监听**
```java
@WebListener
public class SessionListener implements HttpSessionListener {
    
    // 统计在线用户数
    private static int onlineCount = 0;
    
    // Session创建时调用
    @Override
    public void sessionCreated(HttpSessionEvent se) {
        onlineCount++;
        System.out.println("新Session创建，当前在线人数: " + onlineCount);
        
        HttpSession session = se.getSession();
        session.setAttribute("createTime", System.currentTimeMillis());
        
        // 设置Session超时时间（分钟）
        session.setMaxInactiveInterval(30 * 60);
    }
    
    // Session销毁时调用
    @Override
    public void sessionDestroyed(HttpSessionEvent se) {
        onlineCount--;
        System.out.println("Session销毁，当前在线人数: " + onlineCount);
    }
    
    public static int getOnlineCount() {
        return onlineCount;
    }
}
```

**3. HttpSessionAttributeListener - Session属性变化监听**
```java
@WebListener
public class SessionAttributeListener implements HttpSessionAttributeListener {
    
    @Override
    public void attributeAdded(HttpSessionBindingEvent event) {
        String name = event.getName();
        Object value = event.getValue();
        System.out.println("Session添加属性: " + name + " = " + value);
        
        // 可以记录用户登录日志
        if ("user".equals(name)) {
            logUserLogin(value);
        }
    }
    
    @Override
    public void attributeRemoved(HttpSessionBindingEvent event) {
        String name = event.getName();
        Object value = event.getValue();
        System.out.println("Session移除属性: " + name + " = " + value);
        
        // 可以记录用户登出日志
        if ("user".equals(name)) {
            logUserLogout(value);
        }
    }
    
    @Override
    public void attributeReplaced(HttpSessionBindingEvent event) {
        String name = event.getName();
        Object oldValue = event.getValue();
        HttpSession session = event.getSession();
        Object newValue = session.getAttribute(name);
        System.out.println("Session替换属性: " + name + " 从 " + oldValue + " 变为 " + newValue);
    }
    
    private void logUserLogin(Object user) {
        // 记录登录日志
    }
    
    private void logUserLogout(Object user) {
        // 记录登出日志
    }
}
```

**4. ServletRequestListener - 请求创建/销毁监听**
```java
@WebListener
public class RequestListener implements ServletRequestListener {
    
    @Override
    public void requestInitialized(ServletRequestEvent sre) {
        HttpServletRequest request = (HttpServletRequest) sre.getServletRequest();
        String uri = request.getRequestURI();
        long startTime = System.currentTimeMillis();
        
        // 将开始时间存储到request中
        request.setAttribute("startTime", startTime);
        
        System.out.println("请求开始: " + uri);
    }
    
    @Override
    public void requestDestroyed(ServletRequestEvent sre) {
        HttpServletRequest request = (HttpServletRequest) sre.getServletRequest();
        String uri = request.getRequestURI();
        Long startTime = (Long) request.getAttribute("startTime");
        
        if (startTime != null) {
            long duration = System.currentTimeMillis() - startTime;
            System.out.println("请求结束: " + uri + " 耗时: " + duration + "ms");
        }
    }
}
```

**Listener配置（XML方式）**
```xml
<web-app>
    <listener>
        <listener-class>com.example.listener.ApplicationListener</listener-class>
    </listener>
    
    <listener>
        <listener-class>com.example.listener.SessionListener</listener-class>
    </listener>
</web-app>
```

### 3.1.4 JSP（了解即可，现代开发很少用）

#### 什么是JSP
JSP（JavaServer Pages）是Java Web的动态页面技术，类似于前端的模板引擎（EJS、Handlebars）。

**前端对比：**
```html
<!-- EJS模板 -->
<h1><%= title %></h1>
<ul>
  <% users.forEach(user => { %>
    <li><%= user.name %></li>
  <% }); %>
</ul>

<!-- JSP -->
<h1>${title}</h1>
<ul>
  <c:forEach var="user" items="${users}">
    <li>${user.name}</li>
  </c:forEach>
</ul>
```

#### JSP基本语法
```jsp
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"%>

<%!
    // 声明部分（全局变量和方法）
    private int count = 0;
    
    public int getCount() {
        return count++;
    }
%>

<%
    // 脚本let（Java代码）
    String name = request.getParameter("name");
    if (name == null) {
        name = "访客";
    }
    
    List<String> items = new ArrayList<>();
    items.add("Java");
    items.add("Spring");
    items.add("MySQL");
    request.setAttribute("items", items);
%>

<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>JSP示例</title>
</head>
<body>
    <h1>Hello, <%= name %>!</h1>
    <p>访问次数: <%= getCount() %></p>
    
    <!-- 使用EL表达式 -->
    <h2>技术列表</h2>
    <ul>
        <c:forEach var="item" items="${items}">
            <li>${item}</li>
        </c:forEach>
    </ul>
    
    <!-- 条件判断 -->
    <c:if test="${not empty name}">
        <p>欢迎回来，${name}!</p>
    </c:if>
    
    <c:choose>
        <c:when test="${count > 100}">
            <p>您是VIP用户</p>
        </c:when>
        <c:when test="${count > 10}">
            <p>您是老用户</p>
        </c:when>
        <c:otherwise>
            <p>您是新用户</p>
        </c:otherwise>
    </c:choose>
    
    <!-- 格式化日期 -->
    <fmt:formatDate value="<%= new java.util.Date() %>" pattern="yyyy-MM-dd HH:mm:ss"/>
</body>
</html>
```

#### JSP内置对象
```jsp
<%
    // 9大内置对象
    
    // 1. request - HttpServletRequest
    String param = request.getParameter("name");
    
    // 2. response - HttpServletResponse
    response.setContentType("text/html;charset=UTF-8");
    
    // 3. session - HttpSession
    session.setAttribute("user", "张三");
    
    // 4. application - ServletContext
    String appName = application.getInitParameter("appName");
    
    // 5. out - JspWriter（输出）
    out.println("Hello World");
    
    // 6. pageContext - 页面上下文
    pageContext.setAttribute("key", "value");
    
    // 7. config - ServletConfig
    String paramValue = config.getInitParameter("paramName");
    
    // 8. page - 当前JSP页面实例（相当于this）
    
    // 9. exception - 异常对象（仅在错误页面中可用）
%>
```

#### EL表达式（Expression Language）
```jsp
<!-- EL表达式简化输出 -->
${name}                          <!-- 等价于 <%= request.getAttribute("name") %> -->
${user.name}                     <!-- 访问对象属性 -->
${list[0]}                       <!-- 访问数组/列表元素 -->
${map.key}                       <!-- 访问Map元素 -->

<!-- 运算 -->
${1 + 2}                         <!-- 3 -->
${a > b ? '大于' : '小于'}       <!-- 三元运算 -->
${empty name}                    <!-- 判断是否为空 -->
${not empty users}               <!-- 判断是否不为空 -->

<!-- 隐式对象 -->
${pageContext.request.contextPath}   <!-- 项目路径 -->
${param.name}                        <!-- 请求参数 -->
${header['User-Agent']}              <!-- 请求头 -->
${cookie.JSESSIONID.value}           <!-- Cookie -->
${sessionScope.user}                 <!-- Session属性 -->
${applicationScope.appName}          <!-- Application属性 -->
```

#### JSTL标签库
```jsp
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>

<!-- 条件判断 -->
<c:if test="${age >= 18}">
    <p>成年人</p>
</c:if>

<c:choose>
    <c:when test="${score >= 90}">优秀</c:when>
    <c:when test="${score >= 80}">良好</c:when>
    <c:when test="${score >= 60}">及格</c:when>
    <c:otherwise>不及格</c:otherwise>
</c:choose>

<!-- 循环 -->
<c:forEach var="user" items="${users}" varStatus="status">
    <p>${status.index + 1}. ${user.name} - ${user.email}</p>
</c:forEach>

<!-- URL处理 -->
<c:url value="/api/users" var="userUrl">
    <c:param name="id" value="${userId}"/>
</c:url>
<a href="${userUrl}">用户详情</a>

<!-- 重定向 -->
<c:redirect url="/login.jsp"/>
```

**注意：现代Java Web开发已经很少使用JSP，主要使用前后端分离架构，后端只提供RESTful API，前端使用Vue/React等框架。**

### 3.1.5 Tomcat服务器（类比前端的 dev-server）

#### 什么是Tomcat
Tomcat是Apache软件基金会的开源Servlet容器，是Java Web应用服务器。

**前端对比：**
| 前端 | Java |
|------|------|
| webpack-dev-server | Tomcat |
| Express.js | Tomcat |
| Nginx | Tomcat / Nginx |
| `npm run dev` | 启动Tomcat |
| `localhost:3000` | `localhost:8080` |

#### 安装与配置Tomcat

**1. 下载Tomcat**
```bash
# 访问Tomcat官网
https://tomcat.apache.org/

# 下载Tomcat 10.x（支持Jakarta EE 9+）
# 或Tomcat 9.x（支持Java EE 8）
```

**2. 目录结构**
```
apache-tomcat-10.0/
├── bin/              # 启动/关闭脚本
│   ├── startup.sh    # Linux启动脚本
│   ├── startup.bat   # Windows启动脚本
│   ├── shutdown.sh   # Linux关闭脚本
│   └── shutdown.bat  # Windows关闭脚本
├── conf/             # 配置文件
│   ├── server.xml    # 主配置文件
│   ├── web.xml       # 全局Web配置
│   └── context.xml   # 上下文配置
├── lib/              # Tomcat库文件
├── logs/             # 日志文件
├── temp/             # 临时文件
├── webapps/          # Web应用部署目录
│   ├── ROOT/         # 根应用
│   ├── docs/         # 文档应用
│   └── examples/     # 示例应用
└── work/             # JSP编译后的文件
```

**3. 启动Tomcat**
```bash
# Windows
startup.bat

# Linux/Mac
./startup.sh

# 访问测试
http://localhost:8080
```

**4. 配置端口（server.xml）**
```xml
<Server port="8005" shutdown="SHUTDOWN">
    
    <Service name="Catalina">
        
        <!-- HTTP连接器 -->
        <Connector port="8080" 
                   protocol="HTTP/1.1"
                   connectionTimeout="20000"
                   redirectPort="8443"
                   URIEncoding="UTF-8"
                   maxThreads="500"
                   minSpareThreads="50"/>
        
        <!-- AJP连接器（用于与Apache HTTP Server集成） -->
        <Connector port="8009" 
                   protocol="AJP/1.3"
                   redirectPort="8443"/>
        
        <!-- 引擎 -->
        <Engine name="Catalina" defaultHost="localhost">
            
            <!-- 主机 -->
            <Host name="localhost" 
                  appBase="webapps"
                  unpackWARs="true"
                  autoDeploy="true">
                
                <!-- 访问日志 -->
                <Valve className="org.apache.catalina.valves.AccessLogValve"
                       directory="logs"
                       prefix="localhost_access_log"
                       suffix=".txt"
                       pattern="%h %l %u %t &quot;%r&quot; %s %b"/>
                
            </Host>
        </Engine>
    </Service>
</Server>
```

**5. 配置虚拟主机**
```xml
<Engine name="Catalina" defaultHost="www.app1.com">
    
    <!-- 主机1 -->
    <Host name="www.app1.com" appBase="webapps/app1">
        <Context path="" docBase="." reloadable="true"/>
    </Host>
    
    <!-- 主机2 -->
    <Host name="www.app2.com" appBase="webapps/app2">
        <Context path="" docBase="." reloadable="true"/>
    </Host>
    
</Engine>
```

#### 部署Web应用

**方式1：直接复制到webapps目录**
```bash
# 将WAR包复制到webapps
cp myapp.war $TOMCAT_HOME/webapps/

# Tomcat会自动解压并部署
# 访问: http://localhost:8080/myapp
```

**方式2：配置Context（推荐）**
```xml
<!-- 在server.xml的Host标签内添加 -->
<Context path="/myapp" docBase="D:/projects/myapp/web" reloadable="true"/>

<!-- 或单独配置文件 -->
<!-- $TOMCAT_HOME/conf/Catalina/localhost/myapp.xml -->
<Context docBase="D:/projects/myapp/web" reloadable="true">
    <!-- 数据源配置 -->
    <Resource name="jdbc/MySQLDB"
              auth="Container"
              type="javax.sql.DataSource"
              driverClassName="com.mysql.cj.jdbc.Driver"
              url="jdbc:mysql://localhost:3306/mydb?useSSL=false&amp;serverTimezone=UTC"
              username="root"
              password="123456"
              maxTotal="50"
              maxIdle="20"/>
</Context>
```

**方式3：IDEA集成Tomcat（开发环境推荐）**
```
1. IDEA菜单：Run → Edit Configurations
2. 点击 + 号，选择 Tomcat Server → Local
3. 配置Tomcat Home目录
4. 部署Web应用
5. 启动调试
```

#### Tomcat管理控制台
```xml
<!-- 配置管理员账号（tomcat-users.xml） -->
<tomcat-users>
    <role rolename="manager-gui"/>
    <role rolename="admin-gui"/>
    <user username="admin" password="admin123" 
          roles="manager-gui,admin-gui"/>
</tomcat-users>
```

访问：`http://localhost:8080/manager/html`

#### 常用配置优化
```xml
<!-- 1. 配置GZIP压缩 -->
<Connector port="8080" protocol="HTTP/1.1"
           compression="on"
           compressionMinSize="2048"
           noCompressionUserAgents="gozilla, traviata"
           compressableMimeType="text/html,text/xml,text/plain,text/css,text/javascript,application/javascript,application/json"/>

<!-- 2. 配置HTTPS -->
<Connector port="8443" protocol="org.apache.coyote.http11.Http11NioProtocol"
           maxThreads="150" SSLEnabled="true">
    <SSLHostConfig>
        <Certificate certificateKeystoreFile="conf/keystore.jks"
                     certificateKeystorePassword="changeit"
                     type="RSA"/>
    </SSLHostConfig>
</Connector>

<!-- 3. 配置线程池 -->
<Executor name="tomcatThreadPool" 
          namePrefix="catalina-exec-"
          maxThreads="500" 
          minSpareThreads="50"
          maxIdleTime="60000"/>

<Connector port="8080" 
           executor="tomcatThreadPool"/>
```

---

## 3.2 Spring Framework核心（重中之重）

### 3.2.1 IoC（控制反转）与DI（依赖注入）—— Spring的灵魂

#### 什么是IoC和DI

**传统方式（控制正转）**
```java
// 前端对比
// 传统方式：自己创建依赖
class UserService {
    private UserDao userDao = new UserDaoImpl();  // 自己创建
    
    public void save(User user) {
        userDao.save(user);
    }
}

// 类似前端的硬编码
class Component {
    constructor() {
        this.api = new ApiService();  // 硬编码依赖
    }
}
```

**IoC方式（控制反转）**
```java
// IoC方式：由容器注入依赖
@Component
public class UserService {
    
    @Autowired  // Spring自动注入
    private UserDao userDao;
    
    public void save(User user) {
        userDao.save(user);
    }
}

// 类似前端的依赖注入
class Component {
    constructor(apiService) {
        this.api = apiService;  // 通过构造函数注入
    }
}

// Vue 3的依赖注入
// 父组件提供
provide('apiService', new ApiService());

// 子组件注入
const api = inject('apiService');
```

**IoC核心思想：**
- **控制反转**：将对象的创建和管理权交给Spring容器，而不是自己new
- **依赖注入**：Spring容器自动将依赖对象注入到需要的组件中

**好处：**
1. 解耦合（松耦合）
2. 便于单元测试（可以注入Mock对象）
3. 代码更灵活、可扩展

#### 创建Spring项目

**Maven依赖（pom.xml）**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>spring-demo</artifactId>
    <version>1.0.0</version>

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <spring.version>6.0.11</spring.version>
    </properties>

    <dependencies>
        <!-- Spring核心 -->
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-context</artifactId>
            <version>${spring.version}</version>
        </dependency>
        
        <!-- Spring Bean工厂 -->
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-beans</artifactId>
            <version>${spring.version}</version>
        </dependency>
        
        <!-- Spring表达式语言 -->
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-expression</artifactId>
            <version>${spring.version}</version>
        </dependency>
        
        <!-- Spring AOP -->
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-aop</artifactId>
            <version>${spring.version}</version>
        </dependency>
        
        <!-- Spring事务 -->
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-tx</artifactId>
            <version>${spring.version}</version>
        </dependency>
        
        <!-- Spring测试 -->
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-test</artifactId>
            <version>${spring.version}</version>
            <scope>test</scope>
        </dependency>
        
        <!-- JUnit 5 -->
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter</artifactId>
            <version>5.10.0</version>
            <scope>test</scope>
        </dependency>
        
        <!-- Lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>1.18.30</version>
            <scope>provided</scope>
        </dependency>
    </dependencies>
</project>
```

#### IoC容器详解

**ApplicationContext - 核心容器接口**
```java
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

public class SpringDemo {
    public static void main(String[] args) {
        
        // 方式1：XML配置
        ApplicationContext context = new ClassPathXmlApplicationContext("applicationContext.xml");
        
        // 方式2：注解配置（推荐）
        ApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);
        
        // 从容器获取Bean
        UserService userService = context.getBean(UserService.class);
        userService.save(new User("张三", 25));
        
        // 根据名称获取
        UserService userService2 = (UserService) context.getBean("userService");
        
        // 判断Bean是否存在
        boolean exists = context.containsBean("userService");
        
        // 获取Bean的定义
        String[] beanNames = context.getBeanDefinitionNames();
        for (String name : beanNames) {
            System.out.println(name);
        }
    }
}
```

#### 创建Bean的方式

**方式1：注解方式（最常用，推荐）**
```java
// 1. @Component - 通用组件
@Component
public class UserService {
    // ...
}

// 2. @Service - 业务层（语义化）
@Service
public class UserServiceImpl implements UserService {
    // ...
}

// 3. @Repository - 数据访问层（语义化）
@Repository
public class UserDaoImpl implements UserDao {
    // ...
}

// 4. @Controller - 控制层（语义化）
@Controller
public class UserController {
    // ...
}

// 5. @Configuration - 配置类
@Configuration
public class AppConfig {
    // ...
}

// 6. @Bean - 在配置类中定义Bean
@Configuration
public class BeanConfig {
    
    @Bean
    public UserService userService() {
        return new UserServiceImpl();
    }
    
    @Bean(name = "userDao")
    public UserDao userDao() {
        return new UserDaoImpl();
    }
}
```

**方式2：XML配置方式（传统）**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="
           http://www.springframework.org/schema/beans
           http://www.springframework.org/schema/beans/spring-beans.xsd
           http://www.springframework.org/schema/context
           http://www.springframework.org/schema/context/spring-context.xsd">
    
    <!-- 扫描注解 -->
    <context:component-scan base-package="com.example"/>
    
    <!-- 构造器注入 -->
    <bean id="userService" class="com.example.service.UserServiceImpl">
        <constructor-arg ref="userDao"/>
    </bean>
    
    <!-- Setter注入 -->
    <bean id="userDao" class="com.example.dao.UserDaoImpl">
        <property name="dataSource" ref="dataSource"/>
    </bean>
    
    <!-- 属性注入 -->
    <bean id="config" class="com.example.config.AppConfig">
        <property name="appName" value="我的应用"/>
        <property name="version" value="1.0.0"/>
    </bean>
    
</beans>
```

**方式3：Java Config方式（现代）**
```java
@Configuration
public class AppConfig {
    
    @Bean
    public UserService userService(UserDao userDao) {
        UserServiceImpl service = new UserServiceImpl();
        service.setUserDao(userDao);
        return service;
    }
    
    @Bean
    public UserDao userDao(DataSource dataSource) {
        UserDaoImpl dao = new UserDaoImpl();
        dao.setDataSource(dataSource);
        return dao;
    }
    
    @Bean
    public DataSource dataSource() {
        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setJdbcUrl("jdbc:mysql://localhost:3306/mydb");
        dataSource.setUsername("root");
        dataSource.setPassword("123456");
        return dataSource;
    }
}
```

#### 依赖注入（DI）详解

**1. 构造器注入（推荐）**
```java
@Service
public class UserServiceImpl implements UserService {
    
    private final UserDao userDao;
    private final EmailService emailService;
    
    // Spring会自动调用这个构造方法注入依赖
    @Autowired
    public UserServiceImpl(UserDao userDao, EmailService emailService) {
        this.userDao = userDao;
        this.emailService = emailService;
    }
    
    // 如果只有一个构造方法，@Autowired可以省略
    public UserServiceImpl(UserDao userDao) {
        this.userDao = userDao;
        this.emailService = null;
    }
    
    public void save(User user) {
        userDao.save(user);
        emailService.sendWelcomeEmail(user.getEmail());
    }
}
```

**2. Setter注入**
```java
@Service
public class UserServiceImpl implements UserService {
    
    private UserDao userDao;
    private EmailService emailService;
    
    @Autowired
    public void setUserDao(UserDao userDao) {
        this.userDao = userDao;
    }
    
    @Autowired
    public void setEmailService(EmailService emailService) {
        this.emailService = emailService;
    }
}
```

**3. 字段注入（不推荐，但代码简洁）**
```java
@Service
public class UserServiceImpl implements UserService {
    
    @Autowired
    private UserDao userDao;
    
    @Autowired
    private EmailService emailService;
    
    // 或者使用@Resource（Java标准注解）
    @Resource(name = "userDao")
    private UserDao userDao2;
}
```

**4. 使用Lombok简化**
```java
@Service
@RequiredArgsConstructor  // Lombok自动生成构造方法
public class UserServiceImpl implements UserService {
    
    private final UserDao userDao;
    private final EmailService emailService;
    
    // Lombok会生成：
    // public UserServiceImpl(UserDao userDao, EmailService emailService) {
    //     this.userDao = userDao;
    //     this.emailService = emailService;
    // }
}
```

#### @Autowired详解
```java
@Service
public class UserService {
    
    // 1. 自动按类型注入
    @Autowired
    private UserDao userDao;
    
    // 2. 如果有多个实现，使用@Qualifier指定
    @Autowired
    @Qualifier("mysqlUserDao")
    private UserDao userDao;
    
    // 3. 使用@Primary标记首选实现
    @Autowired
    private UserDao userDao;  // 会注入标记了@Primary的实现
    
    // 4. 可选注入（允许为null）
    @Autowired(required = false)
    private CacheService cacheService;
    
    // 5. 注入集合
    @Autowired
    private List<UserDao> userDaoList;
    
    @Autowired
    private Map<String, UserDao> userDaoMap;
}

// 标记首选实现
@Repository
@Primary
public class MysqlUserDao implements UserDao {
    // ...
}

@Repository
public class OracleUserDao implements UserDao {
    // ...
}
```

#### 完整的IoC示例

**项目结构**
```
spring-demo/
├── src/main/java/com/example/
│   ├── config/
│   │   └── AppConfig.java
│   ├── entity/
│   │   └── User.java
│   ├── dao/
│   │   ├── UserDao.java
│   │   └── impl/
│   │       └── UserDaoImpl.java
│   ├── service/
│   │   ├── UserService.java
│   │   └── impl/
│   │       └── UserServiceImpl.java
│   └── App.java
└── src/test/java/
    └── UserServiceTest.java
```

**实体类**
```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private Long id;
    private String username;
    private String email;
    private Integer age;
}
```

**DAO层**
```java
// 接口
public interface UserDao {
    void save(User user);
    User findById(Long id);
    List<User> findAll();
}

// 实现类
@Repository
public class UserDaoImpl implements UserDao {
    
    // 模拟数据库存储
    private Map<Long, User> database = new HashMap<>();
    private Long idGenerator = 1L;
    
    @Override
    public void save(User user) {
        user.setId(idGenerator++);
        database.put(user.getId(), user);
        System.out.println("保存用户: " + user);
    }
    
    @Override
    public User findById(Long id) {
        return database.get(id);
    }
    
    @Override
    public List<User> findAll() {
        return new ArrayList<>(database.values());
    }
}
```

**Service层**
```java
// 接口
public interface UserService {
    void save(User user);
    User findById(Long id);
    List<User> findAll();
}

// 实现类
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    
    private final UserDao userDao;
    
    @Override
    public void save(User user) {
        // 业务逻辑：验证
        if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
            throw new IllegalArgumentException("用户名不能为空");
        }
        
        // 调用DAO
        userDao.save(user);
        
        System.out.println("用户保存成功");
    }
    
    @Override
    public User findById(Long id) {
        return userDao.findById(id);
    }
    
    @Override
    public List<User> findAll() {
        return userDao.findAll();
    }
}
```

**配置类**
```java
@Configuration
@ComponentScan(basePackages = "com.example")
public class AppConfig {
    // Spring会自动扫描并注册带有@Component、@Service、@Repository等注解的类
}
```

**测试类**
```java
public class App {
    public static void main(String[] args) {
        // 创建Spring容器
        ApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);
        
        // 获取Bean
        UserService userService = context.getBean(UserService.class);
        
        // 使用
        User user = new User(null, "张三", "zhangsan@example.com", 25);
        userService.save(user);
        
        List<User> users = userService.findAll();
        System.out.println("所有用户: " + users);
    }
}
```

### 3.2.2 AOP（面向切面编程）

#### 什么是AOP

**前端对比：**
```javascript
// 前端拦截器（类似AOP）
axios.interceptors.request.use(config => {
  console.log('请求发送前', config);
  return config;
});

axios.interceptors.response.use(response => {
  console.log('响应返回后', response);
  return response;
});

// Vue路由守卫
router.beforeEach((to, from, next) => {
  console.log('路由跳转前');
  next();
});
```

**AOP核心概念：**
- **切面（Aspect）**：横切关注点的模块化（如日志、事务、权限）
- **连接点（Joinpoint）**：程序执行的某个点（如方法调用）
- **切入点（Pointcut）**：匹配连接点的表达式
- **通知（Advice）**：在切入点执行的动作
- **目标对象（Target）**：被通知的对象
- **织入（Weaving）**：将切面应用到目标对象的过程

#### AOP使用场景
1. **日志记录**：记录方法调用、参数、返回值
2. **事务管理**：自动开启、提交、回滚事务
3. **权限控制**：检查用户权限
4. **性能监控**：记录方法执行时间
5. **缓存处理**：自动缓存方法结果
6. **异常处理**：统一异常处理

#### 使用AOP

**添加依赖**
```xml
<!-- Spring AOP -->
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-aop</artifactId>
    <version>${spring.version}</version>
</dependency>

<!-- AspectJ -->
<dependency>
    <groupId>org.aspectj</groupId>
    <artifactId>aspectjweaver</artifactId>
    <version>1.9.20</version>
</dependency>
```

**创建切面**
```java
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;
import java.util.Arrays;

@Aspect
@Component
public class LogAspect {
    
    // 1. 定义切入点表达式
    @Pointcut("execution(* com.example.service.*.*(..))")
    public void servicePointcut() {}
    
    // 2. 前置通知 - 方法执行前
    @Before("servicePointcut()")
    public void beforeAdvice(JoinPoint joinPoint) {
        String methodName = joinPoint.getSignature().getName();
        Object[] args = joinPoint.getArgs();
        System.out.println("[前置通知] 方法: " + methodName + ", 参数: " + Arrays.toString(args));
    }
    
    // 3. 后置通知 - 方法执行后（无论是否异常）
    @After("servicePointcut()")
    public void afterAdvice(JoinPoint joinPoint) {
        String methodName = joinPoint.getSignature().getName();
        System.out.println("[后置通知] 方法: " + methodName + " 执行完成");
    }
    
    // 4. 返回通知 - 方法正常返回后
    @AfterReturning(pointcut = "servicePointcut()", returning = "result")
    public void afterReturningAdvice(JoinPoint joinPoint, Object result) {
        String methodName = joinPoint.getSignature().getName();
        System.out.println("[返回通知] 方法: " + methodName + ", 返回值: " + result);
    }
    
    // 5. 异常通知 - 方法抛出异常后
    @AfterThrowing(pointcut = "servicePointcut()", throwing = "ex")
    public void afterThrowingAdvice(JoinPoint joinPoint, Throwable ex) {
        String methodName = joinPoint.getSignature().getName();
        System.out.println("[异常通知] 方法: " + methodName + ", 异常: " + ex.getMessage());
    }
    
    // 6. 环绕通知 - 最强大的通知（可以控制是否执行目标方法）
    @Around("servicePointcut()")
    public Object aroundAdvice(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();
        String methodName = joinPoint.getSignature().getName();
        
        System.out.println("[环绕通知-前] 方法: " + methodName + " 开始执行");
        
        try {
            // 执行目标方法
            Object result = joinPoint.proceed();
            
            long endTime = System.currentTimeMillis();
            System.out.println("[环绕通知-后] 方法: " + methodName + " 执行耗时: " + (endTime - startTime) + "ms");
            
            return result;
        } catch (Throwable e) {
            System.out.println("[环绕通知-异常] 方法: " + methodName + " 执行异常: " + e.getMessage());
            throw e;
        }
    }
}
```

**切入点表达式详解**
```java
@Aspect
@Component
public class PointcutDemo {
    
    // 1. execution表达式（最常用）
    // 格式: execution(修饰符 返回值 类名.方法名(参数) 异常)
    
    // 匹配所有public方法
    @Pointcut("execution(public * *(..))")
    public void publicMethods() {}
    
    // 匹配所有方法
    @Pointcut("execution(* *(..))")
    public void allMethods() {}
    
    // 匹配特定类的方法
    @Pointcut("execution(* com.example.service.UserService.*(..))")
    public void userServiceMethods() {}
    
    // 匹配特定包下所有类的所有方法
    @Pointcut("execution(* com.example.service.*.*(..))")
    public void servicePackageMethods() {}
    
    // 匹配特定包及其子包
    @Pointcut("execution(* com.example..*.*(..))")
    public void allSubPackages() {}
    
    // 匹配方法参数
    @Pointcut("execution(* *(String, ..))")  // 第一个参数是String
    public void stringFirstParam() {}
    
    @Pointcut("execution(* *(.., String))")  // 最后一个参数是String
    public void stringLastParam() {}
    
    // 匹配返回值类型
    @Pointcut("execution(String *(..))")  // 返回String
    public void returnString() {}
    
    // 2. annotation表达式
    // 匹配带有特定注解的方法
    @Pointcut("@annotation(org.springframework.transaction.annotation.Transactional)")
    public void transactionalMethods() {}
    
    // 匹配带有特定注解的类的所有方法
    @Pointcut("@within(org.springframework.stereotype.Service)")
    public void serviceAnnotatedClasses() {}
    
    // 3. 组合切入点
    @Pointcut("servicePackageMethods() && !transactionalMethods()")
    public void serviceWithoutTransaction() {}
}
```

**实际应用场景**

**1. 日志切面**
```java
@Aspect
@Component
@Slf4j
public class LoggingAspect {
    
    @Around("@within(org.springframework.stereotype.Service) || " +
            "@within(org.springframework.web.bind.annotation.RestController)")
    public Object logMethod(ProceedingJoinPoint joinPoint) throws Throwable {
        String className = joinPoint.getTarget().getClass().getSimpleName();
        String methodName = joinPoint.getSignature().getName();
        Object[] args = joinPoint.getArgs();
        
        log.info(">>> {}.{}() - 参数: {}", className, methodName, Arrays.toString(args));
        
        long startTime = System.currentTimeMillis();
        try {
            Object result = joinPoint.proceed();
            long endTime = System.currentTimeMillis();
            
            log.info("<<< {}.{}() - 耗时: {}ms, 结果: {}", 
                    className, methodName, (endTime - startTime), result);
            
            return result;
        } catch (Throwable e) {
            log.error("!!! {}.{}() - 异常: {}", className, methodName, e.getMessage());
            throw e;
        }
    }
}
```

**2. 性能监控切面**
```java
@Aspect
@Component
public class PerformanceAspect {
    
    @Around("execution(* com.example..*.*(..))")
    public Object monitorPerformance(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();
        
        Object result = joinPoint.proceed();
        
        long endTime = System.currentTimeMillis();
        long duration = endTime - startTime;
        
        if (duration > 1000) {  // 超过1秒警告
            System.err.println("[性能警告] " + joinPoint.getSignature() + " 耗时: " + duration + "ms");
        }
        
        return result;
    }
}
```

**3. 缓存切面**
```java
@Aspect
@Component
public class CacheAspect {
    
    private Map<String, Object> cache = new ConcurrentHashMap<>();
    
    @Around("@annotation(Cacheable)")
    public Object cacheResult(ProceedingJoinPoint joinPoint) throws Throwable {
        String key = generateKey(joinPoint);
        
        // 从缓存获取
        if (cache.containsKey(key)) {
            System.out.println("从缓存获取: " + key);
            return cache.get(key);
        }
        
        // 执行方法并缓存
        Object result = joinPoint.proceed();
        cache.put(key, result);
        System.out.println("缓存结果: " + key);
        
        return result;
    }
    
    private String generateKey(ProceedingJoinPoint joinPoint) {
        String methodName = joinPoint.getSignature().toString();
        Object[] args = joinPoint.getArgs();
        return methodName + ":" + Arrays.toString(args);
    }
}

// 自定义注解
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Cacheable {
}
```

**4. 权限检查切面**
```java
@Aspect
@Component
public class AuthAspect {
    
    @Before("@annotation(RequiresRole)")
    public void checkPermission(JoinPoint joinPoint) {
        // 获取当前用户
        User currentUser = getCurrentUser();
        
        if (currentUser == null) {
            throw new UnauthorizedException("未登录");
        }
        
        // 获取注解上的角色要求
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        RequiresRole annotation = signature.getMethod().getAnnotation(RequiresRole.class);
        String requiredRole = annotation.value();
        
        // 检查权限
        if (!currentUser.getRoles().contains(requiredRole)) {
            throw new UnauthorizedException("权限不足，需要角色: " + requiredRole);
        }
    }
    
    private User getCurrentUser() {
        // 从Session或Token获取当前用户
        return null;
    }
}

// 自定义注解
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequiresRole {
    String value();
}

// 使用
@Service
public class AdminService {
    
    @RequiresRole("ADMIN")
    public void deleteUser(Long userId) {
        // 只有管理员才能执行
    }
}
```

### 3.2.3 Bean生命周期管理

#### Bean的完整生命周期
```java
@Component
public class MyBean implements InitializingBean, DisposableBean {
    
    private String name;
    
    // 1. 构造方法
    public MyBean() {
        System.out.println("1. 构造方法 - 实例化Bean");
        this.name = "测试Bean";
    }
    
    // 2. Setter注入
    @Autowired
    public void setDependency(Dependency dependency) {
        System.out.println("2. Setter注入 - 设置依赖");
    }
    
    // 3. 实现InitializingBean接口
    @Override
    public void afterPropertiesSet() throws Exception {
        System.out.println("3. afterPropertiesSet() - 属性设置完成后");
    }
    
    // 4. 自定义初始化方法
    @PostConstruct
    public void init() {
        System.out.println("4. @PostConstruct - 自定义初始化");
        // 初始化资源、建立连接等
    }
    
    // 5. 实现DisposableBean接口
    @Override
    public void destroy() throws Exception {
        System.out.println("5. destroy() - 销毁Bean");
    }
    
    // 6. 自定义销毁方法
    @PreDestroy
    public void cleanup() {
        System.out.println("6. @PreDestroy - 自定义销毁");
        // 释放资源、关闭连接等
    }
}
```

**生命周期执行顺序：**
```
1. 实例化（Instantiation）
   ↓
2. 属性赋值（Populate properties）
   ↓
3. 调用BeanNameAware.setBeanName()
   ↓
4. 调用BeanFactoryAware.setBeanFactory()
   ↓
5. 调用ApplicationContextAware.setApplicationContext()
   ↓
6. 调用BeanPostProcessor.postProcessBeforeInitialization()
   ↓
7. 调用@PostConstruct
   ↓
8. 调用InitializingBean.afterPropertiesSet()
   ↓
9. 调用自定义init-method
   ↓
10. 调用BeanPostProcessor.postProcessAfterInitialization()
    ↓
11. Bean就绪，可以使用
    ↓
12. 容器关闭时：
    - 调用@PreDestroy
    - 调用DisposableBean.destroy()
    - 调用自定义destroy-method
```

#### BeanPostProcessor
```java
@Component
public class MyBeanPostProcessor implements BeanPostProcessor {
    
    // 初始化之前调用
    @Override
    public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
        if (beanName.equals("myBean")) {
            System.out.println("BeanPostProcessor - 初始化前: " + beanName);
        }
        return bean;
    }
    
    // 初始化之后调用
    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
        if (beanName.equals("myBean")) {
            System.out.println("BeanPostProcessor - 初始化后: " + beanName);
            // 可以返回代理对象
        }
        return bean;
    }
}
```

#### Bean作用域
```java
// 1. 单例（默认）- 整个容器只有一个实例
@Component
@Scope("singleton")  // 或省略
public class SingletonBean {
    // Spring容器启动时创建，所有请求共享同一个实例
}

// 2. 原型 - 每次获取都创建新实例
@Component
@Scope("prototype")
public class PrototypeBean {
    // 每次getBean()都会创建新实例
}

// 3. 请求作用域（Web环境）
@Component
@Scope("request")
public class RequestBean {
    // 每个HTTP请求创建一个新实例
}

// 4. 会话作用域（Web环境）
@Component
@Scope("session")
public class SessionBean {
    // 每个HTTP Session创建一个新实例
}
```

### 3.2.4 Spring配置：XML → 注解 → Java Config

#### XML配置（传统方式，了解即可）
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xmlns:aop="http://www.springframework.org/schema/aop"
       xmlns:tx="http://www.springframework.org/schema/tx"
       xsi:schemaLocation="
           http://www.springframework.org/schema/beans
           http://www.springframework.org/schema/beans/spring-beans.xsd
           http://www.springframework.org/schema/context
           http://www.springframework.org/schema/context/spring-context.xsd
           http://www.springframework.org/schema/aop
           http://www.springframework.org/schema/aop/spring-aop.xsd
           http://www.springframework.org/schema/tx
           http://www.springframework.org/schema/tx/spring-tx.xsd">
    
    <!-- 属性文件占位符 -->
    <context:property-placeholder location="classpath:application.properties"/>
    
    <!-- 组件扫描 -->
    <context:component-scan base-package="com.example"/>
    
    <!-- 数据源 -->
    <bean id="dataSource" class="com.zaxxer.hikari.HikariDataSource">
        <property name="driverClassName" value="${db.driver}"/>
        <property name="jdbcUrl" value="${db.url}"/>
        <property name="username" value="${db.username}"/>
        <property name="password" value="${db.password}"/>
    </bean>
    
    <!-- 事务管理器 -->
    <bean id="transactionManager" class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
        <property name="dataSource" ref="dataSource"/>
    </bean>
    
    <!-- 启用注解驱动事务 -->
    <tx:annotation-driven transaction-manager="transactionManager"/>
    
    <!-- 启用AOP -->
    <aop:aspectj-autoproxy/>
    
</beans>
```

#### 注解配置（主流方式）
```java
@Configuration
@ComponentScan(basePackages = "com.example")
@PropertySource("classpath:application.properties")
public class AppConfig {
    
    @Value("${db.driver}")
    private String driver;
    
    @Value("${db.url}")
    private String url;
    
    @Value("${db.username}")
    private String username;
    
    @Value("${db.password}")
    private String password;
    
    @Bean
    public DataSource dataSource() {
        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setDriverClassName(driver);
        dataSource.setJdbcUrl(url);
        dataSource.setUsername(username);
        dataSource.setPassword(password);
        return dataSource;
    }
    
    @Bean
    public PlatformTransactionManager transactionManager(DataSource dataSource) {
        return new DataSourceTransactionManager(dataSource);
    }
}
```

#### Java Config（现代方式，推荐）
```java
@Configuration
@EnableAspectJAutoProxy  // 启用AOP
@EnableTransactionManagement  // 启用事务管理
public class SpringConfig {
    
    @Bean
    @ConfigurationProperties(prefix = "spring.datasource")
    public DataSource dataSource() {
        return new HikariDataSource();
    }
    
    @Bean
    public SqlSessionFactoryBean sqlSessionFactory(DataSource dataSource) {
        SqlSessionFactoryBean factory = new SqlSessionFactoryBean();
        factory.setDataSource(dataSource);
        return factory;
    }
}
```

### 3.2.5 事务管理（声明式事务）

#### 事务基础
```java
@Service
public class OrderService {
    
    @Autowired
    private OrderDao orderDao;
    
    @Autowired
    private InventoryDao inventoryDao;
    
    @Autowired
    private UserDao userDao;
    
    // 声明式事务（推荐）
    @Transactional
    public void createOrder(Order order) {
        // 1. 扣减库存
        inventoryDao.decreaseStock(order.getProductId(), order.getQuantity());
        
        // 2. 扣减余额
        userDao.decreaseBalance(order.getUserId(), order.getAmount());
        
        // 3. 创建订单
        orderDao.save(order);
        
        // 如果任何一步失败，整个事务回滚
    }
}
```

#### @Transactional详解
```java
@Service
public class TransactionDemo {
    
    // 1. 基本用法
    @Transactional
    public void method1() {
        // 默认配置：
        // - 传播行为：REQUIRED
        // - 隔离级别：DEFAULT
        // - 只读：false
        // - 超时：-1（无超时）
        // - 回滚：RuntimeException和Error
    }
    
    // 2. 指定回滚异常
    @Transactional(rollbackFor = Exception.class)
    public void method2() throws Exception {
        // 任何异常都回滚
    }
    
    // 3. 指定不回滚异常
    @Transactional(noRollbackFor = RuntimeException.class)
    public void method3() {
        // RuntimeException不回滚
    }
    
    // 4. 指定传播行为
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void method4() {
        // 总是创建新事务
    }
    
    // 5. 指定隔离级别
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public void method5() {
        // 串行化隔离级别
    }
    
    // 6. 只读事务（优化性能）
    @Transactional(readOnly = true)
    public List<User> method6() {
        // 只读查询
        return userDao.findAll();
    }
    
    // 7. 超时设置
    @Transactional(timeout = 30)
    public void method7() {
        // 30秒超时
    }
    
    // 8. 组合配置
    @Transactional(
        propagation = Propagation.REQUIRED,
        isolation = Isolation.DEFAULT,
        timeout = 30,
        readOnly = false,
        rollbackFor = Exception.class
    )
    public void method8() {
        // 完整配置
    }
}
```

#### 传播行为详解
```java
public enum Propagation {
    
    REQUIRED,          // 默认：如果当前有事务就加入，没有就新建
    SUPPORTS,          // 如果当前有事务就加入，没有就以非事务方式执行
    MANDATORY,         // 必须在一个已有事务中运行，否则抛出异常
    REQUIRES_NEW,      // 总是新建新事务，如果当前有事务就挂起当前事务
    NOT_SUPPORTED,     // 以非事务方式执行，如果当前有事务就挂起
    NEVER,             // 以非事务方式执行，如果当前有事务就抛出异常
    NESTED             // 如果当前有事务就嵌套执行（保存点），没有就新建
}

@Service
public class PropagationDemo {
    
    @Autowired
    private InnerService innerService;
    
    @Transactional
    public void outer() {
        // 外层事务
        
        innerService.inner1();  // REQUIRED：加入外层事务
        innerService.inner2();  // REQUIRES_NEW：新建独立事务
        innerService.inner3();  // NESTED：嵌套事务
    }
}

@Service
public class InnerService {
    
    @Transactional(propagation = Propagation.REQUIRED)
    public void inner1() {
        // 加入外层事务，同一个事务
    }
    
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void inner2() {
        // 新建独立事务，外层事务挂起
    }
    
    @Transactional(propagation = Propagation.NESTED)
    public void inner3() {
        // 嵌套事务，使用保存点
    }
}
```

### 3.2.6 Spring EL表达式

#### SpEL基本用法
```java
@Component
public class SpelDemo {
    
    // 1. 字面量
    @Value("#{100}")
    private int number;  // 100
    
    @Value("#{'Hello SpEL'}")
    private String message;  // Hello SpEL
    
    @Value("#{true}")
    private boolean flag;  // true
    
    // 2. 算术运算
    @Value("#{10 + 20}")
    private int sum;  // 30
    
    @Value("#{100 - 50}")
    private int diff;  // 50
    
    @Value("#{10 * 5}")
    private int product;  // 50
    
    @Value("#{100 / 3}")
    private double quotient;  // 33.333...
    
    @Value("#{10 % 3}")
    private int remainder;  // 1
    
    // 3. 比较运算
    @Value("#{100 > 50}")
    private boolean greater;  // true
    
    @Value("#{100 == 100}")
    private boolean equal;  // true
    
    // 4. 逻辑运算
    @Value("#{true and false}")
    private boolean and;  // false
    
    @Value("#{true or false}")
    private boolean or;  // true
    
    @Value("#{!true}")
    private boolean not;  // false
    
    // 5. 调用方法
    @Value("#{T(Math).random() * 100}")
    private double random;
    
    @Value("#{T(Math).max(10, 20)}")
    private int max;  // 20
    
    @Value("#{'hello'.toUpperCase()}")
    private String upper;  // HELLO
    
    @Value("#{'  hello  '.trim()}")
    private String trimmed;  // hello
    
    // 6. 访问Bean属性
    @Value("#{dataSource.url}")
    private String dbUrl;
    
    @Value("#{userService.findAll().size()}")
    private int userCount;
    
    // 7. 三元运算
    @Value("#{age >= 18 ? '成年' : '未成年'}")
    private String status;
    
    // 8. Elvis运算
    @Value("#{name ?: '默认名称'}")
    private String name;
}
```

#### SpEL在配置中使用
```java
@Configuration
public class Config {
    
    @Value("#{systemProperties['user.name']}")
    private String userName;
    
    @Value("#{systemEnvironment['JAVA_HOME']}")
    private String javaHome;
    
    @Bean
    public DataSource dataSource(
        @Value("${db.url}") String url,
        @Value("${db.username}") String username,
        @Value("${db.password}") String password
    ) {
        HikariDataSource ds = new HikariDataSource();
        ds.setJdbcUrl(url);
        ds.setUsername(username);
        ds.setPassword(password);
        return ds;
    }
}
```

---

## 3.3 Spring MVC

### 3.3.1 MVC模式在Spring中的实现

#### 什么是MVC
```
MVC = Model + View + Controller

Model（模型）：数据和业务逻辑
View（视图）：展示界面（JSP、HTML、JSON）
Controller（控制器）：接收请求，调用Model，返回View

前端对比：
- Vue/React：组件 = 模板(View) + 脚本(Controller) + 数据(Model)
- Spring MVC：Controller处理请求，Service处理业务，Entity是数据
```

#### Spring MVC架构
```
请求流程：
1. 客户端发送请求
   ↓
2. DispatcherServlet（前端控制器）接收请求
   ↓
3. HandlerMapping找到对应的Controller
   ↓
4. Controller处理请求，返回ModelAndView
   ↓
5. ViewResolver解析视图
   ↓
6. 渲染视图，返回响应
```

### 3.3.2 创建Spring MVC项目

**Maven依赖（pom.xml）**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>spring-mvc-demo</artifactId>
    <version>1.0.0</version>
    <packaging>war</packaging>

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <spring.version>6.0.11</spring.version>
    </properties>

    <dependencies>
        <!-- Spring MVC -->
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-webmvc</artifactId>
            <version>${spring.version}</version>
        </dependency>
        
        <!-- Spring Web -->
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-web</artifactId>
            <version>${spring.version}</version>
        </dependency>
        
        <!-- Jackson（JSON处理） -->
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
            <version>2.15.2</version>
        </dependency>
        
        <!-- Servlet API -->
        <dependency>
            <groupId>javax.servlet</groupId>
            <artifactId>javax.servlet-api</artifactId>
            <version>4.0.1</version>
            <scope>provided</scope>
        </dependency>
        
        <!-- JSP API -->
        <dependency>
            <groupId>javax.servlet.jsp</groupId>
            <artifactId>javax.servlet.jsp-api</artifactId>
            <version>2.3.3</version>
            <scope>provided</scope>
        </dependency>
        
        <!-- JSTL -->
        <dependency>
            <groupId>javax.servlet</groupId>
            <artifactId>jstl</artifactId>
            <version>1.2</version>
        </dependency>
        
        <!-- Bean Validation -->
        <dependency>
            <groupId>org.hibernate.validator</groupId>
            <artifactId>hibernate-validator</artifactId>
            <version>8.0.1.Final</version>
        </dependency>
        
        <!-- Lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>1.18.30</version>
            <scope>provided</scope>
        </dependency>
    </dependencies>
</project>
```

**web.xml配置**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee
         http://xmlns.jcp.org/xml/ns/javaee/web-app_4_0.xsd"
         version="4.0">
    
    <display-name>Spring MVC Demo</display-name>
    
    <!-- 编码过滤器 -->
    <filter>
        <filter-name>characterEncodingFilter</filter-name>
        <filter-class>org.springframework.web.filter.CharacterEncodingFilter</filter-class>
        <init-param>
            <param-name>encoding</param-name>
            <param-value>UTF-8</param-value>
        </init-param>
        <init-param>
            <param-name>forceEncoding</param-name>
            <param-value>true</param-value>
        </init-param>
    </filter>
    <filter-mapping>
        <filter-name>characterEncodingFilter</filter-name>
        <url-pattern>/*</url-pattern>
    </filter-mapping>
    
    <!-- 支持PUT/DELETE请求 -->
    <filter>
        <filter-name>hiddenHttpMethodFilter</filter-name>
        <filter-class>org.springframework.web.filter.HiddenHttpMethodFilter</filter-class>
    </filter>
    <filter-mapping>
        <filter-name>hiddenHttpMethodFilter</filter-name>
        <url-pattern>/*</url-pattern>
    </filter-mapping>
    
    <!-- Spring MVC前端控制器 -->
    <servlet>
        <servlet-name>dispatcher</servlet-name>
        <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
        <init-param>
            <param-name>contextConfigLocation</param-name>
            <param-value>classpath:spring-mvc.xml</param-value>
        </init-param>
        <load-on-startup>1</load-on-startup>
    </servlet>
    <servlet-mapping>
        <servlet-name>dispatcher</servlet-name>
        <url-pattern>/</url-pattern>
    </servlet-mapping>
    
</web-app>
```

**spring-mvc.xml配置**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xmlns:mvc="http://www.springframework.org/schema/mvc"
       xsi:schemaLocation="
           http://www.springframework.org/schema/beans
           http://www.springframework.org/schema/beans/spring-beans.xsd
           http://www.springframework.org/schema/context
           http://www.springframework.org/schema/context/spring-context.xsd
           http://www.springframework.org/schema/mvc
           http://www.springframework.org/schema/mvc/spring-mvc.xsd">
    
    <!-- 组件扫描 -->
    <context:component-scan base-package="com.example.controller"/>
    
    <!-- 启用MVC注解 -->
    <mvc:annotation-driven>
        <mvc:message-converters>
            <bean class="org.springframework.http.converter.json.MappingJackson2HttpMessageConverter">
                <property name="supportedMediaTypes">
                    <list>
                        <value>application/json;charset=UTF-8</value>
                        <value>text/json;charset=UTF-8</value>
                    </list>
                </property>
            </bean>
        </mvc:message-converters>
    </mvc:annotation-driven>
    
    <!-- 静态资源处理 -->
    <mvc:default-servlet-handler/>
    <mvc:resources mapping="/static/**" location="/static/"/>
    
    <!-- 视图解析器 -->
    <bean class="org.springframework.web.servlet.view.InternalResourceViewResolver">
        <property name="prefix" value="/WEB-INF/views/"/>
        <property name="suffix" value=".jsp"/>
    </bean>
    
    <!-- 文件上传 -->
    <bean id="multipartResolver" class="org.springframework.web.multipart.commons.CommonsMultipartResolver">
        <property name="maxUploadSize" value="10485760"/>
        <property name="defaultEncoding" value="UTF-8"/>
    </bean>
    
</beans>
```

### 3.3.3 @Controller和@RequestMapping

#### 创建Controller
```java
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.ui.Model;
import org.springframework.web.servlet.ModelAndView;

@Controller
@RequestMapping("/users")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    // 1. 基本用法
    @RequestMapping(value = "/list", method = RequestMethod.GET)
    public String listUsers(Model model) {
        List<User> users = userService.findAll();
        model.addAttribute("users", users);
        return "user/list";  // 返回视图名称
    }
    
    // 2. 简化写法（推荐）
    @GetMapping("/list")
    public String listUsers2(Model model) {
        List<User> users = userService.findAll();
        model.addAttribute("users", users);
        return "user/list";
    }
    
    // 3. 返回JSON（RESTful API）
    @GetMapping("/api/list")
    @ResponseBody
    public List<User> listUsersApi() {
        return userService.findAll();
    }
    
    // 4. 返回ModelAndView
    @GetMapping("/detail")
    public ModelAndView detail(@RequestParam Long id) {
        User user = userService.findById(id);
        ModelAndView mav = new ModelAndView();
        mav.addObject("user", user);
        mav.setViewName("user/detail");
        return mav;
    }
    
    // 5. 处理POST请求
    @PostMapping("/save")
    public String saveUser(User user) {
        userService.save(user);
        return "redirect:/users/list";
    }
    
    // 6. 处理PUT请求
    @PutMapping("/update")
    @ResponseBody
    public Result updateUser(@RequestBody User user) {
        userService.update(user);
        return Result.success();
    }
    
    // 7. 处理DELETE请求
    @DeleteMapping("/delete/{id}")
    @ResponseBody
    public Result deleteUser(@PathVariable Long id) {
        userService.deleteById(id);
        return Result.success();
    }
}
```

#### @RequestMapping详解
```java
@Controller
public class RequestMappingDemo {
    
    // 1. 类级别映射（公共前缀）
    @RequestMapping("/api")
    public class ApiController {
        
        // 完整路径：/api/users
        @GetMapping("/users")
        public String users() {
            return "users";
        }
        
        // 2. 多路径映射
        @GetMapping({"/users", "/user/list"})
        public String usersList() {
            return "users";
        }
        
        // 3. 路径变量
        @GetMapping("/users/{id}")
        public String getUser(@PathVariable Long id) {
            return "user detail: " + id;
        }
        
        // 4. 多个路径变量
        @GetMapping("/users/{userId}/orders/{orderId}")
        public String getUserOrder(
            @PathVariable Long userId,
            @PathVariable Long orderId) {
            return "user: " + userId + ", order: " + orderId;
        }
        
        // 5. 请求参数匹配
        @GetMapping("/search")
        public String search(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
            return "search: " + keyword + ", page: " + page;
        }
        
        // 6. 可选参数
        @GetMapping("/filter")
        public String filter(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer age) {
            return "filter";
        }
        
        // 7. 请求头匹配
        @GetMapping(value = "/headers", headers = "X-Custom-Header")
        public String withHeader() {
            return "has custom header";
        }
        
        // 8. Content-Type匹配
        @PostMapping(value = "/json", consumes = "application/json")
        @ResponseBody
        public String jsonOnly() {
            return "json request";
        }
        
        // 9. 指定produces
        @GetMapping(value = "/xml", produces = "application/xml")
        @ResponseBody
        public String xmlResponse() {
            return "<user>张三</user>";
        }
    }
}
```

### 3.3.4 请求参数绑定

#### 基本参数绑定
```java
@Controller
@RequestMapping("/params")
public class ParamController {
    
    // 1. 基本类型参数
    @GetMapping("/basic")
    @ResponseBody
    public String basic(
        @RequestParam String name,
        @RequestParam int age,
        @RequestParam boolean active) {
        return "name: " + name + ", age: " + age + ", active: " + active;
    }
    
    // 2. 参数别名
    @GetMapping("/alias")
    @ResponseBody
    public String alias(@RequestParam("user_name") String username) {
        return "username: " + username;
    }
    
    // 3. 默认值
    @GetMapping("/default")
    @ResponseBody
    public String defaultValue(
        @RequestParam(defaultValue = "张三") String name,
        @RequestParam(defaultValue = "18") int age) {
        return "name: " + name + ", age: " + age;
    }
    
    // 4. 可选参数
    @GetMapping("/optional")
    @ResponseBody
    public String optional(
        @RequestParam(required = false) String email,
        @RequestParam(required = false) Integer age) {
        return "email: " + email + ", age: " + age;
    }
    
    // 5. 数组参数
    @GetMapping("/array")
    @ResponseBody
    public String array(@RequestParam List<String> hobbies) {
        return "hobbies: " + hobbies;
    }
    
    // 6. 路径变量
    @GetMapping("/path/{id}")
    @ResponseBody
    public String pathVariable(@PathVariable Long id) {
        return "id: " + id;
    }
    
    // 7. 请求头
    @GetMapping("/header")
    @ResponseBody
    public String header(
        @RequestHeader("User-Agent") String userAgent,
        @RequestHeader(value = "Authorization", required = false) String token) {
        return "User-Agent: " + userAgent;
    }
    
    // 8. Cookie值
    @GetMapping("/cookie")
    @ResponseBody
    public String cookie(@CookieValue("JSESSIONID") String sessionId) {
        return "Session ID: " + sessionId;
    }
}
```

#### 对象参数绑定
```java
@Data
public class User {
    private Long id;
    private String username;
    private String email;
    private Integer age;
    private Address address;
    private List<String> hobbies;
}

@Data
public class Address {
    private String province;
    private String city;
    private String street;
}

@Controller
@RequestMapping("/object")
public class ObjectParamController {
    
    // 1. 自动绑定（参数名与属性名一致）
    @PostMapping("/save")
    @ResponseBody
    public String save(User user) {
        // 自动将请求参数绑定到User对象
        // ?username=张三&age=25&email=zhangsan@example.com
        return "user: " + user;
    }
    
    // 2. 嵌套对象绑定
    @PostMapping("/saveWithAddress")
    @ResponseBody
    public String saveWithAddress(User user) {
        // ?username=张三&address.province=广东&address.city=深圳
        return "user: " + user + ", address: " + user.getAddress();
    }
    
    // 3. 集合绑定
    @PostMapping("/saveWithHobbies")
    @ResponseBody
    public String saveWithHobbies(User user) {
        // ?username=张三&hobbies=阅读&hobbies=游泳&hobbies=编程
        return "user: " + user + ", hobbies: " + user.getHobbies();
    }
    
    // 4. JSON格式（@RequestBody）
    @PostMapping("/saveJson")
    @ResponseBody
    public String saveJson(@RequestBody User user) {
        // Content-Type: application/json
        // {"username":"张三","age":25,"email":"zhangsan@example.com"}
        return "user: " + user;
    }
    
    // 5. List集合
    @PostMapping("/saveList")
    @ResponseBody
    public String saveList(@RequestBody List<User> users) {
        return "users: " + users;
    }
    
    // 6. Map集合
    @PostMapping("/saveMap")
    @ResponseBody
    public String saveMap(@RequestBody Map<String, Object> data) {
        return "data: " + data;
    }
}
```

#### 文件上传
```java
@Controller
@RequestMapping("/upload")
public class UploadController {
    
    @PostMapping("/file")
    @ResponseBody
    public String uploadFile(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return "文件为空";
        }
        
        // 获取文件信息
        String fileName = file.getOriginalFilename();
        long size = file.getSize();
        String contentType = file.getContentType();
        
        System.out.println("文件名: " + fileName);
        System.out.println("大小: " + size + " bytes");
        System.out.println("类型: " + contentType);
        
        // 保存文件
        String uploadDir = "D:/uploads/";
        File dir = new File(uploadDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }
        
        File dest = new File(dir, fileName);
        file.transferTo(dest);
        
        return "上传成功: " + fileName;
    }
    
    @PostMapping("/files")
    @ResponseBody
    public String uploadFiles(@RequestParam("files") MultipartFile[] files) throws IOException {
        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                String fileName = file.getOriginalFilename();
                File dest = new File("D:/uploads/", fileName);
                file.transferTo(dest);
            }
        }
        return "批量上传成功";
    }
}
```

### 3.3.5 数据验证（@Valid）

#### 添加依赖
```xml
<!-- Bean Validation -->
<dependency>
    <groupId>org.hibernate.validator</groupId>
    <artifactId>hibernate-validator</artifactId>
    <version>8.0.1.Final</version>
</dependency>
```

#### 定义验证规则
```java
import javax.validation.constraints.*;

@Data
public class UserDTO {
    
    @NotNull(message = "用户名不能为空")
    @Size(min = 3, max = 20, message = "用户名长度必须在3-20之间")
    private String username;
    
    @NotNull(message = "密码不能为空")
    @Size(min = 6, max = 20, message = "密码长度必须在6-20之间")
    private String password;
    
    @NotNull(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    private String email;
    
    @Min(value = 18, message = "年龄必须大于18岁")
    @Max(value = 100, message = "年龄不能大于100岁")
    private Integer age;
    
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String phone;
    
    @AssertTrue(message = "必须同意用户协议")
    private Boolean agree;
}
```

#### 使用验证
```java
@Controller
@RequestMapping("/validate")
public class ValidateController {
    
    @PostMapping("/register")
    @ResponseBody
    public Result register(@Valid @RequestBody UserDTO userDTO, 
                          BindingResult bindingResult) {
        
        // 检查验证结果
        if (bindingResult.hasErrors()) {
            // 获取所有错误信息
            List<String> errors = bindingResult.getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.toList());
            
            return Result.error(400, "参数验证失败", errors);
        }
        
        // 验证通过，执行业务逻辑
        userService.register(userDTO);
        return Result.success();
    }
    
    // 分组验证
    @PostMapping("/update")
    @ResponseBody
    public Result update(@Validated(UpdateGroup.class) @RequestBody UserDTO userDTO,
                        BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            return Result.error(400, "参数验证失败");
        }
        userService.update(userDTO);
        return Result.success();
    }
}

// 定义验证分组
public interface UpdateGroup {}
public interface CreateGroup {}

// 在DTO中使用分组
@Data
public class UserDTO {
    @Null(groups = UpdateGroup.class, message = "更新时ID不能为空")
    @NotNull(groups = CreateGroup.class, message = "创建时ID不能为空")
    private Long id;
    
    @NotNull(groups = {CreateGroup.class, UpdateGroup.class}, message = "用户名不能为空")
    private String username;
}
```

#### 自定义验证注解
```java
// 1. 定义注解
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = PhoneValidator.class)
public @interface Phone {
    String message() default "手机号格式不正确";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

// 2. 实现验证器
public class PhoneValidator implements ConstraintValidator<Phone, String> {
    
    private static final Pattern PHONE_PATTERN = Pattern.compile("^1[3-9]\\d{9}$");
    
    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.trim().isEmpty()) {
            return true;  // 空值由@NotNull验证
        }
        return PHONE_PATTERN.matcher(value).matches();
    }
}

// 3. 使用自定义注解
@Data
public class UserDTO {
    @Phone
    private String phone;
}
```

### 3.3.6 异常处理（@ControllerAdvice）

#### 统一异常处理
```java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    
    // 1. 处理自定义业务异常
    @ExceptionHandler(BusinessException.class)
    public Result handleBusinessException(BusinessException e) {
        log.error("业务异常: {}", e.getMessage());
        return Result.error(e.getCode(), e.getMessage());
    }
    
    // 2. 处理参数验证异常
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result handleValidationException(MethodArgumentNotValidException e) {
        List<String> errors = e.getBindingResult().getFieldErrors().stream()
            .map(error -> error.getField() + ": " + error.getDefaultMessage())
            .collect(Collectors.toList());
        
        log.error("参数验证失败: {}", errors);
        return Result.error(400, "参数验证失败", errors);
    }
    
    // 3. 处理参数绑定异常
    @ExceptionHandler(BindException.class)
    public Result handleBindException(BindException e) {
        List<String> errors = e.getBindingResult().getFieldErrors().stream()
            .map(error -> error.getField() + ": " + error.getDefaultMessage())
            .collect(Collectors.toList());
        
        log.error("参数绑定失败: {}", errors);
        return Result.error(400, "参数绑定失败", errors);
    }
    
    // 4. 处理类型转换异常
    @ExceptionHandler(TypeMismatchException.class)
    public Result handleTypeMismatchException(TypeMismatchException e) {
        log.error("类型转换失败: {}", e.getMessage());
        return Result.error(400, "参数类型错误: " + e.getPropertyName());
    }
    
    // 5. 处理空指针异常
    @ExceptionHandler(NullPointerException.class)
    public Result handleNullPointerException(NullPointerException e) {
        log.error("空指针异常", e);
        return Result.error(500, "服务器内部错误");
    }
    
    // 6. 处理所有未捕获的异常
    @ExceptionHandler(Exception.class)
    public Result handleException(Exception e) {
        log.error("系统异常", e);
        return Result.error(500, "服务器内部错误");
    }
}

// 自定义业务异常
public class BusinessException extends RuntimeException {
    private Integer code;
    
    public BusinessException(String message) {
        super(message);
        this.code = 500;
    }
    
    public BusinessException(Integer code, String message) {
        super(message);
        this.code = code;
    }
    
    public Integer getCode() {
        return code;
    }
}

// 统一返回结果
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Result<T> {
    private Integer code;
    private String message;
    private T data;
    
    public static <T> Result<T> success() {
        return new Result<>(200, "success", null);
    }
    
    public static <T> Result<T> success(T data) {
        return new Result<>(200, "success", data);
    }
    
    public static <T> Result<T> error(String message) {
        return new Result<>(500, message, null);
    }
    
    public static <T> Result<T> error(Integer code, String message) {
        return new Result<>(code, message, null);
    }
    
    public static <T> Result<T> error(Integer code, String message, T data) {
        return new Result<>(code, message, data);
    }
}
```

### 3.3.7 拦截器（Interceptor）

#### 创建拦截器
```java
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class LogInterceptor implements HandlerInterceptor {
    
    // 1. 请求处理之前（Controller方法调用前）
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, 
                            Object handler) throws Exception {
        String uri = request.getRequestURI();
        String method = request.getMethod();
        String clientIP = request.getRemoteAddr();
        
        System.out.println("[拦截器-前] " + method + " " + uri + " - IP: " + clientIP);
        
        // 记录开始时间
        request.setAttribute("startTime", System.currentTimeMillis());
        
        // 返回true继续执行，返回false中断请求
        return true;
    }
    
    // 2. 请求处理之后（Controller方法调用后，视图渲染前）
    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, 
                          Object handler, ModelAndView modelAndView) throws Exception {
        System.out.println("[拦截器-后] Controller执行完成");
        
        // 可以修改ModelAndView
        if (modelAndView != null) {
            modelAndView.addObject("currentTime", new Date());
        }
    }
    
    // 3. 整个请求完成后（视图渲染完成后）
    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, 
                               Object handler, Exception ex) throws Exception {
        Long startTime = (Long) request.getAttribute("startTime");
        long duration = System.currentTimeMillis() - startTime;
        
        System.out.println("[拦截器-完成] 请求耗时: " + duration + "ms");
        
        if (ex != null) {
            System.out.println("[拦截器-异常] " + ex.getMessage());
        }
    }
}
```

#### 登录验证拦截器
```java
public class AuthInterceptor implements HandlerInterceptor {
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, 
                            Object handler) throws Exception {
        
        String uri = request.getRequestURI();
        
        // 排除不需要验证的路径
        if (uri.contains("/login") || uri.contains("/register") || uri.contains("/captcha")) {
            return true;
        }
        
        // 从Session获取用户
        HttpSession session = request.getSession(false);
        Object user = session != null ? session.getAttribute("user") : null;
        
        // 从Header获取Token
        String token = request.getHeader("Authorization");
        
        if (user == null && (token == null || !validateToken(token))) {
            // 未登录
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"code\":401,\"message\":\"未登录或登录已过期\"}");
            return false;  // 中断请求
        }
        
        return true;  // 继续执行
    }
    
    private boolean validateToken(String token) {
        // 验证Token逻辑
        return token != null && token.startsWith("Bearer ");
    }
}
```

#### 配置拦截器
```java
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
    
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // 1. 日志拦截器
        registry.addInterceptor(new LogInterceptor())
            .addPathPatterns("/**")  // 拦截所有请求
            .excludePathPatterns("/static/**", "/error");  // 排除静态资源
        
        // 2. 登录验证拦截器
        registry.addInterceptor(new AuthInterceptor())
            .addPathPatterns("/api/**")  // 只拦截/api/**
            .excludePathPatterns(
                "/api/login",
                "/api/register",
                "/api/captcha"
            );
    }
    
    // 配置静态资源
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/static/**")
            .addResourceLocations("classpath:/static/");
    }
    
    // 配置CORS
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("*")
            .allowedMethods("GET", "POST", "PUT", "DELETE")
            .allowedHeaders("*")
            .maxAge(3600);
    }
}
```

### 3.3.8 RESTful API设计（对比前端的API调用视角）

#### RESTful规范
```
RESTful API设计原则：
1. 使用HTTP方法表示操作类型
   - GET：查询
   - POST：创建
   - PUT：更新（全量）
   - PATCH：更新（部分）
   - DELETE：删除

2. 使用URL路径表示资源
   - /users：用户集合
   - /users/1：ID为1的用户
   - /users/1/orders：ID为1的用户的订单

3. 使用HTTP状态码表示结果
   - 200：成功
   - 201：创建成功
   - 204：删除成功
   - 400：请求错误
   - 401：未认证
   - 403：无权限
   - 404：资源不存在
   - 500：服务器错误
```

#### RESTful Controller
```java
@RestController
@RequestMapping("/api/users")
public class UserRestController {
    
    @Autowired
    private UserService userService;
    
    // 1. 获取用户列表
    @GetMapping
    public Result<List<User>> list(
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "10") int size) {
        
        Page<User> pageResult = userService.findByPage(page, size);
        return Result.success(pageResult.getContent());
    }
    
    // 2. 获取单个用户
    @GetMapping("/{id}")
    public Result<User> getById(@PathVariable Long id) {
        User user = userService.findById(id);
        if (user == null) {
            return Result.error(404, "用户不存在");
        }
        return Result.success(user);
    }
    
    // 3. 创建用户
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Result<User> create(@Valid @RequestBody UserDTO userDTO) {
        User user = userService.create(userDTO);
        return Result.success(user);
    }
    
    // 4. 更新用户（全量）
    @PutMapping("/{id}")
    public Result<User> update(@PathVariable Long id, @Valid @RequestBody UserDTO userDTO) {
        User user = userService.update(id, userDTO);
        return Result.success(user);
    }
    
    // 5. 更新用户（部分）
    @PatchMapping("/{id}")
    public Result<User> patch(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        User user = userService.patch(id, updates);
        return Result.success(user);
    }
    
    // 6. 删除用户
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Result<Void> delete(@PathVariable Long id) {
        userService.deleteById(id);
        return Result.success();
    }
    
    // 7. 获取用户的订单
    @GetMapping("/{userId}/orders")
    public Result<List<Order>> getUserOrders(@PathVariable Long userId) {
        List<Order> orders = userService.findOrdersByUserId(userId);
        return Result.success(orders);
    }
    
    // 8. 搜索用户
    @GetMapping("/search")
    public Result<List<User>> search(
        @RequestParam String keyword,
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "10") int size) {
        
        List<User> users = userService.search(keyword, page, size);
        return Result.success(users);
    }
}
```

#### 前端调用对比
```javascript
// 前端调用RESTful API
const API_BASE = 'http://localhost:8080/api';

// 1. 获取用户列表
fetch(`${API_BASE}/users?page=1&size=10`)
  .then(res => res.json())
  .then(data => console.log(data));

// 2. 获取单个用户
fetch(`${API_BASE}/users/1`)
  .then(res => res.json())
  .then(data => console.log(data));

// 3. 创建用户
fetch(`${API_BASE}/users`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: '张三',
    email: 'zhangsan@example.com',
    age: 25
  })
})
.then(res => res.json())
.then(data => console.log(data));

// 4. 更新用户
fetch(`${API_BASE}/users/1`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: '李四',
    email: 'lisi@example.com'
  })
})
.then(res => res.json())
.then(data => console.log(data));

// 5. 删除用户
fetch(`${API_BASE}/users/1`, {
  method: 'DELETE'
})
.then(res => console.log('删除成功'));
```

#### 统一返回格式
```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Result<T> {
    private Integer code;      // 状态码
    private String message;    // 提示信息
    private T data;           // 数据
    private Long timestamp;   // 时间戳
    
    public Result(Integer code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
        this.timestamp = System.currentTimeMillis();
    }
    
    public static <T> Result<T> success() {
        return new Result<>(200, "success", null);
    }
    
    public static <T> Result<T> success(T data) {
        return new Result<>(200, "success", data);
    }
    
    public static <T> Result<T> success(String message, T data) {
        return new Result<>(200, message, data);
    }
    
    public static <T> Result<T> error(String message) {
        return new Result<>(500, message, null);
    }
    
    public static <T> Result<T> error(Integer code, String message) {
        return new Result<>(code, message, null);
    }
}

// 分页结果
@Data
public class PageResult<T> {
    private List<T> list;
    private Long total;
    private Integer page;
    private Integer size;
    private Integer totalPages;
    
    public PageResult(List<T> list, Long total, Integer page, Integer size) {
        this.list = list;
        this.total = total;
        this.page = page;
        this.size = size;
        this.totalPages = (int) Math.ceil((double) total / size);
    }
}
```

---

## 练习任务

### 任务1：Servlet基础练习
1. 创建一个简单的Servlet处理GET和POST请求
2. 实现用户登录功能（验证用户名密码）
3. 使用Session保存登录状态
4. 创建Filter实现登录验证

### 任务2：Spring IoC练习
1. 创建Service和DAO层
2. 使用注解方式配置Bean
3. 实现依赖注入（构造器注入、Setter注入）
4. 测试Bean的生命周期

### 任务3：Spring AOP练习
1. 创建日志切面，记录方法调用
2. 创建性能监控切面，记录方法执行时间
3. 创建缓存切面，缓存方法结果

### 任务4：Spring MVC练习
1. 创建RESTful API实现用户CRUD
2. 实现数据验证（@Valid）
3. 实现全局异常处理（@ControllerAdvice）
4. 实现拦截器（登录验证、日志记录）

### 任务5：综合项目
创建一个完整的用户管理系统：
- 用户注册、登录
- 用户信息CRUD
- 权限控制
- 日志记录
- 统一异常处理

---

## 学习检查清单

### Java Web基础
- [ ] 理解HTTP协议在Java中的处理
- [ ] 掌握Servlet生命周期
- [ ] 能够创建Filter和Listener
- [ ] 了解JSP基本语法（可选）
- [ ] 掌握Tomcat配置和部署

### Spring Framework核心
- [ ] 理解IoC和DI的概念
- [ ] 掌握Bean的创建方式（注解、XML、Java Config）
- [ ] 掌握依赖注入方式（构造器、Setter、字段）
- [ ] 理解AOP的概念和使用场景
- [ ] 能够创建切面和通知
- [ ] 掌握Bean生命周期
- [ ] 理解事务管理和传播行为
- [ ] 掌握SpEL表达式

### Spring MVC
- [ ] 理解MVC模式
- [ ] 掌握@Controller和@RequestMapping
- [ ] 能够绑定请求参数（基本类型、对象、JSON）
- [ ] 掌握数据验证（@Valid）
- [ ] 能够实现全局异常处理
- [ ] 能够创建和使用拦截器
- [ ] 掌握RESTful API设计
- [ ] 能够实现统一返回格式

---

## 推荐资源

### 官方文档
- Spring Framework: https://spring.io/projects/spring-framework
- Spring MVC: https://docs.spring.io/spring-framework/docs/current/reference/html/web.html

### 书籍
- 《Spring实战》（Spring in Action）
- 《Spring MVC学习指南》

### 视频
- B站：Spring Framework教程
- 慕课网：Spring MVC入门

---

**完成本阶段后，你应该能够：**
1. 理解Java Web的基本工作原理
2. 熟练使用Spring Framework进行开发
3. 能够创建RESTful API
4. 为后续学习Spring Boot打下坚实基础
