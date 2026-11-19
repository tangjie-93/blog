package com.example.stage4.controller;

import com.example.stage4.common.PageResult;
import com.example.stage4.common.Result;
import com.example.stage4.dto.ArticleCreateRequest;
import com.example.stage4.dto.ArticleUpdateRequest;
import com.example.stage4.dto.CommentCreateRequest;
import com.example.stage4.service.ArticleService;
import com.example.stage4.vo.ArticleVO;
import com.example.stage4.vo.BlogOverviewVO;
import com.example.stage4.vo.CommentVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "文章与评论")
@Validated
@RestController
@RequestMapping("/api/articles")
public class ArticleController {

    private final ArticleService articleService;

    public ArticleController(ArticleService articleService) {
        this.articleService = articleService;
    }

    @Operation(summary = "文章分页列表", description = "支持按分类和标签过滤")
    @GetMapping
    public Result<PageResult<ArticleVO>> listArticles(
            @RequestParam(defaultValue = "1") @Min(value = 1, message = "页码最小是 1") int page,
            @RequestParam(defaultValue = "10") @Min(value = 1, message = "每页最少 1 条") @Max(value = 50, message = "每页最多 50 条") int size,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String tag) {
        return Result.success(articleService.listArticles(page, size, category, tag));
    }

    @Operation(summary = "博客概览", description = "返回用户数、文章数、评论数、分类和标签")
    @GetMapping("/overview")
    public Result<BlogOverviewVO> getOverview() {
        return Result.success(articleService.getOverview());
    }

    @Operation(summary = "文章详情")
    @GetMapping("/{id}")
    public Result<ArticleVO> getArticle(@PathVariable Long id) {
        return Result.success(articleService.getArticle(id));
    }

    @Operation(summary = "创建文章")
    @PostMapping
    public Result<ArticleVO> createArticle(@Valid @RequestBody ArticleCreateRequest request) {
        return Result.success("文章创建成功", articleService.createArticle(request));
    }

    @Operation(summary = "更新文章")
    @PutMapping("/{id}")
    public Result<ArticleVO> updateArticle(@PathVariable Long id,
                                           @Valid @RequestBody ArticleUpdateRequest request) {
        return Result.success("文章更新成功", articleService.updateArticle(id, request));
    }

    @Operation(summary = "删除文章")
    @DeleteMapping("/{id}")
    public Result<Void> deleteArticle(@PathVariable Long id) {
        articleService.deleteArticle(id);
        return Result.success("文章删除成功", null);
    }

    @Operation(summary = "评论列表")
    @GetMapping("/{articleId}/comments")
    public Result<List<CommentVO>> listComments(@PathVariable Long articleId) {
        return Result.success(articleService.listComments(articleId));
    }

    @Operation(summary = "创建评论")
    @PostMapping("/{articleId}/comments")
    public Result<CommentVO> createComment(@PathVariable Long articleId,
                                           @Valid @RequestBody CommentCreateRequest request) {
        return Result.success("评论创建成功", articleService.createComment(articleId, request));
    }
}
