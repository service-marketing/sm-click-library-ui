import { computed } from "vue";
import { useAttendantStore } from "~/stores/attendantStore";
import { v4 as uuidv4 } from "uuid";
import api from "~/utils/api";
import { internalChatUrl } from "~/utils/systemUrls";

export function useChat() {
  const attendantStore = useAttendantStore();

  const fetchMessagesForAtendente = async (atendenteId) => {
    const attendant = attendantStore.attendants.find(
      (att) => att.id === atendenteId
    );
    if (!attendant) return;

    try {
      const response = await api.get(
        `${internalChatUrl}?attendant=${atendenteId}&page=1`
      );
      attendant.messages = response.data.results.reverse(); // Adiciona mensagens ao atendente
      attendant.hasNextPage = response.data.next !== null;
      attendant.currentPage = 2; // Próxima página para carregamento incremental
      attendant.internal_chat = {
        channel_id: response.data.channel_id,
        unread: 0,
      };
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error);
    }
  };

  const loadMessagesForAtendente = async (atendenteId) => {
    const attendant = attendantStore.attendants.find(
      (att) => att.id === atendenteId
    );
    if (!attendant || !attendant.hasNextPage) return;

    try {
      const response = await api.get(
        `${internalChatUrl}?attendant=${atendenteId}&page=${attendant.currentPage}`
      );
      attendant.messages = [
        ...response.data.results.reverse(),
        ...attendant.messages,
      ];
      attendant.hasNextPage = response.data.next !== null;
      attendant.currentPage++;
    } catch (error) {
      console.error("Erro ao carregar mais mensagens:", error);
    }
  };

  const addMessageToAtendente = (event, isChatOpen, selectedAtendenteId) => {
    const message = event?.message;
    if (!message) return;

    const attendant = attendantStore.attendants.find(
      (att) => att.internal_chat?.channel_id === message.channel_id
    );

    if (attendant) {
      attendant.messages = attendant.messages || [];
      const existingMessage = attendant.messages.find(
        (msg) => msg.id === message.id
      );

      if (!existingMessage) {
        attendant.messages.push(message);

        if (!isChatOpen || attendant.id !== selectedAtendenteId) {
          attendant.internal_chat.unread =
            (attendant.internal_chat.unread || 0) + 1;
        }
      }
    } else {
      console.error("Atendente não encontrado para o canal especificado.");
    }
  };

  const resetUnreadMessages = (atendenteId) => {
    const attendant = attendantStore.attendants.find(
      (att) => att.id === atendenteId
    );
    if (attendant) {
      attendant.internal_chat.unread = 0;
    }
  };

  const sendMessageToAtendente = async (
    atendenteId,
    messageContent,
    sender,
    sendFile = false
  ) => {
    const attendant = attendantStore.attendants.find(
      (att) => att.id === atendenteId
    );
    if (!attendant || !attendant.internal_chat?.channel_id) return;

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
    attendant.messages.push(newMessage);

    try {
      await api.post(
        `${internalChatUrl}${attendant.internal_chat.channel_id}/message/`,
        {
          id: newMessage.id,
          content: newMessage.content,
        }
      );
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    }
  };

  const hasNextPageForAtendente = (atendenteId) => {
    const attendant = attendantStore.attendants.find(
      (att) => att.id === atendenteId
    );
    return attendant ? attendant.hasNextPage : false;
  };

  return {
    attendants: computed(() => attendantStore.attendants),
    count: computed(() => attendantStore.count),
    fetchMessagesForAtendente,
    loadMessagesForAtendente,
    addMessageToAtendente,
    sendMessageToAtendente,
    hasNextPageForAtendente,
    resetUnreadMessages,
  };
}
