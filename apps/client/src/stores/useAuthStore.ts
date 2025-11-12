import { create } from "zustand";
import toast from "react-hot-toast";
import api, { setApiAccessToken } from "../services/api";

interface User {
  userId: string;
  name: string;
  userName: string;
  email: string;
  profilePicture?: { secure_url: string };
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (data: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  accessToken: null,

  setUser: (user) => set({ user }),

  login: async ({ email, password }) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const newAccessToken = response.data.data.accessToken;

      set({ accessToken: newAccessToken, user: response.data.data });
      console.log(response.data.data)
      setApiAccessToken(newAccessToken);
      toast.success("Login successful!");

    } catch (error: any) {
      const message = error.response?.data?.message || "Login failed";
      toast.error(message);
      throw new Error(message);
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      console.warn("Logout failed, clearing session anyway.");
    } finally {
      setApiAccessToken(null);
      set({ user: null, accessToken: null });
    }
  },

  checkAuthStatus: async () => {
    set({ isLoading: true });
    try {
      const response = await api.post("/auth/refresh");
      const newAccessToken = response.data.data.newAccessToken;

      if (!newAccessToken || typeof newAccessToken !== 'string') {
        throw new Error("Invalid token received from server");
      }

      setApiAccessToken(newAccessToken);
      set({
        accessToken: newAccessToken,
        user: response.data.data.user,
        isLoading: false
      });
    } catch {
      setApiAccessToken(null);
      set({ user: null, accessToken: null, isLoading: false });
    }
  },
}));
