package com.example.stage4.service.impl;

import com.example.stage4.common.PageResult;
import com.example.stage4.dto.ArticleCreateRequest;
import com.example.stage4.dto.ArticleUpdateRequest;
import com.example.stage4.dto.CommentCreateRequest;
import com.example.stage4.entity.Article;
import com.example.stage4.entity.Comment;
import com.example.stage4.exception.BusinessException;
import com.example.stage4.repository.ArticleRepository;
import com.example.stage4.repository.CommentRepository;
import com.example.stage4.service.ArticleService;
import com.example.stage4.vo.ArticleVO;
import com.example.stage4.vo.BlogOverviewVO;
import com.example.stage4.vo.CommentVO;
import com.example.stage4.vo.UserVO;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Objects;

@Service
public class ArticleServiceImpl implements ArticleService {

    private final ArticleRepository articleRepository;
    private final CommentRepository commentRepository;
    private final UserServiceImpl userService;

    public ArticleServiceImpl(ArticleRepository articleRepository,
                              CommentRepository commentRepository,
                              UserServiceImpl userService) {
        this.articleRepository = articleRepository;
        this.commentRepository = commentRepository;
        this.userService = userService;
    }

    @Override
    public PageResult<ArticleVO> listArticles(int page, int size, String category, String tag) {
        List<ArticleVO> filtered = articleRepository.findAll()
                .stream()
                .filter(article -> !StringUtils.hasText(category) || category.equals(article.getCategory()))
                .filter(article -> !StringUtils.hasText(tag) || article.getTags().contains(tag))
                .map(this::toArticleVO)
                .toList();

        int fromIndex = Math.min((page - 1) * size, filtered.size());
        int toIndex = Math.min(fromIndex + size, filtered.size());
        return new PageResult<>(filtered.subList(fromIndex, toIndex), filtered.size(), page, size);
    }

    @Override
    public ArticleVO getArticle(Long id) {
        Article article = findArticleOrThrow(id);
        article.setViewCount(article.getViewCount() + 1);
        articleRepository.save(article);
        return toArticleVO(article);
    }

    @Override
    public ArticleVO createArticle(ArticleCreateRequest request) {
        userService.findUserOrThrow(request.getAuthorId());

        Article article = new Article();
        article.setTitle(request.getTitle());
        article.setContent(request.getContent());
        article.setCategory(request.getCategory());
        article.setTags(request.getTags());
        article.setAuthorId(request.getAuthorId());
        return toArticleVO(articleRepository.save(article));
    }

    @Override
    public ArticleVO updateArticle(Long id, ArticleUpdateRequest request) {
        Article article = findArticleOrThrow(id);

        if (StringUtils.hasText(request.getTitle())) {
            article.setTitle(request.getTitle());
        }
        if (StringUtils.hasText(request.getContent())) {
            article.setContent(request.getContent());
        }
        if (request.getCategory() != null) {
            article.setCategory(request.getCategory());
        }
        if (request.getTags() != null) {
            article.setTags(request.getTags());
        }

        return toArticleVO(articleRepository.save(article));
    }

    @Override
    public void deleteArticle(Long id) {
        findArticleOrThrow(id);
        articleRepository.deleteById(id);
        commentRepository.deleteByArticleId(id);
    }

    @Override
    public CommentVO createComment(Long articleId, CommentCreateRequest request) {
        findArticleOrThrow(articleId);
        userService.findUserOrThrow(request.getUserId());

        Comment comment = new Comment();
        comment.setArticleId(articleId);
        comment.setUserId(request.getUserId());
        comment.setContent(request.getContent());
        return toCommentVO(commentRepository.save(comment));
    }

    @Override
    public List<CommentVO> listComments(Long articleId) {
        findArticleOrThrow(articleId);
        return commentRepository.findByArticleId(articleId)
                .stream()
                .map(this::toCommentVO)
                .toList();
    }

    @Override
    public BlogOverviewVO getOverview() {
        List<Article> articles = articleRepository.findAll();

        BlogOverviewVO overview = new BlogOverviewVO();
        overview.setUserCount(userService.listUsers().size());
        overview.setArticleCount(articles.size());
        overview.setCommentCount(commentRepository.count());
        overview.setCategories(articles.stream()
                .map(Article::getCategory)
                .filter(StringUtils::hasText)
                .distinct()
                .sorted()
                .toList());
        overview.setTags(articles.stream()
                .flatMap(article -> article.getTags().stream())
                .filter(Objects::nonNull)
                .filter(StringUtils::hasText)
                .distinct()
                .sorted()
                .toList());
        return overview;
    }

    private Article findArticleOrThrow(Long id) {
        return articleRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "文章不存在"));
    }

    private ArticleVO toArticleVO(Article article) {
        UserVO author = userService.getUser(article.getAuthorId());

        ArticleVO vo = new ArticleVO();
        vo.setId(article.getId());
        vo.setTitle(article.getTitle());
        vo.setContent(article.getContent());
        vo.setSummary(buildSummary(article.getContent()));
        vo.setCategory(article.getCategory());
        vo.setTags(article.getTags());
        vo.setAuthor(author);
        vo.setViewCount(article.getViewCount());
        vo.setCreatedAt(article.getCreatedAt());
        return vo;
    }

    private CommentVO toCommentVO(Comment comment) {
        CommentVO vo = new CommentVO();
        vo.setId(comment.getId());
        vo.setArticleId(comment.getArticleId());
        vo.setUser(userService.getUser(comment.getUserId()));
        vo.setContent(comment.getContent());
        vo.setCreatedAt(comment.getCreatedAt());
        return vo;
    }

    private String buildSummary(String content) {
        if (content == null || content.length() <= 50) {
            return content;
        }
        return content.substring(0, 50) + "...";
    }
}
