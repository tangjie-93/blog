<script setup lang="ts">
import type { BlogPost } from '../../../../src/types/blog'
import { formatPostDateTime } from '../blog'

defineProps<{ post: BlogPost }>()
</script>

<template>
    <div class="article-dates">
        <span>创建 <time v-if="post.date" :datetime="post.dateTime || post.date" :title="post.dateSource === 'git' ? 'Git 记录 · 北京时间' : post.dateTime ? '文章声明时间 · 北京时间' : '文章声明日期 · 时分未记录'">{{ formatPostDateTime(post.dateTime || post.date) }}</time><span v-else>未注明日期</span></span>
        <span>更新 <time v-if="post.updated" :datetime="post.updatedTime || post.updated" :title="post.updatedSource === 'creation' ? '无后续修改记录，沿用创建时间' : post.updatedSource === 'git' ? 'Git 内容修改记录 · 北京时间' : post.updatedTime ? '文章声明时间 · 北京时间' : '文章声明日期 · 时分未记录'">{{ formatPostDateTime(post.updatedTime || post.updated) }}</time></span>
    </div>
</template>

<style scoped>
.article-dates {
    display: flex;
    flex-wrap: wrap;
    gap: 2px 8px;
    color: var(--blog-muted, var(--vp-c-text-2));
    font-size: 12px;
    line-height: 1.5;

    & > span { white-space: nowrap; }
    & time { font-variant-numeric: tabular-nums; }
}
</style>
