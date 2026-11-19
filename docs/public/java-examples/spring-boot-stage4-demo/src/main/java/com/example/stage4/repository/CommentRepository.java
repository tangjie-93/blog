package com.example.stage4.repository;

import com.example.stage4.entity.Comment;

import java.util.List;

public interface CommentRepository {

    List<Comment> findByArticleId(Long articleId);

    Comment save(Comment comment);

    long count();

    void deleteByArticleId(Long articleId);
}
