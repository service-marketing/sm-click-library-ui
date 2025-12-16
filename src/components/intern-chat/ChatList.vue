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
    <ul v-if="currentList === 'grupos'" class="atendentes-list bg-base-300">
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
              version="1.0"
              xmlns="http://www.w3.org/2000/svg"
              width="1280.000000pt"
              height="870.000000pt"
              viewBox="0 0 1280.000000 870.000000"
              preserveAspectRatio="xMidYMid meet"
            >
              <g
                transform="translate(0.000000,870.000000) scale(0.100000,-0.100000)"
                fill="#000000"
                stroke="none"
              >
                <path
                  d="M2765 8694 c-16 -2 -66 -9 -110 -15 -590 -78 -1135 -462 -1418 -999
-317 -601 -293 -1314 63 -1895 252 -412 684 -729 1155 -849 256 -65 595 -73
842 -22 299 63 585 195 810 374 43 35 52 48 58 84 70 461 256 851 575 1207
102 114 104 122 90 334 -46 681 -444 1280 -1055 1585 -264 132 -505 190 -810
197 -93 2 -183 1 -200 -1z"
                />
                <path
                  d="M9715 8694 c-16 -2 -66 -9 -110 -15 -379 -50 -763 -237 -1054 -514
-274 -261 -478 -636 -551 -1010 -23 -124 -40 -343 -32 -425 5 -51 10 -60 86
-145 106 -118 171 -201 239 -305 165 -256 284 -557 331 -845 16 -94 19 -102
54 -134 65 -59 243 -171 367 -232 143 -69 292 -120 458 -155 167 -35 437 -43
617 -20 439 58 821 252 1130 572 678 704 716 1796 89 2549 -291 349 -703 583
-1159 660 -91 15 -402 28 -465 19z"
                />
                <path
                  d="M6140 6944 c-762 -104 -1397 -670 -1590 -1420 -290 -1124 491 -2246
1652 -2373 1024 -112 1966 636 2093 1662 47 383 -16 749 -192 1096 -286 568
-828 954 -1456 1036 -144 18 -365 18 -507 -1z"
                />
                <path
                  d="M11300 5039 c-230 -188 -512 -337 -792 -418 -445 -128 -902 -120
-1340 26 -129 42 -348 143 -464 212 l-51 31 -7 -67 c-26 -268 -109 -548 -233
-793 -96 -187 -196 -331 -365 -523 -39 -44 -41 -49 -24 -59 126 -70 451 -373
578 -538 247 -321 435 -707 578 -1187 l34 -113 1793 0 1793 0 0 75 c0 123 -19
407 -41 600 -88 791 -320 1565 -610 2030 -190 305 -447 577 -719 762 l-45 31
-85 -69z"
                />
                <path
                  d="M1354 5057 c-179 -123 -414 -346 -540 -512 -94 -124 -206 -298 -273
-425 -300 -572 -504 -1455 -537 -2323 l-7 -187 1794 2 1793 3 41 135 c228 745
560 1254 1060 1627 55 41 101 78 103 82 1 4 -25 37 -58 74 -311 339 -517 792
-572 1256 l-12 101 -50 -31 c-116 -69 -335 -170 -464 -212 -655 -218 -1363
-126 -1937 251 -66 43 -154 106 -195 140 -41 34 -77 62 -80 61 -3 0 -32 -19
-66 -42z"
                />
                <path
                  d="M7730 3229 c-156 -119 -405 -249 -609 -318 -388 -131 -832 -153
