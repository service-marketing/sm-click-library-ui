import { defineStore } from "pinia";
import api from "~/utils/api";
import { departmentUrl } from "~/utils/systemUrls";

export const useDepartmentStore = defineStore("department", {
  state: () => ({
    departments: [],
    count: null,
    loaded: false,
  }),
  actions: {
    async fetchDepartments(query = "") {
      try {
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
      const departmentIndex = this.departments.findIndex(
        (dep) => dep.id === department.id
      );

      if (departmentIndex !== -1) {
        this.departments[departmentIndex] = department;
      } else {
        this.departments.push(department);
      }
    },
  },
});
