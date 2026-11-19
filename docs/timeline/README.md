---
title: 文章归档
pageClass: blog-archive
search: false
aside: false
prev: false
next: false
---

<script setup>
import { onMounted } from 'vue'
import { withBase } from 'vitepress'

onMounted(() => {
    window.location.replace(withBase('/articles/') + window.location.search + window.location.hash)
})
</script>

文章归档已迁移至[文章总览](../articles/)。
