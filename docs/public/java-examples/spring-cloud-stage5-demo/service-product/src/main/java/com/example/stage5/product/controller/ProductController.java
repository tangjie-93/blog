package com.example.stage5.product.controller;

import com.alibaba.csp.sentinel.annotation.SentinelResource;
import com.alibaba.csp.sentinel.slots.block.BlockException;
import com.example.stage5.common.ApiResult;
import com.example.stage5.common.dto.ProductDTO;
import com.example.stage5.product.model.Product;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final Map<Long, Product> products = new LinkedHashMap<>();

    public ProductController() {
        products.put(1L, new Product(1L, "Java微服务课程", new BigDecimal("199.00"), 100));
        products.put(2L, new Product(2L, "Spring Cloud实战手册", new BigDecimal("89.00"), 60));
    }

    @GetMapping
    public ApiResult<List<ProductDTO>> listProducts() {
        return ApiResult.ok(products.values().stream().map(this::toDTO).toList());
    }

    @GetMapping("/{id}")
    @SentinelResource(value = "getProductById", blockHandler = "handleProductBlock")
    public ApiResult<ProductDTO> getProduct(@PathVariable Long id) {
        Product product = products.get(id);
        if (product == null) {
            return ApiResult.fail("product not found: " + id);
        }
        return ApiResult.ok(toDTO(product));
    }

    @PostMapping("/{id}/deduct")
    public ApiResult<ProductDTO> deductStock(@PathVariable Long id, @RequestParam Integer quantity) {
        Product product = products.get(id);
        if (product == null) {
            return ApiResult.fail("product not found: " + id);
        }
        if (quantity == null || quantity <= 0) {
            return ApiResult.fail("quantity must be greater than 0");
        }
        if (product.getStock() < quantity) {
            return ApiResult.fail("stock not enough, current=" + product.getStock());
        }
        product.setStock(product.getStock() - quantity);
        return ApiResult.ok(toDTO(product));
    }

    public ApiResult<ProductDTO> handleProductBlock(Long id, BlockException exception) {
        return ApiResult.fail("product service is limited, id=" + id);
    }

    private ProductDTO toDTO(Product product) {
        return new ProductDTO(product.getId(), product.getName(), product.getPrice(), product.getStock());
    }
}
