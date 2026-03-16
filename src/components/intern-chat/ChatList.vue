<template>
  <div class="attendants-container">
    <!-- Seletor de tipo de lista -->
    <SectionsHeader
      :hasUnread="hasUnreadAttendants || hasUnreadGroups"
      v-model:currentState="currentList"
      v-model:searchQuery="searchQuery"
    />

    <!-- Lista de atendentes -->
    <MountListForType
      :content=" 
        currentList === 'atendentes' ? filteredAtendentes : filteredGrupos
      "
      :mode="currentList"
    />

    <!-- Footer fixo -->
    <footer
      v-if="!mobile"
      class="chat-footer bg-base-200 flex justify-end"
    ></footer>
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  watch,
  nextTick,
  inject,
} from "vue";

import SectionsHeader from "./components/sectionsHeader.vue";
import MountListForType from "./components/mountListForType.vue";

const props = defineProps({
  listAttendants: { type: Array, default: () => [], required: true },
  listGroups: { type: Array, default: () => [], required: true },
  currentAttendant: { type: Object, required: true },
  mobile: { type: Boolean, default: false },
  currentList: { type: String, default: undefined },
});

// --- Injects recebidos de ChatWindow ---
const fetchGroupChannels = inject("fetchGroupChannels");
// --------------------------------------

const emit = defineEmits(["update:currentList"]);

const searchQuery = ref("");

// Se o pai não controlar a aba, mantém estado local.
const uncontrolledCurrentList = ref(props.currentList ?? "atendentes");

const currentList = computed({
  get() {
    return props.currentList ?? uncontrolledCurrentList.value;
  },
  set(value) {
    if (props.currentList === undefined) {
      uncontrolledCurrentList.value = value;
      return;
    }
    emit("update:currentList", value);
  },
});

// Computed property para filtrar os atendentes
const filteredAtendentes = computed(() => {
  if (!searchQuery.value) {
    return props.listAttendants.filter(
      (att) => att.id !== props.currentAttendant.id
    );
  }
  return props.listAttendants.filter(
    (att) =>
      att.name.toLowerCase().includes(searchQuery.value.toLowerCase()) &&
      att.id !== props.currentAttendant.id
  );
});

// Computed property para filtrar os grupos (usa searchQueryGroups)
const filteredGrupos = computed(() => {
  const channels = (props.listGroups || []).filter((ch) => ch?.is_group);

  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return channels;

  return channels.filter((ch) => (ch?.name || "").toLowerCase().includes(q));
});

watch(
  () => currentList.value,
  async (value) => {
    searchQuery.value = "";
    const isGroup = value === "grupos";
    const isMobile = !props.mobile;

    if (isGroup) handleGroups();
    if (isMobile) return;
  }
);

const handleGroups = async () => {
  if (typeof fetchGroupChannels !== "function") return;
  fetchGroupChannels();
};

// Unread helpers (for the green dot in the list selector)
const unreadAttendantsTotal = computed(() => {
  return (props.listAttendants || [])
    .filter((att) => att.id !== props.currentAttendant?.id)
    .reduce((sum, att) => sum + (Number(att?.internal_chat?.unread) || 0), 0);
});

const unreadGroupsTotal = computed(() => {
  return (props.listGroups || [])
    .filter((ch) => ch.is_group)
    .reduce((sum, ch) => sum + (Number(ch?.internal_chat?.unread) || 0), 0);
});

const hasUnreadAttendants = computed(() => unreadAttendantsTotal.value > 0);
const hasUnreadGroups = computed(() => unreadGroupsTotal.value > 0);
</script>

<style scoped>
.attendants-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.mini-spinner {
  width: 14px;
  height: 14px;
  border-radius: 9999px;
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-top-color: rgba(255, 255, 255, 0.9);
  display: inline-block;
  animation: mini-spin 0.8s linear infinite;
}

@keyframes mini-spin {
  to {
    transform: rotate(360deg);
  }
}

.search-input:focus {
  border-color: #3b82f6;
}

/* Indicador "Conversar" no hover */
.hover-action {
  position: absolute;
  right: -100px;
  top: 50%;
  transform: translateY(-50%);
  background-color: #3b82f6;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 7px;
  font-size: 0.9rem;
  font-weight: 600;
  transition: right 0.3s ease;
  white-space: nowrap;
}

/* Indicador de mensagens não lidas */
.message-indicator {
  background-color: rgb(34 197 94);
  color: white;
  padding: 0.5rem;
  padding-top: 0px;
  padding-bottom: 0px;
  border-radius: 9999px;
}

/* Indicador de status de login */
.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

/* Footer fixo no final */
.chat-footer {
  padding: 0.6rem;
  text-align: center;
  color: white;
  border-bottom-right-radius: 7px /* 12px */;
  border-bottom-left-radius: 7px;
  /* 12px */
  /* Fixo na parte inferior */
}

/* Botões da navbar */
.nav-button {
  background: none;
  border: none;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
}

.nav-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 7px;
}
</style>
