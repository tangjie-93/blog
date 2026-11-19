<template>
    <main class="login-page">
        <form class="login-page__form" @submit.prevent="handleLogin">
            <h1 class="login-page__title">Login</h1>
            <label class="login-page__field">
                <span>Username</span>
                <input v-model="form.username" class="field-input" autocomplete="username" />
            </label>
            <label class="login-page__field">
                <span>Password</span>
                <input v-model="form.password" class="field-input" type="password" autocomplete="current-password" />
            </label>
            <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
            <button class="primary-button" type="submit" :disabled="isSubmitting">
                {{ isSubmitting ? 'Logging in...' : 'Login' }}
            </button>
            <p class="login-page__hint">Default account: admin / 123456</p>
        </form>
    </main>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useAuthStore } from '@/store/modules/auth';

defineOptions({ name: 'loginPage' });

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const isSubmitting = ref(false);
const errorMessage = ref('');
const form = reactive({
    username: 'admin',
    password: '123456'
});

async function handleLogin(): Promise<void> {
    isSubmitting.value = true;
    errorMessage.value = '';
    try {
        await authStore.login(form);
        await router.push(String(route.query.redirect || '/articles'));
    } catch (error) {
        errorMessage.value = error instanceof Error ? error.message : 'Login failed';
    } finally {
        isSubmitting.value = false;
    }
}
</script>

<style scoped lang="less">
.login-page {
    display: grid;
    min-height: 100vh;
    place-items: center;
    padding: 20px;

    &__form {
        width: min(420px, 100%);
        padding: 24px;
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
    }

    &__title {
        margin: 0 0 20px;
    }

    &__field {
        display: grid;
        gap: 6px;
        margin-bottom: 14px;
    }

    &__hint {
        margin: 14px 0 0;
        color: #6b7280;
        font-size: 13px;
    }
}
</style>
