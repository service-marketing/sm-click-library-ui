import { defineStore } from 'pinia';
import api from '~/utils/api';
import { departmentUrl } from '~/utils/systemUrls';

export const useDepartmentStore = defineStore('department', {
  state: () => ({
    departments: [],
    count: null,
  }),
  actions: {
    // Store departmentStore.js
    async fetchDepartments(query = '') {
      try {
        this.departments = []; // Resetar a lista de departamentos
        let nextPageUrl = `${departmentUrl}`;
        
        // Loop para buscar todas as páginas, caso a API ainda retorne paginado
        while (nextPageUrl) {
          const response = await api.get(nextPageUrl);
          const { results, next } = response.data;
          this.departments.push(...results);
          nextPageUrl = next;
        }

        this.count = this.departments.length;
        console.log(this.departments)
      } catch (error) {
        console.log("Erro ao buscar departamentos:", error);
      }
    },
  },
});
