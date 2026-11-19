package com.example.stage5.common.dto;

public record OrderCreateRequest(Long userId, Long productId, Integer quantity) {
}
