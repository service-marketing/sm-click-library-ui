import axios from "axios";
import { useAuthStore } from "~/stores/authStore"; // Ajuste o caminho conforme necessário

// Crie uma instância personalizada do Axios
const api = axios.create({
  baseURL: "https://back.dev-smclick.com.br/", // O `rootUrl` será definido dinamicamente via setupLibrary
});

// Armazena a referência da store para evitar instâncias múltiplas
let authStore = null;

const getAuthStore = () => {
  if (!authStore) {
    authStore = useAuthStore();
  }
  return authStore;
};

// Adiciona um interceptor para incluir automaticamente o token JWT
api.interceptors.request.use(
  (config) => {
    try {
      const store = getAuthStore();
      const token = store.jwtToken;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`; // Adiciona o token JWT no cabeçalho
      } else {
        console.warn("JWT token não configurado em api request");
      }
    } catch (error) {
      console.warn("Erro ao acessar authStore no interceptor:", error);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
