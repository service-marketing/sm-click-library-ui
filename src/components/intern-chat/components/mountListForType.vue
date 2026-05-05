<script setup>
import { inject, computed } from "vue";
import Avatar from "../Avatar.vue";

const props = defineProps({
  content: { type: Object, default: () => ({}) },
  mode: { type: String, default: false },
  loader: { type: Boolean, default: false },
});

const isGroup = computed(() => props.mode === "grupos");

// --- Injects recebidos de ChatWindow ---
const useChat = inject("useChat");
const currentTheme = inject("currentTheme");
// --------------------------------------

// --- Seção que controla o estado das telas ---
const handlerOpenCreateOrEdit = () => {
  if (typeof useChat.openCreateOrEdit !== "function") return;
  useChat.openCreateOrEdit("create");
};

const openChat = (att) => {
  if (typeof useChat.selectChatToOpen !== "function") return;
  useChat.selectChatToOpen(att);
};
// ---------------------------------------------

// --- Map para retornar o status dos atendentes ---
const getStatusStyle = (status, groupLength) => {
  const darkColor = "black";
  const lightColor = "rgb(209 213 219)";

  const getOfflineColor = () => {
    return currentTheme.value === "dark" ? darkColor : lightColor;
  };

  const mountStyle = {
    Busy: {
      indicatorStyle: { backgroundColor: "rgb(239 68 68)" },
      textStyle: { color: "rgb(252 165 165)" },
      label: "Ocupado",
    },
    Online: {
      indicatorStyle: { backgroundColor: "rgb(34 197 94)" },
      textStyle: { color: "rgb(134 239 172)" },
      label: "Online",
    },
    Away: {
      indicatorStyle: { backgroundColor: "rgb(234 179 8)" },
      textStyle: { color: "rgb(250 204 21)" },
      label: "Ausente",
    },
    Offline: {
      indicatorStyle: { backgroundColor: "rgb(107 114 128)" },
      textStyle: { color: getOfflineColor() },
      label: "Offline",
    },
    null: {
      indicatorStyle: { backgroundColor: "rgb(107 114 128)" },
      textStyle: { color: getOfflineColor() },
      label: "Offline",
    },
  };

  return (
    mountStyle[status] || {
      indicatorStyle: { backgroundColor: "rgb(107 114 128)" },
      textStyle: { color: getOfflineColor() },
      label: groupLength ? `Grupo • ${groupLength} membros` : "Grupo",
    }
  );
};
// -------------------------------------------------
</script>

