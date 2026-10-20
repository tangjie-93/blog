package learn.persistence.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class Order {
    private Long id;
    private String orderNo;
    private Long userId;
    private BigDecimal amount;
    private Integer status;
    private LocalDateTime createdAt;

    public Order(Long id, String orderNo, Long userId, BigDecimal amount, Integer status) {
        this.id = id;
        this.orderNo = orderNo;
        this.userId = userId;
        this.amount = amount;
        this.status = status;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getOrderNo() {
        return orderNo;
    }

    public Long getUserId() {
        return userId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public Integer getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    @Override
    public String toString() {
        return "Order{" +
                "id=" + id +
                ", orderNo='" + orderNo + '\'' +
                ", userId=" + userId +
                ", amount=" + amount +
                ", status=" + status +
                '}';
    }
}
