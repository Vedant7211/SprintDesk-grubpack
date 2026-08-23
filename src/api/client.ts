import axios, { type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "../stores/auth.store";
import { refreshAccessToken } from "./auth";


type RetryableRequestConfig = InternalAxiosRequestConfig & {
    _retry?: boolean;
}

export const api = axios.create({
  baseURL: "https://dummyjson.com",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    if (error?.response?.status !== 401) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as RetryableRequestConfig;

    if (originalRequest._retry) {
      useAuthStore.getState().logout();

      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const refreshToken = useAuthStore.getState().refreshToken;

    if (!refreshToken) {
      useAuthStore.getState().logout();

      return Promise.reject(error);
    }

    try {
      const response = await refreshAccessToken(refreshToken);

      useAuthStore.getState().setAuth(response);

      originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      useAuthStore.getState().logout();

      return Promise.reject(refreshError);
    }
  },
);