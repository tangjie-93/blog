package com.example.stage4.service;

import com.example.stage4.common.PageResult;
import com.example.stage4.dto.ArticleCreateRequest;
import com.example.stage4.dto.ArticleUpdateRequest;
import com.example.stage4.dto.CommentCreateRequest;
import com.example.stage4.vo.ArticleVO;
import com.example.stage4.vo.BlogOverviewVO;
import com.example.stage4.vo.CommentVO;

import java.util.List;

public interface ArticleService {

    PageResult<ArticleVO> listArticles(int page, int size, String category, String tag);

    ArticleVO getArticle(Long id);

    ArticleVO createArticle(ArticleCreateRequest request);

    ArticleVO updateArticle(Long id, ArticleUpdateRequest request);

    void deleteArticle(Long id);

    CommentVO createComment(Long articleId, CommentCreateRequest request);

    List<CommentVO> listComments(Long articleId);

    BlogOverviewVO getOverview();
}
