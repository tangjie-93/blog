package com.example.stage4.repository;

import com.example.stage4.entity.Article;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
@Profile("!memory")
public class JdbcArticleRepository implements ArticleRepository {

    private final JdbcTemplate jdbcTemplate;

    private final RowMapper<Article> articleRowMapper = (rs, rowNum) -> {
        Article article = new Article();
        article.setId(rs.getLong("id"));
        article.setTitle(rs.getString("title"));
        article.setContent(rs.getString("content"));
        article.setCategory(rs.getString("category"));
        article.setTags(parseTags(rs.getString("tags")));
        article.setAuthorId(rs.getLong("user_id"));
        article.setViewCount(rs.getInt("view_count"));
        article.setCreatedAt(rs.getObject("created_at", LocalDateTime.class));
        article.setUpdatedAt(rs.getObject("updated_at", LocalDateTime.class));
        return article;
    };

    public JdbcArticleRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<Article> findAll() {
        return jdbcTemplate.query("""
                SELECT id, title, content, category, tags, user_id, view_count, created_at, updated_at
                FROM article
                ORDER BY id DESC
                """, articleRowMapper);
    }

    @Override
    public Optional<Article> findById(Long id) {
        List<Article> articles = jdbcTemplate.query("""
                SELECT id, title, content, category, tags, user_id, view_count, created_at, updated_at
                FROM article
                WHERE id = ?
                """, articleRowMapper, id);
        return articles.stream().findFirst();
    }

    @Override
    public Article save(Article article) {
        if (article.getId() == null) {
            return insert(article);
        }
        update(article);
        return findById(article.getId()).orElseThrow();
    }

    @Override
    public void deleteById(Long id) {
        jdbcTemplate.update("DELETE FROM article WHERE id = ?", id);
    }

    private Article insert(Article article) {
        LocalDateTime now = LocalDateTime.now();
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement statement = connection.prepareStatement("""
                    INSERT INTO article (title, content, category, tags, user_id, view_count, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """, Statement.RETURN_GENERATED_KEYS);
            statement.setString(1, article.getTitle());
            statement.setString(2, article.getContent());
            statement.setString(3, article.getCategory());
            statement.setString(4, formatTags(article.getTags()));
            statement.setLong(5, article.getAuthorId());
            statement.setInt(6, article.getViewCount());
            statement.setObject(7, now);
            statement.setObject(8, now);
            return statement;
        }, keyHolder);

        Number key = keyHolder.getKey();
        if (key == null) {
            throw new IllegalStateException("新增文章后没有返回主键");
        }
        return findById(key.longValue()).orElseThrow();
    }

    private void update(Article article) {
        jdbcTemplate.update("""
                UPDATE article
                SET title = ?, content = ?, category = ?, tags = ?, user_id = ?, view_count = ?, updated_at = ?
                WHERE id = ?
                """,
                article.getTitle(),
                article.getContent(),
                article.getCategory(),
                formatTags(article.getTags()),
                article.getAuthorId(),
                article.getViewCount(),
                LocalDateTime.now(),
                article.getId());
    }

    private List<String> parseTags(String tags) {
        if (!StringUtils.hasText(tags)) {
            return List.of();
        }
        return Arrays.stream(tags.split(","))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .toList();
    }

    private String formatTags(List<String> tags) {
        if (tags == null || tags.isEmpty()) {
            return "";
        }
        return tags.stream()
                .filter(StringUtils::hasText)
                .collect(Collectors.joining(","));
    }
}
