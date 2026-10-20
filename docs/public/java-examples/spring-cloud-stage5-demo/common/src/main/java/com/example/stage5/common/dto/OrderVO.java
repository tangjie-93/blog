package com.example.stage5.common.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record OrderVO(
        Long id,
        Long userId,
        String username,
        Long productId,
        String productName,
        Integer quantity,
        BigDecimal amount,
        String status,
        LocalDateTime createdAt
) {
}
