import { createRouter, createWebHistory } from 'vue-router';

import { useAuthStore } from '@/store/modules/auth';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: () => import('@/views/login/index.vue'),
            meta: { public: true, title: '登录' }
        },
        {
            path: '/',
            component: () => import('@/layouts/BasicLayout.vue'),
            redirect: '/articles',
            children: [
                {
                    path: 'articles',
                    name: 'articles',
                    component: () => import('@/views/articles/index.vue'),
                    meta: { title: '文章' }
                },
                {
                    path: 'articles/:id',
                    name: 'articleDetail',
                    component: () => import('@/views/article-detail/index.vue'),
                    meta: { title: '文章详情' }
                },
                {
                    path: 'editor',
                    name: 'articleCreate',
                    component: () => import('@/views/article-editor/index.vue'),
                    meta: { title: '写文章' }
                },
                {
                    path: 'editor/:id',
                    name: 'articleEdit',
                    component: () => import('@/views/article-editor/index.vue'),
                    meta: { title: '编辑文章' }
                },
                {
                    path: 'users',
                    name: 'users',
                    component: () => import('@/views/users/index.vue'),
                    meta: { title: '用户' }
                }
            ]
        },
        {
            path: '/:pathMatch(.*)*',
            redirect: '/articles'
        }
    ]
});

router.beforeEach((to) => {
    const authStore = useAuthStore();
    if (!to.meta.public && !authStore.isLoggedIn) {
        return { name: 'login', query: { redirect: to.fullPath } };
    }
    if (to.name === 'login' && authStore.isLoggedIn) {
        return { name: 'articles' };
    }
    return true;
});

export default router;
