package com.example.stage3.config;

import com.baomidou.mybatisplus.extension.spring.MybatisSqlSessionFactoryBean;
import com.example.stage3.interceptor.AuthInterceptor;
import com.example.stage3.interceptor.LogInterceptor;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.zaxxer.hikari.HikariDataSource;
import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import javax.sql.DataSource;
import java.util.List;

/**
 * Spring MVC + MyBatis-Plus 整合配置类 — 所有 Spring Bean 的装载起点
 *
 * 调用链：web.xml → DispatcherServlet → WebConfig → @ComponentScan 扫描所有 Bean
 *
 * 启用的功能：
 * - @EnableWebMvc：开启 Spring MVC
 * - @ComponentScan：扫描 Controller/Service/DAO
 * - @EnableAspectJAutoProxy：AOP 代理
 * - @MapperScan：扫描 MyBatis-Plus 的 Mapper 接口
 */
@Configuration
@EnableWebMvc
@EnableAspectJAutoProxy
@ComponentScan("com.example.stage3")
@MapperScan("com.example.stage3.dao.mapper")   // 扫描 MyBatis-Plus Mapper 接口
public class WebConfig implements WebMvcConfigurer {

    // ==================== MyBatis-Plus / 数据库配置 ====================

    /** HikariCP 连接池 */
    @Bean
    public DataSource dataSource() {
        HikariDataSource ds = new HikariDataSource();
        ds.setDriverClassName("com.mysql.cj.jdbc.Driver");
        ds.setJdbcUrl("jdbc:mysql://localhost:3306/test_db?useSSL=false&serverTimezone=UTC&characterEncoding=utf8");
        ds.setUsername("root");
        ds.setPassword("Jamestang93!");
        return ds;
    }

    /** MyBatis-Plus SqlSessionFactory：加载 mybatis-config.xml + DataSource */
    @Bean
    public SqlSessionFactory sqlSessionFactory(DataSource dataSource) throws Exception {
        MybatisSqlSessionFactoryBean factory = new MybatisSqlSessionFactoryBean();
        factory.setDataSource(dataSource);
        factory.setConfigLocation(new ClassPathResource("mybatis-config.xml"));
        return factory.getObject();
    }

    // ==================== Spring MVC 配置 ====================

    /**
     * 配置 Jackson 序列化：
     * - 注册 JavaTimeModule，让 LocalDateTime 能正确序列化为 ISO 格式
     * - 禁用 WRITE_DATES_AS_TIMESTAMPS，日期不输出为毫秒数组
     */
    @Override
    public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        converters.add(new MappingJackson2HttpMessageConverter(objectMapper));
    }

    /** 启用 Bean Validation（@Valid/@NotBlank/@Email 等注解生效） */
    @Override
    public org.springframework.validation.Validator getValidator() {
        return new LocalValidatorFactoryBean();
    }

    /**
     * 注册拦截器（执行顺序为注册顺序）：
     * - LogInterceptor：先执行，记录所有 Spring 请求的 URL + 耗时
     * - AuthInterceptor：后执行，只拦截 /api/users/**，排除 login 和 register
     */
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new LogInterceptor())
                .addPathPatterns("/**")
                .excludePathPatterns("/static/**");

        registry.addInterceptor(new AuthInterceptor())
                .addPathPatterns("/api/users/**")
                .excludePathPatterns("/api/users/login", "/api/users/register");
    }

    /** Spring 层面的 CORS 配置（与 CorsFilter 互补） */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .maxAge(3600);
    }

    /** 静态资源映射：/static/** → /static/ 目录 */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/static/**").addResourceLocations("/static/");
    }
}
