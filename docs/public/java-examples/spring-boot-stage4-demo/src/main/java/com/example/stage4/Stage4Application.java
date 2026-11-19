package com.example.stage4;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Spring Boot 启动类，也是整个项目的入口。
 *
 * @SpringBootApplication 可以理解成三个注解的组合：
 * 1. @Configuration：告诉 Spring 这里有配置。
 * 2. @EnableAutoConfiguration：根据 pom.xml 中的依赖自动配置 Web、JSON、Tomcat 等能力。
 * 3. @ComponentScan：扫描当前包和子包，把 @Controller、@Service 等类交给 Spring 管理。
 */
@SpringBootApplication
public class Stage4Application {

    public static void main(String[] args) {
        SpringApplication.run(Stage4Application.class, args);
    }
}
