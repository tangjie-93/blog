package com.example.stage4.vo;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.ArrayList;
import java.util.List;

@Schema(description = "博客概览信息")
public class BlogOverviewVO {

    private long userCount;
    private long articleCount;
    private long commentCount;
    private List<String> categories = new ArrayList<>();
    private List<String> tags = new ArrayList<>();

    public long getUserCount() {
        return userCount;
    }

    public void setUserCount(long userCount) {
        this.userCount = userCount;
    }

    public long getArticleCount() {
        return articleCount;
    }

    public void setArticleCount(long articleCount) {
        this.articleCount = articleCount;
    }

    public long getCommentCount() {
        return commentCount;
    }

    public void setCommentCount(long commentCount) {
        this.commentCount = commentCount;
    }

    public List<String> getCategories() {
        return categories;
    }

    public void setCategories(List<String> categories) {
        this.categories = categories == null ? new ArrayList<>() : categories;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags == null ? new ArrayList<>() : tags;
    }
}
