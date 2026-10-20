package com.example.stage4.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Schema(description = "创建评论请求")
public class CommentCreateRequest {

    @Schema(description = "用户 ID", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "用户 ID 不能为空")
    private Long userId;

    @Schema(description = "评论内容", example = "写得很清楚", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "评论内容不能为空")
    @Size(max = 500, message = "评论内容最多 500 个字符")
    private String content;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
