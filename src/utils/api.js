import axios from "axios";
import { useAuthStore } from "~/stores/authStore"; // Ajuste o caminho conforme necessário

// Crie uma instância personalizada do Axios
const api = axios.create({
  baseURL: "https://back.dev-smclick.com.br/", // O `rootUrl` será definido dinamicamente via setupLibrary
});

// Adiciona um interceptor para incluir automaticamente o token JWT
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    const token = authStore.jwtToken;
    console.log("Using token in API request:", token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Adiciona o token JWT no cabeçalho
      console.log(
        "Authorization header set in request:",
        config.headers.Authorization
      );
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
