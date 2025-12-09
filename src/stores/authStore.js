import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    jwtToken: null, // Token de acesso
    refreshToken: null, // Token de refresh
  }),
  actions: {
    setToken(token, refreshToken = null) {
      this.jwtToken = token;
      if (refreshToken) {
        this.refreshToken = refreshToken;
      }

      // Sincroniza com localStorage se disponível (pra aplicações que usam)
      this._syncToLocalStorage();
    },
    setRefreshToken(token) {
      this.refreshToken = token;
      this._syncToLocalStorage();
    },
    clearToken() {
      this.jwtToken = null;
      this.refreshToken = null;
      localStorage.clear();
    },
    _syncToLocalStorage() {
      if (typeof window !== "undefined" && window.localStorage) {
        try {
          // Só sincroniza se há tokens para sincronizar
          if (!this.jwtToken && !this.refreshToken) {
            return;
          }

          // Tenta sincronizar com o formato userData (attendance)
          const userData = localStorage.getItem("userData");
          if (userData) {
            const data = JSON.parse(userData);
            if (this.jwtToken) {
              data.access_token = this.jwtToken;
            }
            if (this.refreshToken) {
              data.refresh_token = this.refreshToken;
            }
            localStorage.setItem("userData", JSON.stringify(data));
            return;
          }

          // Tenta sincronizar com o formato access_token direto (zap-front)
          const accessToken = localStorage.getItem("access_token");
          if (accessToken !== null) {
            if (this.jwtToken) {
              localStorage.setItem("access_token", this.jwtToken);
            }
            if (this.refreshToken) {
              localStorage.setItem("refresh_token", this.refreshToken);
            }
          }
        } catch (error) {
          // Silencia erros de localStorage para não quebrar a aplicação
          console.warn("Erro ao sincronizar token com localStorage:", error);
        }
      }
    },
  },
  getters: {
    getToken: (state) => state.jwtToken,
    getRefreshToken: (state) => state.refreshToken,
  },
});
