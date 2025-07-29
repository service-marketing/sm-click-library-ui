<template>
  <div class="chat-container" ref="chatContainer">
    <div
      @click.stop="toggleChat"
      v-if="isChatOpen"
      style="
        width: 42px;
        height: 42px;
        border-radius: 50%;
        background-color: #02a9db;
        display: flex;
        justify-content: center;
      "
    >
      <span
        style="margin-top: auto; margin-bottom: auto"
        class="chat-icon my-auto"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
          <path
            fill="currentColor"
            d="M208 352c114.9 0 208-78.8 208-176S322.9 0 208 0S0 78.8 0 176c0 38.6 14.7 74.3 39.6 103.4c-3.5 9.4-8.7 17.7-14.2 24.7c-4.8 6.2-9.7 11-13.3 14.3c-1.8 1.6-3.3 2.9-4.3 3.7c-.5 .4-.9 .7-1.1 .8l-.2 .2s0 0 0 0s0 0 0 0C1 327.2-1.4 334.4 .8 340.9S9.1 352 16 352c21.8 0 43.8-5.6 62.1-12.5c9.2-3.5 17.8-7.4 25.2-11.4C134.1 343.3 169.8 352 208 352zM448 176c0 112.3-99.1 196.9-216.5 207C255.8 457.4 336.4 512 432 512c38.2 0 73.9-8.7 104.7-23.9c7.5 4 16 7.9 25.2 11.4c18.3 6.9 40.3 12.5 62.1 12.5c6.9 0 13.1-4.5 15.2-11.1c2.1-6.6-.2-13.8-5.8-17.9c0 0 0 0 0 0s0 0 0 0l-.2-.2c-.2-.2-.6-.4-1.1-.8c-1-.8-2.5-2-4.3-3.7c-3.6-3.3-8.5-8.1-13.3-14.3c-5.5-7-10.7-15.4-14.2-24.7c24.9-29 39.6-64.7 39.6-103.4c0-92.8-84.9-168.9-192.6-175.5c.4 5.1 .6 10.3 .6 15.5z"
          />
        </svg>
      </span>
    </div>
    <section
      v-if="!isChatOpen && countMessages > 0"
      :style="
        countMessages > 10
          ? 'padding: 0.2rem 0.500rem;'
          : 'padding: 0.2rem 0.625rem;'
      "
      class="chat-count"
    >
      {{ countMessages }}
    </section>
    <div
      @click.stop="handleChatClick"
      class="group relative"
      :class="
        isChatOpen
          ? 'chat-box border-base-200 open bg-base-200'
          : 'chat-box closed'
      "
      :style="chatBoxStyle"
    >
      <!-- Ícone de chat com contador de mensagens não lidas -->
      <span v-if="!isChatOpen" class="chat-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
          <path
            :class="
              mode === 'dark' ? 'dark-chat-window-icon' : 'chat-window-icon'
            "
            fill="currentColor"
            d="M208 352c114.9 0 208-78.8 208-176S322.9 0 208 0S0 78.8 0 176c0 38.6 14.7 74.3 39.6 103.4c-3.5 9.4-8.7 17.7-14.2 24.7c-4.8 6.2-9.7 11-13.3 14.3c-1.8 1.6-3.3 2.9-4.3 3.7c-.5 .4-.9 .7-1.1 .8l-.2 .2s0 0 0 0s0 0 0 0C1 327.2-1.4 334.4 .8 340.9S9.1 352 16 352c21.8 0 43.8-5.6 62.1-12.5c9.2-3.5 17.8-7.4 25.2-11.4C134.1 343.3 169.8 352 208 352zM448 176c0 112.3-99.1 196.9-216.5 207C255.8 457.4 336.4 512 432 512c38.2 0 73.9-8.7 104.7-23.9c7.5 4 16 7.9 25.2 11.4c18.3 6.9 40.3 12.5 62.1 12.5c6.9 0 13.1-4.5 15.2-11.1c2.1-6.6-.2-13.8-5.8-17.9c0 0 0 0 0 0s0 0 0 0l-.2-.2c-.2-.2-.6-.4-1.1-.8c-1-.8-2.5-2-4.3-3.7c-3.6-3.3-8.5-8.1-13.3-14.3c-5.5-7-10.7-15.4-14.2-24.7c24.9-29 39.6-64.7 39.6-103.4c0-92.8-84.9-168.9-192.6-175.5c.4 5.1 .6 10.3 .6 15.5z"
          />
        </svg>
        <!-- Exibe o número de mensagens não lidas -->
        <span v-if="unreadMessagesCount > 0" class="unread-count">{{
          unreadMessagesCount
        }}</span>
        <div class="chat-tooltip">
          <div class="text-sm my-auto text-center">Chat interno</div>
        </div>
      </span>

      <transition name="fade">
        <div v-if="isChatOpen && !isClosing" class="chat-content">
          <button @click.stop="toggleChat" class="close-button">
            <svg
              class="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L17.94 6M18 18L6.06 6"
              />
            </svg>
          </button>
          <loading v-if="loadingMessages || loadingAttendants" />
          <div v-else-if="selectedAtendente && !loadingMessages" class="h-full">
            <DropFilesArea
              ref="dropFilesRef"
              :attendant="attendant"
              :selectedAttendant="selectedAtendente"
              :sendFilesToAttendant="sendMessageToAtendente"
            >
              <ChatMessages
                :deviceType="deviceType"
                @send-files="onSendFiles"
                :attendant="attendant"
                :selectedAtendente="selectedAtendente"
                @voltar="selectedAtendente = null"
                :loadMessagesForAtendente="loadMessagesForAtendente"
                :sendMessageToAtendente="sendMessageToAtendente"
                :hasNextPageForAtendente="hasNextPageForAtendente"
              />
            </DropFilesArea>
          </div>

          <ChatList
            v-if="!selectedAtendente && !loadingAttendants"
            :attendant="attendant"
            :atendentes="attendants"
            @atendenteSelecionado="selecionarAtendente"
          />
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  onMounted,
  computed,
  watch,
  nextTick,
  onBeforeUnmount,
} from "vue";
import { useChat } from "./useChat"; // Importe o composable
import ChatList from "./ChatList.vue";
import ChatMessages from "./ChatMessages.vue";
import loading from "./loading.vue";
import DropFilesArea from "./dropFilesArea.vue";

