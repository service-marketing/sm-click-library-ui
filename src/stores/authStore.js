import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        jwtToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzI4NTU5MTE3LCJpYXQiOjE3Mjg0NzI3MTcsImp0aSI6IjhiODUwYTZiMDA5NjQ2MmZhYWQ2M2JhYzAzYjMyZjQ0IiwidXNlcl9pZCI6ImRlYTVjMTNmLTQ0NjQtNGNjNi04NjUzLThjODUyNGFjZGQzYiJ9.iu1aY6vvNdlx9_PmEWIOVDjx4ZJkmJDjvAmfiV7_Y8A', // Inicialmente vazio
    }),
    actions: {
        setToken(token) {
            this.jwtToken = token;
        },
        clearToken() {
            this.jwtToken = null;
        }
    },
    getters: {
        getToken: (state) => state.jwtToken,
    }
});
