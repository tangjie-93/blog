package com.example.stage3;

import com.example.stage3.dao.InMemoryUserDao;
import com.example.stage3.dto.LoginRequest;
import com.example.stage3.dto.UserRequest;
import com.example.stage3.exception.BusinessException;
import com.example.stage3.model.User;
import com.example.stage3.service.impl.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class UserServiceImplTest {
    private UserServiceImpl userService;

    @BeforeEach
    void setUp() {
        InMemoryUserDao userDao = new InMemoryUserDao();
        userDao.initData();
        userService = new UserServiceImpl(userDao);
    }

    @Test
    void createsAndFindsUser() {
        UserRequest request = new UserRequest();
        request.setUsername("alice");
        request.setPassword("alice123");
        request.setEmail("alice@example.com");
        request.setAge(26);

        User created = userService.create(request);

        assertEquals("alice", userService.findById(created.getId()).getUsername());
    }

    @Test
    void rejectsInvalidLogin() {
        LoginRequest request = new LoginRequest();
        request.setUsername("admin");
        request.setPassword("wrong");

        assertThrows(BusinessException.class, () -> userService.login(request));
    }
}
