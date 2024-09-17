import { createApp } from 'vue';
import { createPinia } from 'pinia';
import '~/styles/tailwind.css';
import App from './App.vue';
import Popper from 'vue3-popper';

// Criar instância do Pinia
const pinia = createPinia();

const app = createApp(App);

// Usar Pinia no app
app.use(pinia);

app.component('Popper', Popper);
app.mount('#app');
