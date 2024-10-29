import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        jwtToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzMwMjk0NDE5LCJpYXQiOjE3MzAyMDgwMTksImp0aSI6IjNiMWRkOTA4N2RlNzQwNTY4MTg5NDljYmI5MDgwZmUzIiwidXNlcl9pZCI6IjU1ZTBhMDY0LTE2Y2UtNGM4Ny1hOWFjLTFmNDZmNGY1ZDI1ZCJ9.f54-6o6Q7G9KWfdnjoRck3sevfaS-E1t8r0cIAiNiZI' // Inicialmente vazio
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
