import { createApp } from 'vue';

import App from './App.vue';
import router from './router';
import { pinia } from './store';
import './style/global.less';

createApp(App).use(pinia).use(router).mount('#app');
