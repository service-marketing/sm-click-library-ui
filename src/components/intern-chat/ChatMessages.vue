<template>
  <div class="messages-container bg-base-300">
    <!-- Cabeçalho -->
    <div class="header-intern bg-base-300">
      <button @click="$emit('voltar')" class="back-button">
        <svg
          class="w-6 h-6"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M14.502 7.046h-2.5v-.928a2.122 2.122 0 0 0-1.199-1.954 1.827 1.827 0 0 0-1.984.311L3.71 8.965a2.2 2.2 0 0 0 0 3.24L8.82 16.7a1.829 1.829 0 0 0 1.985.31 2.121 2.121 0 0 0 1.199-1.959v-.928h1a2.025 2.025 0 0 1 1.999 2.047V19a1 1 0 0 0 1.275.961 6.59 6.59 0 0 0 4.662-7.22 6.593 6.593 0 0 0-6.437-5.695Z"
          />
        </svg>
      </button>
      <Avatar :url="selectedAtendente.photo" />
      <h3 class="atendente-name">{{ selectedAtendente.name }}</h3>
    </div>

    <!-- Área de mensagens -->
    <div class="message-area" ref="chatArea">
      <v3-infinite-loading
        v-if="!isLoading && hasNextPage && mounted"
        @infinite="loadMoreMessages"
        :distance="30"
        :top="true"
        direction="top"
        class="p-3"
      >
        <template #complete>
          <span></span>
        </template>
        <template #spinner>
          <div class="loading">
            <svg
              class="spinner"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              ></path>
            </svg>
          </div>
        </template>
      </v3-infinite-loading>

      <!-- Mensagens -->
      <div>
        <div v-for="(msg, index) in mensagens" :key="index">
          <!-- Exibir separador de datas -->
          <div
            v-if="shouldShowDateSeparator(index)"
            class="date-separator bg-base-100/50"
          >
            <div class="date-separator-line"></div>
            <div class="date-separator-text">
              {{ formatDateSeparator(msg.created_at) }}
            </div>
            <div class="date-separator-line"></div>
          </div>

          <!-- Mensagem -->
          <div
            :class="[
              'message',
              {
                me: msg.sender.id === attendant.id,
                'not-me': msg.sender.id !== attendant.id,
                'new-message': index === mensagens.length - 1,
              },
            ]"
          >
            <div
              :class="
                msg.sender.id === attendant.id ? 'text-right' : 'text-left'
              "
            >
              <div
                class="shadow shadow-gray-900 dark:shadow-gray-500"
                :class="[
                  'message-content',
                  {
                    me: msg.sender.id === attendant.id,
                    'not-me': msg.sender.id !== attendant.id,
                  },
                ]"
              >
                {{ msg.content.content }}
                <div class="message-time">
                  {{ formatMessageTime(msg.created_at) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Área de input e botão de enviar -->
    <div class="input-area">
      <textarea
        type="text"
        v-model="novaMensagem"
        class="message-input bg-base-300 focus:ring-0"
        placeholder="Digite sua mensagem..."
        @keydown="handleKeydown"
      />
      <button @click="handleButtonClick" class="send-button">Enviar</button>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, computed, watch } from "vue";
import V3InfiniteLoading from "v3-infinite-loading";
import { format, isToday, isYesterday, isThisWeek } from "date-fns";
import { ptBR } from "date-fns/locale"; // Para formatação em português
import Avatar from "./Avatar.vue";

const props = defineProps({
  selectedAtendente: { type: Object, required: true },
  attendant: { required: true },
  loadMessagesForAtendente: { type: Function, required: true }, // Recebe do pai
  sendMessageToAtendente: { type: Function, required: true }, // Recebe do pai
  hasNextPageForAtendente: { type: Function, required: true }, // Recebe do pai,
  sendMessageToAtendente: { type: Function, required: true },
});

const novaMensagem = ref("");
const chatArea = ref(null);
const mounted = ref(false);

const isLoading = ref(false);
const mensagens = computed(() => {
  return props.selectedAtendente?.messages || [];
});

const hasNextPage = computed(() =>
  props.hasNextPageForAtendente(props.selectedAtendente.id),
);
const formatMessageTime = (dateStr) => {
  const date = new Date(dateStr);
  // Obtém a hora local ajustada automaticamente pelo navegador
  const localHours = date.getHours();
  const localMinutes = date.getMinutes();
  // Formata para 'HH:mm'
  return `${localHours.toString().padStart(2, "0")}:${localMinutes.toString().padStart(2, "0")}`;
};

const formatDateSeparator = (dateStr) => {
  const date = new Date(dateStr);

  if (isToday(date)) {
    return "Hoje";
  } else if (isYesterday(date)) {
    return "Ontem";
  } else if (isThisWeek(date)) {
    return format(date, "EEEE", { locale: ptBR }); // Dia da semana
  } else {
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }); // Data completa
  }
};

