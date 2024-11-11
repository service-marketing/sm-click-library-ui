import primarySelect from '~/components/selects/primary_select/primary_select.vue'
import simpleModal from "~/components/modals/simple_modal/simple_modal.vue"
import simpleCard from "~/components/cards/simple_card/simple_card.vue";
import instanceSelect from "~/components/selects/instance_select/index.vue"
import calendar from './components/calendar/calendar.vue';
import MFA from "./components/mfa/mfa.vue"
import MfaQrCode from "./components/mfa/MfaQrCode.vue"
import chatWindow from './components/intern-chat/chatWindow.vue';
import departSelect from "./components/selects/departmentSelect/departSelect.vue"
import { useDebugStore } from '~/stores/debugStore';
import { useAuthStore } from '~/stores/authStore';
import { useAttendantStore } from './stores/attendantStore';
import { useDepartmentStore } from './stores/departmentStore';
import api from '~/utils/api'; // Importa a instância personalizada do Axios

function install(Vue) {
    Vue.component('primarySelect', primarySelect)
    Vue.component('simpleModal', simpleModal)
    Vue.component('simpleCard', simpleCard)
    Vue.component('instanceSelect', instanceSelect)
    Vue.component('calendar', calendar)
    Vue.component('MFA', MFA)
    Vue.component('MfaQrCode', MfaQrCode)
    Vue.component('chatWindow', chatWindow)
    Vue.component('departSelect', departSelect);
}

export function setupLibrary(piniaInstance, jwtToken, rootUrl) {
    // Use a instância do Pinia para inicializar a store e logar a mensagem
    console.log("Iniciando setupLibrary"); // Log para verificar se é chamado
    try {
        const authStore = useAuthStore(piniaInstance);
        authStore.setToken(jwtToken); // Armazena o token no Pinia
        if (rootUrl) {
            api.defaults.baseURL = rootUrl; // Define o rootUrl dinamicamente
        }
        // const attendantStore = useAttendantStore(piniaInstance);
        const debugStore = useDebugStore(piniaInstance);
        debugStore.logMessage(); // Isso vai logar "Debug store initialized"
        const departStore = useDepartmentStore(piniaInstance);
        departStore.fetchDepartments();
        console.log('setup realizado com sucesso!')
    }
    catch (err) { console.log(err) }
    
}

export default {
    install,
    primarySelect,
    simpleModal,
    simpleCard,
    instanceSelect,
    calendar,
    MFA,
    chatWindow,
    departSelect, 
    setupLibrary
}