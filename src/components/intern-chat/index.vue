<template>
  <div class="fixed bottom-5 right-5">
    <div @click="handleChatClick"
      class="transition-all duration-75 shadow shadow-black/70 ease-in-out bg-blue-500 flex items-center justify-center"
      :class="isChatOpen ? 'w-80 h-96 rounded-lg' : 'w-12 h-12 rounded-full'">
      <span v-if="!isChatOpen" class="text-white cursor-pointer text-2xl">💬</span>

      <transition name="fade" v-if="isChatOpen">
        <div v-if="showContent" class="relative w-full h-full text-white">
          <button @click.stop="toggleChat" class="absolute top-3 right-3 text-gray-300 hover:text-red-500">
            <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
              viewBox="0 0 24 24">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M6 18 17.94 6M18 18 6.06 6" />
            </svg>
          </button>

          <div v-if="selectedAtendente">
            <div class="flex p-2 py-1 items-center gap-2">
              <button @click="selectedAtendente = null" class="top-3 left-4 text-gray-300 hover:text-blue-800">
                <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                  stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div v-if="!selectedAtendente.photo" class="w-9 h-9 bg-gray-400 rounded-full"></div>
              <img v-else :src="selectedAtendente.photo" class="rounded-full bg-gray-400 w-9 h-9" />
              <h3 class="text-lg p- flex justify-center my-auto text-center">{{ selectedAtendente.name }}</h3>
            </div>

            <!-- Área de mensagens com scroll infinito -->
            <div class="flex flex-col h-[276px] bg-gray-100 p-1 overflow-y-auto" ref="chatArea">
              <v3-infinite-loading v-if="hasNextPage" @infinite="loadMoreMessages">
                <template #no-more>
                  <p class="text-center text-gray-500">Não há mais mensagens</p>
                </template>
              </v3-infinite-loading>

              <div v-for="(msg, index) in mensagens" :key="index" class="mb-1">
                <div :class="msg.sender === 'me' ? 'text-right' : 'text-left'">
                  <span
                    :class="msg.sender === 'me' ? 'bg-blue-400 rounded-xl rounded-tr-none text-white' : 'rounded-xl rounded-tl-none bg-gray-300 text-black'"
                    class="inline-block px-3 py-2">
                    {{ msg.content.content }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Campo de entrada para mensagens -->
            <div class="w-full p-3 rounded-b-lg bg-white border-t">
              <div class="flex items-center space-x-2">
                <input v-model="novaMensagem" class="w-full text-black p-2 border rounded-lg focus:outline-none"
                  placeholder="Digite sua mensagem..." />
                <button @click="enviarMensagem"
                  class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">Enviar
                </button>
              </div>
            </div>
          </div>

          <!-- <transition name="fade"> -->
          <div v-if="!selectedAtendente" class="overflow-y-auto h-full">
            <input class="w-full text-black p-3 focus:outline-none border-b rounded-t-lg" placeholder="Antonio Jose" />
            <ul class="space-y- divide-y">
              <li v-for="att in atendentes" :key="att.id" @click="selecionarAtendente(att)"
                class="cursor-pointer justify-between hover:bg-blue-50 p-2 flex items-center bg-white text-gray-700">
                <main class="flex items-center gap-4">
                  <div v-if="!att.photo" class="w-10 h-10 bg-gray-400 rounded-full"></div>
                  <img v-else :src="att.photo" class="rounded-full bg-gray-400 w-10 h-10" />
                  <span class="line-clamp-1">{{ att.name }}</span>
                </main>
                <footer class="pr-2">
                  <div
                    :class="{ 'bg-red-500': att.login_status === 'Busy', 'bg-green-500': att.login_status === 'Online', 'bg-purple-500': att.login_status === 'Undefined', 'bg-yellow-500': att.login_status === 'Away', 'bg-gray-500': att.login_status === 'Offline' }"
                    class="rounded-full w-3 h-3"></div>
                </footer>
              </li>
            </ul>
          </div>
          <!-- </transition> -->
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue';
import axios from 'axios';
import V3InfiniteLoading from 'v3-infinite-loading';
import 'v3-infinite-loading/lib/style.css';
import { v4 as uuidv4 } from 'uuid';

const props = defineProps({
  token: { default: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzI2MzE3MTE3LCJpYXQiOjE3MjYyMzA3MTcsImp0aSI6IjMyMzdkZjRiNDhjNjQwODRhODgxODZkY2RmZTYyNGQzIiwidXNlcl9pZCI6IjU2NWMxMzMxLTZiYjUtNDNmZS1iNDMxLTRkNWRkYzFhOTY2NiJ9.cNap0fZ05Yk9kdV_W4V1ozJwRh74I86J5UFYqI_MYY4', required: true },
  get_attendants: { default: 'http://localhost:8000/v1/api/attendances/attendant/all/' },
  get_internal_chat: { default: 'http://localhost:8000/v1/api/attendances/internal_chat/' }
});

const isChatOpen = ref(false);
const showContent = ref(false);
const selectedAtendente = ref(null);
const novaMensagem = ref("");
const atendentes = ref([]);
const mensagens = ref([]);
const currentPage = ref(1);
const hasNextPage = ref(false);
const channel = ref(null)
const chatArea = ref(null);

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
    selectedAtendente.value = null;
    showContent.value = false;
    mensagens.value = [];
    currentPage.value = 1; // Resetar a página ao fechar o chat
  }
};

