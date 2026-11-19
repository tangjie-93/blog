package com.example.stage4.repository;

import com.example.stage4.entity.Comment;
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

@Repository
@Profile("!memory")
public class JdbcCommentRepository implements CommentRepository {

    private final JdbcTemplate jdbcTemplate;

    private final RowMapper<Comment> commentRowMapper = (rs, rowNum) -> {
        Comment comment = new Comment();
        comment.setId(rs.getLong("id"));
        comment.setArticleId(rs.getLong("article_id"));
        comment.setUserId(rs.getLong("user_id"));
        comment.setContent(rs.getString("content"));
        comment.setCreatedAt(rs.getObject("created_at", LocalDateTime.class));
        return comment;
    };

    public JdbcCommentRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<Comment> findByArticleId(Long articleId) {
        return jdbcTemplate.query("""
                SELECT id, article_id, user_id, content, created_at
                FROM comment
                WHERE article_id = ?
                ORDER BY id
                """, commentRowMapper, articleId);
    }

    @Override
    public Comment save(Comment comment) {
        LocalDateTime now = LocalDateTime.now();
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement statement = connection.prepareStatement("""
                    INSERT INTO comment (article_id, user_id, content, created_at)
                    VALUES (?, ?, ?, ?)
                    """, Statement.RETURN_GENERATED_KEYS);
            statement.setLong(1, comment.getArticleId());
            statement.setLong(2, comment.getUserId());
            statement.setString(3, comment.getContent());
            statement.setObject(4, now);
            return statement;
        }, keyHolder);

        Number key = keyHolder.getKey();
        if (key == null) {
            throw new IllegalStateException("新增评论后没有返回主键");
        }
        return findById(key.longValue());
    }

    @Override
    public long count() {
        Long count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM comment", Long.class);
        return count == null ? 0 : count;
    }

    @Override
    public void deleteByArticleId(Long articleId) {
        jdbcTemplate.update("DELETE FROM comment WHERE article_id = ?", articleId);
    }

    private Comment findById(Long id) {
        return jdbcTemplate.query("""
                SELECT id, article_id, user_id, content, created_at
                FROM comment
                WHERE id = ?
                """, commentRowMapper, id).stream().findFirst().orElseThrow();
    }
}
