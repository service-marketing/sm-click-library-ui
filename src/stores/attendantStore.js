import { defineStore } from "pinia";
import api from "~/utils/api";
import { attendantUrl } from "~/utils/systemUrls";

export const useAttendantStore = defineStore("attendant", {
  state: () => ({
    attendants: [],
    count: null,
    loaded: false,
  }),
  getters: {
    logged_attendant: (state) => () => state.attendants.find((att) => att.is_me),
  },
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
    removeAttendants(attendantId) {
      this.attendants = this.attendants.filter((att) => att.id !== attendantId);
    },
    addAttendants(attendant) {
      const attendantIndex = this.attendants.findIndex(
        (att) => att.id === attendant.id,
      );

      if (attendantIndex !== -1) {
        this.attendants[attendantIndex] = attendant;
      } else {
        this.attendants.push(attendant);
      }
    },
  },
});
