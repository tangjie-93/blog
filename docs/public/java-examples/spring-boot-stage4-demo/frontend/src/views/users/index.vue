<template>
    <section class="users-page page-panel">
        <h2>Users</h2>
        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
        <div class="users-page__list">
            <div v-for="user in users" :key="user.id" class="users-page__item">
                <strong>{{ user.nickname || user.username }}</strong>
                <span>{{ user.email || 'No email' }}</span>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { userApi } from '@/service/user';
import type { UserVO } from '@/types';

defineOptions({ name: 'usersPage' });

const users = ref<UserVO[]>([]);
const errorMessage = ref('');

onMounted(async () => {
    try {
        users.value = await userApi.listUsers();
    } catch (error) {
        errorMessage.value = error instanceof Error ? error.message : 'Users load failed';
    }
});
</script>

<style scoped lang="less">
.users-page {
    &__list {
        display: grid;
        gap: 10px;
    }

    &__item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
    }
}
</style>
