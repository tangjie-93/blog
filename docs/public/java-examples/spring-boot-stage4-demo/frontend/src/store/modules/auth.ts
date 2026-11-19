import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

import { userApi } from '@/service/user';
import type { LoginRequest, UserCreateRequest, UserVO } from '@/types';

export const useAuthStore = defineStore('auth', () => {
    const token = ref('');
    const currentUser = ref<UserVO | null>(null);

    const isLoggedIn = computed(() => Boolean(token.value && currentUser.value));
    const displayName = computed(() => currentUser.value?.nickname || currentUser.value?.username || '未登录');

    async function login(params: LoginRequest): Promise<void> {
        const loginResult = await userApi.login(params);
        token.value = loginResult.token;

        const users = await userApi.listUsers();
        currentUser.value = users.find((user) => user.username === params.username) || null;
    }

    async function register(params: UserCreateRequest): Promise<void> {
        const user = await userApi.register(params);
        currentUser.value = user;
        await login({
            username: params.username,
            password: params.password
        });
    }

    function logout(): void {
        token.value = '';
        currentUser.value = null;
    }

    return {
        token,
        currentUser,
        isLoggedIn,
        displayName,
        login,
        register,
        logout
    };
});
