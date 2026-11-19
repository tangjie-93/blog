<template>
    <section class="article-editor page-panel">
        <div class="article-editor__header">
            <h2>{{ isEditMode ? 'Edit Article' : 'New Article' }}</h2>
            <RouterLink class="secondary-button" to="/articles">Back</RouterLink>
        </div>

        <form class="article-editor__form" @submit.prevent="handleSubmit">
            <label class="article-editor__field">
                <span>Title</span>
                <input v-model="form.title" class="field-input" />
            </label>

            <label class="article-editor__field">
                <span>Category</span>
                <input v-model="form.category" class="field-input" />
            </label>

            <label class="article-editor__field">
                <span>Tags</span>
                <input v-model="tagText" class="field-input" placeholder="Java,Spring Boot" />
            </label>

            <label class="article-editor__field">
                <span>Content</span>
                <textarea v-model="form.content" class="field-input" rows="10"></textarea>
            </label>

            <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
            <button class="primary-button" type="submit" :disabled="isSubmitting">
                {{ isSubmitting ? 'Saving...' : 'Save Article' }}
            </button>
        </form>
    </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { articleApi } from '@/service/article';
import { useAuthStore } from '@/store/modules/auth';
import type { ArticleCreateRequest, ArticleUpdateRequest } from '@/types';

defineOptions({ name: 'articleEditorPage' });

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const articleId = computed(() => String(route.params.id || ''));
const isEditMode = computed(() => Boolean(articleId.value));
const isSubmitting = ref(false);
const errorMessage = ref('');
const tagText = ref('');
const form = reactive({
    title: '',
    category: '',
    content: ''
});

function parseTags(): string[] {
    return tagText.value
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
}

async function loadArticle(): Promise<void> {
    if (!isEditMode.value) {
        return;
    }

    try {
        const article = await articleApi.getArticle(articleId.value);
        form.title = article.title;
        form.category = article.category || '';
        form.content = article.content;
        tagText.value = article.tags.join(',');
    } catch (error) {
        errorMessage.value = error instanceof Error ? error.message : 'Article load failed';
    }
}

async function handleSubmit(): Promise<void> {
    if (!form.title.trim() || !form.content.trim()) {
        errorMessage.value = 'Title and content are required';
        return;
    }
    if (!authStore.currentUser) {
        errorMessage.value = 'Please login first';
        return;
    }

    isSubmitting.value = true;
    errorMessage.value = '';
    try {
        if (isEditMode.value) {
            const payload: ArticleUpdateRequest = {
                title: form.title,
                category: form.category,
                content: form.content,
                tags: parseTags()
            };
            await articleApi.updateArticle(articleId.value, payload);
        } else {
            const payload: ArticleCreateRequest = {
                title: form.title,
                category: form.category,
                content: form.content,
                tags: parseTags(),
                authorId: authStore.currentUser.id
            };
            await articleApi.createArticle(payload);
        }
        await router.push('/articles');
    } catch (error) {
        errorMessage.value = error instanceof Error ? error.message : 'Article save failed';
    } finally {
        isSubmitting.value = false;
    }
}

onMounted(() => {
    void loadArticle();
});
</script>

<style scoped lang="less">
.article-editor {
    display: grid;
    gap: 18px;

    &__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;

        h2 {
            margin: 0;
        }
    }

    &__form,
    &__field {
        display: grid;
        gap: 10px;
    }
}
</style>
