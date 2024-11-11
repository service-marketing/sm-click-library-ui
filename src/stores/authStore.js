import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        jwtToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzMxMzcwNTU3LCJpYXQiOjE3MzEyODQxNTcsImp0aSI6IjYxNzQxM2VhZjU1ZDQyMjU4Njk3ZjIyN2VkNjIwNWM2IiwidXNlcl9pZCI6IjgzZDUxYzQ0LTY0OWEtNGUzYi1hYTUyLWRiMGQ4NjRiMTcxMSJ9.Na0dGJNNnqyZxLuMcGev7S07ULHCq-CNevApfzwXYmw' // Inicialmente vazio
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
