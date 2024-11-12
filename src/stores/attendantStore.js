import { defineStore } from "pinia";
import api from "~/utils/api";
import { attendantUrl } from "~/utils/systemUrls";

export const useAttendantStore = defineStore("attendant", {
  state: () => ({
    attendants: [],
    count: null,
  }),
  actions: {
    async fetchAttendants() {
      try {
        this.attendants = []; // Resetar a lista de atendentes
        let nextPageUrl = `${attendantUrl}`;
        const response = await api.get(nextPageUrl);
        this.attendants = response.data;

        this.count = this.attendants.length;
      } catch (error) {
        console.log("Erro ao buscar atendentes:", error);
      }
    },
  },
});
