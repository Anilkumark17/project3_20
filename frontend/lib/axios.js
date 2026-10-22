import axios from "axios";
import { getToken } from "@clerk/nextjs";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the Clerk session JWT; the API verifies it on every request.
axiosInstance.interceptors.request.use(async (config) => {
  if (typeof window !== "undefined") {
    const token = await getToken().catch(() => null);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.response?.data?.message || error.message || "An error occurred";
    const wrapped = new Error(message);
    wrapped.status = error.response?.status;
    return Promise.reject(wrapped);
  }
);

export default axiosInstance;
