import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

import { articleApi } from '@/service/article';
import type { ArticleQuery, ArticleVO, BlogOverviewVO, PageResult } from '@/types';

const DEFAULT_PAGE_SIZE = 8;

export const useBlogStore = defineStore('blog', () => {
    const overview = ref<BlogOverviewVO | null>(null);
    const articlePage = ref<PageResult<ArticleVO>>({
        list: [],
        total: 0,
        page: 1,
        size: DEFAULT_PAGE_SIZE,
        totalPages: 0
    });
    const query = ref<ArticleQuery>({
        page: 1,
        size: DEFAULT_PAGE_SIZE
    });
    const isLoading = ref(false);
    const errorMessage = ref('');

    const hasArticles = computed(() => articlePage.value.list.length > 0);

    async function fetchOverview(): Promise<void> {
        overview.value = await articleApi.getOverview();
    }

    async function fetchArticles(nextQuery?: Partial<ArticleQuery>): Promise<void> {
        query.value = {
            ...query.value,
            ...nextQuery
        };
        isLoading.value = true;
        errorMessage.value = '';

        try {
            articlePage.value = await articleApi.listArticles(query.value);
        } catch (error) {
            errorMessage.value = error instanceof Error ? error.message : '文章列表加载失败';
            throw error;
        } finally {
            isLoading.value = false;
        }
    }

    async function refreshAll(): Promise<void> {
        await Promise.all([fetchOverview(), fetchArticles()]);
    }

    return {
        overview,
        articlePage,
        query,
        isLoading,
        errorMessage,
        hasArticles,
        fetchOverview,
        fetchArticles,
        refreshAll
    };
});
