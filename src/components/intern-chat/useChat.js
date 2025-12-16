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
    console.log("entidade real", entity)
    if (!entity) return;

    try {
      const response = await api.get(
        `${internalChatUrl}messages_by_channel/?channel_id=${channelId}&page=1`
      );

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
        channel_id: response.data.channel_id,
        unread: 0,
      };
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error);
    }
  };

  const loadMessagesByChannel = async (channelId) => {
    const entity = findEntityByChannelId(channelId);
    
    // Determina se há próxima página baseado no tipo de entidade
    const hasNext = entity?.is_group 
      ? entity.chat_info?.hasNextPage 
      : entity?.hasNextPage;
    
    if (!entity || !hasNext) return;

    try {
      const currentPage = entity.is_group 
        ? entity.chat_info.currentPage 
        : entity.currentPage;
        
      const response = await api.get(
        `${internalChatUrl}messages_by_channel/?channel_id=${channelId}&page=${currentPage}`
      );
      
      if (entity.is_group) {
        entity.chat_info.messages = [
          ...response.data.results.reverse(),
          ...entity.chat_info.messages,
        ];
        entity.chat_info.hasNextPage = response.data.next !== null;
        entity.chat_info.currentPage++;
      } else {
        entity.messages = [
          ...response.data.results.reverse(),
          ...entity.messages,
        ];
        entity.hasNextPage = response.data.next !== null;
        entity.currentPage++;
      }
    } catch (error) {
      console.error("Erro ao carregar mais mensagens:", error);
    }
  };

  const addMessageToChannel = (event, isChatOpen, selectedChannelId) => {
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

    // Inicializa messages baseado no tipo de entidade
    if (entity.is_group) {
      if (!entity.chat_info) {
        entity.chat_info = { messages: [], hasNextPage: false, currentPage: 1 };
      }
      entity.chat_info.messages = entity.chat_info.messages || [];
    } else {
      entity.messages = entity.messages || [];
    }
    
    const messages = entity.is_group ? entity.chat_info.messages : entity.messages;
    const existingMessage = messages.find((msg) => msg.id === message.id);

    if (!existingMessage) {
      messages.push(message);

      if (!isChatOpen || entity.internal_chat?.channel_id !== selectedChannelId) {
        entity.internal_chat.unread =
          (entity.internal_chat.unread || 0) + 1;
      }
    }
  };

  const addGroupParticipant = (event) => {
    channelStore.channels.push(event.message)
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
        }
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

  return {
    attendants: computed(() => attendantStore.attendants),
    count: computed(() => attendantStore.count),
    fetchMessagesByChannel,
    loadMessagesByChannel,
    addMessageToChannel,
    addGroupParticipant,
    sendMessageToChannel,
    hasNextPageForChannel,
    resetUnreadMessages,
    findEntityByChannelId,
  };
}
