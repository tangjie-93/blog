package com.example.stage5.order.client;

import com.example.stage5.common.ApiResult;
import com.example.stage5.common.dto.ProductDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "service-product", url = "${demo.clients.product-url:}", fallback = ProductClientFallback.class)
public interface ProductClient {

    @GetMapping("/api/products/{id}")
    ApiResult<ProductDTO> getProduct(@PathVariable("id") Long id);

    @PostMapping("/api/products/{id}/deduct")
    ApiResult<ProductDTO> deductStock(@PathVariable("id") Long id, @RequestParam("quantity") Integer quantity);
}
