<template>
  <div
    class="chat-container"
    ref="chatContainer"
    :class="{ 'mobile-chat-container': isMobile }"
  >
    <!-- Mobile -->
    <template v-if="isMobile">
      <div class="chat-content mobile-chat-content">
        <ChatContent
          ref="chatContentRef"
          :isMobile="isMobile"
          :showChatLoading="showChatLoading"
          :selectedAttendant="selectedAttendant"
          :currentAttendant="currentAttendant"
          :isLoadingMessages="loadingMessages"
          :listAttendants="filteredListAttendants"
          :listGroups="listGroups"
          :listAttendancesByGroup="listAttendants"
          v-model:currentList="currentList"
          v-model:searchQuery="searchQuery"
          :sendFilesToAttendant="sendMessageToChannel"
          :loadMessagesForAtendente="loadMessagesByChannel"
          :sendMessageToAtendente="sendMessageToChannel"
          :hasNextPageForAtendente="hasNextPageForChannel"
          :downloadFilesMobile="downloadFilesMobile"
          :openMobilePdf="openMobilePdf"
          @voltar="handleVoltar"
          @send-files="onSendFiles"
        >
          <template #modals>
            <CreateOrEditModal
              v-if="showCreateOrEditModal.show"
              :mode="showCreateOrEditModal.mode"
              :selectedGroup="showCreateOrEditModal.groupData"
              :submitGroup="handleCreateGroup"
              :listAttendances="filteredListAttendants"
              :errorMap="groupActionErrors"
              :isCreatingGroup="isSubmittingGroupAction"
            />
          </template>
        </ChatContent>
      </div>
    </template>

    <!-- Desktop -->
    <template v-else>
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
        v-if="!isChatOpen && countTotalUnreadMessages > 0"
        :style="
          countTotalUnreadMessages > 10
            ? 'padding: 0.2rem 0.500rem;'
            : 'padding: 0.2rem 0.625rem;'
        "
        class="chat-count flex flex-col"
      >
        {{ countTotalUnreadMessages }}
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
          <span v-if="unreadMessagesCount > 0" class="unread-count">{{
            unreadMessagesCount
          }}</span>
          <div class="chat-tooltip">
            <div class="text-sm my-auto text-center">Chat interno</div>
          </div>
        </span>

        <transition name="fade">
          <div v-if="isChatOpen && !isClosing" class="chat-content">
            <ChatContent
              ref="chatContentRef"
              :isMobile="isMobile"
              :showChatLoading="showChatLoading"
              :selectedAttendant="selectedAttendant"
              :currentAttendant="currentAttendant"
              :isLoadingMessages="loadingMessages"
              :listAttendants="filteredListAttendants"
              :listGroups="listGroups"
              :listAttendancesByGroup="listAttendants"
              v-model:currentList="currentList"
              v-model:searchQuery="searchQuery"
              :sendFilesToAttendant="sendMessageToChannel"
              :loadMessagesForAtendente="loadMessagesByChannel"
              :sendMessageToAtendente="sendMessageToChannel"
              :hasNextPageForAtendente="hasNextPageForChannel"
              :downloadFilesMobile="downloadFilesMobile"
              :openMobilePdf="openMobilePdf"
              @voltar="handleVoltar"
              @send-files="onSendFiles"
            >
              <template #modals>
                <CreateOrEditModal
                  v-if="showCreateOrEditModal.show"
                  :mode="showCreateOrEditModal.mode"
                  :selectedGroup="showCreateOrEditModal.groupData"
                  :submitGroup="handleCreateGroup"
                  :listAttendances="filteredListAttendants"
                  :errorMap="groupActionErrors"
                  :isCreatingGroup="isSubmittingGroupAction"
                />
              </template>
            </ChatContent>
          </div>
        </transition>
      </div>
    </template>
  </div>
</template>

<script setup>
import {
  ref,
  onMounted,
  computed,
  watch,
  onBeforeUnmount,
  provide,
  reactive,
  toRef,
} from "vue";
import ChatContent from "./ChatContent.vue";
import { notify } from "notiwind";

const props = defineProps({
  currentAttendant: {
    default: {
      id: "dea5c13f-4464-4cc6-8653-8c8524acdd3b",
      name: "Joao Pedro Souto Santos",
      photo:
        "https://sm-click.s3.us-east-1.amazonaws.com/clients/624dfe23-92d0-43f1-8061-a2321f2b5ebb/listAttendants/dea5c13f-4464-4cc6-8653-8c8524acdd3b.png",
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
          "https://sm-click.s3.us-east-1.amazonaws.com/clients/624dfe23-92d0-43f1-8061-a2321f2b5ebb/listAttendants/dea5c13f-4464-4cc6-8653-8c8524acdd3b.png",
      },
      content: {
        type: "text",
        content: "teste sockdet 3",
      },
      created_at: "2024-09-17T09:45:19.286087Z",
    },
  },
  mode: { type: String, default: "dark" },
  isMobile: { type: Boolean, default: false },
  downloadFilesMobile: { type: Function },
  openMobilePdf: { type: Function },
});

