import { defineStore } from 'pinia';
import api from '~/utils/api';
import { departmentUrl } from '~/utils/systemUrls';
export const useDepartmentStore = defineStore('department', {
    state: () => ({
        departments: [],
        count: null,
        currentPage: 1,
        hasNext: null,
    }),
    actions: {
        async fetchDepartments() {
            try {
                const response = await api.get(`${departmentUrl}?page=${this.currentPage}`);
                this.departments = [...this.departments, response.data.results]
                this.count = response.data.count
                this.hasNext = response.data.next
                console.log(response.data)
            } catch (error) {
                console.log(error)
            }
        }
    }
});
