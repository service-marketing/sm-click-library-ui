import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    jwtToken:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzMyMzc5MzgxLCJpYXQiOjE3MzIyOTI5ODEsImp0aSI6IjA5YWI0Mzg1ZTEwOTQwZTI4MGY1YjMyYzQ1OGQ2ZWU1IiwidXNlcl9pZCI6IjlhNDM5OTYwLWU4ODQtNDY4Ni05NzYwLTE1M2JkNDU1N2I3NCJ9.NBy0q0t3Gej_SOBKP58lXlj-41obxOeHJ9XkkCstM08", // Inicialmente vazio
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
