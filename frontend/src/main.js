import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { registerPrimeVue } from './plugins/primevue';
import '@/assets/styles.scss';

const app = createApp(App);
const primeVueApp = registerPrimeVue(app);

app.use(router);
app.mount('#app');
