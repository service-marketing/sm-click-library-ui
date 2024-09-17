<template>
  <div class="chat-container">
    <div @click="handleChatClick"
      :class="isChatOpen ? 'chat-box open' : 'chat-box closed'">
      
      <!-- Ícone do chat (mostrado quando fechado) -->
      <span v-if="!isChatOpen" class="chat-icon">💬</span>

      <!-- Conteúdo do chat (mostrado quando aberto) -->
      <transition name="fade" v-if="isChatOpen">
        <div v-if="showContent" class="chat-content">
          
          <!-- Botão para fechar o chat -->
          <button @click.stop="toggleChat" class="close-button">
            <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L17.94 6M18 18L6.06 6"/>
            </svg>
          </button>

          <!-- Componente de mensagens do chat -->
          <div v-if="selectedAtendente">
            <ChatMessages
              :selectedAtendente="selectedAtendente"
              :token="token"
              :getInternalChat="get_internal_chat"
              @voltar="selectedAtendente = null"
            />
          </div>

          <!-- Lista de atendentes (mostrada quando nenhum atendente está selecionado) -->
          <div v-if="!selectedAtendente">
            <ChatList
              :atendentes="atendentes"
              @atendenteSelecionado="selecionarAtendente"
            />
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>


<script setup>
import { ref, watch, onMounted } from 'vue';
import axios from 'axios';
import ChatList from './ChatList.vue';
import ChatMessages from './ChatMessages.vue';

const props = defineProps({
  token: { default: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzI2NTc3MTE3LCJpYXQiOjE3MjY0OTA3MTcsImp0aSI6IjliNWJkODhlN2QwZDQxODA5OGYzYjYwYjlkZjQ5ODM4IiwidXNlcl9pZCI6ImRlYTVjMTNmLTQ0NjQtNGNjNi04NjUzLThjODUyNGFjZGQzYiJ9.g-iwAXYNdAnoV2VpiXulNVGJfvg1WsBu1XDxVF7ee8Q', required: true },
  get_attendants: { default: 'http://localhost:8000/v1/api/attendances/attendant/all/' },
  get_internal_chat: { default: 'http://localhost:8000/v1/api/attendances/internal_chat/' }
});

const isChatOpen = ref(false);
const showContent = ref(false);
const selectedAtendente = ref(null);
const atendentes = ref([]);

onMounted(async () => {
  try {
    const response = await axios.get(props.get_attendants, {
      headers: { Authorization: `Bearer ${props.token}` },
    });
    atendentes.value = response.data;
  } catch (e) {
    console.error(e);
  }
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

const selecionarAtendente = (atendente) => {
  selectedAtendente.value = atendente;
};

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
  height: 384px; /* 96rem = 384px */
  max-height: 384px;
  background-color: #3b82f6; /* Cor azul */
  border-radius: 20px;
  cursor: default;
  overflow: hidden;
}

.chat-box.closed {
  width: 48px;
  height: 48px;
  background-color: #3b82f6; /* Cor azul */
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
  color: #6b7280; /* Cor cinza */
  cursor: pointer;
  transition: color 0.3s ease;
}

.close-button:hover {
  color: #ef4444; /* Cor vermelha ao passar o mouse */
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
