package com.example.stage3.controller;

import com.example.stage3.support.Result;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;

/**
 * 首页 / 健康检查 — 返回服务运行状态和可用 API 列表
 */
@RestController
@RequestMapping
public class HomeController {

    /** 匹配 GET /、GET /health，返回服务状态和 API 导航 */
    @GetMapping({"", "/", "/health"})
    public Result<List<String>> index() {
        return Result.success("java-web-stage3-demo is running", Arrays.asList(
                "GET /stage3/servlet/hello",
                "POST /stage3/api/users/login",
                "POST /stage3/api/users/register",
                "GET /stage3/api/users with Authorization: Bearer demo-token"
        ));
    }
}