const selecionarAtendente = async (atendente) => {
  selectedAtendente.value = atendente;
  mensagens.value = []; // Resetar as mensagens ao selecionar um atendente
  currentPage.value = 1; // Resetar a página ao selecionar um atendente
  await loadMessages();
};

const handleChatClick = () => {
  if (!isChatOpen.value) toggleChat();
};

const loadMessages = async () => {
  try {
    const response = await axios.get(`${props.get_internal_chat}?attendant=${selectedAtendente.value.id}&page=${currentPage.value}`, {
      headers: { Authorization: `Bearer ${props.token}` }
    });
    mensagens.value = response.data.results.reverse(); // Inverter a ordem das mensagens na primeira carga
    hasNextPage.value = response.data.next !== null;
    channel.value = response.data.channel_id;

    // Aguarde a renderização do DOM antes de rolar para o fim
    await nextTick();
    scrollToBottomIfNearEnd();
  } catch (e) {
    console.error(e);
  }
};

const loadMoreMessages = async ($state) => {
  if (hasNextPage.value) {
    currentPage.value++;
    try {
      const response = await axios.get(`${props.get_internal_chat}?attendant=${selectedAtendente.value.id}&page=${currentPage.value}`, {
        headers: { Authorization: `Bearer ${props.token}` }
      });
      mensagens.value = [...mensagens.value, ...response.data.results]; // Adicionar no final
      hasNextPage.value = response.data.next !== null;
      $state.loaded();
    } catch (e) {
      console.error(e);
      $state.complete();
    }
  } else {
    $state.complete();
  }
};


const enviarMensagem = async () => {
  if (novaMensagem.value.trim() !== "") {
    try {
      const response = await axios.post(`${props.get_internal_chat}${channel.value}/message/`, {
        id: uuidv4(),
        content: {
          type: 'text',
          content: novaMensagem.value
        }
      }, {
        headers: { Authorization: `Bearer ${props.token}` }
      });
      mensagens.value.push({ content: {
          type: 'text',
          content: novaMensagem.value
        } })
      novaMensagem.value = "";
      scrollToBottomIfNearEnd();
    } catch (e) {

    }
  }
};

const scrollToBottomIfNearEnd = () => {
  const threshold = 50; // Margem de 50px do final
  const chatElement = chatArea.value;
  if (chatElement.scrollHeight - chatElement.scrollTop <= chatElement.clientHeight + threshold) {
    chatElement.scrollTop = chatElement.scrollHeight;
  }
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
.transition-all {
  transition: all 0.4s ease-in-out;
}

.w-80 {
  width: 20rem;
}

.h-96 {
  height: 24rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
