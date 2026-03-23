import { computed, ref } from "vue";
import { useAttendantStore } from "~/stores/attendantStore";
import { v4 as uuidv4 } from "uuid";
import api from "~/utils/api";
import { internalChatUrl, managerChatGroup } from "~/utils/systemUrls";

const isSuccessfulStatus = (status) => status >= 200 && status < 300;
const ATTENDANTS_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

const listGroups = ref([]);
const loadingGroupList = ref(false);
const loadingMoreGroupList = ref(false);
const loadedGroupList = ref(false);

const nextPage = ref(null);
const previousPage = ref(null);
const currentPage = ref(1);
let preloadGroupChannelsPromise = null;
let attendantsRefreshStartedAt = null;

const getPageNumberFromNext = (next) => {
  if (!next) return null;

  try {
    const parsedUrl = new URL(
      next,
      window?.location?.origin || "http://localhost",
    );
    const page = Number(parsedUrl.searchParams.get("page"));
    return Number.isFinite(page) && page > 0 ? page : null;
  } catch (error) {
    console.error("Erro ao interpretar a próxima página dos grupos:", error);
    return null;
  }
};

const mergeGroups = (groups = [], replace = false) => {
  if (replace) {
    listGroups.value = groups;
    return;
  }

  const existingGroups = new Map(
    listGroups.value.map((group) => [
      group.internal_chat?.channel_id || group.id,
      group,
    ]),
  );

  groups.forEach((group) => {
    const groupKey = group.internal_chat?.channel_id || group.id;
    existingGroups.set(groupKey, group);
  });

  listGroups.value = Array.from(existingGroups.values());
};

const setGroupPaginationState = (responseData, page) => {
  nextPage.value = responseData?.next ?? null;
  previousPage.value = responseData?.previous ?? null;
  currentPage.value = page;
};

const fetchGroupChannels = async (page = 1, options = {}) => {
  const { force = false } = options;
  const isInitialLoad = page === 1;

  try {
    if (loadedGroupList.value && isInitialLoad && !force) {
      return {
        results: listGroups.value,
        next: nextPage.value,
        previous: previousPage.value,
      };
    }

    if (loadingGroupList.value || loadingMoreGroupList.value) {
      return {
        results: listGroups.value,
        next: nextPage.value,
        previous: previousPage.value,
      };
    }

    if (isInitialLoad) {
      loadingGroupList.value = true;
    } else {
      loadingMoreGroupList.value = true;
    }

    const response = await api.get(`${internalChatUrl}channels/?page=${page}`);

    mergeGroups(response.data?.results || [], isInitialLoad);
    setGroupPaginationState(response.data, page);

    if (isInitialLoad) {
      loadedGroupList.value = true;
    }

    return response.data;
  } catch (error) {
    console.error(error);
    console.error("Erro ao buscar canais de grupo:", JSON.stringify(error));
    throw error;
  } finally {
    if (isInitialLoad) {
      loadingGroupList.value = false;
    } else {
      loadingMoreGroupList.value = false;
    }
  }
};

export const preloadAllGroupChannels = async () => {
  if (preloadGroupChannelsPromise) {
    return preloadGroupChannelsPromise;
  }

  preloadGroupChannelsPromise = (async () => {
    let responseData = await fetchGroupChannels(1, { force: true });

    while (responseData?.next) {
      const nextPageNumber = getPageNumberFromNext(responseData.next);
      if (!nextPageNumber) {
        break;
      }

      responseData = await fetchGroupChannels(nextPageNumber);
    }

    return listGroups.value;
  })();

  try {
    return await preloadGroupChannelsPromise;
  } finally {
    preloadGroupChannelsPromise = null;
  }
};

