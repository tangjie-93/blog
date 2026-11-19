package com.example.stage4.service.impl;

import com.example.stage4.dto.LoginRequest;
import com.example.stage4.dto.UserCreateRequest;
import com.example.stage4.dto.UserUpdateRequest;
import com.example.stage4.entity.User;
import com.example.stage4.exception.BusinessException;
import com.example.stage4.repository.UserRepository;
import com.example.stage4.service.UserService;
import com.example.stage4.vo.UserVO;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 用户业务实现。
 *
 * Service 只负责业务规则，不关心 HTTP，也不关心数据具体存在哪里。
 */
@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public List<UserVO> listUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toUserVO)
                .toList();
    }

    @Override
    public UserVO getUser(Long id) {
        User user = findUserOrThrow(id);
        return toUserVO(user);
    }

    @Override
    public UserVO register(UserCreateRequest request) {
        userRepository.findByUsername(request.getUsername())
                .ifPresent(user -> {
                    throw new BusinessException(400, "用户名已存在");
                });

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(request.getPassword());
        user.setNickname(request.getNickname());
        user.setEmail(request.getEmail());
        return toUserVO(userRepository.save(user));
    }

    @Override
    public UserVO updateUser(Long id, UserUpdateRequest request) {
        User user = findUserOrThrow(id);

        if (StringUtils.hasText(request.getPassword())) {
            user.setPassword(request.getPassword());
        }
        if (request.getNickname() != null) {
            user.setNickname(request.getNickname());
        }
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }

        return toUserVO(userRepository.save(user));
    }

    @Override
    public void deleteUser(Long id) {
        findUserOrThrow(id);
        if (id == 1L) {
            throw new BusinessException(400, "内置管理员用户不能删除");
        }
        userRepository.deleteById(id);
    }

    @Override
    public String login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BusinessException(401, "用户名或密码错误"));

        if (!user.getPassword().equals(request.getPassword())) {
            throw new BusinessException(401, "用户名或密码错误");
        }

        // 真实项目会生成 JWT。这里返回简单 token，重点演示登录流程。
        return "demo-token-user-" + user.getId();
    }

    public User findUserOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "用户不存在"));
    }

    public UserVO toUserVO(User user) {
        UserVO vo = new UserVO();
        vo.setId(user.getId());
        vo.setUsername(user.getUsername());
        vo.setNickname(user.getNickname());
        vo.setEmail(user.getEmail());
        vo.setCreatedAt(user.getCreatedAt());
        return vo;
    }
}
