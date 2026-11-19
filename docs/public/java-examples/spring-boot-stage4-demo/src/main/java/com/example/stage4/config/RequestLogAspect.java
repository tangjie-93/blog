package com.example.stage4.config;

import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * AOP 请求日志。
 *
 * 切面适合处理“横切关注点”，比如日志、耗时统计、权限检查。
 * 这些逻辑不属于某个具体业务，放在切面里可以避免每个 Controller 重复写。
 */
@Aspect
@Component
public class RequestLogAspect {

    private static final Logger log = LoggerFactory.getLogger(RequestLogAspect.class);

    @Around("execution(* com.example.stage4.controller..*(..))")
    public Object logControllerCall(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();
        ServletRequestAttributes attributes =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

        String method = "UNKNOWN";
        String uri = "UNKNOWN";
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            method = request.getMethod();
            uri = request.getRequestURI();
        }

        try {
            Object result = joinPoint.proceed();
            log.info("{} {} -> {}ms", method, uri, System.currentTimeMillis() - start);
            return result;
        } catch (Throwable throwable) {
            log.warn("{} {} -> failed in {}ms: {}", method, uri,
                    System.currentTimeMillis() - start, throwable.getMessage());
            throw throwable;
        }
    }
}
