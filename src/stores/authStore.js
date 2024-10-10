import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        jwtToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzI4NjUwNzIxLCJpYXQiOjE3Mjg0NzI3MTcsImp0aSI6IjY0NTU0YmYzMWVhOTQ2YzdiMzcwMDAzNDA2MjYwYjExIiwidXNlcl9pZCI6ImRlYTVjMTNmLTQ0NjQtNGNjNi04NjUzLThjODUyNGFjZGQzYiJ9.atjYRvLIsUv9NRBSd5tNpUMDtbRWxFgLsImycpw-taA' // Inicialmente vazio
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
