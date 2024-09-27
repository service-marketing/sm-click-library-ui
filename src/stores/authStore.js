import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        jwtToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzI3NTQ5NjgzLCJpYXQiOjE3MjcxMDMxMTQsImp0aSI6IjI2NmM5YjY5Njk0OTRlY2I4ZWFhN2U3OGYwMGRmNDY5IiwidXNlcl9pZCI6ImRlYTVjMTNmLTQ0NjQtNGNjNi04NjUzLThjODUyNGFjZGQzYiJ9.R90DumgTxjaQo1jCUc7UdeaZ3Z_oyROVhMeY7oJCQOo', // Inicialmente vazio
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
