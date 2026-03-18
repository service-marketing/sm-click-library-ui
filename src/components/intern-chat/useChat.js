import { computed, ref } from "vue";
import { useAttendantStore } from "~/stores/attendantStore";
import { v4 as uuidv4 } from "uuid";
import api from "~/utils/api";
import { internalChatUrl } from "~/utils/systemUrls";

export function useChat() {
  const attendantStore = useAttendantStore();

  // Estados globais de carregamento usados pelo UI do chat interno
  const loadingMessages = ref(false);
  const loadingMoreMessages = ref(false);
  const loadingAttendants = ref(false);

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
  const listGroups = ref([]);
  // const count = ref(0);
  const loadingGroupList = ref(false);
  const loadingMoreGroupList = ref(false);
  const loadedGroupList = ref(false);

  const nextPage = ref(null);
  const previousPage = ref(null);
  const currentPage = ref(1);
  const currentFilter = ref("");

  const fetchGroupChannels = async (page = 1, filter = "") => {
    const isInitialLoad = page === 1;
    const filterChanged = filter !== currentFilter.value;

    try {
      // Se o filtro mudou, permite recarregar mesmo que já tenha carregado
      if (loadedGroupList.value && isInitialLoad && !filterChanged) return;
      if (loadingGroupList.value || loadingMoreGroupList.value) return;

      if (isInitialLoad) {
        loadingGroupList.value = true;
        currentFilter.value = filter;
      } else {
        loadingMoreGroupList.value = true;
      }

      const filterParam = filter ? `&filter=${encodeURIComponent(filter)}` : "";
      const response = await api.get(
        `${internalChatUrl}channels/?page=${page}${filterParam}`,
      );

      // Se for a primeira página, substitui os canais
      // Caso contrário, adiciona aos canais existentes
      if (isInitialLoad) {
        listGroups.value = response.data.results;
      } else {
        listGroups.value = [...listGroups.value, ...response.data.results];
      }

      // count.value = response.data.count;
      nextPage.value = response.data.next;
      previousPage.value = response.data.previous;
      currentPage.value = page;

      // Marca como loaded após carregar a primeira página
      if (isInitialLoad) {
        loadedGroupList.value = true;
      }
    } catch (error) {
      console.log(error);
      console.error("Erro ao buscar canais de grupo:", JSON.stringify(error));
    } finally {
      if (isInitialLoad) {
        loadingGroupList.value = false;
      } else {
        loadingMoreGroupList.value = false;
      }
    }
  };

  const loadMoreChannels = async () => {
    if (
      !nextPage.value ||
      loadingGroupList.value ||
      loadingMoreGroupList.value
    ) {
      return Boolean(nextPage.value);
    }

    const nextPageNumber = currentPage.value + 1;
    await fetchGroupChannels(nextPageNumber, currentFilter.value);

    return Boolean(nextPage.value);
  };
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

  const createOrEditGroup = async () => {
    console.log("Grupo criado");
  };

  const createGroup = async (body, mode) => {
    console.log("Criando grupo com body:", body, "e modo:", mode);

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
            api.post(
              `/v1/api/attendances/internal_chat/${channelId}/add_attendant/`,
              { participants: participantsToAdd },
            ),
          );
        }

        if (participantsToRemove.length > 0) {
          requests.push(
            api.post(
              `/v1/api/attendances/internal_chat/${channelId}/remove_attendant/`,
              { participants: participantsToRemove },
            ),
          );
        }

        await Promise.all(requests);

        const group = findEntityByChannelId(channelId);
        if (group) {
          group.participants = [...nextParticipants];
        }

        return true;
      } catch (error) {
        notifyActionError(
          "Erro ao editar grupo",
          error,
          "Nao foi possivel atualizar os participantes do grupo.",
        );
        throw error;
      }
    }

    try {
      const response = await api.post(`${internalChatUrl}create_group/`, body);
      listGroups.value.unshift(response.data);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const notifyActionError = (title, error, fallbackMessage) => {
    const message = getErrorMessage(error, fallbackMessage);
    console.error(title, error);
    notify(
      {
        group: "deletado",
        title,
        text: message,
      },
      4000,
    );
  };

  const removeGroupFromState = (channelId) => {
    if (!channelId) return;

    listGroups.value = listGroups.value.filter(
      (group) =>
        group.internal_chat?.channel_id !== channelId && group.id !== channelId,
    );
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
      const url = `/v1/api/attendances/internal_chat/${channelId}/leave_channel/`;
      await api.post(url);
      removeGroupFromState(channelId);
      return true;
    } catch (error) {
      notifyActionError(
        "Erro ao sair do grupo",
        error,
        "Nao foi possivel sair do grupo.",
      );
      return false;
    }
  };

  const addGroupParticipant = async (participantId) => {
    // if (!participantId || participantId === props.attendant?.id) return;

    try {
      const url = `/v1/api/attendances/internal_chat/${participantId}/add_attendant/`;
      await api.post(url, {
        participants: ["da20f5a0-c8bc-4afe-b308-fd7e0915e3bd"],
      });

      listGroups.value.unshift(event.message);
    } catch (error) {
      notifyActionError(
        "Erro ao adicionar participante",
        error,
        "Nao foi possivel adicionar o participante.",
      );
    }
  };

  const removeGroupParticipant = async (channelId, participantId) => {
    if (!channelId || !participantId) return false;

    const removeList = [];

    removeList.push(participantId);

    try {
      const url = `/v1/api/attendances/internal_chat/${channelId}/remove_attendant/`;
      await api.post(url, {
        participants: removeList,
      });
      removeParticipantFromGroupState(channelId, participantId);
      return true;
    } catch (error) {
      notifyActionError(
        "Erro ao remover participante",
        error,
        "Nao foi possivel remover o participante.",
      );
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
    showCreateOrEditModal,
    listGroups,
    loadingGroupList,
    loadingMoreGroupList,
    createGroup,
    fetchGroupChannels,
    loadMoreChannels,
    openCreateOrEdit,
    closeCreateOrEdit,
    createOrEditGroup,
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
