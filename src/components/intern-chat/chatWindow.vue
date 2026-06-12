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

      <Teleport :disabled="!isFullscreen" to="body">
        <div
          @click.stop="handleChatClick"
          class="group relative"
          :class="[
            isChatOpen
              ? 'chat-box border-base-200 open bg-base-200'
              : 'chat-box closed',
            wrapperClass,
          ]"
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
              <button
                @click.stop="toggleFullscreen"
                class="fullscreen-btn"
                :title="isFullscreen ? 'Recolher chat' : 'Expandir chat'"
              >
                <svg
                  v-if="!isFullscreen"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="15 3 21 3 21 9" />
                  <polyline points="9 21 3 21 3 15" />
                  <line x1="21" y1="3" x2="14" y2="10" />
                  <line x1="3" y1="21" x2="10" y2="14" />
                </svg>
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="4 14 10 14 10 20" />
                  <polyline points="20 10 14 10 14 4" />
                  <line x1="10" y1="14" x2="3" y2="21" />
                  <line x1="21" y1="3" x2="14" y2="10" />
                </svg>
              </button>
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
      </Teleport>
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
  fullscreenTarget: { type: String, default: "" },
  externalChatOpen: { default: null },
  wrapperClass: { type: String, default: "" },
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
  syncGroupFromSocketEvent,
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
    (att) => att.id !== currentAttendantId
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
  }
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
    loadingMessages.value || loadingGroupList.value || loadingAttendants.value
);

// Computed property para obter o número de mensagens não lidas
const unreadMessagesCount = computed(() => {
  if (selectedAttendant.value) {
    const atendente = listAttendants.value.find(
      (att) => att.id === selectedAttendant.value.id
    );
    return atendente ? atendente.internal_chat.unread : 0;
  }
  return 0;
});

const handleClickOutside = (event) => {
  if (props.isMobile) return;
  if (isFullscreen.value) return;

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
    window.addEventListener("resize", onWindowResize);
  }
});

onBeforeUnmount(() => {
  if (!props.isMobile) {
    document.removeEventListener("click", handleClickOutside);
    window.removeEventListener("resize", onWindowResize);
  }
  resizeObserver?.disconnect();
});

const isAnimating = ref(false);
const isClosing = ref(false);
const isFullscreen = ref(false);
const fullscreenStyle = ref(null);

let resizeObserver = null;

watch(isFullscreen, (active) => {
  if (active && props.fullscreenTarget) {
    const el = document.querySelector(props.fullscreenTarget);
    if (el) {
      resizeObserver = new ResizeObserver(() => {
        fullscreenStyle.value = computeFullscreenStyle();
      });
      resizeObserver.observe(el);
    }
  } else {
    resizeObserver?.disconnect();
    resizeObserver = null;
  }
});

function computeFullscreenStyle() {
  if (!props.fullscreenTarget) return null;
  const el = document.querySelector(props.fullscreenTarget);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return {
    position: "fixed",
    top: r.top + "px",
    left: r.left + "px",
    width: r.width + "px",
    height: r.height + "px",
    bottom: "auto",
    right: "auto",
    zIndex: "45",
    borderRadius: "6px",
    transform: "none",
    maxHeight: "none",
    minHeight: "none",
    boxShadow: "none",
    transition: "none",
  };
}

