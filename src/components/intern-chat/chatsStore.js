import { defineStore } from 'pinia';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

export const useChatStore = defineStore('chatStore', {
    state: () => ({
        attendants: [], // Lista de atendentes com suas mensagens e canais
        loadingMessages: false,
    }),

    actions: {
        async fetchAtendentes(token, getAttendantsUrl) {
            try {
                const response = await axios.get(getAttendantsUrl, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                // Inicializa atendentes com mensagens vazias e paginação
                this.attendants = response.data.map(att => ({
                    ...att,
                    messages: null,
                    channel_id: null,
                    currentPage: 1,
                    hasNextPage: null
                }));
            } catch (error) {
                console.error(error);
            }
        },

        async fetchMessagesForAtendente(atendenteId, token, getInternalChatUrl) {
            try {
                this.loadingMessages = true
                const response = await axios.get(`${getInternalChatUrl}?attendant=${atendenteId}&page=1`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const atendente = this.attendants.find(att => att.id === atendenteId);
                if (atendente) {
                    atendente.messages = response.data.results.reverse(); // Vincula as mensagens
                    atendente.channel_id = response.data.channel_id; // Vincula o canal
                    atendente.hasNextPage = response.data.next !== null;
                    atendente.currentPage++;
                }
            } catch (error) {
                console.error(error);
            } finally {
                this.loadingMessages = false
            }
        },

        // Carrega mensagens para um atendente específico e vincula o canal
        async loadMessagesForAtendente(atendenteId, token, getInternalChatUrl) {
            try {
                const atendente = this.attendants.find(att => att.id === atendenteId);
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
        },

        addMessageToAtendente(event) {
            const message = event.message;
        
            const atendente = this.attendants.find(att => att.channel_id === message.channel_id);
          
            if (atendente) {
              // Verificar se a mensagem já existe
              const existingMessageIndex = atendente.messages.findIndex(msg => msg.id === message.id);
          
              if (existingMessageIndex !== -1) {
                // Atualizar a mensagem existente
                atendente.messages[existingMessageIndex] = message;
                console.log(`Mensagem com ID ${message.id} atualizada.`);
              } else {
                // Adicionar nova mensagem
                atendente.messages.push(message);
                console.log(`Nova mensagem com ID ${message.id} adicionada.`);
              }
            }
          },

        // Envia uma mensagem para o atendente
        async sendMessageToAtendente(atendenteId, messageContent, token, getInternalChatUrl, att) {
            const atendente = this.attendants.find(att => att.id === atendenteId);
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
        },

        // Verifica se o atendente tem próxima página de mensagens
        hasNextPageForAtendente(atendenteId) {
            const atendente = this.attendants.find(att => att.id === atendenteId);
            return atendente ? atendente.hasNextPage : false;
        }
    }
});
