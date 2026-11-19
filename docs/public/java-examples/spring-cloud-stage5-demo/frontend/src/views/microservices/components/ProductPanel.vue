<template>
    <section class="product-panel">
        <header class="product-panel__header">
            <div>
                <h2 class="product-panel__title">商品服务</h2>
                <p class="product-panel__subtitle">service-product:8083</p>
            </div>
            <button class="icon-button" type="button" title="刷新商品" :disabled="loading" @click="emit('refresh')">
                <RefreshCw :size="16" />
            </button>
        </header>

        <div class="product-panel__table">
            <div class="product-panel__row product-panel__row--head">
                <span>商品</span>
                <span>价格</span>
                <span>库存</span>
            </div>
            <div v-for="product in products" :key="product.id" class="product-panel__row">
                <strong>{{ product.name }}</strong>
                <span>¥{{ product.price.toFixed(2) }}</span>
                <span :class="{ 'product-panel__stock--low': product.stock < 10 }">{{ product.stock }}</span>
            </div>
            <p v-if="!loading && products.length === 0" class="product-panel__empty">暂无商品</p>
        </div>
    </section>
</template>

<script setup lang="ts">
import { RefreshCw } from 'lucide-vue-next';

import type { ProductPanelEmits, ProductPanelProps } from '@/types';

defineOptions({ name: 'productPanel' });

const props = defineProps<ProductPanelProps>();
const emit = defineEmits<ProductPanelEmits>();
const { products, loading } = props;
</script>

<style scoped lang="less">
@import '@/style/variables.less';

.product-panel {
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

    &__table {
        overflow: hidden;
        border: 1px solid #edf0f5;
        border-radius: 6px;
    }

    &__row {
        display: grid;
        align-items: center;
        grid-template-columns: minmax(0, 1.5fr) 90px 70px;
        gap: 8px;
        min-height: 42px;
        padding: 9px 10px;
        background: #ffffff;
        border-bottom: 1px solid #edf0f5;

        &:last-child {
            border-bottom: 0;
        }

        &--head {
            min-height: 36px;
            color: @text-muted;
            font-size: 12px;
            background: #f9fafb;
        }

        strong,
        span {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }

    &__stock {
        &--low {
            color: @warning-color;
            font-weight: 700;
        }
    }

    &__empty {
        margin: 0;
        padding: 12px;
        color: @text-muted;
    }
}
</style>
