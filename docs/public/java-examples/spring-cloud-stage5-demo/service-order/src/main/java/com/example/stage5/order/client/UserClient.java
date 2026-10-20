package com.example.stage5.order.client;

import com.example.stage5.common.ApiResult;
import com.example.stage5.common.dto.UserDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "service-user", url = "${demo.clients.user-url:}", fallback = UserClientFallback.class)
public interface UserClient {

    @GetMapping("/api/users/{id}")
    ApiResult<UserDTO> getUser(@PathVariable("id") Long id);
}
