package com.example.stage5.order.client;

import com.example.stage5.common.ApiResult;
import com.example.stage5.common.dto.UserDTO;
import org.springframework.stereotype.Component;

@Component
public class UserClientFallback implements UserClient {

    @Override
    public ApiResult<UserDTO> getUser(Long id) {
        return ApiResult.fail("user service fallback, id=" + id);
    }
}
