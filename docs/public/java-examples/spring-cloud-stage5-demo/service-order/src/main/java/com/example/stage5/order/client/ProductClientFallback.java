package com.example.stage5.order.client;

import com.example.stage5.common.ApiResult;
import com.example.stage5.common.dto.ProductDTO;
import org.springframework.stereotype.Component;

@Component
public class ProductClientFallback implements ProductClient {

    @Override
    public ApiResult<ProductDTO> getProduct(Long id) {
        return ApiResult.fail("product service fallback, id=" + id);
    }

    @Override
    public ApiResult<ProductDTO> deductStock(Long id, Integer quantity) {
        return ApiResult.fail("product stock fallback, id=" + id);
    }
}
