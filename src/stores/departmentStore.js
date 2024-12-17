import { defineStore } from "pinia";
import api from "~/utils/api";
import { departmentUrl } from "~/utils/systemUrls";

export const useDepartmentStore = defineStore("department", {
  state: () => ({
    departments: [],
    count: null,
  }),
  actions: {
    async fetchDepartments(query = "") {
      try {
        this.departments = []; // Resetar a lista de departamentos
        let nextPageUrl = `${departmentUrl}`;
        const response = await api.get(nextPageUrl);
        this.departments = response.data;
        this.count = this.departments.length;
      } catch (error) {
        console.log("Erro ao buscar departamentos:", error);
      }
    },
    removeDepartments(departmentId) {
      this.departments = this.departments.filter(
        (dep) => dep.id !== departmentId
      );
    },
    addDepartments(department) {
      if (Array.isArray(department)) {
        // Para múltiplos departamentos, verifica e adiciona apenas os únicos pelo id
        department.forEach((dep) => {
          if (
            !this.departments.some((existingDep) => existingDep.id === dep.id)
          ) {
            this.departments.push({ ...dep });
          }
        });
      } else {
        // Para um único departamento, verifica e adiciona apenas se o id for único
        if (
          !this.departments.some(
            (existingDep) => existingDep.id === department.id
          )
        ) {
          this.departments.push({ ...department });
        }
      }
    },
  },
});
