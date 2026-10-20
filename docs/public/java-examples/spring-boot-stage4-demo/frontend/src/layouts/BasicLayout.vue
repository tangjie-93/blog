<template>
    <div class="basic-layout">
        <aside class="basic-layout__sidebar">
            <h1 class="basic-layout__brand">Stage4 Blog</h1>
            <RouterLink class="basic-layout__link" to="/articles">Articles</RouterLink>
            <RouterLink class="basic-layout__link" to="/editor">New Article</RouterLink>
            <RouterLink class="basic-layout__link" to="/users">Users</RouterLink>
        </aside>

        <main class="basic-layout__main">
            <header class="basic-layout__header">
                <span>{{ authStore.displayName }}</span>
                <button class="secondary-button" type="button" @click="handleLogout">Logout</button>
            </header>
            <RouterView />
        </main>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

import { useAuthStore } from '@/store/modules/auth';

defineOptions({ name: 'basicLayout' });

const router = useRouter();
const authStore = useAuthStore();

function handleLogout(): void {
    authStore.logout();
    void router.push('/login');
}
</script>

<style scoped lang="less">
.basic-layout {
    display: grid;
    min-height: 100vh;
    grid-template-columns: 220px minmax(0, 1fr);

    &__sidebar {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 20px;
        color: #ffffff;
        background: #111827;
    }

    &__brand {
        margin: 0 0 18px;
        font-size: 20px;
    }

    &__link {
        padding: 10px 12px;
        border-radius: 6px;

        &.router-link-active {
            background: #2563eb;
        }
    }

    &__main {
        min-width: 0;
        padding: 20px;
    }

    &__header {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 12px;
        margin-bottom: 16px;
    }
}
</style>
