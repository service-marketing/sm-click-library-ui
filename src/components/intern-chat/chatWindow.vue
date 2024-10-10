<template>
  <div class="chat-container">
    <button @click.stop="toggleChat" v-if="isChatOpen" class="chat-icon">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
        <path fill="currentColor"
          d="M208 352c114.9 0 208-78.8 208-176S322.9 0 208 0S0 78.8 0 176c0 38.6 14.7 74.3 39.6 103.4c-3.5 9.4-8.7 17.7-14.2 24.7c-4.8 6.2-9.7 11-13.3 14.3c-1.8 1.6-3.3 2.9-4.3 3.7c-.5 .4-.9 .7-1.1 .8l-.2 .2s0 0 0 0s0 0 0 0C1 327.2-1.4 334.4 .8 340.9S9.1 352 16 352c21.8 0 43.8-5.6 62.1-12.5c9.2-3.5 17.8-7.4 25.2-11.4C134.1 343.3 169.8 352 208 352zM448 176c0 112.3-99.1 196.9-216.5 207C255.8 457.4 336.4 512 432 512c38.2 0 73.9-8.7 104.7-23.9c7.5 4 16 7.9 25.2 11.4c18.3 6.9 40.3 12.5 62.1 12.5c6.9 0 13.1-4.5 15.2-11.1c2.1-6.6-.2-13.8-5.8-17.9c0 0 0 0 0 0s0 0 0 0l-.2-.2c-.2-.2-.6-.4-1.1-.8c-1-.8-2.5-2-4.3-3.7c-3.6-3.3-8.5-8.1-13.3-14.3c-5.5-7-10.7-15.4-14.2-24.7c24.9-29 39.6-64.7 39.6-103.4c0-92.8-84.9-168.9-192.6-175.5c.4 5.1 .6 10.3 .6 15.5z" />
      </svg>
    </button>
    <div @click="handleChatClick" :class="isChatOpen ? 'chat-box open bg-base-200' : 'chat-box closed'"
      :style="isChatOpen ? { height: (attendants.length <= 5 ? '500px' : '65vh') } : {}">
      <!-- Ícone de chat com contador de mensagens não lidas -->
      <span v-if="!isChatOpen" class="chat-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
          <path fill="currentColor"
            d="M208 352c114.9 0 208-78.8 208-176S322.9 0 208 0S0 78.8 0 176c0 38.6 14.7 74.3 39.6 103.4c-3.5 9.4-8.7 17.7-14.2 24.7c-4.8 6.2-9.7 11-13.3 14.3c-1.8 1.6-3.3 2.9-4.3 3.7c-.5 .4-.9 .7-1.1 .8l-.2 .2s0 0 0 0s0 0 0 0C1 327.2-1.4 334.4 .8 340.9S9.1 352 16 352c21.8 0 43.8-5.6 62.1-12.5c9.2-3.5 17.8-7.4 25.2-11.4C134.1 343.3 169.8 352 208 352zM448 176c0 112.3-99.1 196.9-216.5 207C255.8 457.4 336.4 512 432 512c38.2 0 73.9-8.7 104.7-23.9c7.5 4 16 7.9 25.2 11.4c18.3 6.9 40.3 12.5 62.1 12.5c6.9 0 13.1-4.5 15.2-11.1c2.1-6.6-.2-13.8-5.8-17.9c0 0 0 0 0 0s0 0 0 0l-.2-.2c-.2-.2-.6-.4-1.1-.8c-1-.8-2.5-2-4.3-3.7c-3.6-3.3-8.5-8.1-13.3-14.3c-5.5-7-10.7-15.4-14.2-24.7c24.9-29 39.6-64.7 39.6-103.4c0-92.8-84.9-168.9-192.6-175.5c.4 5.1 .6 10.3 .6 15.5z" />
        </svg>
        <!-- Exibe o número de mensagens não lidas -->
        <span v-if="unreadMessagesCount > 0" class="unread-count">{{ unreadMessagesCount }}</span>
      </span>

      <transition name="fade" v-if="isChatOpen">
        <div v-if="showContent" class="chat-content">
          <button @click.stop="toggleChat" class="close-button">
            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
              viewBox="0 0 24 24">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M6 18L17.94 6M18 18L6.06 6" />
            </svg>
          </button>
          <loading v-if="loadingMessages || loadingAttendants" />
          <div v-else-if="selectedAtendente && !loadingMessages" class="h-full">
            <ChatMessages :attendant="attendant" :selectedAtendente="selectedAtendente"
              @voltar="selectedAtendente = null" :loadMessagesForAtendente="loadMessagesForAtendente"
              :sendMessageToAtendente="sendMessageToAtendente" :hasNextPageForAtendente="hasNextPageForAtendente" />
          </div>
          <ChatList v-if="!selectedAtendente && !loadingAttendants" :attendant="attendant" :atendentes="attendants"
            @atendenteSelecionado="selecionarAtendente" />
        </div>
      </transition>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import { useChat } from './useChat'; // Importe o composable
