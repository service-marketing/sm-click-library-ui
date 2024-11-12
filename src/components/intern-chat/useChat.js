import { ref, computed } from "vue";
import api from "~/utils/api";
import { v4 as uuidv4 } from "uuid";
import { internalChatUrl, allAttendances } from "~/utils/systemUrls";
export function useChat() {
  const attendants = ref([]); // Lista de atendentes com suas mensagens e canais
  const loadingMessages = ref(false);
  const loadingAttendants = ref(false);

  const fetchAtendentes = async () => {
    try {
      loadingAttendants.value = true;
      const response = await api.get(allAttendances);
      // Inicializa atendentes com mensagens vazias e paginação
      attendants.value = response.data.map((att) => ({
        ...att,
        messages: null,
        currentPage: 1,
        hasNextPage: null,
      }));
    } catch (error) {
      console.error(error);
    } finally {
      loadingAttendants.value = false;
    }
  };

  const fetchMessagesForAtendente = async (atendenteId) => {
    try {
      loadingMessages.value = true;
      const response = await api.get(
        `${internalChatUrl}?attendant=${atendenteId}&page=1`,
      );
      const atendente = attendants.value.find((att) => att.id === atendenteId);
      if (atendente) {
        atendente.messages = response.data.results.reverse(); // Vincula as mensagens
        atendente.hasNextPage = response.data.next !== null;
        atendente.internal_chat.channel_id = response.data.channel_id;
        atendente.currentPage++;
      }
    } catch (error) {
      console.error(error);
    } finally {
      loadingMessages.value = false;
    }
  };

  const loadMessagesForAtendente = async (atendenteId) => {
    try {
      const atendente = attendants.value.find((att) => att.id === atendenteId);
      if (!atendente || !atendente.hasNextPage) return;

      const response = await api.get(
        `${internalChatUrl}?attendant=${atendenteId}&page=${atendente.currentPage}`,
      );

      // Atualiza mensagens e canal
      atendente.messages = [
        ...response.data.results.reverse(),
        ...atendente.messages,
      ];
      atendente.hasNextPage = response.data.next !== null;
      atendente.internal_chat.channel_id = response.data.channel_id;
      atendente.currentPage++;
    } catch (error) {
      console.error(error);
    }
  };

  const addMessageToAtendente = (event, isChatOpen, selectedAtendenteId) => {
    try {
      // Verifica se o evento e a mensagem existem
      if (!event || !event.message) {
        console.error("Evento ou mensagem inválida");
        return;
      }

      const message = event.message;

      // Verifica se o array de atendentes existe
      if (!attendants.value || attendants.value.length === 0) {
        console.error("Nenhum atendente encontrado");
        return;
      }

      const atendenteIndex = attendants.value.findIndex(
        (att) => att.internal_chat.channel_id === message.channel_id,
      );

      if (atendenteIndex !== -1) {
        const atendente = attendants.value[atendenteIndex];

        // Inicializa o array de mensagens se for null ou undefined
        atendente.messages = atendente.messages || [];

        const existingMessageIndex = atendente.messages.findIndex(
          (msg) => msg.id === message.id,
        );

        if (existingMessageIndex !== -1) {
          // Substitui a mensagem existente
          atendente.messages[existingMessageIndex] = message;
        } else {
          // Adiciona nova mensagem
          atendente.messages.push(message);

          // Incrementa contagem de não lidas se o chat não está aberto ou o atendente não está selecionado
          if (!isChatOpen || atendente.id !== selectedAtendenteId) {
            atendente.internal_chat.unread =
              (atendente.internal_chat.unread || 0) + 1;
          }

          // Move o atendente para o topo da lista
          attendants.value.splice(atendenteIndex, 1);
          attendants.value.unshift(atendente);

          // Adiciona a classe 'moved' para animar
          atendente.isMoved = true;
          setTimeout(() => (atendente.isMoved = false), 1000); // Remove a classe após 1 segundo
        }
      } else {
        console.error(
          "Nenhum atendente encontrado para o channel_id fornecido.",
        );
      }
    } catch (error) {
      console.error("Erro ao adicionar mensagem ao atendente:", error);
    }
  };

  const resetUnreadMessages = (atendenteId) => {
    const atendente = attendants.value.find((att) => att.id === atendenteId);
    if (atendente) {
      atendente.internal_chat.unread = 0;
    }
  };

  const sendMessageToAtendente = async (atendenteId, messageContent, att) => {
    const atendente = attendants.value.find((att) => att.id === atendenteId);

    if (!atendente || !atendente.internal_chat.channel_id) return;
    const newMessage = {
      id: uuidv4(), // ID temporário até ser salvo no servidor
      content: { type: "text", content: messageContent },
      created_at: new Date().toISOString(),
      sender: att, // Ajuste de acordo com o backend
    };

    // Adiciona a nova mensagem localmente
    atendente.messages.push(newMessage);

    try {
      // Envia a mensagem para o backend
      await api.post(
        `${internalChatUrl}${atendente.internal_chat.channel_id}/message/`,
        {
          id: newMessage.id,
          content: newMessage.content,
        },
      );
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    }
  };

  const hasNextPageForAtendente = (atendenteId) => {
    const atendente = attendants.value.find((att) => att.id === atendenteId);
    return atendente ? atendente.hasNextPage : false;
  };

  return {
    attendants: computed(() => attendants.value),
    loadingMessages: computed(() => loadingMessages.value),
    loadingAttendants: computed(() => loadingAttendants.value),
    fetchAtendentes,
    fetchMessagesForAtendente,
    loadMessagesForAtendente,
    addMessageToAtendente,
    sendMessageToAtendente,
    hasNextPageForAtendente,
    resetUnreadMessages,
  };
}