const shouldShowDateSeparator = (index) => {
  if (index === 0) return true;
  const currentMessageDate = new Date(mensagens.value[index].created_at);
  const previousMessageDate = new Date(mensagens.value[index - 1].created_at);

  return (
    currentMessageDate.toDateString() !== previousMessageDate.toDateString()
  );
};

const handleKeydown = (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    enviarMensagem();
  }
};

const scrollToBottom = () => {
  if (chatArea.value) {
    chatArea.value.scrollTo({
      top: chatArea.value.scrollHeight,
      behavior: "instant",
    });
  }
};

const loadMoreMessages = async ($state) => {
  try {
    if (!hasNextPage.value) {
      $state.complete();
      return;
    }

    // Captura a altura anterior do scroll e a posição anterior do scroll
    const previousScrollHeight = chatArea.value.scrollHeight;
    const previousScrollTop = chatArea.value.scrollTop;

    // Carrega mais mensagens
    await props.loadMessagesForAtendente(props.selectedAtendente.id);

    // Aguarda a renderização das novas mensagens
    await nextTick();

    // Ajusta a posição do scroll de forma relativa ao aumento do scrollHeight
    chatArea.value.scrollTop =
      chatArea.value.scrollHeight -
      previousScrollHeight +
      previousScrollTop -
      32;

    $state.loaded();
  } catch (error) {
    console.error(error);
    $state.complete();
  }
};

const enviarMensagem = async () => {
  if (novaMensagem.value.trim() !== "") {
    try {
      const newMessage = JSON.parse(JSON.stringify(novaMensagem.value));
      novaMensagem.value = "";
      await props.sendMessageToAtendente(
        props.selectedAtendente.id,
        newMessage,
        props.attendant,
      );
      await nextTick();
      scrollToBottom();
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    }
  }
};

const handleButtonClick = () => {
  enviarMensagem();
  const button = document.querySelector(".send-button");
  button.classList.add("clicked");
  setTimeout(() => {
    button.classList.remove("clicked");
  }, 200);
};

onMounted(async () => {
  await nextTick(() => {
    scrollToBottom();
    mounted.value = true;
  });
});

watch(
  () => mensagens.value?.length,
  (newVal, oldVal) => {
    if (mensagens.value) {
      const isNearBottom = checkIsNearBottom();
      if (isNearBottom) {
        setTimeout(() => {
          chatArea.value.scrollTo({
            top: chatArea.value.scrollHeight,
            behavior: "instant",
          });
        }, 100);
      }
    }
  },
);

function checkIsNearBottom() {
  const threshold = 80; // pixels do final do scroll considerados "perto do final"
  const position = chatArea.value.scrollTop + chatArea.value.clientHeight;
  const height = chatArea.value.scrollHeight;
  return height - position <= threshold;
}
</script>

<style scoped>
/* Estilos para o messages-container principal */
.messages-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  /* background-color: white; */
  border-radius: 7px;
  /* color: black; */
}

/* Cabeçalho */
.header-intern {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: 52px;
  /* background-color: white; */
  border-radius: 7px 7px 0 0;
  padding: 0.5rem;
  flex-shrink: 0;
}

