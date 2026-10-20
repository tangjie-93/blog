package com.example.stage4.config;

import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * JSON 全局配置。
 *
 * 这里演示两个真实项目常用配置：
 * 1. LocalDateTime 统一格式，避免前端拿到数组或 ISO 格式看不懂。
 * 2. Long 转 String，避免 JavaScript 大整数精度丢失。
 */
@Configuration
public class JacksonConfig {

    private static final DateTimeFormatter DATE_TIME_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Bean
    public Jackson2ObjectMapperBuilderCustomizer jsonCustomizer() {
        return builder -> {
            // LocalDateTime 序列化：统一输出 yyyy-MM-dd HH:mm:ss 格式
            builder.serializerByType(LocalDateTime.class, new LocalDateTimeSerializer(DATE_TIME_FORMATTER));
            // LocalDateTime 反序列化：支持前端传入 yyyy-MM-dd HH:mm:ss 格式字符串
            builder.deserializerByType(LocalDateTime.class, new LocalDateTimeDeserializer(DATE_TIME_FORMATTER));
            // Long 序列化为 String，避免 JavaScript 大整数精度丢失
            builder.serializerByType(Long.class, ToStringSerializer.instance);
            // long 基本类型同样序列化为 String
            builder.serializerByType(Long.TYPE, ToStringSerializer.instance);
        };
    }
}
