import { ref, computed } from 'vue';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

export function useChat() {
  const attendants = ref([]); // Lista de atendentes com suas mensagens e canais
  const loadingMessages = ref(false);

  const fetchAtendentes = async (token, getAttendantsUrl) => {
    try {
      const response = await axios.get(getAttendantsUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Inicializa atendentes com mensagens vazias e paginação
      attendants.value = response.data.map(att => ({
        ...att,
        messages: null,
        channel_id: null,
        currentPage: 1,
        hasNextPage: null,
        unreadMessages: 5,
      }));
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMessagesForAtendente = async (atendenteId, token, getInternalChatUrl) => {
    try {
      loadingMessages.value = true;
      const response = await axios.get(`${getInternalChatUrl}?attendant=${atendenteId}&page=1`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const atendente = attendants.value.find(att => att.id === atendenteId);
      if (atendente) {
        atendente.messages = response.data.results.reverse(); // Vincula as mensagens
        atendente.channel_id = response.data.channel_id; // Vincula o canal
        atendente.hasNextPage = response.data.next !== null;
        atendente.currentPage++;
      }
    } catch (error) {
      console.error(error);
    } finally {
      loadingMessages.value = false;
    }
  };

  const loadMessagesForAtendente = async (atendenteId, token, getInternalChatUrl) => {
    try {
      const atendente = attendants.value.find(att => att.id === atendenteId);
      if (!atendente || !atendente.hasNextPage) return;

      const response = await axios.get(`${getInternalChatUrl}?attendant=${atendenteId}&page=${atendente.currentPage}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Atualiza mensagens e canal
      atendente.messages = [...response.data.results.reverse(), ...atendente.messages];
      atendente.channel_id = response.data.channel_id;
      atendente.hasNextPage = response.data.next !== null;
      atendente.currentPage++;
    } catch (error) {
      console.error(error);
    }
  };

  const addMessageToAtendente = (event, isChatOpen, selectedAtendenteId) => {
    const message = event.message;
    const atendente = attendants.value.find(att => att.channel_id === message.channel_id);

    if (atendente) {
      const existingMessageIndex = atendente.messages.findIndex(msg => msg.id === message.id);

      if (existingMessageIndex !== -1) {
        atendente.messages[existingMessageIndex] = message;
        console.log(`Mensagem com ID ${message.id} atualizada.`, message);
      } else {
        atendente.messages.push(message);
        console.log(`Nova mensagem com ID ${message.id} adicionada.`, message);

        // Verifica se o chat está aberto e se o atendente está selecionado
        if (!isChatOpen || atendente.id !== selectedAtendenteId) {
          // Incrementa as mensagens não lidas se o atendente não está visualizado
          atendente.unreadMessages += 1;
          console.log(`Nova mensagem não lida para o atendente ${atendente.name}. Total: ${atendente.unreadMessages}`);
        }
      }
    }
  };

  const resetUnreadMessages = (atendenteId) => {
    const atendente = attendants.value.find(att => att.id === atendenteId);
    // if (atendente) {
    //   atendente.unreadMessages = 0;
    // }
  };

  const sendMessageToAtendente = async (atendenteId, messageContent, token, getInternalChatUrl, att) => {
    const atendente = attendants.value.find(att => att.id === atendenteId);

    if (!atendente || !atendente.channel_id) return;
    const newMessage = {
      id: uuidv4(), // ID temporário até ser salvo no servidor
      content: { type: 'text', content: messageContent },
      created_at: new Date().toISOString(),
      sender: att, // Ajuste de acordo com o backend
    };

    // Adiciona a nova mensagem localmente
    atendente.messages.push(newMessage);

    try {
      // Envia a mensagem para o backend
      await axios.post(`${getInternalChatUrl}${atendente.channel_id}/message/`, {
        id: newMessage.id,
        content: newMessage.content,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  const hasNextPageForAtendente = (atendenteId) => {
    const atendente = attendants.value.find(att => att.id === atendenteId);
    return atendente ? atendente.hasNextPage : false;
  };

  return {
    attendants: computed(() => attendants.value),
    loadingMessages: computed(() => loadingMessages.value),
    fetchAtendentes,
    fetchMessagesForAtendente,
    loadMessagesForAtendente,
    addMessageToAtendente,
    sendMessageToAtendente,
    hasNextPageForAtendente,
    resetUnreadMessages
  };
}