import ChatList from './ChatList.vue';
import ChatMessages from './ChatMessages.vue';
import loading from './loading.vue';

const props = defineProps({
  attendant: {
    default: {
      "id": "dea5c13f-4464-4cc6-8653-8c8524acdd3b",
      "name": "Joao Pedro Souto Santos",
      "photo": "https://sm-click.s3.us-east-1.amazonaws.com/clients/624dfe23-92d0-43f1-8061-a2321f2b5ebb/attendants/dea5c13f-4464-4cc6-8653-8c8524acdd3b.png"
    }
  },
  socketMessage: {
    default: {
      id: "6170e5cd-a06f-4184-83a4-debd4bfaab35",
      channel_id: "e10b7177-3400-4457-bb43-b6c9d4a6faa1",
      sender: {
        id: "dea5c13f-4464-4cc6-8653-8c8524acdd3b",
        name: "Joao Pedro Souto Santos",
        photo: "https://sm-click.s3.us-east-1.amazonaws.com/clients/624dfe23-92d0-43f1-8061-a2321f2b5ebb/attendants/dea5c13f-4464-4cc6-8653-8c8524acdd3b.png"
      },
      content: {
        type: "text",
        content: "teste sockdet 3"
      },
      created_at: "2024-09-17T09:45:19.286087Z"
    }
  }
});

const {
  attendants,
  loadingMessages,
  fetchAtendentes,
  fetchMessagesForAtendente,
  addMessageToAtendente,
  hasNextPageForAtendente,
  sendMessageToAtendente,
  loadMessagesForAtendente,
  resetUnreadMessages,
  loadingAttendants
} = useChat();

const isChatOpen = ref(false);
const showContent = ref(false);
const selectedAtendente = ref(null);

// Computed property para obter o número de mensagens não lidas
const unreadMessagesCount = computed(() => {
  if (selectedAtendente.value) {
    const atendente = attendants.value.find(att => att.id === selectedAtendente.value.id);
    return atendente ? atendente.internal_chat.unread : 0;
  }
  return 0;
});

onMounted(async () => {
  await fetchAtendentes();  // Carrega os atendentes
});

const toggleChat = () => {
  isChatOpen.value = !isChatOpen.value;
  if (isChatOpen.value && selectedAtendente.value) {
    resetUnreadMessages(selectedAtendente.value.id); // Reseta as mensagens não lidas ao abrir o chat
  }
};

const handleChatClick = () => {
  if (!isChatOpen.value) toggleChat();
};

const selecionarAtendente = async (atendente) => {
  selectedAtendente.value = atendente;
  resetUnreadMessages(atendente.id); // Reseta as mensagens não lidas ao selecionar o atendente

  // Verifica se o 'messages' é null, undefined ou um array vazio antes de buscar mensagens
  if (!atendente.hasNextPage) {
    await fetchMessagesForAtendente(atendente.id);
  }
};


watch(() => props.socketMessage, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    addMessageToAtendente(newVal, isChatOpen.value, selectedAtendente.value?.id);
  }
});

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
  bottom: 20px;
  right: 20px;
}

/* Animação de transição ao abrir e fechar o chat */
.chat-box {
  display: flex;
  align-items: center;
  justify-content: center;
  /* box-shadow: 0 0 15px rgba(0, 0, 0, 0.7); */
  cursor: pointer;
  transition: all 0.4s ease-in-out;
}

.chat-box.open {
  width: 400px;
  position: absolute;
  height: 65vh;
  /* Define a altura automática */
  max-height: 65vh;
  /* Limita a altura máxima a 65% da tela */
  min-height: 350px;
  /* Define a altura mínima como 350px */
  border-radius: 20px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.7);
  cursor: default;
  translate: 3rem;
  @apply -bottom-20
}


.chat-box.closed {
  width: 48px;
  height: 48px;
  /* background-color: #3b82f6; */
  border-radius: 50%;
  position: relative;
}

.chat-box.closed:hover {
  background-color: #235097;
}

/* Ícone de mensagem */
.chat-icon {
  color: white;
  font-size: 2rem;
  width: 28px;
  height: 28px;
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

/* Animações de transição de opacidade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
