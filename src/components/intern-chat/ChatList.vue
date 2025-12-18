<template>
  <div class="attendants-container">
    <!-- Seletor de tipo de lista -->
    <div class="list-selector bg-base-300 border-b border-base-200 flex">
      <button
        class="selector-button"
        :class="{ active: currentList === 'atendentes' }"
        @click="currentList = 'atendentes'"
      >
        Atendentes
      </button>

      <button
        class="selector-button"
        :class="{ active: currentList === 'grupos' }"
        @click="handleGroups"
      >
        Grupos
      </button>
    </div>

    <!-- Campo de busca -->
    <input
      v-if="currentList === 'atendentes'"
      v-model="searchQueryAttendant"
      :class="
        mobile
          ? 'search-input-mobile bg-base-300 border-b border-base-200'
          : 'search-input bg-base-300 border-b border-base-200'
      "
      placeholder="Pesquise entre os atendentes..."
    />

    <input
      v-if="currentList === 'grupos'"
      v-model="searchQueryGroups"
      :class="
        mobile
          ? 'search-input-mobile bg-base-300 border-b border-base-200'
          : 'search-input bg-base-300 border-b border-base-200'
      "
      placeholder="Pesquise entre os grupos..."
    />

    <!-- Lista de atendentes -->
    <ul v-if="currentList === 'atendentes'" class="atendentes-list bg-base-300">
      <!-- Mensagem de ausência de atendentes -->
      <li
        v-if="filteredAtendentes.length === 0"
        class="empty-message bg-base-200"
      >
        <p v-if="filteredAtendentes.length === 0">
          não há atendentes disponíveis
        </p>
      </li>

      <!-- Itens da lista de atendentes -->
      <li
        v-for="att in filteredAtendentes"
        :key="att.id"
        @click="selectAtendente(att)"
        :class="['atendente-item', att.isMoved ? 'moved' : '']"
        class="border-b even:bg-base-300 bg-blue-400/10 border-base-200 hover:bg-base-200 relative"
      >
        <!-- Informações principais do atendente -->
        <main class="atendente-main">
          <Avatar :url="att.photo" />
          <span class="atendente-name">{{ att.name }}</span>
        </main>

        <!-- Indicador de status -->
        <footer class="flex items-center gap-4">
          <span v-if="att.internal_chat.unread > 0" class="message-indicator">
            {{ att.internal_chat.unread }}
          </span>
          <div
            :class="['status-indicator', getStatusClass(att.login_status)]"
          ></div>
        </footer>

        <!-- Indicador de "conversar" no hover -->
        <div class="hover-action">Conversar</div>
      </li>
    </ul>
    <!-- LISTA DE GRUPOS -->
    <ul
      v-if="currentList === 'grupos'"
      class="atendentes-list bg-base-300"
      ref="groupsListRef"
      @scroll="handleGroupsScroll"
    >
      <li v-if="filteredGrupos.length === 0" class="empty-message bg-base-200">
        {{
          grupos.length === 0
            ? "Não há grupos disponíveis"
            : "Não há grupos com esse nome"
        }}
      </li>

      <li
        v-for="grupo in filteredGrupos"
        :key="grupo.channel_id"
        @click="selectAtendente(grupo)"
        class="atendente-item border-b even:bg-base-300 bg-blue-400/10 border-base-200 hover:bg-base-200"
      >
        <main class="atendente-main">
          <Avatar>
            <svg
              class="text-white dark:text-gray-800"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
              style="
                width: 75%;
                height: 75%;
                display: block;
                margin: auto;
                margin-top: 15%;
              "
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-width="2"
                d="M4.5 17H4a1 1 0 0 1-1-1 3 3 0 0 1 3-3h1m0-3.05A2.5 2.5 0 1 1 9 5.5M19.5 17h.5a1 1 0 0 0 1-1 3 3 0 0 0-3-3h-1m0-3.05a2.5 2.5 0 1 0-2-4.45m.5 13.5h-7a1 1 0 0 1-1-1 3 3 0 0 1 3-3h3a3 3 0 0 1 3 3 1 1 0 0 1-1 1Zm-1-9.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"
              />
            </svg>
          </Avatar>
          <span class="atendente-name">{{ grupo.name }}</span>
        </main>
        <!-- Indicador de status -->
        <footer class="flex items-center gap-4">
          <span v-if="grupo.internal_chat.unread > 0" class="message-indicator">
            {{ grupo.internal_chat.unread }}
          </span>
        </footer>

        <!-- Indicador de "conversar" no hover -->
        <div class="hover-action">Conversar</div>
      </li>
    </ul>

    <!-- Botão de criar grupo -->
    <div class="create-group-button bg-base-300">
      <button
        v-if="currentList === 'grupos'"
        class="popper-toggle"
        @click="togglePopper"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 15 14"
          fill="currentColor"
          class="size-5"
        >
          <path
            d="M11 7.99951C12.6568 7.99951 13.9998 9.3428 14 10.9995C14 12.6564 12.6569 13.9995 11 13.9995C9.3431 13.9995 8 12.6564 8 10.9995C8.00022 9.3428 9.34323 7.99951 11 7.99951ZM11 9.42725C10.9204 9.42725 10.8443 9.45888 10.7881 9.51514C10.7318 9.5714 10.7002 9.64749 10.7002 9.72705V10.6997H9.72754C9.64797 10.6997 9.57091 10.7313 9.51465 10.7876C9.45852 10.8438 9.42686 10.9201 9.42676 10.9995C9.42676 11.0791 9.45839 11.1561 9.51465 11.2124C9.57091 11.2687 9.64798 11.3003 9.72754 11.3003H10.7002V12.2729C10.7002 12.3525 10.7319 12.4286 10.7881 12.4849C10.8443 12.5411 10.9205 12.5728 11 12.5728C11.0795 12.5728 11.1557 12.5411 11.2119 12.4849C11.2681 12.4286 11.2998 12.3525 11.2998 12.2729V11.3003H12.2725C12.352 11.3003 12.4291 11.2687 12.4854 11.2124C12.5416 11.1561 12.5732 11.0791 12.5732 10.9995C12.5731 10.9201 12.5415 10.8438 12.4854 10.7876C12.4291 10.7313 12.352 10.6997 12.2725 10.6997H11.2998V9.72705C11.2998 9.64749 11.2682 9.5714 11.2119 9.51514C11.1557 9.45888 11.0796 9.42725 11 9.42725ZM8.625 7.50049C8.75546 7.50049 8.88472 7.51114 9.0127 7.52783C7.81025 8.21758 7.00015 9.51391 7 10.9995C7.00001 11.3446 7.04378 11.68 7.12598 11.9995H4.875C4.47733 11.9995 4.09573 11.8421 3.81445 11.561C3.53317 11.2798 3.37502 10.8973 3.375 10.4995C3.37513 9.7041 3.69144 8.94088 4.25391 8.37842C4.81649 7.81602 5.57949 7.50049 6.375 7.50049H8.625ZM3.8252 6.00049C3.92718 6.20013 4.04571 6.39131 4.17871 6.57178C3.47999 6.96241 2.89804 7.53261 2.49316 8.22314C2.0884 8.91353 1.87473 9.69923 1.875 10.4995H1.5C1.10231 10.4995 0.720731 10.3422 0.439453 10.061C0.158267 9.77986 0.000133157 9.39811 0 9.00049C0 8.2049 0.316324 7.44099 0.878906 6.87842C1.44148 6.31605 2.20451 6.00049 3 6.00049H3.8252ZM12 6.00049C12.7955 6.00049 13.5585 6.31605 14.1211 6.87842C14.6837 7.44099 15 8.2049 15 9.00049C14.9999 9.26491 14.9283 9.52124 14.7988 9.74658C14.3222 8.30098 13.0442 7.22072 11.4902 7.03076C11.2822 6.85894 11.0587 6.7045 10.8213 6.57178C10.9543 6.39131 11.0728 6.20013 11.1748 6.00049H12ZM7.5 1.50049C8.19619 1.50049 8.86416 1.77679 9.35645 2.26904C9.84868 2.76129 10.125 3.42937 10.125 4.12549C10.1249 4.82139 9.84845 5.48879 9.35645 5.98096C8.86417 6.47319 8.19617 6.75049 7.5 6.75049C7.15529 6.75049 6.81359 6.6822 6.49512 6.55029C6.17678 6.41839 5.88722 6.2246 5.64355 5.98096C5.39999 5.73731 5.20705 5.44767 5.0752 5.12939C4.94337 4.81107 4.87503 4.47002 4.875 4.12549C4.875 3.78081 4.9433 3.43905 5.0752 3.12061C5.2071 2.80231 5.39992 2.51268 5.64355 2.26904C5.88719 2.02542 6.17682 1.83259 6.49512 1.70068C6.8136 1.56877 7.15528 1.50049 7.5 1.50049ZM4.27539 0.00439453C4.75237 0.0318198 5.21314 0.188708 5.60742 0.458496C4.77299 0.888977 4.11076 1.5917 3.72949 2.44971C3.34824 3.3078 3.27087 4.2704 3.51074 5.17822C2.93768 5.04016 2.42723 4.71353 2.0625 4.25049C1.69784 3.78747 1.49997 3.21485 1.5 2.62549C1.49989 2.14763 1.63021 1.67828 1.87695 1.26904C2.12371 0.859923 2.47779 0.526133 2.90039 0.303223C3.32301 0.0803171 3.79837 -0.0229799 4.27539 0.00439453ZM10.4512 0.0356445C10.8309 -0.0261991 11.2197 -0.00395918 11.5898 0.101074C11.96 0.206149 12.3031 0.39091 12.5938 0.643066C12.8844 0.895214 13.1162 1.20846 13.2725 1.56006C13.4287 1.91163 13.5057 2.29359 13.498 2.67822C13.4904 3.06286 13.3976 3.44154 13.2275 3.78662C13.0575 4.1315 12.8139 4.43501 12.5137 4.67529C12.2136 4.91544 11.8638 5.0859 11.4902 5.17627C11.728 4.26901 11.6504 3.3078 11.2695 2.45068C10.8883 1.59293 10.2262 0.889932 9.39258 0.458496C9.71014 0.241574 10.0716 0.0974964 10.4512 0.0356445Z"
            fill="currentColor"
          />
        </svg>
      </button>
      <!-- Popper backdrop and panel -->
      <div v-if="showPopper">
        <div class="popper-backdrop" @click="closePopper"></div>

        <div class="popper-panel" @click.stop>
          <header class="popper-header bg-base-300 border-b border-base-200">
            <div class="popper-header pl-3">Criar Grupo</div>
            <input
              v-model="groupName"
              class="group-name-input bg-base-100"
              placeholder="Nome do grupo"
            />
            <!-- Error map shown when createGroup fails -->
            <div v-if="errorMap.length" class="error-list">
              <div v-for="err in errorMap" :key="err.key" class="error-item">
                <strong class="error-key">{{ err.key }}:</strong>
                <span class="error-message">{{ err.message }}</span>
              </div>
            </div>
          </header>

          <div class="popper-list">
            <div
              v-for="att in groupParticipants"
              :key="att.id"
              class="popper-item"
              :class="{ selected: att.selected }"
              @click="selectAttendant(att)"
            >
              <Avatar :url="att.photo" :style="'size-8'" />
              <span class="popper-item-name">{{ att.name }}</span>
            </div>
          </div>

          <div class="popper-actions bg-base-300 border-t border-base-200">
            <button
              class="btn-cancel"
              @click="closePopper"
              :disabled="isCreatingGroup"
            >
              Cancelar
            </button>
            <button
              class="btn-create"
              :disabled="
                selectedGroupParticipants.length === 0 ||
                groupName.trim() === '' ||
                isCreatingGroup
              "
              @click="createGroupFromPopper"
            >
              <span v-if="isCreatingGroup" class="loading-spinner"></span>
              <span>{{ isCreatingGroup ? "Criando..." : "Criar Grupo" }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Footer fixo -->
    <footer
      v-if="!mobile"
      class="chat-footer bg-base-200 flex justify-end"
    ></footer>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useChannelStore } from "../../stores/channelStore";
