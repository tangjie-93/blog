<template>
    <main class="microservices-page">
        <section class="microservices-page__header">
            <div>
                <p class="microservices-page__eyebrow">Spring Cloud Stage 5</p>
                <h1 class="microservices-page__title">微服务电商工作台</h1>
            </div>
            <button class="secondary-button" type="button" :disabled="state.loading" @click="loadDashboard">
                <RefreshCw :size="16" />
                刷新
            </button>
        </section>

        <p v-if="state.errorMessage" class="microservices-page__error">{{ state.errorMessage }}</p>

        <section class="microservices-page__summary">
            <div class="microservices-page__metric">
                <Users :size="20" />
                <span>{{ state.users.length }} 用户</span>
            </div>
            <div class="microservices-page__metric">
                <Package :size="20" />
                <span>{{ state.products.length }} 商品</span>
            </div>
            <div class="microservices-page__metric">
                <ShoppingCart :size="20" />
                <span>{{ state.orders.length }} 订单</span>
            </div>
        </section>

        <section class="microservices-page__content">
            <UserPanel
                :users="state.users"
                :loading="state.loading"
                :submitting="state.submittingUser"
                @refresh="loadUsers"
                @create-user="handleCreateUser"
            />
            <ProductPanel :products="state.products" :loading="state.loading" @refresh="loadProducts" />
            <OrderPanel
                :users="state.users"
                :products="state.products"
                :orders="state.orders"
                :loading="state.loading"
                :submitting="state.submittingOrder"
                @refresh="loadOrders"
                @create-order="handleCreateOrder"
            />
        </section>
    </main>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue';
import { Package, RefreshCw, ShoppingCart, Users } from 'lucide-vue-next';

import { stage5Api } from '@/service/stage5';
import type { DashboardState, OrderCreatePayload, UserCreatePayload } from '@/types';
import ProductPanel from './components/ProductPanel.vue';
import OrderPanel from './components/OrderPanel.vue';
import UserPanel from './components/UserPanel.vue';

defineOptions({ name: 'microservicesPage' });

const state = reactive<DashboardState>({
    users: [],
    products: [],
    orders: [],
    loading: false,
    submittingUser: false,
    submittingOrder: false,
    errorMessage: ''
});

/**
 * 加载用户列表。
 * @returns 请求完成后的 Promise。
 */
async function loadUsers(): Promise<void> {
    state.users = await stage5Api.getUsers();
}

/**
 * 加载商品列表。
 * @returns 请求完成后的 Promise。
 */
async function loadProducts(): Promise<void> {
    state.products = await stage5Api.getProducts();
}

/**
 * 加载订单列表。
 * @returns 请求完成后的 Promise。
 */
async function loadOrders(): Promise<void> {
    state.orders = await stage5Api.getOrders();
}

/**
 * 加载工作台需要的全部数据。
 * @returns 请求完成后的 Promise。
 */
async function loadDashboard(): Promise<void> {
    state.loading = true;
    state.errorMessage = '';

    try {
        await Promise.all([loadUsers(), loadProducts(), loadOrders()]);
    } catch (error) {
        state.errorMessage = error instanceof Error ? error.message : '加载数据失败';
    } finally {
        state.loading = false;
    }
}

/**
 * 提交用户创建表单并刷新用户列表。
 * @param payload 用户创建参数。
 * @returns 请求完成后的 Promise。
 */
async function handleCreateUser(payload: UserCreatePayload): Promise<void> {
    state.submittingUser = true;
    state.errorMessage = '';

    try {
        await stage5Api.createUser(payload);
        await loadUsers();
    } catch (error) {
        state.errorMessage = error instanceof Error ? error.message : '创建用户失败';
    } finally {
        state.submittingUser = false;
    }
}

/**
 * 提交订单创建表单并刷新订单、商品列表。
 * @param payload 订单创建参数。
 * @returns 请求完成后的 Promise。
 */
async function handleCreateOrder(payload: OrderCreatePayload): Promise<void> {
    state.submittingOrder = true;
    state.errorMessage = '';

    try {
        await stage5Api.createOrder(payload);
        await Promise.all([loadOrders(), loadProducts()]);
    } catch (error) {
        state.errorMessage = error instanceof Error ? error.message : '创建订单失败';
    } finally {
        state.submittingOrder = false;
    }
}

onMounted(() => {
    void loadDashboard();
});
</script>

<style scoped lang="less">
@import '@/style/variables.less';

.microservices-page {
    min-height: 100vh;
    padding: 24px;

    &__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 16px;
    }

    &__eyebrow {
        margin: 0 0 4px;
        color: @text-muted;
        font-size: 13px;
    }

    &__title {
        margin: 0;
        color: @text-strong;
        font-size: 28px;
        font-weight: 700;
        letter-spacing: 0;
    }

    &__error {
        margin: 0 0 14px;
        padding: 10px 12px;
        color: @danger-color;
        background: #fff1f2;
        border: 1px solid #fecdd3;
        border-radius: 6px;
    }

    &__summary {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
        margin-bottom: 16px;
    }

    &__metric {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 54px;
        padding: 12px;
        color: @text-strong;
        background: @panel-bg;
        border: 1px solid @line-color;
        border-radius: 8px;
    }

    &__content {
        display: grid;
        grid-template-columns: minmax(260px, 0.85fr) minmax(320px, 1fr);
        gap: 16px;
    }

    @media (max-width: 960px) {
        padding: 16px;

        &__header {
            align-items: flex-start;
            flex-direction: column;
        }

        &__summary,
        &__content {
            grid-template-columns: 1fr;
        }
    }
}
</style>
