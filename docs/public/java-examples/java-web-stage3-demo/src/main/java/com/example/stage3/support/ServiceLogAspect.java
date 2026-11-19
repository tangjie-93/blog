package com.example.stage3.support;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

/**
 * AOP 切面 — 自动拦截 Service 层所有方法，记录执行耗时
 *
 * @Aspect 声明这是一个切面
 * @Component 让 Spring 扫描到并管理
 * @Around 切点表达式 "execution(* com.example.stage3.service..*(..))"
 *         匹配 service 包及其子包下的所有方法（无论返回值、参数、方法名）
 *
 * 执行流程：
 *   1. joinPoint.proceed() 之前 → 记录开始时间
 *   2. joinPoint.proceed()        → 执行真实的 Service 方法
 *   3. finally 块                 → 无论是否抛异常，都打印耗时
 */
@Aspect
@Component
public class ServiceLogAspect {

    @Around("execution(* com.example.stage3.service..*(..))")
    public Object logServiceCall(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();
        try {
            return joinPoint.proceed();
        } finally {
            long cost = System.currentTimeMillis() - start;
            System.out.println("[AOP] " + joinPoint.getSignature().toShortString() + " cost " + cost + "ms");
        }
    }
}
