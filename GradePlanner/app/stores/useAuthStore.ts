import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthStore {
  token: string | null;
  baseUrl: string | null;
  userName: string | null;
  userId: string | null;

  setAuth: (token: string, baseUrl: string, userName?: string, userId?: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
  getAuthHeaders: () => HeadersInit;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      token: null,
      baseUrl: null,
      userName: null,
      userId: null,

      setAuth: (token, baseUrl, userName, userId) => {
        set({ token, baseUrl, userName, userId });
      },

      clearAuth: () => {
        set({ token: null, baseUrl: null, userName: null, userId: null });
      },

      isAuthenticated: () => {
        const { token, baseUrl } = get();
        return !!token && !!baseUrl;
      },

      getAuthHeaders: () => {
        const { token, baseUrl } = get();
        if (!token || !baseUrl) {
          throw new Error("Not authenticated");
        }
        return {
          "x-canvas-token": token,
          "x-canvas-base-url": baseUrl,
        };
      },
    }),
    {
      name: "canvas-auth-storage", // localStorage key
    }
  )
);
