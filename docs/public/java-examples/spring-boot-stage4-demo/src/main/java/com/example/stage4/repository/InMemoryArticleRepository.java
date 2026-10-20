package com.example.stage4.repository;

import com.example.stage4.entity.Article;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Repository
@Profile("memory")
public class InMemoryArticleRepository implements ArticleRepository {

    private final Map<Long, Article> articles = new ConcurrentHashMap<>();
    private final AtomicLong idGenerator = new AtomicLong(0);

    @PostConstruct
    public void initData() {
        Article article = new Article();
        article.setTitle("Spring Boot 第一篇文章");
        article.setContent("这个项目演示 Controller、Service、Repository 三层如何配合。");
        article.setCategory("Java");
        article.setTags(List.of("Spring Boot", "入门"));
        article.setAuthorId(1L);
        save(article);
    }

    @Override
    public List<Article> findAll() {
        return articles.values()
                .stream()
                .sorted(Comparator.comparing(Article::getId).reversed())
                .map(this::copy)
                .toList();
    }

    @Override
    public Optional<Article> findById(Long id) {
        return Optional.ofNullable(articles.get(id)).map(this::copy);
    }

    @Override
    public Article save(Article article) {
        LocalDateTime now = LocalDateTime.now();
        if (article.getId() == null) {
            article.setId(idGenerator.incrementAndGet());
            article.setCreatedAt(now);
        }
        article.setUpdatedAt(now);
        articles.put(article.getId(), copy(article));
        return copy(article);
    }

    @Override
    public void deleteById(Long id) {
        articles.remove(id);
    }

    private Article copy(Article source) {
        Article target = new Article();
        target.setId(source.getId());
        target.setTitle(source.getTitle());
        target.setContent(source.getContent());
        target.setCategory(source.getCategory());
        target.setTags(List.copyOf(source.getTags()));
        target.setAuthorId(source.getAuthorId());
        target.setViewCount(source.getViewCount());
        target.setCreatedAt(source.getCreatedAt());
        target.setUpdatedAt(source.getUpdatedAt());
        return target;
    }
}
