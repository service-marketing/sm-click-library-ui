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
let refreshTokenUrl = null;
let piniaInstance = null;

// Queue para requests que falharam com 401 enquanto refresh está em andamento
let isRefreshing = false;
let failedQueue = [];

function processQueue(error) {
  failedQueue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve();
  });
  failedQueue = [];
}

const getAuthStore = () => {
  if (!authStore) {
    authStore = useAuthStore(piniaInstance);
  }
  return authStore;
};

// Define a instância do Pinia para uso nos interceptadores
export function setPiniaInstance(pinia) {
  piniaInstance = pinia;
}

// Define a URL de refresh do token dinamicamente
export function setRefreshTokenUrl(url) {
  refreshTokenUrl = url;
}

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
    // Se não há response, passa o erro adiante
    if (!error.response) {
      return Promise.reject(error);
    }

    const status = error.response.status;

    // Trata erros 5xx
    if (status.toString()[0] === "5") {
      console.error("Erro inesperado no servidor:", error);
      return Promise.reject(error);
    }

    // Trata 401 - Token expirado
    if (status === 401 && !error.config._retry) {
      const store = getAuthStore();
      const refreshToken = store.refreshToken;

      if (!refreshToken) {
        store.clearToken();
        if (typeof window !== "undefined" && window.location) {
          setTimeout(() => { window.location.href = "/login"; }, 500);
        }
        return Promise.reject(error);
      }

      // Outro request já está fazendo refresh — entra na fila e aguarda
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api.request(error.config))
          .catch((err) => Promise.reject(err));
      }

      error.config._retry = true;
      isRefreshing = true;

      try {
        const refreshUrl =
          refreshTokenUrl ||
          `${axiosPlain.defaults.baseURL}v1/api/attendances/token/refresh/`;
        const response = await axiosPlain.post(refreshUrl, { refresh: refreshToken });
        const newAccessToken = response.data.access;

        store.setToken(newAccessToken, refreshToken);
        processQueue(null);
        return api.request(error.config);
      } catch (refreshError) {
        console.error("Erro ao fazer refresh do token:", refreshError);
        processQueue(refreshError);
        store.clearToken();
        if (typeof window !== "undefined" && window.location) {
          setTimeout(() => { window.location.href = "/login"; }, 500);
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
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
