<template>
    <section class="article-detail page-panel">
        <RouterLink class="article-detail__back" to="/articles">Back to articles</RouterLink>
        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

        <article v-if="article">
            <h2>{{ article.title }}</h2>
            <p class="article-detail__meta">
                {{ article.author.nickname || article.author.username }} · {{ article.viewCount }} views
            </p>
            <p>{{ article.content }}</p>
        </article>
        <p v-else>Loading...</p>

        <section class="article-detail__comments">
            <h3>Comments</h3>
            <form class="article-detail__comment-form" @submit.prevent="handleCreateComment">
                <textarea
                    v-model="commentContent"
                    class="field-input"
                    rows="3"
                    placeholder="Write a comment"
                ></textarea>
                <button class="primary-button" type="submit" :disabled="isSubmittingComment">
                    Add Comment
                </button>
            </form>

            <div class="article-detail__comment-list">
                <article v-for="comment in comments" :key="comment.id" class="article-detail__comment">
                    <strong>{{ comment.user.nickname || comment.user.username }}</strong>
                    <p>{{ comment.content }}</p>
                </article>
                <p v-if="comments.length === 0">No comments yet.</p>
            </div>
        </section>
    </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { articleApi } from '@/service/article';
import { useAuthStore } from '@/store/modules/auth';
import type { ArticleVO, CommentVO } from '@/types';

defineOptions({ name: 'articleDetailPage' });

const route = useRoute();
const authStore = useAuthStore();
const article = ref<ArticleVO | null>(null);
const comments = ref<CommentVO[]>([]);
const commentContent = ref('');
const errorMessage = ref('');
const isSubmittingComment = ref(false);

async function loadArticle(): Promise<void> {
    try {
        const articleId = String(route.params.id);
        article.value = await articleApi.getArticle(articleId);
        comments.value = await articleApi.listComments(articleId);
    } catch (error) {
        errorMessage.value = error instanceof Error ? error.message : 'Article load failed';
    }
}

async function handleCreateComment(): Promise<void> {
    const content = commentContent.value.trim();
    if (!content || !authStore.currentUser) {
        return;
    }

    isSubmittingComment.value = true;
    try {
        const articleId = String(route.params.id);
        await articleApi.createComment(articleId, {
            userId: authStore.currentUser.id,
            content
        });
        commentContent.value = '';
        comments.value = await articleApi.listComments(articleId);
    } finally {
        isSubmittingComment.value = false;
    }
}

onMounted(() => {
    void loadArticle();
});
</script>

<style scoped lang="less">
.article-detail {
    &__back {
        display: inline-block;
        margin-bottom: 16px;
        color: #2563eb;
    }

    &__meta {
        color: #6b7280;
    }

    &__comments {
        margin-top: 28px;
        padding-top: 20px;
        border-top: 1px solid #e5e7eb;
    }

    &__comment-form {
        display: grid;
        gap: 10px;
        margin-bottom: 16px;
    }

    &__comment-list {
        display: grid;
        gap: 10px;
    }

    &__comment {
        padding: 12px;
        border: 1px solid #e5e7eb;
        border-radius: 6px;

        p {
            margin: 6px 0 0;
        }
    }
}
</style>
