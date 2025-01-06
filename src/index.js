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
  Vue.component("FilterSelectLib", FilterSelectLib);
}

export function attLibDeparts(department, action = "add") {
  const departStore = useDepartmentStore();
  if (action === "add") {
    departStore.addDepartments(department);
  } else if (action === "delete") {
    departStore.removeDepartments(department);
  } else {
    console.error(`Ação "${action}" não suportada em attLibDeparts.`);
  }
}

export function attLibAttendants(attendant, action = "add") {
  const attendantStore = useAttendantStore();
  if (action === "add") {
    attendantStore.addAttendants(attendant);
  } else if (action === "delete") {
    attendantStore.removeAttendants(attendant);
  } else {
    console.error(`Ação "${action}" não suportada em attLibAttendants.`);
  }
}

export function attLibInstances(instances, action = "add") {
  const instanceStore = useInstanceStore();
  if (action === "add") {
    instanceStore.addInstances(instances);
  } else if (action === "delete") {
    instanceStore.removeInstances(instances);
  } else {
    console.error(`Ação "${action}" não suportada em attLibInstances.`);
  }
}

// Função de configuração geral
export function setupLibrary({
  piniaInstance,
  jwtToken,
  rootUrl,
  attendances = [],
  departments = [],
  instances = [],
}) {
  try {
    // Configuração do AuthStore
    const authStore = useAuthStore(piniaInstance);
    if (jwtToken) {
      authStore.setToken(jwtToken);
    }

    // Configuração da baseURL para API
    if (rootUrl) {
      api.defaults.baseURL = rootUrl;
    }

    // Configuração do DepartmentStore
    const departStore = useDepartmentStore(piniaInstance);
    if (departments.length > 0) {
      departStore.departments = departments;
      departStore.count = departments.length;
    }
    //  else {
    //   departStore.fetchDepartments();
    // }

    // Configuração do AttendantStore
    const attendantStore = useAttendantStore(piniaInstance);
    if (attendances.length > 0) {
      attendantStore.attendants = attendances;
      attendantStore.count = attendances.length;
    }
    //  else {
    //   attendantStore.fetchAttendants();
    // }

    // Configuração do InstanceStore
    const instanceStore = useInstanceStore(piniaInstance);
    instanceStore.fetchInstances();
    // if (instances.length) {
    //   instanceStore.setInstances(instances);
    // } else {
    // }
  } catch (err) {
    console.error("Erro no setupLibrary:", err);
  }
}

export default {
  install,
  setupLibrary,
  attLibDeparts,
  attLibAttendants,
  attLibInstances,
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
