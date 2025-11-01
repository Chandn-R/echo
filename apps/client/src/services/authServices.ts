import api from "@/services/api";
import toast from "react-hot-toast";

export const authService = {
  async registerUser(data: {
    name: string;
    username: string;
    email: string;
    password: string;
  }) {
    try {
      const response = await api.post("/auth/signup", data);
      toast.success("Registration successful! Please log in.");
      return { success: true, user: response.data.data };
    } catch (error: any) {
      const message = error.response?.data?.message || "Registration failed";
      toast.error(message);
      return { success: false, error: message };
    }
  },
};