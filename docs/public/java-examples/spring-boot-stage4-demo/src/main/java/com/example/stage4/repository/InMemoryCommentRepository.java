package com.example.stage4.repository;

import com.example.stage4.entity.Comment;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Repository
@Profile("memory")
public class InMemoryCommentRepository implements CommentRepository {

    private final Map<Long, Comment> comments = new ConcurrentHashMap<>();
    private final AtomicLong idGenerator = new AtomicLong(0);

    @Override
    public List<Comment> findByArticleId(Long articleId) {
        return comments.values()
                .stream()
                .filter(comment -> comment.getArticleId().equals(articleId))
                .sorted(Comparator.comparing(Comment::getId))
                .map(this::copy)
                .toList();
    }

    @Override
    public Comment save(Comment comment) {
        comment.setId(idGenerator.incrementAndGet());
        comment.setCreatedAt(LocalDateTime.now());
        comments.put(comment.getId(), copy(comment));
        return copy(comment);
    }

    @Override
    public long count() {
        return comments.size();
    }

    @Override
    public void deleteByArticleId(Long articleId) {
        comments.values().removeIf(comment -> comment.getArticleId().equals(articleId));
    }

    private Comment copy(Comment source) {
        Comment target = new Comment();
        target.setId(source.getId());
        target.setArticleId(source.getArticleId());
        target.setUserId(source.getUserId());
        target.setContent(source.getContent());
        target.setCreatedAt(source.getCreatedAt());
        return target;
    }
}
