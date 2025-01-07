import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    jwtToken:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzM2MzM5NzIwLCJpYXQiOjE3MzYxNjY4NzksImp0aSI6IjIxNGVlYTlmNjk1YzQ4Y2I4YzAwY2U4Njk1ZTZiYzk0IiwidXNlcl9pZCI6IjYyZTBmZWRmLWFiMGItNDIyYi1iOTFmLWNlZjAyYjQ1YzdlMSJ9.kvBwDWq5MmJBMf93sa5fLmyKY0hTMxMDVKcdpEGGQho", // Inicialmente vazio
  }),
  actions: {
    setToken(token) {
      this.jwtToken = token;
    },
    clearToken() {
      this.jwtToken = null;
    },
  },
  getters: {
    getToken: (state) => state.jwtToken,
  },
});
