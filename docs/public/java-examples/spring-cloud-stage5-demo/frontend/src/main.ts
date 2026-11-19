import { createApp } from 'vue';

import App from './App.vue';
import router from './router';
import './style/global.less';

createApp(App).use(router).mount('#app');
