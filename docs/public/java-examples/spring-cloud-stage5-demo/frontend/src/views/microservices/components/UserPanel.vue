<template>
    <section class="user-panel">
        <header class="user-panel__header">
            <div>
                <h2 class="user-panel__title">用户服务</h2>
                <p class="user-panel__subtitle">service-user:8081</p>
            </div>
            <button class="icon-button" type="button" title="刷新用户" :disabled="loading" @click="emit('refresh')">
                <RefreshCw :size="16" />
            </button>
        </header>

        <form class="user-panel__form" @submit.prevent="handleSubmit">
            <input v-model.trim="form.username" class="field-input" placeholder="用户名" />
            <input v-model.trim="form.email" class="field-input" placeholder="邮箱" />
            <input v-model.number="form.age" class="field-input" min="1" max="120" type="number" placeholder="年龄" />
            <button class="primary-button" type="submit" :disabled="submitting || !canSubmit">
                <UserPlus :size="16" />
                新增用户
            </button>
        </form>

        <div class="user-panel__list">
            <article v-for="user in users" :key="user.id" class="user-panel__item">
                <div>
                    <strong>{{ user.username }}</strong>
                    <span>{{ user.email }}</span>
                </div>
                <span>{{ user.age }} 岁</span>
            </article>
            <p v-if="!loading && users.length === 0" class="user-panel__empty">暂无用户</p>
        </div>
    </section>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';
import { RefreshCw, UserPlus } from 'lucide-vue-next';

import type { UserCreatePayload, UserPanelEmits, UserPanelProps } from '@/types';

defineOptions({ name: 'userPanel' });

const props = defineProps<UserPanelProps>();
const emit = defineEmits<UserPanelEmits>();

const form = reactive<UserCreatePayload>({
    username: '',
    email: '',
    age: 18
});

const canSubmit = computed(() => {
    return form.username.length > 0 && form.email.length > 0 && form.age > 0;
});

/**
 * 提交用户创建事件并重置表单。
 * @returns 无返回值。
 */
function handleSubmit(): void {
    if (!canSubmit.value) {
        return;
    }

    emit('createUser', { ...form });
    form.username = '';
    form.email = '';
    form.age = 18;
}

const { users, loading, submitting } = props;
</script>

<style scoped lang="less">
@import '@/style/variables.less';

.user-panel {
    padding: 16px;
    background: @panel-bg;
    border: 1px solid @line-color;
    border-radius: 8px;

    &__header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 14px;
    }

    &__title {
        margin: 0;
        color: @text-strong;
        font-size: 18px;
        letter-spacing: 0;
    }

    &__subtitle {
        margin: 4px 0 0;
        color: @text-muted;
        font-size: 12px;
    }

    &__form {
        display: grid;
        gap: 8px;
        margin-bottom: 14px;
    }

    &__list {
        display: grid;
        gap: 8px;
    }

    &__item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 10px;
        background: #f9fafb;
        border: 1px solid #edf0f5;
        border-radius: 6px;

        div {
            display: grid;
            gap: 3px;
            min-width: 0;
        }

        strong,
        span {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }

    &__empty {
        margin: 0;
        color: @text-muted;
    }
}
</style>