import Avatar from "./Avatar.vue";
const props = defineProps({
  atendentes: { type: Array, required: true },
  attendant: { required: true },
  mobile: { type: Boolean, default: false },
});

const emit = defineEmits(["atendenteSelecionado"]);

const grupos = ref([]);

const searchQueryAttendant = ref("");
const searchQueryGroups = ref("");
const currentList = ref("atendentes");

const selectAtendente = (atendente) => {
  emit("atendenteSelecionado", atendente);
};

const getStatusClass = (status) => {
  switch (status) {
    case "Busy":
      return "bg-red-500";
    case "Online":
      return "bg-green-500";
    case "Away":
      return "bg-yellow-500";
    case "Offline":
      return "bg-gray-500";
    default:
      return "bg-purple-500";
  }
};

// Computed property para filtrar os atendentes
const filteredAtendentes = computed(() => {
  if (!searchQueryAttendant.value) {
    return props.atendentes.filter((att) => att.id !== props.attendant.id);
  }
  return props.atendentes.filter(
    (att) =>
      att.name
        .toLowerCase()
        .includes(searchQueryAttendant.value.toLowerCase()) &&
      att.id !== props.attendant.id
  );
});

// Computed property para filtrar os grupos (usa searchQueryGroups)
const filteredGrupos = computed(() => {
  const channels = useChannelStore().channels.filter(
    (channel) => channel.is_group
  );
  if (!searchQueryGroups.value) return channels;
  const q = searchQueryGroups.value.toLowerCase();
  return channels.filter((ch) => (ch.name || "").toLowerCase().includes(q));
});