.back-button {
  /* color: #6b7280; */
  cursor: pointer;
  transition: color 0.3s ease;
}

.back-button:hover {
  color: #3b82f6;
}

.atendente-photo {
  width: 40px;
  height: 40px;
  background-color: #1e3a8a;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.atendente-photo img {
  border-radius: 50%;
  width: 40px;
  height: 40px;
}

.atendente-name {
  font-size: 0.875rem;
}

/* Área de mensagens */
.message-area {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: linear-gradient(
    to top right,
    rgba(59, 107, 184, 0.3),
    rgba(55, 61, 150, 0.5)
  );
  padding: 0.25rem;
  overflow-y: auto;
  position: relative;
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

/* Estilos das mensagens */
.message {
  margin-bottom: 0.25rem;
  /* max-width: 80%; */
  word-wrap: break-word;
  @apply px-2;
}

.message.me {
  text-align: right;
}

.message.not-me {
  text-align: left;
}

.message-content {
  display: inline-block;
  padding: 0.5rem;
  border-radius: 1rem;
  color: black;
}

.message-content.me {
  background-color: #60a5fa;
  /* color: white; */
}

.message-content.not-me {
  background-color: rgba(125, 211, 252, 0.9);
  /* color: black; */
}

.message-time {
  font-size: 0.75rem;
  /* color: #374151; */
  text-align: right;
  margin-top: -0.25rem;
  opacity: 50%;
}

/* Estilos do separador de datas */
.date-separator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0;
  border-radius: 4px;
  margin-top: 0.5rem /* 7px */;
  margin-bottom: 0.5rem /* 7px */;
}

.date-separator-line {
  flex-grow: 1;
  border-top: 2px solid #d1d5db;
  margin-left: 12px;
  margin-right: 12px;
}

.date-separator-text {
  font-size: 1rem;
  font-weight: 600;
  white-space: nowrap;
}

/* Área de input e botão de enviar */
.input-area {
  display: flex;
  align-items: center;
  position: relative;
  width: 100%;
  flex-shrink: 0;
}

.message-input {
  width: 100%;
  /* background-color: white; */
  /* color: black; */
  resize: none;
  padding: 0.5rem;
  height: 56px;
  border: none;
  outline: none;
  padding-right: 80px;
  max-height: 56px;
  min-height: 56px;
  border-radius: 0 0 7px 7px;
  outline: 2px solid transparent;
  outline-offset: 2px;
  border-style: none;
}

.message-input:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
  border-style: none;
  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0
    var(--tw-ring-offset-width) var(--tw-ring-offset-color);
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0
    calc(0px + var(--tw-ring-offset-width)) var(--tw-ring-color);
  box-shadow: var(--tw-ring-offset-shadow);
}

.send-button {
  position: absolute;
  right: 0.5rem;
  top: 0.65rem;
  background-color: #3b82f6;
  color: white;
  padding: 0.3rem 0.7rem;
  border-radius: 9999px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 15px;
}

.send-button:hover {
  background-color: #2563eb;
}

/* Animação para a mensagem */
.new-message {
  /* animation: bounce-in 0.6s ease-in-out; */
}

@keyframes bounce-in {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }

  50% {
    transform: scale(1.1);
    opacity: 1;
  }

  100% {
    transform: scale(1);
  }
}

/* Animação para as mensagens enviadas pelo usuário (vindo da esquerda) */
.message-enter-active {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}

.message.me.new-message {
  transform: translateX(-100%);
  opacity: 0;
  animation: slide-in-left 0.3s forwards ease;
}

@keyframes slide-in-left {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }

  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Animação para as mensagens enviadas por outra pessoa (vindo da direita) */
.message.not-me.new-message {
  transform: translateX(100%);
  opacity: 0;
  animation: slide-in-right 0.3s forwards ease;
}

@keyframes slide-in-right {
  0% {
    transform: translateX(100%);
    opacity: 0;
  }

  100% {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
