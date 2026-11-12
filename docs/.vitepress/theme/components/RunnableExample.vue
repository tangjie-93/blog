<template>
    <section class="runnable-example" :aria-label="title">
        <div class="runnable-example__toolbar">
            <strong>{{ title }}</strong>
            <button type="button" @click="runCount += 1">{{ runCount ? '重新运行' : '运行示例' }}</button>
            <button v-if="runCount" type="button" @click="runCount = 0">停止</button>
        </div>
        <details open>
            <summary>示例源码</summary>
            <pre><code>{{ source }}</code></pre>
        </details>
        <iframe v-if="runCount" :key="runCount" :title="`${title}：运行结果`" :srcdoc="documentHtml" sandbox="allow-scripts" />
        <p v-else class="runnable-example__placeholder">点击“运行示例”，在这里查看效果或输出结果。</p>
    </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { createExampleDocument } from '../runnableExample'

const props = defineProps({
    title: { type: String, required: true },
    source: { type: String, required: true },
})
const runCount = ref(0)
const documentHtml = computed(() => createExampleDocument(props.source))
watch(() => props.source, () => { runCount.value = 0 })
</script>

<style scoped>
.runnable-example {
    margin: 24px 0;
    overflow: hidden;
    border: 1px solid var(--vp-c-divider);
    border-radius: 10px;
    & .runnable-example__toolbar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 12px;
        padding: 14px 16px;
        background: var(--vp-c-bg-soft);
        & strong { flex: 1; min-width: 140px; }
        & button {
            padding: 5px 14px;
            border: 1px solid var(--vp-c-brand-1);
            border-radius: 6px;
            color: var(--vp-c-brand-1);
            font-weight: 600;
            cursor: pointer;
            &:hover { background: var(--vp-c-brand-soft); }
            &:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 3px; }
        }
    }
    & details { padding: 12px 16px; }
    & summary { cursor: pointer; }
    & pre { max-height: 320px; overflow: auto; padding: 12px; background: var(--vp-code-block-bg); }
    & pre code { padding: 0; background: none; color: var(--vp-code-block-color); font-size: 13px; }
    & iframe { display: block; width: 100%; height: 360px; border: 0; border-top: 1px solid var(--vp-c-divider); background: white; }
    & .runnable-example__placeholder { padding: 16px; margin: 0; color: var(--vp-c-text-2); }
}
</style>
