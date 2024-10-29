import { createApp } from 'vue';
import { createPinia } from 'pinia';
import '~/styles/tailwind.css';
import App from './App.vue';
import Popper from 'vue3-popper';
import { useAttendantStore } from './stores/attendantStore';
import { useDepartmentStore } from './stores/departmentStore';
import vueDebounce from 'vue-debounce'

// Criar instância do Pinia
const pinia = createPinia();

const app = createApp(App);

// Usar Pinia no app
app.use(pinia);
const attendantStore = useAttendantStore()
const departmentStore = useDepartmentStore()
attendantStore.fetchAttendants()
departmentStore.fetchDepartments()
app.component('Popper', Popper);
app.directive('debounce', vueDebounce({ lock: true }))
app.mount('#app');
