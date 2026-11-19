package com.example.stage4.repository;

import com.example.stage4.entity.User;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
@Profile("!memory")
public class JdbcUserRepository implements UserRepository {

    private final JdbcTemplate jdbcTemplate;

    private final RowMapper<User> userRowMapper = (rs, rowNum) -> {
        User user = new User();
        user.setId(rs.getLong("id"));
        user.setUsername(rs.getString("username"));
        user.setPassword(rs.getString("password"));
        user.setNickname(rs.getString("nickname"));
        user.setEmail(rs.getString("email"));
        user.setCreatedAt(rs.getObject("created_at", LocalDateTime.class));
        user.setUpdatedAt(rs.getObject("updated_at", LocalDateTime.class));
        return user;
    };

    public JdbcUserRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<User> findAll() {
        return jdbcTemplate.query("""
                SELECT id, username, password, nickname, email, created_at, updated_at
                FROM sys_user
                ORDER BY id
                """, userRowMapper);
    }

    @Override
    public Optional<User> findById(Long id) {
        List<User> users = jdbcTemplate.query("""
                SELECT id, username, password, nickname, email, created_at, updated_at
                FROM sys_user
                WHERE id = ?
                """, userRowMapper, id);
        return users.stream().findFirst();
    }

    @Override
    public Optional<User> findByUsername(String username) {
        List<User> users = jdbcTemplate.query("""
                SELECT id, username, password, nickname, email, created_at, updated_at
                FROM sys_user
                WHERE username = ?
                """, userRowMapper, username);
        return users.stream().findFirst();
    }

    @Override
    public User save(User user) {
        if (user.getId() == null) {
            return insert(user);
        }
        update(user);
        return findById(user.getId()).orElseThrow();
    }

    @Override
    public void deleteById(Long id) {
        jdbcTemplate.update("DELETE FROM sys_user WHERE id = ?", id);
    }

    private User insert(User user) {
        LocalDateTime now = LocalDateTime.now();
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement statement = connection.prepareStatement("""
                    INSERT INTO sys_user (username, password, nickname, email, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """, Statement.RETURN_GENERATED_KEYS);
            statement.setString(1, user.getUsername());
            statement.setString(2, user.getPassword());
            statement.setString(3, user.getNickname());
            statement.setString(4, user.getEmail());
            statement.setObject(5, now);
            statement.setObject(6, now);
            return statement;
        }, keyHolder);

        Number key = keyHolder.getKey();
        if (key == null) {
            throw new IllegalStateException("新增用户后没有返回主键");
        }
        return findById(key.longValue()).orElseThrow();
    }

    private void update(User user) {
        jdbcTemplate.update("""
                UPDATE sys_user
                SET password = ?, nickname = ?, email = ?, updated_at = ?
                WHERE id = ?
                """,
                user.getPassword(),
                user.getNickname(),
                user.getEmail(),
                LocalDateTime.now(),
                user.getId());
    }
}
