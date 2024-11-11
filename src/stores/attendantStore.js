import { defineStore } from 'pinia';
import api from '~/utils/api';
import { attendantUrl } from '~/utils/systemUrls';

export const useAttendantStore = defineStore('attendant', {
  state: () => ({
    attendants: [],
    count: null,
  }),
  actions: {
    async fetchAttendants() {
      try {
        this.attendants = []; // Resetar a lista de atendentes
        let nextPageUrl = `${attendantUrl}`;
        
        // Loop para buscar todas as páginas, caso a API ainda retorne paginado
        while (nextPageUrl) {
          const response = await api.get(nextPageUrl);
          const { results, next } = response.data;
          this.attendants.push(...results);
          nextPageUrl = next;
        }

        this.count = this.attendants.length;
      } catch (error) {
        console.log("Erro ao buscar atendentes:", error);
      }
    },
  },
});
