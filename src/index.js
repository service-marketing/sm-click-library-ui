import primarySelect from "~/components/selects/primary_select/primary_select.vue";
import simpleModal from "~/components/modals/simple_modal/simple_modal.vue";
import simpleCard from "~/components/cards/simple_card/simple_card.vue";
import instanceSelect from "~/components/selects/instance_select/index.vue";
import calendar from "./components/calendar/scheduledCalendar.vue";
import MFA from "./components/mfa/mfa.vue";
import MfaQrCode from "./components/mfa/MfaQrCode.vue";
import chatWindow from "./components/intern-chat/chatWindow.vue";
import MobileInternalChat from "./components/intern-chat/mobileChatWindow.vue";
import departSelect from "./components/selects/departmentSelect/departSelect.vue";
import attendantSelect from "./components/selects/attendantSelect/attendantSelect.vue";
import FilterSelectLib from "./components/selects/filterSelect/filterSelect.vue";
import RandomAvatar from "./components/avatar/randomAvatar.vue";
import MinModal from "./components/modals/min_modal/min_modal.vue";
import libPatchNotes from "./components/new-updates/patchNotes.vue";
import btnNewUpdates from "./components/new-updates/btnNewUpdates.vue";
import { useDebugStore } from "~/stores/debugStore";
import { useAuthStore } from "~/stores/authStore";
import { useAttendantStore } from "./stores/attendantStore";
import { useDepartmentStore } from "./stores/departmentStore";
import { useInstanceStore } from "./stores/instanceStore";
export { useScheduledStore } from "./stores/useScheduledStore";
import api from "~/utils/api"; // Importa a instância personalizada do Axios

function install(Vue) {
  Vue.component("primarySelect", primarySelect);
  Vue.component("departSelect", departSelect);
  Vue.component("attendantSelect", attendantSelect);
  Vue.component("SimpleModal", simpleModal);
  Vue.component("simpleCard", simpleCard);
  Vue.component("instanceSelect", instanceSelect);
  Vue.component("calendarEvents", calendar);
  Vue.component("MFA", MFA);
  Vue.component("MfaQrCode", MfaQrCode);
  Vue.component("chatWindow", chatWindow);
  Vue.component("FilterSelectLib", FilterSelectLib);
  Vue.component("MobileInternalChat", MobileInternalChat);
  Vue.component("RandomAvatar", RandomAvatar);
  Vue.component("MinModal", MinModal);
  Vue.component("LibPatchNotes", libPatchNotes);
  Vue.component("BtnNewUpdates", btnNewUpdates);
}

export function attLibDeparts(department, action = "add") {
  const departStore = useDepartmentStore();
  if (action === "add") {
    departStore.addDepartments(department);
  } else if (action === "delete") {
    departStore.removeDepartments(department);
  } else if (action === "update") {
    departStore.departments = department;
    departStore.loaded = true;
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
  } else if (action === "update") {
    attendantStore.attendants = attendant;
    attendantStore.loaded = true;
  } else {
    console.error(`Ação "${action}" não suportada em attLibAttendants.`);
  }
}

export function attLibInstances(instances, action = "add") {
  const instanceStore = useInstanceStore();
  if (action === "add") {
    instanceStore.addInstance(instances);
  } else if (action === "delete") {
    instanceStore.removeInstance(instances);
  } else if (action === "update") {
    instanceStore.instances = instances;
    instanceStore.loaded = true;
  } else {
    console.error(`Ação "${action}" não suportada em attLibInstances.`);
  }
}

// Função de configuração geral
export async function setupLibrary(
  piniaInstance,
  jwtToken,
  rootUrl,
  attendances = [],
  departments = [],
  instances = [],
) {
  try {
    // Configuração do AuthStore
    const authStore = await useAuthStore(piniaInstance);
    if (jwtToken) {
      await authStore.setToken(jwtToken);
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
    await instanceStore.fetchInstances();
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
  MobileInternalChat,
  RandomAvatar,
  MinModal,
  libPatchNotes,
  btnNewUpdates,
};