// Função para detectar quando chegou ao final da lista de grupos
const handleGroupsScroll = (event) => {
  const element = event.target;
  const scrollThreshold = 10; // pixels antes do final

  // Verifica se chegou perto do final da lista
  if (
    element.scrollHeight - element.scrollTop - element.clientHeight <
    scrollThreshold
  ) {
    const channelStore = useChannelStore();

    // Se houver próxima página, carrega mais grupos
    if (channelStore.nextPage) {
      channelStore.loadMoreChannels();
    }
  }
};

// Popper para selecioinar grupos
const showPopper = ref(false);
const selectedParticipants = ref([]);
const groupName = ref("");
const isCreatingGroup = ref(false);
// Clona e pega todos os atendentes menos o que está logado
const groupParticipants = ref(
  JSON.parse(
    JSON.stringify(
      props.atendentes.filter(
        (att) => att.id !== (props.attendant && props.attendant.id)
      )
    )
  )
);
const errorMap = ref([]);

const selectAttendant = (att) => {
  if (att.selected === undefined || att.selected === null) {
    att.selected = true;
    return;
  }
  att.selected = !att.selected;
};

const togglePopper = () => {
  showPopper.value = !showPopper.value;
  if (!showPopper.value) {
    selectedParticipants.value = [];
    groupName.value = "";
  }
};

