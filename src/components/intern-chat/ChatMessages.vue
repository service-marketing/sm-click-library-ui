<template>
    <div class="container">
        <!-- Cabeçalho -->
        <div class="header">
            <button @click="$emit('voltar')" class="back-button">
                <svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor"
                    viewBox="0 0 24 24">
                    <path
                        d="M14.502 7.046h-2.5v-.928a2.122 2.122 0 0 0-1.199-1.954 1.827 1.827 0 0 0-1.984.311L3.71 8.965a2.2 2.2 0 0 0 0 3.24L8.82 16.7a1.829 1.829 0 0 0 1.985.31 2.121 2.121 0 0 0 1.199-1.959v-.928h1a2.025 2.025 0 0 1 1.999 2.047V19a1 1 0 0 0 1.275.961 6.59 6.59 0 0 0 4.662-7.22 6.593 6.593 0 0 0-6.437-5.695Z" />
                </svg>
            </button>
            <div v-if="!selectedAtendente.photo" class="atendente-photo">
                <svg class="w-8 h-8 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor" viewBox="0 0 24 24">
                    <path fill-rule="evenodd"
                        d="M12 2a7 7 0 0 0-7 7 3 3 0 0 0-3 3v2a3 3 0 0 0 3 3h1a1 1 0 0 0 1-1V9a5 5 0 1 1 10 0v7.083A2.919 2.919 0 0 1 14.083 19H14a2 2 0 0 0-2-2h-1a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h1a2 2 0 0 0 1.732-1h.351a4.917 4.917 0 0 0 4.83-4H19a3 3 0 0 0 3-3v-2a3 3 0 0 0-3-3 7 7 0 0 0-7-7Zm1.45 3.275a4 4 0 0 0-4.352.976 1 1 0 0 0 1.452 1.376 2.001 2.001 0 0 1 2.836-.067 1 1 0 1 0 1.386-1.442 4 4 0 0 0-1.321-.843Z"
                        clip-rule="evenodd" />
                </svg>
            </div>
            <img v-else :src="selectedAtendente.photo" class="atendente-photo" />
            <h3 class="atendente-name">{{ selectedAtendente.name }}</h3>
        </div>

        <!-- Área de mensagens -->
        <div class="message-area" ref="chatArea">
            <div v-if="isLoading" class="loading">
                <svg class="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
            </div>

            <!-- Mensagens -->
            <div v-if="!isLoading">
                <v3-infinite-loading v-if="hasNextPage" @infinite="loadMoreMessages" :top="true" direction="top">
                    <template #complete>
                        <span></span>
                    </template>
                    <template #spinner>
                        <div class="loading">
                            <svg class="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                    stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                            </svg>
                        </div>
                    </template>
                </v3-infinite-loading>

                <div v-for="(msg, index) in mensagens" :key="index">
                    <!-- Exibir separador de datas -->
                    <div v-if="shouldShowDateSeparator(index)" class="date-separator">
                        <div class="date-separator-line"></div>
                        <div class="date-separator-text">{{ formatDateSeparator(msg.created_at) }}</div>
                        <div class="date-separator-line"></div>
                    </div>

                    <!-- Mensagem -->
                    <div
                        :class="['message', { 'me': msg.sender === 'me', 'not-me': msg.sender !== 'me', 'new-message': index === mensagens.length - 1 }]">
                        <div :class="msg.sender === 'me' ? 'text-right' : 'text-left'">
                            <div
                                :class="['message-content', { 'me': msg.sender === 'me', 'not-me': msg.sender !== 'me' }]">
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
            <textarea v-model="novaMensagem" class="message-input" placeholder="Digite sua mensagem..."
                @keydown="handleKeydown" />
            <button @click="handleButtonClick" class="send-button">Enviar</button>
        </div>
    </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue';
import axios from 'axios';
import V3InfiniteLoading from 'v3-infinite-loading';
import { v4 as uuidv4 } from 'uuid';
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale'; // Para formatação em português

const props = defineProps({
    selectedAtendente: { type: Object, required: true },
    token: { required: true },
    getInternalChat: { required: true },
});

const novaMensagem = ref('');
const mensagens = ref([]);
const currentPage = ref(1);
const hasNextPage = ref(false);
const channel = ref(null);
const chatArea = ref(null);
const isLoading = ref(true);
const emit = defineEmits(['voltar']);

const formatMessageTime = (dateStr) => {
    const date = new Date(dateStr);
    return format(date, 'HH:mm', { locale: ptBR });
};

const formatDateSeparator = (dateStr) => {
    const date = new Date(dateStr);

    if (isToday(date)) {
        return 'Hoje';
    } else if (isYesterday(date)) {
        return 'Ontem';
    } else if (isThisWeek(date)) {
        return format(date, 'EEEE', { locale: ptBR }); // Dia da semana
    } else {
        return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }); // Data completa
    }
};

