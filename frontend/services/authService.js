import axiosInstance from "@/lib/axios";

export const authService = {
  syncUser: async (userData) => {
    const { data } = await axiosInstance.post("/auth/sync", userData);
    return data;
  },

  getUser: async (clerkId) => {
    const { data } = await axiosInstance.get(`/auth/user/${clerkId}`);
    return data;
  },

  getProfile: async (clerkId) => {
    const { data } = await axiosInstance.get(`/auth/profile/${clerkId}`);
    return data;
  },

  updateProfile: async (clerkId, profileData) => {
    const { data } = await axiosInstance.put(`/auth/profile/${clerkId}`, profileData);
    return data;
  },
};
