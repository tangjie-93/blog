import { http } from './http/request';
import type {
    ArticleCreateRequest,
    ArticleQuery,
    ArticleUpdateRequest,
    ArticleVO,
    BlogOverviewVO,
    CommentCreateRequest,
    CommentVO,
    PageResult
} from '@/types';

export const articleApi = {
    getOverview(): Promise<BlogOverviewVO> {
        return http.get<BlogOverviewVO>('/api/articles/overview');
    },
    listArticles(query: ArticleQuery): Promise<PageResult<ArticleVO>> {
        return http.get<PageResult<ArticleVO>>('/api/articles', { params: query });
    },
    getArticle(id: string): Promise<ArticleVO> {
        return http.get<ArticleVO>(`/api/articles/${id}`);
    },
    createArticle(data: ArticleCreateRequest): Promise<ArticleVO> {
        return http.post<ArticleVO, ArticleCreateRequest>('/api/articles', data);
    },
    updateArticle(id: string, data: ArticleUpdateRequest): Promise<ArticleVO> {
        return http.put<ArticleVO, ArticleUpdateRequest>(`/api/articles/${id}`, data);
    },
    deleteArticle(id: string): Promise<void> {
        return http.delete<void>(`/api/articles/${id}`);
    },
    listComments(articleId: string): Promise<CommentVO[]> {
        return http.get<CommentVO[]>(`/api/articles/${articleId}/comments`);
    },
    createComment(articleId: string, data: CommentCreateRequest): Promise<CommentVO> {
        return http.post<CommentVO, CommentCreateRequest>(`/api/articles/${articleId}/comments`, data);
    }
};
