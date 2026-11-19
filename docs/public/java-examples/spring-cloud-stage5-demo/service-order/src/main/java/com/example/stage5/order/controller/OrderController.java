package com.example.stage5.order.controller;

import com.alibaba.csp.sentinel.annotation.SentinelResource;
import com.alibaba.csp.sentinel.slots.block.BlockException;
import com.example.stage5.common.ApiResult;
import com.example.stage5.common.dto.OrderCreateRequest;
import com.example.stage5.common.dto.OrderVO;
import com.example.stage5.order.service.OrderService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ApiResult<List<OrderVO>> listOrders() {
        return ApiResult.ok(orderService.listOrders());
    }

    @PostMapping
    @SentinelResource(value = "createOrder", blockHandler = "handleCreateOrderBlock")
    public ApiResult<OrderVO> createOrder(@RequestBody OrderCreateRequest request) {
        try {
            return ApiResult.ok(orderService.createOrder(request));
        } catch (RuntimeException exception) {
            return ApiResult.fail(exception.getMessage());
        }
    }

    public ApiResult<OrderVO> handleCreateOrderBlock(OrderCreateRequest request, BlockException exception) {
        return ApiResult.fail("order creation is limited");
    }
}
