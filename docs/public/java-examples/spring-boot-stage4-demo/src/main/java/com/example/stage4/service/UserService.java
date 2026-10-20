package com.example.stage4.service;

import com.example.stage4.dto.LoginRequest;
import com.example.stage4.dto.UserCreateRequest;
import com.example.stage4.dto.UserUpdateRequest;
import com.example.stage4.vo.UserVO;

import java.util.List;

public interface UserService {

    List<UserVO> listUsers();

    UserVO getUser(Long id);

    UserVO register(UserCreateRequest request);

    UserVO updateUser(Long id, UserUpdateRequest request);

    void deleteUser(Long id);

    String login(LoginRequest request);
}
