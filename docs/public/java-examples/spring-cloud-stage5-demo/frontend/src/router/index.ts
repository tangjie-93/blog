import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'microservices',
            component: () => import('@/views/microservices/index.vue'),
            meta: { title: 'Stage5 微服务工作台' }
        },
        {
            path: '/:pathMatch(.*)*',
            redirect: '/'
        }
    ]
});

router.afterEach((to) => {
    document.title = typeof to.meta.title === 'string' ? to.meta.title : 'Stage5 微服务工作台';
});

export default router;
