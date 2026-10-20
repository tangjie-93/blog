package com.example.stage4.repository;

import com.example.stage4.entity.User;

import java.util.List;
import java.util.Optional;

public interface UserRepository {

    List<User> findAll();

    Optional<User> findById(Long id);

    Optional<User> findByUsername(String username);

    User save(User user);

    void deleteById(Long id);
}
