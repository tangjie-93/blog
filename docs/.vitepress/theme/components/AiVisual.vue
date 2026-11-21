<script setup lang="ts">
import { computed, ref, useId } from 'vue'

interface VisualNode { label: string; detail: string }
const props = withDefaults(defineProps<{
    title: string
    nodes: VisualNode[]
    kind?: 'flow' | 'compare' | 'layers'
    caption?: string
}>(), { kind: 'flow', caption: '概念示意：节点表示机制或职责，不表示性能或耗时。' })
const id = `ai-visual-${useId()}`
const selected = ref<number | null>(null)
const activeNode = computed(() => selected.value === null ? undefined : props.nodes[selected.value])
</script>

<template>
    <figure class="ai-visual" :class="`ai-visual--${kind}`" :aria-labelledby="`${id}-title`">
        <figcaption :id="`${id}-title`" class="ai-visual__title"><span aria-hidden="true">◇</span>{{ title }}</figcaption>
        <ol class="ai-visual__diagram" :style="{ '--visual-count': nodes.length }">
            <li v-for="(node, index) in nodes" :key="`${index}-${node.label}`">
                <button type="button" :aria-pressed="selected === index" :aria-controls="`${id}-detail`" @click="selected = selected === index ? null : index">
                    <span class="ai-visual__mark" aria-hidden="true">{{ kind === 'compare' ? '◇' : String(index + 1).padStart(2, '0') }}</span>
                    <strong>{{ node.label }}</strong><span class="ai-visual__summary">{{ node.detail }}</span>
                </button>
                <span v-if="kind === 'flow' && index < nodes.length - 1" class="ai-visual__connector" aria-hidden="true">→</span>
            </li>
        </ol>
        <p class="ai-visual__detail">{{ caption }}</p>
        <p :id="`${id}-detail`" class="ai-visual__selection" aria-live="polite"><template v-if="activeNode"><strong>当前聚焦：{{ activeNode.label }}</strong> · {{ activeNode.detail }}</template><template v-else>点击节点可聚焦阅读，再次点击取消；也可用 Tab 和 Enter 操作。</template></p>
    </figure>
</template>

<style scoped>
.ai-visual {
    margin: 22px 0 28px; padding: 20px; border: 1px solid var(--blog-border); border-radius: 12px;
    background: var(--blog-panel, var(--vp-c-bg-soft)); color: var(--vp-c-text-1);
}
.ai-visual__title { display: flex; align-items: baseline; gap: 9px; font-size: 16px; font-weight: 600; line-height: 1.6; }
.ai-visual__title > span { color: var(--vp-c-brand-1); }
.ai-visual__diagram { display: grid; grid-template-columns: repeat(var(--visual-count), minmax(0, 1fr)); gap: 26px; margin: 20px 0 0 !important; padding: 0 !important; list-style: none !important; }
.ai-visual__diagram > li { position: relative; min-width: 0; margin: 0 !important; padding: 0 !important; }
.ai-visual__diagram button { display: flex; flex-direction: column; align-items: flex-start; gap: 10px; width: 100%; height: 100%; min-height: 150px; padding: 15px; border: 1px solid var(--blog-border); border-radius: 8px; background: var(--vp-c-bg); color: var(--vp-c-text-1); text-align: left; cursor: pointer; }
.ai-visual__diagram button:hover, .ai-visual__diagram button[aria-pressed='true'] { border-color: var(--vp-c-brand-1); background: var(--vp-c-brand-soft); }
.ai-visual__diagram button:focus-visible { outline: 2px solid var(--blog-focus-ring, var(--vp-c-brand-1)); outline-offset: 3px; }
.ai-visual__mark { display: grid; place-items: center; min-width: 28px; height: 28px; padding: 0 5px; border: 1px solid var(--blog-border); border-radius: 6px; color: var(--vp-c-text-2); font: 11px/1 var(--vp-font-family-mono); }
.ai-visual__diagram strong { font-size: 14px; line-height: 1.6; overflow-wrap: anywhere; }
.ai-visual__summary { color: var(--vp-c-text-2); font-size: 13px; line-height: 1.7; overflow-wrap: anywhere; }
.ai-visual__connector { position: absolute; right: -21px; top: 47%; color: var(--vp-c-text-2); font-size: 18px; line-height: 1; }
.ai-visual__detail { margin: 16px 0 0 !important; padding-top: 12px; border-top: 1px solid var(--blog-border); color: var(--vp-c-text-2); font-size: 12px; line-height: 1.8; }
.ai-visual__selection { margin: 8px 0 0 !important; color: var(--vp-c-text-2); font-size: 12px; line-height: 1.8; }
.ai-visual--compare .ai-visual__diagram { gap: 12px; }
.ai-visual--layers .ai-visual__diagram { grid-template-columns: 1fr; gap: 8px; }
.ai-visual--layers .ai-visual__diagram button { display: grid; grid-template-columns: 30px minmax(100px, .65fr) minmax(0, 2fr); align-items: center; min-height: 64px; padding: 12px 16px; }
.ai-visual--layers .ai-visual__diagram li:nth-child(even) button { background: var(--vp-c-bg-soft); }
@media (max-width: 1100px) {
    .ai-visual:not(.ai-visual--layers) .ai-visual__diagram { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
    .ai-visual__connector { display: none; }
}
@media (max-width: 640px) {
    .ai-visual { padding: 16px; }
    .ai-visual .ai-visual__diagram { grid-template-columns: 1fr; gap: 10px; }
    .ai-visual__diagram button { min-height: 0; }
    .ai-visual--flow .ai-visual__diagram { gap: 26px; }
    .ai-visual--flow .ai-visual__connector { display: block; top: auto; right: 50%; bottom: -21px; transform: rotate(90deg); }
    .ai-visual--layers .ai-visual__diagram button { grid-template-columns: 28px minmax(0, 1fr); gap: 8px 12px; }
    .ai-visual--layers .ai-visual__summary { grid-column: 2; }
}
@media (forced-colors: active) { .ai-visual__diagram button { border-color: ButtonText; } .ai-visual__diagram button[aria-pressed='true'] { outline: 2px solid Highlight; } }
</style>
