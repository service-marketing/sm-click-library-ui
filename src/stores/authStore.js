import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        jwtToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzMxNTE2MDI4LCJpYXQiOjE3MzE0Mjk2MjgsImp0aSI6IjcxNDlkZmFjYWQwYzQzMjNhZDg4M2E2YTZlNjdjNjI4IiwidXNlcl9pZCI6IjYyZTBmZWRmLWFiMGItNDIyYi1iOTFmLWNlZjAyYjQ1YzdlMSJ9.6eJpGGKJhGn6QRJh8UuBtNqGOa48K-oopm7ysWsLzLg' // Inicialmente vazio
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