-1231 -60 -278 64 -565 194 -798 361 -51 37 -89 58 -98 54 -37 -14 -202 -135
-302 -221 -96 -83 -205 -199 -314 -336 -69 -86 -199 -294 -262 -419 -210 -414
-377 -1014 -461 -1662 -19 -151 -45 -469 -45 -559 l0 -69 2792 0 2791 0 -6
148 c-30 686 -198 1451 -439 2002 -202 462 -488 823 -849 1070 -48 33 -91 60
-96 59 -4 0 -37 -23 -73 -50z"
                />
              </g>
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
          class="w-6 h-6 text-gray-800 dark:text-white"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="white"
          viewBox="0 0 24 24"
        >
          <path
            fill-rule="evenodd"
            d="M12 6a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm-1.5 8a4 4 0 0 0-4 4 2 2 0 0 0 2 2h7a2 2 0 0 0 2-2 4 4 0 0 0-4-4h-3Zm6.82-3.096a5.51 5.51 0 0 0-2.797-6.293 3.5 3.5 0 1 1 2.796 6.292ZM19.5 18h.5a2 2 0 0 0 2-2 4 4 0 0 0-4-4h-1.1a5.503 5.503 0 0 1-.471.762A5.998 5.998 0 0 1 19.5 18ZM4 7.5a3.5 3.5 0 0 1 5.477-2.889 5.5 5.5 0 0 0-2.796 6.293A3.501 3.501 0 0 1 4 7.5ZM7.1 12H6a4 4 0 0 0-4 4 2 2 0 0 0 2 2h.5a5.998 5.998 0 0 1 3.071-5.238A5.505 5.505 0 0 1 7.1 12Z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
  <!-- Popper backdrop and panel -->
      <div v-if="showPopper">
        <div class="popper-backdrop" @click="closePopper"></div>

        <div class="popper-panel" @click.stop>
          <header class="popper-header bg-base-300 border-b border-base-200">
            <div class="popper-header">Criar Grupo</div>
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
              @click="selectAttendant(att)"
              :class="{ 'bg-base-100': att.selected }"
            >
              <!-- <input
                type="checkbox"
                :value="att.id"
                v-model="selectedParticipants"
              /> -->
              <Avatar :url="att.photo" />
              <span class="popper-item-name">{{ att.name }}</span>
            </div>
          </div>

          <div class="popper-actions bg-base-300 border-t border-base-200">
            <button class="btn-cancel" @click="closePopper">Cancelar</button>
            <button
              class="btn-create"
              :disabled="
                selectedGroupParticipants.length === 0 ||
                groupName.trim() === ''
              "
              @click="createGroupFromPopper"
            >
              Criar Grupo
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Footer fixo -->
    <footer v-if="!mobile" class="chat-footer bg-base-200 flex justify-end"></footer>
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
const searchQueryGroups = ref("")
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
      att.name.toLowerCase().includes(searchQueryAttendant.value.toLowerCase()) &&
      att.id !== props.attendant.id
  );
});

// Computed property para filtrar os grupos (usa searchQueryGroups)
const filteredGrupos = computed(() => {
  const channels = useChannelStore().channels.filter((channel) => channel.is_group);
  if (!searchQueryGroups.value) return channels;
  const q = searchQueryGroups.value.toLowerCase();
  return channels.filter((ch) => (ch.name || '').toLowerCase().includes(q));
});

// Popper para selecioinar grupos
const showPopper = ref(false);
const selectedParticipants = ref([]);
const groupName = ref("");
// Clona e pega todos os atendentes menos o que está logado
const groupParticipants = ref(
  JSON.parse(
    JSON.stringify(
      props.atendentes.filter((att) => att.id !== (props.attendant && props.attendant.id))
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
  // reset previous errors
  errorMap.value = [];

  // helper to normalize various error shapes into errorMap
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
        if (String(key).toLowerCase() === "status") return; // skip status flags
        const message = Array.isArray(value) ? value.join(", ") : String(value);
        errorMap.value.push({ key, message });
      });
    } else {
      errorMap.value.push({ key: "error", message: String(data) });
    }
  };

  // Pass participants (array of ids) and group name to existing handler
  const participantIds = selectedGroupParticipants.value.map((att) => att.id);

  try {
    const res = await createGroup(participantIds, groupName.value);

    // If response indicates failure, extract messages
    if (!res || !(res.status >= 200 && res.status < 300)) {
      buildErrorMapFromData(res && res.data ? res.data : null);
      return; // keep popper open so user can see errors
    }

    // success
    closePopper();
  } catch (error) {
    const data = error?.response?.data ?? error?.message ?? null;
    buildErrorMapFromData(data);
    console.error("Erro ao criar grupo via popper:", error);
    // keep popper open for user to correct
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

/* Popper styles */
.popper-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(46, 28, 28, 0.25);
  z-index: 40;
}

.popper-panel {
  position: absolute;
  right: 0.5rem;
  bottom: 3.25rem; /* above footer */
  width: 320px;
  max-height: 60vh;
  background: var(--base-100, rgb(17, 27, 37));
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.7);
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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
  padding-right: 0.25rem;
  padding-left: 0.5rem;
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

/* Toggle button around popper trigger */
.popper-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.35rem;
  border-radius: 9999px;
  border: 2px solid #3b82f6; /* blue rounded border */
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
</style>