export function useChat() {
  const attendantStore = useAttendantStore();

  // Estados globais de carregamento usados pelo UI do chat interno
  const loadingMessages = ref(false);
  const loadingMoreMessages = ref(false);
  const loadingAttendants = ref(false);

  const refreshAttendantsOnListOpen = async () => {
    if (loadingAttendants.value) {
      return attendantStore.attendants;
    }

    if (!attendantsRefreshStartedAt) {
      attendantsRefreshStartedAt = Date.now();
      return attendantStore.attendants;
    }

    const shouldRefreshAttendants =
      Date.now() - attendantsRefreshStartedAt >= ATTENDANTS_REFRESH_INTERVAL_MS;

    if (!shouldRefreshAttendants) {
      return attendantStore.attendants;
    }

    try {
      loadingAttendants.value = true;
      await attendantStore.fetchAttendants();
      attendantsRefreshStartedAt = Date.now();
      return attendantStore.attendants;
    } catch (error) {
      console.error("Erro ao atualizar atendentes do chat:", error);
      return attendantStore.attendants;
    } finally {
      loadingAttendants.value = false;
    }
  };

  function getValueByKey(object, key) {
    return object[key];
  }

  // Busca a entidade (atendente ou grupo) pelo channel_id ou id
  const findEntityByChannelId = (channelId) => {
    // Procura primeiro nos atendentes pelo channel_id
    let entity = attendantStore.attendants.find(
      (att) => att.internal_chat?.channel_id === channelId,
    );

    // Se não encontrar, procura nos canais (grupos) pelo channel_id
    if (!entity) {
      entity = listGroups.value.find(
        (ch) => ch.internal_chat?.channel_id === channelId,
      );
    }

    // Se ainda não encontrar, procura nos atendentes pelo id
    if (!entity) {
      entity = attendantStore.attendants.find((att) => att.id === channelId);
    }

    return entity;
  };

  const fetchMessagesByChannel = async (channelId) => {
    const entity = findEntityByChannelId(channelId);
    if (!entity) return;
    try {
      loadingMessages.value = true;

      const url = entity.internal_chat?.channel_id
        ? `${internalChatUrl}messages_by_channel/?channel_id=${entity.internal_chat.channel_id}&page=1`
        : `${internalChatUrl}?attendant=${entity.id}&page=1`;

      const response = await api.get(url);

      // Inicializa chat_info se for um grupo ou messages se for atendente
      if (entity.is_group) {
        entity.chat_info = {
          messages: response.data.results.reverse(),
          hasNextPage: response.data.next !== null,
          currentPage: 2,
        };
      } else {
        entity.messages = response.data.results.reverse();
        entity.hasNextPage = response.data.next !== null;
        entity.currentPage = 2;
      }

      entity.internal_chat = {
        ...entity.internal_chat,
        channel_id:
          response.data.channel_id || entity.internal_chat?.channel_id,
        unread: 0,
      };
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error);
    } finally {
      loadingMessages.value = false;
    }
  };

  const loadMessagesByChannel = async (channelId) => {
    const entity = findEntityByChannelId(channelId);

    // Determina se há próxima página baseado no tipo de entidade
    const hasNext = entity?.is_group
      ? entity.chat_info?.hasNextPage
      : entity?.hasNextPage;

    if (!entity || !hasNext || loadingMoreMessages.value) return;

    try {
      loadingMoreMessages.value = true;
      const currentPage = entity.is_group
        ? entity.chat_info.currentPage
        : entity.currentPage;

      // Se houver channel_id real, usa ele. Se não, usa attendant_id
      const url = entity.internal_chat?.channel_id
        ? `${internalChatUrl}messages_by_channel/?channel_id=${entity.internal_chat.channel_id}&page=${currentPage}`
        : `${internalChatUrl}messages_by_channel/?attendant=${entity.id}&page=${currentPage}`;

      const response = await api.get(url);

      if (entity.is_group) {
        entity.chat_info.messages = [
          ...response.data.results.reverse(),
          ...entity.chat_info.messages,
        ];
        entity.chat_info.hasNextPage =
          response.data.next !== null && response.data.next !== undefined;
        entity.chat_info.currentPage++;
      } else {
        entity.messages = [
          ...response.data.results.reverse(),
          ...entity.messages,
        ];
        entity.hasNextPage =
          response.data.next !== null && response.data.next !== undefined;
        entity.currentPage++;
      }
    } catch (error) {
      console.error("Erro ao carregar mais mensagens:", error);
    } finally {
      loadingMoreMessages.value = false;
    }
  };

  const addMessageToChannel = (event, isChatOpen, selectedChannelId) => {
    let entity = null;
    const message = event?.message;
    if (!message) return;

    const loggedAttendant = attendantStore.logged_attendant?.();
    const loggedAttendantId = loggedAttendant?.id;

    // Busca a entidade pelo channel_id da mensagem
    entity = findEntityByChannelId(message.channel_id);

    // Se a entidade não existir e for um grupo, cria a partir do group_info
    if (!entity && message.is_group && message.group_info) {
      entity = message.group_info;
      const logged_attendant = attendantStore.logged_attendant();
      entity.internal_chat.unread = getValueByKey(
        entity.internal_chat.unread,
        logged_attendant.id,
      );
    }

    if (!entity) return;

    // Inicializa messages baseado no tipo de entidade
    if (entity.is_group) {
      if (!entity.chat_info) {
        entity.chat_info = { messages: [], hasNextPage: false, currentPage: 1 };
      }
      entity.chat_info.messages = entity.chat_info.messages || [];
    } else {
      entity.messages = entity.messages || [];
    }

    const messages = entity.is_group
      ? entity.chat_info.messages
      : entity.messages;
    const existingMessage = messages.find((msg) => msg.id === message.id);

    if (!existingMessage) {
      messages.push(message);

      if (
        !isChatOpen ||
        entity.internal_chat?.channel_id !== selectedChannelId ||
        (loggedAttendantId != null && message.sender?.id !== loggedAttendantId)
      ) {
        entity.internal_chat.unread = (entity.internal_chat.unread || 0) + 1;
      }
    }
  };

  const resetUnreadMessages = (channelId) => {
    const entity = findEntityByChannelId(channelId);
    if (entity) {
      entity.internal_chat.unread = 0;
    }
  };

  const sendMessageToChannel = async (
    channelId,
    messageContent,
    sender,
    sendFile = false,
  ) => {
    const entity = findEntityByChannelId(channelId);
    if (!entity || !entity.internal_chat?.channel_id) return;

    let mountContent;

    if (sendFile) {
      mountContent = messageContent;
    } else {
      mountContent = { type: "text", content: messageContent };
    }

    const newMessage = {
      id: uuidv4(),
      content: mountContent,
      created_at: new Date().toISOString(),
      sender,
    };

    // Adiciona mensagem localmente baseado no tipo de entidade
    if (entity.is_group) {
      if (!entity.chat_info) {
        entity.chat_info = { messages: [], hasNextPage: false, currentPage: 1 };
      }
      entity.chat_info.messages.push(newMessage);
    } else {
      if (!entity.messages) {
        entity.messages = [];
      }
      entity.messages.push(newMessage);
    }

    try {
      await api.post(
        `${internalChatUrl}${entity.internal_chat.channel_id}/message/`,
        {
          id: newMessage.id,
          content: newMessage.content,
        },
      );
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    }
  };

  const hasNextPageForChannel = (channelId) => {
    const entity = findEntityByChannelId(channelId);
    if (!entity) return false;

    return entity.is_group
      ? entity.chat_info?.hasNextPage || false
      : entity.hasNextPage || false;
  };

  // --- Seção que controla o fetch do grupo dos canais de grupo ---
  // --------------------------------------------------------------

  // --- Seção que controla o modal de criação/edição de grupos ---
  const showCreateOrEditModal = ref({
    show: false,
    mode: "create",
    groupData: null,
  });

  const openCreateOrEdit = (mode = "create", groupData = null) => {
    showCreateOrEditModal.value = { show: true, mode, groupData };
  };
  const closeCreateOrEdit = () =>
    (showCreateOrEditModal.value = {
      show: false,
      mode: "create",
      groupData: null,
    });

  const createGroup = async (body, mode) => {
    if (mode === "edit") {
      const channelId = body?.channel_id;
      const previousParticipants = Array.isArray(body?.previousParticipants)
        ? body.previousParticipants
        : [];
      const nextParticipants = Array.isArray(body?.participants)
        ? body.participants
        : [];

      const participantsToAdd = nextParticipants.filter(
        (participantId) => !previousParticipants.includes(participantId),
      );
      const participantsToRemove = previousParticipants.filter(
        (participantId) => !nextParticipants.includes(participantId),
      );

      try {
        const requests = [];

        if (participantsToAdd.length > 0) {
          requests.push(
            api.post(managerChatGroup(channelId, "add"), {
              participants: participantsToAdd,
            }),
          );
        }

        if (participantsToRemove.length > 0) {
          requests.push(
            api.post(managerChatGroup(channelId, "remove"), {
              participants: participantsToRemove,
            }),
          );
        }

        const responses = await Promise.all(requests);

        if (
          responses.some((response) => !isSuccessfulStatus(response?.status))
        ) {
          throw new Error("Erro ao sincronizar participantes do grupo.");
        }

        const group = findEntityByChannelId(channelId);
        if (group) {
          group.participants = [...nextParticipants];
        }

        return true;
      } catch (error) {
        console.error("Erro ao editar grupo:", error);
        throw error;
      }
    }

    try {
      const response = await api.post(`${internalChatUrl}create_group/`, body);

      if (!isSuccessfulStatus(response?.status)) {
        throw new Error("Erro ao criar grupo.");
      }

      listGroups.value.unshift(response.data);

      return true;
    } catch (error) {
      throw error;
    }
  };

  const removeGroupFromState = (channelId) => {
    if (!channelId) return;

    listGroups.value = listGroups.value.filter(
      (group) =>
        group.internal_chat?.channel_id !== channelId && group.id !== channelId,
    );
  };

  const clearEntityMessages = (channelId) => {
    if (!channelId) return;

    const entity = findEntityByChannelId(channelId);
    if (!entity) return;

    if (entity.is_group) {
      entity.chat_info = {
        messages: [],
        hasNextPage: false,
        currentPage: 1,
      };
    } else {
      entity.messages = [];
      entity.hasNextPage = false;
      entity.currentPage = 1;
    }
  };

  const removeParticipantFromGroupState = (channelId, participantId) => {
    if (!channelId || !participantId) return;

    const group = findEntityByChannelId(channelId);
    if (!group || !Array.isArray(group.participants)) return;

    group.participants = group.participants.filter(
      (id) => id !== participantId,
    );
  };

  const leaveGroup = async (channelId) => {
    if (!channelId) return false;

    try {
      const url = managerChatGroup(channelId, "leave");
      const response = await api.post(url);

      if (!isSuccessfulStatus(response?.status)) {
        return false;
      }

      clearEntityMessages(channelId);
      removeGroupFromState(channelId);

      return true;
    } catch (error) {
      console.error("Erro ao sair do grupo:", error);
      return false;
    }
  };

  const addGroupParticipant = async (participantId) => {
    // if (!participantId || participantId === props.attendant?.id) return;

    try {
      const url = managerChatGroup(participantId, "add");
      await api.post(url, {
        participants: ["da20f5a0-c8bc-4afe-b308-fd7e0915e3bd"],
      });

      listGroups.value.unshift(event.message);
    } catch (error) {
      console.error("Erro ao adicionar participante:", error);
    }
  };

  const removeGroupParticipant = async (channelId, participantId) => {
    if (!channelId || !participantId) return false;

    const removeList = [];

    removeList.push(participantId);

    try {
      const url = managerChatGroup(channelId, "remove");
      const response = await api.post(url, {
        participants: removeList,
      });

      if (!isSuccessfulStatus(response?.status)) {
        return false;
      }

      removeParticipantFromGroupState(channelId, participantId);
      return true;
    } catch (error) {
      console.error("Erro ao remover participante:", error);
      return false;
    }
  };
  // --------------------------------------------------------------

  return {
    listAttendants: computed(() => attendantStore.attendants),
    count: computed(() => attendantStore.count),
    loadingMessages,
    loadingMoreMessages,
    loadingAttendants,
    refreshAttendantsOnListOpen,
    showCreateOrEditModal,
    listGroups,
    loadingGroupList,
    loadingMoreGroupList,
    createGroup,
    fetchGroupChannels,
    openCreateOrEdit,
    closeCreateOrEdit,
    fetchMessagesByChannel,
    loadMessagesByChannel,
    addMessageToChannel,
    addGroupParticipant,
    leaveGroup,
    removeGroupParticipant,
    sendMessageToChannel,
    hasNextPageForChannel,
    resetUnreadMessages,
    findEntityByChannelId,
  };
}