const closePopper = () => {
  showPopper.value = false;
  selectedParticipants.value = [];
  groupName.value = "";
};

const createGroupFromPopper = async () => {
  errorMap.value = [];
  isCreatingGroup.value = true;

  const buildErrorMapFromData = (data) => {
    if (!data) {
      errorMap.value.push({
        key: "error",
        message: "Falha desconhecida ao criar grupo.",
      });
      return;
    }
    if (typeof data === "object") {
      Object.entries(data).forEach(([key, value]) => {
        if (String(key).toLowerCase() === "status") return; // pula flags de status
        const message = Array.isArray(value) ? value.join(", ") : String(value);
        errorMap.value.push({ key, message });
      });
    } else {
      errorMap.value.push({ key: "error", message: String(data) });
    }
  };

  const participantIds = selectedGroupParticipants.value.map((att) => att.id);

  try {
    const res = await createGroup(participantIds, groupName.value);

    if (!res || !(res.status >= 200 && res.status < 300)) {
      buildErrorMapFromData(res && res.data ? res.data : null);
      return;
    }

    // sucesso - limpa os atendentes selecionados
    groupParticipants.value.forEach((att) => {
      att.selected = false;
    });

    closePopper();
  } catch (error) {
    const data = error?.response?.data ?? error?.message ?? null;
    buildErrorMapFromData(data);
    console.error("Erro ao criar grupo via popper:", error);
    // mantém o modal aberto para o usuário corrigir
  } finally {
    isCreatingGroup.value = false;
  }
};

const createGroup = async (participants, chat_name) => {
  const body = {
    participants: participants || [],
    chat_name: chat_name || "Novo Grupo",
  };

  try {
    const response = await useChannelStore().createChannel(body);
    return response;
  } catch (error) {
    throw error;
  }
};

const handleGroups = () => {
  currentList.value = "grupos";
  const channelStore = useChannelStore();

  if (!channelStore.loaded) {
    channelStore.fetchChannel("group");
  }
};

const selectedGroupParticipants = computed(() => {
  return groupParticipants.value.filter((att) => att.selected === true);
});
</script>

<style scoped>
.atendente-item {
  transition: transform 0.3s ease, background-color 0.3s ease;
}

.atendente-item.moved {
  animation: highlight 0.8s ease-in-out;
}

@keyframes highlight {
  0% {
    background-color: rgba(59, 130, 246, 0.2);
  }

  100% {
    background-color: transparent;
  }
}

.attendants-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border-radius: 7px 7px 0 0;
  outline: none;
}

