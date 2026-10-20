package com.example.stage5.order.config;

import com.example.stage5.common.dto.OrderVO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "demo.rabbitmq.enabled", havingValue = "true")
public class OrderMessageListener {

    private static final Logger log = LoggerFactory.getLogger(OrderMessageListener.class);

    @RabbitListener(queues = RabbitConfig.ORDER_CREATED_QUEUE)
    public void handleOrderCreated(OrderVO order) {
        log.info("received order created event: {}", order);
    }
}