const shouldShowDateSeparator = (index) => {
    if (index === 0) return true;
    const currentMessageDate = new Date(mensagens.value[index].created_at);
    const previousMessageDate = new Date(mensagens.value[index - 1].created_at);

    return currentMessageDate.toDateString() !== previousMessageDate.toDateString();
};

const handleKeydown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        enviarMensagem();
    }
};

const scrollToBottom = () => {
    if (chatArea.value) {
        chatArea.value.scrollTop = chatArea.value.scrollHeight;
    }
};

const scrollToBottomIfNearEnd = () => {
    if (chatArea.value) {
        const threshold = 100;
        const distanceFromBottom = chatArea.value.scrollHeight - chatArea.value.scrollTop - chatArea.value.clientHeight;

        // Se estiver dentro do threshold, rolar para o final
        if (distanceFromBottom <= threshold) {
            chatArea.value.scrollTop = chatArea.value.scrollHeight;
        }
    }
};

const loadMessages = async () => {
    try {
        const response = await axios.get(`${props.getInternalChat}?attendant=${props.selectedAtendente.id}&page=${currentPage.value}`, {
            headers: { Authorization: `Bearer ${props.token}` },
        });
        mensagens.value = response.data.results.reverse();
        hasNextPage.value = response.data.next !== null;
        channel.value = response.data.channel_id;
        await nextTick();
        isLoading.value = false;
        setTimeout(() => {
            scrollToBottom();
        }, 0);
    } catch (e) {
        console.error(e);
        isLoading.value = false;
    }
};

const isLoadingMore = ref(false); // Adicionar estado de carregamento

const loadMoreMessages = async ($state) => {
    if (isLoadingMore.value || !hasNextPage.value) {
        return $state.complete(); // Evitar chamadas concorrentes
    }

    isLoadingMore.value = true;  // Definir estado como "carregando"

    const previousScrollHeight = chatArea.value.scrollHeight;
    const previousScrollTop = chatArea.value.scrollTop;

    currentPage.value++;

    try {
        const response = await axios.get(`${props.getInternalChat}?attendant=${props.selectedAtendente.id}&page=${currentPage.value}`, {
            headers: { Authorization: `Bearer ${props.token}` },
        });

        mensagens.value = [...response.data.results.reverse(), ...mensagens.value];
        hasNextPage.value = response.data.next !== null;

        await nextTick();
        chatArea.value.scrollTop = chatArea.value.scrollHeight - previousScrollHeight + previousScrollTop;
        $state.loaded();
    } catch (e) {
        console.error(e);
        $state.complete();
    } finally {
        isLoadingMore.value = false;  // Libere o estado de carregamento
    }
};

const enviarMensagem = async () => {
    if (novaMensagem.value.trim() !== '') {
        try {
            mensagens.value.push({ created_at: new Date().toISOString(), content: { type: 'text', content: novaMensagem.value } });
            const message = JSON.parse(JSON.stringify(novaMensagem.value));
            await nextTick();
            setTimeout(() => {
                scrollToBottomIfNearEnd(); // Rolar para o final se o usuário estiver perto
            }, 0);
            novaMensagem.value = '';
            await axios.post(`${props.getInternalChat}${channel.value}/message/`, {
                id: uuidv4(),
                content: {
                    type: 'text',
                    content: message,
                },
            }, {
                headers: { Authorization: `Bearer ${props.token}` },
            });
        } catch (e) {
            // console.error(e);
        }
    }
};

const handleButtonClick = () => {
    enviarMensagem();
    const button = document.querySelector('.send-button');
    button.classList.add('clicked');
    setTimeout(() => {
        button.classList.remove('clicked');
    }, 200);
};

onMounted(() => {
    loadMessages();
});
</script>

<style scoped>
/* Estilos para o container principal */
.container {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: white;
    color: black;
}

/* Cabeçalho */
.header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    height: 47px;
    background-color: white;
    padding: 0.5rem;
    flex-shrink: 0;
}

.back-button {
    color: #6b7280;
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
    height: 282px;
    background: linear-gradient(to top right, rgba(48, 107, 201, 0.9), rgba(40, 46, 138, 0.8));
    padding: 0.25rem;
    overflow-y: auto;
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
    max-width: 80%;
    word-wrap: break-word;
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
}

.message-content.me {
    background-color: #60a5fa;
    color: white;
}

.message-content.not-me {
    background-color: rgba(125, 211, 252, 0.9);
    color: black;
}

.message-time {
    font-size: 0.75rem;
    color: #374151;
    text-align: right;
    margin-top: -0.25rem;
}

/* Estilos do separador de datas */
.date-separator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0;
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
    color: #f3f4f6;
    white-space: nowrap;
}

/* Área de input e botão de enviar */
.input-area {
    display: flex;
    align-items: center;
    position: relative;
    width: 100%;
}

.message-input {
    width: 100%;
    background-color: white;
    color: black;
    resize: none;
    padding: 0.5rem;
    height: 56px;
    border: none;
    outline: none;
    padding-right: 80px;
    max-height: 56px;
    min-height: 56px;
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
    animation: bounce-in 0.6s ease-in-out;
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
</style>
