import { computed } from "vue";
import { useAttendantStore } from "~/stores/attendantStore";
import { useChannelStore } from "~/stores/channelStore";
import { v4 as uuidv4 } from "uuid";
import api from "~/utils/api";
import { internalChatUrl } from "~/utils/systemUrls";

export function useChat() {
  const attendantStore = useAttendantStore();
  const channelStore = useChannelStore();


  function getValueByKey(object, key) {
    return object[key];
  }

  // Busca a entidade (atendente ou grupo) pelo channel_id
  const findEntityByChannelId = (channelId) => {
    // Procura primeiro nos atendentes
    let entity = attendantStore.attendants.find(
      (att) => att.internal_chat?.channel_id === channelId
    );
    
    // Se não encontrar, procura nos canais (grupos)
    if (!entity) {
      entity = channelStore.channels.find(
        (ch) => ch.internal_chat?.channel_id === channelId
      );
    }
    
    return entity;
  };

  const fetchMessagesByChannel = async (channelId) => {
    const entity = findEntityByChannelId(channelId);
    if (!entity) return;

    try {
      const response = await api.get(
        `${internalChatUrl}get_messages_by_channel/?channel_id=${channelId}&page=1`
      );

      entity.messages = response.data.results.reverse();
      entity.hasNextPage = response.data.next !== null;
      entity.currentPage = 2; // Próxima página para carregamento incremental
      entity.internal_chat = {
        ...entity.internal_chat,
        channel_id: response.data.channel_id,
        unread: 0,
      };
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error);
    }
  };

  const loadMessagesByChannel = async (channelId) => {
    const entity = findEntityByChannelId(channelId);
    if (!entity || !entity.hasNextPage) return;

    try {
      const response = await api.get(
        `${internalChatUrl}get_messages_by_channel/?channel_id=${channelId}&page=${entity.currentPage}`
      );
      entity.messages = [
        ...response.data.results.reverse(),
        ...entity.messages,
      ];
      entity.hasNextPage = response.data.next !== null;
      entity.currentPage++;
    } catch (error) {
      console.error("Erro ao carregar mais mensagens:", error);
    }
  };

  const addMessageToChannel = (event, isChatOpen, selectedChannelId) => {
    console.log("evento:", event);
    let entity = null;
    const message = event?.message;
    if (!message) return;

  // Busca a entidade pelo channel_id da mensagem
  entity = findEntityByChannelId(message.channel_id);

    // Se a entidade não existir e for um grupo, cria a partir do group_info
    if (!entity && message.is_group && message.group_info) {
      entity = message.group_info;
      const logged_attendant = attendantStore.logged_attendant();
      entity.internal_chat.unread = getValueByKey(
        entity.internal_chat.unread,
        logged_attendant.id
      );
    }

    if (!entity) return;

    entity.messages = entity.messages || [];
    const existingMessage = entity.messages.find(
      (msg) => msg.id === message.id
    );

    if (!existingMessage) {
      entity.messages.push(message);

      if (!isChatOpen || entity.internal_chat?.channel_id !== selectedChannelId) {
        entity.internal_chat.unread =
          (entity.internal_chat.unread || 0) + 1;
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
    sendFile = false
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

    // Adiciona mensagem localmente
    entity.messages.push(newMessage);

    try {
      await api.post(
        `${internalChatUrl}${entity.internal_chat.channel_id}/message/`,
        {
          id: newMessage.id,
          content: newMessage.content,
        }
      );
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    }
  };

  const hasNextPageForChannel = (channelId) => {
    const entity = findEntityByChannelId(channelId);
    return entity ? entity.hasNextPage : false;
  };

  return {
    attendants: computed(() => attendantStore.attendants),
    count: computed(() => attendantStore.count),
    fetchMessagesByChannel,
    loadMessagesByChannel,
    addMessageToChannel,
    sendMessageToChannel,
    hasNextPageForChannel,
    resetUnreadMessages,
    findEntityByChannelId,
  };
}
