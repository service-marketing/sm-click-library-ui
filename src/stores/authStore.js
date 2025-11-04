import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    jwtToken:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzQwMDY5MzIyLCJpYXQiOjE3Mzk5ODI5MjIsImp0aSI6IjcyZjcxYjgzY2I5YTQ1MWFhMmYyODQ0OTlmZGFkZWIxIiwidXNlcl9pZCI6ImU4YTAwNWZhLTk0YjUtNDRiOC05ZDkwLWZjNzJmYzI0NjRhOSJ9.IOzqjqDpRRfqsvqhzEsGDLhQOKWapjzFycNG3Qv8k0U", // Inicialmente vazio
  }),
  actions: {
    setToken(token) {
      // console.log("Setting token:", token);
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
