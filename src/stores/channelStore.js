import { defineStore } from "pinia";
import api from "~/utils/api";
import { internalChatUrl } from "~/utils/systemUrls";

export const useChannelStore = defineStore("channel", {
  state: () => ({
    channels: [],
    count: null,
    loaded: false,
    loading: false,
    nextPage: null,
    previousPage: null,
    currentPage: 1,
  }),
  actions: {
    async fetchChannel(type, page = 1) {
      if (type === "group") {
        try {
          if (this.loaded && page === 1) return;
          if (this.loading) return; // Evita chamadas duplicadas
          
          this.loading = true;
          
          console.log("Buscando canais de grupo:", `${internalChatUrl}channels?page=${page}`);
          const response = await api.get(
            `${internalChatUrl}channels?page=${page}`
          );
          
          console.log("Canais de grupo recebidos:", response.data);
          // Se for a primeira página, substitui os canais
          // Caso contrário, adiciona aos canais existentes
          if (page === 1) {
            this.channels = response.data.results;
          } else {
            this.channels = [...this.channels, ...response.data.results];
          }
          
          this.count = response.data.count;
          this.nextPage = response.data.next;
          this.previousPage = response.data.previous;
          this.currentPage = page;
          
          // Marca como loaded após carregar a primeira página
          if (page === 1) {
            this.loaded = true;
          }
        } catch (error) {
            console.error("Erro ao buscar canais de grupo:", error);
        } finally {
          this.loading = false;
        }
      }
    },
    async loadMoreChannels() {
      // Só carrega mais se houver próxima página e não estiver carregando
      if (this.nextPage && !this.loading) {
        const nextPageNumber = this.currentPage + 1;
        await this.fetchChannel("group", nextPageNumber);
      }
    },
    async createChannel(body) {
      try {
        const response = await api.post(`${internalChatUrl}create_group/`, body);
        // Adiciona nos canais
        this.channels.unshift(response.data)
        return response;
      } catch (error) {
        // Re-throw so callers can handle the error
        throw error;
      }
    },
}});