// --- Seção que controla o estado da lista de chats ---
const currentList = ref("atendentes");
const searchQuery = ref("");
const lastSelectedList = ref("atendentes");
const isChatOpen = ref(false);
const selectedAttendant = ref(null);
const chatContainer = ref(null);
const chatContentRef = ref(null);
const isSubmittingGroupAction = ref(false);
const groupActionErrors = ref([]);
// -----------------------------------------------------

// --- importes das funções de controle geral do chat interno ---
import { useChat } from "./useChat";

const {
  showCreateOrEditModal, //Ref que controla a exibição do modal de criação/edição de grupos
  openCreateOrEdit, // função para abrir o modal de criação/edição de grupos
  closeCreateOrEdit, // função para fechar o modal de criação/edição de grupos,
  listGroups, // Ref que contém a lista de grupos do chat interno
  listAttendants,
  loadingMessages,
  loadingAttendants,
  loadingGroupList,
  createGroup,
  fetchGroupChannels,
  fetchMessagesByChannel,
  addMessageToChannel,
  addGroupParticipant,
  leaveGroup,
  removeGroupParticipant,
  hasNextPageForChannel,
  sendMessageToChannel,
  loadMessagesByChannel,
  resetUnreadMessages,
  findEntityByChannelId,
  refreshAttendantsOnListOpen,
} = useChat();
// --------------------------------------------------------------

// --- Função para abrir os chats e mudar para o <chatMessage /> ---
const selectChatToOpen = async (atendente) => {
  const channelId = atendente.internal_chat?.channel_id || atendente.id;

  if (!channelId) {
    console.error("Canal sem channel_id:", atendente);
    return;
  }

  // Garante que, ao sair do chat, o usuário volte para a lista correta.
  lastSelectedList.value = atendente?.is_group ? "grupos" : "atendentes";
  currentList.value = lastSelectedList.value;

  selectedAttendant.value = atendente;
  resetUnreadMessages(channelId);

  // Verifica se precisa buscar mensagens baseado no tipo de entidade
  const hasMessages = atendente.is_group
    ? atendente.chat_info?.messages?.length > 0
    : atendente.messages?.length > 0;

  if (!hasMessages) {
    await fetchMessagesByChannel(channelId);
  }
};

async function handleVoltar() {
  // Ao sair do chat, volta para a lista correspondente ao último chat selecionado.
  await refreshAttendantsOnListOpen();
  currentList.value = lastSelectedList.value;
  selectedAttendant.value = null;
}

function closeSelectedChat() {
  handleVoltar();
}

// --- Seção que passa o provide de funções e dados para os componentes filhos ---
const exportUseChatToChildren = reactive({
  openCreateOrEdit,
  closeCreateOrEdit,
  fetchGroupChannels,
  selectChatToOpen,
  leaveGroup,
  removeGroupParticipant,
  handleVoltar,
  closeSelectedChat,
});

provide("useChat", exportUseChatToChildren);
provide("currentTheme", toRef(props, "mode"));
// -------------------------------------------------------------------------------

// --- Seção que controla o modal de criação/edição de grupos ---
import CreateOrEditModal from "./components/createOrEditModal.vue";

const filteredListAttendants = computed(() => {
  const currentAttendantId = props.currentAttendant?.id;

  const listAttendantsList = Array.isArray(listAttendants.value)
    ? listAttendants.value
    : [];

  const listAttendantsExcludingCurrent = listAttendantsList.filter(
    (att) => att.id !== currentAttendantId,
  );

  return listAttendantsExcludingCurrent || [];
});

const normalizeGroupActionErrors = (error) => {
  const responseData = error?.response?.data;

  if (!responseData) {
    return [
      {
        key: "erro",
        message: "Nao foi possivel concluir a acao do grupo.",
      },
    ];
  }

  if (typeof responseData === "string") {
    return [{ key: "erro", message: responseData }];
  }

  if (Array.isArray(responseData)) {
    return responseData.map((message, index) => ({
      key: `erro-${index + 1}`,
      message: String(message),
    }));
  }

  return Object.entries(responseData).flatMap(([key, value]) => {
    const messages = Array.isArray(value) ? value : [value];

    return messages.map((message, index) => ({
      key: `${key}-${index + 1}`,
      message: String(message),
    }));
  });
};

