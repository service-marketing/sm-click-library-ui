<template>
    <loading v-if="loadingMessages || loadingAttendants" />
    <div v-else-if="selectedAtendente && !loadingMessages" class="h-full">
        <ChatMessages :attendant="attendant" :selectedAtendente="selectedAtendente" @voltar="selectedAtendente = null"
            :loadMessagesForAtendente="loadMessagesForAtendente" :sendMessageToAtendente="sendMessageToAtendente"
            :hasNextPageForAtendente="hasNextPageForAtendente" />
    </div>

    <ChatList v-if="!selectedAtendente && !loadingAttendants" :attendant="attendant" :atendentes="attendants"
        @atendenteSelecionado="selecionarAtendente" />
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
    if (chatContainer.value && !chatContainer.value.contains(event.target)) {
        // Se o clique foi fora do chatContainer, fecha o chat
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
    background-color: #00799e;
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
    width: 24px;
    height: 24px;
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
    left: 3.5rem;
    /* Left position from the icon */
    border-radius: 0.375rem;
    /* Equivalente a rounded-md */
    background-color: #02a9db;
    opacity: 0;
    /* Hidden by default */
    display: flex;
    justify-content: center;
}

.group:hover .chat-tooltip {
    opacity: 1;
    /* Show tooltip on hover */
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
</style>