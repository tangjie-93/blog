package com.example.stage5.order.service;

import com.example.stage5.common.ApiResult;
import com.example.stage5.common.dto.OrderCreateRequest;
import com.example.stage5.common.dto.OrderVO;
import com.example.stage5.common.dto.ProductDTO;
import com.example.stage5.common.dto.UserDTO;
import com.example.stage5.order.client.ProductClient;
import com.example.stage5.order.client.UserClient;
import com.example.stage5.order.config.RabbitConfig;
import com.example.stage5.order.model.Order;
import io.seata.spring.annotation.GlobalTransactional;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class OrderService {

    private final AtomicLong idGenerator = new AtomicLong(1000);
    private final Map<Long, Order> orders = new LinkedHashMap<>();
    private final UserClient userClient;
    private final ProductClient productClient;
    private final RabbitTemplate rabbitTemplate;
    private final boolean rabbitEnabled;

    public OrderService(UserClient userClient,
                        ProductClient productClient,
                        RabbitTemplate rabbitTemplate,
                        @Value("${demo.rabbitmq.enabled:false}") boolean rabbitEnabled) {
        this.userClient = userClient;
        this.productClient = productClient;
        this.rabbitTemplate = rabbitTemplate;
        this.rabbitEnabled = rabbitEnabled;
    }

    public List<OrderVO> listOrders() {
        return orders.values().stream().map(this::toVO).toList();
    }

    @GlobalTransactional(name = "stage5-create-order", rollbackFor = Exception.class)
    public OrderVO createOrder(OrderCreateRequest request) {
        validateRequest(request);

        UserDTO user = unwrap(userClient.getUser(request.userId()), "query user failed");
        ProductDTO product = unwrap(productClient.getProduct(request.productId()), "query product failed");
        unwrap(productClient.deductStock(product.id(), request.quantity()), "deduct stock failed");

        Order order = new Order();
        order.setId(idGenerator.incrementAndGet());
        order.setUserId(user.id());
        order.setUsername(user.username());
        order.setProductId(product.id());
        order.setProductName(product.name());
        order.setQuantity(request.quantity());
        order.setAmount(product.price().multiply(java.math.BigDecimal.valueOf(request.quantity())));
        order.setStatus("CREATED");
        order.setCreatedAt(LocalDateTime.now());
        orders.put(order.getId(), order);

        sendOrderCreatedEvent(order);
        return toVO(order);
    }

    private void validateRequest(OrderCreateRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("request body is required");
        }
        if (request.userId() == null || request.productId() == null) {
            throw new IllegalArgumentException("userId and productId are required");
        }
        if (request.quantity() == null || request.quantity() <= 0) {
            throw new IllegalArgumentException("quantity must be greater than 0");
        }
    }

    private <T> T unwrap(ApiResult<T> result, String defaultMessage) {
        if (result == null || result.code() != 0 || result.data() == null) {
            String message = result == null ? defaultMessage : result.message();
            throw new IllegalStateException(message);
        }
        return result.data();
    }

    private void sendOrderCreatedEvent(Order order) {
        if (!rabbitEnabled) {
            return;
        }
        rabbitTemplate.convertAndSend(
                RabbitConfig.ORDER_EXCHANGE,
                RabbitConfig.ORDER_CREATED_ROUTING_KEY,
                toVO(order)
        );
    }

    private OrderVO toVO(Order order) {
        return new OrderVO(
                order.getId(),
                order.getUserId(),
                order.getUsername(),
                order.getProductId(),
                order.getProductName(),
                order.getQuantity(),
                order.getAmount(),
                order.getStatus(),
                order.getCreatedAt()
        );
    }
}
