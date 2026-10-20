package com.example.stage5.common.dto;

import java.math.BigDecimal;

public record ProductDTO(Long id, String name, BigDecimal price, Integer stock) {
}
