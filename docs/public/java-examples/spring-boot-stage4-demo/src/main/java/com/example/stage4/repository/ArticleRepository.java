package com.example.stage4.repository;

import com.example.stage4.entity.Article;

import java.util.List;
import java.util.Optional;

public interface ArticleRepository {

    List<Article> findAll();

    Optional<Article> findById(Long id);

    Article save(Article article);

    void deleteById(Long id);
}
