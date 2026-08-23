import { create } from "zustand";
import type { LoginResponse } from "../api/auth";
import { refreshAccessToken } from "../api/auth";

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: LoginResponse | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  initializeAuth: () => Promise<void>;
  setAuth: (data: LoginResponse) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  isInitializing: true,
  user: null,
  isAuthenticated: false,

  initializeAuth: async () => {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      set({ isInitializing: false });
      return;
    }

    try {
      const data = await refreshAccessToken(refreshToken);
      set({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data,
        isAuthenticated: true,
        isInitializing: false,
      });
      localStorage.setItem("refreshToken", data.refreshToken);
    } catch (err) {
      localStorage.removeItem("refreshToken");
      set({
        accessToken: null,
        refreshToken: null,
        user: null,
        isAuthenticated: false,
        isInitializing: false,
      });
    }
  },

  setAuth: (data: LoginResponse) => {
    localStorage.setItem("refreshToken", data.refreshToken);
    set({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: data,
      isAuthenticated: true,
    });
  },
  logout: () => {
    localStorage.removeItem("refreshToken");

    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isInitializing: false,
    });
  },
}));
