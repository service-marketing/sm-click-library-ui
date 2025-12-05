import axios from "axios";
import { useAuthStore } from "~/stores/authStore";

// Crie uma instância personalizada do Axios
const api = axios.create({
  baseURL: "https://back.dev-smclick.com.br/", // O `rootUrl` será definido dinamicamente via setupLibrary
});

// Instância sem interceptores para fazer refresh do token (evita loops)
const axiosPlain = axios.create();
axiosPlain.defaults.baseURL = api.defaults.baseURL;

// Armazena a referência da store para evitar instâncias múltiplas
let authStore = null;

const getAuthStore = () => {
  if (!authStore) {
    authStore = useAuthStore();
  }
  return authStore;
};

// Interceptor de REQUEST - adiciona o token JWT
api.interceptors.request.use(
  (config) => {
    try {
      const store = getAuthStore();
      const token = store.jwtToken;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
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
  },
);

// Interceptor de RESPONSE - trata 401 e faz refresh do token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Trata erros 5xx
    if (error.response && error.response.status.toString()[0] === "5") {
      console.error("Erro inesperado no servidor:", error);
      return Promise.reject(error);
    }

    // Trata 401 - Token expirado
    if (error.response && error.response.status === 401) {
      const store = getAuthStore();
      const refreshToken = store.refreshToken;

      if (refreshToken) {
        try {
          // Faz refresh do token usando instância sem interceptores
          const refreshUrl = `${axiosPlain.defaults.baseURL}v1/api/attendances/token/refresh/`;
          const response = await axiosPlain.post(refreshUrl, {
            refresh: refreshToken,
          });

          const newAccessToken = response.data.access;

          // Atualiza o token na store
          store.setToken(newAccessToken);

          // Retry da requisição original com o novo token
          error.config.headers.Authorization = `Bearer ${newAccessToken}`;
          return axios.request(error.config);
        } catch (refreshError) {
          console.error("Erro ao fazer refresh do token:", refreshError);
          // Limpa a store e redireciona para login
          store.clearToken();
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      } else {
        // Não tem refresh token, limpa e redireciona
        store.clearToken();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

// Função para sincronizar a baseURL quando setupLibrary é chamado
export function setApiBaseURL(baseURL) {
  if (baseURL) {
    api.defaults.baseURL = baseURL;
    axiosPlain.defaults.baseURL = baseURL;
  }
}

export default api;
