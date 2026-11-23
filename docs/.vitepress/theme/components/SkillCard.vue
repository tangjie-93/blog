<template>
    <article class="skill-card" :class="{ 'skill-card--compact': compact }">
        <div class="skill-card__meta"><span>{{ categoryTitle }}</span><span>{{ sourceLabel }}</span></div>
        <h2>{{ skill.title }}</h2>
        <code class="skill-card__name">{{ skillInvocation(skill) }}</code>
        <p>{{ skill.summary }}</p>
        <div class="skill-card__action"><a :href="`#/scenarios?skill=${encodeURIComponent(skill.id)}`" :aria-label="`查看 ${skill.title} 的应用场景`">应用场景</a><SkillDocument :skill="skill" /></div>
    </article>
</template>

<script setup lang="ts">
import type { SkillEntry } from '../../../../src/types/skills'
import { computed } from 'vue'
import { skillCategories, skillInvocation } from '../skillCatalog'
import SkillDocument from './SkillDocument.vue'

const props = defineProps<{ skill: SkillEntry; compact?: boolean }>()
const categoryTitle = computed(() => skillCategories.find(item => item.id === props.skill.category)?.title)
const sourceLabel = computed(() => props.skill.source === 'personal' ? '个人技能' : props.skill.source === 'system' ? '系统技能' : `${props.skill.source} 插件`)
</script>

<style scoped>
.skill-card {
    display: flex; flex-direction: column; min-width: 0; padding: 16px; border: 1px solid var(--blog-border); border-radius: var(--blog-radius); background: var(--blog-panel); overflow-wrap: anywhere; box-shadow: var(--blog-surface-shadow);
    transition: border-color 180ms ease, box-shadow 180ms ease;
    &:hover, &:focus-within { border-color: var(--blog-border-hover); box-shadow: var(--blog-hover-shadow); }
    & .skill-card__meta { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; color: var(--blog-muted); font-size: 12px; }
    & > h2 { display: -webkit-box; margin: 8px 0 4px; overflow: hidden; font-size: 17px; line-height: 1.5; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
    & > p { display: -webkit-box; overflow: hidden; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
    & .skill-card__action { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 4px 12px; margin-top: auto; border-top: 1px solid var(--blog-border); padding-top: 6px; }
    & .skill-card__action a { color: var(--vp-c-brand-1); font-size: 13px; }
}
.skill-card {
    & .skill-card__name { color: var(--vp-c-brand-1); font-size: 12px; }
    & p, & li, & dd { font-size: 14px; line-height: 1.8; color: var(--vp-c-text-2); }
    & p { margin: 12px 0; }
}
/* 整屏分页时卡片高度由屏幕容量决定，压缩行高与间距以保证内容不被裁切。 */
.skill-card--compact {
    padding: 14px 16px;
    & .skill-card__meta { gap: 6px; font-size: 11px; line-height: 18px; }
    & > h2 { margin: 6px 0 2px; font-size: 16px; line-height: 1.4; }
    & .skill-card__name { font-size: 11px; line-height: 18px; }
    & > p { margin: 6px 0; font-size: 13px; line-height: 1.55; }
    & .skill-card__action { padding-top: 4px; }
    & .skill-card__action .el-button { min-height: 28px; font-size: 13px; }
}
</style>
