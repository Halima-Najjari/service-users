import axios from "axios";
import { API_ENDPOINTS } from "./endpoints";
import { isAccessTokenExpired } from "../utils/jwt";

const STORAGE_KEYS = {
  accessToken: "talentscope.accessToken",
  refreshToken: "talentscope.refreshToken",
  email: "talentscope.email",
  role: "talentscope.role",
};

export const apiClient = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "https://service-users-production.up.railway.app",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use(async (config) => {
  if (config.url?.includes("/api/auth/")) return config;

  let token = localStorage.getItem(STORAGE_KEYS.accessToken);

  if (token && isAccessTokenExpired(token)) {
    try {
      const auth = await refreshAccessToken();
      localStorage.setItem(STORAGE_KEYS.accessToken, auth.token);
      localStorage.setItem(
        STORAGE_KEYS.refreshToken,
        auth.refreshToken ||
          localStorage.getItem(STORAGE_KEYS.refreshToken) ||
          "",
      );
      localStorage.setItem(STORAGE_KEYS.email, auth.email);
      localStorage.setItem(STORAGE_KEYS.role, auth.role);
      token = auth.token;
    } catch {
      clearSession();
      return Promise.reject(new Error("Session expirée"));
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise = null;

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem(STORAGE_KEYS.refreshToken);
  if (!refreshToken) {
    clearSession();
    throw new Error("Refresh token absent");
  }

  if (!refreshPromise) {
    refreshPromise = axios
      .post(
        `${import.meta.env.VITE_API_BASE_URL || "https://service-users-production.up.railway.app"}${
          API_ENDPOINTS.auth.refresh
        }`,
        { refreshToken },
      )
      .then((response) => response.data)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

function clearSession() {
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  window.dispatchEvent(new CustomEvent("talentscope:session-expired"));
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url || "";

    if (
      error.response?.status !== 401 ||
      originalRequest?._retry ||
      url.includes("/api/auth/login") ||
      url.includes("/api/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const auth = await refreshAccessToken();
      localStorage.setItem(STORAGE_KEYS.accessToken, auth.token);
      localStorage.setItem(STORAGE_KEYS.refreshToken, auth.refreshToken);
      localStorage.setItem(STORAGE_KEYS.email, auth.email);
      localStorage.setItem(STORAGE_KEYS.role, auth.role);

      originalRequest.headers.Authorization = `Bearer ${auth.token}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      clearSession();
      return Promise.reject(refreshError);
    }
  },
);

export { STORAGE_KEYS, clearSession };
export default apiClient;