const props = defineProps({
  attendant: {
    default: {
      id: "dea5c13f-4464-4cc6-8653-8c8524acdd3b",
      name: "Joao Pedro Souto Santos",
      photo:
        "https://sm-click.s3.us-east-1.amazonaws.com/clients/624dfe23-92d0-43f1-8061-a2321f2b5ebb/attendants/dea5c13f-4464-4cc6-8653-8c8524acdd3b.png",
    },
  },
  socketMessage: {
    default: {
      id: "6170e5cd-a06f-4184-83a4-debd4bfaab35",
      channel_id: "e10b7177-3400-4457-bb43-b6c9d4a6faa1",
      sender: {
        id: "dea5c13f-4464-4cc6-8653-8c8524acdd3b",
        name: "Joao Pedro Souto Santos",
        photo:
          "https://sm-click.s3.us-east-1.amazonaws.com/clients/624dfe23-92d0-43f1-8061-a2321f2b5ebb/attendants/dea5c13f-4464-4cc6-8653-8c8524acdd3b.png",
      },
      content: {
        type: "text",
        content: "teste sockdet 3",
      },
      created_at: "2024-09-17T09:45:19.286087Z",
    },
  },
  countMessages: {
    type: Number,
    default: null,
  },
  mode: { type: String, default: "dark" },
  deviceType: { type: String },
});

const {
  attendants,
  loadingMessages,
  fetchMessagesForAtendente,
  addMessageToAtendente,
  hasNextPageForAtendente,
  sendMessageToAtendente,
  loadMessagesForAtendente,
  resetUnreadMessages,
  loadingAttendants,
} = useChat();

const isChatOpen = ref(false);
const showContent = ref(false);
const selectedAtendente = ref(null);
const chatContainer = ref(null); // Ref para o contêiner do chat
const emit = defineEmits(["unreadMessagesEmit"]);
const dropFilesRef = ref(null);

const onSendFiles = () => {
  dropFilesRef.value?.chooseFiles();
};

// Computed property para obter o número de mensagens não lidas
const unreadMessagesCount = computed(() => {
  if (selectedAtendente.value) {
    const atendente = attendants.value.find(
      (att) => att.id === selectedAtendente.value.id
    );
    return atendente ? atendente.internal_chat.unread : 0;
  }
  return 0;
});

const handleClickOutside = (event) => {
  // Se o clique foi fora do chatContainer, fecha o chat
  const clickedInsideChat = chatContainer.value?.contains(event.target);
  const clickedInsideFancybox = event.target.closest(".fancybox__container");

  if (!clickedInsideChat && !clickedInsideFancybox) {
    if (isChatOpen.value) toggleChat();
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});

const isAnimating = ref(false); // Controla a animação de abertura/fechamento
const isClosing = ref(false); // Controla o estado de fechamento