const chatBoxStyle = computed(() => {
  if (isFullscreen.value && fullscreenStyle.value) {
    return fullscreenStyle.value;
  }
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

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
  fullscreenStyle.value = isFullscreen.value ? computeFullscreenStyle() : null;
};

function onWindowResize() {
  if (isFullscreen.value) {
    fullscreenStyle.value = computeFullscreenStyle();
  }
}

const toggleChat = () => {
  if (props.isMobile) return;

  if (isChatOpen.value) {
    isClosing.value = true;
    isFullscreen.value = false;
    fullscreenStyle.value = null;
    setTimeout(() => {
      isChatOpen.value = false;
      isClosing.value = false;
    }, 200);
  } else {
    isChatOpen.value = true;
    isAnimating.value = true;
    setTimeout(() => {
      isAnimating.value = false;
    }, 200);
  }
};

const handleChatClick = () => {
  if (props.isMobile) return;
  if (!isChatOpen.value) {
    toggleChat();
    void refreshAttendantsOnListOpen();
  }
};

const getSocketGroupChannelId = (message) => {
  if (message?.internal_chat?.channel_id) {
    return message.internal_chat.channel_id;
  }

  if (message?.channel_id?.channel_id) {
    return message.channel_id.channel_id;
  }

  if (typeof message?.channel_id === "string") {
    return message.channel_id;
  }

  if (message?.group_info?.internal_chat?.channel_id) {
    return message.group_info.internal_chat.channel_id;
  }

  return null;
};

const getSocketParticipantIds = (message) => {
  const attendants = message?.content?.body?.attendant;
  if (!Array.isArray(attendants)) return [];

  return attendants
    .map((attendant) =>
      typeof attendant === "string" ? attendant : attendant?.id
    )
    .filter(Boolean);
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
          selectedAttendant.value?.internal_chat?.channel_id
        );
      } else if (event === "new-chat-internal-group") {
        const message = newVal?.message;
        const action =
          message?.content?.type === "system"
            ? message.content?.body?.action
            : null;
        const socketChannelId = getSocketGroupChannelId(message);
        const selectedChannelId =
          selectedAttendant.value?.internal_chat?.channel_id ||
          selectedAttendant.value?.id;
        const removedParticipantIds = getSocketParticipantIds(message);
        const wasCurrentAttendantRemoved =
          (action === "remove-participant" || action === "leave-group") &&
          removedParticipantIds.includes(props.currentAttendant?.id);

        syncGroupFromSocketEvent(newVal);

        if (
          wasCurrentAttendantRemoved &&
          socketChannelId &&
          selectedChannelId === socketChannelId
        ) {
          handleVoltar();
        }
      }
    }
  }
);

watch(
  () => props.externalChatOpen,
  (newVal, oldVal) => {
    if (newVal && newVal !== oldVal && isFullscreen.value) {
      isFullscreen.value = false;
      fullscreenStyle.value = null;
    }
  }
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
        2000
      );
    }

    if (!isLoading) {
      loadingToastOpen = false;
    }
  }
);
</script>

<style scoped>
.chat-container {
  position: relative;
}

.mobile-chat-container {
  height: 100%;
}

.mobile-chat-content {
  height: 100%;
}

.chat-box {
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-box.open {
  width: 400px;
  height: 65vh;
  border-width: 0;
  max-height: 65vh;
  min-height: 350px;
  border-radius: 16px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.32), 0 8px 24px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.06);
  position: absolute;
  bottom: -5rem;
  overflow: hidden;
}

.chat-box.closed {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  position: relative;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.chat-box.closed:hover {
  background-color: var(--primary);
  transform: scale(1.1) translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}

.chat-box.open {
  transform: translate(2.85rem, 0);
}

@media (min-width: 1280px) {
  .chat-box.open {
    transform: translate(3.45rem, 0);
  }
}

.chat-icon {
  font-size: 2rem;
  width: 22px;
  height: 22px;
  color: white;
}

.unread-count {
  position: absolute;
  top: -8px;
  right: -8px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
  border-radius: 50%;
  padding: 0.1rem 0.45rem;
  font-size: 0.75rem;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(22, 163, 74, 0.45);
}

.chat-content {
  position: relative;
  width: 100%;
  border-radius: 16px;
  height: 100%;
}

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
  transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.97) translateY(6px);
}

.chat-icon {
  position: relative;
}

.chat-tooltip {
  position: absolute;
  color: white;
  pointer-events: none;
  transition: opacity 250ms ease;
  width: 150px;
  padding: 4px 8px;
  top: 0;
  left: 2.5rem;
  border-radius: 8px;
  background-color: var(--primary);
  opacity: 0;
  display: flex;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.22);
}

.group:hover .chat-tooltip {
  opacity: 1;
}

.chat-tooltip .text-sm {
  font-size: 0.875rem;
  margin-top: auto;
  margin-bottom: auto;
  text-align: center;
}

.chat-count {
  background-color: var(--primary);
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  z-index: 10;
  left: 1.25rem;
  bottom: 1.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.chat-window-icon {
  color: white;
  transition: color 0.3s ease-in;
}

.dark-chat-window-icon {
  color: #4b5563;
  transition: color 0.3s ease-in;
}

.fullscreen-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 10;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  backdrop-filter: blur(6px);
  color: var(--primary);
  cursor: pointer;
  padding: 4px;
  transition: all 0.2s ease;
}

.fullscreen-btn:hover {
  background: rgba(255, 255, 255, 0.18);
  transform: scale(1.05);
}

.fullscreen-btn svg {
  width: 16px;
  height: 16px;
}
</style>
