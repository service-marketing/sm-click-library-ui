import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    jwtToken: null, // Inicialmente vazio
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
