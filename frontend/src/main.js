import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { registerPrimeVue } from './plugins/primevue';
import { setupPermissionDirectives } from './plugins/permission';
import pinia from './stores';
import '@/assets/styles.scss';

const app = createApp(App);

app.use(pinia);
app.use(router);

const primeVueApp = registerPrimeVue(app);
const permissionApp = setupPermissionDirectives(app);

app.mount('#app');
