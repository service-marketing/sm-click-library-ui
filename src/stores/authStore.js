import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        jwtToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzI4MDQwOTc4LCJpYXQiOjE3Mjc5NTQ1NzgsImp0aSI6IjYzM2E2ZWFjNjRjNDQwOGVhZTFhMGRkZDZlYmY2NDFkIiwidXNlcl9pZCI6ImRlYTVjMTNmLTQ0NjQtNGNjNi04NjUzLThjODUyNGFjZGQzYiJ9.HS5WBjcRiSpps5umfwphAzVjhOeFW6lEiDfwPYYlNYM', // Inicialmente vazio
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
