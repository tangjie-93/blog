package com.example.stage4.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.ArrayList;
import java.util.List;

@Schema(description = "创建文章请求")
public class ArticleCreateRequest {

    @Schema(description = "标题", example = "Spring Boot 入门", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "标题不能为空")
    @Size(max = 100, message = "标题最多 100 个字符")
    private String title;

    @Schema(description = "正文", example = "这是一篇入门文章。", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "正文不能为空")
    private String content;

    @Schema(description = "分类", example = "Java")
    @Size(max = 30, message = "分类最多 30 个字符")
    private String category;

    @Schema(description = "标签", example = "[\"Spring Boot\", \"后端\"]")
    private List<String> tags = new ArrayList<>();

    @Schema(description = "作者 ID", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "作者 ID 不能为空")
    private Long authorId;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags == null ? new ArrayList<>() : tags;
    }

    public Long getAuthorId() {
        return authorId;
    }

    public void setAuthorId(Long authorId) {
        this.authorId = authorId;
    }
}
