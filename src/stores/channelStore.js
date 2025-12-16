import { defineStore } from "pinia";
import api from "~/utils/api";
import { internalChatUrl } from "~/utils/systemUrls";

export const useChannelStore = defineStore("channel", {
  state: () => ({
    channels: [],
    count: null,
    loaded: false,
  }),
  actions: {
    async fetchChannel(type) {
      if (type === "group") {
        try {
          if (this.loaded) return;
          const response = await api.get(
            `${internalChatUrl}get_attendant_groups`
          );
          this.channels = response.data.channels;
          this.loaded = true;
        } catch (error) {
            console.error("Erro ao buscar canais de grupo:", error);
        }
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