<template>
  <ul class="atendentes-list hide-scrollbar bg-base-300">
    <!-- Mensagem de ausência de atendentes -->
    <li
      v-if="content.length === 0"
      class="h-full flex items-center justify-center flex-col gap-4 text-center"
    >
      <div
        class="border-2 rounded-full size-16 flex items-center justify-center"
      >
        <svg
          v-if="isGroup"
          class="w-6 h-6 text-white dark:text-gray-600"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            fill-rule="evenodd"
            d="M12 6a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm-1.5 8a4 4 0 0 0-4 4 2 2 0 0 0 2 2h7a2 2 0 0 0 2-2 4 4 0 0 0-4-4h-3Zm6.82-3.096a5.51 5.51 0 0 0-2.797-6.293 3.5 3.5 0 1 1 2.796 6.292ZM19.5 18h.5a2 2 0 0 0 2-2 4 4 0 0 0-4-4h-1.1a5.503 5.503 0 0 1-.471.762A5.998 5.998 0 0 1 19.5 18ZM4 7.5a3.5 3.5 0 0 1 5.477-2.889 5.5 5.5 0 0 0-2.796 6.293A3.501 3.501 0 0 1 4 7.5ZM7.1 12H6a4 4 0 0 0-4 4 2 2 0 0 0 2 2h.5a5.998 5.998 0 0 1 3.071-5.238A5.505 5.505 0 0 1 7.1 12Z"
            clip-rule="evenodd"
          />
        </svg>

        <svg
          v-else
          class="w-6 h-6 text-white dark:text-gray-600"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            fill-rule="evenodd"
            d="M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2 9a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1a4 4 0 0 0-4-4h-4Z"
            clip-rule="evenodd"
          />
        </svg>
      </div>

      <p class="text-sm font-sans text-gray-500">
        {{
          isGroup
            ? "não há grupos disponíveis"
            : "não há atendentes disponíveis"
        }}
      </p>
    </li>

    <!-- Itens da lista de atendentes -->
    <li
      v-for="att in content"
      :key="att.id"
      @click="openChat(att)"
      :class="['atendente-item', att.isMoved ? 'moved' : '']"
      class="border-b even:bg-base-300 bg-blue-400/10 border-base-200 hover:bg-base-200 relative"
    >
      <!-- Informações principais do atendente -->
      <section class="atendente-main">
        <div
          style="background-color: rgba(2, 169, 219, 0.3)"
          class="relative rounded-full"
        >
          <div class="size-10" v-if="att.photo">
            <Avatar :url="att.photo" />
          </div>

          <Avatar v-else :url="att.photo">
            <div class="flex items-center justify-center mt-0.5 mr-0.8">
              <svg
                v-if="isGroup"
                style="margin-left: 0.15rem"
                class="size-8 mt-0.5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fill-rule="evenodd"
                  d="M12 6a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm-1.5 8a4 4 0 0 0-4 4 2 2 0 0 0 2 2h7a2 2 0 0 0 2-2 4 4 0 0 0-4-4h-3Zm6.82-3.096a5.51 5.51 0 0 0-2.797-6.293 3.5 3.5 0 1 1 2.796 6.292ZM19.5 18h.5a2 2 0 0 0 2-2 4 4 0 0 0-4-4h-1.1a5.503 5.503 0 0 1-.471.762A5.998 5.998 0 0 1 19.5 18ZM4 7.5a3.5 3.5 0 0 1 5.477-2.889 5.5 5.5 0 0 0-2.796 6.293A3.501 3.501 0 0 1 4 7.5ZM7.1 12H6a4 4 0 0 0-4 4 2 2 0 0 0 2 2h.5a5.998 5.998 0 0 1 3.071-5.238A5.505 5.505 0 0 1 7.1 12Z"
                  clip-rule="evenodd"
                />
              </svg>

              <svg
                v-else
                style="margin-left: 0.15rem"
                class="size-8 mt-0.5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fill-rule="evenodd"
                  d="M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2 9a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1a4 4 0 0 0-4-4h-4Z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
          </Avatar>

          <div
            v-if="!isGroup"
            style="right: 0px; bottom: 0px"
            :class="['status-indicator absolute']"
            :style="
              getStatusStyle(att.login_status, att?.participants?.length)
                .indicatorStyle
            "
          ></div>
        </div>

        <span>
          <h1 class="">{{ att.name }}</h1>

          <p
            :style="
              getStatusStyle(att.login_status, att?.participants?.length)
                .textStyle
            "
            class="atendente-name"
          >
            <a :class="currentTheme === 'dark' ? '' : 'opacity-50'">
              {{
                getStatusStyle(att.login_status, att?.participants?.length)
                  .label
              }}
            </a>
          </p>
        </span>
      </section>

      <!-- Indicador de status -->
      <footer class="flex items-center gap-4">
        <span v-if="att.internal_chat.unread > 0" class="message-indicator">
          {{ att.internal_chat.unread }}
        </span>
      </footer>

      <!-- Indicador de "conversar" no hover -->
      <div class="hover-action">Conversar</div>
    </li>
  </ul>

  <!-- Botão de criar grupo -->
  <button
    class="create-group-button bg-base-300 hover:bg-primary border-primary text-primary"
    v-if="!loader && isGroup"
    @click="handlerOpenCreateOrEdit()"
    aria-label="Criar grupo"
  >
    <span class="create-group-label">Criar grupo</span>
    <span class="create-group-icon" aria-hidden="true">
      <svg
        class="size-6"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 15 14"
        fill="currentColor"
      >
        <path
          d="M11 7.99951C12.6568 7.99951 13.9998 9.3428 14 10.9995C14 12.6564 12.6569 13.9995 11 13.9995C9.3431 13.9995 8 12.6564 8 10.9995C8.00022 9.3428 9.34323 7.99951 11 7.99951ZM11 9.42725C10.9204 9.42725 10.8443 9.45888 10.7881 9.51514C10.7318 9.5714 10.7002 9.64749 10.7002 9.72705V10.6997H9.72754C9.64797 10.6997 9.57091 10.7313 9.51465 10.7876C9.45852 10.8438 9.42686 10.9201 9.42676 10.9995C9.42676 11.0791 9.45839 11.1561 9.51465 11.2124C9.57091 11.2687 9.64798 11.3003 9.72754 11.3003H10.7002V12.2729C10.7002 12.3525 10.7319 12.4286 10.7881 12.4849C10.8443 12.5411 10.9205 12.5728 11 12.5728C11.0795 12.5728 11.1557 12.5411 11.2119 12.4849C11.2681 12.4286 11.2998 12.3525 11.2998 12.2729V11.3003H12.2725C12.352 11.3003 12.4291 11.2687 12.4854 11.2124C12.5416 11.1561 12.5732 11.0791 12.5732 10.9995C12.5731 10.9201 12.5415 10.8438 12.4854 10.7876C12.4291 10.7313 12.352 10.6997 12.2725 10.6997H11.2998V9.72705C11.2998 9.64749 11.2682 9.5714 11.2119 9.51514C11.1557 9.45888 11.0796 9.42725 11 9.42725ZM8.625 7.50049C8.75546 7.50049 8.88472 7.51114 9.0127 7.52783C7.81025 8.21758 7.00015 9.51391 7 10.9995C7.00001 11.3446 7.04378 11.68 7.12598 11.9995H4.875C4.47733 11.9995 4.09573 11.8421 3.81445 11.561C3.53317 11.2798 3.37502 10.8973 3.375 10.4995C3.37513 9.7041 3.69144 8.94088 4.25391 8.37842C4.81649 7.81602 5.57949 7.50049 6.375 7.50049H8.625ZM3.8252 6.00049C3.92718 6.20013 4.04571 6.39131 4.17871 6.57178C3.47999 6.96241 2.89804 7.53261 2.49316 8.22314C2.0884 8.91353 1.87473 9.69923 1.875 10.4995H1.5C1.10231 10.4995 0.720731 10.3422 0.439453 10.061C0.158267 9.77986 0.000133157 9.39811 0 9.00049C0 8.2049 0.316324 7.44099 0.878906 6.87842C1.44148 6.31605 2.20451 6.00049 3 6.00049H3.8252ZM12 6.00049C12.7955 6.00049 13.5585 6.31605 14.1211 6.87842C14.6837 7.44099 15 8.2049 15 9.00049C14.9999 9.26491 14.9283 9.52124 14.7988 9.74658C14.3222 8.30098 13.0442 7.22072 11.4902 7.03076C11.2822 6.85894 11.0587 6.7045 10.8213 6.57178C10.9543 6.39131 11.0728 6.20013 11.1748 6.00049H12ZM7.5 1.50049C8.19619 1.50049 8.86416 1.77679 9.35645 2.26904C9.84868 2.76129 10.125 3.42937 10.125 4.12549C10.1249 4.82139 9.84845 5.48879 9.35645 5.98096C8.86417 6.47319 8.19617 6.75049 7.5 6.75049C7.15529 6.75049 6.81359 6.6822 6.49512 6.55029C6.17678 6.41839 5.88722 6.2246 5.64355 5.98096C5.39999 5.73731 5.20705 5.44767 5.0752 5.12939C4.94337 4.81107 4.87503 4.47002 4.875 4.12549C4.875 3.78081 4.9433 3.43905 5.0752 3.12061C5.2071 2.80231 5.39992 2.51268 5.64355 2.26904C5.88719 2.02542 6.17682 1.83259 6.49512 1.70068C6.8136 1.56877 7.15528 1.50049 7.5 1.50049ZM4.27539 0.00439453C4.75237 0.0318198 5.21314 0.188708 5.60742 0.458496C4.77299 0.888977 4.11076 1.5917 3.72949 2.44971C3.34824 3.3078 3.27087 4.2704 3.51074 5.17822C2.93768 5.04016 2.42723 4.71353 2.0625 4.25049C1.69784 3.78747 1.49997 3.21485 1.5 2.62549C1.49989 2.14763 1.63021 1.67828 1.87695 1.26904C2.12371 0.859923 2.47779 0.526133 2.90039 0.303223C3.32301 0.0803171 3.79837 -0.0229799 4.27539 0.00439453ZM10.4512 0.0356445C10.8309 -0.0261991 11.2197 -0.00395918 11.5898 0.101074C11.96 0.206149 12.3031 0.39091 12.5938 0.643066C12.8844 0.895214 13.1162 1.20846 13.2725 1.56006C13.4287 1.91163 13.5057 2.29359 13.498 2.67822C13.4904 3.06286 13.3976 3.44154 13.2275 3.78662C13.0575 4.1315 12.8139 4.43501 12.5137 4.67529C12.2136 4.91544 11.8638 5.0859 11.4902 5.17627C11.728 4.26901 11.6504 3.3078 11.2695 2.45068C10.8883 1.59293 10.2262 0.889932 9.39258 0.458496C9.71014 0.241574 10.0716 0.0974964 10.4512 0.0356445Z"
          fill="currentColor"
        />
      </svg>
    </span>
  </button>
