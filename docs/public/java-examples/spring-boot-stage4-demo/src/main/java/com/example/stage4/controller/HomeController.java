package com.example.stage4.controller;

import com.example.stage4.common.Result;
import com.example.stage4.config.AppProperties;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.env.Environment;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@Tag(name = "首页与配置")
@RestController
public class HomeController {

    private final AppProperties appProperties;
    private final Environment environment;

    public HomeController(AppProperties appProperties, Environment environment) {
        this.appProperties = appProperties;
        this.environment = environment;
    }

    @Operation(summary = "首页", description = "查看项目说明和常用入口")
    @GetMapping("/")
    public Result<Map<String, Object>> index() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("name", appProperties.getName());
        data.put("version", appProperties.getVersion());
        data.put("description", appProperties.getDescription());
        data.put("profiles", environment.getActiveProfiles());
        data.put("usersApi", "/stage4/api/users");
        data.put("articlesApi", "/stage4/api/articles");
        data.put("knife4j", "/stage4/doc.html");
        data.put("health", "/stage4/actuator/health");
        return Result.success(data);
    }
}