const handleCreateGroup = async (payload, mode) => {
  groupActionErrors.value = [];
  isSubmittingGroupAction.value = true;

  try {
    const hasSavedGroup = await createGroup(payload, mode);
    return Boolean(hasSavedGroup);
  } catch (error) {
    groupActionErrors.value = normalizeGroupActionErrors(error);
    return false;
  } finally {
    isSubmittingGroupAction.value = false;
  }
};
// --------------------------------------------------------------

watch(
  () => showCreateOrEditModal.value.show,
  (isOpen) => {
    if (isOpen) {
      groupActionErrors.value = [];
      return;
    }

    groupActionErrors.value = [];
    isSubmittingGroupAction.value = false;
  },
);

// --- Seção que lista o total de mensagens não lidas ---
const countTotalUnreadMessages = computed(() => {
  const attendantsUnread = listAttendants.value.reduce((total, att) => {
    return total + (att.internal_chat?.unread || 0);
  }, 0);

  const groupsUnread = listGroups.value.reduce((total, group) => {
    return total + (group.internal_chat?.unread || 0);
  }, 0);

  return attendantsUnread + groupsUnread;
});
// ------------------------------------------------------

const onSendFiles = () => {
  chatContentRef.value?.chooseFiles();
};

const isChatVisible = computed(() => props.isMobile || isChatOpen.value);

const showChatLoading = computed(
  () =>
    loadingMessages.value || loadingGroupList.value || loadingAttendants.value,
);

// Computed property para obter o número de mensagens não lidas
const unreadMessagesCount = computed(() => {
  if (selectedAttendant.value) {
    const atendente = listAttendants.value.find(
      (att) => att.id === selectedAttendant.value.id,
    );
    return atendente ? atendente.internal_chat.unread : 0;
  }
  return 0;
});

const handleClickOutside = (event) => {
  if (props.isMobile) return;

  // Se o clique foi fora do chatContainer, fecha o chat
  const clickedInsideChat = chatContainer.value?.contains(event.target);
  const clickedInsideFancybox = event.target.closest(".fancybox__container");

  if (!clickedInsideChat && !clickedInsideFancybox) {
    if (isChatOpen.value) toggleChat();
  }

  if (showCreateOrEditModal.value && typeof closeCreateOrEdit === "function") {
    closeCreateOrEdit();
  }
};

onMounted(() => {
  if (!props.isMobile) {
    document.addEventListener("click", handleClickOutside);
  }
});

onBeforeUnmount(() => {
  if (!props.isMobile) {
    document.removeEventListener("click", handleClickOutside);
  }
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
  if (props.isMobile) return;

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
  if (props.isMobile) return;
  if (!isChatOpen.value) {
    toggleChat();
    void refreshAttendantsOnListOpen();
  }
};

watch(
  () => props.socketMessage,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      const event = newVal?.message?.event;
      if (!event) return;
      if (event === "new-chat-internal-message") {
        addMessageToChannel(
          newVal,
          isChatVisible.value,
          selectedAttendant.value?.internal_chat?.channel_id,
        );
      } else if (event === "new-chat-internal-group") {
        if (newVal.message.content.action === "add-participant") {
          // addGroupParticipant(newVal.message);
          console.log("Participante adicionado ao grupo:");
        } else if (newVal.message.content.action === "remove-participant") {
          // removeGroupParticipant(newVal.message);
          console.log("Participante removido do grupo:");
        } else if (newVal.message.content.action === "leave-group") {
          console.log("Participante saiu do grupo:");
          // leaveGroup(newVal.message);
        }

        const existingGroup = listGroups.value.find(
          (group) =>
            group.internal_chat?.channel_id ===
            newVal.message.internal_chat?.channel_id,
        );

        if (!existingGroup) {
          listGroups.value.unshift(newVal.message);
        }
      }
    }
  },
);

let loadingToastOpen = false;
watch(
  () => loadingMessages?.value ?? loadingMessages,
  (isLoading) => {
    // Evita empilhar toasts e só mostra enquanto estiver carregando.
    if (isLoading && !loadingToastOpen) {
      loadingToastOpen = true;
      notify(
        {
          group: "info",
          title: "Carregando",
          text: "Carregando mensagens…",
        },
        2000,
      );
    }

    if (!isLoading) {
      loadingToastOpen = false;
    }
  },
);
</script>

<style scoped>
/* Posicionamento fixo do chat no canto inferior direito */
.chat-container {
  position: relative;
}

.mobile-chat-container {
  height: 100%;
}

.mobile-chat-content {
  height: 100%;
}

/* Animação de transição ao abrir e fechar o chat */
.chat-box {
  display: flex;
  align-items: center;
  justify-content: center;
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
