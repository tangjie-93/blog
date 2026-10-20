package com.example.stage4.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;

import java.util.List;

@Schema(description = "更新文章请求")
public class ArticleUpdateRequest {

    @Schema(description = "标题", example = "Spring Boot 入门")
    @Size(max = 100, message = "标题最多 100 个字符")
    private String title;

    @Schema(description = "正文", example = "这是一篇入门文章。")
    private String content;

    @Schema(description = "分类", example = "Java")
    @Size(max = 30, message = "分类最多 30 个字符")
    private String category;

    @Schema(description = "标签", example = "[\"Spring Boot\", \"后端\"]")
    private List<String> tags;

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
        this.tags = tags;
    }
}