</template>

<style scoped>
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

/* Animação ao passar o mouse */
.atendente-item:hover .hover-action {
  right: 10px;
}

.atendente-main {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.atendente-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  @apply text-xs;
}

.atendente-item {
  transition:
    transform 0.3s ease,
    background-color 0.3s ease;
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

/* Lista de atendentes ocupa o espaço disponível */
.atendentes-list {
  flex-grow: 1;
  /* Faz a lista ocupar o espaço restante */
  list-style: none;
  overflow-y: auto;
  /* Habilita rolagem se houver muitos atendentes */
  height: 100%;
}

.message-indicator {
  background-color: rgb(34 197 94);
  color: white;
  padding: 0.5rem;
  padding-top: 0px;
  padding-bottom: 0px;
  border-radius: 9999px;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

/* --- Classe para esconder a barra de rolagem, mantendo a rolagem funcional --- */
.hide-scrollbar {
  -ms-overflow-style: none; /* IE 10+ */
  scrollbar-width: none; /* Firefox */
}

/* --- Chrome, Edge (Blink), Safari, Opera --- */
.hide-scrollbar::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}

.create-group-button {
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: visible;
  gap: 0;
  min-width: 3rem;
  height: 3rem;
  padding: 0.75rem;
  transform: translateY(0);
  @apply shadow-lg border rounded-full absolute bottom-4 right-4 cursor-pointer transition-all duration-300 ease-out;
}

.create-group-button:hover,
.create-group-button:focus-visible {
  gap: 0.75rem;
  padding-left: 1rem;
  padding-right: 0.875rem;
  transform: translateY(-2px);
  @apply text-white;
}

.create-group-button:active {
  transform: scale(0.97);
}

.create-group-label {
  max-width: 0;
  overflow: hidden;
  opacity: 0;
  color: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
  pointer-events: none;
  transform: translateX(0.35rem);
  transition:
    max-width 0.3s ease,
    opacity 0.2s ease,
    transform 0.3s ease;
}

.create-group-button:hover .create-group-label,
.create-group-button:focus-visible .create-group-label {
  max-width: 8rem;
  opacity: 1;
  transform: translateX(0);
}

.create-group-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
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

/* Carregando */
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.spinner {
  animation: spin 1s linear infinite;
  height: 32px;
  width: 32px;
  color: #f3f4f6;
}

/* Animação de rotação */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
