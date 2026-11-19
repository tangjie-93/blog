import type { UserVO } from './user';

export interface ArticleVO {
    id: string;
    title: string;
    content: string;
    summary?: string;
    category?: string;
    tags: string[];
    author: UserVO;
    viewCount: number;
    createdAt: string;
}

export interface CommentVO {
    id: string;
    articleId: string;
    user: UserVO;
    content: string;
    createdAt: string;
}

export interface BlogOverviewVO {
    userCount: number;
    articleCount: number;
    commentCount: number;
    categories: string[];
    tags: string[];
}

export interface ArticleQuery {
    page: number;
    size: number;
    category?: string;
    tag?: string;
}

export interface ArticleCreateRequest {
    title: string;
    content: string;
    category?: string;
    tags: string[];
    authorId: string;
}

export interface ArticleUpdateRequest {
    title?: string;
    content?: string;
    category?: string;
    tags?: string[];
}

export interface CommentCreateRequest {
    userId: string;
    content: string;
}
