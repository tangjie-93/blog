<template>
    <section class="articles-page page-panel">
        <div class="articles-page__header">
            <div>
                <h2>Articles</h2>
                <p v-if="blogStore.overview" class="articles-page__summary">
                    {{ blogStore.overview.articleCount }} articles, {{ blogStore.overview.commentCount }} comments
                </p>
            </div>
            <div class="articles-page__actions">
                <button class="secondary-button" type="button" @click="refresh">Refresh</button>
                <RouterLink class="primary-button" to="/editor">New Article</RouterLink>
            </div>
        </div>

        <p v-if="blogStore.errorMessage" class="error-text">{{ blogStore.errorMessage }}</p>
        <p v-if="blogStore.isLoading">Loading...</p>

        <div v-else class="articles-page__list">
            <article
                v-for="article in blogStore.articlePage.list"
                :key="article.id"
                class="articles-page__item"
            >
                <div class="articles-page__item-header">
                    <h3>{{ article.title }}</h3>
                    <div class="articles-page__item-actions">
                        <RouterLink class="secondary-button" :to="`/articles/${article.id}`">View</RouterLink>
                        <RouterLink class="secondary-button" :to="`/editor/${article.id}`">Edit</RouterLink>
                        <button class="secondary-button" type="button" @click="handleDelete(article.id)">
                            Delete
                        </button>
                    </div>
                </div>
                <p>{{ article.summary || article.content }}</p>
                <span>{{ article.category || 'Uncategorized' }} · {{ article.viewCount }} views</span>
            </article>

            <p v-if="!blogStore.hasArticles" class="articles-page__empty">No articles yet.</p>
        </div>
    </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

import { articleApi } from '@/service/article';
import { useBlogStore } from '@/store/modules/blog';

defineOptions({ name: 'articlesPage' });

const blogStore = useBlogStore();

async function refresh(): Promise<void> {
    await blogStore.refreshAll();
}

async function handleDelete(id: string): Promise<void> {
    const confirmed = window.confirm('Delete this article?');
    if (!confirmed) {
        return;
    }
    await articleApi.deleteArticle(id);
    await refresh();
}

onMounted(() => {
    void refresh();
});
</script>

<style scoped lang="less">
.articles-page {
    &__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;

        h2 {
            margin: 0;
        }
    }

    &__summary {
        margin: 6px 0 0;
        color: #6b7280;
        font-size: 13px;
    }

    &__actions,
    &__item-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }

    &__list {
        display: grid;
        gap: 12px;
        margin-top: 16px;
    }

    &__item {
        display: grid;
        gap: 8px;
        padding: 16px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;

        &-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 12px;
        }

        h3,
        p {
            margin: 0;
        }

        span {
            color: #6b7280;
            font-size: 13px;
        }
    }

    &__empty {
        margin: 0;
        color: #6b7280;
    }
}
</style>
