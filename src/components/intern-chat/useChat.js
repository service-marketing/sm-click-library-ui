import { ref, computed } from 'vue';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

export function useChat() {
  const attendants = ref([]); // Lista de atendentes com suas mensagens e canais
  const loadingMessages = ref(false);
  const loadingAttendants = ref(false)

  const fetchAtendentes = async (token, getAttendantsUrl) => {
    try {
      loadingAttendants.value = true
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
        unreadMessages: 0,
      }));
    } catch (error) {
      console.error(error);
    } finally {
      loadingAttendants.value = false
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
    const atendenteIndex = attendants.value.findIndex(att => att.channel_id === message.channel_id);
  
    if (atendenteIndex !== -1) {
      const atendente = attendants.value[atendenteIndex];
  
      const existingMessageIndex = atendente.messages.findIndex(msg => msg.id === message.id);
  
      if (existingMessageIndex !== -1) {
        atendente.messages[existingMessageIndex] = message;
      } else {
        atendente.messages.push(message);
  
        if (!isChatOpen || atendente.id !== selectedAtendenteId) {
          atendente.unreadMessages += 1;
        }
  
        // Move o atendente para o topo
        attendants.value.splice(atendenteIndex, 1);
        attendants.value.unshift(atendente);
  
        // Adiciona a classe 'moved' para animar
        atendente.isMoved = true;
        setTimeout(() => atendente.isMoved = false, 1000);  // Remove após 1 segundo
      }
    }
  };
  
  const resetUnreadMessages = (atendenteId) => {
    const atendente = attendants.value.find(att => att.id === atendenteId);
    if (atendente) {
      atendente.unreadMessages = 0;
    }
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