const chatBoxStyle = computed(() => {
  if (isClosing.value) {
    return {
      position: "absolute",
      width: "42px",
      height: "42px",
      transition: "width 0.2s ease-in, height 0.2s ease-out",
    };
  } else if (isAnimating.value || isChatOpen.value) {
    return {
      position: "absolute",
      width: "400px",
      height: "65vh",
      transition: "width 0.2s ease-in, height 0.2s ease-out",
    };
  } else {
    return {
      position: "relative",
      width: "42px",
      height: "42px",
      transition: "none",
    };
  }
});

const toggleChat = () => {
  if (isChatOpen.value) {
    // Inicia o processo de fechamento
    isClosing.value = true;
    setTimeout(() => {
      isChatOpen.value = false;
      isClosing.value = false; // Remove o estado de fechamento
    }, 200); // Espera a animação de 200ms antes de realmente fechar
  } else {
    // Abre o chat imediatamente
    isChatOpen.value = true;
    isAnimating.value = true;
    setTimeout(() => {
      isAnimating.value = false;
    }, 200); // Duração da animação de abertura
  }
};

const handleChatClick = () => {
  if (!isChatOpen.value) toggleChat();
};

const selecionarAtendente = async (atendente) => {
  const atendent = attendants.value.find((att) => att.id === atendente.id);
  const attendantCount = atendent ? atendent.internal_chat.unread : 0;
  emit("unreadMessagesEmit", attendantCount);

  selectedAtendente.value = atendente;
  resetUnreadMessages(atendente.id); // Reseta as mensagens não lidas ao selecionar o atendente

  // Verifica se o 'messages' é null, undefined ou um array vazio antes de buscar mensagens
  if (!atendente.hasNextPage) {
    await fetchMessagesForAtendente(atendente.id);
  }
};

watch(
  () => props.socketMessage,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      addMessageToAtendente(
        newVal,
        isChatOpen.value,
        selectedAtendente.value?.id
      );
    }
  }
);

watch(isChatOpen, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      showContent.value = true;
    }, 400);
  }
});
</script>

<style scoped>
/* Posicionamento fixo do chat no canto inferior direito */
.chat-container {
  position: relative;
}

/* Animação de transição ao abrir e fechar o chat */
.chat-box {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.chat-box.open {
  width: 400px;
  height: 65vh;
  border-width: 1px;
  max-height: 65vh;
  min-height: 350px;
  border-radius: 8px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.7);
  position: absolute;
  bottom: -5rem;
  /* Move o chat para a direita */
}

.chat-box.closed {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  position: relative;
}

.chat-box.closed:hover {
  background-color: #03b5eb;
}

.chat-box.open {
  transform: translate(2.85rem, 0);
}

@media (min-width: 1280px) {
  .chat-box.open {
    transform: translate(3.45rem, 0);
  }
}

/* Ícone de mensagem */
.chat-icon {
  font-size: 2rem;
  width: 22px;
  height: 22px;
  color: white;
}

/* Contador de mensagens não lidas */
.unread-count {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #32d432;
  color: white;
  border-radius: 50%;
  padding: 0.15rem 0.5rem;
  font-size: 0.8rem;
}

/* Conteúdo do chat */
.chat-content {
  position: relative;
  width: 100%;
  border-radius: 10px;
  height: 100%;
  /* Para manter o conteúdo dentro da caixa */
}

/* Botão de fechar o chat */
.close-button {
  position: absolute;
  top: 12px;
  right: 12px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.close-button:hover {
  color: #ef4444;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.chat-icon {
  position: relative;
}

.chat-tooltip {
  position: absolute;
  color: white;
  pointer-events: none;
  transition: opacity 300ms ease;
  width: 150px;
  padding: 4px 8px;
  top: 0;
  left: 3.5rem; /* Left position from the icon */
  border-radius: 0.375rem; /* Equivalente a rounded-md */
  background-color: #02a9db;
  opacity: 0; /* Hidden by default */
  display: flex;
  justify-content: center;
}

.group:hover .chat-tooltip {
  opacity: 1; /* Show tooltip on hover */
}

.chat-tooltip .text-sm {
  font-size: 0.875rem;
  margin-top: auto;
  margin-bottom: auto;
  text-align: center;
}

.chat-count {
  background-color: #1090b8;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  z-index: 10;
  left: 1.25rem;
  bottom: 1.5rem;
  font-size: 0.9rem;
}

.chat-window-icon {
  color: white;
  transition: color 0.3s ease-in;
}
.dark-chat-window-icon {
  color: #4b5563;
  transition: color 0.3s ease-in;
}
</style>
