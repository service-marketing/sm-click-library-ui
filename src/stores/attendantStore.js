import { defineStore } from 'pinia';
import api from '~/utils/api';
import { attendantUrl } from '~/utils/systemUrls';
export const useAttendantStore = defineStore('attendant', {
    state: () => ({
        attendants: [],
        count: null,
        currentPage: 1,
        hasNext: null,
    }),
    actions: {
        async fetchAttendants() {
            try {
                const response = await api.get(`${attendantUrl}?page=${this.currentPage}`);
                this.attendants = [...this.attendants, response.data.results]
                this.count = response.data.count
                this.hasNext = response.data.next
                console.log(response.data)
            } catch (error) {
                console.log(error)
            }
        }
    }
});
