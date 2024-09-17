<template>
  <div class="chat-container">
    <div @click="handleChatClick" :class="isChatOpen ? 'chat-box open' : 'chat-box closed'">

      <!-- Ícone do chat (mostrado quando fechado) -->
      <span v-if="!isChatOpen" class="chat-icon">💬</span>

      <!-- Conteúdo do chat (mostrado quando aberto) -->
      <transition name="fade" v-if="isChatOpen">
        <div v-if="showContent" class="chat-content">

          <!-- Botão para fechar o chat -->
          <button @click.stop="toggleChat" class="close-button">
            <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
              fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M6 18L17.94 6M18 18L6.06 6" />
            </svg>
          </button>

          <!-- Componente de mensagens do chat -->
          <loading v-if="chatStore.loadingMessages" />
          <div v-else-if="selectedAtendente && !chatStore.loadingMessages" class="h-full">
            <ChatMessages :attendant="attendant" :selectedAtendente="selectedAtendente" :token="token"
              :getInternalChat="get_internal_chat" @voltar="selectedAtendente = null" />
          </div>

          <!-- Lista de atendentes (mostrada quando nenhum atendente está selecionado) -->
          <div v-if="!selectedAtendente">
            <ChatList :attendant="attendant" :atendentes="attendants" @atendenteSelecionado="selecionarAtendente" />
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>


<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import axios from 'axios';
import ChatList from './ChatList.vue';
import ChatMessages from './ChatMessages.vue';
import { useChatStore } from './chatsStore';
import loading from './loading.vue';

const props = defineProps({
  token: { default: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzI2NjU5NDUwLCJpYXQiOjE3MjY1NzMwNTAsImp0aSI6ImJhODRkMTIwMTNiYjQzYTRiN2JlYmMxYTQ2ZDRkYmE4IiwidXNlcl9pZCI6ImRlYTVjMTNmLTQ0NjQtNGNjNi04NjUzLThjODUyNGFjZGQzYiJ9.sT4tLb9fvFXRt1eZTpmPn2COIRFOdl3yIhyknPBaafE', required: true },
  get_attendants: { default: 'http://localhost:8000/v1/api/attendances/attendant/all/' },
  get_internal_chat: { default: 'http://localhost:8000/v1/api/attendances/internal_chat/' },
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
      channel_id: "16068e36-ec53-4a94-81f9-e3b53678280d",
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
const chatStore = useChatStore();
const isChatOpen = ref(false);
const showContent = ref(false);
const selectedAtendente = ref(null);
const attendants = computed(() => chatStore.attendants);

onMounted(async () => {
  await chatStore.fetchAtendentes(props.token, props.get_attendants);  // Carrega os atendentes
});

const toggleChat = () => {
  isChatOpen.value = !isChatOpen.value;
  if (!isChatOpen.value) {
    // selectedAtendente.value = null;
    // showContent.value = false;
  }
};

const handleChatClick = () => {
  if (!isChatOpen.value) toggleChat();
};

const selecionarAtendente = async (atendente) => {
  selectedAtendente.value = atendente;
  if (!atendente.messages) {  // Se ainda não tiver mensagens carregadas
    await chatStore.fetchMessagesForAtendente(atendente.id, props.token, props.get_internal_chat);
  }
};

watch(isChatOpen, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      showContent.value = true;
    }, 400);
  }
});

const receiveMessage = (message) => {
  chatStore.addMessageToAtendente(message);  // Adiciona a mensagem via store
};

watch(() => props.socketMessage, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    receiveMessage(newVal)
  }
});

</script>

<style scoped>
/* Posicionamento fixo do chat no canto inferior direito */
.chat-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
}

/* Animação de transição ao abrir e fechar o chat */
.chat-box {
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.7);
  cursor: pointer;
  transition: all 0.4s ease-in-out;
}

.chat-box.open {
  width: 350px;
  height: 384px;
  /* 96rem = 384px */
  max-height: 384px;
  background-color: #3b82f6;
  /* Cor azul */
  border-radius: 20px;
  cursor: default;
  overflow: hidden;
}

.chat-box.closed {
  width: 48px;
  height: 48px;
  background-color: #3b82f6;
  /* Cor azul */
  border-radius: 50%;
}

/* Ícone de mensagem */
.chat-icon {
  color: white;
  font-size: 2rem;
}

/* Conteúdo do chat */
.chat-content {
  position: relative;
  width: 100%;
  height: 100%;
  color: white;
}

/* Botão de fechar o chat */
.close-button {
  position: absolute;
  top: 12px;
  right: 12px;
  color: #6b7280;
  /* Cor cinza */
  cursor: pointer;
  transition: color 0.3s ease;
}

.close-button:hover {
  color: #ef4444;
  /* Cor vermelha ao passar o mouse */
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
