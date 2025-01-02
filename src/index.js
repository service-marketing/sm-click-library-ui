import primarySelect from "~/components/selects/primary_select/primary_select.vue";
import simpleModal from "~/components/modals/simple_modal/simple_modal.vue";
import simpleCard from "~/components/cards/simple_card/simple_card.vue";
import instanceSelect from "~/components/selects/instance_select/index.vue";
import calendar from "./components/calendar/calendar.vue";
import MFA from "./components/mfa/mfa.vue";
import MfaQrCode from "./components/mfa/MfaQrCode.vue";
import chatWindow from "./components/intern-chat/chatWindow.vue";
import departSelect from "./components/selects/departmentSelect/departSelect.vue";
import attendantSelect from "./components/selects/attendantSelect/attendantSelect.vue";
import FilterSelectLib from "./components/selects/filterSelect/filterSelect.vue";
import { useDebugStore } from "~/stores/debugStore";
import { useAuthStore } from "~/stores/authStore";
import { useAttendantStore } from "./stores/attendantStore";
import { useDepartmentStore } from "./stores/departmentStore";
import { useInstanceStore } from "./stores/instanceStore";
import api from "~/utils/api"; // Importa a instância personalizada do Axios

function install(Vue) {
  Vue.component("primarySelect", primarySelect);
  Vue.component("departSelect", departSelect);
  Vue.component("attendantSelect", attendantSelect);
  Vue.component("SimpleModal", simpleModal);
  Vue.component("simpleCard", simpleCard);
  Vue.component("instanceSelect", instanceSelect);
  Vue.component("calendar", calendar);
  Vue.component("MFA", MFA);
  Vue.component("MfaQrCode", MfaQrCode);
  Vue.component("chatWindow", chatWindow);
}

export function attLibDeparts(department) {
  const departStore = useDepartmentStore();
  departStore.addDepartments(department);
}

export function setupLibrary(piniaInstance, jwtToken, rootUrl, attendances) {
  try {
    const authStore = useAuthStore(piniaInstance);
    authStore.setToken(jwtToken);

    if (rootUrl) {
      api.defaults.baseURL = rootUrl;
    }

    const departStore = useDepartmentStore(piniaInstance);
    departStore.fetchDepartments();

    const attendantStore = useAttendantStore(piniaInstance);

    // Verifica se 'attendances' foi passado e se não está vazio
    if (attendances) {
      attendantStore.attendants = attendances;
      attendantStore.count = attendances.length;
    } else {
      // Caso contrário, busca os atendentes via fetchAttendants
      attendantStore.fetchAttendants();
    }

    const instanceStore = useInstanceStore(piniaInstance);
    instanceStore.fetchInstances();
  } catch (err) {
    console.error("Erro no setupLibrary:", err);
  }
}

export default {
  install,
  setupLibrary,
  primarySelect,
  simpleModal,
  simpleCard,
  instanceSelect,
  calendar,
  MFA,
  chatWindow,
  departSelect,
  attendantSelect,
  FilterSelectLib,
};
