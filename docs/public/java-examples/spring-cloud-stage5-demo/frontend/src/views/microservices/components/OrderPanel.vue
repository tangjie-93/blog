<template>
    <section class="order-panel">
        <header class="order-panel__header">
            <div>
                <h2 class="order-panel__title">订单服务</h2>
                <p class="order-panel__subtitle">service-order:8082 -> Feign -> user/product</p>
            </div>
            <button class="icon-button" type="button" title="刷新订单" :disabled="loading" @click="emit('refresh')">
                <RefreshCw :size="16" />
            </button>
        </header>

        <form class="order-panel__form" @submit.prevent="handleSubmit">
            <select v-model.number="form.userId" class="field-input">
                <option :value="0">选择用户</option>
                <option v-for="user in users" :key="user.id" :value="user.id">{{ user.username }}</option>
            </select>
            <select v-model.number="form.productId" class="field-input">
                <option :value="0">选择商品</option>
                <option v-for="product in products" :key="product.id" :value="product.id">
                    {{ product.name }} / 库存 {{ product.stock }}
                </option>
            </select>
            <input v-model.number="form.quantity" class="field-input" min="1" type="number" placeholder="数量" />
            <button class="primary-button" type="submit" :disabled="submitting || !canSubmit">
                <ShoppingCart :size="16" />
                创建订单
            </button>
        </form>

        <div class="order-panel__list">
            <article v-for="order in orders" :key="order.id" class="order-panel__item">
                <div>
                    <strong>#{{ order.id }} {{ order.productName }}</strong>
                    <span>{{ order.username }} · {{ order.quantity }} 件 · {{ formatDate(order.createdAt) }}</span>
                </div>
                <b>¥{{ order.amount.toFixed(2) }}</b>
            </article>
            <p v-if="!loading && orders.length === 0" class="order-panel__empty">暂无订单</p>
        </div>
    </section>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { RefreshCw, ShoppingCart } from 'lucide-vue-next';

import type { OrderCreatePayload, OrderPanelEmits, OrderPanelProps } from '@/types';

defineOptions({ name: 'orderPanel' });

const props = defineProps<OrderPanelProps>();
const emit = defineEmits<OrderPanelEmits>();

const form = reactive<OrderCreatePayload>({
    userId: 0,
    productId: 0,
    quantity: 1
});

const canSubmit = computed(() => {
    return form.userId > 0 && form.productId > 0 && form.quantity > 0;
});

/**
 * 格式化后端 LocalDateTime 字符串。
 * @param value 后端返回的创建时间。
 * @returns 适合列表展示的时间文本。
 */
function formatDate(value: string): string {
    return value.replace('T', ' ').slice(0, 19);
}

/**
 * 提交订单创建事件。
 * @returns 无返回值。
 */
function handleSubmit(): void {
    if (!canSubmit.value) {
        return;
    }

    emit('createOrder', { ...form });
    form.quantity = 1;
}

watch(
    () => props.users,
    (users) => {
        if (form.userId === 0 && users.length > 0) {
            form.userId = users[0].id;
        }
    },
    { immediate: true }
);

watch(
    () => props.products,
    (products) => {
        if (form.productId === 0 && products.length > 0) {
            form.productId = products[0].id;
        }
    },
    { immediate: true }
);

const { users, products, orders, loading, submitting } = props;
</script>

<style scoped lang="less">
@import '@/style/variables.less';

.order-panel {
    grid-column: 1 / -1;
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
        align-items: end;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr) 110px auto;
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
        gap: 12px;
        padding: 11px 12px;
        background: #f9fafb;
        border: 1px solid #edf0f5;
        border-radius: 6px;

        div {
            display: grid;
            gap: 4px;
            min-width: 0;
        }

        strong,
        span {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        b {
            color: @success-color;
        }
    }

    &__empty {
        margin: 0;
        color: @text-muted;
    }

    @media (max-width: 760px) {
        &__form {
            grid-template-columns: 1fr;
        }
    }
}
</style>
