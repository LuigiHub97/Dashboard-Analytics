import axios, { isAxiosError } from "axios";

export function getErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    if (!err.response) {
      return "Não foi possível conectar à API. Verifique sua conexão ou tente novamente em instantes.";
    }
    const data = err.response.data as { error?: string } | undefined;
    if (data?.error) return data.error;
  }
  return fallback;
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:4000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