.search-input-mobile {
  width: 100%;
  padding: 0.75rem;
  outline: none;
}

.search-input:focus {
  border-color: #3b82f6;
}

/* Lista de atendentes ocupa o espaço disponível */
.atendentes-list {
  flex-grow: 1;
  /* Faz a lista ocupar o espaço restante */
  list-style: none;
  overflow-y: auto;
  /* Habilita rolagem se houver muitos atendentes */
  height: 100%;
}

.atendentes-list .empty-message {
  padding: 1rem;
}

/* Itens da lista de atendentes */
/* Itens da lista de atendentes */
.atendente-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  position: relative;
  overflow: hidden;
  padding-right: 1rem;
}

/* Efeito de hover */
.atendente-item:hover {
  background-color: rgba(59, 130, 246, 0.2);
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

/* Animação ao passar o mouse */
.atendente-item:hover .hover-action {
  right: 10px;
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

.atendente-main {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.atendente-photo-placeholder {
  width: 40px;
  height: 40px;
  background-color: #1e3a8a;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.atendente-photo {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #9ca3af;
}

.atendente-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

/* Botões do seletor */
.list-selector {
  display: flex;
}

.selector-button {
  flex: 1;
  padding: 0.75rem;
  text-align: center;
  cursor: pointer;
  border-bottom: 2px solid transparent;
}

.selector-button.active {
  font-weight: bold;
  border-bottom: 2px solid #3b82f6;
  color: #3b82f6;
}

/* Estilos do Popper */
.popper-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(46, 28, 28, 0.25);
  z-index: 40;
}

.popper-panel {
  position: absolute;
  right: 0.5rem;
  bottom: 3.25rem;
  width: 320px;
  max-height: 60vh;
  background: var(--popper-panel-bg);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.7);
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow: hidden;
}

.popper-header {
  font-weight: 700;
}

.group-name-input {
  padding: 0.5rem;
  border: 1px solid rgba(0, 0, 0, 0.06);
  outline: none;
  width: 100%;
}

.popper-list {
  overflow-y: auto;
  max-height: 34vh;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.popper-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  width: 100%;
  transition: transform 0.3s ease, background-color 0.3s ease;
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid transparent;
  background-color: var(--popper-bg);
}

:global(:root) {
  --popper-bg: rgba(59, 130, 246, 0.1);
  --popper-even-bg: #26343d;
  --popper-panel-bg: rgb(25, 42, 68);
  --popper-selected-color: rgb(31, 70, 128);
}

:global(.dark) {
  --popper-bg: rgb(255, 255, 255);
  --popper-even-bg: #97d1f5;
  --popper-panel-bg: rgb(196 214 226);
  --popper-selected-color: #5bbefc;
}

.popper-item:nth-child(even) {
  background-color: var(--popper-even-bg);
}

.popper-item:hover:not(.selected) {
  background-color: rgba(15, 132, 228, 0.4);
}

.popper-item.selected {
  background-color: var(--popper-selected-color);
}

.popper-item.selected .popper-item-name {
  font-weight: bold;
}

.popper-item-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.popper-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 0.4rem;
}

.btn-cancel {
  background: none;
  border: 1px solid rgba(0, 0, 0, 0.06);
  padding: 0.45rem 0.6rem;
  border-radius: 6px;
  cursor: pointer;
}

.btn-create {
  background: #3b82f6;
  color: rgb(51, 24, 24);
  padding: 0.45rem 0.6rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}

.btn-create:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.popper-header {
  padding-top: 0.3rem;
  padding-bottom: 0.75rem;
}

.error-list {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: rgba(220, 38, 38, 0.06);
  border-radius: 6px;
  border: 1px solid rgba(220, 38, 38, 0.12);
}

.error-item {
  color: #b91c1c;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.error-key {
  text-transform: capitalize;
  margin-right: 0.25rem;
}

.error-message {
  color: #991b1b;
}

.create-group-button {
  display: flex;
  justify-content: end;
  align-items: center;
  padding: 0.5rem;
}

/* Botão de alternar ao redor do gatilho do popper */
.popper-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.35rem;
  border-radius: 9999px;
  border: 2px solid #3b82f6; /* borda arredondada azul */
  background: transparent;
  cursor: pointer;
}

.popper-toggle:hover {
  background: rgba(59, 130, 246, 0.06);
}

.popper-toggle:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

/* Spinner de carregamento */
.loading-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  margin-right: 0.5rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.btn-create {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
